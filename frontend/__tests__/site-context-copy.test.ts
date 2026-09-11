import { describe, expect, it } from "vitest";
import { SITES, type CustomIcon } from "@/data/sites";
import { buildDummySites } from "@/data/dummy-sites";
import { t } from "@/lib/i18n";
import { HERE_LIMIT, HERE_QUESTION_KEY, positionLine, questionKindsFor } from "@/lib/site-context-copy";
import type { Proximity } from "@shared/contract";

const LANGS = ["en", "id"] as const;

/**
 * The card that tells a visitor what they carried in from Explore.
 *
 * It exists because the context used to travel invisibly: the request carried
 * the Site and the position, the answer was shaped by both, and the screen said
 * nothing, so nobody thought to ask "here".
 */
describe("what the context card says about a position", () => {
  it("says nothing at all when there is no fix", () => {
    expect(positionLine(null)).toBeNull();
    expect(positionLine(undefined)).toBeNull();
  });

  it("names the area rather than a distance once the visitor is inside it", () => {
    // A distance to the centre of an area you are standing in answers nothing.
    const line = positionLine({ state: "zone", distanceM: 120, accuracyM: 15 });
    expect(line).toEqual({ key: "assistant.context.inside", withDistance: false });
  });

  it("gives the distance in the Approach, and says they are not inside yet", () => {
    const line = positionLine({ state: "approach", distanceM: 640, accuracyM: 25 });
    expect(line).toEqual({ key: "assistant.context.approaching", withDistance: true });
  });

  it("gives the distance from outside without claiming anything else", () => {
    const line = positionLine({ state: "outside", distanceM: 1800, accuracyM: 30 });
    expect(line).toEqual({ key: "assistant.context.away", withDistance: true });
  });

  // The same rule the prompt follows. Screen and answer have to agree, or the
  // card quotes a number the answer has already decided it cannot stand behind.
  it("withholds the number when the fix is no better than the distance", () => {
    const line = positionLine({ state: "approach", distanceM: 400, accuracyM: 500 });
    expect(line).toEqual({ key: "assistant.context.unsure", withDistance: false });
  });

  it("treats an accuracy exactly equal to the distance as too vague", () => {
    expect(positionLine({ state: "outside", distanceM: 400, accuracyM: 400 })?.withDistance).toBe(false);
  });

  // Being inside wins over the vagueness test: the state is a fact about which
  // side of a line they are on, and it survives a poor fix.
  it("still names the area when a vague fix lands inside the Zone", () => {
    const line = positionLine({ state: "zone", distanceM: 100, accuracyM: 300 });
    expect(line?.key).toBe("assistant.context.inside");
  });

  it.each(LANGS)("prints a real sentence in %s, with the placeholder spent", (lang) => {
    const fixes: Proximity[] = [
      { state: "zone", distanceM: 120, accuracyM: 15 },
      { state: "approach", distanceM: 640, accuracyM: 25 },
      { state: "outside", distanceM: 1800, accuracyM: 30 },
      { state: "approach", distanceM: 400, accuracyM: 500 },
    ];

    for (const fix of fixes) {
      const line = positionLine(fix)!;
      const text = t(lang, line.key, line.withDistance ? { distance: "650 m" } : undefined);
      expect(text.trim()).not.toBe("");
      expect(text).not.toContain("{distance}");
      // Guardrail W1: no em dashes anywhere in product copy.
      expect(text).not.toContain("—");
    }
  });

  it("names the Site in the card heading rather than printing the placeholder", () => {
    for (const lang of LANGS) {
      const heading = t(lang, "assistant.context.about", { site: "Pura Tirta Empul" });
      expect(heading).toContain("Pura Tirta Empul");
      expect(heading).not.toContain("{site}");
    }
  });
});

/**
 * The questions offered to somebody who arrived from a Site.
 *
 * The mapping from a Custom's icon to a question is the grounding: a question
 * appears only where the Site really holds a Custom of that kind, so tapping it
 * lands on that Site's own Rules instead of on a subject the assistant then has
 * to refuse.
 */
describe("questions derived from a Site's own Customs", () => {
  const ALL_SITES = [...SITES, ...buildDummySites({ lat: -6.2, lng: 106.8 })];

  it("offers a question for every kind of Custom the app can hold", () => {
    // Exhaustiveness, checked rather than trusted: a new CustomIcon with no
    // question here would silently drop that Custom out of the list.
    const kinds = new Set<CustomIcon>(ALL_SITES.flatMap((site) => site.customs.map((c) => c.icon)));
    for (const kind of kinds) {
      expect(HERE_QUESTION_KEY[kind]).toBeTruthy();
    }
  });

  it("gives every real Site at least one question, and never more than the limit", () => {
    for (const site of SITES) {
      const kinds = questionKindsFor(site);
      expect(kinds.length).toBeGreaterThan(0);
      expect(kinds.length).toBeLessThanOrEqual(HERE_LIMIT);
    }
  });

  it("never repeats a question when a Site carries two Customs of one kind", () => {
    const site = {
      ...SITES[0],
      customs: [SITES[0].customs[0], SITES[0].customs[0], SITES[0].customs[1]],
    };
    const kinds = questionKindsFor(site);
    expect(new Set(kinds).size).toBe(kinds.length);
  });

  it.each(LANGS)("asks about the Site by name in %s", (lang) => {
    const site = SITES.find((s) => s.id === "pura-tirta-empul")!;

    for (const kind of questionKindsFor(site)) {
      const question = t(lang, HERE_QUESTION_KEY[kind], { site: site.name });
      expect(question).toContain(site.name);
      expect(question).not.toContain("{site}");
      // These are questions the visitor sends verbatim, so they have to read as
      // questions rather than as topics.
      expect(question.trim().endsWith("?")).toBe(true);
    }
  });

  // A question is only honest if the Site has a Custom behind it. This is the
  // same guarantee `site-rules.test.ts` enforces for the Customs themselves,
  // arrived at from the question end.
  it("only asks about kinds the Site actually carries", () => {
    for (const site of ALL_SITES) {
      const held = new Set(site.customs.map((c) => c.icon));
      for (const kind of questionKindsFor(site)) {
        expect(held.has(kind)).toBe(true);
      }
    }
  });
});
