// "Lihat sekitar": the one zoom where the basemap answers "what is around
// here", and the measurement that says it cannot share a screen with the Zone.
//
// OpenStreetMap Standard draws POI icons from about z16 but only names them at
// z17. Measured on the Kuta tiles: z16 shows a bare icon, z17 shows "Sheraton
// Bali Kuta Resort" beside it. A visitor cannot use an icon they cannot read,
// so the mode is worth nothing below 17.
//
// The cost lands at exactly the same zoom. `circleDiameterPx` below is how that
// cost was arrived at, and `__tests__/nearby.test.ts` keeps it honest: if
// anybody lowers NEARBY_ZOOM to where a Zone would fit on screen again, the
// reason for hiding Zones goes with it and the test says so.

/** Where POI names appear on OpenStreetMap Standard tiles. Measured, not guessed. */
export const NEARBY_ZOOM = 17;

/**
 * The screen this app is laid out for, in CSS pixels (guardrails §6 L5).
 * Narrower than most phones on purpose: what fits here fits everywhere.
 */
export const REFERENCE_SCREEN_PX = 375;

/** Web Mercator ground resolution at a latitude and zoom. */
export function metresPerPixel(lat: number, zoom: number): number {
  return (156_543.033_92 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;
}

/** How wide a circle of `radiusM` is drawn, in CSS pixels. */
export function circleDiameterPx(radiusM: number, lat: number, zoom: number): number {
  return (2 * radiusM) / metresPerPixel(lat, zoom);
}
