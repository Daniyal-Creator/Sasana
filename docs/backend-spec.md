# Backend Specification — SASANA

**AI Etiquette & Balinese Custom Guide for Tourists**

| | |
|---|---|
| **Document** | Backend Specification (API Routes, AI Integration, Knowledge Base) |
| **Companion to** | [PRD](./prd.md) · [Technical Specification](./tech-spec.md) · [UI/UX Specification](./ui-spec.md) |
| **Version** | 1.0 (MVP) |
| **Runtime** | Next.js 14+ App Router · Node.js serverless · TypeScript |
| **Author role** | Backend / AI integration (Daniyal, PRD §17) |

> **Purpose.** This document is a complete, self-sufficient implementation blueprint for the SASANA backend. Every route, function signature, config value, prompt string, error message, and the full seed knowledge base are written out. A developer can build the entire backend from this file alone.

> [!IMPORTANT]
> **SDK correction (supersedes PRD §8/§14).** The PRD names `@google/generative-ai`. That is Google's **deprecated** JS SDK. This spec uses the current supported package **`@google/genai`** (`GoogleGenAI`, `ai.models.generateContent`, JSON mode via `responseSchema` + `Type`, token usage via `response.usageMetadata`). Wherever the task text says "google-generative-ai", read it as `@google/genai`.

> [!WARNING]
> **Revision 1.1 — 2026-08-12. Corrections found by building this spec against the live API.** v1.0 was written ahead of implementation; three of its choices did not survive contact with the running service, and several details drifted from the shipped code. Everything below is now reconciled with the implementation and verified against the live Gemini API.
>
> | # | v1.0 said | Reality | Where |
> |---|---|---|---|
> | 1 | Chat model `gemini-2.5-flash-lite` | **Dead.** API returns `404 "This model ... is no longer available to new users."` Note it still appears in ListModels, so the model list is not proof a model is callable. | §2.2, §7 |
> | 2 | Vision model `gemini-2.5-flash` | Still callable, but superseded. PRD §8 already mandates the latest free Flash generation, which is both faster and more accurate on vision. | §2.1, §7 |
> | 3 | `thinkingConfig: { thinkingBudget: 0 }` | **Rejected by every Gemini 3.x model** with `400 Request contains an invalid argument`. Replacement is `thinkingConfig: { thinkingLevel: MINIMAL }`, measured on `gemini-3.6-flash` at 221 thinking tokens → 0 and 2,553 ms → 1,293 ms. | §2.1, §2.2, §4 |
> | 4 | `types/index.ts` | Types live in **`lib/types.ts`** (repo convention); `Lang` comes from `lib/i18n`. | throughout |
> | 5 | `isRateLimit` in `lib/retry.ts` | Moved to **`lib/errors.ts`** — the v1.0 layout creates a circular import (`retry` → `errors` → `retry`). | §4.4 |
> | 6 | `CHAT_FALLBACK` constant in `lib/prompts.ts` | Replaced by `chatFallback(lang)`, which returns the existing `assistant.ungrounded` string from `lib/i18n` so server and client copy cannot drift. Text is identical. | §2.2, appendix |
> | 7 | Cache sets `x-cache: HIT` only | Sends **`HIT` and `MISS`**; without an explicit `MISS`, an absent header is ambiguous. | §2.2, §9.2 |
> | 8 | KB of 12 rules, `category` per rule | **13 rules**, each with `category_en`/`category_id` and a cultural-meaning layer `why_en`/`why_id`/`why_source` (ADR-0002). | §3 |
> | 9 | `GEMINI_TIMEOUT_MS` only | Adds **`GEMINI_RETRY_BACKOFF_MS`** (default 1500, set to 0 in tests). | §7 |
>
> One model to avoid: `gemini-3.5-flash` prefixes its JSON with `Here is the JSON requested:` even in JSON mode. `gemini-3.6-flash` and `gemini-3.5-flash-lite` return clean JSON.

---

## Table of Contents

