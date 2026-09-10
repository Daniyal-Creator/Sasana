import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
  Type: { OBJECT: "OBJECT", STRING: "STRING", BOOLEAN: "BOOLEAN" },
  ThinkingLevel: { MINIMAL: "MINIMAL", LOW: "LOW" },
}));

import { answerCache } from "@/lib/answer-cache";
import { validateChatRequest, validateProximity } from "@/lib/validation";
import { POST as chat } from "@/routes/chat";
import type { Proximity } from "@shared/contract";

const TIRTA_EMPUL = {
  id: "pura-tirta-empul",
  name: "Pura Tirta Empul",
  ruleIds: ["temple-attire", "photography", "offerings-canang"],
};

const APPROACHING: Proximity = { state: "approach", distanceM: 640, accuracyM: 25 };

function post(body: unknown): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Every text part the model was handed, flattened for substring assertions. */
function promptText(): string {
  return JSON.stringify(generateContent.mock.calls);
}

function answersWithRule() {
  generateContent.mockResolvedValue({
    text: JSON.stringify({
      answer: "Put your kamen on before you reach the gate.",
      kind: "rule",
      ruleIds: ["temple-attire"],
    }),
    usageMetadata: { totalTokenCount: 100 },
  });
}

beforeEach(async () => {
  generateContent.mockReset();
  await answerCache.clear();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("validateProximity", () => {
  it("accepts a well-formed fix", () => {
    expect(validateProximity(APPROACHING)).toEqual(APPROACHING);
  });

  it.each([
    ["undefined", undefined],
    ["null", null],
    ["a string", "approach"],
    ["an array", [APPROACHING]],
    ["an unknown state", { ...APPROACHING, state: "nearby" }],
    ["a missing state", { distanceM: 640, accuracyM: 25 }],
    ["a non-numeric distance", { ...APPROACHING, distanceM: "640" }],
    ["a negative distance", { ...APPROACHING, distanceM: -1 }],
    ["a distance longer than the planet", { ...APPROACHING, distanceM: 20_037_501 }],
    ["an infinite distance", { ...APPROACHING, distanceM: Infinity }],
    ["a NaN distance", { ...APPROACHING, distanceM: NaN }],
    ["a missing accuracy", { state: "approach", distanceM: 640 }],
    ["a zero accuracy", { ...APPROACHING, accuracyM: 0 }],
    ["a negative accuracy", { ...APPROACHING, accuracyM: -5 }],
    ["an absurd accuracy", { ...APPROACHING, accuracyM: 100_001 }],
  ])("drops %s rather than failing the request", (_label, input) => {
    expect(validateProximity(input)).toBeUndefined();
  });

  // The client sends what a haversine gives it. 250.00000000003513 was measured
  // against the running app; those digits describe arithmetic, not a visitor.
  it("rounds off precision the device never had", () => {
    const fix = validateProximity({
      state: "zone",
      distanceM: 250.00000000003513,
      accuracyM: 15.4,
    });

    expect(fix).toEqual({ state: "zone", distanceM: 250, accuracyM: 15 });
  });

  it("rides on the chat request beside the Site, not inside it", () => {
    const parsed = validateChatRequest({
      message: "what should I do here?",
      lang: "en",
      site: TIRTA_EMPUL,
      proximity: APPROACHING,
    });

    expect(parsed.proximity).toEqual(APPROACHING);
    expect(parsed.site).toEqual(TIRTA_EMPUL);
    expect(parsed.site).not.toHaveProperty("proximity");
  });
});

describe("a situated question", () => {
  it("tells the model where the visitor stands, hedged by the accuracy", async () => {
    answersWithRule();

    await chat(
      post({ message: "what should I prepare?", lang: "en", site: TIRTA_EMPUL, proximity: APPROACHING }),
    );

    const prompt = promptText();
    expect(prompt).toContain("HOW CLOSE THEY ARE");
    expect(prompt).toContain("640 m");
    expect(prompt).toContain("plus or minus 25 m");
    expect(prompt).toContain("still outside it");
  });

  it("tells it they have already arrived when they are inside the Zone", async () => {
    answersWithRule();

    await chat(
      post({
        message: "what should I do?",
        lang: "en",
        site: TIRTA_EMPUL,
        proximity: { state: "zone", distanceM: 120, accuracyM: 15 },
      }),
    );

    expect(promptText()).toContain("already inside");
  });

  // A phone in a street reporting 500 m of uncertainty about a 400 m gap has
  // produced arithmetic, not information. Decided in the builder rather than
  // asked of the model, because a judgement left to the model holds most of the
  // time and quietly fails the rest.
  it("withholds the number outright when the fix is no better than the distance", async () => {
    answersWithRule();

    await chat(
      post({
        message: "what should I prepare?",
        lang: "en",
        site: TIRTA_EMPUL,
        proximity: { state: "approach", distanceM: 400, accuracyM: 500 },
      }),
    );

    const prompt = promptText();
    expect(prompt).toContain("not sure enough of its position");
    expect(prompt).not.toContain("400 m");
  });

  it("says nothing about the ground between the visitor and the gate", async () => {
    answersWithRule();

    await chat(
      post({ message: "what should I prepare?", lang: "en", site: TIRTA_EMPUL, proximity: APPROACHING }),
    );

    // The volatility fence (ADR-0014) does not move because a distance arrived.
    expect(promptText()).toContain("not whether the place is busy or open");
  });

  it("does not change the tier the answer comes back on", async () => {
    answersWithRule();

    const res = await chat(
      post({ message: "what should I prepare?", lang: "en", site: TIRTA_EMPUL, proximity: APPROACHING }),
    );
    const body = (await res.json()) as { kind: string; ruleIds: string[] };

    expect(body.kind).toBe("rule");
    expect(body.ruleIds).toEqual(["temple-attire"]);
  });
});

describe("a position with nothing to be a distance from", () => {
  it("never reaches the prompt without a Site", async () => {
    answersWithRule();

    await chat(post({ message: "what should I prepare?", lang: "en", proximity: APPROACHING }));

    expect(promptText()).not.toContain("HOW CLOSE THEY ARE");
  });

  it("leaves the answer cacheable, because nothing about it was situated", async () => {
    answersWithRule();

    // Worded so retrieval reaches the rule the mock cites: a claimed id outside
    // the selection is refused by the grounding net, and a refusal is not
    // storable for reasons that have nothing to do with this branch.
    const first = await chat(post({ message: "what should I wear?", lang: "en", proximity: APPROACHING }));
    const second = await chat(post({ message: "what should I wear?", lang: "en", proximity: APPROACHING }));

    expect(first.headers.get("x-cache")).toBe("MISS");
    expect(second.headers.get("x-cache")).toBe("HIT");
  });
});

describe("the cache and a situated answer", () => {
  it("never stores one", async () => {
    answersWithRule();

    const first = await chat(
      post({ message: "what should I prepare?", lang: "en", site: TIRTA_EMPUL, proximity: APPROACHING }),
    );
    const second = await chat(
      post({ message: "what should I prepare?", lang: "en", site: TIRTA_EMPUL, proximity: APPROACHING }),
    );

    // "about 640 m away, still outside" is true for one person for about a
    // minute. Stored, it would be read back to somebody in the courtyard.
    expect(first.headers.get("x-cache")).toBe("MISS");
    expect(second.headers.get("x-cache")).toBe("MISS");
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  // The other direction, and the one that would have made the whole feature
  // silently do nothing: "apa yang harus saya siapkan?" is exactly the question
  // most likely to be sitting in the cache already.
  it("never serves a stored answer to one", async () => {
    answersWithRule();

    // Somebody asks it from the menu first, with no position. That answer is
    // stored, as it always was.
    await chat(post({ message: "what should I prepare?", lang: "en", site: TIRTA_EMPUL }));
    const cached = await chat(post({ message: "what should I prepare?", lang: "en", site: TIRTA_EMPUL }));
    expect(cached.headers.get("x-cache")).toBe("HIT");

    // The visitor standing at the Approach asks the same words and must not be
    // handed it.
    const situated = await chat(
      post({ message: "what should I prepare?", lang: "en", site: TIRTA_EMPUL, proximity: APPROACHING }),
    );

    expect(situated.headers.get("x-cache")).toBe("MISS");
  });

  it("still stores an ordinary answer at the same Site", async () => {
    answersWithRule();

    const first = await chat(post({ message: "what should I wear?", lang: "en", site: TIRTA_EMPUL }));
    const second = await chat(post({ message: "what should I wear?", lang: "en", site: TIRTA_EMPUL }));

    expect(first.headers.get("x-cache")).toBe("MISS");
    expect(second.headers.get("x-cache")).toBe("HIT");
  });

  it("does not poison the cache for the next visitor who asks without a position", async () => {
    answersWithRule();

    await chat(
      post({ message: "what should I prepare?", lang: "en", site: TIRTA_EMPUL, proximity: APPROACHING }),
    );
    const plain = await chat(post({ message: "what should I prepare?", lang: "en", site: TIRTA_EMPUL }));

    expect(plain.headers.get("x-cache")).toBe("MISS");
  });
});
