// The seam between "what to ask the model" and "who to ask".
//
// Two providers serve the same two features. Google is the default and the one
// the free tier reaches directly; KoboiLLM is an OpenAI-compatible gateway in
// front of the same Gemini models, bought with local payment and a paid quota.
// Which one runs is a deploy-time choice (AI_PROVIDER), never a code change:
// the free key is the right answer on a laptop and the wrong one on the day a
// class opens the app at once.
//
// Everything above this file is provider-agnostic. `gemini.ts` builds prompts
// and parses answers; it names a feature, not a vendor.

import { GoogleGenAI, ThinkingLevel, type Schema } from "@google/genai";
import { env } from "@/lib/env";

/** Which of the two AI features is calling. Picks the model, key and budget. */
export type Feature = "vision" | "chat";

/**
 * A conversation turn. `model` rather than `assistant` because that is the
 * wire word in the Gemini contents array; the OpenAI adapter renames it.
 */
export interface ModelTurn {
  role: "user" | "model";
  text: string;
}

/**
 * A JSON Schema subset, written the JSON way (lowercase types). Each adapter
 * translates it: Google wants uppercase types and no `additionalProperties`,
 * OpenAI strict mode wants exactly the opposite. Keeping one definition here is
 * what stops the two from drifting apart the next time a field is added.
 */
export interface JsonSchema {
  type: "object" | "string" | "array" | "boolean" | "number";
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  enum?: readonly string[];
  required?: readonly string[];
}

export interface ModelRequest {
  /** Names the response schema for the gateway. Cosmetic, but required by it. */
  schemaName: string;
  systemInstruction: string;
  turns: ModelTurn[];
  /** Vision only. Attaches to the last user turn. */
  image?: { data: string; mimeType: "image/jpeg" | "image/png" };
  temperature: number;
  maxOutputTokens: number;
  schema: JsonSchema;
}

/** The two things every caller above needs: the text, and what it cost. */
export interface ModelReply {
  text?: string;
  usage: {
    promptTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

// Gemini 3.x rejects the `thinkingBudget: 0` that backend-spec specifies (400
// invalid argument); `thinkingLevel: MINIMAL` is its replacement and measurably
// does the same job - it took gemini-3.6-flash from 221 thinking tokens and
// 2.5s down to 0 tokens and 1.3s.
//
// This is the one capability that does NOT survive the gateway: KoboiLLM
// accepts `reasoning_effort: "minimal"` without complaint and keeps thinking
// anyway (71-156 tokens on the same vision call, measured 2026-09-07). The
// direct path is therefore still the cheaper and slightly faster of the two -
// which is why it stays the default rather than becoming dead code.
const THINKING = { thinkingLevel: ThinkingLevel.MINIMAL };

const googleClient = env.AI_PROVIDER === "google" ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : null;

/** Model and key for one feature, on whichever provider is configured. */
function routeOf(feature: Feature): { model: string; apiKey: string } {
  if (env.AI_PROVIDER === "koboi") {
    return feature === "vision"
      ? { model: env.KOBOI_VISION_MODEL, apiKey: env.KOBOI_VISION_API_KEY }
      : { model: env.KOBOI_CHAT_MODEL, apiKey: env.KOBOI_CHAT_API_KEY };
  }
  const model = feature === "vision" ? env.GEMINI_VISION_MODEL : env.GEMINI_CHAT_MODEL;
  return { model, apiKey: env.GEMINI_API_KEY };
}

export function callModel(feature: Feature, req: ModelRequest): Promise<ModelReply> {
  const route = routeOf(feature);
  return env.AI_PROVIDER === "koboi"
    ? callKoboi(feature, route, req)
    : callGoogle(route.model, req);
}

// --- Google, directly -------------------------------------------------------

// Builds the exact request shape this backend has always sent. Vision passes a
// flat [pixels, text] pair rather than a role-tagged turn because that is what
// the SDK sugar produces for a single user message, and the vision tests read
// `contents[0].inlineData` off it.
function callGoogle(model: string, req: ModelRequest): Promise<ModelReply> {
  if (!googleClient) {
    throw new Error("[provider] Google client unavailable: AI_PROVIDER is not \"google\".");
  }
  const contents = req.image
    ? [{ inlineData: { data: req.image.data, mimeType: req.image.mimeType } }, req.turns[0].text]
    : req.turns.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] }));

  return googleClient.models
    .generateContent({
      model,
      contents,
      config: {
        systemInstruction: req.systemInstruction,
        temperature: req.temperature,
        maxOutputTokens: req.maxOutputTokens,
        thinkingConfig: THINKING,
        responseMimeType: "application/json",
        responseSchema: toGoogleSchema(req.schema),
      },
    })
    .then((res) => ({
      text: res.text,
      usage: {
        promptTokens: res.usageMetadata?.promptTokenCount,
        outputTokens: res.usageMetadata?.candidatesTokenCount,
        totalTokens: res.usageMetadata?.totalTokenCount,
      },
    }));
}

