import { beforeEach, describe, expect, it } from "vitest";
import { AnswerCache, answerKey } from "@/lib/cache";
import { normalizeQuestion, rulesHash } from "@/lib/knowledge";
import type { ChatResponse } from "@shared/contract";

// Every case runs against an in-memory database, so the suite never touches the
// filesystem and one test cannot colour the next.
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
  it("returns nothing for a question it has not seen", () => {
    expect(cache.get("k", KB)).toBeUndefined();
  });

  it("serves back what it stored", () => {
    cache.set("k", ANSWER, 120, KB);
    expect(cache.get("k", KB)).toEqual(ANSWER);
  });

  // The whole invalidation strategy. An answer derived from the rules is not
  // stale because time passed; it is stale when the rules changed.
  it("treats an entry written against different rules as a miss", () => {
    cache.set("k", ANSWER, 120, KB);
    expect(cache.get("k", OTHER_KB)).toBeUndefined();
  });

  it("drops the stale entry rather than leaving it to accumulate", () => {
    cache.set("k", ANSWER, 120, KB);
    cache.get("k", OTHER_KB);
    expect(cache.stats(OTHER_KB).entries).toBe(0);
  });

  it("survives being written twice for the same question", () => {
    cache.set("k", ANSWER, 120, KB);
    cache.set("k", { ...ANSWER, answer: "Newer wording." }, 90, KB);

    expect(cache.get("k", KB)?.answer).toBe("Newer wording.");
    expect(cache.stats(KB).entries).toBe(1);
  });
});

describe("AnswerCache — the numbers behind the saving", () => {
  it("counts a miss and a hit for the same question", () => {
    cache.get("k", KB); // miss
    cache.set("k", ANSWER, 120, KB);
    cache.get("k", KB); // hit

    const stats = cache.stats(KB);
    expect(stats.misses).toBe(1);
    expect(stats.hits).toBe(1);
    expect(stats.hitRate).toBe(0.5);
  });

  // Measured, not estimated: what the first call actually cost is what each
  // later hit did not spend.
  it("adds the original cost of the call to tokensSaved on every hit", () => {
    cache.set("k", ANSWER, 250, KB);
    cache.get("k", KB);
    cache.get("k", KB);
    cache.get("k", KB);

    expect(cache.stats(KB).tokensSaved).toBe(750);
  });

  it("saves nothing until a question is asked a second time", () => {
    cache.set("k", ANSWER, 250, KB);
    expect(cache.stats(KB).tokensSaved).toBe(0);
  });

  it("reports a zero hit rate rather than dividing by nothing", () => {
    expect(cache.stats(KB).hitRate).toBe(0);
  });
});

describe("AnswerCache — switched off", () => {
  // The off state is what makes the saving provable: run the same questions
  // twice, once cold and once warm, and put the two readings side by side.
  const off = () => new AnswerCache(":memory:", false);

  it("never serves an answer", () => {
    const cache = off();
    cache.set("k", ANSWER, 120, KB);
    expect(cache.get("k", KB)).toBeUndefined();
  });

  it("still counts the misses, so the comparison has a denominator", () => {
    const cache = off();
    cache.get("k", KB);
    cache.get("k", KB);

    const stats = cache.stats(KB);
    expect(stats.misses).toBe(2);
    expect(stats.hits).toBe(0);
    expect(stats.enabled).toBe(false);
    expect(stats.tokensSaved).toBe(0);
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
