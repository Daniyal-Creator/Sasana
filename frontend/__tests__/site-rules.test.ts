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

/**
 * A Site's `description` is the one field that carries free prose with nowhere
 * to cite it: `source` beneath it attributes the Customs, and `odalan` carries
 * its own source and calendar anchor for the one date a Site may state. So
 * anything in a description has to be a fact that does not expire.
 *
 * This exists because one had crept in. Uluwatu's description asserted that the
 * site "hosts the nightly kecak dance performance at sunset" - a recurring
 * schedule, unsourced, sitting in shipped data for months. The rule the repo
 * settled on is that a frequency may be stated when it carries a source; until
 * there is a field to hold one, a description states no frequency at all.
 */
describe("site descriptions state nothing that expires", () => {
  // Recurrence, not time-of-day: "sunset views" describes the place, "every
  // sunset" describes a timetable. Only the second one can stop being true.
  const RECURRENCE =
    /\b(nightly|daily|hourly|weekly|monthly|yearly|annually|every|each)\b|\b(setiap|tiap|saban|harian|rutin)\b/i;
  // Money and admission are volatile by definition (ADR-0014) and have never
  // belonged in a description; caught here so the rule has one home.
  const PRICED = /\b(ticket|tickets|tiket|rupiah|idr)\b|\bRp\s?\d/i;

  it.each(ALL_SITES.map((site) => [site.name, site] as const))(
    "%s describes the place rather than a timetable",
    (_name, site) => {
      expect(site.description.en).not.toMatch(RECURRENCE);
      expect(site.description.id).not.toMatch(RECURRENCE);
      expect(site.description.en).not.toMatch(PRICED);
      expect(site.description.id).not.toMatch(PRICED);
    },
  );

  // The guard has to be able to fail, or it is decoration. This is the exact
  // sentence that shipped.
  it("would have caught the sentence that prompted it", () => {
    expect("The site hosts the nightly kecak dance performance at sunset.").toMatch(RECURRENCE);
    expect("Lokasi ini menyelenggarakan pertunjukan tari kecak setiap sore.").toMatch(RECURRENCE);
  });

  // `odalan.anchor` says "every 210 days" and must keep saying it: it is the
  // one place a recurrence is allowed, because it travels with a source and a
  // sourceUrl. The guard is scoped to `description` so it never reaches there.
  it("leaves the one field that may state a cycle alone", () => {
    const anchors = ALL_SITES.flatMap((site) => site.odalan.map((entry) => entry.anchor.en));
    // Not every anchor has to be worded this way - "Purnama Kapat, once a year"
    // is one - but at least one states a cycle in words the description guard
    // above rejects, which is what makes the scoping load-bearing rather than
    // incidental.
    expect(anchors.some((anchor) => RECURRENCE.test(anchor))).toBe(true);

    for (const site of ALL_SITES) {
      for (const entry of site.odalan) {
        expect(entry.source.trim()).not.toBe("");
        expect(entry.sourceUrl.trim()).not.toBe("");
      }
    }
  });
});