// Google's Schema wants SCREAMING types and rejects `additionalProperties`.
// `propertyOrdering` is added from the declaration order, which is what the
// hand-written schemas used to spell out by hand.
export function toGoogleSchema(schema: JsonSchema): Schema {
  const out: Record<string, unknown> = { type: schema.type.toUpperCase() };
  if (schema.enum) out.enum = [...schema.enum];
  if (schema.items) out.items = toGoogleSchema(schema.items);
  if (schema.properties) {
    const keys = Object.keys(schema.properties);
    out.properties = Object.fromEntries(
      keys.map((key) => [key, toGoogleSchema(schema.properties![key])]),
    );
    out.propertyOrdering = keys;
  }
  if (schema.required) out.required = [...schema.required];
  return out as Schema;
}

// --- KoboiLLM, an OpenAI-compatible gateway ---------------------------------

// Called with `fetch` rather than the `openai` package on purpose. The whole
// integration is one POST, and AGENTS.md takes additions to package.json but
// pays for every one of them in lockfile conflicts across four areas.
async function callKoboi(
  feature: Feature,
  route: { model: string; apiKey: string },
  req: ModelRequest,
): Promise<ModelReply> {
  const messages: unknown[] = [{ role: "system", content: req.systemInstruction }];
  req.turns.forEach((turn, index) => {
    const role = turn.role === "model" ? "assistant" : "user";
    const isLast = index === req.turns.length - 1;
    // The image rides on the final user turn, as a data URI. Anything earlier
    // is history, which never carries pixels here.
    if (req.image && isLast) {
      messages.push({
        role,
        content: [
          { type: "text", text: turn.text },
          {
            type: "image_url",
            image_url: { url: `data:${req.image.mimeType};base64,${req.image.data}` },
          },
        ],
      });
    } else {
      messages.push({ role, content: turn.text });
    }
  });

  // One second beyond the app's own cap, so `withTimeout` is what a user sees
  // on a slow call and this only exists to close the socket afterwards. Without
  // it a timed-out request would keep streaming into a response nobody awaits.
  const budgetMs =
    (feature === "vision" ? env.GEMINI_VISION_TIMEOUT_MS : env.GEMINI_CHAT_TIMEOUT_MS) + 1000;

  const res = await fetch(`${env.KOBOI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${route.apiKey}`,
    },
    signal: AbortSignal.timeout(budgetMs),
    body: JSON.stringify({
      model: route.model,
      temperature: req.temperature,
      max_tokens: req.maxOutputTokens,
      messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: req.schemaName,
          strict: true,
          schema: toStrictJsonSchema(req.schema),
        },
      },
    }),
  });

  if (!res.ok) {
    // `status` is the property `isRateLimit` reads, so a 429 from the gateway
    // still earns the one retry a 429 from Google does.
    throw Object.assign(new Error(`KoboiLLM ${res.status}: ${(await res.text()).slice(0, 300)}`), {
      status: res.status,
    });
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  };

  return {
    text: json.choices?.[0]?.message?.content,
    usage: {
      promptTokens: json.usage?.prompt_tokens,
      outputTokens: json.usage?.completion_tokens,
      totalTokens: json.usage?.total_tokens,
    },
  };
}

// OpenAI strict mode refuses a schema that does not close every object and list
// every key as required. Both of ours already do, but a schema added later
// might not, and the failure would be a 400 rather than anything visible in a
// verdict - so it is enforced here instead of remembered.
export function toStrictJsonSchema(schema: JsonSchema): Record<string, unknown> {
  const out: Record<string, unknown> = { type: schema.type };
  if (schema.enum) out.enum = [...schema.enum];
  if (schema.items) out.items = toStrictJsonSchema(schema.items);
  if (schema.properties) {
    const keys = Object.keys(schema.properties);
    out.properties = Object.fromEntries(
      keys.map((key) => [key, toStrictJsonSchema(schema.properties![key])]),
    );
    out.required = [...keys];
    out.additionalProperties = false;
  }
  return out;
}
