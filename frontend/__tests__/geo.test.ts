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
  proximityTo,
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
    description: { en: "Test description", id: "Deskripsi uji" },
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

describe("proximityTo", () => {
  const site = siteWithRadius(400);

  it("reports the Zone from inside the Zone", () => {
    expect(proximityTo(northOf(site, 100), 20, site).state).toBe("zone");
  });

  it("reports the Approach between the two circles", () => {
    expect(proximityTo(northOf(site, 600), 20, site).state).toBe("approach");
  });

  it("reports outside beyond the Approach", () => {
    expect(proximityTo(northOf(site, 900), 20, site).state).toBe("outside");
  });

  // Probed either side of each line rather than exactly on it. `northOf` lands
  // within a rounding error of the metre asked for, and a test that turns on
  // that error would be testing floating point rather than the boundary.
  it("puts each line where the Zone and the Approach put it", () => {
    expect(proximityTo(northOf(site, 399), 20, site).state).toBe("zone");
    expect(proximityTo(northOf(site, 401), 20, site).state).toBe("approach");
    expect(proximityTo(northOf(site, approachRadiusM(site) - 1), 20, site).state).toBe("approach");
    expect(proximityTo(northOf(site, approachRadiusM(site) + 1), 20, site).state).toBe("outside");
  });

  // The notice is accuracy-gated because it interrupts somebody who asked for
  // nothing. This is not: the visitor pressed a button about a Site already on
  // screen, so a poor fix must not silently downgrade them to "outside" - it
  // travels as a number the answer can hedge with instead.
  it("does not let a poor fix change the state", () => {
    const vague = proximityTo(northOf(site, 600), 1500, site);
    expect(vague.state).toBe("approach");
    expect(vague.accuracyM).toBe(1500);
  });

  it("carries the measured distance, not a rounded one", () => {
    expect(proximityTo(northOf(site, 640), 20, site).distanceM).toBeCloseTo(640, 5);
  });
});
