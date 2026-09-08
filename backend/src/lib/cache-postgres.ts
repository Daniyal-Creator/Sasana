// The answer cache, backed by Supabase Postgres. Production runs this; local
// development and the test suite run the SQLite store in `cache.ts` (ADR-0018).
//
// Everything that made the cache correct is unchanged - the same key, the same
// `kb_hash` invalidation, the same eviction, the same counters, and the same
// privacy property that only a normalised key is ever written. What changes is
// that a read is now a network round trip instead of a file read, and that
// shapes three decisions below.
//
// ROUND TRIPS ARE THE COST HERE. The SQLite store reads, updates and bumps a
// counter as three separate statements because against a local file that is
// free. Against Supabase each one would be its own ~50ms round trip, so `get`
// is written as a single statement that does all three. It is more SQL to read
// in exchange for a third of the latency, which is the right trade at this
// distance.
//
// EVERY TABLE NAME IS SCHEMA-QUALIFIED, and that is not style. The cache lives
// in the `cache` schema rather than `public` so PostgREST cannot serve it to
// anyone holding the anon key (see the migration for what that would allow).
// Reaching it by setting `search_path` on the connection instead would be
// fragile in exactly this deployment: the transaction pooler hands out a
// different backend per transaction and does not carry session state across
// them, so a search_path set at connect time cannot be relied on later.
//
// A CACHE MUST NEVER BREAK AN ANSWER. If Supabase is unreachable - paused on
// the free tier, a network blip, credentials rotated - `get` and `set` log and
// give up rather than throw. The visitor waits for Gemini instead of seeing an
// error, which is exactly what happened before any cache existed. Only `stats`
// lets the failure through, because an endpoint whose whole job is to report
// the truth about the cache must not report zeros when it cannot reach it.

import postgres from "postgres";
import type { ChatResponse } from "@shared/contract";
import { type AnswerStore, type CacheStats, MAX_ENTRIES, hitRate } from "@/lib/cache";
import { logError } from "@/lib/logger";

/** Postgres returns bigint as a string, so every count comes back through this. */
const toInt = (value: string | number | null): number => Number(value ?? 0);

/**
 * A ChatResponse as the driver's json helper wants to see it.
 *
 * The value is plain JSON and always has been. The cast is a type-level
 * formality: `JSONValue` is satisfied by an index signature, which an interface
 * cannot provide structurally, and `ChatResponse` lives in `shared/contract.ts`
 * - another area's file (AGENTS.md rule 4), so the adaptation belongs on this
 * side of the boundary rather than in the shared type.
 */
const asJson = (response: ChatResponse): postgres.JSONValue =>
  response as unknown as postgres.JSONValue;

/**
 * A stored answer, whichever shape the row is in.
 *
 * `response` is a jsonb column and the driver parses it, so a correctly written
 * row arrives as an object and needs nothing done to it. Rows written before
 * the double-encoding fix arrive as a string instead: `set` used to hand the
 * driver an already-serialised answer, and a driver that serialises what it is
 * given turned that into a jsonb string rather than a jsonb object.
 *
 * Those rows carry the same `kb_hash` as the correct ones, so no invalidation
 * reaches them - they would keep serving an answer the frontend reads as
 * `undefined` until something evicted them. Parsing the old shape here costs a
 * type check on a path that is already a network round trip, and it means the
 * fix needs no manual TRUNCATE against Supabase to take effect.
 *
 * Anything that is neither shape is treated as no answer at all. A cache must
 * never break an answer: the caller spends Gemini quota, which is what it did
 * before any cache existed.
 */
const decodeResponse = (stored: unknown): ChatResponse | undefined => {
  if (typeof stored === "object" && stored !== null) return stored as ChatResponse;
  if (typeof stored !== "string") return undefined;

  try {
    const parsed: unknown = JSON.parse(stored);
    return typeof parsed === "object" && parsed !== null ? (parsed as ChatResponse) : undefined;
  } catch {
    return undefined;
  }
};

export class PostgresAnswerCache implements AnswerStore {
  private readonly sql: postgres.Sql;

