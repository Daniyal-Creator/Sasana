// Dummy Sites: five Sites placed around the visitor, shown only when no real
// Site is anywhere near them. The decision, the line it walks, and the
// alternatives rejected are in docs/adr/0012-dummy-sites.md.
//
// The line this file walks: the LOCATION and the NAME are invented, and
// nothing else is. Every Custom below carries real ruleIds into
// backend/src/data/rules.json, and site-rules.test.ts runs the same checks over
// these that it runs over SITES. `odalan` stays empty, because inventing a
// ceremony date is the exact thing ADR-0004 was written to forbid.
//
// SITES itself is untouched. Anything that imports it, including the detail
// route and the backend later on, must not receive a fictional place without
// asking for one. The two lists meet in exactly one place: explore/page.tsx.

import type { Custom, Localized, Site } from "@/data/sites";
import type { LatLng } from "@/lib/geo";
import { tExplore } from "@/lib/i18n.explore";

/** A Site whose location and name are invented. Never in SITES. */
export interface DummySite extends Site {
  isDummy: true;
}

/**
 * Components take a plain Site and ask this rather than pattern-matching the
 * id. An id is a string somebody can typo; this is a property the builder
 * below is the only writer of.
 */
export function isDummySite(site: Site): site is DummySite {
  return (site as Partial<DummySite>).isDummy === true;
}

/**
 * How far the nearest real Site has to be before dummies appear at all.
 *
 * 50 km rather than something smaller: at 5 km, a tourist staying in Kuta
 * would be handed five temples that do not exist. That visitor is precisely
 * the person this product must not mislead. At 50 km the only person who ever
 * sees a dummy is a person who is not in Bali.
 */
export const DUMMY_THRESHOLD_M = 50_000;

const EARTH_RADIUS_M = 6_371_000;

/**
 * Where each dummy sits, relative to the visitor.
 *
 * Every one of them starts OUTSIDE its own Approach (radiusM + 400 m). That is
 * the whole point of the distances: if the nearest sat inside, ApproachSheet
 * would cover half the screen before a single marker had been seen, and the
 * thing being demonstrated would be a sheet rather than a crossing. Nearest is
 * 900 m against an 800 m Approach, so roughly 150 m on foot lights it up.
 *
 * Fixed rather than random: a random layout is one nobody can rehearse, and
 * five random bearings can pile up on one side of the visitor.
 */
export const DUMMY_PLACEMENTS = [
  { n: 1, bearingDeg: 0, distanceM: 900, radiusM: 400 },
  { n: 2, bearingDeg: 72, distanceM: 1_400, radiusM: 300 },
  { n: 3, bearingDeg: 144, distanceM: 2_200, radiusM: 500 },
  { n: 4, bearingDeg: 216, distanceM: 3_200, radiusM: 250 },
  { n: 5, bearingDeg: 288, distanceM: 4_500, radiusM: 350 },
] as const;

/**
 * The dummy the visitor starts closest to.
 *
 * Derived rather than written down, so that reordering or retuning
 * DUMMY_PLACEMENTS cannot leave this pointing at the wrong one. It exists
 * because the browse camera follows the selected Site, and the selection has
 * to move off the first real Site once there are dummies to look at.
 */
export const NEAREST_DUMMY_ID = `dummy-site-${
  [...DUMMY_PLACEMENTS].sort((a, b) => a.distanceM - b.distanceM)[0].n
}`;

/**
 * The Customs every dummy carries. One set, not five: they are true of
 * Balinese temples generally, which is the only honest thing a place with no
 * real location can say. Each one is the general form of a Custom already
 * written for a real Site, pointing at the same Rule.
 */
