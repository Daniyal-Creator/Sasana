import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatResponse } from "@shared/contract";

// The Postgres store is the one production runs (ADR-0018), and it was the only
// half of the AnswerStore interface with no test behind it. That is exactly
// where the double-encoding bug lived: `set` pre-stringified the answer before
// handing it to the driver, which serialises for a json column itself, so every
// row went in as a jsonb *string* rather than a jsonb object. `get` then handed
// that string to `Response.json`, and the browser received an escaped blob whose
// `.answer` was undefined - an empty chat bubble on the second ask of any
// question. SQLite never showed it because its own `get` calls JSON.parse.
//
// Reaching a real database from the suite is not an option, so the driver is
// stubbed and these tests assert on what the query was handed. That is a lower
// level than the rest of the suite likes to work at, and it is the level the
// defect lived at: the SQL was right, the parameter was not.

const stub = vi.hoisted(() => {
  const captured: { text: string; values: unknown[] }[] = [];

  // What `sql.json(x)` returns is opaque to us - the real one builds a
  // Parameter carrying the json type oid. All the tests need is to tell "the
  // object was passed through sql.json" apart from "a string was passed".
  const jsonParam = (value: unknown) => ({ __json: value });

  // Rows the next query resolves with. `evict` destructures `[{ n }]` and
  // `stats` destructures `[row]`, so the default has to be a single row rather
  // than an empty array or those two would throw on a shape they never see in
  // production.
  const rows: { current: unknown[] } = { current: [{ n: "0" }] };

  return { captured, jsonParam, rows };
});

vi.mock("postgres", () => {
  const sql = (strings: TemplateStringsArray, ...values: unknown[]) => {
    stub.captured.push({ text: strings.join("?"), values });
    return Promise.resolve(stub.rows.current);
  };
  sql.json = stub.jsonParam;
  sql.end = () => Promise.resolve();
  return { default: () => sql };
});

const { PostgresAnswerCache } = await import("@/lib/cache-postgres");

const KB = "kb-hash-one";

const ANSWER: ChatResponse = {
  answer: "Wear a kamen and sash.",
  kind: "rule",
  ruleIds: ["temple-attire"],
  source: "Bali Governor Circular No. 7 of 2025",
};

let cache: InstanceType<typeof PostgresAnswerCache>;

beforeEach(() => {
  stub.captured.length = 0;
  stub.rows.current = [{ n: "0" }];
  cache = new PostgresAnswerCache("postgres://stub/not-connected");
});

const insertQuery = () => stub.captured.find((q) => q.text.includes("INSERT INTO cache.answers"));

describe("PostgresAnswerCache — what reaches the jsonb column", () => {
  // The regression itself. A string parameter is what produced `jsonb_typeof`
  // of "string" against the real database; the driver serialises the value it
  // is given, so a value already serialised is serialised twice.
  it("never hands the answer to the driver pre-stringified", async () => {
    await cache.set("k", ANSWER, 120, KB);

    const values = insertQuery()?.values;
    expect(values).toBeDefined();
    expect(typeof values?.[2]).not.toBe("string");
  });

  it("marks the answer as json so the driver serialises it exactly once", async () => {
    await cache.set("k", ANSWER, 120, KB);

    expect(insertQuery()?.values[2]).toEqual(stub.jsonParam(ANSWER));
  });

  it("still writes the key, the knowledge-base hash and the token count", async () => {
    await cache.set("k", ANSWER, 120, KB);

    const values = insertQuery()?.values;
    expect(values?.[0]).toBe("k");
    expect(values?.[1]).toBe(KB);
    expect(values?.[3]).toBe(120);
  });

  it("writes nothing at all when the cache is switched off", async () => {
    const off = new PostgresAnswerCache("postgres://stub/not-connected", false);
    await off.set("k", ANSWER, 120, KB);

    expect(insertQuery()).toBeUndefined();
  });
});

describe("PostgresAnswerCache — reading rows written before the fix", () => {
  // Correcting `set` does not correct what is already in Supabase. Those rows
  // carry the same kb_hash as the ones written after, so nothing invalidates
  // them: without this they would keep serving a broken answer until they were
  // evicted. Tolerating the old shape on read is what makes the deploy
  // self-healing rather than something that needs a TRUNCATE nobody remembers.
  it("parses a legacy row stored as a jsonb string", async () => {
    stub.rows.current = [{ response: JSON.stringify(ANSWER) }];

    expect(await cache.get("k", KB)).toEqual(ANSWER);
  });

  it("returns a correctly stored row untouched", async () => {
    stub.rows.current = [{ response: ANSWER }];

    expect(await cache.get("k", KB)).toEqual(ANSWER);
  });

  // A row that is neither shape is a cache problem, and a cache must never
  // break an answer: the caller gets a miss and spends Gemini quota instead.
  it("treats an unreadable row as a miss", async () => {
    stub.rows.current = [{ response: "{not json at all" }];

    expect(await cache.get("k", KB)).toBeUndefined();
  });

  it("returns nothing when the question is not in the table", async () => {
    stub.rows.current = [];

    expect(await cache.get("k", KB)).toBeUndefined();
  });
});
