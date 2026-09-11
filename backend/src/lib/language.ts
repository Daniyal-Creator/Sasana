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

// Affixes, read when the word lists come up empty.
//
// The lists above hold function words, which is the right shape for a sentence
// and useless for a phrase. "rekomendasi kegiatan" is unmistakably Indonesian
// to any reader and contains not one function word, so it scored 0-0, the
// toggle broke the tie, and a visitor who typed Indonesian on a site left in
// English was answered in English. A two-word question is exactly what people
// type, so "no function words" must not keep meaning "no language".
//
// Morphology is what makes this cheap and safe rather than a vocabulary list
// nobody can keep up to date. Indonesian is agglutinative and English is not,
// so the two spell their endings almost disjointly: nothing English ends in
// -nya or -kah, and nothing Indonesian ends in -tion or -ness. Every pattern
// is anchored and carries a length floor, because short words are where the
// two languages actually collide.
//
const ID_MORPHOLOGY: RegExp[] = [
  // Clitics and the verb suffix. No English word ends in any of them.
  /^.{2,}(nya|kah|lah|kan)$/,
  // The -si that Indonesian gives loanwords English spells -tion: rekomendasi,
  // informasi, lokasi, tradisi, kondisi, akomodasi.
  /^.{4,}si$/,
  // The -an nominaliser, which is the productive one: aturan, pakaian,
  // makanan, larangan, bangunan, and every ke-...-an and pe(r)-...-an built on
  // top of it - kegiatan, keamanan, penginapan, peraturan, pertanyaan. Writing
  // the two circumfixes out separately only looked more careful; both are
  // longer than this and so already matched by it.
  //
  // The floor of six is what does the work, because the common English
  // collisions are all five: human, woman, urban, ocean, organ, clean, began.
  // What stays in is the -ian family and a short tail of nouns - pedestrian,
  // vegetarian, american, guardian, artisan, veteran, slogan, orphan, turban.
  // Each costs exactly one point, and an English sentence long enough to hold
  // one carries English function words too, so a bare English phrase built
  // only out of them is what it would take to change an answer. That is the
  // same trade the volatility net makes: a rare miss is cheaper than dropping
  // the words this exists to read.
  /^.{4,}an$/,
];

const EN_MORPHOLOGY: RegExp[] = [
  // The Latinate endings, including the -tion that pairs with -si above.
  // Optional plural, because "regulations" and "restrictions" are how the
  // questions this has to read are actually worded.
  /^.{2,}(tion|sion|ment|ness|less|ful)s?$/,
  // -ly and -ed, neither of which Indonesian produces: properly, politely,
  // allowed, covered, closed.
  /^.{3,}(ly|ed)$/,
];

function matches(patterns: RegExp[], token: string): boolean {
  return patterns.some((pattern) => pattern.test(token));
}

/**
 * Best guess at which of the app's two languages a message is written in.
 *
 * Scored on function words and, where those run out, on affixes, rather than
 * parsed properly: there are only two languages to tell apart and both ship a
 * fixed word list already (see `LANG_NAME` in prompts.ts).
 *
 * `fallback` - the visitor's UI language - still wins on a tie, because a tie
 * now means something much narrower than it used to. "Tanah Lot?", "Melasti",
 * "Nyepi 2026": a bare proper noun genuinely carries no language, and the
 * toggle is the only thing left that knows what the visitor reads.
 */
export function detectLang(message: string, fallback: Lang): Lang {
  const tokens = message.toLowerCase().split(/\W+/).filter(Boolean);

  let idScore = 0;
  let enScore = 0;
  for (const token of tokens) {
    // A function word is the stronger evidence, so a token that is one is never
    // also read for its ending: "makanan" should not outweigh "makan".
    if (ID_SIGNAL.has(token)) idScore++;
    else if (matches(ID_MORPHOLOGY, token)) idScore++;

    if (EN_SIGNAL.has(token)) enScore++;
    else if (matches(EN_MORPHOLOGY, token)) enScore++;
  }

  if (idScore === enScore) return fallback;
  return idScore > enScore ? "id" : "en";
}
