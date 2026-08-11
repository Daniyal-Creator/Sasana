import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
  Type: { OBJECT: "OBJECT", STRING: "STRING", BOOLEAN: "BOOLEAN" },
  ThinkingLevel: { MINIMAL: "MINIMAL", LOW: "LOW" },
}));

import { POST } from "@/app/api/chat/route";
import { chatCache } from "@/lib/cache";

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

const GROUNDED = {
  answer: "Wear a kamen and sash when entering temple grounds.",
  source: "Bali Governor Circular No. 7 of 2025",
  grounded: true,
};

const EN_FALLBACK = "I don't have official information on that in the Bali code of conduct.";
const ID_FALLBACK = "Saya tidak punya informasi resmi soal itu dalam tata krama Bali.";

beforeEach(() => {
  generateContent.mockReset();
  chatCache.clear(); // module singleton; a leftover entry would mask a real call
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/chat — grounded answers", () => {
  it("returns the model answer with its source when grounded", async () => {
    mockAnswer(GROUNDED, { totalTokenCount: 120 });
    const res = await POST(post({ message: "Can I wear shorts at a temple?", lang: "en", history: [] }));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      answer: GROUNDED.answer,
      source: "Bali Governor Circular No. 7 of 2025",
      grounded: true,
    });
  });

  it("sends the whole knowledge base and the anti-fabrication instruction in the system prompt", async () => {
    mockAnswer(GROUNDED);
    await POST(post({ message: "Can I fly a drone?", lang: "en", history: [] }));

    const systemInstruction = generateContent.mock.calls[0][0].config.systemInstruction as string;
    expect(systemInstruction).toContain("ONLY using the RULES listed below");
    expect(systemInstruction).toContain("Do not guess and do not fabricate a rule");
    expect(systemInstruction).toContain("1. [Dress Code]");
    expect(systemInstruction).toContain("Reply in the user's language: English");
  });

  it("builds the Indonesian prompt when lang is id", async () => {
    mockAnswer(GROUNDED);
    await POST(post({ message: "Boleh pakai celana pendek?", lang: "id", history: [] }));

    const systemInstruction = generateContent.mock.calls[0][0].config.systemInstruction as string;
    expect(systemInstruction).toContain("Indonesian (Bahasa Indonesia)");
    expect(systemInstruction).toContain("Tata Busana");
  });
});

describe("POST /api/chat — grounding safety net (FR2.1)", () => {
  it("replaces the answer with the fallback when the model reports grounded=false", async () => {
    mockAnswer({ answer: "Sure, drones are totally fine!", source: "", grounded: false });
    const res = await POST(post({ message: "What time is the football match?", lang: "en", history: [] }));

    const json = await res.json();
    expect(json).toEqual({ answer: EN_FALLBACK, source: null, grounded: false });
  });

  it("refuses a grounded=true answer that cites no source", async () => {
    mockAnswer({ answer: "Rule 12 says you may climb shrines.", source: "", grounded: true });
    const res = await POST(post({ message: "Can I climb a shrine?", lang: "en", history: [] }));

    const json = await res.json();
    expect(json.grounded).toBe(false);
    expect(json.source).toBeNull();
    expect(json.answer).toBe(EN_FALLBACK);
  });

  it("falls back when the model returns something that is not JSON", async () => {
    mockAnswer("I'm sorry, I can't do that.");
    const res = await POST(post({ message: "Can I wear shorts?", lang: "id", history: [] }));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ answer: ID_FALLBACK, source: null, grounded: false });
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
    expect((await res.json()).code).toBe("invalid_input");
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("rejects a message over 1000 characters", async () => {
    const res = await POST(post({ message: "a".repeat(1001), lang: "en", history: [] }));

    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("invalid_input");
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("rejects a body that is not JSON with 400 invalid_json", async () => {
    const res = await POST(rawPost("{not json"));

    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("invalid_json");
  });

  it("coerces an unknown lang to English", async () => {
    mockAnswer({ answer: "x", source: "", grounded: false });
    const res = await POST(post({ message: "hello", lang: "fr", history: [] }));

    expect((await res.json()).answer).toBe(EN_FALLBACK);
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
    expect(await second.json()).toEqual(await first.json());
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
    const json = await res.json();
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
    expect((await res.json()).grounded).toBe(true);
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it("does not retry a non-rate-limit failure and maps it to 502 ai_error", async () => {
    generateContent.mockRejectedValue(new Error("upstream exploded"));
    const res = await POST(post({ message: "Can I wear shorts?", lang: "en", history: [] }));

    expect(res.status).toBe(502);
    expect((await res.json()).code).toBe("ai_error");
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
      expect((await res.json()).code).toBe("timeout");
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
