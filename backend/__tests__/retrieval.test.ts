import { describe, expect, it } from "vitest";
import { loadRules, rulesByIds, searchRules, selectRules } from "@/lib/knowledge";
import { RETRIEVAL_CASES } from "./retrieval.fixtures";

const rules = loadRules();

// Narrowing the prompt is only safe because of what was measured before it was
// built, and these keep that measurement honest as the knowledge base grows.

describe("selectRules — the answering rule survives the cut", () => {
  it.each(RETRIEVAL_CASES.map((c) => [c.expected, c.question] as const))(
    "keeps %s for: %s",
    (expected, question) => {
      const sent = selectRules(rules, question).map((rule) => rule.id);
      expect(sent).toContain(expected);
    },
  );

  it("sends far less than everything, question by question", () => {
    const sizes = RETRIEVAL_CASES.map((c) => selectRules(rules, c.question).length);
    const average = sizes.reduce((sum, n) => sum + n, 0) / sizes.length;

    expect(average).toBeLessThan(rules.length / 2);
  });
});

describe("selectRules — the fallback that keeps it safe", () => {
  // The one failure mode measurement actually found. Retrieval never ranked the
  // answering rule low; it returned nothing at all. "Ada yang ditaruh di tanah
  // depan pintu" is answered by offerings-canang and matches none of its
  // keywords, so a narrowed prompt would refuse a question the knowledge base
  // covers. An empty result therefore falls back to everything.
  it.each([
    "Ada yang ditaruh di tanah depan pintu, saya harus bagaimana?",
    "Saya cuma bawa kaos oblong, apa itu cukup?",
    "Saya ingin membawa pulang batu dari sini",
  ])("falls back to the whole knowledge base for: %s", (question) => {
    expect(searchRules(rules, question)).toEqual([]);
    expect(selectRules(rules, question)).toHaveLength(rules.length);
  });

  it("falls back for an empty question rather than sending nothing", () => {
    expect(selectRules(rules, "")).toHaveLength(rules.length);
  });

  // A visitor standing somewhere is owed what applies there, whether or not
  // their wording happened to match it.
  it("always carries the Site's own rules", () => {
    const siteRules = rulesByIds(rules, ["menstruation-entry", "shoe-removal"]);
    const sent = selectRules(rules, "Boleh bawa drone ke pura?", siteRules).map((r) => r.id);

    expect(sent).toContain("drone-restriction");
    expect(sent).toContain("menstruation-entry");
    expect(sent).toContain("shoe-removal");
  });

  it("returns knowledge-base order, so one question always reads the same way", () => {
    const sent = selectRules(rules, "Boleh pakai celana pendek dan memanjat pelinggih?");
    const positions = sent.map((rule) => rules.findIndex((r) => r.id === rule.id));

    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("never repeats a rule that both matched and belongs to the Site", () => {
    const siteRules = rulesByIds(rules, ["temple-attire"]);
    const sent = selectRules(rules, "Boleh pakai celana pendek di pura?", siteRules);

    expect(new Set(sent.map((r) => r.id)).size).toBe(sent.length);
  });
});
