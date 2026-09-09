// Asking the server for directions, and what to do when there are none.
//
// The fallback is the interesting half. OSRM's demo server is free,
// volunteer-run and explicitly not for production, so "no route" is a normal
// outcome rather than a fault. When it happens the map draws the straight line
// between the two points and says, in words, that a straight line is what it
// is.
//
// That label is part of the feature and not decoration. A line drawn between
// two points on Bali crosses rice terraces and ravines, and 4 km of it can be
// 11 km of road. Unlabelled it is a lie about how far away something is; with
// the label it is a true statement about direction and a floor on distance.

import { apiUrl } from "@/lib/api";
import { haversineMeters, type LatLng } from "@/lib/geo";
import type { Lang } from "@/lib/i18n";
import type { Route, RouteResponse } from "@shared/contract";

/**
 * What the card is showing about the route right now.
 *
 * `straight` is a state of its own rather than `ready` with a flag, so nothing
 * that renders a real route can accidentally render the fallback with the same
 * wording. The two say different things and must not share a branch.
 */
export type RouteView =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; route: Route }
  | { status: "straight"; straightM: number };

export interface RouteOutcome {
  /** The road route, or null when the router had none to give. */
  route: Route | null;
  /** Straight-line metres, always measured, shown only when `route` is null. */
  straightM: number;
}

/**
 * Directions from the visitor to a destination.
 *
 * Never throws. Every failure - the server, the router, the network, a body
 * that is not what it claims - lands on the same outcome as "no route found",
 * because from where the visitor stands those are the same thing.
 */
export async function fetchRoute(from: LatLng, to: LatLng): Promise<RouteOutcome> {
  const straightM = Math.round(haversineMeters(from, to));

  const query = new URLSearchParams({
    fromLat: String(from.lat),
    fromLng: String(from.lng),
    toLat: String(to.lat),
    toLng: String(to.lng),
  });

  try {
    const res = await fetch(apiUrl(`/api/route?${query}`));
    if (!res.ok) return { route: null, straightM };

    const body = (await res.json()) as RouteResponse;
    const route = body?.route;

    // A route with fewer than two points cannot be drawn, and a client that
    // trusts the shape of a body it did not write is one bad deploy from a
    // blank map.
    if (!route || !Array.isArray(route.points) || route.points.length < 2) {
      return { route: null, straightM };
    }

    return { route, straightM };
  } catch {
    return { route: null, straightM };
  }
}

/**
 * A duration a visitor reads at a glance, never to the second.
 *
 * The router's estimate is a model of a car on empty roads, so minutes are
 * already more precision than the number deserves and seconds would be a claim
 * nobody can keep.
 */
export function formatDuration(seconds: number, lang: Lang): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return lang === "id" ? `${minutes} menit` : `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hourPart = lang === "id" ? `${hours} jam` : `${hours} hr`;
  if (rest === 0) return hourPart;
  return lang === "id" ? `${hourPart} ${rest} menit` : `${hourPart} ${rest} min`;
}
