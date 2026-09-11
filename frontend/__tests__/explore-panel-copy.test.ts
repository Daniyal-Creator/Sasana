import { describe, expect, it } from "vitest";
import { tExplore } from "@/lib/i18n.explore";
import { SITES } from "@/data/sites";

/**
 * The back button inside an Approach.
 *
 * A visitor standing inside one temple's Approach can tap another temple and
 * read it. Back then returns to the Approach rather than leaving for the list,
 * so the button has to name where it goes: "Back to the list" there would be a
 * label pointing at a place it does not lead.
 */
describe("backing out of a temple read inside another's Approach", () => {
  const site = SITES[0].name;

  it.each(["en", "id"] as const)("names the site it returns to, in %s", (lang) => {
    const label = tExplore(lang, "explore.panel.backToApproach", { site });
    expect(label).toContain(site);
    // The placeholder has to be spent, not printed.
    expect(label).not.toContain("{site}");
  });

  it("is a different label from the one that leaves for the list", () => {
    for (const lang of ["en", "id"] as const) {
      expect(tExplore(lang, "explore.panel.backToApproach", { site })).not.toBe(
        tExplore(lang, "explore.panel.back"),
      );
    }
  });

  it("complies with guardrail W1, which survives the /explore carve-out", () => {
    for (const lang of ["en", "id"] as const) {
      expect(tExplore(lang, "explore.panel.backToApproach", { site })).not.toContain("—");
    }
  });
});

describe("explore sidebar toggle accessibility copy", () => {
  it.each(["en", "id"] as const)("provides accessible labels for hide and show in %s", (lang) => {
    const hideLabel = tExplore(lang, "explore.sidebar.hide");
    const showLabel = tExplore(lang, "explore.sidebar.show");

    expect(hideLabel).toBeTruthy();
    expect(showLabel).toBeTruthy();
    expect(hideLabel).not.toBe(showLabel);
    expect(hideLabel).not.toContain("—");
    expect(showLabel).not.toContain("—");
  });
});

