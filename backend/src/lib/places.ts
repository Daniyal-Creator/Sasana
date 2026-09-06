// Real places near a Site, read from OpenStreetMap at request time.
//
// This exists because the model cannot answer "what is near here". It has no
// map and no network, so asked for a hotel it will produce a name that sounds
// like a Bali hotel - sometimes one that closed years ago, sometimes one that
// never existed. Lifting the refusal would not make it able to answer; it would
// only stop it admitting that it cannot.
//
// So the facts come from the map and the model only writes the sentence. That
// is the same shape as the rest of this app: `rulesByIds` supplies rule text
// the model may not invent, and this supplies place names on the same terms.
//
// OpenStreetMap is chosen over Google Places for a reason that is not
// principle: it needs no API key and no billing account, and the project
// budget is Rp 0 (tech-spec §5).

import { logError, logInfo } from "@/lib/logger";
import { withTimeout } from "@/lib/timeout";

/** Attribution required by the ODbL. Shown to the visitor, never optional. */
export const PLACES_SOURCE = "OpenStreetMap contributors";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// Overpass is a shared free service and asks callers to identify themselves so
// a misbehaving client can be contacted rather than simply blocked.
const USER_AGENT = "SASANA/1.0 (Bali customs assistant; school project)";

const OVERPASS_TIMEOUT_MS = 12_000;

export type PlaceCategory = "lodging" | "food";

export interface Place {
  name: string;
  /** The OSM tag value, e.g. `guest_house` - shown so "hotel" is not implied. */
  kind: string;
  distanceM: number;
}

// OSM tags per category. Kept narrow on purpose: `tourism=attraction` and
// friends would flood a temple search with the temple itself and every stall
// around it.
const TAGS: Record<PlaceCategory, { key: string; values: string[] }> = {
  lodging: {
    key: "tourism",
    values: ["hotel", "guest_house", "hostel", "motel", "apartment", "chalet"],
  },
  food: {
    key: "amenity",
    values: ["restaurant", "cafe", "fast_food", "food_court"],
  },
};

// Detection runs before Gemini is called, so a question that needs the map is
// recognised for the cost of a regex rather than a round trip. Function calling
// would be tidier and would cost an extra request every time.
const LODGING_WORDS =
  /\b(penginapan|menginap|hotel|losmen|homestay|home stay|guest\s?house|hostel|villa|vila|akomodasi|nginep|lodging|accommodation|place to stay|where to stay|stay near)\b/i;
const FOOD_WORDS =
  /\b(tempat makan|rumah makan|restoran|restaurant|warung|kuliner|makan siang|makan malam|sarapan|cafe|kafe|coffee|food|eat|dine|dining)\b/i;

/**
 * Which map lookup, if any, this question is asking for.
 *
 * Lodging wins a tie: "penginapan dan tempat makan" is one question, one
 * Overpass call, and the first noun is the one the visitor led with.
 */
export function detectPlaceQuery(message: string): PlaceCategory | null {
  if (LODGING_WORDS.test(message)) return "lodging";
  if (FOOD_WORDS.test(message)) return "food";
  return null;
}

export interface NearbyOptions {
  radiusM?: number;
  limit?: number;
}

interface OverpassElement {
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function buildQuery(lat: number, lng: number, category: PlaceCategory, radiusM: number): string {
  const { key, values } = TAGS[category];
  const filter = `["${key}"~"^(${values.join("|")})$"]["name"]`;
  const around = `(around:${radiusM},${lat},${lng})`;
  // Nodes and ways both: a small guest house is often a single point, a resort
  // is usually a building outline. `out center` gives a way one coordinate.
  return `[out:json][timeout:20];(node${filter}${around};way${filter}${around};);out center ${Math.max(radiusM / 10, 60)};`;
}

/** Metres between two points on the earth's surface. */
export function distanceM(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

/** Shapes an Overpass payload into the nearest named places. Exported for tests. */
export function parseOverpass(
  data: unknown,
  lat: number,
  lng: number,
  limit: number,
  category: PlaceCategory,
): Place[] {
  const elements = (data as { elements?: unknown })?.elements;
  if (!Array.isArray(elements)) return [];

  const seen = new Set<string>();
  return elements
    .map((raw): Place | null => {
      const el = raw as OverpassElement;
      const name = el.tags?.name?.trim();
      const pointLat = el.lat ?? el.center?.lat;
      const pointLng = el.lon ?? el.center?.lon;
      if (!name || typeof pointLat !== "number" || typeof pointLng !== "number") return null;
      return {
        name,
        kind: el.tags?.[TAGS[category].key] ?? category,
        distanceM: distanceM(lat, lng, pointLat, pointLng),
      };
    })
    .filter((place): place is Place => place !== null)
    // A hotel mapped as both a node and a building outline arrives twice, and a
    // list that names the same place at 340 m and 350 m reads as broken.
    .filter((place) => {
      const key = place.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.distanceM - b.distanceM)
    .slice(0, limit);
}

/**
 * Nearest named places of one category around a point.
 *
 * Returns an empty list rather than throwing when Overpass is slow, rate
 * limiting, or down. It is a free shared service with no availability promise,
 * and a visitor asking about a temple should not see an error card because a
 * volunteer server in Germany is busy - the assistant simply says it cannot
 * answer, which is what it would have said before this existed.
 */
export async function findNearbyPlaces(
  lat: number,
  lng: number,
  category: PlaceCategory,
  { radiusM = 3000, limit = 5 }: NearbyOptions = {},
): Promise<Place[]> {
  const started = Date.now();
  try {
    const res = await withTimeout(
      fetch(OVERPASS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": USER_AGENT,
        },
        body: new URLSearchParams({ data: buildQuery(lat, lng, category, radiusM) }),
      }),
      OVERPASS_TIMEOUT_MS,
      "places",
    );
    if (!res.ok) throw new Error(`overpass ${res.status}`);

    const places = parseOverpass(await res.json(), lat, lng, limit, category);
    logInfo({
      route: "places",
      event: "overpass_ok",
      durationMs: Date.now() - started,
      category,
      radiusM,
      found: places.length,
    });
    return places;
  } catch (err) {
    logError({
      route: "places",
      event: "overpass_fail",
      durationMs: Date.now() - started,
      category,
      err: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}

/** The list as the model sees it. Names are never translated. */
export function formatPlacesForPrompt(places: Place[]): string {
  return places
    .map((p, i) => `${i + 1}. ${p.name} — ${p.kind.replace(/_/g, " ")}, ${readableDistance(p.distanceM)}`)
    .join("\n");
}

function readableDistance(metres: number): string {
  return metres < 1000 ? `${metres} m` : `${(metres / 1000).toFixed(1)} km`;
}
