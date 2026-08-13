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

/** Inside the Zone: distance <= radiusM. */
export function isInsideZone(pos: LatLng, site: Site): boolean {
  return haversineMeters(pos, site) <= site.radiusM;
}

/**
 * Outside the Zone with hysteresis: distance > radiusM + EXIT_BUFFER_M.
 * A GPS reading that jitters across the boundary must not re-fire the notice,
 * so entering and leaving use different thresholds.
 */
export const EXIT_BUFFER_M = 100;

export function hasExitedZone(pos: LatLng, site: Site): boolean {
  return haversineMeters(pos, site) > site.radiusM + EXIT_BUFFER_M;
}

/**
 * Under 1 km: rounded to 50 m, "650 m".
 * Under 10 km: one decimal, "4.1 km" (EN) / "4,1 km" (ID).
 * Above that: whole numbers, "18 km".
 * Kilometres only, never miles.
 */
export function formatDistance(meters: number, lang: Lang): string {
  if (meters < 1000) {
    const rounded = Math.round(meters / 50) * 50;
    return `${rounded} m`;
  }
  if (meters < 10_000) {
    const km = meters / 1000;
    const formatted = km.toFixed(1);
    return lang === "id" ? `${formatted.replace(".", ",")} km` : `${formatted} km`;
  }
  return `${Math.round(meters / 1000)} km`;
}