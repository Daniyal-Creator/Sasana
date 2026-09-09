/**
 * The mark for an Amenity: a plain map pin, and plain on purpose.
 *
 * A Site is marked with a meru, the tiered roof of a shrine, because the mark
 * has to say "sacred place". An Amenity is a guest house or a warung and says
 * nothing of the kind, so it gets the most ordinary pin there is.
 *
 * The two must not be told apart by colour alone (guardrail C6, which survives
 * the /explore carve-out). They differ three ways: this glyph against the meru,
 * a square badge against a round one, and only then the accent against the
 * primary. Somebody who cannot separate gold from blue still sees a different
 * shape holding a different mark.
 */
const PIN_OUTLINE =
  "M12 21.5c-.3 0-.6-.1-.8-.3C9.4 19.6 4.5 14.9 4.5 10a7.5 7.5 0 0 1 15 0c0 4.9-4.9 9.6-6.7 11.2-.2.2-.5.3-.8.3Z";

/** Markup for Leaflet, which takes a string rather than React elements. */
export function amenityPinMarkup(size: number): string {
  return `
<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false">
  <path d="${PIN_OUTLINE}" />
  <circle cx="12" cy="10" r="2.6" fill="#FFFDF9" />
</svg>`;
}