  constructor(
    connectionString: string,
    private readonly enabled = true,
  ) {
    this.sql = postgres(connectionString, {
      // Supabase's transaction pooler (port 6543) is what serverless is meant
      // to use, and it cannot carry prepared statements across a pooled
      // connection. Leaving this on produces errors that appear only in
      // production, because a direct connection locally would work fine.
      prepare: false,
      // One socket per instance. Vercel scales by running more instances, so a
      // pool inside each one competes for the same pooler slots without
      // serving any more traffic.
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }

  /**
   * The stored answer for this question, or undefined.
   *
   * One statement, four jobs: serve the row if the knowledge base still
   * matches, delete it if it does not, count the hit or the miss, and return
   * the answer. The counter has to be inside the same statement or a hit could
   * be served without being counted, which would quietly understate the very
   * saving `/api/stats` exists to report.
   */
  async get(key: string, kbHash: string): Promise<ChatResponse | undefined> {
    if (!this.enabled) {
      await this.bump("misses");
      return undefined;
    }

    try {
      const rows = await this.sql<{ response: ChatResponse | string }[]>`
        WITH hit AS (
          UPDATE cache.answers
             SET hits = hits + 1, last_hit_at = now()
           WHERE key = ${key} AND kb_hash = ${kbHash}
          RETURNING response
        ),
        -- A row written against a different knowledge base is not evidence of
        -- anything any more. Deleting it rather than ignoring it keeps the
        -- table from filling with answers no version will ever serve.
        stale AS (
          DELETE FROM cache.answers
           WHERE key = ${key} AND kb_hash <> ${kbHash}
        ),
        counted AS (
          INSERT INTO cache.counters (name, value)
          VALUES (
            CASE WHEN EXISTS (SELECT 1 FROM hit) THEN 'hits' ELSE 'misses' END,
            1
          )
          ON CONFLICT (name) DO UPDATE SET value = counters.value + 1
        )
        SELECT response FROM hit
      `;

      return decodeResponse(rows[0]?.response);
    } catch (err) {
      logError({ route: "cache", event: "read_failed", error: String(err) });
      return undefined;
    }
  }

  async set(key: string, response: ChatResponse, tokens: number, kbHash: string): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.sql`
        INSERT INTO cache.answers (key, kb_hash, response, tokens)
        -- sql.json, not JSON.stringify. The driver serialises the value it is
        -- handed for a json parameter, so serialising first sends it a string
        -- and the column ends up holding a jsonb string instead of a jsonb
        -- object - jsonb_typeof says "string", and every cache hit reaches the
        -- browser as an escaped blob whose answer field cannot be read.
        VALUES (${key}, ${kbHash}, ${this.sql.json(asJson(response))}::jsonb, ${tokens})
        ON CONFLICT (key) DO UPDATE SET
          kb_hash  = excluded.kb_hash,
          response = excluded.response,
          tokens   = excluded.tokens
      `;
      await this.evict();
    } catch (err) {
      logError({ route: "cache", event: "write_failed", error: String(err) });
    }
  }

  /**
   * Drops the least recently useful entries once the table outgrows its cap.
   *
   * Counted first rather than deleting unconditionally: past the first few
   * thousand answers this runs on every write, and a bare DELETE with a
   * subquery would sort the table each time to discover there is nothing to do.
   */
  private async evict(): Promise<void> {
    const [{ n }] = await this.sql<{ n: string }[]>`SELECT COUNT(*) AS n FROM cache.answers`;
    const over = toInt(n) - MAX_ENTRIES;
    if (over <= 0) return;

    await this.sql`
      DELETE FROM cache.answers WHERE key IN (
        SELECT key FROM cache.answers
         ORDER BY hits ASC, COALESCE(last_hit_at, created_at) ASC
         LIMIT ${over}
      )
    `;
  }

  async stats(kbHash: string): Promise<CacheStats> {
    const [row] = await this.sql<
      { entries: string; tokens_saved: string; hits: string; misses: string }[]
    >`
      SELECT
        (SELECT COUNT(*) FROM cache.answers)                                  AS entries,
        (SELECT COALESCE(SUM(hits * tokens), 0) FROM cache.answers)           AS tokens_saved,
        COALESCE((SELECT value FROM cache.counters WHERE name = 'hits'), 0)   AS hits,
        COALESCE((SELECT value FROM cache.counters WHERE name = 'misses'), 0) AS misses
    `;

    const hits = toInt(row.hits);
    const misses = toInt(row.misses);

    return {
      entries: toInt(row.entries),
      hits,
      misses,
      hitRate: hitRate(hits, misses),
      tokensSaved: toInt(row.tokens_saved),
      kbHash,
      enabled: this.enabled,
    };
  }

  async clear(): Promise<void> {
    await this.sql`TRUNCATE cache.answers, cache.counters`;
  }

  async close(): Promise<void> {
    await this.sql.end();
  }

  private async bump(name: "hits" | "misses"): Promise<void> {
    try {
      await this.sql`
        INSERT INTO cache.counters (name, value) VALUES (${name}, 1)
        ON CONFLICT (name) DO UPDATE SET value = counters.value + 1
      `;
    } catch (err) {
      logError({ route: "cache", event: "counter_failed", error: String(err) });
    }
  }
}
