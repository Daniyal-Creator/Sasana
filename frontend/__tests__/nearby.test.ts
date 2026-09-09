import { describe, expect, it } from "vitest";
import {
  NEARBY_ZOOM,
  REFERENCE_SCREEN_PX,
  circleDiameterPx,
  metresPerPixel,
} from "@/lib/nearby";
import { tExplore, type ExploreKey } from "@/lib/i18n.explore";
import { APPROACH_BUFFER_M } from "@/lib/geo";
import { SITES } from "@/data/sites";

// Bali, near enough for a ground-resolution figure. Latitude is what makes
// Mercator pixels differ from one place to another, and every Site is within
// about a degree of this.
const BALI_LAT = -8.65;

describe("nearby mode", () => {
  it("measures ground resolution the way Web Mercator does", () => {
    // At the equator z0 is a single 256 px tile across 40075 km, so one pixel
    // is about 156.5 km. Everything else follows from halving per level.
    expect(metresPerPixel(0, 0)).toBeCloseTo(156_543.03, 1);
    expect(metresPerPixel(0, 1)).toBeCloseTo(metresPerPixel(0, 0) / 2, 5);
    // Away from the equator a pixel covers less ground.
    expect(metresPerPixel(BALI_LAT, 17)).toBeLessThan(metresPerPixel(0, 17));
  });

  /**
   * The reason the mode hides Zones, kept as a test rather than as a sentence
   * nobody rechecks. Lower NEARBY_ZOOM to somewhere a Zone would fit on screen
   * again and this fails, which is the point: at that zoom the justification
   * for hiding it is gone too.
   */
  it("puts every Site's Zone wider than the reference screen at NEARBY_ZOOM", () => {
    for (const site of SITES) {
      const zone = circleDiameterPx(site.radiusM, site.lat, NEARBY_ZOOM);
      expect(zone).toBeGreaterThan(REFERENCE_SCREEN_PX);

      // The Approach is wider still, so hiding the Zone alone would leave the
      // bigger of the two circles washing the screen.
      const approach = circleDiameterPx(site.radiusM + APPROACH_BUFFER_M, site.lat, NEARBY_ZOOM);
      expect(approach).toBeGreaterThan(zone);
    }
  });

  it("keeps Zones readable at the zoom Explore normally sits at", () => {
    // SITE_ZOOM is 14. If a Zone stopped fitting there, the ordinary map would
    // have the problem this mode was built to contain.
    for (const site of SITES) {
      expect(circleDiameterPx(site.radiusM, site.lat, 14)).toBeLessThan(REFERENCE_SCREEN_PX);
    }
  });
});

describe("nearby mode copy", () => {
  const keys: ExploreKey[] = ["explore.around.toggle", "explore.around.active"];

  it("reads in both languages", () => {
    for (const key of keys) {
      expect(tExplore("en", key).length).toBeGreaterThan(0);
      expect(tExplore("id", key).length).toBeGreaterThan(0);
    }
  });

  it("complies with guardrail W1, which survives the /explore carve-out", () => {
    for (const key of keys) {
      expect(tExplore("en", key)).not.toContain("—");
      expect(tExplore("id", key)).not.toContain("—");
    }
  });
});
