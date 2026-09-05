import { describe, expect, it } from "vitest";
import {
  DUMMY_PLACEMENTS,
  DUMMY_THRESHOLD_M,
  NEAREST_DUMMY_ID,
  buildDummySites,
  isDummySite,
} from "@/data/dummy-sites";
import { SITES } from "@/data/sites";
import { approachRadiusM, haversineMeters, nearestSite } from "@/lib/geo";
import type { LatLng } from "@/lib/geo";

// Three anchors, chosen for what each one can break.
const JAKARTA: LatLng = { lat: -6.2, lng: 106.8 }; // the realistic case
const LONDON: LatLng = { lat: 51.5, lng: -0.12 }; // where cos(lat) starts to bite
const TROMSO: LatLng = { lat: 69.65, lng: 18.96 }; // where it bites hard

// Longitude runs off the end of its range here: dummy 2 lands past +180. The
// projection is allowed to produce that, but the distances still have to come
// out right, or a visitor in Fiji is told a temple is 1.4 km away when it is
// most of the way around the world.
const DATELINE: LatLng = { lat: -16.5, lng: 179.995 };

const ANCHORS: [string, LatLng][] = [
  ["Jakarta", JAKARTA],
  ["London", LONDON],
  ["Tromso", TROMSO],
  ["the dateline", DATELINE],
];

describe("buildDummySites: shape", () => {
  const dummies = buildDummySites(JAKARTA);

  it("builds one Site per placement", () => {
    expect(dummies).toHaveLength(DUMMY_PLACEMENTS.length);
  });

  it("gives every dummy a unique id that is not a real Site id", () => {
    const ids = dummies.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(SITES.some((s) => s.id === id)).toBe(false);
    }
  });

  it("carries the marking word inside the name, on every dummy", () => {
    // The name is the only marking that reaches all five surfaces that render
    // one. If this ever stops holding, the map label and the list row go
    // unmarked and nothing else in the codebase notices.
    for (const dummy of dummies) {
      expect(dummy.name).toContain("Dummy");
    }
  });

  it("is recognisable through isDummySite, and a real Site is not", () => {
    for (const dummy of dummies) {
      expect(isDummySite(dummy)).toBe(true);
    }
    for (const site of SITES) {
      expect(isDummySite(site)).toBe(false);
    }
  });

  it("never carries an odalan date", () => {
    // ADR-0004: a ceremony date is never computed or guessed. A dummy has no
    // source to read one from, so it has none.
    for (const dummy of dummies) {
      expect(dummy.odalan).toEqual([]);
    }
  });

  it("does not pass a real citation off as the source of a fictional place", () => {
    for (const dummy of dummies) {
      expect(dummy.source.length).toBeGreaterThan(0);
      expect(dummy.source).not.toMatch(/Circular|Surat Edaran|Gubernur|Governor/i);
    }
  });

  it("writes the source in the language it was asked for", () => {
    expect(buildDummySites(JAKARTA, "id")[0].source).not.toBe(
      buildDummySites(JAKARTA, "en")[0].source,
    );
  });

  it("keeps coordinates independent of language", () => {
    const id = buildDummySites(JAKARTA, "id");
    const en = buildDummySites(JAKARTA, "en");
    // page.tsx rebuilds these when the language changes. If the coordinates
    // moved with it, the five temples would jump across the map on a language
    // switch, and an already-announced Approach would re-fire.
    id.forEach((site, i) => {
      expect(site.lat).toBe(en[i].lat);
      expect(site.lng).toBe(en[i].lng);
    });
  });
});

describe("buildDummySites: geometry", () => {
  for (const [label, anchor] of ANCHORS) {
    describe(`anchored at ${label}`, () => {
      const dummies = buildDummySites(anchor);

      it("places each dummy at the distance it claims, within 1%", () => {
        // The cos(lat) correction on longitude is what this is really testing.
        // Without it every eastward component is short, and the error grows
        // with latitude, which is the direction every user of this feature
        // lives in.
        dummies.forEach((dummy, i) => {
          const wanted = DUMMY_PLACEMENTS[i].distanceM;
          const actual = haversineMeters(anchor, dummy);
          expect(Math.abs(actual - wanted) / wanted).toBeLessThan(0.01);
        });
      });

      it("starts every dummy outside its own Approach", () => {
        // The promise this keeps: opening Explore shows a map with five
        // markers on it, not an ApproachSheet covering half the screen. If
        // anyone retunes the distances, this is what tells them they broke it.
        for (const dummy of dummies) {
          expect(haversineMeters(anchor, dummy)).toBeGreaterThan(approachRadiusM(dummy));
        }
      });

      it("puts the nearest dummy within a short walk of its Approach", () => {
        // The other half of the same promise. Outside the Approach is useless
        // if reaching it is a bus ride: the walking demo has to stay a walk.
        const nearest = dummies[0];
        const toWalk = haversineMeters(anchor, nearest) - approachRadiusM(nearest);
        expect(toWalk).toBeGreaterThan(0);
        expect(toWalk).toBeLessThan(300);
      });

      it("spreads the dummies around the visitor rather than to one side", () => {
        const lats = dummies.map((d) => d.lat);
        const lngs = dummies.map((d) => d.lng);
        expect(Math.max(...lats)).toBeGreaterThan(anchor.lat);
        expect(Math.min(...lats)).toBeLessThan(anchor.lat);
        expect(Math.max(...lngs)).toBeGreaterThan(anchor.lng);
        expect(Math.min(...lngs)).toBeLessThan(anchor.lng);
      });

      it("agrees with NEAREST_DUMMY_ID about which one is closest", () => {
        // The browse camera is pointed at this id before any dummy exists to
        // measure, so the constant has to keep matching the table. If someone
        // retunes the distances and this drifts, the map opens on a dummy that
        // is not the one the visitor is walking towards.
        const closest = [...dummies].sort(
          (x, y) => haversineMeters(anchor, x) - haversineMeters(anchor, y),
        )[0];
        expect(closest.id).toBe(NEAREST_DUMMY_ID);
      });

      it("is deterministic", () => {
        expect(buildDummySites(anchor)).toEqual(dummies);
      });
    });
  }
});

describe("DUMMY_THRESHOLD_M", () => {
  it("does not fire anywhere in Bali", () => {
    // The rule that protects the actual visitor: a person standing at a real
    // Site, or in the towns between them, must never be handed a temple that
    // does not exist.
    for (const site of SITES) {
      expect(nearestSite(site, SITES).distanceM).toBeLessThan(DUMMY_THRESHOLD_M);
    }
    const denpasar: LatLng = { lat: -8.65, lng: 115.216 };
    const ubud: LatLng = { lat: -8.507, lng: 115.263 };
    for (const town of [denpasar, ubud]) {
      expect(nearestSite(town, SITES).distanceM).toBeLessThan(DUMMY_THRESHOLD_M);
    }
  });

  it("fires outside Bali", () => {
    for (const [, anchor] of ANCHORS) {
      expect(nearestSite(anchor, SITES).distanceM).toBeGreaterThan(DUMMY_THRESHOLD_M);
    }
  });
});
