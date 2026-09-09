// The one Amenity a visitor is currently headed for, carried from the
// Assistant to the map.
//
// Not the assistant handoff, which is read once and cleared because it carries
// a single question across one navigation. A destination outlives that: a
// visitor picks a guest house out of an answer, looks at where it is, goes back
// to ask something else, and comes back to the map still meaning to go there.
// So it is stored the way the active Site is, and cleared only when they say so.
//
// One at a time, deliberately. Five pins competing with the basemap's own
// labels is the crowding that "Lihat sekitar" exists to avoid, and a route in
// ticket 04 can only lead to one place anyway.

import type { Amenity } from "@shared/contract";

export const AMENITY_STORAGE_KEY = "sasana.amenity_destination";

/** Reads the chosen Amenity. Null during SSR, or when storage is unavailable. */
export function readAmenityDestination(): Amenity | null {
  if (typeof window === "undefined" || !window.sessionStorage) return null;
  try {
    const stored = window.sessionStorage.getItem(AMENITY_STORAGE_KEY);
    if (!stored) return null;

    // Storage can hold anything an older version wrote. A shape that no longer
    // matches is treated as no destination rather than drawn at NaN, NaN.
    const parsed = JSON.parse(stored) as Partial<Amenity>;
    if (
      typeof parsed?.name !== "string" ||
      typeof parsed?.kind !== "string" ||
      typeof parsed?.lat !== "number" ||
      typeof parsed?.lng !== "number" ||
      !Number.isFinite(parsed.lat) ||
      !Number.isFinite(parsed.lng)
    ) {
      return null;
    }

    return {
      name: parsed.name,
      kind: parsed.kind,
      distanceM: typeof parsed.distanceM === "number" ? parsed.distanceM : 0,
      lat: parsed.lat,
      lng: parsed.lng,
    };
  } catch {
    // Corrupted JSON, quota, or a browser refusing storage in private mode.
    return null;
  }
}

/** Records the chosen Amenity, or clears it when passed null. */
export function writeAmenityDestination(amenity: Amenity | null): void {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    if (amenity) {
      window.sessionStorage.setItem(AMENITY_STORAGE_KEY, JSON.stringify(amenity));
    } else {
      window.sessionStorage.removeItem(AMENITY_STORAGE_KEY);
    }
  } catch {
    // Losing it costs the visitor a pin they can ask for again, nothing more.
  }
}