const DUMMY_CUSTOMS: Custom[] = [
  {
    id: "dress",
    icon: "dress",
    title: { en: "Dress", id: "Pakaian" },
    summary: {
      en: "A kamen and sash are required to enter the grounds.",
      id: "Kamen dan selendang wajib dipakai untuk masuk ke area pura.",
    },
    detail: {
      en: "Wear a kamen, a length of cloth wrapped at the waist, with a sash tied over it. Most temples lend or rent both at the entrance. Shoulders and knees stay covered inside the grounds.",
      id: "Kenakan kamen, kain yang dililitkan di pinggang, dengan selendang diikat di atasnya. Sebagian besar pura meminjamkan atau menyewakan keduanya di pintu masuk. Bahu dan lutut tetap tertutup selama di dalam area pura.",
    },
    ruleIds: ["temple-attire"],
  },
  {
    id: "offerings",
    icon: "offerings",
    title: { en: "Offerings", id: "Sesaji" },
    summary: {
      en: "Canang are placed on the ground. Walk around them.",
      id: "Canang diletakkan di tanah. Berjalanlah mengelilinginya.",
    },
    detail: {
      en: "Canang, small woven trays of flowers, are placed on the ground throughout a temple area. Walk around them, never over them or on them.",
      id: "Canang, wadah anyaman kecil berisi bunga, diletakkan di tanah di seluruh area pura. Berjalanlah mengelilinginya, jangan pernah melangkahinya atau menginjaknya.",
    },
    ruleIds: ["offerings-canang"],
  },
  {
    id: "quiet",
    icon: "quiet",
    title: { en: "Quiet", id: "Tenang" },
    summary: {
      en: "Keep your voice low near people who are praying.",
      id: "Jaga suara tetap pelan di dekat orang yang sedang sembahyang.",
    },
    detail: {
      en: "Keep your voice low near people who are praying, and let a ceremony pass rather than crossing through it.",
      id: "Jaga suara tetap pelan di dekat orang yang sedang sembahyang, dan biarkan upacara berlalu alih-alih menyeberang di tengahnya.",
    },
    ruleIds: ["speaking-volume"],
  },
];

function bothLangs(key: "explore.dummy.areaLabel" | "explore.dummy.source"): Localized {
  return { en: tExplore("en", key), id: tExplore("id", key) };
}

/**
 * A point `distanceM` away from `from` along `bearingDeg`, clockwise from
 * north.
 *
 * The cos(lat) term on the longitude is not optional. A degree of longitude is
 * 111 km at the equator and 64 km in London, so dropping it would put dummy 2
 * and dummy 5 hundreds of metres from where their own distance label claims
 * they are. Everyone this feature exists for is outside Bali, which is to say
 * away from the latitude where that error happens to be small.
 *
 * Flat offsets rather than a great-circle formula: the longest hop here is
 * 4.5 km, where the two agree to well under a metre.
 */
function project(from: LatLng, bearingDeg: number, distanceM: number): LatLng {
  const bearing = (bearingDeg * Math.PI) / 180;
  const north = distanceM * Math.cos(bearing);
  const east = distanceM * Math.sin(bearing);
  const degPerM = 180 / (Math.PI * EARTH_RADIUS_M);
  // Guards the poles, where a metre east is an unbounded number of degrees and
  // the projection stops meaning anything.
  const cosLat = Math.max(Math.cos((from.lat * Math.PI) / 180), 1e-6);
  return {
    lat: from.lat + north * degPerM,
    lng: from.lng + (east * degPerM) / cosLat,
  };
}

/**
 * The five dummies, laid out around `anchor`.
 *
 * Called once per anchor, never once per position update. A dummy recomputed
 * on every fix would walk away from the visitor at exactly their pace: the
 * distance would never close, the Approach would never be crossed, and the
 * feature would never fire.
 *
 * `lang` is a parameter because `Site.source` is one string rather than a
 * Localized pair, and for a dummy that string is the marking rather than a
 * citation. It has to be readable by whoever is holding the phone.
 */
export function buildDummySites(anchor: LatLng, lang: "en" | "id" = "id"): DummySite[] {
  return DUMMY_PLACEMENTS.map(({ n, bearingDeg, distanceM, radiusM }) => {
    const { lat, lng } = project(anchor, bearingDeg, distanceM);
    return {
      // The "dummy-" prefix is deliberately not the "pura-" shape real Sites
      // use, so one of these is recognisable at a glance in a URL or a log.
      id: `dummy-site-${n}`,
      // The marking lives in the name itself. That is why there is no badge
      // component anywhere: a name is already rendered in the list row, the
      // brief, the sheet header, the banner, and the map label, so the word
      // travels to all five for free and cannot fall off one of them.
      name: `Pura Dummy ${n}`,
      region: tExplore(lang, "explore.dummy.region"),
      areaLabel: bothLangs("explore.dummy.areaLabel"),
      // `Site.description` arrived from the landing work, where it introduces a
      // real place on the slider. A dummy has nothing to introduce, so it says
      // the one true thing about itself, the same sentence its source line
      // carries. `image` stays undefined: there is no photograph of a place
      // that does not exist.
      description: bothLangs("explore.dummy.source"),
      lat,
      lng,
      radiusM,
      customs: DUMMY_CUSTOMS,
      // Renders beside a ShieldCheck icon, which in this app means "this is
      // sourced". So it has to say the opposite of what a citation says. A
      // fictional name at fictional coordinates under a real governor
      // circular would not be dummy data, it would be a false claim wearing a
      // seal.
      source: tExplore(lang, "explore.dummy.source"),
      odalan: [],
      isDummy: true,
    };
  });
}
