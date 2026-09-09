import { describe, expect, it } from "vitest";
import { asksForVolatileFact, statesVolatileFact } from "@/lib/volatility";

// This net is what makes it safe to let the assistant answer beyond the rules,
// so it is worth testing from both sides. The false-positive half matters more
// than the false-negative half: a miss lets one stale sentence through, while a
// wrong catch silently refuses a correct answer and the visitor never learns
// why.

describe("statesVolatileFact — catches facts that expire", () => {
  it.each([
    "Pura Tanah Lot jam buka 07:00 sampai 19:00.",
    "Tutup pukul 19:00 setiap hari.",
    "The temple opens at 7am and closes at 7pm.",
    "Opening hours are 7am to 7pm.",
    "What time does the ceremony start?",
  ])("opening and closing: %s", (answer) => {
    expect(statesVolatileFact(answer)).toBe(true);
  });

  it.each([
    "Tiket masuk Rp 60.000 per orang.",
    "Harga tiket sekitar 60 ribu.",
    "Biaya parkir dipungut di depan.",
    "The entrance fee is around 60,000 rupiah.",
    "Ticket price varies by season.",
  ])("money: %s", (answer) => {
    expect(statesVolatileFact(answer)).toBe(true);
  });

  it.each([
    "Jadwal upacara tahun ini jatuh pada bulan Maret.",
    "Here is the schedule of ceremonies for this month.",
  ])("schedules: %s", (answer) => {
    expect(statesVolatileFact(answer)).toBe(true);
  });
});

describe("statesVolatileFact — leaves ordinary answers alone", () => {
  it.each([
    // "tutup" hides inside "menutupi", which is how this app says "cover your
    // shoulders" - the single most common correct answer it gives.
    "Sebaiknya menutupi bahu dan lutut saat memasuki area pura.",
    "Kain penutup kepala kadang diminta di beberapa pura.",
    // "ribu" hides inside "seribu", and Bali is the island of a thousand
    // temples in almost every article ever written about it.
    "Bali dikenal sebagai Pulau Seribu Pura.",
    // Ceremonies may be discussed, as long as no date is attached.
    "Upacara Melasti dilakukan sebelum Nyepi untuk menyucikan pratima.",
    "Odalan mengikuti kalender pawukon yang berulang setiap 210 hari.",
    // History is stable by definition.
    "Tanah Lot didirikan oleh Dang Hyang Nirartha pada abad ke-16.",
    "Canang sari is offered each morning as a daily act of thanks.",
  ])("%s", (answer) => {
    expect(statesVolatileFact(answer)).toBe(false);
  });
});

describe("asksForVolatileFact — which refusal a visitor reads", () => {
  // Why this exists at all: a live run against the real model showed the
  // answer-side net is not enough. Asked "berapa harga tiket masuk?", the model
  // declined on its own, the net never saw an answer to catch, and the refusal
  // came back saying no rule covered the topic - then offered "Akses", matched
  // on the word "masuk". The visitor asked a price and was offered the inner
  // courtyard.
  it.each([
    "berapa harga tiket masuk Tanah Lot?",
    "jam buka Pura Tanah Lot berapa?",
    "Tanah Lot buka jam berapa?",
    "puranya masih buka sekarang?",
    "berapa harganya kalau mau masuk?",
    "how much is the entrance fee?",
    "is it open today?",
    "what time does the temple open?",
    "kapan upacara Melasti tahun ini?",
  ])("reads %s as a request for something that expires", (q) => {
    expect(asksForVolatileFact(q)).toBe(true);
  });

  // Getting this wrong costs a sentence rather than a fact, but a question with
  // a perfectly good answer must not be waved off as unanswerable either.
  it.each([
    "boleh pakai celana pendek di pura?",
    "apa itu canang sari?",
    "kapan canang diletakkan?",
    "sejarah Pura Tanah Lot?",
    "wajib pakai pemandu wisata?",
    "boleh membawa makanan ke pura?",
    "kenapa Bali ramai turis?",
  ])("leaves %s alone", (q) => {
    expect(asksForVolatileFact(q)).toBe(false);
  });
});
