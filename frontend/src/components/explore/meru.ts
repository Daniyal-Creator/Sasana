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
  "M12 3 L15.6 7 H8.4 Z",
  "M8.9 8.6 H15.1 L17.2 12.3 H6.8 Z",
  "M6.4 13.9 H17.6 L19.8 17.8 H4.2 Z",
] as const;

/** The shrine body under the tiers. A rect rather than a fourth path. */
export const MERU_BASE = { x: 10.4, y: 18.9, width: 3.2, height: 2.6, rx: 0.4 };

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
