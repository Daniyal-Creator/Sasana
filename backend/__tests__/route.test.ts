import { beforeEach, describe, expect, it, vi } from "vitest";
import { findRoute, parseOsrm, toManeuver } from "@/lib/route";
import { GET } from "@/routes/route";

const TANAH_LOT = { lat: -8.6212, lng: 115.0868 };
const UBUD = { lat: -8.5202, lng: 115.2551 };

/** An OSRM payload, shaped the way the live demo server really answers. */
function osrm(overrides: Record<string, unknown> = {}) {
  return {
    code: "Ok",
    routes: [
      {
        distance: 32454.9,
        duration: 2204.5,
        geometry: {
          type: "LineString",
          // [lng, lat], which is what GeoJSON means and Leaflet does not.
          coordinates: [
            [115.0868, -8.6212],
            [115.15, -8.58],
            [115.2551, -8.5202],
          ],
        },
        legs: [
          {
            steps: [
              { name: "", distance: 2625.5, maneuver: { type: "depart", modifier: "straight" } },
              {
                name: "Jalan Tanah Lot",
                distance: 2532.2,
                maneuver: { type: "new name", modifier: "straight" },
              },
              {
                name: "Jalan Raya Kediri",
                distance: 2120.8,
                maneuver: { type: "end of road", modifier: "left" },
              },
            ],
          },
        ],
        ...overrides,
      },
    ],
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("toManeuver", () => {
  // Departing and arriving both carry the modifier "straight" and mean nothing
  // of the kind, so the type has to win wherever it says something itself.
  it.each([
    ["depart", "straight", "depart"],
    ["arrive", "straight", "arrive"],
    ["roundabout", "left", "roundabout"],
    ["rotary", "right", "roundabout"],
    ["on ramp", "slight right", "merge"],
    ["off ramp", "slight left", "exit"],
  ])("reads type %s as %s", (type, modifier, expected) => {
    expect(toManeuver(type, modifier)).toBe(expected);
  });

  it.each([
    ["turn", "left", "left"],
    ["turn", "sharp right", "sharp-right"],
    ["end of road", "slight left", "slight-left"],
    ["continue", "uturn", "uturn"],
    ["new name", "straight", "straight"],
  ])("otherwise reads the modifier of %s %s as %s", (type, modifier, expected) => {
    expect(toManeuver(type, modifier)).toBe(expected);
  });

  // A turn invented for a maneuver nobody mapped is worse than an instruction
  // that says nothing.
  it.each([
    ["notification", "some new modifier"],
    [undefined, undefined],
    ["", ""],
  ])("falls back to carrying on for %s / %s", (type, modifier) => {
    expect(toManeuver(type, modifier)).toBe("straight");
  });
});

describe("parseOsrm", () => {
  it("turns GeoJSON order into Leaflet order", () => {
    const route = parseOsrm(osrm());
    // Bali is south of the equator and east of Greenwich: latitude negative,
    // longitude positive. Swapped, this line runs through the Indian Ocean.
    expect(route?.points[0]).toEqual([-8.6212, 115.0868]);
    expect(route?.points.at(-1)).toEqual([-8.5202, 115.2551]);
  });

  it("rounds the distance and duration, and names the profile", () => {
    const route = parseOsrm(osrm());
    expect(route?.distanceM).toBe(32455);
    expect(route?.durationS).toBe(2205);
    expect(route?.profile).toBe("driving");
  });

  it("carries the written steps", () => {
    const route = parseOsrm(osrm());
    expect(route?.steps[0]).toEqual({ maneuver: "depart", road: "", distanceM: 2626 });
    expect(route?.steps[2]).toEqual({
      maneuver: "left",
      road: "Jalan Raya Kediri",
      distanceM: 2121,
    });
  });

  // A cross-island route returns nearly thirty steps. Past a dozen the list has
  // stopped being directions and become a wall.
  it("stops the step list before it becomes a wall", () => {
    const many = osrm({
      legs: [
        {
          steps: Array.from({ length: 29 }, () => ({
            name: "Jalan Raya",
            distance: 100,
            maneuver: { type: "turn", modifier: "left" },
          })),
        },
      ],
    });
    expect(parseOsrm(many)?.steps).toHaveLength(12);
  });

  it.each([
    ["a code that is not Ok", { code: "NoRoute", routes: [] }],
    ["no routes at all", { code: "Ok", routes: [] }],
    ["null", null],
    ["a string", "nope"],
  ])("returns null for %s", (_label, data) => {
    expect(parseOsrm(data)).toBeNull();
  });

  it("returns null when there is no line to draw", () => {
    expect(parseOsrm(osrm({ geometry: { coordinates: [[115.0868, -8.6212]] } }))).toBeNull();
  });

  it("returns null when the distance is missing", () => {
    expect(parseOsrm(osrm({ distance: undefined }))).toBeNull();
  });
});

describe("findRoute", () => {
  it("asks OSRM in longitude-first order, with the steps and the line", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify(osrm()), { status: 200 }));

    await findRoute(TANAH_LOT, UBUD);

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("115.0868,-8.6212;115.2551,-8.5202");
    expect(url).toContain("steps=true");
    expect(url).toContain("geometries=geojson");
    // Simplified geometry drops the line to a point per kilometre, which draws
    // a route that cuts across blocks rather than following the road.
    expect(url).toContain("overview=full");
    // Only the car profile is deployed on the demo server, so asking for
    // anything else would be asking for a car route under another name.
    expect(url).toContain("/route/v1/driving/");
    const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers["User-Agent"]).toContain("SASANA");
  });

  // The demo server is free, volunteer-run and explicitly not for production.
  // It will be unavailable sometimes, and that must not become an error card.
  it("returns null rather than throwing when OSRM fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("busy", { status: 429 }));
    await expect(findRoute(TANAH_LOT, UBUD)).resolves.toBeNull();
  });

  it("returns null rather than throwing when the network is down", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ECONNREFUSED"));
    await expect(findRoute(TANAH_LOT, UBUD)).resolves.toBeNull();
  });
});

