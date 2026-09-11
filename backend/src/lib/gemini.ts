import { env } from "@/lib/env";
import { callModel, type JsonSchema, type ModelTurn } from "@/lib/provider";
import { describeError, toGeminiError } from "@/lib/errors";
import { rulesByIds } from "@/lib/knowledge";
import { PLACES_SOURCE } from "@/lib/places";
import type { Place } from "@/lib/places";
import { logError, logInfo } from "@/lib/logger";
import {
  buildChatSystemPrompt,
  buildPhotoMetaLine,
  buildVisionContextLine,
  buildRefusal,
  buildVisionSystemPrompt,
  VISION_PARSE_FALLBACK,
} from "@/lib/prompts";
import type { RefusalReason } from "@/lib/prompts";
import { withRetry } from "@/lib/retry";
import { withTimeout } from "@/lib/timeout";
import { HISTORY_LIMIT } from "@/lib/validation";
import { asksForVolatileFact, statesVolatileFact } from "@/lib/volatility";
import type { Rule } from "@/lib/types";
import type {
  ChatKind,
  ChatMessage,
  ChatResponse,
  Lang,
  PhotoMeta,
  Proximity,
  SiteContext,
  VisionContext,
  VisionResult,
  VisionStatus,
} from "@shared/contract";

const VISION_STATUSES: VisionStatus[] = [
  "compliant",
  "needs_attention",
  "not_compliant",
  "unclear",
];

// Written as plain JSON Schema; each provider translates it (see provider.ts).
// `propertyOrdering`, which the Google request still carries, is derived there
// from the declaration order rather than repeated here.
const VISION_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    status: { type: "string", enum: VISION_STATUSES },
    reason: { type: "string" },
    suggestion: { type: "string" },
    reference: { type: "string" },
  },
  required: ["status", "reason", "suggestion", "reference"],
};

// Written as a Record keyed by ChatKind rather than a plain array, because an
// array of the right type can silently be missing a member - `places` was added
// to the contract and left out here, and every answer claiming the new tier was
// quietly refused, schema enum included. A Record literal has to name every
// member or it does not compile, so the next tier added to `ChatKind` breaks the
// build here rather than failing in production.
const CHAT_KIND_SET: Record<ChatKind, true> = {
  rule: true,
  context: true,
  general: true,
  places: true,
  none: true,
};
const CHAT_KINDS = Object.keys(CHAT_KIND_SET) as ChatKind[];

// The model names rule ids and declares its own tier; it no longer types the
// attribution itself. All three fields are required, so "forgot to fill it in"
// - which used to sink a good answer - is not a state the schema can produce.
const CHAT_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    answer: { type: "string" },
    kind: { type: "string", enum: CHAT_KINDS },
    ruleIds: { type: "array", items: { type: "string" } },
  },
  required: ["answer", "kind", "ruleIds"],
};

/** Everything the prompt knows besides the pixels. */
export interface VisionRequestContext {
  context: VisionContext;
  lang: Lang;
  site?: SiteContext;
  /** Resolved server-side from the ids the request named. */
  siteRules?: Rule[];
  /** Time and place, as the visitor's device reported them. */
  photo?: PhotoMeta;
}

