import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchRoute, formatDuration } from "@/lib/route";
import { tExplore, type ExploreKey } from "@/lib/i18n.explore";
import type { Route, RouteManeuver } from "@shared/contract";

const TANAH_LOT = { lat: -8.6212, lng: 115.0868 };
const UBUD = { lat: -8.5202, lng: 115.2551 };

const ROUTE: Route = {
  distanceM: 32455,
  durationS: 2205,
  points: [
    [-8.6212, 115.0868],
    [-8.58, 115.15],
    [-8.5202, 115.2551],
  ],
  steps: [{ maneuver: "depart", road: "", distanceM: 2626 }],
  profile: "driving",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("fetchRoute", () => {
  it("passes the route through when the server has one", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ route: ROUTE, source: "OpenStreetMap contributors" }),
    );

    const outcome = await fetchRoute(TANAH_LOT, UBUD);
    expect(outcome.route?.distanceM).toBe(32455);
  });

  it("sends both points as numbers the server can read back", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ route: ROUTE, source: "x" }));

    await fetchRoute(TANAH_LOT, UBUD);

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("fromLat=-8.6212");
    expect(url).toContain("fromLng=115.0868");
    expect(url).toContain("toLat=-8.5202");
    expect(url).toContain("toLng=115.2551");
  });

  // From where the visitor stands, a router with no answer, a server that is
  // down, and a body that is not what it claims are the same thing: no route.
  it.each([
    ["the server has no route", async () => jsonResponse({ route: null, source: "x" })],
    ["the server errors", async () => jsonResponse({ error: "boom" }, 500)],
    ["the body is not what it claims", async () => jsonResponse({ route: { points: "nope" } })],
    ["a route arrives with one point", async () => jsonResponse({ route: { ...ROUTE, points: [[-8.6, 115.1]] } })],
  ])("falls back to a straight line when %s", async (_label, respond) => {
    vi.spyOn(globalThis, "fetch").mockImplementation(respond as never);

    const outcome = await fetchRoute(TANAH_LOT, UBUD);
    expect(outcome.route).toBeNull();
    // Tanah Lot to Ubud is about 20 km direct and about 32 km by road, which is
    // the gap the straight-line label exists to stop anybody walking into.
    expect(outcome.straightM).toBeGreaterThan(18_000);
    expect(outcome.straightM).toBeLessThan(22_000);
  });

  it("never throws when the network is down", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ECONNREFUSED"));
    await expect(fetchRoute(TANAH_LOT, UBUD)).resolves.toMatchObject({ route: null });
  });

  it("measures the straight line even when a route is found", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ route: ROUTE, source: "x" }));
    const outcome = await fetchRoute(TANAH_LOT, UBUD);
    expect(outcome.straightM).toBeGreaterThan(0);
  });
});

describe("formatDuration", () => {
  it.each([
    [30, "en", "1 min"],
    [90, "en", "2 min"],
    [2205, "en", "37 min"],
    [3600, "en", "1 hr"],
    [5400, "en", "1 hr 30 min"],
  ] as const)("reads %s seconds as %s in %s", (seconds, lang, expected) => {
    expect(formatDuration(seconds, lang)).toBe(expected);
  });

  it.each([
    [2205, "37 menit"],
    [3600, "1 jam"],
    [5400, "1 jam 30 menit"],
  ] as const)("reads %s seconds in Indonesian", (seconds, expected) => {
    expect(formatDuration(seconds, "id")).toBe(expected);
  });

  // The router models a car on empty roads. Seconds would be precision the
  // number has not earned, and "0 min" would be a claim about arriving now.
  it("never says less than a minute", () => {
    expect(formatDuration(1, "en")).toBe("1 min");
    expect(formatDuration(0, "id")).toBe("1 menit");
  });
});

describe("every maneuver has words", () => {
  /**
   * Exhaustive by construction: adding a maneuver to the contract without
   * adding it here fails to compile. That matters because the card looks its
   * key up by string with a cast, which is exactly where a missing translation
   * would otherwise survive the type checker and reach a visitor as a blank.
   */
  const ALL: Record<RouteManeuver, true> = {
    depart: true,
    arrive: true,
    straight: true,
    left: true,
    right: true,
    "slight-left": true,
    "slight-right": true,
    "sharp-left": true,
    "sharp-right": true,
    uturn: true,
    roundabout: true,
    merge: true,
    fork: true,
    exit: true,
  };

  it.each(Object.keys(ALL))("names %s in both languages", (maneuver) => {
    const key = `explore.route.m.${maneuver}` as ExploreKey;
    expect(tExplore("en", key)?.length).toBeGreaterThan(0);
    expect(tExplore("id", key)?.length).toBeGreaterThan(0);
  });
});

describe("the straight-line wording", () => {
  // The label is the feature. A line across Bali crosses rice terraces and
  // ravines, and without the sentence it is a lie about how far away something
  // is. If a future edit shortens it into "{distance} away", this fails.
  it.each(["en", "id"] as const)("says it is not a road route, in %s", (lang) => {
    const text = tExplore(lang, "explore.route.straight", { distance: "20 km" });
    expect(text).toContain("20 km");
    expect(text.toLowerCase()).toMatch(lang === "id" ? /garis lurus/ : /straight/);
    expect(text.toLowerCase()).toMatch(lang === "id" ? /bukan rute jalan/ : /not a road/);
  });

  // "Route" alone would quietly offer a car route to somebody on foot: the
  // deployed router carries the car profile and answers every profile with it.
  it.each(["en", "id"] as const)("names the route as driving, in %s", (lang) => {
    const label = tExplore(lang, "explore.route.go").toLowerCase();
    expect(label).toMatch(lang === "id" ? /berkendara/ : /driving/);
  });
});
