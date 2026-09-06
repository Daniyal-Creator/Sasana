import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
  Type: { OBJECT: "OBJECT", STRING: "STRING", BOOLEAN: "BOOLEAN", ARRAY: "ARRAY" },
  ThinkingLevel: { MINIMAL: "MINIMAL", LOW: "LOW" },
}));

import { answerCache } from "@/lib/answer-cache";
import { rulesHash } from "@/lib/knowledge";
import { POST as chat } from "@/routes/chat";
import { GET as stats } from "@/routes/stats";

function ask(message: string) {
  return chat(
    new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message, lang: "en", history: [] }),
    }),
  );
}

function answer(tokens: number) {
  generateContent.mockResolvedValue({
    text: JSON.stringify({
      answer: "Wear a kamen and sash.",
      kind: "rule",
      ruleIds: ["temple-attire"],
    }),
    usageMetadata: { totalTokenCount: tokens },
  });
}

const read = (res: Response) => res.json() as Promise<Record<string, number | string | boolean>>;

beforeEach(() => {
  generateContent.mockReset();
  answerCache.clear();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /api/stats", () => {
  it("starts empty rather than dividing by nothing", async () => {
    expect(await read(stats())).toMatchObject({
      entries: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      tokensSaved: 0,
      enabled: true,
    });
  });

  it("reports the knowledge base the numbers belong to", async () => {
    expect((await read(stats())).kbHash).toBe(rulesHash());
  });

  // The measurement the whole cache exists to produce: what the first call
  // actually cost, counted again for every later visitor who did not spend it.
  it("counts the tokens a repeated question did not spend", async () => {
    answer(1900);
    await ask("Can I wear shorts at a temple?"); // miss, pays 1900
    await ask("Can I wear shorts at a temple?"); // hit, pays nothing
    await ask("Can I wear shorts at a temple?"); // hit, pays nothing

    expect(await read(stats())).toMatchObject({
      entries: 1,
      hits: 2,
      misses: 1,
      tokensSaved: 3800,
    });
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it("puts the hit rate over every cacheable question, not just the hits", async () => {
    answer(100);
    await ask("Can I wear shorts?");
    await ask("Can I wear shorts?");
    await ask("Can I fly a drone?");

    // Two misses, one hit.
    expect(await read(stats())).toMatchObject({ hits: 1, misses: 2, hitRate: 0.3333 });
  });

  it("spends no Gemini quota of its own", async () => {
    stats();
    expect(generateContent).not.toHaveBeenCalled();
  });
});
