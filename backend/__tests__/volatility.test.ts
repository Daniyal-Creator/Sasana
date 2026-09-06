import { describe, expect, it } from "vitest";
import { statesVolatileFact } from "@/lib/volatility";

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
