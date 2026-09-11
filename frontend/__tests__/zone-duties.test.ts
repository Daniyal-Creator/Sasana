import { describe, expect, it } from "vitest";
import { DUTY_BY_ICON, DUTY_LABEL, type Duty } from "@/lib/duty";
import { tExplore } from "@/lib/i18n.explore";
import { SITES } from "@/data/sites";
import { buildDummySites } from "@/data/dummy-sites";
import type { Site } from "@/data/sites";

const LANGS = ["en", "id"] as const;

const allSites: Site[] = [
  ...SITES,
  ...buildDummySites({ lat: -6.2, lng: 106.8 }, "id"),
  ...buildDummySites({ lat: -6.2, lng: 106.8 }, "en"),
];

/**
 * The Zone panel puts one of three words in front of every Custom it lists.
 * The word is the only thing on that line the visitor did not already have, so
 * a Custom that reaches the panel unclassified, or classified as an obligation
 * when the Rule behind it grants a permission, is the failure this app exists
 * to prevent (guardrail W6).
 */
describe("what the Zone panel claims each Custom asks for", () => {
  it("classifies every Custom that can reach the panel", () => {
    for (const site of allSites) {
      for (const custom of site.customs) {
        expect(DUTY_BY_ICON[custom.icon], `${site.id} / ${custom.id}`).toBeDefined();
      }
    }
  });

  /**
   * The one classification that cannot be inferred from the shape of the data,
   * and the one that would do real harm inverted. Photography is a permission
   * with limits at every Site that has it; marking it "Wajib" would tell a
   * visitor they are required to take photographs inside a temple.
   */
  it("never presents the photography permission as an obligation", () => {
    expect(DUTY_BY_ICON.photography).toBe("conditional");
  });

  it("holds drones as a prohibition, which is how every Site words it", () => {
    expect(DUTY_BY_ICON.drones).toBe("forbidden");
    for (const site of SITES) {
      const drones = site.customs.find((custom) => custom.icon === "drones");
      if (!drones) continue;
      expect(drones.summary.en.toLowerCase()).toContain("not permitted");
      expect(drones.summary.id.toLowerCase()).toContain("tidak diizinkan");
    }
  });
});

describe("the words the Zone panel prints", () => {
  const duties: Duty[] = ["required", "forbidden", "conditional"];

  it.each(LANGS)("names all three duties distinctly in %s", (lang) => {
    const words = duties.map((duty) => tExplore(lang, DUTY_LABEL[duty]));
    expect(new Set(words).size).toBe(duties.length);
    for (const word of words) expect(word.trim()).not.toBe("");
  });

  it.each(LANGS)("spends the count in the heading in %s", (lang) => {
    const heading = tExplore(lang, "explore.zone.heading", { count: "5" });
    expect(heading).toContain("5");
    expect(heading).not.toContain("{count}");
  });

  /**
   * The Zone panel and the brief are two panels deep in the same sheet, so the
   * label on the way back has to name which one it returns to. Both saying
   * "Kembali ke daftar" would be one of them pointing at a place it does not go.
   */
  it.each(LANGS)("distinguishes the two ways back in %s", (lang) => {
    expect(tExplore(lang, "explore.zone.backToZone")).not.toBe(
      tExplore(lang, "explore.panel.back"),
    );
  });

  // Guardrail W1 survives the /explore carve-out.
  it("uses no em dashes", () => {
    const keys = [
      "explore.zone.overline",
      "explore.zone.heading",
      "explore.zone.detail",
      "explore.zone.backToZone",
      ...duties.map((duty) => DUTY_LABEL[duty]),
    ] as const;
    for (const lang of LANGS) {
      for (const key of keys) {
        expect(tExplore(lang, key)).not.toContain("—");
      }
    }
  });
});

/**
 * Every line of the panel is `custom.detail`, printed as it stands. The panel
 * writes none of its own, so the only way a sentence there can be wrong is if
 * the data is missing one.
 */
describe("the sentences the Zone panel prints", () => {
  it("has an instruction in both languages for every Custom", () => {
    for (const site of allSites) {
      for (const custom of site.customs) {
        for (const lang of LANGS) {
          expect(custom.detail[lang].trim(), `${site.id} / ${custom.id} / ${lang}`).not.toBe("");
        }
      }
    }
  });
});
