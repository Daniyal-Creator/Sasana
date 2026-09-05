import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { env } from "@/lib/env";
import { describeError, toGeminiError } from "@/lib/errors";
import { logError, logInfo } from "@/lib/logger";
import {
  buildChatSystemPrompt,
  buildVisionContextLine,
  buildVisionSystemPrompt,
  chatFallback,
  VISION_PARSE_FALLBACK,
} from "@/lib/prompts";
import { withRetry } from "@/lib/retry";
import { withTimeout } from "@/lib/timeout";
import { HISTORY_LIMIT } from "@/lib/validation";
import type { Rule } from "@/lib/types";
import type {
  ChatMessage,
  ChatResponse,
  Lang,
  SiteContext,
  VisionContext,
  VisionResult,
  VisionStatus,
} from "@shared/contract";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

// Gemini 3.x rejects the `thinkingBudget: 0` that backend-spec specifies (400
// invalid argument); `thinkingLevel: MINIMAL` is its replacement and measurably
// does the same job — it took gemini-3.6-flash from 221 thinking tokens and
// 2.5s down to 0 tokens and 1.3s. Coupled to the 3.x model defaults above.
const THINKING = { thinkingLevel: ThinkingLevel.MINIMAL };

const VISION_STATUSES: VisionStatus[] = [
  "compliant",
  "needs_attention",
  "not_compliant",
  "unclear",
];

const VISION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    status: { type: Type.STRING, enum: VISION_STATUSES },
    reason: { type: Type.STRING },
    suggestion: { type: Type.STRING },
    reference: { type: Type.STRING },
  },
  required: ["status", "reason", "suggestion", "reference"],
  propertyOrdering: ["status", "reason", "suggestion", "reference"],
};

const CHAT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    answer: { type: Type.STRING },
    source: { type: Type.STRING, nullable: true },
    grounded: { type: Type.BOOLEAN },
  },
  required: ["answer", "grounded"],
  propertyOrdering: ["answer", "source", "grounded"],
};

export async function analyzeImage(
  base64Image: string,
  mimeType: "image/jpeg" | "image/png",
  context: VisionContext,
  lang: Lang,
  site?: SiteContext,
  siteRules: Rule[] = [],
): Promise<VisionResult> {
  const started = Date.now();
  const call = () =>
    ai.models.generateContent({
      model: env.GEMINI_VISION_MODEL,
      contents: [
        { inlineData: { data: base64Image, mimeType } },
        buildVisionContextLine(context, lang, site, siteRules),
      ],
      config: {
        systemInstruction: buildVisionSystemPrompt(lang),
        temperature: 0.2,
        maxOutputTokens: 512,
        thinkingConfig: THINKING,
        responseMimeType: "application/json",
        responseSchema: VISION_SCHEMA,
      },
    });

  try {
    // The timeout wraps the retry, not the other way round, so it bounds the
    // whole operation: the longest a user can ever wait is exactly
    // GEMINI_VISION_TIMEOUT_MS. Timing out each attempt separately would let a
    // 429 retry stretch the worst case to twice the timeout plus the backoff.
    const res = await withTimeout(
      withRetry(call, { retries: 1, backoffMs: env.GEMINI_RETRY_BACKOFF_MS }),
      env.GEMINI_VISION_TIMEOUT_MS,
      "vision",
    );
    const result = safeParseVision(res.text, lang);
    logInfo({
      route: "vision",
      event: "gemini_ok",
      durationMs: Date.now() - started,
      imageBytes: Math.floor((base64Image.length * 3) / 4),
      promptTokens: res.usageMetadata?.promptTokenCount,
      outputTokens: res.usageMetadata?.candidatesTokenCount,
      totalTokens: res.usageMetadata?.totalTokenCount,
      status: result.status,
    });
    return result;
  } catch (err) {
    logError({
      route: "vision",
      event: "gemini_fail",
      durationMs: Date.now() - started,
      err: describeError(err),
    });
    throw toGeminiError(err);
  }
}

// Unparseable output fails safe to "unclear" rather than throwing: FR1.5 already
// defines "I can't tell from this photo" as a first-class answer, and it is a
// far better experience than an error card.
export function safeParseVision(text: string | undefined, lang: Lang): VisionResult {
  try {
    const raw = JSON.parse(text ?? "") as Record<string, unknown>;
    const status = VISION_STATUSES.includes(raw.status as VisionStatus)
      ? (raw.status as VisionStatus)
      : "unclear";
    const reason = String(raw.reason ?? "").slice(0, 500);
    const suggestion = String(raw.suggestion ?? "").slice(0, 500);
    // A verdict with no explanation would violate FR1.3 ("never just wrong").
    if (!reason || !suggestion) throw new Error("incomplete vision result");
    return { status, reason, suggestion, reference: String(raw.reference ?? "") };
  } catch {
    return { status: "unclear", ...VISION_PARSE_FALLBACK[lang], reference: "" };
  }
}

export async function askQuestion(
  message: string,
  history: ChatMessage[],
  lang: Lang,
  rules: Rule[],
  site?: SiteContext,
  siteRules: Rule[] = [],
): Promise<ChatResponse> {
  const started = Date.now();
  const contents = [
    ...history.slice(-HISTORY_LIMIT).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const call = () =>
    ai.models.generateContent({
      model: env.GEMINI_CHAT_MODEL,
      contents,
      config: {
        systemInstruction: buildChatSystemPrompt(rules, lang, site, siteRules),
        temperature: 0.3,
        maxOutputTokens: 800,
        thinkingConfig: THINKING,
        responseMimeType: "application/json",
        responseSchema: CHAT_SCHEMA,
      },
    });

  try {
    // Bounds the whole operation, retry included. See analyzeImage.
    const res = await withTimeout(
      withRetry(call, { retries: 1, backoffMs: env.GEMINI_RETRY_BACKOFF_MS }),
      env.GEMINI_CHAT_TIMEOUT_MS,
      "chat",
    );
    const result = safeParseChat(res.text, lang, rules.length);
    logInfo({
      route: "chat",
      event: "gemini_ok",
      durationMs: Date.now() - started,
      grounded: result.grounded,
      historyTurns: contents.length - 1,
      promptTokens: res.usageMetadata?.promptTokenCount,
      outputTokens: res.usageMetadata?.candidatesTokenCount,
      totalTokens: res.usageMetadata?.totalTokenCount,
    });
    return result;
  } catch (err) {
    logError({
      route: "chat",
      event: "gemini_fail",
      durationMs: Date.now() - started,
      err: describeError(err),
    });
    throw toGeminiError(err);
  }
}

// The server-side half of the grounding guarantee (FR2.1, backend-spec §2.2).
// The prompt asks the model to decline when no rule covers the question; this
// enforces it. Anything short of a grounded answer with a real source becomes
// the official fallback, so a misbehaving model can never surface an invented
// rule to a tourist.
export function safeParseChat(
  text: string | undefined,
  lang: Lang,
  ruleCount: number,
): ChatResponse {
  let raw: { answer?: unknown; source?: unknown; grounded?: unknown } | null = null;
  try {
    raw = JSON.parse(text ?? "");
  } catch {
    raw = null;
  }

  const grounded = raw?.grounded === true;
  const source =
    typeof raw?.source === "string" && raw.source.trim() ? raw.source.trim() : null;
  const answer = typeof raw?.answer === "string" ? raw.answer.trim() : "";

  if (!grounded || !source || !answer || ruleCount === 0) {
    return { answer: chatFallback(lang), source: null, grounded: false };
  }
  return { answer, source, grounded: true };
}
