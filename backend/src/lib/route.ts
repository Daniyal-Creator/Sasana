// Driving directions from a visitor to an Amenity, read from OSRM.
//
// Proxied rather than called from the browser, for the same shape as
// `lib/places.ts`: the frontend ships as a static export (ADR-0019), so
// anything it holds is public, and this is the one place a User-Agent can be
// kept honest and a cache can later be hung. OSRM's demo server needs no key,
// which is what makes it affordable at a budget of Rp 0 (tech-spec §5).
//
// It is a car route and it is labelled as one. Measured against the live demo
// server, Kuta to Tanah Lot:
//
//   driving: 22817.6 m / 1587 s
//   foot:    22817.6 m / 1587 s
//
// Identical to the decimal. The demo deployment carries the car profile and
// answers every profile name with it, so a route offered as walking would be a
// car route wearing the wrong word. ADR-0021 records what that costs and what
// would fix it.

import { logError, logInfo } from "@/lib/logger";
import { withTimeout } from "@/lib/timeout";
import type { Route, RouteManeuver, RouteStep } from "@shared/contract";

/** Attribution required by the ODbL. The roads are OpenStreetMap's too. */
export const ROUTE_SOURCE = "OpenStreetMap contributors";

const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

const USER_AGENT = "SASANA/1.0 (Bali customs assistant; school project)";

const ROUTE_TIMEOUT_MS = 12_000;

/**
 * How many written steps a visitor reads before the list stops being directions
 * and becomes a wall. A cross-island route returns nearly thirty; the ones that
 * matter are at the start.
 */
const MAX_STEPS = 12;

/**
 * OSRM's maneuver vocabulary, narrowed to what the UI can name in two
 * languages.
 *
 * The modifier decides the wording wherever there is a turn to describe, and
 * the type decides it where there is not: `depart` and `arrive` carry the
 * modifier "straight" and mean nothing of the kind.
 */
const BY_MODIFIER: Record<string, RouteManeuver> = {
  left: "left",
  right: "right",
  "slight left": "slight-left",
  "slight right": "slight-right",
  "sharp left": "sharp-left",
  "sharp right": "sharp-right",
  uturn: "uturn",
  straight: "straight",
};

/** Types that mean something on their own, whatever modifier rides with them. */
const BY_TYPE: Record<string, RouteManeuver> = {
  depart: "depart",
  arrive: "arrive",
  roundabout: "roundabout",
  rotary: "roundabout",
  "roundabout turn": "roundabout",
  merge: "merge",
  fork: "fork",
  "off ramp": "exit",
  "on ramp": "merge",
  "exit roundabout": "exit",
  "exit rotary": "exit",
};

/** The instruction for one OSRM step. Exported for tests. */
export function toManeuver(type: string | undefined, modifier: string | undefined): RouteManeuver {
  const byType = type ? BY_TYPE[type] : undefined;
  if (byType) return byType;

  const byModifier = modifier ? BY_MODIFIER[modifier] : undefined;
  if (byModifier) return byModifier;

  // Anything unrecognised becomes "carry on". A wrong turn invented for a
  // maneuver nobody mapped is worse than an instruction that says nothing.
  return "straight";
}

interface OsrmStep {
  name?: string;
  distance?: number;
  maneuver?: { type?: string; modifier?: string };
}

interface OsrmRoute {
  distance?: number;
  duration?: number;
  geometry?: { coordinates?: [number, number][] };
  legs?: { steps?: OsrmStep[] }[];
}

/**
 * Shapes an OSRM payload into a Route, or null if there is not one in there.
 * Exported for tests.
 */
export function parseOsrm(data: unknown): Route | null {
  const body = data as { code?: string; routes?: OsrmRoute[] };
  if (body?.code !== "Ok" || !Array.isArray(body.routes) || body.routes.length === 0) return null;

  const route = body.routes[0];
  const coordinates = route.geometry?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  if (typeof route.distance !== "number" || typeof route.duration !== "number") return null;

  // GeoJSON is [lng, lat]; Leaflet wants [lat, lng]. Getting this backwards
  // draws a line through the Indian Ocean, which is at least obvious.
  const points = coordinates
    .filter(
      (pair): pair is [number, number] =>
        Array.isArray(pair) &&
        Number.isFinite(pair[0]) &&
        Number.isFinite(pair[1]),
    )
    .map(([lng, lat]): [number, number] => [lat, lng]);
  if (points.length < 2) return null;

  const steps: RouteStep[] = (route.legs?.[0]?.steps ?? [])
    .map((step) => ({
      maneuver: toManeuver(step.maneuver?.type, step.maneuver?.modifier),
      road: step.name?.trim() ?? "",
      distanceM: Math.round(typeof step.distance === "number" ? step.distance : 0),
    }))
    .slice(0, MAX_STEPS);

  return {
    distanceM: Math.round(route.distance),
    durationS: Math.round(route.duration),
    points,
    steps,
    profile: "driving",
  };
}

export interface RoutePoint {
  lat: number;
  lng: number;
}

/**
 * The driving route between two points, or null.
 *
 * Null rather than a throw, like `findNearbyPlaces`: the demo server is free,
 * volunteer-run and explicitly not for production, so it will be unavailable
 * sometimes. What must not happen is an error card. The client draws a straight
 * line and says plainly that it is one, which is less than a route and is at
 * least true.
 */
export async function findRoute(from: RoutePoint, to: RoutePoint): Promise<Route | null> {
  const started = Date.now();
  const path = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const query = new URLSearchParams({
    overview: "simplified",
    geometries: "geojson",
    steps: "true",
  });

  try {
    const res = await withTimeout(
      fetch(`${OSRM_URL}/${path}?${query}`, { headers: { "User-Agent": USER_AGENT } }),
      ROUTE_TIMEOUT_MS,
      "route",
    );
    if (!res.ok) throw new Error(`osrm ${res.status}`);

    const route = parseOsrm(await res.json());
    logInfo({
      route: "route",
      event: route ? "osrm_ok" : "osrm_no_route",
      durationMs: Date.now() - started,
      distanceM: route?.distanceM,
      steps: route?.steps.length,
    });
    return route;
  } catch (err) {
    logError({
      route: "route",
      event: "osrm_fail",
      durationMs: Date.now() - started,
      err: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}
