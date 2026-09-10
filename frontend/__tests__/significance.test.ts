import { describe, expect, it } from "vitest";
import { SITES } from "@/data/sites";
import { buildDummySites } from "@/data/dummy-sites";
import { SIGNIFICANCE } from "@/data/significance";

const entries = Object.entries(SIGNIFICANCE);

/**
 * `Significance` is a cultural claim a visitor reads and acts on, exactly like
 * a Custom, and unlike a Custom it traces to nothing structural. These are the
 * checks that stand in for the traceability it cannot inherit.
 *
 * The file is expected to be mostly empty for a while. That is a passing state:
 * a Site with no entry shows nothing extra, so the failure mode this guards
 * against is never "too few entries" - it is one entry that should not have
 * been written.
 */
describe("every Significance entry is attributable", () => {
  it.each(entries)("%s names a source", (_id, entry) => {
    expect(entry.source.trim().length).toBeGreaterThan(10);
  });

  // The objection `rules-sourcing.test.ts` already records against the same
  // phrase: it names nobody who could be asked, so it is not a source.
  it.each(entries)("%s does not fall back to a blanket 'adat'", (_id, entry) => {
    expect(entry.source.trim().toLowerCase()).not.toBe("balinese hindu custom (adat)");
    expect(entry.source.trim().toLowerCase()).not.toBe("adat");
  });

  it.each(entries)("%s says something in both languages", (_id, entry) => {
    expect(entry.text.en.trim().length).toBeGreaterThan(30);
    expect(entry.text.id.trim().length).toBeGreaterThan(30);
    // Two languages, not one language pasted twice.
    expect(entry.text.en.trim()).not.toBe(entry.text.id.trim());
  });

  it.each(entries)("%s gives a URL that can actually be opened, if it gives one", (_id, entry) => {
    if (entry.sourceUrl === undefined) return;
    expect(entry.sourceUrl).toMatch(/^https:\/\/\S+$/);
  });
});

describe("every Significance entry belongs to a Site", () => {
  const realIds = new Set(SITES.map((site) => site.id));

  it.each(entries)("%s is a Site in the catalogue", (id) => {
    // A typo here is an entry that never renders and never complains.
    expect(realIds.has(id)).toBe(true);
  });

  // A Dummy Site's name and location are invented (ADR-0012). Writing what one
  // means would be inventing the culture of a place that does not exist, which
  // is a longer way of describing the thing this app exists to prevent.
  it("never describes a Dummy Site", () => {
    const dummies = buildDummySites({ lat: -6.2, lng: 106.8 }).map((site) => site.id);
    for (const id of dummies) {
      expect(SIGNIFICANCE[id]).toBeUndefined();
    }
  });
});

describe("Significance states no ceremony date", () => {
  /**
   * A specific day, in the shapes one is actually written: `2027-02-02`,
   * `2 February 2027`, `2 Februari 2027`.
   *
   * Bare years are deliberately allowed. A founding year happened once and
   * stays happened; what ADR-0004 guards against is a claim that decays, and
   * `Odalan` is where those live, with the calendar anchor and source that make
   * one safe to state. Frequency is allowed too, and for the same reason it is
   * allowed in a description: it may be stated when it carries a source, and
   * every entry here carries one by construction.
   */
  const A_DATE =
    /\d{4}-\d{2}-\d{2}|\b\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December|Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\b/i;

  it.each(entries)("%s carries no date", (_id, entry) => {
    expect(entry.text.en).not.toMatch(A_DATE);
    expect(entry.text.id).not.toMatch(A_DATE);
  });

  it("would catch one", () => {
    // The guard has to be able to fail, or it is decoration.
    expect("The odalan falls on 2 February 2027.").toMatch(A_DATE);
    expect("Odalannya jatuh pada 2 Februari 2027.").toMatch(A_DATE);
    expect("The temple was founded in 962.").not.toMatch(A_DATE);
  });
});
