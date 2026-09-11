import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { RULE_CATEGORIES, RULE_CATEGORY } from "@/data/rule-categories";

// The drift guard behind `rule-categories.ts`. That file is a copy of the
// `category_en` field in rules.json, and a copy left to stay true by hand does
// not: a Rule added to the knowledge base without an entry here would quietly
// lose its follow-up chips, and nothing on screen would say so.
//
// Same arrangement as site-rules.test.ts, which guards MEANINGS the same way.

interface RuleRecord {
  id: string;
  category_en: string;
}

const rulesPath = fileURLToPath(new URL("../../backend/src/data/rules.json", import.meta.url));
const rules: RuleRecord[] = JSON.parse(readFileSync(rulesPath, "utf-8"));

const slug = (category: string) => category.toLowerCase().replace(/[^a-z0-9]+/g, "-");

describe("rule categories -> rules.json", () => {
  it("reads the knowledge base", () => {
    expect(rules.length).toBeGreaterThan(0);
  });

  it("covers every Rule", () => {
    const missing = rules.filter((rule) => !RULE_CATEGORY[rule.id]).map((rule) => rule.id);
    expect(missing, `Rules with no category entry: ${missing.join(", ")}`).toEqual([]);
  });

  it("names no Rule the knowledge base does not have", () => {
    const known = new Set(rules.map((rule) => rule.id));
    const unknown = Object.keys(RULE_CATEGORY).filter((id) => !known.has(id));
    expect(unknown, `Entries for Rules that no longer exist: ${unknown.join(", ")}`).toEqual([]);
  });

  it("agrees with rules.json on which category each Rule is filed under", () => {
    for (const rule of rules) {
      expect(RULE_CATEGORY[rule.id], `Rule "${rule.id}"`).toBe(slug(rule.category_en));
    }
  });

  it("lists every category the knowledge base uses, and no others", () => {
    const used = [...new Set(rules.map((rule) => slug(rule.category_en)))];
    expect([...RULE_CATEGORIES].sort()).toEqual(used.sort());
  });

  it("introduces categories in the order rules.json first mentions them", () => {
    // The order decides which breadth chips a visitor is offered, so it is
    // part of the behaviour rather than a detail of how the file was typed.
    const firstSeen = [...new Set(rules.map((rule) => slug(rule.category_en)))];
    expect([...RULE_CATEGORIES]).toEqual(firstSeen);
  });
});
