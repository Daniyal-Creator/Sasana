import { describe, expect, it } from "vitest";
import { SITES } from "@/data/sites";
import { tExplore } from "@/lib/i18n.explore";

/**
 * Each Site now has a page of its own at `/explore/<id>`, prerendered into the
 * static export. That turns two fields which were previously only ever read on
 * screen into promises made to the outside world, and nothing was checking
 * either of them.
 */
describe("what a Site page needs from its Site", () => {
  it.each(SITES.map((site) => [site.id, site] as const))(
    "%s has an id that can be a path segment",
    (id) => {
      // It is the URL. A space or a slash here is a page that cannot be linked,
      // and the failure would appear at export time rather than in review.
      expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    },
  );

  it.each(SITES.map((site) => [site.id, site] as const))(
    "%s has a description in both languages",
    (_id, site) => {
      // `description.en` is the page's meta description, so an empty one ships
      // a result with nothing under the title in a search engine. Both are
      // checked because the page body follows the language toggle even though
      // the metadata cannot.
      expect(site.description.en.trim().length).toBeGreaterThan(20);
      expect(site.description.id.trim().length).toBeGreaterThan(20);
    },
  );

  it.each(SITES.map((site) => [site.id, site] as const))(
    "%s names its region, which the shared link carries",
    (_id, site) => {
      expect(site.region.trim()).not.toBe("");
      expect(site.name.trim()).not.toBe("");
    },
  );

  it("gives every Site a distinct page", () => {
    const ids = SITES.map((site) => site.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(["en", "id"] as const)("names the way back to the map in %s", (lang) => {
    // The page is a leaf without it: somebody arriving from a search result has
    // read what is expected of them and has no way to see where the place is.
    expect(tExplore(lang, "explore.detail.openMap").trim()).not.toBe("");
  });
});
