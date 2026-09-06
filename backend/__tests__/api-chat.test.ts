import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
  Type: { OBJECT: "OBJECT", STRING: "STRING", BOOLEAN: "BOOLEAN" },
  ThinkingLevel: { MINIMAL: "MINIMAL", LOW: "LOW" },
}));

import { POST } from "@/routes/chat";
import { chatCache } from "@/lib/cache";

// Response.json() is typed `unknown` on Node (it comes from @types/node, not
// from the DOM lib), so every body is read through this helper.
function readBody(res: Response): Promise<Record<string, unknown>> {
  return res.json() as Promise<Record<string, unknown>>;
}

function post(body: unknown): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function rawPost(body: string): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

function mockAnswer(payload: unknown, usage?: Record<string, number>) {
  generateContent.mockResolvedValue({
    text: typeof payload === "string" ? payload : JSON.stringify(payload),
    usageMetadata: usage,
  });
}

const CIRCULAR = "Bali Governor Circular No. 7 of 2025";

// What a well-behaved model returns now: an answer plus the ids it stands on.
// It no longer types the attribution - the server reads that off the rules the
// ids resolve to.
const GROUNDED = {
  answer: "Wear a kamen and sash when entering temple grounds.",
  kind: "rule",
  ruleIds: ["temple-attire"],
};

const EN_FALLBACK = "I don't have official information on that in the Bali code of conduct.";
const ID_FALLBACK = "Saya tidak punya informasi resmi soal itu dalam tata krama Bali.";

beforeEach(() => {
  vi.restoreAllMocks();
  generateContent.mockReset();
  chatCache.clear(); // module singleton; a leftover entry would mask a real call
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/chat — grounded answers", () => {
  it("returns the model answer with the source of the rules it cited", async () => {
    mockAnswer(GROUNDED, { totalTokenCount: 120 });
    const res = await POST(post({ message: "Can I wear shorts at a temple?", lang: "en", history: [] }));

    expect(res.status).toBe(200);
    const json = await readBody(res);
    expect(json).toEqual({
      answer: GROUNDED.answer,
      kind: "rule",
      ruleIds: ["temple-attire"],
      source: CIRCULAR,
    });
  });

  it("sends the whole knowledge base, the tier ladder and both fences in the system prompt", async () => {
    mockAnswer(GROUNDED);
    await POST(post({ message: "Can I fly a drone?", lang: "en", history: [] }));

    const systemInstruction = generateContent.mock.calls[0][0].config.systemInstruction as string;
    // The whole KB, every rule addressable by id.
    expect(systemInstruction).toContain("1. (id: temple-attire) [Dress Code]");
    expect(systemInstruction).toContain("13. (id: no-littering)");
    // All four tiers offered, strongest first.
    expect(systemInstruction).toContain('1. "rule"');
    expect(systemInstruction).toContain('2. "context"');
    expect(systemInstruction).toContain('3. "general"');
    // The fence against fabricated grounding.
    expect(systemInstruction).toContain("Never invent an id");
    // The fence against facts that expire, and against recommending places.
    expect(systemInstruction).toContain("changes with the date, the hour, the season, or the price");
    expect(systemInstruction).toContain("Recommendations of specific businesses");
    expect(systemInstruction).toContain("Reply in the user's language: English");
  });

  it("builds the Indonesian prompt when lang is id", async () => {
    mockAnswer(GROUNDED);
    await POST(post({ message: "Boleh pakai celana pendek?", lang: "id", history: [] }));

    const systemInstruction = generateContent.mock.calls[0][0].config.systemInstruction as string;
    expect(systemInstruction).toContain("Indonesian (Bahasa Indonesia)");
    expect(systemInstruction).toContain("Tata Busana");
    expect(systemInstruction).toContain("(id: temple-attire)");
  });
});

