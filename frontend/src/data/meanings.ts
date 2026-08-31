import type { Localized } from "@/data/sites";

// The cultural-meaning layer, keyed by Rule id. Explore runs entirely against
// bundled data with no network call, so this cannot be fetched from the backend
// at runtime. It is a copy of the why_en / why_id / why_source fields in
// backend/src/data/rules.json (ADR-0002).
//
// A copy can drift, so it is not trusted to stay true by hand:
// __tests__/site-rules.test.ts reads rules.json and fails if any entry here
// disagrees with it, or if a Custom references a Rule that has no entry here.
// Regenerate this file rather than retyping it.
//
// Nothing here may be written from memory. The standard is the one that applies
// to a Custom, because a visitor acts on it either way.

export interface Meaning {
  /** Why the custom behind this Rule exists, in the visitor's language. */
  why: Localized;
  /** Attribution for the cultural claim. Shown to the visitor, never guessed. */
  source: string;
}

export const MEANINGS: Record<string, Meaning> = {
  "drone-restriction": {
    why: {
      en: "In Balinese cosmology height carries rank, so an object hovering above shrines and above people at prayer is a problem in itself, separate from the noise or the privacy of those below.",
      id: "Dalam kosmologi Bali, ketinggian mengandung makna kedudukan, sehingga benda yang melayang di atas pelinggih dan di atas orang yang bersembahyang sudah menjadi masalah tersendiri, terlepas dari soal kebisingan atau privasi orang di bawahnya.",
    },
    source: "Vertical hierarchy (height as rank) in Balinese Hindu practice",
  },
  "head-level-respect": {
    why: {
      en: "Balinese Hindus treat the head as the most sacred part of the body and the feet as the least. That vertical order shapes where people sit and stand at a temple, so rising above a priest or a shrine, or pointing the soles of the feet toward something sacred, turns it upside down.",
      id: "Umat Hindu Bali memandang kepala sebagai bagian tubuh yang paling suci dan kaki sebagai yang paling rendah. Tatanan atas-bawah itu menentukan di mana orang duduk dan berdiri di pura, sehingga berada lebih tinggi dari pemangku atau pelinggih, atau mengarahkan telapak kaki ke benda suci, membalik tatanan tersebut.",
    },
    source: "Head-and-feet hierarchy in Balinese Hindu custom",
  },
  "offerings-canang": {
    why: {
      en: "Canang sari is a daily offering of thanks: canang refers to the small woven palm-leaf tray and sari means essence. Filled with flowers, a little food, and incense, it is made fresh most mornings and placed at shrines, doorways, and along paths. It expresses the balance Balinese Hindus call Tri Hita Karana, harmony with the divine, with other people, and with nature. A canang on the ground is a finished prayer, not litter, which is why it is left where it lies.",
      id: "Canang sari adalah persembahan syukur harian: canang merujuk pada wadah kecil anyaman daun kelapa dan sari berarti inti atau esensi. Diisi bunga, sedikit makanan, dan dupa, canang dibuat baru hampir setiap pagi lalu diletakkan di pelinggih, depan pintu, dan sepanjang jalan. Canang mengungkapkan keseimbangan yang disebut Tri Hita Karana, yaitu keselarasan dengan Tuhan, sesama manusia, dan alam. Canang di tanah adalah doa yang sudah selesai, bukan sampah, karena itu dibiarkan di tempatnya.",
    },
    source: "Canang sari tradition; Tri Hita Karana philosophy (parahyangan, pawongan, palemahan)",
  },
  "photography": {
    why: {
      en: "Someone at prayer is in the middle of an address to the divine. Standing in front of them interrupts that, and climbing higher for a better angle places the photographer above both the worshipper and the shrine, which Balinese custom reads as a claim of rank.",
      id: "Orang yang sedang bersembahyang berada di tengah komunikasi dengan Tuhan. Berdiri di depannya memutus hal itu, dan memanjat demi sudut foto yang lebih baik menempatkan si pemotret lebih tinggi daripada orang yang berdoa maupun pelinggih, yang dalam adat Bali dibaca sebagai penegasan kedudukan.",
    },
    source: "Balinese Hindu custom (adat); vertical hierarchy of position at sacred sites",
  },
  "sacred-area-entry": {
    why: {
      en: "A pura is laid out in three concentric courtyards called tri mandala: nista mandala on the outside for everyday and public activity, madya mandala in the middle where offerings are prepared, and utama mandala at the centre where the main shrines stand. Access narrows as sanctity rises, so the innermost courtyard is kept for those who have come to pray.",
      id: "Pura ditata dalam tiga halaman berlapis yang disebut tri mandala: nista mandala di luar untuk kegiatan sehari-hari dan umum, madya mandala di tengah tempat sesajen disiapkan, dan utama mandala di pusat tempat pelinggih utama berdiri. Semakin suci sebuah zona, semakin terbatas aksesnya, sehingga halaman terdalam disediakan bagi yang datang untuk bersembahyang.",
    },
    source: "Tri mandala zoning in Balinese temple architecture",
  },
  "speaking-volume": {
    why: {
      en: "A pura is a working place of prayer rather than a monument that happens to be old. Ceremonies frequently continue while visitors walk through, and because the courtyards and pavilions are open-sided, a raised voice carries across the whole compound.",
      id: "Pura adalah tempat ibadah yang masih aktif, bukan monumen tua yang sekadar dikunjungi. Upacara sering tetap berlangsung ketika pengunjung berjalan melintas, dan karena halaman serta balenya terbuka tanpa dinding penuh, suara keras terdengar ke seluruh area pura.",
    },
    source: "Balinese Hindu custom (adat); temples as active places of worship",
  },
  "temple-attire": {
    why: {
      en: "The kamen and selendang are not a uniform. The sash is tied at the waist to mark the boundary between the upper and lower halves of the body, and putting it on is how a visitor signals purity and sincerity before entering a place of worship.",
      id: "Kamen dan selendang bukan sekadar seragam. Selendang diikat di pinggang untuk menandai batas antara tubuh bagian atas dan bawah, dan mengenakannya adalah cara pengunjung menyatakan kesucian serta ketulusan sebelum memasuki tempat ibadah.",
    },
    source: "Balinese temple practice: selendang as a marker of purity and sincerity in worship",
  },
};
