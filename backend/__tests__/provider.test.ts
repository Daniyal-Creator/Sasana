// The gateway path has no other guard. Every existing suite mocks
// `@google/genai` and therefore exercises the direct path only, which is what
// kept them passing unchanged through this migration - and also what leaves
// the OpenAI-compatible adapter uncovered unless it is tested here.
//
// The provider is chosen at import time, so each gateway test loads a fresh
// module graph with AI_PROVIDER stubbed. `fetch` is stubbed too: nothing in
// this file reaches the network.

import { afterEach, describe, expect, it, vi } from "vitest";
import { isRateLimit } from "@/lib/errors";
import { toGoogleSchema, toStrictJsonSchema, type JsonSchema } from "@/lib/provider";

const SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["compliant", "unclear"] },
    ruleIds: { type: "array", items: { type: "string" } },
  },
  required: ["status", "ruleIds"],
};

function okResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as unknown as Response;
}

const REPLY = {
  choices: [{ message: { content: '{"status":"unclear"}' } }],
  usage: { prompt_tokens: 215, completion_tokens: 32, total_tokens: 247 },
};

/** Loads provider.ts with the gateway selected, and a stubbed `fetch`. */
async function loadGateway(fetchMock: ReturnType<typeof vi.fn>) {
  vi.resetModules();
  vi.stubEnv("AI_PROVIDER", "koboi");
  vi.stubEnv("KOBOI_BASE_URL", "https://gateway.test/v1/");
  vi.stubEnv("KOBOI_VISION_API_KEY", "vision-key");
  vi.stubEnv("KOBOI_CHAT_API_KEY", "chat-key");
  vi.stubEnv("KOBOI_VISION_MODEL", "vision-model");
  vi.stubEnv("KOBOI_CHAT_MODEL", "chat-model");
  vi.stubGlobal("fetch", fetchMock);
  return import("@/lib/provider");
}

