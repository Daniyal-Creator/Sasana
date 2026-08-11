import { describe, expect, it } from "vitest";
import { formatRulesForPrompt, loadRules, parseRules, searchRules } from "@/lib/knowledge";

describe("loadRules", () => {
  it("loads and validates all seed rules", () => {
    const rules = loadRules();
    expect(rules.length).toBeGreaterThanOrEqual(10);
    for (const rule of rules) {
      expect(rule.id && rule.rule_en && rule.rule_id && rule.source).toBeTruthy();
      expect(rule.category_en && rule.category_id).toBeTruthy();
      expect(rule.why_en && rule.why_id && rule.why_source).toBeTruthy();
      expect(Array.isArray(rule.keywords)).toBe(true);
      expect(rule.keywords.length).toBeGreaterThan(0);
      expect(typeof rule.sacred_area).toBe("boolean");
    }
  });

  it("serves the same validated array from module cache", () => {
    expect(loadRules()).toBe(loadRules());
  });
});

describe("parseRules", () => {
  it("rejects a payload that is not an array", () => {
    expect(() => parseRules("nope")).toThrowError(/must be an array/);
    expect(() => parseRules([])).toThrowError(/empty/);
  });

  it("throws an error naming the broken rule and field", () => {
    const broken = [{ id: "x", category_en: "Cat", keywords: ["k"], sacred_area: true }];
    expect(() => parseRules(broken)).toThrowError(/rule\[0\].*category_id/);
  });

  it("rejects a rule that is missing its cultural-meaning layer", () => {
    const noWhy = [
      {
        id: "x",
        category_en: "Cat",
        category_id: "Kat",
        rule_en: "Rule",
        rule_id: "Aturan",
        source: "Source",
        keywords: ["k"],
        sacred_area: true,
      },
    ];
    expect(() => parseRules(noWhy)).toThrowError(/rule\[0\].*why_en/);
  });

  it("rejects wrong-typed keywords and sacred_area", () => {
    const base = {
      id: "x",
      category_en: "Cat",
      category_id: "Kat",
      rule_en: "Rule",
      rule_id: "Aturan",
      why_en: "Why",
      why_id: "Kenapa",
      why_source: "Src",
      source: "Source",
    };
    expect(() => parseRules([{ ...base, keywords: "not-array", sacred_area: true }])).toThrowError(
      /rule\[0\] missing keywords/,
    );
    expect(() => parseRules([{ ...base, keywords: ["k"], sacred_area: "yes" }])).toThrowError(
      /rule\[0\] missing sacred_area/,
    );
  });
});

describe("formatRulesForPrompt", () => {
  it("numbers every rule and starts with the dress-code rule in EN", () => {
    const rules = loadRules();
    const en = formatRulesForPrompt(rules, "en");
    expect(en).toMatch(/^1\. \[Dress Code\]/);
    expect(en.split("\n")).toHaveLength(rules.length);
    expect(en).toContain("(Source: Bali Governor Circular No. 7 of 2025)");
  });

  it("includes the cultural-meaning layer but never its attribution (ADR-0002)", () => {
    const rules = loadRules();
    const en = formatRulesForPrompt(rules, "en");

    expect(en).toContain("Why it matters:");
    expect(en).toContain("canang refers to the small woven palm-leaf tray");
    for (const rule of rules) {
      expect(en).not.toContain(rule.why_source);
    }
  });

  it("renders Indonesian categories and rule text for ID", () => {
    const rules = loadRules();
    const id = formatRulesForPrompt(rules, "id");
    expect(id).toContain("Tata Busana");
    expect(id).toContain("Kamen dan selendang wajib dikenakan");
    expect(id).not.toBe(formatRulesForPrompt(rules, "en"));
  });
});

describe("searchRules", () => {
  it("ranks the attire rule first for an English shorts question", () => {
    const rules = loadRules();
    expect(searchRules(rules, "Can I wear shorts at a temple?")[0]?.id).toBe("temple-attire");
  });

  it("still matches Indonesian questions (merged ID keywords)", () => {
    const rules = loadRules();
    expect(searchRules(rules, "Apakah boleh pakai celana pendek di pura?")[0]?.id).toBe("temple-attire");
    expect(searchRules(rules, "Bolehkah menerbangkan drone di sini?")[0]?.id).toBe("drone-restriction");
  });

  it("returns [] for off-topic questions", () => {
    const rules = loadRules();
    expect(searchRules(rules, "What time is the football match?")).toEqual([]);
    expect(searchRules(rules, "What is the capital of France?")).toEqual([]);
    expect(searchRules(rules, "Where is the best nightclub in Kuta?")).toEqual([]);
  });

  it("does not let a stopword inside a multi-word keyword ground a question", () => {
    const rules = [
      {
        id: "x",
        category_en: "Cat",
        category_id: "Kat",
        rule_en: "Rule",
        rule_id: "Aturan",
        why_en: "Why",
        why_id: "Kenapa",
        why_source: "Src",
        keywords: ["what is canang", "sacred area"],
        source: "Source",
        sacred_area: true,
      },
    ];
    // "what" and "area" appear inside the keywords, but neither question is about them.
    expect(searchRules(rules, "what time is the football match?")).toEqual([]);
  });

  it("still matches a shared word inside a multi-word keyword", () => {
    const rules = loadRules();
    expect(searchRules(rules, "Can I enter the utama mandala?")[0]?.id).toBe("sacred-area-entry");
  });
});
