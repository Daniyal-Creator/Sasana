/**
 * A meru: the tiered roof that sits over a Balinese shrine.
 *
 * One source of truth for the mark, because it is drawn twice in two different
 * ways. Leaflet's divIcon takes a string of markup, React takes elements, and
 * two hand-copied sets of path data drift the moment one of them is nudged.
 *
 * It stays a pictogram at the weight of the Lucide set, never a picture of a
 * temple. Guardrail I4 forbids synthetic depictions of Balinese sacred
 * practice, and a mark that says "sacred place" is not one.
 */
export const MERU_PATHS = [
  // Left tower with Balinese winged steps
  "M10.8 2.5H9.4L8.2 4.8H7.2L7.8 6.5H6.5L5.4 9H4.4L5.2 11.2H3.8L2.6 14H4L3 17.5H1.8V19.5H10.8V2.5Z",
  // Right tower (mirrored)
  "M13.2 2.5H14.6L15.8 4.8H16.8L16.2 6.5H17.5L18.6 9H19.6L18.8 11.2H20.2L21.4 14H20L21 17.5H22.2V19.5H13.2V2.5Z",
] as const;

/** The stepped plinth foundation under the gate towers. */
export const MERU_BASE = { x: 1.5, y: 20.2, width: 21, height: 1.6, rx: 0.4 };

/** The same mark as markup, for Leaflet, which cannot take React elements. */
export function meruMarkup(size: number): string {
  const paths = MERU_PATHS.map((d) => `<path d="${d}" />`).join("");
  const { x, y, width, height, rx } = MERU_BASE;
  return `
<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false">
  ${paths}
  <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" />
</svg>`;
}
