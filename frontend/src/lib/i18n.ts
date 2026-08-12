// All user-facing copy, EN + ID, from ui-spec §10. Copy rules: lead with the fix,
// no marketing filler, no em dashes (guardrails §9).

import type { Lang } from "@shared/contract";

// Re-exported so components can keep importing Lang alongside t() from here.
// The single definition lives in shared/contract.ts, because the backend needs
// the same type to read the `lang` field off a request.
export type { Lang };

type Entry = { en: string; id: string };

const dict = {
  "app.name": { en: "SASANA", id: "SASANA" },
  "app.tagline": {
    en: "Understand and respect Balinese customs, before you enter.",
    id: "Pahami dan hormati adat Bali, sebelum Anda masuk.",
  },
  "nav.back": { en: "Back", id: "Kembali" },
  "nav.home": { en: "Home", id: "Beranda" },
  "nav.about": { en: "About", id: "Tentang" },
  "lang.label": { en: "Language", id: "Bahasa" },

  "landing.lead": {
    en: "Your friendly guide to sacred sites in Bali.",
    id: "Panduan ramah Anda untuk tempat suci di Bali.",
  },
  "landing.badge": {
    en: "Based on Bali Governor Circular No. 7/2025",
    id: "Berdasarkan SE Gubernur Bali No. 7/2025",
  },
  "cta.check.title": { en: "Situation Check", id: "Cek Situasi" },
  "cta.check.desc": {
    en: "Check a photo against local custom.",
    id: "Periksa foto sesuai adat setempat.",
  },
  "cta.assistant.title": { en: "Ask the Assistant", id: "Tanya Asisten" },
  "cta.assistant.desc": {
    en: "Questions about the rules, answered.",
    id: "Pertanyaan tentang aturan, terjawab.",
  },
  "how.title": { en: "How it works", id: "Cara kerjanya" },
  "how.step1": { en: "Snap or upload a photo", id: "Ambil atau unggah foto" },
  "how.step2": { en: "Get friendly feedback", id: "Dapatkan masukan yang ramah" },
  "how.step3": { en: "Enter with confidence", id: "Masuk dengan percaya diri" },
  "footer.disclaimer": {
    en: "Not affiliated with the Bali government. Reference: Governor Circular No. 7/2025.",
    id: "Tidak berafiliasi dengan pemerintah Bali. Rujukan: Surat Edaran Gubernur No. 7/2025.",
  },
  "footer.privacy": { en: "Photos are never stored.", id: "Foto tidak pernah disimpan." },

  "check.title": { en: "Situation Check", id: "Cek Situasi" },
  "check.subtitle": {
    en: "Check your photo against Balinese custom.",
    id: "Periksa foto Anda sesuai adat Bali.",
  },
  "check.context.label": { en: "Where are you?", id: "Anda sedang di mana?" },
  "check.context.temple": { en: "At a temple", id: "Di pura" },
  "check.context.general": { en: "General", id: "Umum" },
  "check.upload.prompt": { en: "Take or upload a photo", id: "Ambil atau unggah foto" },
  "check.upload.hint": { en: "JPG or PNG, up to 5 MB", id: "JPG atau PNG, maksimal 5 MB" },
  "check.upload.take": { en: "Take photo", id: "Ambil foto" },
  "check.upload.pick": { en: "Upload", id: "Unggah" },
  "check.upload.clear": { en: "Remove photo", id: "Hapus foto" },
  "check.upload.errorType": {
    en: "Please choose a JPG or PNG image.",
    id: "Silakan pilih gambar JPG atau PNG.",
  },
  "check.upload.errorSize": {
    en: "That image is over 5 MB. A smaller one will work.",
    id: "Gambar itu melebihi 5 MB. Gunakan yang lebih kecil.",
  },
  "check.photo.alt": { en: "Your uploaded photo", id: "Foto yang Anda unggah" },
  "check.privacy": {
    en: "Your photo is analyzed once and never stored. On the free AI tier, Google may use submitted data to improve its products.",
    id: "Foto Anda dianalisis sekali saja dan tidak pernah disimpan. Pada layanan AI gratis, Google dapat memakai data yang dikirim untuk meningkatkan produknya.",
  },
  "check.analyze": { en: "Analyze photo", id: "Analisis foto" },
  "check.loading": { en: "Analyzing your photo…", id: "Menganalisis foto Anda…" },
  "check.reset": { en: "Check another", id: "Cek yang lain" },
  "check.unclear.retake": { en: "Retake photo", id: "Ambil ulang foto" },
  "check.source": { en: "Reference: {source}", id: "Rujukan: {source}" },
  "check.error": {
    en: "Something went wrong analyzing your photo. Please try again.",
    id: "Terjadi masalah saat menganalisis foto Anda. Silakan coba lagi.",
  },
  "common.retry": { en: "Try again", id: "Coba lagi" },

  "result.compliant": { en: "You're good to go", id: "Anda sudah sesuai" },
  "result.needs_attention": { en: "A small thing to check", id: "Ada hal kecil untuk diperiksa" },
  "result.not_compliant": { en: "Please adjust before entering", id: "Mohon sesuaikan sebelum masuk" },
  "result.unclear": {
    en: "I can't tell from this photo",
    id: "Saya belum bisa memastikan dari foto ini",
  },
  "result.tip.compliant": { en: "Tip", id: "Tips" },
  "result.tip.needs_attention": { en: "Suggestion", id: "Saran" },
  "result.tip.not_compliant": { en: "Suggestion", id: "Saran" },
  "result.tip.unclear": { en: "Try this", id: "Coba ini" },

  "assistant.welcome.title": { en: "Hi, I'm Sasana", id: "Hai, saya Sasana" },
  "assistant.welcome.body": {
    en: "Ask me anything about Balinese customs and sacred sites. I answer from the official rules.",
    id: "Tanyakan apa saja tentang adat Bali dan tempat suci. Saya menjawab dari aturan resmi.",
  },
  "assistant.tryasking": { en: "Try asking:", id: "Coba tanyakan:" },
  "assistant.chip.shorts": {
    en: "Can I wear shorts at a temple?",
    id: "Boleh pakai celana pendek di pura?",
  },
  "assistant.chip.drone": {
    en: "Can I fly a drone at Tanah Lot?",
    id: "Boleh terbangkan drone di Tanah Lot?",
  },
  "assistant.chip.canang": { en: "What is a canang offering?", id: "Apa itu canang?" },
  "assistant.chip.photo": {
    en: "Is it okay to take photos inside?",
    id: "Boleh memotret di dalam?",
  },
  "assistant.input.placeholder": { en: "Ask about a custom…", id: "Tanya tentang adat…" },
  "assistant.send": { en: "Send", id: "Kirim" },
  "assistant.helper": {
    en: "Answers come from official rules, not opinions.",
    id: "Jawaban berasal dari aturan resmi, bukan opini.",
  },
  "assistant.source": { en: "Source: {source}", id: "Sumber: {source}" },
  "assistant.typing": { en: "Sasana is typing…", id: "Sasana sedang mengetik…" },
  "assistant.error": {
    en: "I couldn't reach the assistant just now. Please try again.",
    id: "Saya belum bisa menghubungi asisten saat ini. Silakan coba lagi.",
  },
  "assistant.nosource": {
    en: "No official rule found for this",
    id: "Tidak ada aturan resmi yang ditemukan untuk ini",
  },
  "sr.you": { en: "You said", id: "Anda berkata" },
  "sr.assistant": { en: "Sasana said", id: "Sasana berkata" },

  "about.title": { en: "About SASANA", id: "Tentang SASANA" },
  "about.mission.title": { en: "Our mission", id: "Misi kami" },
  "about.mission.body": {
    en: "SASANA helps visitors understand and respect Bali's customs, in real time and in their own language, so that violations are prevented before they happen.",
    id: "SASANA membantu wisatawan memahami dan menghormati adat Bali, secara langsung dan dalam bahasa mereka sendiri, agar pelanggaran dapat dicegah sebelum terjadi.",
  },
  "about.rules.title": { en: "The rules we reference", id: "Aturan yang kami rujuk" },
  "about.rules.body": {
    en: "Governor Circular (SE) No. 7 of 2025 on the code of conduct for foreign tourists in Bali.",
    id: "Surat Edaran Gubernur (SE) No. 7 Tahun 2025 tentang tata krama bagi wisatawan asing di Bali.",
  },
  "about.rules.link": { en: "Read the official source", id: "Baca sumber resmi" },
  "about.team.title": { en: "The team", id: "Tim kami" },
  "about.team.org": {
    en: "SMK Wikrama Bogor · SASANA Group",
    id: "SMK Wikrama Bogor · SASANA Group",
  },
  "about.version": { en: "SASANA v1.0 (MVP)", id: "SASANA v1.0 (MVP)" },
} satisfies Record<string, Entry>;

export type CopyKey = keyof typeof dict;

export function t(lang: Lang, key: CopyKey, params?: Record<string, string>): string {
  let text = dict[key][lang];
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replace(`{${name}}`, value);
    }
  }
  return text;
}
