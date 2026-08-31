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
    en: "One notice as you approach a site, only while this page is open. Never repeated while you stay.",
    id: "Satu pemberitahuan saat Anda mendekati situs, hanya selama halaman ini terbuka. Tidak diulang selama Anda berada di sana.",
  },
  "explore.permission.feature2.title": {
    en: "Only the customs that apply here",
    id: "Hanya adat yang berlaku di sini",
  },
  "explore.permission.feature2.body": {
    en: "Attire, photography, and behaviour for that specific place.",
    id: "Pakaian, fotografi, dan perilaku untuk tempat tersebut.",
  },
  // This used to promise there was no map to download, which was true when
  // Explore drew its own. It draws a real one now, and the tiles come over the
  // network. What survives is the part that still holds: the boundaries that
  // decide when you are told anything are bundled, so that judgement is made on
  // the device even when the map picture cannot load.
  "explore.permission.feature3.title": {
    en: "Boundaries travel inside the app",
    id: "Batas situs ikut di dalam aplikasi",
  },
  "explore.permission.feature3.body": {
    en: "Only the map picture is fetched. The zones are already on your device, so the check still works if the map does not load.",
    id: "Hanya gambar petanya yang diambil. Zonanya sudah ada di perangkat Anda, jadi pemeriksaan tetap berjalan meski peta gagal dimuat.",
  },
  // Two claims, kept apart on purpose. The first is about the visitor's
  // position and is unqualified: it is read and tested on the device, and it is
  // never sent anywhere. The second is about the map picture, which does come
  // over the network from a map provider. Folding them into one sentence would
  // make the first one read as hedged, and it is not.
  "explore.permission.privacy": {
    en: "Your position is read and checked on your device. It is never sent anywhere and never stored. The map picture itself is loaded from a map provider.",
    id: "Posisi Anda dibaca dan diperiksa di perangkat Anda. Posisi itu tidak pernah dikirim ke mana pun dan tidak pernah disimpan. Gambar petanya sendiri dimuat dari penyedia peta.",
  },
  "explore.permission.cta": { en: "Turn on location", id: "Aktifkan lokasi" },
  "explore.permission.notnow": { en: "Not now", id: "Nanti saja" },

  // Waiting for a position that is certain enough to act on
  "explore.signal.searching.title": {
    en: "Finding your location",
    id: "Mencari lokasi Anda",
  },
  "explore.signal.searching.body": {
    en: "It can take a moment to pin down exactly where you are, especially near tall buildings or under trees.",
    id: "Perlu waktu sebentar untuk menentukan posisi Anda dengan pasti, terutama di dekat bangunan tinggi atau di bawah pepohonan.",
  },

  // The Guide: the screen before the map. It has one job, getting a visitor to
  // turn location on, and it earns that by showing what the app will do rather
  // than promising it.
  "explore.guide.eyebrow": { en: "Explore", id: "Jelajah" },
  "explore.guide.title": {
    en: "Know what a sacred place expects, before you reach the gate.",
    id: "Ketahui apa yang diharapkan sebuah tempat suci, sebelum Anda sampai di gerbangnya.",
  },
  "explore.guide.lead": {
    en: "SASANA watches for six sacred sites in Bali and tells you the customs of one about five minutes' walk before you arrive.",
    id: "SASANA mengawasi enam situs suci di Bali dan memberi tahu adat sebuah situs sekitar lima menit jalan kaki sebelum Anda tiba.",
  },
  "explore.guide.start": { en: "Start", id: "Mulai" },
  "explore.guide.startHint": {
    en: "Your browser will ask for location. Allow it for the live version, or refuse and browse the sites by hand.",
    id: "Browser akan meminta izin lokasi. Izinkan untuk versi langsung, atau tolak dan telusuri situsnya secara manual.",
  },

  "explore.guide.how.title": { en: "Two circles, two jobs", id: "Dua lingkaran, dua tugas" },
  "explore.guide.how.body": {
    en: "You always cross the outer circle first. That gap is the point: it is roughly five minutes on foot, which is time enough to put a sash on.",
    id: "Anda selalu melewati lingkaran luar lebih dulu. Jarak itulah intinya: kira-kira lima menit jalan kaki, cukup untuk memakai selendang.",
  },
  "explore.guide.how.approach": { en: "Approach", id: "Approach" },
  "explore.guide.how.approachBody": {
    en: "Crossing this line is what tells you what is coming.",
    id: "Melewati garis ini yang memberi tahu apa yang akan berlaku.",
  },
  "explore.guide.how.zone": { en: "Zone", id: "Zona" },
  "explore.guide.how.zoneBody": {
    en: "Inside here the customs are in force.",
    id: "Di dalam sini adatnya sudah berlaku.",
  },

  "explore.guide.map.title": { en: "Six sites, real boundaries", id: "Enam situs, batas sungguhan" },
  "explore.guide.map.body": {
    en: "Drawn to scale on a real map. This is the same view you get next.",
    id: "Digambar sesuai skala di peta sungguhan. Ini tampilan yang sama yang Anda dapat berikutnya.",
  },

  "explore.guide.when.title": { en: "It speaks once", id: "Ia bicara sekali" },
  "explore.guide.when.body": {
    en: "One notice for each site, when you cross into its Approach. Nothing more while you stay.",
    id: "Satu pemberitahuan tiap situs, saat Anda memasuki Approach-nya. Tidak ada lagi selama Anda di sana.",
  },

  "explore.guide.privacy.title": { en: "Your position stays here", id: "Posisi Anda tetap di sini" },
  "explore.guide.privacy.body": {
    en: "It is read and checked on your device, never sent, never stored. Only the map picture comes over the network.",
    id: "Dibaca dan diperiksa di perangkat Anda, tidak dikirim, tidak disimpan. Hanya gambar petanya yang datang lewat jaringan.",
  },

  "explore.guide.limit.title": { en: "Only while this is open", id: "Hanya selagi ini terbuka" },
  "explore.guide.limit.body": {
    en: "A web page cannot read location once the screen locks. Keep it open as you walk.",
    id: "Halaman web tidak bisa membaca lokasi begitu layar terkunci. Biarkan terbuka selagi Anda berjalan.",
  },

  "explore.guide.customs.title": { en: "What you will be told", id: "Apa yang akan diberitahukan" },
  "explore.guide.customs.body": {
    en: "Every line traces to Bali Governor Circular No. 7 of 2025. At {site}, for instance:",
    id: "Tiap barisnya menelusur ke Surat Edaran Gubernur Bali No. 7 Tahun 2025. Di {site}, misalnya:",
  },

  // Screen B: no site nearby
  "explore.nearby.title": { en: "Nearby", id: "Terdekat" },
  "explore.nearby.subtitle": {
    en: "Customs for the sacred sites around you.",
    id: "Adat untuk situs suci di sekitar Anda.",
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
  "explore.map.aria": {
    en: "Map of {count} sacred sites in Bali",
    id: "Peta {count} situs suci di Bali",
  },

  // The map surface: controls, the circles drawn on it, and the state where
  // the tiles never arrive.
  "explore.map.locate": { en: "Centre the map on me", id: "Pusatkan peta ke saya" },
  "explore.map.zone": {
    en: "Zone: customs apply inside this circle",
    id: "Zona: adat berlaku di dalam lingkaran ini",
  },
  "explore.map.approach": {
    en: "You are told what to expect once you cross this line",
    id: "Anda diberi tahu apa yang berlaku begitu melewati garis ini",
  },
  "explore.map.accuracy": {
    en: "Your position is accurate to about {distance}",
    id: "Posisi Anda akurat sekitar {distance}",
  },
  "explore.map.offline.title": {
    en: "The map could not load",
    id: "Peta tidak bisa dimuat",
  },
  "explore.map.offline.body": {
    en: "Check your connection. The customs below still work, and your position is still being checked.",
    id: "Periksa koneksi Anda. Adat di bawah tetap bisa dibaca, dan posisi Anda tetap diperiksa.",
  },

  // Explore Mode: the notice arrives without taking the screen

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
  "explore.detail.odalan.title": {
    en: "Odalan on {date}",
    id: "Odalan pada {date}",
  },
  "explore.detail.odalan.body": {
    en: "The temple holds its anniversary ceremony then. Expect crowds and tighter access.",
    id: "Pura mengadakan upacara ulang tahunnya saat itu. Bersiaplah dengan keramaian dan akses yang lebih ketat.",
  },
  // The way back out of a Site and into the list it was opened from. The panel
  // replaces its own contents rather than navigating, so the browser's back
  // button is not the way home and the screen has to offer one.
  "explore.panel.back": { en: "Back to the list", id: "Kembali ke daftar" },

  // The way back out of Screen C, which until now had none: entering Browse
  // was a one-way door and only a page reload led home.
  // Deliberately not "back to the list": the panel now returns to whatever it
  // was showing, which may have been a list or may have been another Site.
  "explore.panel.backOut": { en: "Back", id: "Kembali" },

  "explore.panel.backToNearby": { en: "Back to nearby", id: "Kembali ke terdekat" },

  // The two circles, named in the words the panel uses for them elsewhere.
  "explore.zone.inside": { en: "Customs apply inside", id: "Adat berlaku di dalam" },
  "explore.zone.told": { en: "You are told from here", id: "Diberi tahu mulai dari sini" },

  "explore.detail.customsTitle": { en: "Customs here", id: "Adat di sini" },
  // Heads the sourced cultural note under an expanded Custom. Short on purpose:
  // it is a label, and the paragraph under it is the thing worth reading.
  "explore.detail.why": { en: "Why this matters", id: "Kenapa ini penting" },
  "explore.detail.source": { en: "Source: {source}", id: "Sumber: {source}" },
  "explore.detail.checkPhoto": { en: "Check my photo here", id: "Cek foto saya di sini" },
  "explore.detail.simulate": {
    en: "View as if I am here",
    id: "Lihat seolah-olah saya di sini",
  },

  // Dummy Sites. Shown only when the nearest real Site is more than 50 km
  // away, so that someone opening Explore from outside Bali can see the map,
  // the circles, and the approach notice actually work.
  //
  // The word "Dummy" lives inside the Site's own name, so it travels to every
  // surface that renders a name without a badge component. These keys carry
  // the rest of the marking. `explore.dummy.source` fills the `source` field,
  // which renders beside a ShieldCheck icon: it has to contradict that icon
  // rather than dress the place up in a real authority (W6).
  "explore.dummy.source": {
    en: "Dummy site. This place is not real. The customs shown apply widely at Balinese temples.",
    id: "Situs dummy. Tempat ini tidak nyata. Adat yang ditampilkan berlaku umum di pura Bali.",
  },
  // Sits in the head of the approach sheet, which opens at 45% of the
  // viewport. The source line above lives in its foot, and at that height the
  // foot has not been scrolled to yet.
  "explore.dummy.sheetNotice": {
    en: "Dummy site, not a real place",
    id: "Situs dummy, bukan tempat nyata",
  },
  "explore.dummy.areaLabel": {
    en: "Dummy sacred site area",
    id: "Kawasan situs suci dummy",
  },
  // Stands where a real Site prints "Tabanan, Bali". It says the one true
  // thing about where a dummy is: it was placed around whoever is reading.
  "explore.dummy.region": {
    en: "Near your location",
    id: "Di dekat lokasi Anda",
  },
  // Replaces explore.none.* while dummies are on screen. The old title would
  // otherwise stand directly above a row reading "Pura Dummy 1, 900 m", and
  // the screen would contradict itself.
  "explore.dummy.none.title": {
    en: "No real sacred site nearby",
    id: "Tidak ada situs suci sungguhan di dekat sini",
  },
  "explore.dummy.none.description": {
    en: "The sites below are dummy data, placed around you to show how the map and the approach notice work.",
    id: "Situs di bawah adalah data dummy, diletakkan di sekitar Anda untuk menunjukkan cara kerja peta dan pemberitahuan saat mendekat.",
  },
  // Search over the Site list. It is a filter, not a destination, so the copy
  // never promises more than narrowing what is already on screen.
  "explore.search.placeholder": { en: "Search sites", id: "Cari situs" },
  "explore.search.clear": { en: "Clear search", id: "Hapus pencarian" },
  "explore.search.label": { en: "Results", id: "Hasil" },
  "explore.search.none.title": { en: "Nothing by that name", id: "Tidak ada yang cocok" },
  "explore.search.none.body": {
    en: "Try part of a name or a region, or clear the search to see every site.",
    id: "Coba sebagian nama atau nama daerah, atau kosongkan pencarian untuk melihat semua situs.",
  },

  "explore.map.aria.dummy": {
    en: "Map of {count} sacred sites, including {dummies} dummy sites placed around you",
    id: "Peta {count} situs suci, termasuk {dummies} situs dummy di sekitar Anda",
  },
  "explore.dummy.replace": {
    en: "Place the dummy sites around me again",
    id: "Letakkan ulang situs dummy di sekitar saya",
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