describe("POST /api/chat — grounding safety net (FR2.1)", () => {
  it("replaces the answer with the fallback when the model cites no rule", async () => {
    mockAnswer({ answer: "Sure, drones are totally fine!", kind: "none", ruleIds: [] });
    const res = await POST(post({ message: "What time is the football match?", lang: "en", history: [] }));

    const json = await readBody(res);
    expect(json).toEqual({ answer: EN_FALLBACK, kind: "none", ruleIds: [], source: null });
  });

  // The heart of it: the model can claim grounding, but only the knowledge base
  // can grant it. An id the KB does not know buys the answer nothing.
  it("refuses an answer whose cited rule ids are invented", async () => {
    mockAnswer({ answer: "Rule 12 says you may climb shrines.", kind: "rule", ruleIds: ["rule-12", "made-up"] });
    const res = await POST(post({ message: "Can I climb a shrine?", lang: "en", history: [] }));

    const json = await readBody(res);
    expect(json.kind).toBe("none");
    expect(json.ruleIds).toEqual([]);
    expect(json.source).toBeNull();
    expect(json.answer).toBe(EN_FALLBACK);
  });

  // The bug this whole change exists to kill: a good answer used to be thrown
  // away for missing a `source` string the schema never required it to write.
  it("keeps a real answer that cites one real rule among invented ones", async () => {
    mockAnswer({
      answer: "Wear a kamen and sash.",
      kind: "rule",
      ruleIds: ["nope", "temple-attire", "also-nope"],
    });
    const res = await POST(post({ message: "What do I wear?", lang: "en", history: [] }));

    const json = await readBody(res);
    expect(json.kind).toBe("rule");
    expect(json.ruleIds).toEqual(["temple-attire"]);
    expect(json.answer).toBe("Wear a kamen and sash.");
  });

  it("lists every distinct source when the answer stands on more than one", async () => {
    mockAnswer({ answer: "Cover up and keep out of the inner court.", kind: "rule", ruleIds: ["temple-attire", "menstruation-entry"] });
    const res = await POST(post({ message: "What are the rules here?", lang: "en", history: [] }));

    const json = await readBody(res);
    expect(json.source).toBe(`${CIRCULAR} · Balinese Hindu custom (adat)`);
  });

  it("falls back when the model returns something that is not JSON", async () => {
    mockAnswer("I'm sorry, I can't do that.");
    const res = await POST(post({ message: "Can I wear shorts?", lang: "id", history: [] }));

    expect(res.status).toBe(200);
    const json = await readBody(res);
    expect(json).toEqual({ answer: ID_FALLBACK, kind: "none", ruleIds: [], source: null });
  });

  it("falls back when ruleIds is not an array", async () => {
    mockAnswer({ answer: "Anything goes.", kind: "rule", ruleIds: "temple-attire" });
    const res = await POST(post({ message: "Can I wear shorts?", lang: "en", history: [] }));

    expect((await readBody(res)).kind).toBe("none");
  });
});

describe("POST /api/chat — answering tiers", () => {
  it("passes a context answer through with no rule ids and no source", async () => {
    mockAnswer({
      answer: "Melasti is a purification procession to the sea before Nyepi.",
      kind: "context",
      ruleIds: [],
    });
    const res = await POST(post({ message: "Apa itu Melasti?", lang: "en", history: [] }));

    expect(await readBody(res)).toEqual({
      answer: "Melasti is a purification procession to the sea before Nyepi.",
      kind: "context",
      ruleIds: [],
      source: null,
    });
  });

  it("passes a general answer through", async () => {
    mockAnswer({
      answer: "Tanah Lot was founded by the priest Dang Hyang Nirartha in the 16th century.",
      kind: "general",
      ruleIds: [],
    });
    const res = await POST(post({ message: "Sejarah Tanah Lot?", lang: "en", history: [] }));

    const json = await readBody(res);
    expect(json.kind).toBe("general");
    expect(json.source).toBeNull();
  });

  // Server demotes, never promotes: an ungrounded tier that arrives carrying
  // rule ids must not read as sourced to anything downstream.
  it("strips rule ids from an ungrounded tier even when they are real", async () => {
    mockAnswer({
      answer: "Balinese dress is layered with meaning.",
      kind: "context",
      ruleIds: ["temple-attire"],
    });
    const res = await POST(post({ message: "Tell me about Balinese dress", lang: "en", history: [] }));

    const json = await readBody(res);
    expect(json.kind).toBe("context");
    expect(json.ruleIds).toEqual([]);
    expect(json.source).toBeNull();
  });

  it("refuses a kind it does not recognise", async () => {
    mockAnswer({ answer: "Trust me.", kind: "definitely-fine", ruleIds: [] });
    const res = await POST(post({ message: "hello", lang: "en", history: [] }));

    expect((await readBody(res)).kind).toBe("none");
  });
});

