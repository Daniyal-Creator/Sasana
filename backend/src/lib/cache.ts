// The answer cache: a small SQLite table that lets a question already answered
// be served again without spending a Gemini call.
//
// It replaces an in-memory Map with a one-hour TTL. Two things were wrong with
// that. It died with the process, so a restart threw away every answer the app
// had paid for. And the TTL answered the wrong question: an answer derived from
// `rules.json` does not go stale because an hour passed, it goes stale when the
// rules change. Time-based expiry therefore discarded answers that were still
// correct while keeping any that were not. The knowledge-base hash below is the
// invalidation that actually matches the data.
//
// `node:sqlite` is Node's own module, so this costs no dependency (the
// container runs node:24-alpine). It prints an ExperimentalWarning at startup;
// that is the whole price.
//
// PRIVACY: what is stored is the NORMALISED key - content words, sorted - never
// the sentence a visitor typed. `celana|pakai|pendek` is still readable enough
// to see which topics get asked about, which is the analysis this is for, and
// it is no longer anybody's writing.

import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { ChatResponse } from "@shared/contract";

/** Oldest entries are dropped past this, so the file cannot grow without end. */
const MAX_ENTRIES = 5000;

export interface CacheStats {
  entries: number;
  hits: number;
  misses: number;
  /** Hits as a share of all cacheable questions, 0 to 1. */
  hitRate: number;
  /**
   * Gemini tokens not spent, summed from what each answer actually cost the
   * first time. Measured rather than estimated: `usageMetadata.totalTokenCount`
   * is stored with the entry and added again on every hit.
   */
  tokensSaved: number;
  kbHash: string;
  enabled: boolean;
}

export class AnswerCache {
  private readonly db: DatabaseSync;

  constructor(
    path: string,
    private readonly enabled = true,
  ) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS answers (
        key         TEXT PRIMARY KEY,
        kb_hash     TEXT NOT NULL,
        response    TEXT NOT NULL,
        tokens      INTEGER NOT NULL,
        hits        INTEGER NOT NULL DEFAULT 0,
        created_at  INTEGER NOT NULL,
        last_hit_at INTEGER
      );
      CREATE TABLE IF NOT EXISTS counters (
        name  TEXT PRIMARY KEY,
        value INTEGER NOT NULL
      );
    `);
  }

  /**
   * The stored answer for this question, or undefined.
   *
   * A hit or a miss is counted either way, because the point of the counters is
   * the hit rate, and a hit rate needs its denominator. Disabling the cache
   * therefore still records misses, which is what makes an on/off comparison
   * meaningful.
   */
  get(key: string, kbHash: string): ChatResponse | undefined {
    if (!this.enabled) {
      this.bump("misses");
      return undefined;
    }

    const row = this.db
      .prepare("SELECT response, kb_hash FROM answers WHERE key = ?")
      .get(key) as { response?: string; kb_hash?: string } | undefined;

    // A row written against a different knowledge base is not evidence of
    // anything any more. Deleting it rather than ignoring it keeps the file
    // from filling with answers no version will ever serve.
    if (row && row.kb_hash !== kbHash) {
      this.db.prepare("DELETE FROM answers WHERE key = ?").run(key);
    }
    if (!row || row.kb_hash !== kbHash) {
      this.bump("misses");
      return undefined;
    }

    this.db
      .prepare("UPDATE answers SET hits = hits + 1, last_hit_at = ? WHERE key = ?")
      .run(Date.now(), key);
    this.bump("hits");
    return JSON.parse(row.response as string) as ChatResponse;
  }

  set(key: string, response: ChatResponse, tokens: number, kbHash: string): void {
    if (!this.enabled) return;

    const now = Date.now();
    this.db
      .prepare(
        `INSERT INTO answers (key, kb_hash, response, tokens, created_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET
           kb_hash = excluded.kb_hash,
           response = excluded.response,
           tokens = excluded.tokens`,
      )
      .run(key, kbHash, JSON.stringify(response), tokens, now);

    this.evict();
  }

  /** Drops the least recently useful entries once the table outgrows its cap. */
  private evict(): void {
    const { n } = this.db.prepare("SELECT COUNT(*) AS n FROM answers").get() as { n: number };
    if (n <= MAX_ENTRIES) return;
    this.db
      .prepare(
        `DELETE FROM answers WHERE key IN (
           SELECT key FROM answers
           ORDER BY hits ASC, COALESCE(last_hit_at, created_at) ASC
           LIMIT ?
         )`,
      )
      .run(n - MAX_ENTRIES);
  }

  stats(kbHash: string): CacheStats {
    const { entries, tokensSaved } = this.db
      .prepare("SELECT COUNT(*) AS entries, COALESCE(SUM(hits * tokens), 0) AS tokensSaved FROM answers")
      .get() as { entries: number; tokensSaved: number };
    const hits = this.counter("hits");
    const misses = this.counter("misses");
    const asked = hits + misses;

    return {
      entries,
      hits,
      misses,
      hitRate: asked === 0 ? 0 : Number((hits / asked).toFixed(4)),
      tokensSaved,
      kbHash,
      enabled: this.enabled,
    };
  }

  /** Tests only. Wipes both tables so one case cannot colour the next. */
  clear(): void {
    this.db.exec("DELETE FROM answers; DELETE FROM counters;");
  }

  /**
   * Releases the file handle.
   *
   * The server never calls this - the process owns the database until it exits,
   * and closing on shutdown buys nothing SQLite does not already guarantee. It
   * exists because on Windows an open handle locks the file, so anything that
   * wants to delete or move the database has to close it first.
   */
  close(): void {
    this.db.close();
  }

  private bump(name: string): void {
    this.db
      .prepare(
        `INSERT INTO counters (name, value) VALUES (?, 1)
         ON CONFLICT(name) DO UPDATE SET value = value + 1`,
      )
      .run(name);
  }

  private counter(name: string): number {
    const row = this.db.prepare("SELECT value FROM counters WHERE name = ?").get(name) as
      | { value?: number }
      | undefined;
    return row?.value ?? 0;
  }
}

/**
 * Language and Site are part of the key, not decoration.
 *
 * Language, because the same question must not return an English answer to an
 * Indonesian asker. Site, for a sharper reason: once a Site reaches the prompt
 * the answer is about that place, so a key without it would serve Tanah Lot's
 * answer to somebody standing at Besakih. That is a confident wrong Custom,
 * which is the exact failure this product exists to prevent. Visitors with no
 * Site share one key, which is where most of the hit rate lives.
 *
 * `normalized` comes from `normalizeQuestion`, so phrasing does not fragment
 * the key.
 */
export function answerKey(normalized: string, lang: string, siteId?: string): string {
  return `${lang}::${siteId ?? "-"}::${normalized}`;
}
