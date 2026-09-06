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
