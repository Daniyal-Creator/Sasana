import { describe, expect, it } from "vitest";
import type { Site } from "@/data/sites";
import {
  APPROACH_BUFFER_M,
  EXIT_BUFFER_M,
  approachRadiusM,
  formatDistance,
  hasEnteredApproach,
  hasExitedApproach,
  haversineMeters,
  isInsideZone,
} from "@/lib/geo";

// Fixtures rather than the real SITES: these tests are about the geometry, and
// they should not start failing because someone edits a temple's radius. The
// empty `customs` array keeps them intact when ticket 04 adds a field to Custom.
function siteWithRadius(radiusM: number): Site {
  return {
    id: "test-site",
    name: "Test Site",
    region: "Test, Bali",
    areaLabel: { en: "Test area", id: "Kawasan uji" },
    lat: -8.6212,
    lng: 115.0868,
    radiusM,
    customs: [],
    source: "test",
    odalan: [],
  };
}

const EARTH_RADIUS_M = 6_371_000;

/**
 * A position exactly `metres` due north of a Site. Moving along a meridian
 * makes the haversine distance exactly `metres` under the same earth radius the
 * implementation uses, so the thresholds can be probed to the metre.
 */
function northOf(site: Site, metres: number) {
  return {
    lat: site.lat + (metres / EARTH_RADIUS_M) * (180 / Math.PI),
    lng: site.lng,
  };
}

describe("haversineMeters", () => {
  it("measures one degree of latitude", () => {
    // With R = 6_371_000 m, one degree of latitude is R * pi / 180.
    expect(haversineMeters({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(111_194.9, 0);
  });

  it("measures a real distance between two Balinese temples", () => {
    // Tanah Lot to Uluwatu, about 23 km apart.
    const distance = haversineMeters(
      { lat: -8.6212, lng: 115.0868 },
      { lat: -8.8291, lng: 115.0849 },
    );
    expect(distance).toBeGreaterThan(22_500);
    expect(distance).toBeLessThan(23_500);
  });

  it("is zero for the same point", () => {
    expect(haversineMeters({ lat: -8.6212, lng: 115.0868 }, { lat: -8.6212, lng: 115.0868 })).toBe(
      0,
    );
  });
});

describe("approachRadiusM", () => {
  it("is the Zone radius plus one global buffer, not a per-Site number", () => {
    expect(approachRadiusM(siteWithRadius(400))).toBe(400 + APPROACH_BUFFER_M);
    expect(approachRadiusM(siteWithRadius(250))).toBe(250 + APPROACH_BUFFER_M);
  });
});

describe("hasEnteredApproach", () => {
  const site = siteWithRadius(400); // Approach at 800 m.

  it("is true just inside the Approach", () => {
    expect(hasEnteredApproach(northOf(site, 799), 0, site)).toBe(true);
  });

  it("puts the line at 800 m, to within half a metre either side", () => {
    // Not asserted at exactly 800 m: `northOf` is accurate to about 1e-10 m, so
    // a bit-exact boundary assertion would be testing floating point rather
    // than the rule. Half a metre pins the line far tighter than any GPS fix.
    expect(hasEnteredApproach(northOf(site, 799.5), 0, site)).toBe(true);
    expect(hasEnteredApproach(northOf(site, 800.5), 0, site)).toBe(false);
  });

  it("is false just outside", () => {
    expect(hasEnteredApproach(northOf(site, 801), 0, site)).toBe(false);
  });

  it("stays false while the fix is too vague to be sure, even well inside", () => {
    // 700 m away with 200 m of uncertainty: the visitor is probably inside the
    // Approach, but "probably" is not enough to raise a notice about a sacred
    // place, so nothing fires until the fix improves.
    expect(hasEnteredApproach(northOf(site, 700), 200, site)).toBe(false);
  });

  it("fires once the same position reports a tighter fix", () => {
    expect(hasEnteredApproach(northOf(site, 700), 50, site)).toBe(true);
  });
});

describe("hasExitedApproach", () => {
  const site = siteWithRadius(400); // Approach 800 m, exit line 900 m.

  it("is true once the reading clears the Approach and its hysteresis", () => {
    expect(hasExitedApproach(northOf(site, 901), 0, site)).toBe(true);
  });

  it("puts the exit line at 900 m, to within half a metre either side", () => {
    expect(hasExitedApproach(northOf(site, 899.5), 0, site)).toBe(false);
    expect(hasExitedApproach(northOf(site, 900.5), 0, site)).toBe(true);
  });

  it("stays false while the fix is too vague to be sure", () => {
    // 950 m away, but the uncertainty circle still reaches back inside.
    expect(hasExitedApproach(northOf(site, 950), 100, site)).toBe(false);
  });
});

describe("the hysteresis band", () => {
  const site = siteWithRadius(400);

  it("counts as neither entering nor leaving between the Approach and the exit line", () => {
    // A GPS reading that jitters across 800 m must not re-fire the notice for a
    // Site the visitor never really left.
    const drifting = northOf(site, 850);
    expect(hasEnteredApproach(drifting, 0, site)).toBe(false);
    expect(hasExitedApproach(drifting, 0, site)).toBe(false);
  });

  it("puts the exit line one EXIT_BUFFER_M beyond the Approach", () => {
    expect(approachRadiusM(site) + EXIT_BUFFER_M).toBe(900);
  });
});

describe("isInsideZone", () => {
  const site = siteWithRadius(400);

  it("is true inside the radius, and puts the line at 400 m", () => {
    expect(isInsideZone(northOf(site, 399), site)).toBe(true);
    expect(isInsideZone(northOf(site, 399.5), site)).toBe(true);
    expect(isInsideZone(northOf(site, 400.5), site)).toBe(false);
  });

  it("is false outside it", () => {
    expect(isInsideZone(northOf(site, 401), site)).toBe(false);
  });

  it("does not stretch to the Approach: the Zone is where Customs apply, not where the notice fires", () => {
    const betweenZoneAndApproach = northOf(site, 600);
    expect(isInsideZone(betweenZoneAndApproach, site)).toBe(false);
    expect(hasEnteredApproach(betweenZoneAndApproach, 0, site)).toBe(true);
  });
});

describe("formatDistance", () => {
  it("rounds under a kilometre to 50 m", () => {
    expect(formatDistance(400, "en")).toBe("400 m");
    expect(formatDistance(637, "en")).toBe("650 m");
  });

  it("prints a whole kilometre without a decimal", () => {
    // 975 m rounds to 1000 m, which nobody writes as "1000 m".
    expect(formatDistance(975, "en")).toBe("1 km");
    expect(formatDistance(975, "id")).toBe("1 km");
    expect(formatDistance(1000, "en")).toBe("1 km");
  });

  it("uses one decimal under 10 km, with the Indonesian decimal comma", () => {
    expect(formatDistance(4100, "en")).toBe("4.1 km");
    expect(formatDistance(4100, "id")).toBe("4,1 km");
  });

  it("uses whole kilometres above 10 km", () => {
    expect(formatDistance(18_000, "en")).toBe("18 km");
    expect(formatDistance(18_000, "id")).toBe("18 km");
  });

  it("never prints miles", () => {
    const samples = [400, 975, 4100, 18_000].map((m) => formatDistance(m, "en"));
    expect(samples.every((s) => s.endsWith(" m") || s.endsWith(" km"))).toBe(true);
  });
});
