import { describe, expect, it } from "vitest";
import { loadRules } from "@/lib/knowledge";
import { buildRefusal } from "@/lib/prompts";
import type { Lang } from "@shared/contract";

const rules = loadRules();
const LANGS: Lang[] = ["en", "id"];

// The two questions from the screen that started this work. They came back with
// the identical flat sentence despite having nothing in common.
const FOOD_IN_TEMPLE = "boleh saya membawa makanan ke pura?";
const LODGING = "kalau saya ke pura tanah lot apakah ada tempat penginapan yang bagus?";

describe("buildRefusal — a question nothing covers", () => {
  it("says what it does hold instead of stopping at the refusal", () => {
    const text = buildRefusal(FOOD_IN_TEMPLE, "id", rules);

    expect(text).toContain("Saya belum punya aturan resmi soal itu.");
    expect(text).toContain("Yang bisa saya bantu:");
    expect(text).toContain("Tata Busana");
  });

  it("offers the same help in English", () => {
    const text = buildRefusal(FOOD_IN_TEMPLE, "en", rules);

    expect(text).toContain("What I can help with:");
    expect(text).toContain("Dress Code");
  });

  // The two questions that used to be indistinguishable still both refuse, but
  // a refusal that names four topics is no longer a dead end either way.
  it.each([FOOD_IN_TEMPLE, LODGING])("never ends without an offer: %s", (question) => {
    for (const lang of LANGS) {
      expect(buildRefusal(question, lang, rules).split(":")[1]?.trim().length).toBeGreaterThan(0);
    }
  });

  it("softens to a near miss when the question brushes a rule", () => {
    const text = buildRefusal("apakah saya harus melepas sepatu di dalam?", "id", rules);

    expect(text).toContain("Yang paling dekat dari yang saya punya:");
    expect(text).toContain("Perilaku di Tempat Suci");
  });
});

describe("buildRefusal — a question about something that expires", () => {
  it("names the class of fact and points at someone who does know", () => {
    const text = buildRefusal("berapa harga tiket masuk?", "id", rules, "volatile");

    expect(text).toContain("jam buka, harga, atau tanggal upacara");
    expect(text).toContain("Petugas pura tahu jawabannya.");
  });

  // The regression this guards: `searchRules` scores "berapa harga tiket masuk"
  // at 3 on sacred-area-entry purely because "masuk" is one of its keywords.
  // Offering the inner courtyard to someone asking a price is the non sequitur
  // that makes an assistant feel broken, so a volatile refusal never offers a
  // rule at all.
  it("never offers a rule, even when the question lexically matches one", () => {
    for (const lang of LANGS) {
      const text = buildRefusal("berapa harga tiket masuk?", lang, rules, "volatile");
      expect(text).not.toContain("closest I have");
      expect(text).not.toContain("paling dekat");
    }
  });
});

describe("buildRefusal — copy guardrails", () => {
  const everyRefusal = [FOOD_IN_TEMPLE, LODGING, "berapa harga tiket masuk?"].flatMap((q) =>
    LANGS.flatMap((lang) => [
      buildRefusal(q, lang, rules),
      buildRefusal(q, lang, rules, "volatile"),
    ]),
  );

  it.each(everyRefusal)("W1, no em dashes: %s", (text) => {
    expect(text).not.toContain("—");
  });

  it.each(everyRefusal)("W3, no shouting: %s", (text) => {
    expect(text).not.toContain("!");
    expect(text).not.toMatch(/\b[A-Z]{4,}\b/);
  });

  // W6. A refusal may say what topics exist; it must never state a rule, since
  // the whole reason it is refusing is that it has none for this question.
  it.each(everyRefusal)("W6, offers topics rather than guidance: %s", (text) => {
    for (const rule of rules) {
      expect(text).not.toContain(rule.rule_en);
      expect(text).not.toContain(rule.rule_id);
    }
  });
});
