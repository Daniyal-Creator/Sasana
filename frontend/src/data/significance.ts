import type { Localized } from "@/data/sites";

// What a Site is, and what people do there. Keyed by Site id.
//
// The layer next to `meanings.ts`, and deliberately shaped like it: that one
// answers "why is this Custom asked of me", this one answers "what is this
// place". Both are cultural claims a visitor acts on, so both carry their own
// attribution and neither may be written from memory.
//
// The line this file walks, and the reason it is mostly empty:
//
//   A Custom traces to a Rule, and `rules-sourcing.test.ts` says what a Rule may
//   cite. Nothing traces a sentence about what a temple means, so the honest
//   version of that guarantee here is a source per entry and an entry only when
//   a source was actually read. Bali's temples are written about endlessly by
//   people selling tours; a paragraph assembled from that reads exactly like one
//   assembled from an archive, which is why the standard is the reading rather
//   than the prose.
//
// Entries arrive one at a time as sources are found. A Site with no entry shows
// nothing extra and behaves exactly as it did before this file existed, which
// is why an empty record is a safe state rather than an unfinished one.
// `.scratch/pariwisata/riset-significance.md` is the outstanding request.

export interface Significance {
  /** What this place is and what people do there, in the visitor's language. */
  text: Localized;
  /**
   * Who says so. Shown to the visitor, never guessed.
   *
   * A named body or a published work. "Balinese custom" is not a source: it
   * names no one who could be asked, which is the objection
   * `rules-sourcing.test.ts` already records against the same phrase.
   */
  source: string;
  /**
   * The page it was read from, when there is one.
   *
   * Optional because a book is a source and has no URL. Present wherever the
   * source is online, so the next person can check the sentence rather than
   * trust that somebody did.
   */
  sourceUrl?: string;
}

/**
 * No dates in here. Ever.
 *
 * A ceremony date is the one claim in this app that decays on its own, and
 * `Odalan` already carries the calendar anchor and the source that make one
 * safe to state (ADR-0004). A second field allowed to say when something
 * happens is a second door to the same failure, so this one says what a place
 * is and leaves the calendar alone. A founding year is not that: it happened
 * once and stays happened.
 */
export const SIGNIFICANCE: Record<string, Significance> = {
  "pura-tirta-empul": {
    text: {
      en: "The spring is the reason the temple is here. Its water is held to heal and to cleanse the body and the soul, and people come to bathe in it.",
      id: "Mata airnya adalah alasan pura ini berdiri. Airnya diyakini menyembuhkan serta menyucikan badan dan jiwa, dan orang datang untuk mandi di sana.",
    },
    // Deliberately no further than the page goes. The fountain sequence, the
    // Manukaya inscription and the Maya Denawa story are all reported about
    // this temple and are probably true; none of them appear in a source that
    // could be opened and read, so none of them are here.
    source: "Bali Government travel guidelines (Love Bali)",
    sourceUrl: "https://lovebali.baliprov.go.id/destination/detail/109/tirta-empul",
  },
};