describe("POST /api/chat — volatility fence", () => {
  const volatile = [
    ["opening hours in Indonesian", "Pura Tanah Lot jam buka 07:00 sampai 19:00."],
    ["a ticket price", "Tiket masuk harganya Rp 60.000 per orang."],
    ["an English opening time", "The temple opens at 7am every day."],
    ["a ceremony timetable", "Jadwal upacara tahun ini jatuh pada bulan Maret."],
  ];

  it.each(volatile)("refuses a general answer that states %s", async (_label, answer) => {
    mockAnswer({ answer, kind: "general", ruleIds: [] });
    const res = await POST(post({ message: "Tanah Lot?", lang: "en", history: [] }));

    const json = await readBody(res);
    expect(json.kind).toBe("none");
    expect(json.answer).toBe(EN_FALLBACK);
  });

  // The fence must not fire on the answers this app exists to give. "tutup"
  // sits inside "menutupi", which is how you say "cover your shoulders".
  it("leaves an ordinary custom answer alone", async () => {
    mockAnswer({
      answer: "Sebaiknya menutupi bahu dan lutut, dan tutup rambut jika diminta.",
      kind: "context",
      ruleIds: [],
    });
    const res = await POST(post({ message: "Pakaian di pura?", lang: "id", history: [] }));

    expect((await readBody(res)).kind).toBe("context");
  });

  it("does not run the fence over a grounded answer", async () => {
    mockAnswer({
      answer: "Aturan menyebut jam buka tidak diatur; ikuti petugas.",
      kind: "rule",
      ruleIds: ["general-conduct"],
    });
    const res = await POST(post({ message: "Kapan boleh masuk?", lang: "id", history: [] }));

    expect((await readBody(res)).kind).toBe("rule");
  });
});

describe("POST /api/chat — nearby places from the map", () => {
  const TANAH_LOT = {
    id: "pura-tanah-lot",
    name: "Pura Tanah Lot",
    ruleIds: ["temple-attire"],
    lat: -8.6212,
    lng: 115.0868,
  };

  const overpass = (names: string[]) =>
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          elements: names.map((name, i) => ({
            lat: -8.6212 + (i + 1) * 0.001,
            lon: 115.0868,
            tags: { name, tourism: "guest_house" },
          })),
        }),
        { status: 200 },
      ),
    );

  const ask = (message: string, site?: unknown) =>
    POST(post({ message, lang: "id", history: [], ...(site ? { site } : {}) }));

  it("puts the real map results in the prompt and answers from them", async () => {
    overpass(["Guest House Melati", "Puri Bagus"]);
    mockAnswer({
      answer: "Ada Guest House Melati sekitar 110 m dan Puri Bagus sekitar 220 m.",
      kind: "places",
      ruleIds: [],
    });

    const res = await ask("adakah penginapan terdekat di sekitar pura tanah lot?", TANAH_LOT);

    const systemInstruction = generateContent.mock.calls[0][0].config.systemInstruction as string;
    expect(systemInstruction).toContain("NEARBY PLACES");
    expect(systemInstruction).toContain("Guest House Melati");
    expect(systemInstruction).toContain("around Pura Tanah Lot");

    expect(await readBody(res)).toEqual({
      answer: "Ada Guest House Melati sekitar 110 m dan Puri Bagus sekitar 220 m.",
      kind: "places",
      ruleIds: [],
      source: "OpenStreetMap contributors",
    });
  });

  // Without somewhere to search from there is nothing to look up, and guessing
  // the location as well as the answer is exactly what this tier exists to stop.
  it("does not call the map when no Site is attached", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    mockAnswer({ answer: "Saya tidak tahu di mana Anda.", kind: "none", ruleIds: [] });

    const res = await ask("adakah penginapan terdekat?");

    expect(fetchMock).not.toHaveBeenCalled();
    expect((await readBody(res)).kind).toBe("none");
  });

  it("does not call the map for an ordinary custom question", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    mockAnswer({ answer: "Kenakan kamen dan selendang.", kind: "rule", ruleIds: ["temple-attire"] });

    await ask("boleh pakai celana pendek di sini?", TANAH_LOT);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  // The server knows whether it performed a lookup, so this claim is one of the
  // few a model makes that can be checked outright.
  it("refuses a places answer when no lookup was made", async () => {
    mockAnswer({ answer: "Menginaplah di Hotel Karangan.", kind: "places", ruleIds: [] });

    const res = await ask("apa itu canang?", TANAH_LOT);

    const json = await readBody(res);
    expect(json.kind).toBe("none");
    expect(json.answer).toBe(ID_FALLBACK);
  });

  it("still answers when Overpass is down, without an error card", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ECONNREFUSED"));
    mockAnswer({ answer: "Maaf, saya tidak punya datanya.", kind: "none", ruleIds: [] });

    const res = await ask("ada penginapan dekat sini?", TANAH_LOT);

    expect(res.status).toBe(200);
    expect((await readBody(res)).kind).toBe("none");
  });

  // Everything else here is derived from a knowledge base that changes when
  // somebody edits it. This one describes the world, which changes on its own.
  it("never caches a map answer", async () => {
    overpass(["Guest House Melati"]);
    mockAnswer({ answer: "Ada Guest House Melati.", kind: "places", ruleIds: [] });

    const first = await ask("ada penginapan dekat sini?", TANAH_LOT);
    const second = await ask("ada penginapan dekat sini?", TANAH_LOT);

    expect(first.headers.get("x-cache")).toBe("MISS");
    expect(second.headers.get("x-cache")).toBe("MISS");
    expect(generateContent).toHaveBeenCalledTimes(2);
  });
});