// An options object rather than a seventh positional argument: the call site
// was already `(data, mime, context, lang, site, rules)`, and a reader should
// not have to count commas to find out which is which.
export async function analyzeImage(
  base64Image: string,
  mimeType: "image/jpeg" | "image/png",
  { context, lang, site, siteRules = [], photo }: VisionRequestContext,
): Promise<VisionResult> {
  const started = Date.now();
  const call = () =>
    callModel("vision", {
      schemaName: "sasana_vision",
      systemInstruction: buildVisionSystemPrompt(lang),
      turns: [
        {
          role: "user",
          text: buildVisionContextLine(context, lang, site, siteRules) + buildPhotoMetaLine(photo),
        },
      ],
      image: { data: base64Image, mimeType },
      temperature: 0.2,
      maxOutputTokens: 512,
      schema: VISION_SCHEMA,
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
      provider: env.AI_PROVIDER,
      durationMs: Date.now() - started,
      imageBytes: Math.floor((base64Image.length * 3) / 4),
      promptTokens: res.usage.promptTokens,
      outputTokens: res.usage.outputTokens,
      totalTokens: res.usage.totalTokens,
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

/** Everything the answer is built from besides the question and the history. */
export interface ChatRequestContext {
  site?: SiteContext;
  /** Resolved server-side from the ids the request named. */
  siteRules?: Rule[];
  /** Read from OpenStreetMap for this request, empty when none was needed. */
  places?: Place[];
  /** The area those places were read around, as the map names it. */
  placesArea?: string;
  /**
   * The question asked what is nearby, and nothing said near where: no area
   * named in it that resolved, and no Site attached to the request.
   */
  unanchoredPlaceQuery?: boolean;
  /** Where the visitor is standing relative to `site`, when they told us. */
  proximity?: Proximity;
  /**
   * The full knowledge base, when `rules` is the narrowed selection actually
   * sent. Only a refusal uses it, to name topics beyond this question's slice.
   */
  allRules?: Rule[];
}

/** An answer plus what it cost, which is what the cache records as saved. */
export interface AnsweredQuestion {
  response: ChatResponse;
  /** `usageMetadata.totalTokenCount`, absent when the API declined to report it. */
  totalTokens?: number;
}

export async function askQuestion(
  message: string,
  history: ChatMessage[],
  lang: Lang,
  rules: Rule[],
  {
    site,
    siteRules = [],
    places = [],
    placesArea,
    unanchoredPlaceQuery = false,
    allRules = rules,
    proximity,
  }: ChatRequestContext = {},
): Promise<AnsweredQuestion> {
  const started = Date.now();
  const contents: ModelTurn[] = [
    ...history.slice(-HISTORY_LIMIT).map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      text: m.content,
    })),
    { role: "user", text: message },
  ];

  const call = () =>
    callModel("chat", {
      schemaName: "sasana_chat",
      systemInstruction: buildChatSystemPrompt(rules, lang, {
        site,
        siteRules,
        places,
        placesArea,
        proximity,
      }),
      turns: contents,
      temperature: 0.3,
      maxOutputTokens: 800,
      schema: CHAT_SCHEMA,
    });

  try {
    // Bounds the whole operation, retry included. See analyzeImage.
    const res = await withTimeout(
      withRetry(call, { retries: 1, backoffMs: env.GEMINI_RETRY_BACKOFF_MS }),
      env.GEMINI_CHAT_TIMEOUT_MS,
      "chat",
    );
    const result = safeParseChat(res.text, lang, rules, {
      message,
      places,
      unanchoredPlaceQuery,
      allRules,
    });
    logInfo({
      route: "chat",
      event: "gemini_ok",
      provider: env.AI_PROVIDER,
      durationMs: Date.now() - started,
      kind: result.kind,
      citedRules: result.ruleIds.length,
      rulesSent: rules.length,
      historyTurns: contents.length - 1,
      promptTokens: res.usage.promptTokens,
      outputTokens: res.usage.outputTokens,
      totalTokens: res.usage.totalTokens,
    });
    return { response: result, totalTokens: res.usage.totalTokens };
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
// enforces it, so a misbehaving model can never surface an invented rule to a
// tourist.
//
// What changed, and why it matters: grounding used to hang on a `grounded`
// boolean and a `source` STRING the model typed itself, which meant the server
// was checking that the model had made a claim, not that the claim was true.
// An answer built correctly from the rules but missing its `source` was thrown
// away, while a confident fabrication that filled the field in was let through.
// Now the model names ids, `rulesByIds` resolves them against the server's own
// knowledge base, and the attribution is read off the rules that survive - so
// the claim is checked rather than trusted. Ids the KB does not know simply
// vanish; an answer left with none of them is not grounded, whatever it says
// about itself.
// The tiers are a one-way street. The model PROPOSES a `kind`; this function
// checks the proposal and may push it DOWN the ladder, never up. Every way a
// model can misbehave - overclaiming, citing ids that do not exist, wandering
// into facts that expire - therefore lands on a more careful answer than the
// one it wanted to give, and no failure path ends anywhere else.
/** What the server knows about the request that the model's reply cannot say. */
export interface ChatParseContext {
  /** The question, so a refusal can offer what the knowledge base does hold. */
  message: string;
  /**
   * The map lookup the server put in front of the model, empty when it made
   * none.
   *
   * Two jobs, and they are the same fact read twice: whether a lookup happened
   * at all, which is what makes the `places` tier checkable, and what it found,
   * which the answer carries back so a visitor can go to one of them. Keeping
   * them as one field is what stops an answer ever claiming the tier while
   * shipping a list from somewhere else.
   */
  places?: Place[];
  /**
   * The question asked what is nearby and the server had nowhere to search.
   * Changes which refusal is read, never whether one happens.
   */
  unanchoredPlaceQuery?: boolean;
  /**
   * The whole knowledge base, when the prompt carried only part of it.
   *
   * Citations resolve against what was SENT - a model naming a rule it was not
   * shown is working from memory, which is the thing being guarded against -
   * but a refusal offers topics from everything the assistant knows, because
   * "what I can help with" is a claim about the app, not about this request.
   */
  allRules?: Rule[];
}

/**
 * Which refusal a visitor reads when nothing more specific decided it.
 *
 * Volatility comes first even for a question about places. "berapa harga hotel
 * dekat sini" names no area and asks a price, and answering "which area?" would
 * take the visitor round a loop that ends in the price refusal anyway. The
 * class of fact is settled; where they are is not the reason they cannot be
 * helped.
 */
function defaultRefusalReason(message: string, unanchoredPlaceQuery: boolean): RefusalReason {
  if (asksForVolatileFact(message)) return "volatile";
  if (unanchoredPlaceQuery) return "noArea";
  return "uncovered";
}

export function safeParseChat(
  text: string | undefined,
  lang: Lang,
  rules: Rule[],
  { message, places = [], unanchoredPlaceQuery = false, allRules = rules }: ChatParseContext,
): ChatResponse {
  let raw: { answer?: unknown; kind?: unknown; ruleIds?: unknown } | null = null;
  try {
    raw = JSON.parse(text ?? "");
  } catch {
    raw = null;
  }

  // A refusal is built rather than looked up: which one a visitor reads depends
  // on why the answer was refused, and only this function knows that.
  //
  // When the net fires, the reason is settled - the answer said something that
  // expires. Every other refusal falls back to reading the QUESTION, because
  // the model usually declines these on its own and the net never sees them.
  // Without that fallback, "berapa harga tiket masuk?" came back worded as
  // though no rule covered the topic, and offered a rule matched on the word
  // "masuk".
  const refuse = (reason?: RefusalReason): ChatResponse => ({
    answer: buildRefusal(
      message,
      lang,
      allRules,
      reason ?? defaultRefusalReason(message, unanchoredPlaceQuery),
    ),
    kind: "none",
    ruleIds: [],
    source: null,
  });
  const refused = refuse();

  const answer = typeof raw?.answer === "string" ? raw.answer.trim() : "";
  if (!answer) return refused;

  const claimedKind = CHAT_KINDS.includes(raw?.kind as ChatKind)
    ? (raw?.kind as ChatKind)
    : "none";

  if (claimedKind === "rule") {
    const claimedIds = Array.isArray(raw?.ruleIds)
      ? raw.ruleIds.filter((id): id is string => typeof id === "string")
      : [];
    const cited = rulesByIds(rules, claimedIds);

    // A claim of grounding with nothing behind it is refused outright rather
    // than softened into a lower tier. The answer asserted a rule, and a
    // visitor acts on a rule whatever label ends up printed beneath it -
    // relabelling a fabricated instruction as "general knowledge" would hide
    // the problem instead of stopping it.
    if (cited.length === 0) return refused;

    // Both sources can legitimately appear at once - a question about attire in
    // a sacred area draws on the Circular and on adat. Listing both is the
    // honest reading; picking one would attribute the answer to less than it
    // stands on.
    const source = [...new Set(cited.map((rule) => rule.source))].join(" · ");
    return { answer, kind: "rule", ruleIds: cited.map((rule) => rule.id), source };
  }

  // The map tier is verifiable in the one way that matters: the server knows
  // whether it performed a lookup. A model that reaches for "places" without
  // one in front of it is naming hotels out of memory, which is the exact
  // failure this tier was built to end.
  if (claimedKind === "places") {
    if (places.length === 0) return refused;
    return {
      answer,
      kind: "places",
      ruleIds: [],
      source: PLACES_SOURCE,
      // The same places the sentence was written from, in a shape a map can
      // draw. Taken from the server's own lookup rather than from anything the
      // model returned, so a name it invented cannot become a pin.
      amenities: places.map(({ name, kind, distanceM, lat, lng }) => ({
        name,
        kind,
        distanceM,
        lat,
        lng,
      })),
    };
  }

  if (claimedKind === "context" || claimedKind === "general") {
    // The net. See volatility.ts for why grounded answers skip it.
    if (statesVolatileFact(answer)) return refuse("volatile");
    // `ruleIds` is only meaningful at the "rule" tier, so it is cleared rather
    // than passed through: an ungrounded answer carrying rule ids would read to
    // every later consumer as if it were sourced.
    return { answer, kind: claimedKind, ruleIds: [], source: null };
  }

  return refused;
}
