import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { SITES } from "@/data/sites";

interface RuleRecord {
  id: string;
}

const rulesPath = fileURLToPath(new URL("../../backend/src/data/rules.json", import.meta.url));
const rulesJson: RuleRecord[] = JSON.parse(readFileSync(rulesPath, "utf-8"));
const validRuleIds = new Set(rulesJson.map((r) => r.id));

describe("site customs -> rules mapping", () => {
  it("loads backend rules.json successfully", () => {
    expect(validRuleIds.size).toBeGreaterThan(0);
  });

  for (const site of SITES) {
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
        });
      }
    });
  }
});