1. [Backend Architecture](#1-backend-architecture)
2. [API Route Specifications](#2-api-route-specifications)
3. [Knowledge Base (`data/rules.json`)](#3-knowledge-base-datarulesjson)
4. [Gemini Client Library (`lib/gemini.ts`)](#4-gemini-client-library-libgeminits)
5. [Knowledge Base Library (`lib/knowledge.ts`)](#5-knowledge-base-library-libknowledgets)
6. [Error Handling Strategy](#6-error-handling-strategy)
7. [Environment & Configuration](#7-environment--configuration)
8. [Security Checklist](#8-security-checklist)
9. [Performance Optimization](#9-performance-optimization)
10. [Testing Plan (Backend-Specific)](#10-testing-plan-backend-specific)
11. [Appendix — File Map & Shared Types](#appendix--file-map--shared-types)

---

## 1. Backend Architecture

### 1.1 BFF (Backend-for-Frontend) with Next.js API Routes

SASANA's backend is a thin **Backend-for-Frontend**: a set of Next.js App Router **Route Handlers** (`app/api/**/route.ts`) whose *only* client is SASANA's own UI. They run as Node.js serverless functions on Vercel, co-deployed and same-origin with the frontend. There is no database and no standalone server; the only durable data is the static `data/rules.json`.

```
┌──────────────────────────────────────────────────────────────────┐
│ CLIENT (browser)  —  React Client Components (/check, /assistant)  │
│   never holds GEMINI_API_KEY · never calls Google directly         │
└───────────────┬───────────────────────────┬──────────────────────┘
                │ fetch() same-origin        │ fetch() same-origin
                │ POST /api/vision           │ POST /api/chat
                │ { image, context }         │ { message, lang, history }
                ▼                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ BFF — Next.js Route Handlers (Node.js serverless)   [TRUST BOUNDARY]│
│   reads process.env.GEMINI_API_KEY (server-only)                   │
│                                                                    │
│   app/api/vision/route.ts        app/api/chat/route.ts             │
│     validate → decode image        validate → sanitize             │
│     lib/gemini.analyzeImage()      lib/knowledge.loadRules()       │
│                                    lib/gemini.askQuestion()        │
│         │                               │            │             │
│    lib/gemini.ts (SDK wrapper)     lib/prompts.ts   lib/knowledge.ts│
└─────────┼───────────────────────────────┼────────────┼────────────┘
          │ HTTPS + x-goog-api-key         │            │ import (bundled)
          ▼                                ▼            ▼
┌───────────────────────────┐   ┌────────────────────────────────────┐
│ Google Gemini API          │   │ Knowledge Base                      │
│ gemini-3.6-flash (vision)  │   │ data/rules.json (static, in-repo)   │
│ gemini-3.5-flash-lite(text)│   │ loaded + cached in module memory    │
└───────────────────────────┘   └────────────────────────────────────┘
```

### 1.2 Why every AI call goes through the server

| Concern | Why the BFF is required |
|---|---|
| **API-key protection** | The browser is untrusted; anything it can read, a user can extract. `GEMINI_API_KEY` is read only inside server functions, never prefixed `NEXT_PUBLIC_`, and never shipped in the client bundle. A direct browser→Gemini call would leak the key and let anyone burn the free-tier quota (PRD §7, §8, §19). |
| **CORS avoidance** | Client and BFF share one origin (the Vercel deployment). Same-origin `fetch` needs no CORS preflight, no cross-origin headers. A separate backend would force CORS config and a second deployment. We deliberately do **not** open our API routes to other origins (§8.5). |
| **Request validation & shaping** | The server validates inputs (image size/type FR1.1, message length), builds the grounded prompt (PRD §13), enforces JSON output, and shapes Gemini's response into the API contract (PRD §11) before it reaches the client. |
| **Secrets for cross-cutting logic** | Timeouts, one-shot retry on 429, structured logging, and in-memory answer caching all live server-side where they belong. |

---

## 2. API Route Specifications

Both routes: `export const runtime = "nodejs";` (the Node SDK + base64 bodies need Node, not Edge). Both accept **only `POST`** (any other method → automatic `405`). Both return `application/json`.

### 2.1 `POST /api/vision` — Situation Check (F1)

#### Request

`Content-Type: application/json`

```jsonc
{
  "image": "<base64 string>",     // required. Raw base64 OR a data URL ("data:image/jpeg;base64,...").
                                  // Decoded size must be ≤ 5 MB. JPEG or PNG only.
  "context": "temple"             // optional. "temple" | "general". Default: "general".
}
```

#### Request validation (in order; first failure wins)

| Check | Rule | On failure |
|---|---|---|
| JSON parse | body is valid JSON object | `400 invalid_json` |
| `image` present | non-empty string | `400 invalid_input` |
| Base64 shape | matches base64 charset after stripping optional `data:` prefix | `400 invalid_input` |
| Media type | magic bytes are JPEG (`FF D8 FF`) or PNG (`89 50 4E 47`) | `400 unsupported_media` |
| Size | decoded byte length ≤ `5 * 1024 * 1024` | `413 image_too_large` |
| `context` | if present, ∈ `{"temple","general"}` (else coerced to `"general"`) | (no error; coerced) |

#### Response — success `200`

```jsonc
{
  "status": "not_compliant",                                  // "compliant"|"needs_attention"|"not_compliant"|"unclear"
  "reason": "You appear to be wearing shorts in a temple area.",
  "suggestion": "Wrap a kamen and sash before entering the inner courtyard.",
  "reference": "Bali Governor Circular No. 7 of 2025"         // "" when none applies
}
```

#### Response — errors

| HTTP | `code` | When | Body |
|---|---|---|---|
| `400` | `invalid_json` / `invalid_input` / `unsupported_media` | bad/absent/non-image input | `{ "error": "<message>", "code": "invalid_input" }` |
| `413` | `image_too_large` | decoded image > 5 MB | `{ "error": "The photo is larger than 5 MB. Please use a smaller image.", "code": "image_too_large" }` |
| `429` | `rate_limited` | Gemini quota exceeded after 1 retry | `{ "error": "We're a little busy right now. Please try again in a moment.", "code": "rate_limited" }` |
| `504` | `timeout` | Gemini exceeded the 9 s app timeout | `{ "error": "Something went wrong analyzing your photo. Please try again.", "code": "timeout" }` |
| `502` | `ai_error` | Gemini returned an error / unparseable output | `{ "error": "Something went wrong analyzing your photo. Please try again.", "code": "ai_error" }` |
| `500` | `internal` | any unexpected error | `{ "error": "Something went wrong. Please try again.", "code": "internal" }` |

> Error strings above are the **English** defaults. The full EN/ID table is §6.3. The client also renders its own localized copy (UI Spec §10), so the server body is a safe fallback and log aid, never a raw stack trace (§8).

#### Model & generation config

| Setting | Value | Reason |
|---|---|---|
| Model | **`gemini-3.6-flash`** | Latest free Flash generation (PRD §8); multimodal; hits < 8 s (PRD §3). |
| `temperature` | `0.2` | Low: compliance judgment should be consistent, not creative. |
| `maxOutputTokens` | `512` | JSON result is short; caps latency and tokens. |
| `thinkingConfig.thinkingLevel` | `MINIMAL` | Minimize latency + token use. **Not `thinkingBudget: 0`** — 3.x models reject that with a 400. |
| `responseMimeType` | `"application/json"` | Forces machine-parseable output (PRD §11). |
| `responseSchema` | `VISION_SCHEMA` (below) | Constrains to the 4 fields, `status` restricted to the enum. |

```ts
// lib/gemini.ts — vision response schema
import { Type } from "@google/genai";

const VISION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    status:     { type: Type.STRING, enum: ["compliant", "needs_attention", "not_compliant", "unclear"] },
    reason:     { type: Type.STRING },
    suggestion: { type: Type.STRING },
    reference:  { type: Type.STRING },
  },
  required: ["status", "reason", "suggestion", "reference"],
  propertyOrdering: ["status", "reason", "suggestion", "reference"],
} as const;
```

#### System prompt (exact text sent to Gemini, PRD §13, FR1.3–1.5)

Sent via `config.systemInstruction`. The image and a context note are the `contents`.

```
You are SASANA, a friendly Balinese custom-and-etiquette assistant for tourists.
Analyze the provided photo for compliance with Balinese custom and the sanctity of sacred sites (pura). Focus on:
- Attire appropriateness in sacred areas (a kamen/sarong and sash; shoulders and knees covered).
- Presence of sacred elements (pelinggih/shrines, canang/offerings, temple gates and walls).
- Risky or disrespectful behavior (climbing shrines or sacred trees, stepping on offerings, sitting or standing on sacred structures).

Rules for your answer:
1. Choose a compliance status of exactly one of: "compliant", "needs_attention", "not_compliant", "unclear".
2. ALWAYS include a short, plain-language "reason" and a polite, actionable "suggestion". Never reply with only "wrong".
3. Be warm, respectful, and educational. Assume good intent: tourists usually act out of unfamiliarity, not disrespect. Never shame the user.
4. If the photo is too dark, blurry, empty of people, or clearly unrelated to a person or temple setting, set status to "unclear" and ask for a clearer, well-lit photo instead of guessing.
5. When you reference a rule, prefer "Bali Governor Circular No. 7 of 2025"; otherwise use "Balinese Hindu custom (adat)". If no reference applies, use an empty string.
6. Keep "reason" and "suggestion" under about 240 characters each.

Return ONLY a JSON object with keys: status, reason, suggestion, reference. Do not add any text outside the JSON.
```

The `contents` array (per request):

```ts
contents: [
  { inlineData: { data: base64WithoutPrefix, mimeType } }, // mimeType = "image/jpeg" | "image/png"
  context === "temple"
    ? "Context: the user says they are at or near a temple (pura)."
    : "Context: general setting; it may or may not be a sacred site.",
]
```

#### Image processing (server side, before the Gemini call)

1. **Strip** an optional `data:image/...;base64,` prefix.
2. **Validate** base64 charset with a regex; reject otherwise.
3. **Decode** with `Buffer.from(b64, "base64")`; the resulting byte length is authoritative for the 5 MB check (client-reported size is not trusted).
4. **Detect format** from magic bytes → set `mimeType`. Reject anything not JPEG/PNG.
5. Pass the **cleaned base64** (no prefix) and `mimeType` to `analyzeImage`. The image is never written to disk (§8.6).

#### Timeout handling

App-level timeout via `withTimeout(..., 9000 ms)` (`GEMINI_TIMEOUT_MS`), comfortably under Vercel's function ceiling. On expiry the route returns `504 timeout` with a friendly message (never hangs). See `lib/timeout.ts` (§4.5).

#### Route implementation

```ts
// app/api/vision/route.ts
import { analyzeImage } from "@/lib/gemini";
import { validateVisionRequest, decodeAndValidateImage } from "@/lib/validation";
import { parseJsonBody, handleApiError } from "@/lib/http";
import { logInfo } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 15; // seconds; app timeout (9s) fires first

export async function POST(req: Request): Promise<Response> {
  const started = Date.now();
  try {
    const body = await parseJsonBody(req);                 // -> ValidationError(invalid_json)
    const { image, context } = validateVisionRequest(body); // -> ValidationError(invalid_input)
    const { data, mimeType, bytes } = decodeAndValidateImage(image); // -> 413 / unsupported_media
    const result = await analyzeImage(data, mimeType, context);
    logInfo({ route: "vision", event: "ok", durationMs: Date.now() - started, imageBytes: bytes, status: result.status });
    return Response.json(result, { status: 200 });
  } catch (err) {
    return handleApiError(err, { route: "vision", startedAt: started });
  }
}
```

---

### 2.2 `POST /api/chat` — Custom Assistant (F2)

#### Request

```jsonc
{
  "message": "Can I fly a drone at Tanah Lot?",   // required. 1–1000 chars after sanitize.
  "lang": "en",                                    // required. "en" | "id". Default "en" if invalid.
  "history": [                                     // optional. Prior turns this session (FR2.4).
    { "role": "user", "content": "Can I wear shorts?" },
    { "role": "assistant", "content": "Modest dress is required at temples..." }
  ]
}
```

#### Request validation

| Check | Rule | On failure |
|---|---|---|
| JSON parse | valid JSON object | `400 invalid_json` |
| `message` type | string | `400 invalid_input` |
| `message` length | `1 ≤ trimmedLength ≤ 1000` (after HTML strip + trim) | `400 invalid_input` |
| `lang` | ∈ `{"en","id"}` (else coerced to `"en"`) | (coerced) |
| `history` | array; each item `{ role ∈ {"user","assistant"}, content: string }`; truncated to last 6; each `content` sanitized + capped 1000 | invalid items dropped |

#### Response — success `200`

```jsonc
{
  "answer": "Flying drones over temple areas is restricted. Please avoid it near sacred sites.",
  "source": "Bali Governor Circular No. 7 of 2025",   // string when grounded, null otherwise
  "grounded": true                                     // false => no matching rule; answer is the fallback
}
```

#### Response — errors

Same envelope and codes as vision (`400 invalid_json`/`invalid_input`, `429 rate_limited`, `504 timeout`, `502 ai_error`, `500 internal`). The chat route additionally localizes the error message to the request `lang` when it was parsed successfully (see §6.3). Chat has no `413`.

#### Model & generation config

| Setting | Value | Reason |
|---|---|---|
| Model | **`gemini-3.5-flash-lite`** | Text-only; fastest tier, clean JSON, 0 thinking tokens. (`gemini-2.5-flash-lite` is retired — see Revision 1.1.) |
| `temperature` | `0.3` | Slightly above vision: natural phrasing, still grounded. |
| `maxOutputTokens` | `800` | Enough for a full answer + source; caps latency. |
| `thinkingConfig.thinkingLevel` | `MINIMAL` | Minimize latency/tokens. **Not `thinkingBudget: 0`** — rejected by 3.x models. |
| `responseMimeType` | `"application/json"` | Structured `{answer, source, grounded}`. |
| `responseSchema` | `CHAT_SCHEMA` (below) | Guarantees the grounding fields exist. |

```ts
// lib/gemini.ts — chat response schema
const CHAT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    answer:   { type: Type.STRING },
    source:   { type: Type.STRING, nullable: true },
    grounded: { type: Type.BOOLEAN },
  },
  required: ["answer", "grounded"],
  propertyOrdering: ["answer", "source", "grounded"],
} as const;
```

#### System prompt construction === knowledge-base injection (context stuffing, PRD §12/§13)

For the MVP the KB is tiny (~12 rules), so the **entire** rule set is stuffed into the system prompt (PRD §12), formatted by `formatRulesForPrompt(rules, lang)` (§5). Sent via `config.systemInstruction`; `history` + the new `message` are the `contents`.

**Exact template** (`buildChatSystemPrompt(rules, lang)` fills `{LANG_NAME}` and `{FORMATTED_RULES}`):

```
You are SASANA, a knowledgeable and friendly guide to Balinese customs and the official code of conduct for visitors in Bali.

Follow these instructions strictly:
1. Answer the user's question ONLY using the RULES listed below. Do NOT invent, assume, or add any rule that is not in the list.
2. If the RULES do not cover the question, you MUST set "grounded" to false and reply that no official information is available. Do not guess and do not fabricate a rule.
3. When your answer is based on one or more rules, set "grounded" to true and set "source" to the source text of the most relevant rule.
4. Reply in the user's language: {LANG_NAME}. Keep the tone warm, respectful, concise, and never judgmental.
5. Do not give legal advice or describe penalties beyond what the rules state.

Return ONLY a JSON object with keys: answer (string), source (string or null), grounded (boolean).

RULES:
{FORMATTED_RULES}
```

`{LANG_NAME}` = `"English"` for `en`, `"Indonesian (Bahasa Indonesia)"` for `id`.

Example `{FORMATTED_RULES}` (produced by `formatRulesForPrompt`, EN):

```
1. [Dress Code] A kamen (sarong) and sash must be worn when entering temple grounds; shoulders and knees should be covered. (Source: Bali Governor Circular No. 7 of 2025)
2. [Sacred Behavior] Do not climb, sit on, or stand on shrines (pelinggih), temple walls, or sacred trees. (Source: Bali Governor Circular No. 7 of 2025)
... (all rules) ...
```

#### Conversation history handling

- Keep only the **last 6 messages** (≈3 exchanges) — `HISTORY_LIMIT = 6`. Older turns are dropped to bound prompt size and latency (FR2.4 is a *session* guarantee on the client; the model only needs recent context).
- Each `content` is sanitized (HTML stripped, control chars removed) and capped at 1000 chars before being mapped to Gemini `Content`:

```ts
// role mapping: user -> "user", assistant -> "model"
contents = [
  ...history.slice(-6).map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
  { role: "user", parts: [{ text: sanitizedMessage }] },
];
```

#### Grounding logic (two layers — model + server safety net)

1. **Model layer:** the schema + prompt make Gemini emit `grounded` and `source` itself (instruction #2/#3).
2. **Server safety net** (`safeParseChat`, §4.3): if `grounded !== true` **or** `source` is empty/missing **or** the KB was empty, the server **overwrites `answer` with the localized fallback** and sets `source: null`, `grounded: false`. This guarantees the app never shows a fabricated rule even if the model misbehaves (FR2.1).

**Fallback strings** (also `assistant.ungrounded` in UI Spec §10):

| lang | Fallback answer |
|---|---|
| `en` | `I don't have official information on that in the Bali code of conduct.` |
| `id` | `Saya tidak punya informasi resmi soal itu dalam tata krama Bali.` |

#### Route implementation

```ts
// app/api/chat/route.ts
import { askQuestion } from "@/lib/gemini";
import { loadRules } from "@/lib/knowledge";
import { validateChatRequest } from "@/lib/validation";
import { parseJsonBody, handleApiError } from "@/lib/http";
import { chatCache, chatCacheKey } from "@/lib/cache";
import { logInfo } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function POST(req: Request): Promise<Response> {
  const started = Date.now();
  let lang: "en" | "id" = "en";
  try {
    const body = await parseJsonBody(req);
    const parsed = validateChatRequest(body);
    lang = parsed.lang;
    const { message, history } = parsed;

    // Cache only first-turn (no-history) questions to stay contextually safe.
    if (history.length === 0) {
      const hit = chatCache.get(chatCacheKey(message, lang));
      if (hit) {
        logInfo({ route: "chat", event: "cache_hit", durationMs: Date.now() - started });
        return Response.json(hit, { status: 200, headers: { "x-cache": "HIT" } });
      }
    }

    const rules = loadRules();
    const answer = await askQuestion(message, history, lang, rules);

    if (history.length === 0) chatCache.set(chatCacheKey(message, lang), answer);
    logInfo({ route: "chat", event: "ok", durationMs: Date.now() - started, grounded: answer.grounded });
    return Response.json(answer, { status: 200 });
  } catch (err) {
    return handleApiError(err, { route: "chat", startedAt: started, lang });
  }
}
```

---

## 3. Knowledge Base (`data/rules.json`)

### 3.1 Schema (exact TypeScript interface)

Refines PRD §12 / Tech-Spec Appendix A: `category` is split into `category_en` / `category_id` (this task requires category in both languages). `rule_id` is the Indonesian rule text, `rule_en` the English (PRD §12 naming; `id` remains the unique identifier).

```ts
// lib/types.ts (KB portion)
export interface Rule {
  id: string;            // stable unique slug, e.g. "temple-attire"
  category_en: string;   // e.g. "Dress Code"
  category_id: string;   // e.g. "Tata Busana"
  rule_id: string;       // rule text, Indonesian
  rule_en: string;       // rule text, English
  why_en: string;        // cultural meaning behind the rule, English (ADR-0002)
  why_id: string;        // cultural meaning behind the rule, Indonesian
  why_source: string;    // attribution for the cultural claim; display-only, never prompted
  keywords: string[];    // lowercase tokens for searchRules() + model hinting
  source: string;        // citation, e.g. "Bali Governor Circular No. 7 of 2025"
  sacred_area: boolean;  // true if it specifically governs sacred/temple areas
}
export type RulesFile = Rule[];
```

### 3.2 Seed data (13 entries)

> **The canonical seed data is `data/rules.json` itself, not this document.** v1.0 inlined the full array here; it drifted the moment the cultural-meaning layer was added. Read the file for the current content, and treat this section as the shape and coverage contract.

**Coverage** (13 rules): `temple-attire`, `sacred-area-entry`, `climbing-sacred`, `offerings-canang`, `photography`, `drone-restriction`, `menstruation-entry`, `speaking-volume`, `shoe-removal`, `touching-sacred-objects`, `head-level-respect`, `general-conduct`, `no-littering`.

**Sourcing is honest per field.** `source` cites Governor Circular No. 7 of 2025 only where the Circular genuinely applies, and "Balinese Hindu custom (adat)" otherwise. `why_source` separately attributes the cultural claim, because a rule and the reason behind it can come from different authorities.

One entry, in full, as the shape reference:

```json
[
  {
    "id": "offerings-canang",
    "category_en": "Offerings",
    "category_id": "Sesajen",
    "rule_en": "Do not step on or over canang (small daily offerings) placed on the ground; walk around them.",
    "rule_id": "Jangan menginjak atau melangkahi canang (sesajen harian) yang diletakkan di tanah; berjalanlah memutarinya.",
    "why_en": "Canang sari is a daily offering of thanks: canang refers to the small woven palm-leaf tray and sari means essence. Filled with flowers, a little food, and incense, it is made fresh most mornings and placed at shrines, doorways, and along paths. It expresses the balance Balinese Hindus call Tri Hita Karana, harmony with the divine, with other people, and with nature. A canang on the ground is a finished prayer, not litter, which is why it is left where it lies.",
    "why_id": "Canang sari adalah persembahan syukur harian: canang merujuk pada wadah kecil anyaman daun kelapa dan sari berarti inti atau esensi. Diisi bunga, sedikit makanan, dan dupa, canang dibuat baru hampir setiap pagi lalu diletakkan di pelinggih, depan pintu, dan sepanjang jalan. Canang mengungkapkan keseimbangan yang disebut Tri Hita Karana, yaitu keselarasan dengan Tuhan, sesama manusia, dan alam. Canang di tanah adalah doa yang sudah selesai, bukan sampah, karena itu dibiarkan di tempatnya.",
    "why_source": "Canang sari tradition; Tri Hita Karana philosophy (parahyangan, pawongan, palemahan)",
    "keywords": [
      "canang",
      "offering",
      "offerings",
      "sesajen",
      "step",
      "ground",
      "walk around",
      "flowers",
      "injak",
      "sajen"
    ],
    "source": "Balinese Hindu custom (adat)",
    "sacred_area": false
  }
]
```

> **Integrity rule (carried over from the `content-sections` session).** Inventing cultural meaning is a violation in the same class as fabricating a rule. Every `why_*` entry must carry a real `why_source`, and the seed content remains **pending verification against local sources** (Rafli, PRD §17) before submission.

### 3.3 Loading & caching strategy

- **Loaded via static import** (`import rulesJson from "@/data/rules.json"`) so it is bundled and needs no filesystem read at request time (works identically on Vercel serverless). Requires `"resolveJsonModule": true` in `tsconfig.json`.
- **Module-level cache:** `loadRules()` validates once, stores the typed array in a module variable, and returns the same reference on subsequent calls within a warm function instance (§5). Cold starts revalidate once. No TTL needed (the data is static per deploy).

### 3.4 Future-ready (migration to vector search, PRD §18.7)

The schema is embedding-ready: each `Rule` is an atomic, self-contained unit with `keywords`, `category_*`, and `source`. To scale beyond context-stuffing, add an optional `embedding?: number[]` field and swap `formatRulesForPrompt(allRules)` for `formatRulesForPrompt(searchRules(...))` / a vector top-k retriever. No rule's shape has to change; only retrieval does. `searchRules()` (§5.3) is the seam where that swap happens.

---

## 4. Gemini Client Library (`lib/gemini.ts`)

Single module-scope client; two exported functions; defensive error mapping; one-shot retry on 429; structured logging with token usage.

### 4.1 Client init + config

```ts
// lib/gemini.ts
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { env } from "./env";
import { withTimeout } from "./timeout";
import { withRetry } from "./retry";
import { toGeminiError } from "./errors";
import { logInfo, logError } from "./logger";
import { VISION_SYSTEM_PROMPT, buildChatSystemPrompt, chatFallback } from "./prompts";
import type { VisionResult, VisionStatus, ChatMessage, ChatResponse, Lang, Rule } from "@/types";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

const VISION_STATUSES: VisionStatus[] = ["compliant", "needs_attention", "not_compliant", "unclear"];
const HISTORY_LIMIT = 6;

// (VISION_SCHEMA and CHAT_SCHEMA as defined in §2.1 / §2.2)
```

### 4.2 `analyzeImage(base64Image, mimeType, context)`

```ts
export async function analyzeImage(
  base64Image: string,
  mimeType: "image/jpeg" | "image/png",
  context: "temple" | "general",
): Promise<VisionResult> {
  const started = Date.now();
  const call = () =>
    ai.models.generateContent({
      model: env.GEMINI_VISION_MODEL, // "gemini-3.6-flash"
      contents: [
        { inlineData: { data: base64Image, mimeType } },
        context === "temple"
          ? "Context: the user says they are at or near a temple (pura)."
          : "Context: general setting; it may or may not be a sacred site.",
      ],
      config: {
        systemInstruction: VISION_SYSTEM_PROMPT,
        temperature: 0.2,
        maxOutputTokens: 512,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        responseMimeType: "application/json",
        responseSchema: VISION_SCHEMA,
      },
    });

  try {
    const res = await withRetry(() => withTimeout(call(), env.GEMINI_TIMEOUT_MS, "vision"), { retries: 1 });
    const result = safeParseVision(res.text);
    logInfo({
      route: "vision", event: "gemini_ok", durationMs: Date.now() - started,
      imageBytes: Math.floor((base64Image.length * 3) / 4),
      promptTokens: res.usageMetadata?.promptTokenCount,
      outputTokens: res.usageMetadata?.candidatesTokenCount,
      totalTokens: res.usageMetadata?.totalTokenCount,
      status: result.status,
    });
    return result;
  } catch (err) {
    logError({ route: "vision", event: "gemini_fail", durationMs: Date.now() - started, err: describeError(err) });
    throw toGeminiError(err); // -> GeminiError | RateLimitError | TimeoutError
  }
}

function safeParseVision(text: string | undefined): VisionResult {
  try {
    const raw = JSON.parse(text ?? "");
    const status: VisionStatus = VISION_STATUSES.includes(raw.status) ? raw.status : "unclear";
    return {
      status,
      reason: String(raw.reason ?? "").slice(0, 500),
      suggestion: String(raw.suggestion ?? "").slice(0, 500),
      reference: String(raw.reference ?? ""),
    };
  } catch {
    // Model returned non-JSON: fail safe to "unclear" rather than throwing at the user.
    return {
      status: "unclear",
      reason: "I couldn't read this photo clearly.",
      suggestion: "Please try a clearer, well-lit photo.",
      reference: "",
    };
  }
}
```

### 4.3 `askQuestion(message, history, lang, rules)`

```ts
export async function askQuestion(
  message: string,
  history: ChatMessage[],
  lang: Lang,
  rules: Rule[],
): Promise<ChatResponse> {
  const started = Date.now();
  const systemInstruction = buildChatSystemPrompt(rules, lang);
  const contents = [
    ...history.slice(-HISTORY_LIMIT).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const call = () =>
    ai.models.generateContent({
      model: env.GEMINI_CHAT_MODEL, // "gemini-3.5-flash-lite"
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
        maxOutputTokens: 800,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        responseMimeType: "application/json",
        responseSchema: CHAT_SCHEMA,
      },
    });

  try {
    const res = await withRetry(() => withTimeout(call(), env.GEMINI_TIMEOUT_MS, "chat"), { retries: 1 });
    const result = safeParseChat(res.text, lang, rules.length);
    logInfo({
      route: "chat", event: "gemini_ok", durationMs: Date.now() - started,
      grounded: result.grounded, totalTokens: res.usageMetadata?.totalTokenCount,
    });
    return result;
  } catch (err) {
    logError({ route: "chat", event: "gemini_fail", durationMs: Date.now() - started, err: describeError(err) });
    throw toGeminiError(err);
  }
}

function safeParseChat(text: string | undefined, lang: Lang, ruleCount: number): ChatResponse {
  let raw: any;
  try { raw = JSON.parse(text ?? ""); } catch { raw = null; }

  const grounded = raw?.grounded === true;
  const source = typeof raw?.source === "string" && raw.source.trim() ? raw.source.trim() : null;
  const answer = typeof raw?.answer === "string" ? raw.answer.trim() : "";

  // Server safety net (FR2.1): never surface a fabricated or empty answer.
  if (!grounded || !source || !answer || ruleCount === 0) {
    return { answer: chatFallback(lang), source: null, grounded: false };
  }
  return { answer, source, grounded: true };
}
```

### 4.4 Error handling (`lib/errors.ts` mapping) & retry

`@google/genai` surfaces HTTP failures with a status code (429 = resource exhausted / rate limit, 400, 5xx). We map **by status code** (defensive: we do not rely on an exact class name), and only retry once on 429.

```ts
// lib/retry.ts
import { RateLimitError } from "./errors";
export async function withRetry<T>(fn: () => Promise<T>, opts: { retries: number }): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= opts.retries; attempt++) {
    try { return await fn(); }
    catch (err) {
      lastErr = err;
      if (attempt < opts.retries && isRateLimit(err)) {
        await sleep(1500 * (attempt + 1)); // simple backoff before the single retry
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}
function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
export function isRateLimit(err: unknown): boolean {
  const status = (err as any)?.status ?? (err as any)?.code;
  const msg = String((err as any)?.message ?? "");
  return status === 429 || /429|rate.?limit|resource.?exhausted|quota/i.test(msg);
}
```

```ts
// lib/errors.ts (excerpt) — see §6 for the full class set
export function toGeminiError(err: unknown): AppError {
  if (err instanceof AppError) return err;              // TimeoutError already typed by withTimeout
  if (isRateLimit(err)) return new RateLimitError();
  return new GeminiError(String((err as any)?.message ?? "unknown Gemini error"));
}
export function describeError(err: unknown) {
  return { name: (err as any)?.name, status: (err as any)?.status, message: String((err as any)?.message ?? "") };
}
```

### 4.5 Timeout helper

```ts
// lib/timeout.ts
import { TimeoutError } from "./errors";
export async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(label)), ms);
  });
  try { return await Promise.race([p, timeout]); }
  finally { clearTimeout(timer!); }
}
```

### 4.6 Logging (structured, Vercel-friendly)

`console.log`/`console.error` emit single-line JSON (Vercel captures stdout/stderr as structured logs). Fields: `route`, `event`, `durationMs`, `imageBytes`, `promptTokens`/`outputTokens`/`totalTokens`, `status`/`grounded`, `err`. **Never** log image bytes, message content, or the API key (§8).

### 4.7 Environment validation (throws at startup)

`import { env } from "./env"` runs at module load; if `GEMINI_API_KEY` is missing the process throws immediately (cold-start failure with a clear message), so a misconfigured deploy fails loudly rather than at first user request. Full `env.ts` in §7.

---

## 5. Knowledge Base Library (`lib/knowledge.ts`)

```ts
// lib/knowledge.ts
import rulesJson from "@/data/rules.json";
import type { Rule, Lang } from "@/types";
import { KnowledgeBaseError } from "./errors";

let cache: Rule[] | null = null;

/** Reads and validates data/rules.json once, then serves from module cache. */
export function loadRules(): Rule[] {
  if (cache) return cache;
  const data: unknown = rulesJson;
  if (!Array.isArray(data)) throw new KnowledgeBaseError("rules.json must be an array");
  const rules = data.map((r, i) => validateRule(r, i));
  if (rules.length === 0) throw new KnowledgeBaseError("rules.json is empty");
  cache = rules;
  return cache;
}

function validateRule(r: any, i: number): Rule {
  const need = (k: string) => {
    if (typeof r?.[k] !== "string" || !r[k]) throw new KnowledgeBaseError(`rule[${i}] missing string "${k}"`);
    return r[k] as string;
  };
  if (!Array.isArray(r?.keywords)) throw new KnowledgeBaseError(`rule[${i}] missing keywords[]`);
  if (typeof r?.sacred_area !== "boolean") throw new KnowledgeBaseError(`rule[${i}] missing sacred_area`);
  return {
    id: need("id"),
    category_en: need("category_en"),
    category_id: need("category_id"),
    rule_en: need("rule_en"),
    rule_id: need("rule_id"),
    keywords: r.keywords.map((k: unknown) => String(k).toLowerCase()),
    source: need("source"),
    sacred_area: r.sacred_area,
  };
}

/** Formats all rules as a numbered list for system-prompt injection (context stuffing). */
export function formatRulesForPrompt(rules: Rule[], lang: Lang): string {
  return rules
    .map((r, i) => {
      const text = lang === "id" ? r.rule_id : r.rule_en;
      const why = lang === "id" ? r.why_id : r.why_en;
      const cat = lang === "id" ? r.category_id : r.category_en;
      // why_* is injected so the assistant can answer meaning questions
      // ("what is a canang?") instead of declining — ADR-0002.
      // why_source is deliberately omitted: display-only attribution.
      return `${i + 1}. [${cat}] ${text} Why it matters: ${why} (Source: ${r.source})`;
    })
    .join("\n");
}

/** MVP keyword matcher — unused by the stuffed MVP prompt, kept as the retrieval seam for future RAG (§3.4). */
// Question words and filler, EN + ID. None are domain terms.
const STOPWORDS = new Set(["what", "how", "the", "can", "boleh", "apa", "itu", "yang", /* ...see lib/knowledge.ts */]);

function keywordMatchesToken(keyword: string, token: string): boolean {
  if (keyword === token) return true;
  return keyword.split(/\W+/).some((w) => w === token || (token.length > 3 && w.startsWith(token)));
}

export function searchRules(rules: Rule[], query: string): Rule[] {
  const q = query.toLowerCase();
  const tokens = q.split(/\W+/).filter((t) => t.length > 2 && !STOPWORDS.has(t));
  return rules
    .map((r) => {
      const phraseHits = r.keywords.reduce((s, k) => s + (q.includes(k) ? 2 : 0), 0);
      // Two guards the v1.0 version lacked, each found by a failing test:
      //   1. token length > 3 for prefix matching, or "the" reaches "clothes";
      //   2. match against a keyword's individual WORDS, plus the stopword
      //      filter, or "what" inside a multi-word keyword grounds
      //      "what time is the football match?".
      const tokenHits = tokens.reduce((s, t) => s + (r.keywords.some((k) => keywordMatchesToken(k, t)) ? 1 : 0), 0);
      return { rule: r, score: phraseHits + tokenHits };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.rule);
}
```

> **MVP note:** the chat route stuffs **all** rules (PRD §12) via `formatRulesForPrompt(loadRules(), lang)`. `searchRules` is implemented and unit-tested now so the future switch to retrieval (§3.4) is a one-line change, not a rewrite.

---

## 6. Error Handling Strategy

### 6.1 Error classes (`lib/errors.ts`)

```ts
export type ErrorCode =
  | "invalid_json" | "invalid_input" | "unsupported_media" | "image_too_large"
  | "rate_limited" | "timeout" | "ai_error" | "kb_error" | "internal";

export abstract class AppError extends Error {
  abstract readonly code: ErrorCode;
  abstract readonly httpStatus: number;
}

export class ValidationError extends AppError {
  readonly code: ErrorCode;
  readonly httpStatus: number;
  constructor(code: ErrorCode, message: string, httpStatus = 400) {
    super(message); this.code = code; this.httpStatus = httpStatus;
  }
}
// convenience constructors
export const invalidJson   = () => new ValidationError("invalid_json", "Malformed JSON body", 400);
export const invalidInput  = (m: string) => new ValidationError("invalid_input", m, 400);
export const unsupported   = () => new ValidationError("unsupported_media", "Only JPEG or PNG is supported", 400);
export const tooLarge      = () => new ValidationError("image_too_large", "Image exceeds 5 MB", 413);

export class RateLimitError extends AppError { readonly code = "rate_limited"; readonly httpStatus = 429; }
export class TimeoutError   extends AppError { readonly code = "timeout"; readonly httpStatus = 504;
  constructor(label = "request") { super(`${label} timed out`); } }
export class GeminiError    extends AppError { readonly code = "ai_error"; readonly httpStatus = 502; }
export class KnowledgeBaseError extends AppError { readonly code = "kb_error"; readonly httpStatus = 500; }
```

### 6.2 Central handler for API routes (`lib/http.ts`)

Acts as the "global error boundary" for both routes: maps any thrown value to a safe status + localized message, logs with context, and never leaks internals.

```ts
// lib/http.ts
import { AppError, ValidationError, invalidJson } from "./errors";
import { ERROR_MESSAGES, ErrorCode } from "./messages";
import { logError } from "./logger";
import type { Lang } from "@/types";

export async function parseJsonBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    if (typeof body !== "object" || body === null) throw invalidJson();
    return body as Record<string, unknown>;
  } catch (e) {
    if (e instanceof ValidationError) throw e;
    throw invalidJson();
  }
}

export function handleApiError(
  err: unknown,
  ctx: { route: string; startedAt: number; lang?: Lang },
): Response {
  const lang: Lang = ctx.lang ?? "en";
  const isApp = err instanceof AppError;
  const code: ErrorCode = isApp ? err.code : "internal";
  const status = isApp ? err.httpStatus : 500;

  logError({
    route: ctx.route, event: "error", code, httpStatus: status,
    durationMs: Date.now() - ctx.startedAt,
    err: { name: (err as any)?.name, message: String((err as any)?.message ?? "") },
  });

  // Only the safe, localized message crosses the boundary — never err.message/stack.
  return Response.json({ error: ERROR_MESSAGES[code][lang], code }, { status });
}
```

### 6.3 User-facing error messages (EN + ID) — `lib/messages.ts`

```ts
export const ERROR_MESSAGES: Record<ErrorCode, { en: string; id: string }> = {
  invalid_json:      { en: "We couldn't read that request. Please try again.",
                       id: "Kami tidak dapat membaca permintaan itu. Silakan coba lagi." },
  invalid_input:     { en: "That input doesn't look right. Please check and try again.",
                       id: "Masukan tersebut tampak tidak sesuai. Mohon periksa dan coba lagi." },
  unsupported_media: { en: "Please use a JPG or PNG image.",
                       id: "Silakan gunakan gambar JPG atau PNG." },
  image_too_large:   { en: "The photo is larger than 5 MB. Please use a smaller image.",
                       id: "Foto lebih besar dari 5 MB. Silakan gunakan gambar yang lebih kecil." },
  rate_limited:      { en: "We're a little busy right now. Please try again in a moment.",
                       id: "Kami sedang sibuk saat ini. Silakan coba lagi sebentar." },
  timeout:           { en: "That took too long. Please try again.",
                       id: "Prosesnya terlalu lama. Silakan coba lagi." },
  ai_error:          { en: "Something went wrong. Please try again.",
                       id: "Terjadi masalah. Silakan coba lagi." },
  kb_error:          { en: "Something went wrong on our side. Please try again.",
                       id: "Terjadi masalah di sisi kami. Silakan coba lagi." },
  internal:          { en: "Something went wrong. Please try again.",
                       id: "Terjadi masalah. Silakan coba lagi." },
};
```

> The client shows its own per-feature copy (UI Spec §10 `check.error` / `assistant.error`) regardless of this body; these strings are the API's own safe, localized fallback and are what `curl` / other callers see.

### 6.4 Error-code → HTTP → cause matrix

| `code` | HTTP | Cause | Retryable by client? |
|---|---|---|---|
| `invalid_json` | 400 | Body not JSON | No (fix request) |
| `invalid_input` | 400 | Missing/typed-wrong field, message length | No |
| `unsupported_media` | 400 | Not JPEG/PNG | No |
| `image_too_large` | 413 | Decoded image > 5 MB | No (resize) |
| `rate_limited` | 429 | Gemini quota (after 1 retry) | Yes, later |
| `timeout` | 504 | > 9 s app timeout | Yes |
| `ai_error` | 502 | Gemini error / unparseable | Yes |
| `kb_error` | 500 | rules.json invalid | No (deploy fix) |
| `internal` | 500 | Unexpected | Yes |

### 6.5 Logging strategy

- `logError` writes one JSON line to `console.error` (Vercel → structured logs, searchable by `route`/`code`).
- Log **context, not content**: route, event, code, `durationMs`, sizes, token counts. Never message text, image bytes, or secrets.
- Success path uses `logInfo` (`console.log`) with token usage for quota monitoring (PRD §19 "monitor usage").

---

## 7. Environment & Configuration

### 7.1 `.env.example` (committed)

```dotenv
# --- Required ---
# Google Gemini API key from Google AI Studio (free tier, no credit card). Server-only.
GEMINI_API_KEY=

# --- Optional (sensible defaults in lib/env.ts) ---
# Vision model for /api/vision
GEMINI_VISION_MODEL=gemini-3.6-flash
# Text model for /api/chat
GEMINI_CHAT_MODEL=gemini-3.5-flash-lite
# App-level timeout for a single Gemini call, milliseconds (must be < platform function limit)
GEMINI_TIMEOUT_MS=9000
# Backoff before the single retry on a 429, milliseconds. Tests set this to 0.
GEMINI_RETRY_BACKOFF_MS=1500
```

### 7.2 `.env.local` (git-ignored, never committed)

```dotenv
GEMINI_API_KEY=AIza...your_real_key...
# Optionals only if overriding defaults:
# GEMINI_VISION_MODEL=gemini-3.6-flash
# GEMINI_CHAT_MODEL=gemini-3.5-flash-lite
# GEMINI_TIMEOUT_MS=9000
```

### 7.3 Variable reference

| Variable | Required | Default | Description | Client-exposed? |
|---|---|---|---|---|
| `GEMINI_API_KEY` | **Yes** | — | Gemini API key; read server-side only. Missing → throws at startup. | **No** (no `NEXT_PUBLIC_`) |
| `GEMINI_VISION_MODEL` | No | `gemini-3.6-flash` | Override vision model. | No |
| `GEMINI_CHAT_MODEL` | No | `gemini-3.5-flash-lite` | Override chat model. | No |
| `GEMINI_TIMEOUT_MS` | No | `9000` | Per-call app timeout (ms). Keep < function limit. | No |
| `GEMINI_RETRY_BACKOFF_MS` | No | `1500` | Backoff before the single 429 retry (ms). Set to `0` in tests. | No |

### 7.4 `lib/env.ts`

```ts
// lib/env.ts — evaluated at import time; throws on misconfiguration (fail fast).
function required(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`[env] Missing required environment variable: ${name}`);
  return v;
}
function optNumber(name: string, fallback: number): number {
  const v = process.env[name];
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
export const env = {
  GEMINI_API_KEY: required("GEMINI_API_KEY"),
  GEMINI_VISION_MODEL: process.env.GEMINI_VISION_MODEL?.trim() || "gemini-3.6-flash",
  GEMINI_CHAT_MODEL: process.env.GEMINI_CHAT_MODEL?.trim() || "gemini-3.5-flash-lite",
  GEMINI_TIMEOUT_MS: optNumber("GEMINI_TIMEOUT_MS", 9000),
} as const;
```

### 7.5 Vercel setup

1. **Import** the GitHub repo at vercel.com (Next.js auto-detected).
2. **Settings → Environment Variables** → add `GEMINI_API_KEY` (value = your key) for **Production** and **Preview**. Optionally add the model/timeout overrides.
3. This is the production equivalent of `.env.local`; Vercel injects it into the serverless function environment (server-side only). Never add `GEMINI_API_KEY` as a build-time public var.
4. **Redeploy** after adding the var (env changes require a new deployment).
5. **Function limits:** keep `GEMINI_TIMEOUT_MS` (9 s) under your plan's function `maxDuration`; the app timeout returns a friendly `504` before the platform force-kills the function.

---

## 8. Security Checklist

### 8.1 API-key exposure prevention
- [x] Key read only in server modules (`lib/env.ts` → `lib/gemini.ts` → routes); imported by nothing client-side.
- [x] Never prefixed `NEXT_PUBLIC_` (Next.js only inlines that prefix into the client bundle).
- [x] `.env.local` git-ignored; only `.env.example` (no value) committed.
- [x] Key never logged, never returned in any response body or error.

### 8.2 Input sanitization (strip HTML from chat)
```ts
// lib/validation.ts
export function sanitizeText(input: string, max = 1000): string {
  return input
    .replace(/<[^>]*>/g, " ")            // strip HTML/XML tags
    .replace(/[\u0000-\u001F\u007F]/g, " ") // strip control chars
    .replace(/\s+/g, " ")                 // collapse whitespace
    .trim()
    .slice(0, max);
}
```
Applied to `message` and every `history[].content` before prompt assembly (reduces injection surface; the system prompt's "answer ONLY from RULES" further bounds it).

### 8.3 Request size limiting
- [x] Image decoded byte length hard-capped at **5 MB** (413) before any Gemini call (FR1.1).
- [x] `message` capped at **1000 chars**; `history` capped at **6 items**, each 1000 chars.
- [x] Malformed/oversized inputs rejected **before** spending Gemini quota.

### 8.4 Rate limiting (free-tier constraints, PRD §8/§19)
- [x] One-shot retry on 429 with backoff (§4.4); further 429s return a friendly `429` message.
- [x] In-memory answer cache (§9.2) reduces duplicate first-turn calls.
- [x] Client disables inputs while a request is in flight (UI Spec §7) to prevent double-submits.
- [ ] Per-IP rate limiting is **out of MVP scope** (documented, fast-follow if abuse appears). Gemini's own quotas are the backstop.

### 8.5 CORS (why not needed)
- Client and BFF are **same-origin** (one Vercel deployment), so browser requests need no CORS headers.
- We deliberately **do not** send `Access-Control-Allow-Origin: *`; leaving routes same-origin-only stops other sites from calling them and spending our quota. No CORS config is added.

### 8.6 No persistent storage of user images (confirmed in code)
- [x] The route decodes the base64 to an in-memory `Buffer`/string, passes it to Gemini, and returns. **No `fs.writeFile`, no DB, no blob store, no cache of image bytes** anywhere in the codebase.
- [x] Vision answers are **not** cached (only text chat first-turns are, and those store no image).
- [x] The image variable goes out of scope when the handler returns and is garbage-collected.
- [x] UI shows the privacy notice + free-tier data-use disclosure (UI Spec §10 `check.privacy`, PRD §7/§19).

---

## 9. Performance Optimization

### 9.1 Response-time budget (target < 8 s, PRD §3/§7)

| Segment | F1 vision | F2 chat | Lever |
|---|---|---|---|
| Client resize + base64 (not backend) | ~0.3 s | — | Downscale to ≤1024px client-side (Tech Spec §8.2) |
| Network client → BFF | ~0.15 s | ~0.1 s | Same-origin |
| BFF validate + decode/sanitize | ~0.02 s | ~0.005 s | Pure CPU |
| **Gemini inference** | **~3–6 s** | **~1–3 s** | Flash / Flash-Lite, `thinkingLevel: MINIMAL`, small `maxOutputTokens`, JSON mode (no re-prompt) |
| Parse + shape | ~0.01 s | ~0.01 s | Trivial JSON |
| Network back | ~0.15 s | ~0.1 s | — |
| **Total** | **< 8 s** | **< 4 s** | App timeout 9 s returns friendly error if exceeded |

### 9.2 Chat answer cache (in-memory, TTL)

Cache only **first-turn** (empty-history) questions, keyed by `lang + normalized message`, so shared FAQs ("Can I wear shorts?") skip Gemini entirely. Vision is never cached (unique images + privacy).

```ts
// lib/cache.ts
import type { ChatResponse } from "@/types";

class TTLCache<V> {
  private store = new Map<string, { v: V; exp: number }>();
  constructor(private ttlMs: number, private max: number) {}
  get(key: string): V | undefined {
    const e = this.store.get(key);
    if (!e) return undefined;
    if (Date.now() > e.exp) { this.store.delete(key); return undefined; }
    return e.v;
  }
  set(key: string, v: V): void {
    if (this.store.size >= this.max) this.store.delete(this.store.keys().next().value as string); // evict oldest
    this.store.set(key, { v, exp: Date.now() + this.ttlMs });
  }
}
export const chatCache = new TTLCache<ChatResponse>(60 * 60 * 1000, 200); // 1h TTL, 200 entries
export function chatCacheKey(message: string, lang: string): string {
  return `${lang}::${message.toLowerCase().replace(/\s+/g, " ").trim()}`;
}
```

> Serverless caveat: the cache lives in one warm function instance and is not shared across instances or cold starts. That is acceptable for MVP (a best-effort hit-rate booster); a shared cache (e.g. Vercel KV) is a post-MVP option.

### 9.3 Image compression before Gemini
Primary reduction happens **client-side** (canvas downscale to ≤1024px long edge, JPEG q≈0.8 — Tech Spec §8.2), which shrinks the base64 payload, network time, and Gemini inline-data tokens. The server still enforces the 5 MB cap as the authoritative guard.

### 9.4 Knowledge-base caching
`loadRules()` validates once and serves the typed array from a module variable for the life of the warm instance (§3.3/§5). Static import means zero filesystem I/O per request.

---

## 10. Testing Plan (Backend-Specific)

**Tooling:** Vitest (+ `@vitejs/plugin-react` for any tsx), Gemini mocked via `vi.mock("@google/genai")` so tests are deterministic, offline, and quota-free.

### 10.1 Unit tests — `lib/knowledge.ts`

```ts
// __tests__/knowledge.test.ts
import { describe, it, expect } from "vitest";
import { loadRules, formatRulesForPrompt, searchRules } from "@/lib/knowledge";

describe("knowledge", () => {
  it("loads and validates all seed rules", () => {
    const rules = loadRules();
    expect(rules.length).toBeGreaterThanOrEqual(10);
    for (const r of rules) {
      expect(r.id && r.rule_en && r.rule_id && r.source).toBeTruthy();
      expect(Array.isArray(r.keywords)).toBe(true);
      expect(typeof r.sacred_area).toBe("boolean");
    }
  });
  it("formats EN and ID differently and numbers them", () => {
    const rules = loadRules();
    expect(formatRulesForPrompt(rules, "en")).toMatch(/^1\. \[Dress Code\]/);
    expect(formatRulesForPrompt(rules, "id")).toContain("Tata Busana");
  });
  it("searchRules matches keywords and returns [] for off-topic", () => {
    const rules = loadRules();
    expect(searchRules(rules, "can I wear shorts at a temple?")[0].id).toBe("temple-attire");
    expect(searchRules(rules, "what time is the football match")).toEqual([]);
  });
});
```

Also unit-test `lib/validation.ts` (`sanitizeText` strips `<script>`; `decodeAndValidateImage` accepts a tiny JPEG/PNG, rejects a GIF → `unsupported_media`, rejects a 6 MB buffer → `image_too_large`) and `lib/cache.ts` (TTL expiry + eviction).

### 10.2 Integration tests — API routes (mocked Gemini)

```ts
// __tests__/api-chat.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const generateContent = vi.fn();
vi.mock("@google/genai", () => ({
  GoogleGenAI: class { models = { generateContent }; },
  Type: { OBJECT: "OBJECT", STRING: "STRING", BOOLEAN: "BOOLEAN" },
}));

import { POST } from "@/app/api/chat/route";

function post(body: unknown) {
  return new Request("http://localhost/api/chat", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
}

describe("POST /api/chat", () => {
  beforeEach(() => generateContent.mockReset());

  it("returns grounded answer for a KB-covered question", async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({ answer: "Wear a kamen and sash.", source: "Bali Governor Circular No. 7 of 2025", grounded: true }),
      usageMetadata: { totalTokenCount: 120 },
    });
    const res = await POST(post({ message: "Can I wear shorts at a temple?", lang: "en", history: [] }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.grounded).toBe(true);
    expect(json.source).toMatch(/Circular No\. 7/);
  });

  it("forces grounded=false + fallback when the model can't cite a rule", async () => {
    generateContent.mockResolvedValue({ text: JSON.stringify({ answer: "made up thing", source: "", grounded: false }) });
    const res = await POST(post({ message: "What time is the football match?", lang: "en", history: [] }));
    const json = await res.json();
    expect(json.grounded).toBe(false);
    expect(json.source).toBeNull();
    expect(json.answer).toBe("I don't have official information on that in the Bali code of conduct.");
  });

  it("rejects an empty message with 400", async () => {
    const res = await POST(post({ message: "   ", lang: "en", history: [] }));
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("invalid_input");
  });

  it("maps a 429 to a friendly rate_limited error", async () => {
    generateContent.mockRejectedValue(Object.assign(new Error("Resource exhausted"), { status: 429 }));
    const res = await POST(post({ message: "Can I wear shorts?", lang: "id", history: [] }));
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.code).toBe("rate_limited");
    expect(json.error).toMatch(/sibuk/); // ID message
  });
});
```

Vision integration tests mirror this: valid `{image, context}` with a mocked JSON result → 200 with an enum `status`; oversized base64 → 413 `image_too_large`; a GIF → 400 `unsupported_media`; mocked reject → 502 `ai_error`; mocked timeout (never-resolving promise + fake timers) → 504 `timeout`.

### 10.3 Test-case matrices

**Vision — 10 images (manual + fixture-driven), expected `status`:**

| # | Image | Context | Expected `status` |
|---|---|---|---|
| 1 | Person in kamen + sash at temple | temple | `compliant` |
| 2 | Tourist in tank top at temple gate | temple | `not_compliant` |
| 3 | Shorts, shoulders covered, temple | temple | `needs_attention` |
| 4 | Person climbing a pelinggih | temple | `not_compliant` |
| 5 | Foot near a canang on the ground | temple | `needs_attention` |
| 6 | Modest casual outfit, street (non-temple) | general | `compliant` |
| 7 | Very dark / underexposed photo | temple | `unclear` |
| 8 | Blurry motion shot | temple | `unclear` |
| 9 | Landscape, no people | general | `unclear` |
| 10 | Person barefoot, sarong, praying | temple | `compliant` |

**Chat — 10 questions expected `grounded=true` (each should cite a rule):**

| # | Question (EN) | Expected source rule |
|---|---|---|
| 1 | Can I wear shorts at a temple? | `temple-attire` |
| 2 | Do I need a sarong to enter a pura? | `temple-attire` |
| 3 | Is it okay to climb a shrine for a photo? | `climbing-sacred` |
| 4 | Can I fly a drone at Tanah Lot? | `drone-restriction` |
| 5 | Can I step over a canang? | `offerings-canang` |
| 6 | Can I go into the inner temple area? | `sacred-area-entry` |
| 7 | Can women on their period enter a temple? | `menstruation-entry` |
| 8 | Should I take my shoes off? | `shoe-removal` |
| 9 | Can I touch the statues? | `touching-sacred-objects` |
| 10 | Is it okay to take photos while people pray? | `photography` |

**Chat — 5 out-of-scope questions expected `grounded=false`:**

| # | Question | Expected |
|---|---|---|
| 1 | What time does the football match start? | `grounded:false`, fallback |
| 2 | What's the best nightclub in Kuta? | `grounded:false`, fallback |
| 3 | How much is a flight to Jakarta? | `grounded:false`, fallback |
| 4 | Can you write my travel itinerary? | `grounded:false`, fallback |
| 5 | What is the capital of France? | `grounded:false`, fallback |

### 10.4 Rate-limit / error-simulation tests
- 429 on first call, success on retry → resolves 200 (verifies `withRetry`).
- 429 twice → 429 `rate_limited`.
- Never-resolving Gemini promise + fake timers advanced past 9 s → 504 `timeout` (verifies `withTimeout`).
- Non-JSON `res.text` → vision returns safe `unclear`; chat returns fallback (verifies `safeParse*`).
- Missing `GEMINI_API_KEY` at import → `env.ts` throws (verifies fail-fast).

### 10.5 Manual acceptance (ties to PRD §15)
Run the 10 vision + 10 grounded + 5 ungrounded cases against the **live** deployment; F2 must score **≥ 8/10 grounded-correct** (PRD §3 metric) and **0 fabrications** on the out-of-scope set (FR2.1). Confirm each response returns in **< 8 s** (PRD §3).

---

## Appendix — File Map & Shared Types

### Backend file map (all under the project root)

```
app/api/vision/route.ts     POST /api/vision handler (§2.1)
app/api/chat/route.ts       POST /api/chat handler (§2.2)
lib/gemini.ts               GoogleGenAI client + analyzeImage() + askQuestion() (§4)
lib/knowledge.ts            loadRules() + formatRulesForPrompt() + searchRules() (§5)
lib/prompts.ts              VISION_SYSTEM_PROMPT, buildChatSystemPrompt(), chatFallback() (§2, §4)
lib/validation.ts           validateVisionRequest/validateChatRequest, decodeAndValidateImage, sanitizeText (§2, §8)
lib/errors.ts               AppError hierarchy + toGeminiError() (§6.1)
lib/messages.ts             ERROR_MESSAGES EN/ID (§6.3)
lib/http.ts                 parseJsonBody() + handleApiError() (§6.2)
lib/timeout.ts              withTimeout() (§4.5)
lib/retry.ts                withRetry() + isRateLimit() (§4.4)
lib/cache.ts                TTLCache + chatCache (§9.2)
lib/logger.ts               logInfo/logError structured logging (§4.6)
lib/env.ts                  validated env (§7.4)
data/rules.json             knowledge base (§3.2)
lib/types.ts                shared types (below)
```

### `lib/prompts.ts` (the remaining exact strings)

```ts
import { formatRulesForPrompt } from "./knowledge";
import type { Lang, Rule } from "@/types";

export const VISION_SYSTEM_PROMPT = `You are SASANA, a friendly Balinese custom-and-etiquette assistant for tourists.
Analyze the provided photo for compliance with Balinese custom and the sanctity of sacred sites (pura). Focus on:
- Attire appropriateness in sacred areas (a kamen/sarong and sash; shoulders and knees covered).
- Presence of sacred elements (pelinggih/shrines, canang/offerings, temple gates and walls).
- Risky or disrespectful behavior (climbing shrines or sacred trees, stepping on offerings, sitting or standing on sacred structures).

Rules for your answer:
1. Choose a compliance status of exactly one of: "compliant", "needs_attention", "not_compliant", "unclear".
2. ALWAYS include a short, plain-language "reason" and a polite, actionable "suggestion". Never reply with only "wrong".
3. Be warm, respectful, and educational. Assume good intent: tourists usually act out of unfamiliarity, not disrespect. Never shame the user.
4. If the photo is too dark, blurry, empty of people, or clearly unrelated to a person or temple setting, set status to "unclear" and ask for a clearer, well-lit photo instead of guessing.
5. When you reference a rule, prefer "Bali Governor Circular No. 7 of 2025"; otherwise use "Balinese Hindu custom (adat)". If no reference applies, use an empty string.
6. Keep "reason" and "suggestion" under about 240 characters each.

Return ONLY a JSON object with keys: status, reason, suggestion, reference. Do not add any text outside the JSON.`;

const LANG_NAME: Record<Lang, string> = { en: "English", id: "Indonesian (Bahasa Indonesia)" };

export function buildChatSystemPrompt(rules: Rule[], lang: Lang): string {
  return `You are SASANA, a knowledgeable and friendly guide to Balinese customs and the official code of conduct for visitors in Bali.

Follow these instructions strictly:
1. Answer the user's question ONLY using the RULES listed below. Do NOT invent, assume, or add any rule that is not in the list.
2. If the RULES do not cover the question, you MUST set "grounded" to false and reply that no official information is available. Do not guess and do not fabricate a rule.
3. When your answer is based on one or more rules, set "grounded" to true and set "source" to the source text of the most relevant rule.
4. Reply in the user's language: ${LANG_NAME[lang]}. Keep the tone warm, respectful, concise, and never judgmental.
5. Do not give legal advice or describe penalties beyond what the rules state.

Return ONLY a JSON object with keys: answer (string), source (string or null), grounded (boolean).

RULES:
${formatRulesForPrompt(rules, lang)}`;
}

// Delegates to lib/i18n so the server fallback and the UI copy stay identical.
export function chatFallback(lang: Lang): string {
  return t(lang, "assistant.ungrounded");
}

/* v1.0 kept these literals here; they now live in lib/i18n as assistant.ungrounded,
   with exactly this text:
     en: "I don't have official information on that in the Bali code of conduct."
     id: "Saya tidak punya informasi resmi soal itu dalam tata krama Bali."
*/
```

### Shared types (`lib/types.ts`, backend-relevant)

```ts
export type Lang = "en" | "id";
export type VisionStatus = "compliant" | "needs_attention" | "not_compliant" | "unclear";

export interface VisionResult { status: VisionStatus; reason: string; suggestion: string; reference: string; }
export interface VisionRequest { image: string; context: "temple" | "general"; }

export interface ChatMessage { role: "user" | "assistant"; content: string; source?: string | null; grounded?: boolean; }
export interface ChatRequest { message: string; lang: Lang; history: ChatMessage[]; }
export interface ChatResponse { answer: string; source: string | null; grounded: boolean; }

export interface Rule {
  id: string; category_en: string; category_id: string;
  rule_id: string; rule_en: string;
  why_en: string; why_id: string; why_source: string;   // ADR-0002
  keywords: string[]; source: string; sacred_area: boolean;
}
export interface ApiErrorBody { error: string; code: string; }
```

---

*Derived from and cross-referenced against [PRD v1.0](./prd.md), the [Technical Specification](./tech-spec.md), and the [UI/UX Specification](./ui-spec.md). Function names, file paths, types, and copy strings are consistent across all four documents so the backend can be built directly from this file. The one deliberate divergence from the PRD, the Gemini SDK package (`@google/genai`), is flagged at the top and should be reflected back into the PRD.*
