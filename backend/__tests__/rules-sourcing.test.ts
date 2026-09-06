import { describe, expect, it } from "vitest";
import { loadRules } from "@/lib/knowledge";

const rules = loadRules();

// The knowledge base is the one part of this app that cannot be checked by
// reading the code, so the standard for adding to it lives here instead. Every
// rule a visitor reads is a claim about how to behave at somebody's place of
// worship; guardrail W6 is a factual guardrail, and these are its teeth.

/**
 * Sources a rule is allowed to cite.
 *
 * A blanket "adat" is not traceable, and a source nobody can follow is the same
 * as no source. New entries have to name an authority or a published work; this
 * list is where that is enforced, and it grows deliberately rather than by
 * accident.
 */
const ALLOWED_SOURCES = new Set([
  "Bali Governor Circular No. 7 of 2025",
  "Balinese Hindu custom (adat)",
]);

/**
 * The seven rules written before the sourcing standard existed.
 *
 * They cite "Balinese Hindu custom (adat)" with nothing behind it, which is
 * exactly what the standard now forbids. They are listed rather than quietly
 * exempted so the debt is countable: each one needs a named source - a book, a
 * paper, an official page, or a local authority who reviewed it - and this set
 * should only ever shrink. Rewriting their attribution without reading a real
 * source would be inventing one, which is worse than owing it.
 */
const UNSOURCED_LEGACY = new Set([
  "offerings-canang",
  "photography",
  "menstruation-entry",
  "speaking-volume",
  "shoe-removal",
  "touching-sacred-objects",
  "head-level-respect",
]);

describe("every rule is traceable", () => {
  it.each(rules.map((rule) => [rule.id, rule] as const))("%s cites an allowed source", (_id, rule) => {
    expect(ALLOWED_SOURCES.has(rule.source)).toBe(true);
  });

  it.each(rules.map((rule) => [rule.id, rule] as const))("%s records how it was checked", (_id, rule) => {
    expect(rule.why_source.trim().length).toBeGreaterThan(10);
  });

  // The standard binds anything added from here on. The legacy set is the only
  // way past it, and it cannot grow: a new id added to it fails this test.
  it("adds no new rule on a blanket adat attribution", () => {
    const unsourced = rules
      .filter((rule) => rule.source === "Balinese Hindu custom (adat)")
      .map((rule) => rule.id);

    expect(new Set(unsourced)).toEqual(UNSOURCED_LEGACY);
  });

  it("has fewer unsourced rules than sourced ones", () => {
    expect(UNSOURCED_LEGACY.size).toBeLessThan(rules.length - UNSOURCED_LEGACY.size);
  });
});

describe("every rule is findable", () => {
  it.each(rules.map((rule) => [rule.id, rule] as const))("%s has enough keywords", (_id, rule) => {
    expect(rule.keywords.length).toBeGreaterThanOrEqual(8);
  });

  // Retrieval kept coming back empty in Indonesian because the keyword lists
  // were largely English. Requiring a keyword that actually occurs in the
  // Indonesian rule text is a cheap way to keep both languages covered.
  it.each(rules.map((rule) => [rule.id, rule] as const))("%s is reachable in Indonesian", (_id, rule) => {
    const reachable = rule.keywords.some((keyword) => rule.rule_id.toLowerCase().includes(keyword));
    expect(reachable).toBe(true);
  });

  /**
   * A keyword on most of the rules discriminates between none of them.
   *
   * This is not hypothetical. Adding "pura" to thirteen entries at once, to fix
   * Indonesian retrieval, made every Indonesian temple question match every one
   * of them, and the redirecting refusal started offering Dress Code to
   * somebody asking about food. The word that earns its place is the one that
   * separates a rule from the others.
   */
  it("has no keyword common enough to be meaningless", () => {
    const counts = new Map<string, number>();
    for (const rule of rules) {
      for (const keyword of new Set(rule.keywords)) {
        counts.set(keyword, (counts.get(keyword) ?? 0) + 1);
      }
    }
    const tooCommon = [...counts].filter(([, n]) => n > rules.length / 2).map(([k]) => k);

    expect(tooCommon).toEqual([]);
  });
});

describe("the knowledge base is internally consistent", () => {
  it("has unique ids", () => {
    const ids = rules.map((rule) => rule.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses kebab-case ids, which is what the model is asked to cite", () => {
    for (const rule of rules) {
      expect(rule.id).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });

  // The refusal offers categories by name, so a category that is spelled two
  // ways would offer the same topic twice.
  it("pairs each English category with exactly one Indonesian one", () => {
    const pairs = new Map<string, Set<string>>();
    for (const rule of rules) {
      const set = pairs.get(rule.category_en) ?? new Set<string>();
      set.add(rule.category_id);
      pairs.set(rule.category_en, set);
    }
    for (const [category, translations] of pairs) {
      expect([category, translations.size]).toEqual([category, 1]);
    }
  });

  it("writes both languages for every field a visitor reads", () => {
    for (const rule of rules) {
      for (const field of ["rule_en", "rule_id", "why_en", "why_id"] as const) {
        expect(rule[field].trim().length).toBeGreaterThan(20);
      }
    }
  });
});
