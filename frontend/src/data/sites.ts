// Sacred sites bundled into the frontend. A Site is a place a visitor can
// approach; the Zone around it is where its customs apply. Everything here is
// compiled and type-checked, and ships inside the bundle (geofencing-ui-prompt §7).

export type Localized = { en: string; id: string };

export type CustomIcon = "dress" | "photography" | "offerings" | "drones" | "quiet";

export interface Custom {
  id: string;
  icon: CustomIcon;
  title: Localized;
  summary: Localized;
  detail: Localized;
  ruleIds: string[];
}

export interface Site {
  id: string;
  name: string;
  region: string;
  areaLabel: Localized;
  lat: number;
  lng: number;
  radiusM: number;
  customs: Custom[];
  source: string;
  odalanDates: string[];
}

// TODO(odalan): every odalanDates array is empty on purpose. Odalan follows the
// 210-day pawukon cycle, and the placeholder dates that were here first did not
// correspond to any known odalan for these temples. ADR-0004 says a date we
// cannot confirm is worse than no date, because a visitor who plans around a
// wrong ceremony date is misled by the one app that promised to prevent that.
// Fill these in only from temple management or an official Balinese calendar,
// and record where each date came from. The notice itself is implemented and
// verified: put a date within seven days of today into any Site to see it.
export const SITES: Site[] = [
  {
    id: "pura-tanah-lot",
    name: "Pura Tanah Lot",
    region: "Tabanan, Bali",
    areaLabel: { en: "Sacred coastal temple area", id: "Kawasan pura tepi laut" },
    lat: -8.6212,
    lng: 115.0868,
    radiusM: 400,
    source: "Bali Governor Circular No. 7/2025",
    odalanDates: [],
    customs: [
      {
        id: "dress",
        icon: "dress",
        title: { en: "Dress", id: "Pakaian" },
        summary: {
          en: "A kamen and sash are required to enter the grounds.",
          id: "Kamen dan selendang wajib dipakai untuk masuk ke area pura.",
        },
        detail: {
          en: "Wear a kamen, a length of cloth wrapped at the waist, with a sash tied over it. Both are lent or rented at the entrance. Shoulders and knees stay covered inside the grounds.",
          id: "Kenakan kamen, kain yang dililitkan di pinggang, dengan selendang diikat di atasnya. Keduanya dipinjamkan atau disewakan di pintu masuk. Bahu dan lutut tetap tertutup selama di dalam area pura.",
        },
        ruleIds: ["temple-attire"],
      },
      {
        id: "photography",
        icon: "photography",
        title: { en: "Photography", id: "Fotografi" },
        summary: {
          en: "Photos are fine outside the inner courtyard.",
          id: "Foto diperbolehkan di luar halaman dalam.",
        },
        detail: {
          en: "Take photos in the outer areas. Ask before photographing someone who is praying, and never stand higher than a priest to get a shot.",
          id: "Ambil foto di area luar. Minta izin sebelum memotret orang yang sedang sembahyang, dan jangan pernah berdiri lebih tinggi daripada pedanda untuk mengambil gambar.",
        },
        ruleIds: ["photography", "head-level-respect"],
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
          en: "Canang, small woven trays of flowers, are placed on the ground throughout the area. Walk around them, never over them or on them.",
          id: "Canang, wadah anyaman kecil berisi bunga, diletakkan di tanah di seluruh area. Berjalanlah mengelilinginya, jangan pernah melangkahinya atau menginjaknya.",
        },
        ruleIds: ["offerings-canang"],
      },
      {
        id: "drones",
        icon: "drones",
        title: { en: "Drones", id: "Drone" },
        summary: {
          en: "Flying over the temple area is not permitted.",
          id: "Menerbangkan drone di area pura tidak diizinkan.",
        },
        detail: {
          en: "Flying over the temple area is not permitted. This is enforced, and it interrupts ceremonies.",
          id: "Menerbangkan drone di area pura tidak diizinkan. Hal ini ditegakkan dan dapat mengganggu upacara.",
        },
        ruleIds: ["drone-restriction"],
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
    ],
  },
  {
    id: "pura-luhur-uluwatu",
    name: "Pura Luhur Uluwatu",
    region: "Badung, Bali",
    areaLabel: { en: "Clifftop sacred area", id: "Kawasan suci di atas tebing" },
    lat: -8.8291,
    lng: 115.0849,
    radiusM: 400,
    source: "Bali Governor Circular No. 7/2025",
    odalanDates: [],
    customs: [
      {
        id: "dress",
        icon: "dress",
        title: { en: "Dress", id: "Pakaian" },
        summary: {
          en: "A kamen and sash are required inside the temple.",
          id: "Kamen dan selendang wajib dikenakan di dalam pura.",
        },
        detail: {
          en: "A kamen and sash are required inside the temple grounds. They are lent or rented at the entrance. Keep shoulders and knees covered.",
          id: "Kamen dan selendang wajib dikenakan di dalam area pura. Keduanya dipinjamkan atau disewakan di pintu masuk. Jaga bahu dan lutut tetap tertutup.",
        },
        ruleIds: ["temple-attire"],
      },
      {
        id: "photography",
        icon: "photography",
        title: { en: "Photography", id: "Fotografi" },
        summary: {
          en: "Photos are fine on the clifftop path.",
          id: "Foto diperbolehkan di jalan setapak tebing.",
        },
        detail: {
          en: "Photograph the cliff views and the outer areas freely. Ask before photographing someone who is praying, and avoid taking photos inside the inner courtyard.",
          id: "Foto pemandangan tebing dan area luar dengan leluasa. Minta izin sebelum memotret orang yang sedang sembahyang, dan hindari memotret di halaman dalam.",
        },
        ruleIds: ["photography", "sacred-area-entry"],
      },
      {
        id: "offerings",
        icon: "offerings",
        title: { en: "Offerings", id: "Sesaji" },
        summary: {
          en: "Offerings rest on the ground and on walls.",
          id: "Sesaji diletakkan di tanah dan di tembok.",
        },
        detail: {
          en: "Offerings are placed on the ground and along the temple walls. Step around them and never walk over them.",
          id: "Sesaji diletakkan di tanah dan di sepanjang tembok pura. Berjalanlah mengelilinginya dan jangan pernah melangkahinya.",
        },
        ruleIds: ["offerings-canang"],
      },
      {
        id: "quiet",
        icon: "quiet",
        title: { en: "Quiet", id: "Tenang" },
        summary: {
          en: "Stay quiet near the shrines and the kecak stage.",
          id: "Tetap tenang di dekat pelinggih dan panggung kecak.",
        },
        detail: {
          en: "Stay quiet near the shrines and the kecak dance stage. Let a ceremony pass rather than crossing through it, and keep your voice low.",
          id: "Tetap tenang di dekat pelinggih dan panggung tari kecak. Biarkan upacara berlalu alih-alih menyeberang di tengahnya, dan jaga suara tetap pelan.",
        },
        ruleIds: ["speaking-volume"],
      },
    ],
  },
  {
    id: "pura-besakih",
    name: "Pura Besakih",
    region: "Karangasem, Bali",
    areaLabel: { en: "Mother temple complex", id: "Kompleks pura agung" },
    lat: -8.3739,
    lng: 115.4515,
    radiusM: 500,
    source: "Bali Governor Circular No. 7/2025",
    odalanDates: [],
    customs: [
      {
        id: "dress",
        icon: "dress",
        title: { en: "Dress", id: "Pakaian" },
        summary: {
          en: "A kamen and sash are required across the complex.",
          id: "Kamen dan selendang wajib dikenakan di seluruh kompleks.",
        },
        detail: {
          en: "A kamen and sash are required across the whole complex, the largest temple in Bali. They are lent or rented at the main entrance.",
          id: "Kamen dan selendang wajib dikenakan di seluruh kompleks, pura terbesar di Bali. Keduanya dipinjamkan atau disewakan di pintu masuk utama.",
        },
        ruleIds: ["temple-attire"],
      },
      {
        id: "photography",
        icon: "photography",
        title: { en: "Photography", id: "Fotografi" },
        summary: {
          en: "Photos are fine in the outer courtyards.",
          id: "Foto diperbolehkan di halaman luar.",
        },
        detail: {
          en: "Photograph the outer courtyards and the meru shrines. Ask before photographing someone who is praying, and never stand higher than a priest.",
          id: "Foto halaman luar dan pelinggih meru. Minta izin sebelum memotret orang yang sedang sembahyang, dan jangan pernah berdiri lebih tinggi daripada pedanda.",
        },
        ruleIds: ["photography", "head-level-respect"],
      },
      {
        id: "offerings",
        icon: "offerings",
        title: { en: "Offerings", id: "Sesaji" },
        summary: {
          en: "Offerings cover the ground during ceremonies.",
          id: "Sesaji memenuhi tanah saat upacara.",
        },
        detail: {
          en: "Offerings are laid out widely, especially on ceremony days. Walk around them and never step on them, even if the ground looks busy.",
          id: "Sesaji diletakkan secara luas, terutama pada hari upacara. Berjalanlah mengelilinginya dan jangan pernah menginjaknya, meskipun tanah tampak ramai.",
        },
        ruleIds: ["offerings-canang"],
      },
      {
        id: "drones",
        icon: "drones",
        title: { en: "Drones", id: "Drone" },
        summary: {
          en: "Flying drones over the complex is not permitted.",
          id: "Menerbangkan drone di atas kompleks tidak diizinkan.",
        },
        detail: {
          en: "Flying drones over the temple complex is not permitted. This is enforced, and it interrupts ceremonies.",
          id: "Menerbangkan drone di atas kompleks pura tidak diizinkan. Hal ini ditegakkan dan dapat mengganggu upacara.",
        },
        ruleIds: ["drone-restriction"],
      },
      {
        id: "quiet",
        icon: "quiet",
        title: { en: "Quiet", id: "Tenang" },
        summary: {
          en: "Keep your voice low in the courtyards.",
          id: "Jaga suara tetap pelan di halaman.",
        },
        detail: {
          en: "Keep your voice low across the courtyards. Many people come here to pray, and ceremonies are frequent. Let them pass without crossing through.",
          id: "Jaga suara tetap pelan di seluruh halaman. Banyak orang datang untuk sembahyang, dan upacara sering berlangsung. Biarkan mereka berlalu tanpa menyeberang di tengahnya.",
        },
        ruleIds: ["speaking-volume"],
      },
    ],
  },
  {
    id: "pura-batu-bolong",
    name: "Pura Batu Bolong",
    region: "Badung, Bali",
    areaLabel: { en: "Temple on the rock arch", id: "Pura di atas lengkung batu" },
    lat: -8.6547,
    lng: 115.1225,
    radiusM: 250,
    source: "Bali Governor Circular No. 7/2025",
    odalanDates: [],
    customs: [
      {
        id: "dress",
        icon: "dress",
        title: { en: "Dress", id: "Pakaian" },
        summary: {
          en: "A kamen is required to cross the rock arch.",
          id: "Kamen wajib dikenakan untuk melewati lengkung batu.",
        },
        detail: {
          en: "A kamen is required to enter the temple over the rock arch. It is lent or rented at the entrance. Keep shoulders and knees covered.",
          id: "Kamen wajib dikenakan untuk masuk ke pura di atas lengkung batu. Kamen dipinjamkan atau disewakan di pintu masuk. Jaga bahu dan lutut tetap tertutup.",
        },
        ruleIds: ["temple-attire"],
      },
      {
        id: "offerings",
        icon: "offerings",
        title: { en: "Offerings", id: "Sesaji" },
        summary: {
          en: "Offerings are placed along the cliff edge.",
          id: "Sesaji diletakkan di sepanjang tepi tebing.",
        },
        detail: {
          en: "Offerings are placed along the cliff edge and at the shrines. Walk around them and never kick or step on them.",
          id: "Sesaji diletakkan di sepanjang tepi tebing dan di pelinggih. Berjalanlah mengelilinginya dan jangan pernah menyentuh atau menginjaknya.",
        },
        ruleIds: ["offerings-canang"],
      },
      {
        id: "quiet",
        icon: "quiet",
        title: { en: "Quiet", id: "Tenang" },
        summary: {
          en: "Keep your voice low near the shrines.",
          id: "Jaga suara tetap pelan di dekat pelinggih.",
        },
        detail: {
          en: "Keep your voice low near the shrines and let a ceremony pass rather than crossing through it.",
          id: "Jaga suara tetap pelan di dekat pelinggih dan biarkan upacara berlalu alih-alih menyeberang di tengahnya.",
        },
        ruleIds: ["speaking-volume"],
      },
    ],
  },
  {
    id: "pura-tirta-empul",
    name: "Pura Tirta Empul",
    region: "Gianyar, Bali",
    areaLabel: { en: "Sacred spring purification temple", id: "Pura pemandian air suci" },
    lat: -8.4156,
    lng: 115.3153,
    radiusM: 300,
    source: "Bali Governor Circular No. 7/2025",
    odalanDates: [],
    customs: [
      {
        id: "dress",
        icon: "dress",
        title: { en: "Dress", id: "Pakaian" },
        summary: {
          en: "A kamen is required before the bathing pools.",
          id: "Kamen wajib dikenakan sebelum masuk area pemandian.",
        },
        detail: {
          en: "A kamen is required to reach the bathing pools, and is lent or rented at the entrance. Keep your shoulders covered.",
          id: "Kamen wajib dikenakan untuk mencapai kolam pemandian, dan dipinjamkan atau disewakan di pintu masuk. Jaga bahu tetap tertutup.",
        },
        ruleIds: ["temple-attire"],
      },
      {
        id: "photography",
        icon: "photography",
        title: { en: "Photography", id: "Fotografi" },
        summary: {
          en: "Photos are fine from the poolside paths.",
          id: "Foto diperbolehkan dari jalur tepi kolam.",
        },
        detail: {
          en: "Photograph the pools from the surrounding paths. Ask before photographing someone who is purifying, and do not stand higher than a priest.",
          id: "Foto kolam dari jalur di sekelilingnya. Minta izin sebelum memotret orang yang sedang melukat, dan jangan berdiri lebih tinggi daripada pedanda.",
        },
        ruleIds: ["photography", "head-level-respect"],
      },
      {
        id: "offerings",
        icon: "offerings",
        title: { en: "Offerings", id: "Sesaji" },
        summary: {
          en: "Offerings line the pools and walkways.",
          id: "Sesaji berjajar di kolam dan jalur.",
        },
        detail: {
          en: "Offerings are placed around the pools and along the walkways. Step around them and never walk over them.",
          id: "Sesaji diletakkan di sekitar kolam dan di sepanjang jalur. Berjalanlah mengelilinginya dan jangan pernah melangkahinya.",
        },
        ruleIds: ["offerings-canang"],
      },
      {
        id: "quiet",
        icon: "quiet",
        title: { en: "Quiet", id: "Tenang" },
        summary: {
          en: "Keep your voice low near the water.",
          id: "Jaga suara tetap pelan di dekat air.",
        },
        detail: {
          en: "People come here to purify in silence. Keep your voice low and let those who are bathing finish without disturbance.",
          id: "Orang datang ke sini untuk melukat dengan hening. Jaga suara tetap pelan dan biarkan mereka yang sedang mandi selesai tanpa gangguan.",
        },
        ruleIds: ["speaking-volume"],
      },
    ],
  },
  {
    id: "pura-ulun-danu-beratan",
    name: "Pura Ulun Danu Beratan",
    region: "Tabanan, Bali",
    areaLabel: { en: "Temple on the mountain lake", id: "Pura di tepi danau pegunungan" },
    lat: -8.275,
    lng: 115.1668,
    radiusM: 350,
    source: "Bali Governor Circular No. 7/2025",
    odalanDates: [],
    customs: [
      {
        id: "dress",
        icon: "dress",
        title: { en: "Dress", id: "Pakaian" },
        summary: {
          en: "A kamen and sash are required inside the temple.",
          id: "Kamen dan selendang wajib dikenakan di dalam pura.",
        },
        detail: {
          en: "A kamen and sash are required inside the temple grounds on the lake. They are lent or rented at the entrance.",
          id: "Kamen dan selendang wajib dikenakan di dalam area pura di tepi danau. Keduanya dipinjamkan atau disewakan di pintu masuk.",
        },
        ruleIds: ["temple-attire"],
      },
      {
        id: "photography",
        icon: "photography",
        title: { en: "Photography", id: "Fotografi" },
        summary: {
          en: "Photos are fine around the lake gardens.",
          id: "Foto diperbolehkan di sekitar taman danau.",
        },
        detail: {
          en: "Photograph the lake and the surrounding gardens freely. Ask before photographing someone who is praying, and keep to the paths.",
          id: "Foto danau dan taman di sekelilingnya dengan leluasa. Minta izin sebelum memotret orang yang sedang sembahyang, dan tetap di jalur.",
        },
        ruleIds: ["photography"],
      },
      {
        id: "drones",
        icon: "drones",
        title: { en: "Drones", id: "Drone" },
        summary: {
          en: "Flying drones over the lake is not permitted.",
          id: "Menerbangkan drone di atas danau tidak diizinkan.",
        },
        detail: {
          en: "Flying drones over the temple or the lake is not permitted. This is enforced, and it disturbs the calm of the site.",
          id: "Menerbangkan drone di atas pura atau danau tidak diizinkan. Hal ini ditegakkan dan mengganggu ketenangan kawasan.",
        },
        ruleIds: ["drone-restriction"],
      },
      {
        id: "quiet",
        icon: "quiet",
        title: { en: "Quiet", id: "Tenang" },
        summary: {
          en: "Keep your voice low near the lake shrine.",
          id: "Jaga suara tetap pelan di dekat pelinggih danau.",
        },
        detail: {
          en: "Keep your voice low near the shrine and the gardens. Let a ceremony pass rather than crossing through it.",
          id: "Jaga suara tetap pelan di dekat pelinggih dan taman. Biarkan upacara berlalu alih-alih menyeberang di tengahnya.",
        },
        ruleIds: ["speaking-volume"],
      },
    ],
  },
];