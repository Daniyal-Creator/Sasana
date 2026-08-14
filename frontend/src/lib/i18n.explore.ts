import type { Lang } from "@/lib/i18n";

// Explore copy, in parallel to lib/i18n.ts but separate so the Explore feature
// can be built without touching the shared dict (geofencing-ui-prompt §6).
// Copy rules: lead with what to do, no em dashes, no marketing filler.

type Entry = { en: string; id: string };

const dict = {
  // Screen A: asking for permission
  "explore.permission.title": {
    en: "Know the rules before you arrive.",
    id: "Ketahui aturannya sebelum Anda tiba.",
  },
  "explore.permission.body": {
    en: "Turn on location and SASANA will show the customs that apply at a sacred site while you are still outside it.",
    id: "Aktifkan lokasi dan SASANA akan menampilkan adat yang berlaku di situs suci selagi Anda masih di luarnya.",
  },
  "explore.permission.feature1.title": { en: "A quiet heads-up", id: "Pemberitahuan yang tenang" },
  "explore.permission.feature1.body": {
    en: "One notice as you approach a site. Never repeated while you stay.",
    id: "Satu pemberitahuan saat Anda mendekati situs. Tidak diulang selama Anda berada di sana.",
  },
  "explore.permission.feature2.title": {
    en: "Only the customs that apply here",
    id: "Hanya adat yang berlaku di sini",
  },
  "explore.permission.feature2.body": {
    en: "Attire, photography, and behaviour for that specific place.",
    id: "Pakaian, fotografi, dan perilaku untuk tempat tersebut.",
  },
  "explore.permission.feature3.title": {
    en: "No map to download",
    id: "Tidak ada peta untuk diunduh",
  },
  "explore.permission.feature3.body": {
    en: "Site boundaries travel inside the app.",
    id: "Batas situs tersimpan di dalam aplikasi.",
  },
  "explore.permission.privacy": {
    en: "Your location is checked on your device only. SASANA never stores or shares where you have been.",
    id: "Lokasi Anda diperiksa hanya di perangkat Anda. SASANA tidak pernah menyimpan atau membagikan ke mana pun Anda pergi.",
  },
  "explore.permission.cta": { en: "Turn on location", id: "Aktifkan lokasi" },
  "explore.permission.notnow": { en: "Not now", id: "Nanti saja" },

  // Screen B: no site nearby
  "explore.nearby.title": { en: "Nearby", id: "Terdekat" },
  "explore.nearby.subtitle": {
    en: "Customs for the sacred sites around you.",
    id: "Adat untuk situs suci di sekitar Anda.",
  },
  "explore.map.notToScale": {
    en: "Schematic map, not to scale",
    id: "Peta skematis, tidak sesuai skala",
  },
  "explore.none.title": { en: "No sacred site nearby", id: "Tidak ada situs suci di dekat sini" },
  "explore.none.description": {
    en: "The closest one is about {distance} away. We will let you know before you arrive.",
    id: "Yang terdekat berjarak sekitar {distance}. Kami akan memberi tahu sebelum Anda tiba.",
  },
  "explore.closest.label": { en: "Closest sites", id: "Situs terdekat" },
  "explore.checked": {
    en: "Checked on your device. Nothing is stored.",
    id: "Diperiksa di perangkat Anda. Tidak ada yang disimpan.",
  },

  // Screen C: browsing the map
  "explore.browse.title": { en: "Explore sacred sites", id: "Jelajahi situs suci" },
  "explore.sites.label": { en: "All sites", id: "Semua situs" },
  "explore.card.seeAll": {
    en: "See all customs here",
    id: "Lihat semua adat di sini",
  },
  "explore.map.aria": {
    en: "Schematic map of {count} sacred sites in Bali",
    id: "Peta skematis {count} situs suci di Bali",
  },

  // Screen D: approaching a site
  "explore.sheet.approaching": {
    en: "You are approaching",
    id: "Anda sedang mendekati",
  },
  "explore.sheet.sacredArea": { en: "This is a sacred area.", id: "Ini adalah kawasan suci." },
  "explore.sheet.count.one": { en: "One custom applies here.", id: "Satu adat berlaku di sini." },
  "explore.sheet.count.many": {
    en: "{count} customs apply here.",
    id: "{count} adat berlaku di sini.",
  },
  "explore.sheet.checkPhoto": { en: "Check my photo", id: "Cek foto saya" },
  "explore.sheet.ask": { en: "Ask", id: "Tanya" },
  "explore.sheet.simulated": { en: "Simulated location", id: "Lokasi simulasi" },
  "explore.sheet.collapse": { en: "Collapse the panel", id: "Kecilkan panel" },
  "explore.sheet.expand": { en: "Expand the panel", id: "Perbesar panel" },

  // Screen E: site detail
  "explore.detail.meta": {
    en: "{region} · {distance} away",
    id: "{region} · berjarak {distance}",
  },
  "explore.detail.metaNoDistance": { en: "{region}", id: "{region}" },
  "explore.detail.band": {
    en: "Sacred area. Customs apply inside the marked zone.",
    id: "Kawasan suci. Adat berlaku di dalam zona yang ditandai.",
  },
  "explore.detail.odalan.title": {
    en: "Odalan on {date}",
    id: "Odalan pada {date}",
  },
  "explore.detail.odalan.body": {
    en: "The temple holds its anniversary ceremony then. Expect crowds and tighter access.",
    id: "Pura mengadakan upacara ulang tahunnya saat itu. Bersiaplah dengan keramaian dan akses yang lebih ketat.",
  },
  "explore.detail.customsTitle": { en: "Customs here", id: "Adat di sini" },
  "explore.detail.source": { en: "Source: {source}", id: "Sumber: {source}" },
  "explore.detail.checkPhoto": { en: "Check my photo here", id: "Cek foto saya di sini" },
  "explore.detail.simulate": {
    en: "View as if I am here",
    id: "Lihat seolah-olah saya di sini",
  },
} satisfies Record<string, Entry>;

export type ExploreKey = keyof typeof dict;

export function tExplore(lang: Lang, key: ExploreKey, params?: Record<string, string>): string {
  let text = dict[key][lang];
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replace(`{${name}}`, value);
    }
  }
  return text;
}