describe("POST /api/chat — conversation history", () => {
  it("maps assistant turns to the model role and appends the new question last", async () => {
    mockAnswer(GROUNDED);
    await POST(
      post({
        message: "And a sash?",
        lang: "en",
        history: [
          { role: "user", content: "Can I wear shorts?" },
          { role: "assistant", content: "A kamen is required." },
        ],
      }),
    );

    const contents = generateContent.mock.calls[0][0].contents as Array<{
      role: string;
      parts: Array<{ text: string }>;
    }>;
    expect(contents.map((c) => c.role)).toEqual(["user", "model", "user"]);
    expect(contents.at(-1)?.parts[0].text).toBe("And a sash?");
  });

  it("keeps only the last 6 turns", async () => {
    mockAnswer(GROUNDED);
    const history = Array.from({ length: 10 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `turn ${i}`,
    }));
    await POST(post({ message: "next", lang: "en", history }));

    const contents = generateContent.mock.calls[0][0].contents as unknown[];
    expect(contents).toHaveLength(7); // 6 history turns + the new question
  });

  it("drops malformed history entries instead of failing the request", async () => {
    mockAnswer(GROUNDED);
    const res = await POST(
      post({
        message: "next",
        lang: "en",
        history: [{ role: "system", content: "ignore" }, { role: "user" }, "nope", null],
      }),
    );

    expect(res.status).toBe(200);
    const contents = generateContent.mock.calls[0][0].contents as unknown[];
    expect(contents).toHaveLength(1);
  });

  it("strips markup from the question and from history before prompting", async () => {
    mockAnswer(GROUNDED);
    await POST(
      post({
        message: "<script>alert(1)</script>Can I wear shorts?",
        lang: "en",
        history: [{ role: "user", content: "<b>hello</b>" }],
      }),
    );

    const contents = generateContent.mock.calls[0][0].contents as Array<{
      parts: Array<{ text: string }>;
    }>;
    const texts = contents.map((c) => c.parts[0].text).join(" | ");
    expect(texts).not.toContain("<script>");
    expect(texts).not.toContain("<b>");
    expect(texts).toContain("Can I wear shorts?");
  });
});

