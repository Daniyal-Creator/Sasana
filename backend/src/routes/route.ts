import { invalidInput } from "@/lib/errors";
import { handleApiError } from "@/lib/http";
import { logInfo } from "@/lib/logger";
import { ROUTE_SOURCE, findRoute } from "@/lib/route";
import type { RouteResponse } from "@shared/contract";

// Directions from where a visitor is to the Amenity they chose.
//
// A GET with four numbers, because it asks a question rather than changing
// anything, and because a URL is the shape a cache understands if this ever
// needs one (`.scratch/amenity/spec.md`).
//
// Nothing here spends Gemini quota and nothing here is sensitive: the
// coordinates are a point on a public map and a position the visitor asked us
// to route from, held for exactly one request.

/**
 * Bali, generously. Not a security boundary - the coordinates are public
 * either way - but a route request for the other side of the world is either a
 * bug or somebody poking, and neither is worth a call to a volunteer server
 * that asks not to be used for production traffic.
 */
const BOUNDS = { minLat: -9.2, maxLat: -7.8, minLng: 114.2, maxLng: 116.0 };

function coordinate(params: URLSearchParams, name: string): number {
  const raw = params.get(name);
  const value = Number(raw);
  if (raw === null || raw.trim() === "" || !Number.isFinite(value)) {
    throw invalidInput(`${name} must be a number`);
  }
  return value;
}

function inBali(lat: number, lng: number): boolean {
  return (
    lat >= BOUNDS.minLat && lat <= BOUNDS.maxLat && lng >= BOUNDS.minLng && lng <= BOUNDS.maxLng
  );
}

export async function GET(req: Request): Promise<Response> {
  const started = Date.now();
  try {
    const params = new URL(req.url).searchParams;
    const fromLat = coordinate(params, "fromLat");
    const fromLng = coordinate(params, "fromLng");
    const toLat = coordinate(params, "toLat");
    const toLng = coordinate(params, "toLng");

    if (!inBali(fromLat, fromLng) || !inBali(toLat, toLng)) {
      throw invalidInput("Both points must be in Bali");
    }

    const route = await findRoute({ lat: fromLat, lng: fromLng }, { lat: toLat, lng: toLng });

    // A missing route is a 200 with null in it, not an error. The client has a
    // straight line to fall back to and a label that says so, and an error
    // status would push it down a path meant for something being broken.
    const body: RouteResponse = { route, source: ROUTE_SOURCE };

    logInfo({
      route: "route",
      event: "ok",
      durationMs: Date.now() - started,
      found: route !== null,
      distanceM: route?.distanceM,
    });
    return Response.json(body, { status: 200 });
  } catch (err) {
    return handleApiError(err, { route: "route", startedAt: started, lang: "en" });
  }
}
