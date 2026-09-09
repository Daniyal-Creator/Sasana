// Turning the area a visitor named into a point to search around.
//
// ADR-0015 decided "No Site, no lookup": a question about what is nearby with
// no Site attached was refused rather than answered from a guessed location.
// That was right, and it also meant the feature only ever worked at six places.
// A visitor who asks "penginapan dekat Ubud" is not standing at one of them.
//
// ADR-0020 lifts the Site requirement and replaces the guarantee it was
// carrying. What stops a guess now is not a Site but three things in order:
// the area has to be named in the question, it has to resolve inside Bali, and
// what it resolves to has to be the kind of thing people mean by an area. Fail
// any of them and the answer is still a refusal.
//
// The middle one is not enough on its own, and that is worth writing down
// because it is not obvious. Asked for `Bogor` with `bounded=1` over Bali,
// Nominatim does not return nothing. It returns a road in Bali that happens to
// be named Bogor, importance 0.053. A visitor asking about Bogor would have
// been answered with hotels around a lane in Denpasar, confidently and with no
// sign anything had gone wrong. The `addresstype` allow-list below is what
// closes that, because nobody naming an area means a lane.

import { logError, logInfo } from "@/lib/logger";
import { withTimeout } from "@/lib/timeout";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// Nominatim's usage policy requires a real identifying User-Agent and asks for
// no more than one request a second. This runs once per question that names an
// area, on a school project's traffic, which is well inside that.
const USER_AGENT = "SASANA/1.0 (Bali customs assistant; school project)";

const GEOCODE_TIMEOUT_MS = 8_000;

/**
 * Bali, west to east and north to south, as Nominatim wants it:
 * `<lng_left>,<lat_top>,<lng_right>,<lat_bottom>`.
 *
 * The island is the whole product. Every Rule in the knowledge base traces to
 * Bali Governor Circular No. 7 of 2025, so a map that reached Java would have
 * the app naming hotels in a place whose customs it does not hold.
 */
export const BALI_VIEWBOX = "114.4,-8.03,115.8,-8.95";

/**
 * What Nominatim may call a result for it to count as an area.
 *
 * A road, a building, a shop, or an attraction can all match a place name and
 * sit inside Bali. None of them is what somebody means by "dekat Ubud".
 */
export const AREA_TYPES = new Set([
  "city",
  "town",
  "village",
  "suburb",
  "island",
  "county",
]);

/** A place to search around, and the name to show the visitor for it. */
export interface Anchor {
  /** Nominatim's own `display_name`, shown so a wrong resolution is visible. */
  label: string;
  lat: number;
  lng: number;
}

// The prepositions that introduce a place name, longest first so "di sekitar"
// is not consumed as a bare "di". Deliberately the same shape as
// `detectPlaceQuery` in places.ts: a regex before the model rather than a tool
// call after it, for the reason ADR-0015 gives - a round trip on every question
// to learn what a regex already knows.
const AREA_PREPOSITION =
  /\b(?:di\s+sekitar|di\s+daerah|di\s+dekat|sekitar|daerah|dekat|di|near|around)\s+([\p{L}][\p{L}\d'’-]*(?:\s+[\p{L}][\p{L}\d'’-]*){0,2})/iu;

// Words that follow a preposition without naming anywhere. Without these,
// "di mana saya bisa menginap" hands "mana saya bisa" to the geocoder.
const NOT_A_PLACE = new Set([
  "sini", "sana", "situ", "mana", "manakah", "sekitar", "sekitarnya", "sekitaran",
  "daerah", "tempat", "atas", "bawah", "dalam", "luar", "saya", "aku", "kita",
  "here", "there", "where", "the", "this", "that", "my", "me", "us", "you", "somewhere",
]);

// Where a captured phrase stops being the name. "dekat Ubud yang murah" is
// about Ubud; "yang murah" is a different clause.
const PHRASE_END = new Set([
  "yang", "dan", "atau", "untuk", "dengan", "buat", "tapi", "tetapi", "kalau",
  "bisa", "ada", "adakah", "apakah", "gak", "nggak", "ya", "dong", "kah", "sih",
  "and", "or", "for", "with", "but", "that", "which", "please", "any", "is", "are",
]);

/**
 * The area a question names, if it names one.
 *
 * Returns null far more often than it returns a name, and that is the intended
 * behaviour rather than a weakness: null falls back to the Site the visitor is
 * at, and failing that to a refusal that asks them to say where. A wrong guess
 * would instead be answered confidently, which is the failure this whole tier
 * exists to prevent.
 */
export function extractAreaName(message: string): string | null {
  const match = AREA_PREPOSITION.exec(message);
  if (!match) return null;

  const words = match[1].split(/\s+/);
  const kept: string[] = [];
  for (const word of words) {
    const plain = word.toLowerCase().replace(/[^\p{L}\d'’-]/gu, "");
    if (kept.length === 0 && NOT_A_PLACE.has(plain)) return null;
    if (PHRASE_END.has(plain)) break;
    kept.push(word);
  }

  const name = kept.join(" ").trim();
  return name.length > 1 ? name : null;
}

interface NominatimResult {
  display_name?: string;
  addresstype?: string;
  lat?: string;
  lon?: string;
}

/**
 * The first result that is an area, or null. Exported for tests.
 *
 * First rather than best: Nominatim already returns them in its own relevance
 * order, and a second ranking of our own would be a guess laid over a better
 * one. The allow-list does the work that matters.
 */
export function pickArea(data: unknown): Anchor | null {
  if (!Array.isArray(data)) return null;

  for (const raw of data as NominatimResult[]) {
    if (!raw?.addresstype || !AREA_TYPES.has(raw.addresstype)) continue;
    const lat = Number(raw.lat);
    const lng = Number(raw.lon);
    const label = raw.display_name?.trim();
    if (!label || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    return { label, lat, lng };
  }

  return null;
}

/**
 * Where an area is, or null if it is not an area in Bali.
 *
 * Null on failure rather than a throw, the same as `findNearbyPlaces`: this is
 * a free service run by volunteers with no availability promise, and a busy
 * server in Germany must cost a visitor their answer, never an error card.
 */
export async function geocodeArea(name: string): Promise<Anchor | null> {
  const started = Date.now();
  const query = new URLSearchParams({
    q: name,
    format: "jsonv2",
    limit: "5",
    viewbox: BALI_VIEWBOX,
    bounded: "1",
  });

  try {
    const res = await withTimeout(
      fetch(`${NOMINATIM_URL}?${query}`, { headers: { "User-Agent": USER_AGENT } }),
      GEOCODE_TIMEOUT_MS,
      "geocode",
    );
    if (!res.ok) throw new Error(`nominatim ${res.status}`);

    const anchor = pickArea(await res.json());
    logInfo({
      route: "geocode",
      event: anchor ? "resolved" : "no_area",
      durationMs: Date.now() - started,
      query: name,
      label: anchor?.label,
    });
    return anchor;
  } catch (err) {
    logError({
      route: "geocode",
      event: "nominatim_fail",
      durationMs: Date.now() - started,
      query: name,
      err: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}
