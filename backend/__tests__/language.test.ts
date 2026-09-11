import { describe, expect, it } from "vitest";
import { detectLang } from "@/lib/language";

// The bug this guards: the reply used to follow the UI's language toggle
// rather than the question, so a visitor who left the site on English and
// typed Indonesian got an Indonesian question answered back in English.

describe("detectLang — reads the question, not the toggle", () => {
  it.each([
    "apakah boleh saya membawa makanan ke dalam pura?",
    "bisakah saya membawa makanan ke dalam pura",
    "boleh pakai celana pendek di sini?",
    "kapan boleh masuk area suci?",
  ])("calls Indonesian even when the toggle is English: %s", (message) => {
    expect(detectLang(message, "en")).toBe("id");
  });

  it.each([
    "what are the main balinese customs I should know?",
    "can I bring food into the temple?",
    "what should I wear at a temple?",
  ])("calls English even when the toggle is Indonesian: %s", (message) => {
    expect(detectLang(message, "id")).toBe("en");
  });
});

describe("detectLang — falls back to the toggle when the question has no signal", () => {
  it.each(["Tanah Lot?", "Melasti", "Nyepi 2026"])(
    "%s carries no language of its own",
    (message) => {
      expect(detectLang(message, "en")).toBe("en");
      expect(detectLang(message, "id")).toBe("id");
    },
  );

  it("an empty message falls back too", () => {
    expect(detectLang("", "id")).toBe("id");
  });
});

// The bug this guards: the lists above hold function words only, which is the
// right shape for a sentence and useless for a phrase. "rekomendasi kegiatan"
// is unmistakably Indonesian to any reader and scored zero on both lists, so
// the toggle broke the tie and an Indonesian question came back in English.
// Reported from the live app with the toggle on EN.

describe("detectLang — reads content words, not just function words", () => {
  it.each([
    "rekomendasi kegiatan",
    "aturan pakaian",
    "penginapan terdekat",
    "kegiatan wisata",
    "informasi upacara",
    "pertanyaan tentang pura",
  ])("calls Indonesian even when the toggle is English: %s", (message) => {
    expect(detectLang(message, "en")).toBe("id");
  });

  it.each([
    "temple recommendations",
    "clothing regulations",
    "nearby accommodation",
    "photography restrictions",
  ])("calls English even when the toggle is Indonesian: %s", (message) => {
    expect(detectLang(message, "id")).toBe("en");
  });
});
