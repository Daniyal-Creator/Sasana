import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { SITES } from "@/data/sites";
import { buildDummySites } from "@/data/dummy-sites";
import { MEANINGS } from "@/data/meanings";
import { siteContextFrom, siteContextNamed } from "@/lib/site-context";

interface RuleRecord {
  id: string;
  why_en: string;
  why_id: string;
  why_source: string;
}

// Dummy Sites face exactly these checks. Only their location and their name
// are invented: the Customs they show a visitor are real sourced text, so a
// separate, gentler standard for them would be a back door for cultural claims
// that nothing traces. The anchor is arbitrary; the Customs do not depend on it.
const ALL_SITES = [...SITES, ...buildDummySites({ lat: -6.2, lng: 106.8 })];

const rulesPath = fileURLToPath(new URL("../../backend/src/data/rules.json", import.meta.url));
const rulesJson: RuleRecord[] = JSON.parse(readFileSync(rulesPath, "utf-8"));
const validRuleIds = new Set(rulesJson.map((r) => r.id));
const ruleById = new Map(rulesJson.map((r) => [r.id, r]));

describe("site customs -> rules mapping", () => {
  it("loads backend rules.json successfully", () => {
    expect(validRuleIds.size).toBeGreaterThan(0);
  });

  for (const site of ALL_SITES) {
    describe(`Site: ${site.id} (${site.name})`, () => {
      it("has a non-empty customs list", () => {
        expect(site.customs.length, `Site "${site.id}" has no customs defined`).toBeGreaterThan(0);
      });

      for (const custom of site.customs) {
        describe(`Custom: ${custom.id} (${custom.icon})`, () => {
          it("has a non-empty ruleIds array", () => {
            const hasRuleIds = Array.isArray(custom.ruleIds) && custom.ruleIds.length > 0;
            expect(
              hasRuleIds,
              `Site "${site.id}" (${site.name}), Custom "${custom.id}" (${custom.title.en}): ruleIds must not be empty`,
            ).toBe(true);
          });

          it("references only valid rule IDs defined in rules.json", () => {
            for (const ruleId of custom.ruleIds ?? []) {
              const isValid = validRuleIds.has(ruleId);
              expect(
                isValid,
                `Site "${site.id}" (${site.name}), Custom "${custom.id}" (${custom.title.en}): references unknown ruleId "${ruleId}". Available rules: ${Array.from(validRuleIds).join(", ")}`,
              ).toBe(true);
            }
          });

          it("has a cultural meaning for every rule it references", () => {
            for (const ruleId of custom.ruleIds ?? []) {
              expect(
                MEANINGS[ruleId],
                `Site "${site.id}", Custom "${custom.id}": rule "${ruleId}" has no entry in data/meanings.ts. The sheet shows a "why this matters" note for every Custom, and an absent one would leave a visitor reading a rule with no reason behind it. Regenerate meanings.ts from rules.json.`,
              ).toBeDefined();
            }
          });
        });
      }
    });
  }
});

// meanings.ts is a copy of the why layer in rules.json, kept in the frontend so
// Explore can run with no network call. A copy is only safe while something
// fails when it drifts. This is that something.
describe("data/meanings.ts agrees with backend rules.json", () => {
  for (const [ruleId, meaning] of Object.entries(MEANINGS)) {
    describe(`Meaning: ${ruleId}`, () => {
      it("names a rule that exists", () => {
        expect(
          validRuleIds.has(ruleId),
          `meanings.ts carries "${ruleId}", which is not a rule in rules.json`,
        ).toBe(true);
      });

      it("matches the rule's why layer word for word", () => {
        const rule = ruleById.get(ruleId);
        if (!rule) return;
        expect(meaning.why.en, `meanings.ts why.en for "${ruleId}" has drifted`).toBe(rule.why_en);
        expect(meaning.why.id, `meanings.ts why.id for "${ruleId}" has drifted`).toBe(rule.why_id);
        expect(meaning.source, `meanings.ts source for "${ruleId}" has drifted`).toBe(
          rule.why_source,
        );
      });

      it("carries an attribution", () => {
        expect(
          meaning.source.trim().length,
          `"${ruleId}" has no source. An unsourced cultural claim is the thing this product exists to avoid.`,
        ).toBeGreaterThan(0);
      });
    });
  }
});

describe("siteContextNamed", () => {
  it("finds a Site the question names without the word Pura", () => {
    const site = siteContextNamed("kalau saya ke tanah lot, ada penginapan dekat sana?");

    expect(site?.id).toBe("pura-tanah-lot");
    expect(site?.lat).toBeCloseTo(-8.6212, 3);
    expect(site?.lng).toBeCloseTo(115.0868, 3);
  });

  it("finds one written with the full name, in either case", () => {
    expect(siteContextNamed("Pura Besakih itu di mana?")?.id).toBe("pura-besakih");
    expect(siteContextNamed("cerita soal ULUWATU dong")?.id).toBe("pura-luhur-uluwatu");
  });

  it("returns null when no Site is named", () => {
    expect(siteContextNamed("boleh pakai celana pendek di pura?")).toBeNull();
    expect(siteContextNamed("adakah penginapan terdekat?")).toBeNull();
  });

  // Every Site's coordinates have to travel, or the assistant has nowhere to
  // search around when the question asks what is nearby.
  it("carries coordinates for every real Site", () => {
    for (const site of SITES) {
      const context = siteContextFrom(site);
      if (!context) continue; // a Dummy Site, which must never reach the backend
      expect(typeof context.lat).toBe("number");
      expect(typeof context.lng).toBe("number");
    }
  });
});