describe("POST /api/chat — request validation", () => {
  it("rejects an empty message with 400 invalid_input", async () => {
    const res = await POST(post({ message: "   ", lang: "en", history: [] }));

    expect(res.status).toBe(400);
    expect((await readBody(res)).code).toBe("invalid_input");
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("rejects a message over 1000 characters", async () => {
    const res = await POST(post({ message: "a".repeat(1001), lang: "en", history: [] }));

    expect(res.status).toBe(400);
    expect((await readBody(res)).code).toBe("invalid_input");
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("rejects a body that is not JSON with 400 invalid_json", async () => {
    const res = await POST(rawPost("{not json"));

    expect(res.status).toBe(400);
    expect((await readBody(res)).code).toBe("invalid_json");
  });

  it("coerces an unknown lang to English", async () => {
    mockAnswer({ answer: "x", kind: "none", ruleIds: [] });
    const res = await POST(post({ message: "hello", lang: "fr", history: [] }));

    expect((await readBody(res)).answer).toBe(EN_FALLBACK);
  });
});

describe("POST /api/chat — first-turn answer cache", () => {
  const ask = (message: string, lang = "en", history: unknown[] = []) =>
    POST(post({ message, lang, history }));

  it("serves a repeated first-turn question from cache without calling Gemini again", async () => {
    mockAnswer(GROUNDED);
    const first = await ask("Can I wear shorts at a temple?");
    const second = await ask("Can I wear shorts at a temple?");

    expect(first.headers.get("x-cache")).toBe("MISS");
    expect(second.headers.get("x-cache")).toBe("HIT");
    expect(await readBody(second)).toEqual(await readBody(first));
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it("matches regardless of casing and extra whitespace", async () => {
    mockAnswer(GROUNDED);
    await ask("Can I wear shorts?");
    const res = await ask("  can i   WEAR shorts?  ");

    expect(res.headers.get("x-cache")).toBe("HIT");
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it("keeps languages apart", async () => {
    mockAnswer(GROUNDED);
    await ask("Can I wear shorts?", "en");
    const res = await ask("Can I wear shorts?", "id");

    expect(res.headers.get("x-cache")).toBe("MISS");
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it("never serves a follow-up question from cache", async () => {
    mockAnswer(GROUNDED);
    await ask("Can I wear shorts?");
    const res = await ask("Can I wear shorts?", "en", [
      { role: "user", content: "earlier question" },
      { role: "assistant", content: "earlier answer" },
    ]);

    expect(res.headers.get("x-cache")).toBe("MISS");
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it("does not cache a failed call", async () => {
    generateContent.mockRejectedValueOnce(new Error("boom"));
    const failed = await ask("Can I wear shorts?");
    expect(failed.status).toBe(502);

    mockAnswer(GROUNDED);
    const retried = await ask("Can I wear shorts?");
    expect(retried.status).toBe(200);
    expect(retried.headers.get("x-cache")).toBe("MISS");
  });
});

describe("POST /api/chat — upstream failures", () => {
  it("maps a repeated 429 to a friendly localized rate_limited error", async () => {
    generateContent.mockRejectedValue(Object.assign(new Error("Resource exhausted"), { status: 429 }));
    const res = await POST(post({ message: "Can I wear shorts?", lang: "id", history: [] }));

    expect(res.status).toBe(429);
    const json = await readBody(res);
    expect(json.code).toBe("rate_limited");
    expect(json.error).toMatch(/sibuk/);
    expect(generateContent).toHaveBeenCalledTimes(2); // one retry
  });

  it("recovers when a 429 succeeds on the retry", async () => {
    generateContent
      .mockRejectedValueOnce(Object.assign(new Error("429 quota"), { status: 429 }))
      .mockResolvedValueOnce({ text: JSON.stringify(GROUNDED) });
    const res = await POST(post({ message: "Can I wear shorts?", lang: "en", history: [] }));

    expect(res.status).toBe(200);
    expect((await readBody(res)).kind).toBe("rule");
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it("does not retry a non-rate-limit failure and maps it to 502 ai_error", async () => {
    generateContent.mockRejectedValue(new Error("upstream exploded"));
    const res = await POST(post({ message: "Can I wear shorts?", lang: "en", history: [] }));

    expect(res.status).toBe(502);
    expect((await readBody(res)).code).toBe("ai_error");
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it("returns 504 timeout when Gemini never responds", async () => {
    vi.useFakeTimers();
    try {
      generateContent.mockImplementation(() => new Promise(() => {}));
      const pending = POST(post({ message: "Can I wear shorts?", lang: "en", history: [] }));
      await vi.advanceTimersByTimeAsync(10_000);
      const res = await pending;

      expect(res.status).toBe(504);
      expect((await readBody(res)).code).toBe("timeout");
    } finally {
      vi.useRealTimers();
    }
  });

  it("never leaks the upstream message or the API key in an error body", async () => {
    generateContent.mockRejectedValue(new Error("401 bad key test-key-not-real"));
    const res = await POST(post({ message: "Can I wear shorts?", lang: "en", history: [] }));

    const body = await res.text();
    expect(body).not.toContain("test-key-not-real");
    expect(body).not.toContain("bad key");
  });
});
