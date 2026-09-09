// The fence that lets the assistant answer widely without answering wrongly.
//
// Two of the three answering tiers - `context` and `general` - come from the
// model's own knowledge with no Rule behind them, so something has to bound
// them. The bound is NOT the topic. "Culture" versus "logistics" is a line no
// machine can hold, and every argument about which side a question falls on is
// an argument the line eventually loses.
//
// The bound is VOLATILITY: an answer may say what something means and what has
// happened, never what is happening. A fact that changes is a fact that will
// become wrong, and answers here are stored and replayed to later visitors, so
// time turns one stale sentence into a permanent one. Business recommendations
// fall the same way - nobody can check the warung is still open, or was ever
// any good.
//
// This module is the NET, not the fence. The prompt is the fence: it tells the
// model what it must not say, and that is what does nearly all the work. The
// net only catches the obvious misses, so it is tuned for precision. A few
// escapes are cheaper than killing a good answer, and a false positive here is
// invisible - the visitor just sees a refusal and never learns why.
//
// The patterns are read twice, against two different things. Over an ANSWER
// they decide whether it may be shown at all. Over a QUESTION they decide only
// which refusal a visitor reads, and that second reading exists because a live
// run showed the first one is not enough: asked "berapa harga tiket masuk?",
// the model refused on its own, the net never fired, and the refusal came back
// worded as though no rule covered the topic - offering "Akses", matched on the
// word "masuk". The visitor asked about a price and was offered the inner
// courtyard.

// Phrases, not bare stems, and the reason is worth keeping in view: `tutup`
// lives inside `menutupi bahu` - cover your shoulders - which is among the most
// common correct answers this whole app gives. A stem match would refuse it.
const VOLATILE = [
  // Opening and closing.
  /\bjam\s+(buka|tutup|operasional|berapa)\b/i,
  /\b(buka|tutup|tutupnya|bukanya)\s+(pukul|jam)\b/i,
  /\bopening\s+(hours?|times?)\b/i,
  /\b(opens?|closes?|closed)\s+at\b/i,
  /\bwhat\s+time\s+(does|do|is)\b/i,

  // Money. `\d` is required throughout so that "Pulau Seribu Pura" - a thousand
  // temples, no digit in sight - cannot trip the "ribu" pattern.
  /\bRp\.?\s*\d/i,
  /\b\d[\d.,]*\s*(ribu|juta|rb)\b/i,
  /\b(harga|biaya|tarif)\s+(tiket|masuk|parkir|sewa)\b/i,
  /\btiket\s+masuk\b/i,
  /\b(ticket\s+price|entrance\s+fee|admission\s+fee)\b/i,

  // Schedules. Narrowed to the noun it governs: a cultural answer may well say
  // "upacara mengikuti kalender Bali" and should not be caught for it.
  /\bjadwal\s+(upacara|buka|kunjungan|acara|ritual)\b/i,
  /\b(timetable|schedule\s+of\s+(events?|ceremonies))\b/i,
];

/**
 * True when an ungrounded answer states something that will not stay true.
 *
 * Only ever applied to `context` and `general`. A `rule` answer skips it on
 * purpose: its content came from the knowledge base, which carries no volatile
 * fact anywhere in it, so the only thing this could do there is refuse a
 * correctly grounded answer for using an unlucky word.
 */
export function statesVolatileFact(answer: string): boolean {
  return VOLATILE.some((pattern) => pattern.test(answer));
}

// Shapes a question takes that a statement does not. "Jam buka berapa?" is
// already caught by the list above; these are the ones that only appear when
// somebody is asking.
//
// Kept as narrow as the rest, and for the same reason: a false positive sends a
// perfectly answerable question to the wrong refusal. "kapan" alone is far too
// broad - "kapan canang diletakkan?" is daily practice and has an answer - so
// it is only matched against the nouns that make it a request for a date.
const VOLATILE_QUESTION = [
  /\bbuka\s+jam\s+berapa\b/i,
  /\b(masih|sedang|lagi)\s+(buka|tutup)\b/i,
  /\bberapa\s+harga/i,
  /\bhow\s+much\b/i,
  /\b(is|are)\s+(it|they)\s+open\b/i,
  /\bkapan\s+(upacara|odalan|piodalan|melasti|ngaben|ceremony)\b/i,
  /\bwhen\s+is\s+the\s+(ceremony|odalan|festival)\b/i,
];

/**
 * True when the question is asking for something that will not stay true.
 *
 * Used only to choose the wording of a refusal, never to suppress an answer.
 * Getting it wrong therefore costs a sentence, not a fact - which is why it can
 * afford to read the question at all, where the answer-side net cannot.
 */
export function asksForVolatileFact(question: string): boolean {
  return statesVolatileFact(question) || VOLATILE_QUESTION.some((p) => p.test(question));
}
