import { beforeEach, describe, expect, it, vi } from "vitest";
import { TINY_JPEG_BASE64 } from "./fixtures";

const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
  Type: { OBJECT: "OBJECT", STRING: "STRING", BOOLEAN: "BOOLEAN" },
  ThinkingLevel: { MINIMAL: "MINIMAL", LOW: "LOW" },
}));

import { answerCache } from "@/lib/answer-cache";
import { answerKey } from "@/lib/cache";
import { loadRules, rulesByIds } from "@/lib/knowledge";
import { normalizeQuestion } from "@/lib/knowledge";
import { buildChatSystemPrompt, buildVisionContextLine } from "@/lib/prompts";
import { SITE_RULE_IDS_LIMIT, validateSiteContext } from "@/lib/validation";
import { POST as chat } from "@/routes/chat";
import { POST as vision } from "@/routes/vision";

// A Site as Explore would send it: real rule ids drawn from its own Customs.
const TIRTA_EMPUL = {
  id: "pura-tirta-empul",
  name: "Pura Tirta Empul",
  ruleIds: ["temple-attire", "photography", "offerings-canang"],
};

const CIRCULAR = "Bali Governor Circular No. 7 of 2025";

function post(path: string, body: unknown): Request {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Every text part the model was handed, flattened for substring assertions. */
function promptText(): string {
  return JSON.stringify(generateContent.mock.calls);
}

beforeEach(() => {
  generateContent.mockReset();
  answerCache.clear();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("rulesByIds", () => {
  it("resolves ids to the knowledge base's own rules", () => {
    const found = rulesByIds(loadRules(), ["temple-attire", "photography"]);

    expect(found.map((r) => r.id)).toEqual(["temple-attire", "photography"]);
    expect(found[0].rule_en).toBeTruthy();
  });

  it("drops an id the knowledge base does not know", () => {
    // The grounding guarantee: a client cannot introduce a Custom by naming one.
    const found = rulesByIds(loadRules(), ["temple-attire", "no-selfies-ever"]);

    expect(found.map((r) => r.id)).toEqual(["temple-attire"]);
  });

  it("returns knowledge-base order regardless of the order asked for", () => {
    const rules = loadRules();
    const asked = ["photography", "temple-attire"];
    const expected = rules.filter((r) => asked.includes(r.id)).map((r) => r.id);

    expect(rulesByIds(rules, asked).map((r) => r.id)).toEqual(expected);
  });

  it("returns nothing for an empty id list", () => {
    expect(rulesByIds(loadRules(), [])).toEqual([]);
  });
});

describe("validateSiteContext", () => {
  it("accepts a well-formed Site", () => {
    expect(validateSiteContext(TIRTA_EMPUL)).toEqual(TIRTA_EMPUL);
  });

  it.each([
    ["undefined", undefined],
    ["null", null],
    ["a string", "pura-tirta-empul"],
    ["an array", ["pura-tirta-empul"]],
    ["an object with no id", { name: "Pura Tirta Empul", ruleIds: ["temple-attire"] }],
    ["an object with no name", { id: "pura-tirta-empul", ruleIds: ["temple-attire"] }],
    ["ruleIds that is not an array", { id: "a", name: "A", ruleIds: "temple-attire" }],
    ["an empty ruleIds", { id: "a", name: "A", ruleIds: [] }],
    ["ruleIds holding nothing usable", { id: "a", name: "A", ruleIds: [1, null, {}] }],
  ])("drops %s rather than failing the request", (_label, input) => {
    // A bad optional field must cost the answer its specificity, never the
    // whole check - matching how an unrecognised `context` is handled.
    expect(validateSiteContext(input)).toBeUndefined();
  });

  it("collapses duplicate rule ids", () => {
    const site = validateSiteContext({
      id: "a",
      name: "A",
      ruleIds: ["temple-attire", "temple-attire", "photography"],
    });

    expect(site?.ruleIds).toEqual(["temple-attire", "photography"]);
  });

  it("caps how many rule ids one request may name", () => {
    const many = Array.from({ length: SITE_RULE_IDS_LIMIT + 10 }, (_, i) => `rule-${i}`);
    const site = validateSiteContext({ id: "a", name: "A", ruleIds: many });

    expect(site?.ruleIds).toHaveLength(SITE_RULE_IDS_LIMIT);
  });

  it("strips markup from the Site name before it can reach a prompt", () => {
    const site = validateSiteContext({
      id: "a",
      name: "<b>Pura</b> Tirta Empul",
      ruleIds: ["temple-attire"],
    });

    expect(site?.name).toBe("Pura Tirta Empul");
  });
});

describe("answerKey and the Site", () => {
  const key = (message: string, lang: string, siteId?: string) =>
    answerKey(normalizeQuestion(message), lang, siteId);

  it("gives the same question at two Sites two different keys", () => {
    // Without this, an answer cached at Tanah Lot is served to somebody
    // standing at Besakih - a confident wrong Custom.
    const atTanahLot = key("boleh foto di sini?", "id", "pura-tanah-lot");
    const atBesakih = key("boleh foto di sini?", "id", "pura-besakih");

    expect(atTanahLot).not.toBe(atBesakih);
  });

  it("separates a question asked at a Site from the same one asked nowhere", () => {
    expect(key("boleh foto?", "id", "pura-besakih")).not.toBe(key("boleh foto?", "id"));
  });

  it("keeps one shared key for visitors with no Site", () => {
    expect(key("Can I wear shorts?", "en")).toBe(key("can i wear  shorts?", "en"));
  });
});

describe("buildVisionContextLine", () => {
  it("keeps the original wording when no Site is known", () => {
    expect(buildVisionContextLine("temple", "en")).toBe(
      "Context: the user says they are at or near a temple (pura).",
    );
    expect(buildVisionContextLine("general", "en")).toBe(
      "Context: general setting; it may or may not be a sacred site.",
    );
  });

  it("names the Site and lists the Customs that hold there", () => {
    const line = buildVisionContextLine(
      "temple",
      "en",
      TIRTA_EMPUL,
      rulesByIds(loadRules(), TIRTA_EMPUL.ruleIds),
    );

    expect(line).toContain("Pura Tirta Empul");
    expect(line).toContain("CUSTOMS THAT APPLY AT Pura Tirta Empul");
    expect(line).toContain(rulesByIds(loadRules(), ["temple-attire"])[0].rule_en);
  });

  it("falls back to the generic line when every named id was unknown", () => {
    // Otherwise an unknown id would produce an empty "customs that apply"
    // block, which reads to the model as "this place expects nothing".
    const line = buildVisionContextLine("temple", "en", { ...TIRTA_EMPUL, ruleIds: ["nope"] }, []);

    expect(line).toBe("Context: the user says they are at or near a temple (pura).");
  });
});

describe("buildChatSystemPrompt", () => {
  it("says nothing about a location when no Site is known", () => {
    const prompt = buildChatSystemPrompt(loadRules(), "en");

    expect(prompt).not.toContain("WHERE THE VISITOR IS");
  });

  it("names the Site while keeping the whole knowledge base available", () => {
    const rules = loadRules();
    const prompt = buildChatSystemPrompt(rules, "en", {
      site: TIRTA_EMPUL,
      siteRules: rulesByIds(rules, TIRTA_EMPUL.ruleIds),
    });

    expect(prompt).toContain("WHERE THE VISITOR IS: Pura Tirta Empul");
    // Narrowing the list would turn an answerable general question into a
    // refusal, so every rule must still be there.
    for (const rule of rules) {
      expect(prompt).toContain(rule.rule_en);
    }
  });
});

describe("the Site reaching the routes", () => {
  it("carries the Site into the vision prompt", async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({
        status: "compliant",
        reason: "Your attire looks right.",
        suggestion: "Enjoy your visit.",
        reference: "Bali Governor Circular No. 7 of 2025",
      }),
      usageMetadata: { totalTokenCount: 300 },
    });

    const res = await vision(
      post("/api/vision", { image: TINY_JPEG_BASE64, context: "temple", site: TIRTA_EMPUL }),
    );

    expect(res.status).toBe(200);
    expect(promptText()).toContain("Pura Tirta Empul");
  });

  it("behaves exactly as before when the Site is malformed", async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({
        status: "compliant",
        reason: "Your attire looks right.",
        suggestion: "Enjoy your visit.",
        reference: "",
      }),
      usageMetadata: { totalTokenCount: 300 },
    });

    const res = await vision(
      post("/api/vision", { image: TINY_JPEG_BASE64, context: "temple", site: "not an object" }),
    );

    expect(res.status).toBe(200);
    expect(promptText()).toContain("Context: the user says they are at or near a temple (pura).");
  });

  it("does not serve one Site's cached answer at another Site", async () => {
    // A cited rule id is required: the server's grounding net replaces anything
    // less with the official fallback, so a realistic mock has to carry one.
    generateContent
      .mockResolvedValueOnce({
        text: JSON.stringify({
          answer: "At Tirta Empul, keep your shoulders covered.",
          kind: "rule",
          ruleIds: ["temple-attire"],
        }),
        usageMetadata: { totalTokenCount: 100 },
      })
      .mockResolvedValueOnce({
        text: JSON.stringify({
          answer: "At Besakih, keep your shoulders covered.",
          kind: "rule",
          ruleIds: ["temple-attire"],
        }),
        usageMetadata: { totalTokenCount: 100 },
      });

    const question = { message: "What should I wear here?", lang: "en" };
    const first = await chat(post("/api/chat", { ...question, site: TIRTA_EMPUL }));
    const second = await chat(
      post("/api/chat", {
        ...question,
        site: { id: "pura-besakih", name: "Pura Besakih", ruleIds: ["temple-attire"] },
      }),
    );

    expect(first.headers.get("x-cache")).toBe("MISS");
    // The same question at a different Site must reach the model again.
    expect(second.headers.get("x-cache")).toBe("MISS");
    expect(generateContent).toHaveBeenCalledTimes(2);
    expect(await second.json()).toMatchObject({
      answer: "At Besakih, keep your shoulders covered.",
      kind: "rule",
      ruleIds: ["temple-attire"],
      source: CIRCULAR,
    });
  });

  it("still caches a repeated question asked at the same Site", async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({
        answer: "Keep your shoulders covered.",
        kind: "rule",
        ruleIds: ["temple-attire"],
      }),
      usageMetadata: { totalTokenCount: 100 },
    });

    const body = { message: "What should I wear here?", lang: "en", site: TIRTA_EMPUL };
    await chat(post("/api/chat", body));
    const second = await chat(post("/api/chat", body));

    expect(second.headers.get("x-cache")).toBe("HIT");
    expect(generateContent).toHaveBeenCalledTimes(1);
  });
});
