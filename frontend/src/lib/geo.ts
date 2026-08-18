import type { Lang } from "@/lib/i18n";
import type { Site } from "@/data/sites";

export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_M = 6_371_000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance in metres. Earth radius 6_371_000 m. */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** The closest Site to a position, with its distance. */
export function nearestSite(pos: LatLng, sites: Site[]): { site: Site; distanceM: number } {
  let best = sites[0];
  let bestDistance = Infinity;
  for (const site of sites) {
    const distanceM = haversineMeters(pos, site);
    if (distanceM < bestDistance) {
      bestDistance = distanceM;
      best = site;
    }
  }
  return { site: best, distanceM: bestDistance };
}

/**
 * Inside the Zone: where a Site's Customs apply.
 *
 * This does NOT raise the notice, and must not be reconnected to it without
 * revisiting ADR-0005. A visitor inside the Zone has already arrived, and
 * telling them the dress code at that point is too late to act on. The notice
 * belongs to the Approach below.
 */
export function isInsideZone(pos: LatLng, site: Site): boolean {
  return haversineMeters(pos, site) <= site.radiusM;
}

/**
 * The Approach: the wider circle around a Site whose crossing raises the
 * notice, roughly five minutes on foot outside the Zone (ADR-0005).
 *
 * One global constant rather than a per-Site field. Nothing available to us
 * justifies why one Site would warn earlier than another, so a per-Site number
 * would be a guess wearing the costume of data.
 */
export const APPROACH_BUFFER_M = 400;

export function approachRadiusM(site: Site): number {
  return site.radiusM + APPROACH_BUFFER_M;
}

/**
 * Leaving uses a wider line than entering, so a reading that jitters across the
 * boundary cannot re-fire the notice for a Site the visitor never really left.
 */
export const EXIT_BUFFER_M = 100;

/**
 * Entering is claimed only when the fix is good enough to be sure of it: the
 * whole uncertainty circle has to sit inside the Approach. A phone in a street
 * routinely reports 300 m to 1500 m of uncertainty against Zones of 250 m to
 * 500 m, and firing the notice at the wrong Site is the specific harm this
 * product exists to prevent.
 */
export function hasEnteredApproach(pos: LatLng, accuracyM: number, site: Site): boolean {
  return haversineMeters(pos, site) + accuracyM <= approachRadiusM(site);
}

/**
 * Leaving demands the same confidence, which is why the two are asymmetric: the
 * whole uncertainty circle has to sit outside the Approach plus its hysteresis.
 * The notice therefore arrives late and clears late. That is the correct
 * direction of error — customs that no longer apply cost a visitor nothing,
 * customs missed while they apply cost them the thing we are here to prevent.
 */
export function hasExitedApproach(pos: LatLng, accuracyM: number, site: Site): boolean {
  return haversineMeters(pos, site) - accuracyM > approachRadiusM(site) + EXIT_BUFFER_M;
}

/**
 * @deprecated Superseded by `hasExitedApproach`. Kept only because
 * `app/explore/page.tsx` still calls it, and that file belongs to ticket 06;
 * deleting it here would leave `main` failing typecheck between the two merges.
 * Ticket 06 removes the call and this function together.
 */
export function hasExitedZone(pos: LatLng, site: Site): boolean {
  return haversineMeters(pos, site) > site.radiusM + EXIT_BUFFER_M;
}

/**
 * Under 1 km: rounded to 50 m, "650 m".
 * Under 10 km: one decimal, "4.1 km" (EN) / "4,1 km" (ID).
 * Above that: whole numbers, "18 km".
 * Kilometres only, never miles.
 *
 * The 1 km boundary is tested AFTER rounding to 50 m, not before. Testing it
 * first printed 975 m as "1000 m", a distance no one writes.
 */
export function formatDistance(meters: number, lang: Lang): string {
  const roundedTo50 = Math.round(meters / 50) * 50;
  if (roundedTo50 < 1000) {
    return `${roundedTo50} m`;
  }
  if (meters < 10_000) {
    const km = meters / 1000;
    // A value that lands on a whole kilometre prints without the decimal, so
    // 975 m reads "1 km" rather than "1.0 km".
    const formatted = km.toFixed(1).replace(/\.0$/, "");
    return lang === "id" ? `${formatted.replace(".", ",")} km` : `${formatted} km`;
  }
  return `${Math.round(meters / 1000)} km`;
}
