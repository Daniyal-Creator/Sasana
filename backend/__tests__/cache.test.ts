import { beforeEach, describe, expect, it } from "vitest";
import { AnswerCache, answerKey, hitRate } from "@/lib/cache";
import { normalizeQuestion, rulesHash } from "@/lib/knowledge";
import type { ChatResponse } from "@shared/contract";

// Every case runs against an in-memory database, so the suite never touches the
// filesystem and one test cannot colour the next.
//
// The store is asynchronous because the other implementation of the same
// interface - Postgres, which production runs (ADR-0018) - cannot be anything
// else. SQLite answers immediately and still returns a promise, so the awaits
// below cost nothing here and keep both stores callable the same way.
const KB = "kb-hash-one";
const OTHER_KB = "kb-hash-two";

const ANSWER: ChatResponse = {
  answer: "Wear a kamen and sash.",
  kind: "rule",
  ruleIds: ["temple-attire"],
  source: "Bali Governor Circular No. 7 of 2025",
};

let cache: AnswerCache;

beforeEach(() => {
  cache = new AnswerCache(":memory:");
});

describe("AnswerCache", () => {
  it("returns nothing for a question it has not seen", async () => {
    expect(await cache.get("k", KB)).toBeUndefined();
  });

  it("serves back what it stored", async () => {
    await cache.set("k", ANSWER, 120, KB);
    expect(await cache.get("k", KB)).toEqual(ANSWER);
  });

  // The whole invalidation strategy. An answer derived from the rules is not
  // stale because time passed; it is stale when the rules changed.
  it("treats an entry written against different rules as a miss", async () => {
    await cache.set("k", ANSWER, 120, KB);
    expect(await cache.get("k", OTHER_KB)).toBeUndefined();
  });

  it("drops the stale entry rather than leaving it to accumulate", async () => {
    await cache.set("k", ANSWER, 120, KB);
    await cache.get("k", OTHER_KB);
    expect((await cache.stats(OTHER_KB)).entries).toBe(0);
  });

  it("survives being written twice for the same question", async () => {
    await cache.set("k", ANSWER, 120, KB);
    await cache.set("k", { ...ANSWER, answer: "Newer wording." }, 90, KB);

    expect((await cache.get("k", KB))?.answer).toBe("Newer wording.");
    expect((await cache.stats(KB)).entries).toBe(1);
  });
});

describe("AnswerCache — the numbers behind the saving", () => {
  it("counts a miss and a hit for the same question", async () => {
    await cache.get("k", KB); // miss
    await cache.set("k", ANSWER, 120, KB);
    await cache.get("k", KB); // hit

    const stats = await cache.stats(KB);
    expect(stats.misses).toBe(1);
    expect(stats.hits).toBe(1);
    expect(stats.hitRate).toBe(0.5);
  });

  // Measured, not estimated: what the first call actually cost is what each
  // later hit did not spend.
  it("adds the original cost of the call to tokensSaved on every hit", async () => {
    await cache.set("k", ANSWER, 250, KB);
    await cache.get("k", KB);
    await cache.get("k", KB);
    await cache.get("k", KB);

    expect((await cache.stats(KB)).tokensSaved).toBe(750);
  });

  it("saves nothing until a question is asked a second time", async () => {
    await cache.set("k", ANSWER, 250, KB);
    expect((await cache.stats(KB)).tokensSaved).toBe(0);
  });

  it("reports a zero hit rate rather than dividing by nothing", async () => {
    expect((await cache.stats(KB)).hitRate).toBe(0);
  });
});

describe("AnswerCache — switched off", () => {
  // The off state is what makes the saving provable: run the same questions
  // twice, once cold and once warm, and put the two readings side by side.
  const off = () => new AnswerCache(":memory:", false);

  it("never serves an answer", async () => {
    const cache = off();
    await cache.set("k", ANSWER, 120, KB);
    expect(await cache.get("k", KB)).toBeUndefined();
  });

  it("still counts the misses, so the comparison has a denominator", async () => {
    const cache = off();
    await cache.get("k", KB);
    await cache.get("k", KB);

    const stats = await cache.stats(KB);
    expect(stats.misses).toBe(2);
    expect(stats.hits).toBe(0);
    expect(stats.enabled).toBe(false);
    expect(stats.tokensSaved).toBe(0);
  });
});

// Shared by both stores, so that a hit rate read off /api/stats means the same
// thing whichever one is behind it (ADR-0018).
describe("hitRate", () => {
  it("is zero when nothing has been asked, rather than NaN", () => {
    expect(hitRate(0, 0)).toBe(0);
  });

  it("is a share of every cacheable question, not just of the hits", () => {
    expect(hitRate(1, 3)).toBe(0.25);
  });

  it("rounds to four places, so the number fits on a screen", () => {
    expect(hitRate(1, 2)).toBe(0.3333);
  });
});

describe("answerKey", () => {
  const key = (message: string, lang = "en", siteId?: string) =>
    answerKey(normalizeQuestion(message), lang, siteId);

  // The point of normalising: phrasing should not fragment the key.
  it("collapses the ways one question gets asked", () => {
    const wanted = key("Apakah saya boleh pakai celana pendek?", "id");

    expect(key("Boleh pakai celana pendek tidak?", "id")).toBe(wanted);
    expect(key("boleh   PAKAI Celana Pendek?", "id")).toBe(wanted);
    expect(key("Bolehkah pakai celana pendek?", "id")).toBe(wanted);
  });

  it("keeps languages apart, so an Indonesian asker is not served English", () => {
    expect(key("Can I wear shorts?", "en")).not.toBe(key("Can I wear shorts?", "id"));
  });

  // Serving Tanah Lot's answer to somebody standing at Besakih is a confident
  // wrong Custom, which is the failure this product exists to prevent.
  it("keeps Sites apart", () => {
    const question = "What should I wear here?";
    expect(key(question, "en", "pura-tanah-lot")).not.toBe(key(question, "en", "pura-besakih"));
  });

  it("lets visitors with no Site share one key", () => {
    expect(key("Can I wear shorts?")).toBe(key("can i wear shorts"));
  });

  it("does not collapse questions that are genuinely different", () => {
    expect(key("Can I fly a drone?")).not.toBe(key("Can I wear shorts?"));
  });
});

describe("rulesHash", () => {
  it("is stable across calls", () => {
    expect(rulesHash()).toBe(rulesHash());
  });

  it("is short enough to store beside every row", () => {
    expect(rulesHash()).toHaveLength(16);
  });
});