/** The JSON body of the single request the adapter made. */
function sentBody(fetchMock: ReturnType<typeof vi.fn>) {
  return JSON.parse(fetchMock.mock.calls[0][1].body as string);
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("schema translation", () => {
  it("gives Google uppercase types and an explicit property order", () => {
    expect(toGoogleSchema(SCHEMA)).toEqual({
      type: "OBJECT",
      properties: {
        status: { type: "STRING", enum: ["compliant", "unclear"] },
        ruleIds: { type: "ARRAY", items: { type: "STRING" } },
      },
      propertyOrdering: ["status", "ruleIds"],
      required: ["status", "ruleIds"],
    });
  });

  // Google rejects the key outright, so the converter must not leak it across.
  it("never sends additionalProperties to Google", () => {
    expect(JSON.stringify(toGoogleSchema(SCHEMA))).not.toContain("additionalProperties");
  });

  it("closes every object for OpenAI strict mode", () => {
    expect(toStrictJsonSchema(SCHEMA)).toEqual({
      type: "object",
      properties: {
        status: { type: "string", enum: ["compliant", "unclear"] },
        ruleIds: { type: "array", items: { type: "string" } },
      },
      required: ["status", "ruleIds"],
      additionalProperties: false,
    });
  });

  // A schema whose `required` omitted a key used to be legal here. OpenAI
  // strict mode answers that with a 400, which would surface as a verdict-less
  // error card rather than anything a reader could diagnose - so the converter
  // requires every key rather than trusting the declaration.
  it("requires every key even when the source schema did not", () => {
    const partial: JsonSchema = {
      type: "object",
      properties: { a: { type: "string" }, b: { type: "string" } },
      required: ["a"],
    };
    expect(toStrictJsonSchema(partial).required).toEqual(["a", "b"]);
  });
});

describe("KoboiLLM adapter", () => {
  it("puts the system prompt first and renames model turns to assistant", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse(REPLY));
    const { callModel } = await loadGateway(fetchMock);

    await callModel("chat", {
      schemaName: "sasana_chat",
      systemInstruction: "you are SASANA",
      turns: [
        { role: "user", text: "first question" },
        { role: "model", text: "first answer" },
        { role: "user", text: "second question" },
      ],
      temperature: 0.3,
      maxOutputTokens: 800,
      schema: SCHEMA,
    });

    expect(sentBody(fetchMock).messages).toEqual([
      { role: "system", content: "you are SASANA" },
      { role: "user", content: "first question" },
      { role: "assistant", content: "first answer" },
      { role: "user", content: "second question" },
    ]);
  });

  it("attaches the photo to the final user turn as a data URI", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse(REPLY));
    const { callModel } = await loadGateway(fetchMock);

    await callModel("vision", {
      schemaName: "sasana_vision",
      systemInstruction: "judge the photo",
      turns: [{ role: "user", text: "Context: a temple." }],
      image: { data: "QUJD", mimeType: "image/jpeg" },
      temperature: 0.2,
      maxOutputTokens: 512,
      schema: SCHEMA,
    });

    expect(sentBody(fetchMock).messages[1]).toEqual({
      role: "user",
      content: [
        { type: "text", text: "Context: a temple." },
        { type: "image_url", image_url: { url: "data:image/jpeg;base64,QUJD" } },
      ],
    });
  });

  // History is text. A photo pinned to an earlier turn would be re-sent, and
  // re-billed, on every follow-up question.
  it("leaves earlier turns free of pixels", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse(REPLY));
    const { callModel } = await loadGateway(fetchMock);

    await callModel("vision", {
      schemaName: "sasana_vision",
      systemInstruction: "judge the photo",
      turns: [
        { role: "user", text: "older turn" },
        { role: "user", text: "current turn" },
      ],
      image: { data: "QUJD", mimeType: "image/png" },
      temperature: 0.2,
      maxOutputTokens: 512,
      schema: SCHEMA,
    });

    const messages = sentBody(fetchMock).messages;
    expect(messages[1]).toEqual({ role: "user", content: "older turn" });
    expect(Array.isArray(messages[2].content)).toBe(true);
  });

  it("asks for a strict json_schema, which is what makes the answer parseable", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse(REPLY));
    const { callModel } = await loadGateway(fetchMock);

    await callModel("chat", {
      schemaName: "sasana_chat",
      systemInstruction: "s",
      turns: [{ role: "user", text: "q" }],
      temperature: 0.3,
      maxOutputTokens: 800,
      schema: SCHEMA,
    });

    expect(sentBody(fetchMock).response_format).toEqual({
      type: "json_schema",
      json_schema: {
        name: "sasana_chat",
        strict: true,
        schema: toStrictJsonSchema(SCHEMA),
      },
    });
  });

  // The whole point of two keys: vision and chat must not share credentials or
  // quota, and neither may reach for the other's model.
  it.each([
    ["vision" as const, "vision-key", "vision-model"],
    ["chat" as const, "chat-key", "chat-model"],
  ])("sends %s on its own key and model", async (feature, key, model) => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse(REPLY));
    const { callModel } = await loadGateway(fetchMock);

    await callModel(feature, {
      schemaName: "s",
      systemInstruction: "s",
      turns: [{ role: "user", text: "q" }],
      temperature: 0.2,
      maxOutputTokens: 512,
      schema: SCHEMA,
    });

    const [url, init] = fetchMock.mock.calls[0];
    // The configured base URL carries a trailing slash; the path must not double it.
    expect(url).toBe("https://gateway.test/v1/chat/completions");
    expect(init.headers.Authorization).toBe(`Bearer ${key}`);
    expect(sentBody(fetchMock).model).toBe(model);
  });

  it("reads the answer and the usage the cache bills against", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse(REPLY));
    const { callModel } = await loadGateway(fetchMock);

    const reply = await callModel("chat", {
      schemaName: "s",
      systemInstruction: "s",
      turns: [{ role: "user", text: "q" }],
      temperature: 0.3,
      maxOutputTokens: 800,
      schema: SCHEMA,
    });

    expect(reply.text).toBe('{"status":"unclear"}');
    expect(reply.usage).toEqual({ promptTokens: 215, outputTokens: 32, totalTokens: 247 });
  });

  // A gateway that answers 200 with a shape nobody expected must not throw:
  // safeParseVision and safeParseChat already turn missing text into the
  // official fallback, and that is a better answer than an error card.
  it("survives a reply with no choices", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({}));
    const { callModel } = await loadGateway(fetchMock);

    const reply = await callModel("chat", {
      schemaName: "s",
      systemInstruction: "s",
      turns: [{ role: "user", text: "q" }],
      temperature: 0.3,
      maxOutputTokens: 800,
      schema: SCHEMA,
    });

    expect(reply.text).toBeUndefined();
    expect(reply.usage).toEqual({});
  });

  // withRetry classifies by `status`, so a 429 raised here has to carry one or
  // the one-shot retry silently stops happening on the gateway.
  it("raises a rate limit the retry can recognise", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => "rate limit exceeded",
    } as unknown as Response);
    const { callModel } = await loadGateway(fetchMock);

    const err = await callModel("chat", {
      schemaName: "s",
      systemInstruction: "s",
      turns: [{ role: "user", text: "q" }],
      temperature: 0.3,
      maxOutputTokens: 800,
      schema: SCHEMA,
    }).catch((e: unknown) => e);

    expect((err as { status?: number }).status).toBe(429);
    expect(isRateLimit(err)).toBe(true);
  });

  it("caps how much of an upstream error it repeats", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "x".repeat(5000),
    } as unknown as Response);
    const { callModel } = await loadGateway(fetchMock);

    const err = await callModel("chat", {
      schemaName: "s",
      systemInstruction: "s",
      turns: [{ role: "user", text: "q" }],
      temperature: 0.3,
      maxOutputTokens: 800,
      schema: SCHEMA,
    }).catch((e: unknown) => e);

    expect((err as Error).message.length).toBeLessThan(400);
  });
});