describe("GET /api/route", () => {
  const ask = (query: string) => GET(new Request(`http://localhost/api/route?${query}`));

  const between = (from: typeof TANAH_LOT, to: typeof UBUD) =>
    `fromLat=${from.lat}&fromLng=${from.lng}&toLat=${to.lat}&toLng=${to.lng}`;

  it("answers with the route and its attribution", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(osrm()), { status: 200 }),
    );

    const res = await ask(between(TANAH_LOT, UBUD));
    const body = (await res.json()) as { route: { distanceM: number } | null; source: string };

    expect(res.status).toBe(200);
    expect(body.route?.distanceM).toBe(32455);
    // ODbL. The roads are OpenStreetMap's, so the credit travels with them.
    expect(body.source).toBe("OpenStreetMap contributors");
  });

  // The client has a straight line to fall back to and a label that says so.
  // An error status would send it down a path meant for something being broken.
  it("answers 200 with no route when OSRM is down", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ECONNREFUSED"));

    const res = await ask(between(TANAH_LOT, UBUD));
    const body = (await res.json()) as { route: null; source: string };

    expect(res.status).toBe(200);
    expect(body.route).toBeNull();
  });

  it.each([
    ["a missing parameter", "fromLat=-8.6&fromLng=115.1&toLat=-8.5"],
    ["a parameter that is not a number", "fromLat=here&fromLng=115.1&toLat=-8.5&toLng=115.2"],
    ["an empty parameter", "fromLat=&fromLng=115.1&toLat=-8.5&toLng=115.2"],
  ])("refuses %s", async (_label, query) => {
    expect((await ask(query)).status).toBe(400);
  });

  // Not a security boundary - the coordinates are public either way - but a
  // request for the other side of the world is a bug or somebody poking, and
  // neither is worth a call to a server that asks not to carry production load.
  it("refuses a request that leaves Bali", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const res = await ask("fromLat=-6.2&fromLng=106.8&toLat=-8.52&toLng=115.25");

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
