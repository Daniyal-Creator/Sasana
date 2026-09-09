import type { Lang } from "@shared/contract";

// The bug this exists to fix: the UI's language toggle used to double as the
// reply language, so a visitor who left the site on English and typed a
// question in Indonesian got an Indonesian rule explained back to them in
// English. The reply has to follow what the visitor actually typed, not
// whatever the toggle happens to be set to.
//
// Function words rather than domain words, because "pura", "canang", and site
// names show up in a question written in either language and would not tell
// the two apart. Deliberately not shared with `STOPWORDS` in knowledge.ts:
// that set pools both languages together on purpose, because retrieval only
// cares that a token is filler, never which language it is filler in.
const ID_SIGNAL = new Set([
  "yang", "dan", "di", "ke", "dari", "ini", "itu", "dengan", "untuk", "pada",
  "adalah", "saya", "kamu", "anda", "apakah", "apa", "bisa", "boleh", "tidak",
  "bukan", "akan", "harus", "juga", "atau", "jika", "kalau", "bagaimana",
  "kapan", "dimana", "mengapa", "kenapa", "siapa", "ada", "saja", "sudah",
  "belum", "mau", "ingin", "gimana", "namun", "tetapi", "tapi", "karena",
  "sebab", "supaya", "agar", "ketika", "saat", "sebelum", "sesudah", "setelah",
  "selama", "dalam", "membawa", "makanan", "tempat", "masuk", "silakan",
  "terima", "kasih", "kah", "sini", "situ", "begitu",
]);

const EN_SIGNAL = new Set([
  "the", "is", "are", "was", "were", "what", "where", "when", "why", "who",
  "how", "can", "could", "should", "would", "will", "shall", "do", "does",
  "did", "have", "has", "had", "this", "that", "these", "those", "and", "but",
  "because", "if", "then", "for", "without", "about", "to", "from", "of",
  "in", "on", "at", "by", "as", "it", "its", "you", "he", "she", "they",
  "we", "food", "bring", "allowed", "may", "not", "please", "thanks",
]);

/**
 * Best guess at which of the app's two languages a message is written in.
 *
 * Scored on function words rather than parsed properly, because there are
 * only two languages to tell apart and both ship a fixed word list already
 * (see `LANG_NAME` in prompts.ts). `fallback` - the visitor's UI language -
 * wins on a tie, which is what a one-word question or a bare place name
 * reduces to: there is no signal in "Tanah Lot?" and the toggle is the only
 * thing left that knows what the visitor reads.
 */
export function detectLang(message: string, fallback: Lang): Lang {
  const tokens = message.toLowerCase().split(/\W+/).filter(Boolean);

  let idScore = 0;
  let enScore = 0;
  for (const token of tokens) {
    if (ID_SIGNAL.has(token)) idScore++;
    if (EN_SIGNAL.has(token)) enScore++;
  }

  if (idScore === enScore) return fallback;
  return idScore > enScore ? "id" : "en";
}
