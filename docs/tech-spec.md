# Technical Specification — SASANA

**AI Etiquette & Balinese Custom Guide for Tourists**

| | |
|---|---|
| **Document** | Technical Specification (Engineering) |
| **Companion to** | [Product Requirements Document](./prd.md) (`docs/prd.md`) |
| **Version** | 1.0 (MVP) — derived from PRD v1.0 |
| **Target stack** | Next.js 14+ (App Router) · TypeScript · Tailwind CSS · Google Gemini API · Vercel |
| **Audience** | Implementing engineers (Daniyal — AI/backend, Manu — frontend, Rafli — KB/testing) |

> [!WARNING]
> **Revision 2026-08-12.** Model names here were corrected during implementation: `gemini-2.5-flash-lite` is retired (404 for new API keys) and Gemini 3.x rejects `thinkingBudget: 0`. Current defaults are `gemini-3.6-flash` (vision) and `gemini-3.5-flash-lite` (text), with `thinkingLevel: MINIMAL`. See the Revision 1.1 table in [backend-spec.md](./backend-spec.md), which is authoritative for backend detail.

> **Scope.** This document translates the PRD into a concrete, implementable engineering plan. Every section maps back to a PRD section (cited as "PRD §N"). Where this spec makes a decision the PRD left open, it is called out explicitly.

> [!IMPORTANT]
> **SDK correction (supersedes PRD §8 and §14).** The PRD lists `@google/generative-ai` as the Gemini client. That package is Google's **legacy/deprecated** JS SDK (`GoogleGenerativeAI`, `getGenerativeModel`). The current, supported package is **`@google/genai`** (`GoogleGenAI` class, `ai.models.generateContent`). This spec uses `@google/genai` everywhere. See [§3.3](#33-google-gemini-api) and [§10](#10-development-setup) for the corrected install and usage.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Scaffold](#2-project-scaffold)
3. [Technology Choices & Rationale](#3-technology-choices--rationale)
4. [Component Tree](#4-component-tree)
5. [Data Flow Diagrams](#5-data-flow-diagrams)
6. [Route Design](#6-route-design)
7. [State Management Strategy](#7-state-management-strategy)
8. [Performance Budget](#8-performance-budget)
9. [Security & Privacy](#9-security--privacy)
10. [Development Setup](#10-development-setup)
11. [Testing Strategy](#11-testing-strategy)
12. [Appendix A — Shared TypeScript Types](#appendix-a--shared-typescript-types)

---

## 1. Architecture Overview

SASANA is a **three-tier application** running entirely on Vercel's serverless platform. There is no database and no persistent user state — the only durable data is a static JSON knowledge base bundled with the app. The tiers are: (1) the browser-rendered React UI, (2) a thin **Backend-for-Frontend (BFF)** layer of Next.js API Route Handlers, and (3) the external Google Gemini API plus the local knowledge base.

### 1.1 High-level diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│  TIER 1 — CLIENT (browser, mobile-first)                                   │
│                                                                            │
│   Next.js React UI  ·  Tailwind CSS  ·  Client Components                  │
│   ┌────────────┐  ┌───────────────┐  ┌────────────────┐  ┌────────────┐    │
│   │ Landing /  │  │ Situation     │  │ Custom         │  │ About      │    │
│   │            │  │ Check /check  │  │ Assistant      │  │ /about     │    │
│   │            │  │ (photo)       │  │ /assistant     │  │            │    │
│   └────────────┘  └───────┬───────┘  └───────┬────────┘  └────────────┘    │
│                           │                  │                             │
└───────────────────────────┼──────────────────┼─────────────────────────────┘
                            │  fetch()          │  fetch()
                            │  (same-origin,    │  (same-origin,
                            │   base64 JSON)    │   JSON)
                            ▼                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  TIER 2 — BFF (Next.js API Route Handlers, Node.js serverless functions)   │
│           *** runs on the server — GEMINI_API_KEY lives here only ***       │
│                                                                            │
│   ┌───────────────────────────┐        ┌───────────────────────────┐       │
│   │ POST /api/vision          │        │ POST /api/chat            │       │
│   │  route.ts                 │        │  route.ts                 │       │
│   │  · validate image         │        │  · retrieve rules (KB)    │       │
│   │  · build vision prompt    │        │  · build grounded prompt  │       │
│   │  · call Gemini            │        │  · call Gemini            │       │
│   │  · parse & return JSON    │        │  · return answer+source   │       │
│   └─────────────┬─────────────┘        └───────┬──────────┬────────┘       │
│                 │                             │          │                 │
│      lib/gemini.ts (shared client wrapper)    │   lib/knowledge.ts         │
└─────────────────┼─────────────────────────────┼──────────┼─────────────────┘
                  │ HTTPS + x-goog-api-key       │          │ import (bundled)
                  ▼                             ▼          ▼
┌──────────────────────────────────┐   ┌────────────────────────────────────┐
│  TIER 3a — Google Gemini API      │   │  TIER 3b — Knowledge Base           │
│  gemini-3.6-flash / 3.5-flash-lite│   │  data/rules.json (static, in-repo)  │
│  Vision + Text, JSON mode         │   │  official Balinese custom rules     │
└──────────────────────────────────┘   └────────────────────────────────────┘
```

This diagram elaborates the PRD's architecture sketch (PRD §9) with the concrete file names, transport formats, and the trust boundary (the dashed BFF box) that the PRD only describes in prose.

### 1.2 The client → server → AI flow

1. **Client** — A Client Component (`/check` or `/assistant`) collects user input (a photo or a text question), sets local UI state to `loading`, and issues a **same-origin** `fetch()` to a Next.js API route (`/api/vision` or `/api/chat`). The client never holds an API key and never contacts Google.
2. **Server (BFF)** — The Route Handler runs as a Node.js serverless function on Vercel. It reads `process.env.GEMINI_API_KEY`, validates and normalizes the input, assembles the system prompt (for chat, it injects the retrieved rules — PRD §13), calls Gemini via the shared `lib/gemini.ts` wrapper, parses the model's response into the contract shape (PRD §11), and returns clean JSON.
3. **AI / Data** — Gemini performs the vision or text inference. For chat, the knowledge base (`data/rules.json`) is read on the server and used to ground the prompt (PRD §12). No user photo or message is written to disk or a database at any tier.

### 1.3 Why Next.js API Routes (BFF pattern) to shield the Gemini key

The single most important architectural constraint is **NFR-Security: "API keys live only on the server as environment variables"** (PRD §7). A browser is a fundamentally untrusted environment — anything the JavaScript bundle can read, a user (or a scraper) can read via DevTools, the network tab, or by inspecting `_next/static/*.js`. Therefore:

- **The key can never reach the client.** If the browser called `generativelanguage.googleapis.com` directly, the request would have to carry `GEMINI_API_KEY` in a header the user can read. Anyone could then extract it and burn the free-tier quota (PRD §8, §19 "Free API quota limit") or rack up charges on a paid key.
- **The BFF is the trust boundary.** By placing a thin server layer (`/api/vision`, `/api/chat`) between the UI and Gemini, the key is read from `process.env` inside a serverless function that never ships to the browser. In Next.js, any file under `app/api/**/route.ts` (and anything it imports, e.g. `lib/gemini.ts`) is **server-only** and excluded from the client bundle. Environment variables **without** the `NEXT_PUBLIC_` prefix are likewise never exposed to the client — a compile-time guarantee, not a convention.
- **The BFF is also the place to add cross-cutting concerns** the client should not own: input validation and size limits (FR1.1), prompt construction and grounding (PRD §13), response shaping into the API contract (PRD §11), rate-limit handling, and (post-MVP) answer caching (PRD §19).

An alternative — a *separate* backend service (Express, a Python FastAPI service, a standalone Cloud Function) — would also hide the key, but it would add a second deployment, a second runtime, and **CORS complexity** (the browser and the API would be on different origins). Next.js API Routes give us the same key-shielding guarantee with **zero extra infrastructure** and **same-origin** requests (no CORS preflight, no cross-origin cookies) — the browser and the BFF share the Vercel deployment's origin. This is exactly the BFF ("Backend for Frontend") pattern: a backend whose only client is our own frontend, co-located and co-deployed with it.

---

## 2. Project Scaffold

This is the exact tree after running `create-next-app` (App Router, TypeScript, Tailwind, ESLint, no `src/` dir) and adding the SASANA-specific files. It is a superset of PRD §10 with the standard `create-next-app` output made explicit.

```
sasana/
├── app/                              # App Router root — routes, layouts, API handlers
│   ├── layout.tsx                    # Root layout: <html>/<body>, fonts, <LanguageProvider>, global chrome
│   ├── page.tsx                      # "/"  Landing page (Server Component)
│   ├── globals.css                   # Tailwind directives (@tailwind base/components/utilities) + CSS vars
│   ├── favicon.ico                   # Default favicon (replace with SASANA icon)
│   ├── check/
│   │   └── page.tsx                  # "/check" Situation Check (Client Component — camera/upload)
│   ├── assistant/
│   │   └── page.tsx                  # "/assistant" Custom Assistant chat (Client Component)
│   ├── about/
│   │   └── page.tsx                  # "/about" Mission + Circular No.7/2025 reference (Server Component)
│   └── api/
│       ├── vision/
│       │   └── route.ts              # POST /api/vision — F1 (image -> structured analysis)
│       └── chat/
│           └── route.ts              # POST /api/chat  — F2 (question -> grounded answer)
│
├── components/                       # Reusable React components (see §4)
│   ├── ui/                           # Design-system primitives
│   │   ├── Button.tsx                # Variant/size button (client-safe)
│   │   ├── Card.tsx                  # Generic surface container
│   │   ├── LoadingSpinner.tsx        # Inline spinner / skeleton
│   │   └── ErrorFallback.tsx         # Friendly error + retry (NFR reliability, PRD §7)
│   ├── layout/
│   │   ├── LanguageSwitcher.tsx      # ID/EN toggle (reads/writes LanguageContext)
│   │   └── LanguageProvider.tsx      # 'use client' Context provider for lang state
│   ├── landing/
│   │   ├── SituationCheckButton.tsx  # Large CTA -> /check
│   │   └── AssistantButton.tsx       # Large CTA -> /assistant
│   ├── check/
│   │   ├── CameraUploader.tsx        # File input + <input capture> + client-side resize/validate
│   │   ├── ContextSelector.tsx       # "At a temple" / "General" toggle (FR1 flow step 3)
│   │   └── ResultCard.tsx            # Status-variant result (compliant/needs_attention/not_compliant/unclear)
│   └── assistant/
│       ├── ChatBubble.tsx            # user | assistant message bubble
│       ├── QuickChips.tsx            # Example-question chips (FR2.5)
│       └── SourceReference.tsx       # Renders the cited rule source (FR2.2)
│
├── lib/                              # Server-side logic & shared helpers (no React)
│   ├── gemini.ts                     # @google/genai client wrapper + vision/chat call helpers
│   ├── knowledge.ts                  # Load rules.json + keyword retrieval + prompt formatting
│   ├── prompts.ts                    # System-prompt templates for F1 and F2 (PRD §13)
│   ├── validation.ts                 # Image size/MIME checks, message length/sanitization
│   └── i18n.ts                       # UI string dictionaries (id/en) + t() helper
│
├── data/
│   └── rules.json                    # Knowledge base — array of rule objects (PRD §12)
│
├── types/
│   └── index.ts                      # Shared TS types: VisionResult, ChatResponse, Rule, Lang (see Appendix A)
│
├── public/                           # Static assets served at the site root
│   ├── logo.svg                      # SASANA wordmark/logo
│   ├── icons/                        # UI/status icons (svg)
│   ├── og-image.png                  # Social/share preview image
│   └── sample/                       # (dev only) test photos for F1 manual testing
│
├── __tests__/                        # Vitest tests (unit, component, route) — see §11
│   ├── knowledge.test.ts
│   ├── validation.test.ts
│   ├── ResultCard.test.tsx
│   └── api-vision.test.ts
│
├── .env.local                        # GEMINI_API_KEY=...  (git-ignored, never committed)
├── .env.example                      # Documents required env vars (committed, no secrets)
├── .gitignore                        # Includes .env*.local, node_modules, .next
├── next.config.mjs                   # Next.js config (image config, route body-size if needed)
├── tailwind.config.ts                # Tailwind theme (colors, breakpoints, status palette)
├── postcss.config.mjs                # PostCSS (tailwindcss + autoprefixer)
├── tsconfig.json                     # TypeScript config (paths alias @/* -> project root)
├── vitest.config.ts                  # Vitest + jsdom + React Testing Library setup
├── package.json                      # Scripts & dependencies
├── package-lock.json                 # Locked dependency tree
└── README.md                         # Setup, run, deploy, architecture summary
```

### 2.1 Purpose of each directory

| Path | Purpose |
|---|---|
| **`app/`** | The App Router root. File-system routing: each `page.tsx` is a route (PRD §10, §6 supporting pages), `layout.tsx` is the shared shell, and `api/**/route.ts` are the BFF endpoints (§1.3). Everything here is a Server Component unless it starts with `'use client'`. |
| **`app/api/`** | Server-only Route Handlers — the BFF. Never bundled to the client; the only place `GEMINI_API_KEY` is read. |
| **`components/`** | All reusable React UI, grouped by feature (`landing/`, `check/`, `assistant/`) plus cross-cutting `ui/` primitives and `layout/`. Keeps `page.tsx` files thin and composition-focused. |
| **`lib/`** | Non-React logic that runs on the server (Gemini calls, KB retrieval, prompt building, validation) plus the i18n helper. Importing any of `gemini.ts`/`knowledge.ts` from a Client Component is forbidden — it would try to pull the SDK/secret into the browser. |
| **`data/`** | The static knowledge base. A plain JSON file (PRD §12) — no DB for MVP; migrate to embeddings post-MVP (PRD §18.7). |
| **`types/`** | Single source of truth for shapes shared between client, BFF, and tests (the API contracts of PRD §11). |
| **`public/`** | Static assets served verbatim at `/` (logo, icons, OG image). `public/sample/` holds test photos used only during manual F1 testing (PRD §15). |
| **`__tests__/`** | Vitest suites (§11). Co-locating in one folder keeps test config simple for a small team. |

### 2.2 Purpose of each notable file

**Under `app/`:**

- `layout.tsx` — Root layout rendered on every route. Declares `<html lang>`, `<body>`, loads the font, mounts `<LanguageProvider>` so the ID/EN choice is available app-wide (PRD §6 language switcher), and renders shared chrome (header with `LanguageSwitcher`, footer with the privacy notice required by PRD §7). Sets `metadata` (title, description, OG). Server Component.
- `page.tsx` (`/`) — Landing page: short intro + the two large CTAs and the language switcher (PRD §6 "Supporting Features"). Pure presentation → **Server Component**.
- `globals.css` — The three `@tailwind` directives plus CSS custom properties for the status palette (`--status-compliant` green, `--status-attention` yellow, `--status-danger` red — PRD §6/F1).
- `check/page.tsx` — Situation Check screen. Orchestrates `CameraUploader` → `ContextSelector` → submit → `ResultCard`. Owns the F1 request state machine. **Client Component** (needs file input, camera, `useState`).
- `assistant/page.tsx` — Chat screen. Owns message history and the F2 request lifecycle; renders `ChatBubble`s, `QuickChips`, input box. **Client Component**.
- `about/page.tsx` — Static mission + explicit reference to Governor Circular No. 7/2025 for credibility (PRD §6, §2). **Server Component**.
- `api/vision/route.ts` — Exports `async function POST(req)`. Parses `{ image, context }` (PRD §11), validates (FR1.1), calls `lib/gemini.ts#analyzeImage`, returns `VisionResult` JSON.
- `api/chat/route.ts` — Exports `async function POST(req)`. Parses `{ message, lang, history }`, calls `lib/knowledge.ts#retrieveRules`, builds grounded prompt, calls `lib/gemini.ts#answerQuestion`, returns `ChatResponse` JSON.

**Under `lib/`:**

- `gemini.ts` — Instantiates the `@google/genai` client once (module scope) and exposes two typed helpers: `analyzeImage(base64, mimeType, context)` and `answerQuestion(message, lang, rules, history)`. Encapsulates model IDs, JSON-mode config, and response parsing so routes stay thin.
- `knowledge.ts` — Imports `data/rules.json`, exposes `getAllRules()` and `retrieveRules(query, lang)` (keyword match over the `keywords` field — PRD §12), and `formatRulesForPrompt(rules, lang)` for context-stuffing (PRD §12/§13).
- `prompts.ts` — The F1 and F2 system-prompt templates (PRD §13), kept in one file so wording can be tuned without touching route logic.
- `validation.ts` — `isValidImage()` (JPG/PNG, ≤ 5 MB — FR1.1), `sanitizeMessage()` (trim, length cap, strip control chars — §9).
- `i18n.ts` — `dictionaries.{id,en}` for static UI strings and a `t(lang, key)` helper (PRD §6 language switcher).

**Config & meta:** `.env.example` documents `GEMINI_API_KEY` (PRD §14); `tailwind.config.ts` defines the status color tokens and mobile-first breakpoints; `next.config.mjs` holds `images` config (§8); `tsconfig.json` sets the `@/*` path alias; `vitest.config.ts` wires jsdom + Testing Library (§11); `README.md` covers setup/run/deploy (PRD §20 DoD).

---

## 3. Technology Choices & Rationale

Each choice is evaluated against the project's hard constraints: **Rp 0 budget** (PRD §8), a **4-week timeline** with a small team of varying skill (PRD §16–17), **mobile-first + must be live for judges** (PRD §3), and **judging on execution quality, not feature count** (PRD §5).

### 3.1 Next.js 14+ (App Router)

**Why chosen.** Next.js is the only choice that satisfies *three* requirements with one tool: (1) a first-class React UI for the mobile-first frontend (PRD §7), (2) built-in **server-side API Routes** that provide the BFF key-shielding required by NFR-Security (§1.3, PRD §7), and (3) **zero-config deployment to Vercel** (PRD §8). One repo, one framework, one deploy — critical for a 4-week, 3-person timeline. The App Router's Server/Client Component split also lets static pages (landing, about) ship as **zero-JS server-rendered HTML**, helping the performance budget (§8).

**Trade-offs considered.** The App Router has a steeper learning curve than the older Pages Router (the Server/Client boundary, the `'use client'` directive). We accept this because the boundary is exactly what enforces our security model, and the app is small enough that the concept surface is manageable. React Server Components add conceptual overhead, but for SASANA most interactivity is concentrated in two client pages, so the split is clean.

**Alternatives rejected.**

| Alternative | Why rejected |
|---|---|
| **Plain React (Vite/CRA) SPA** | No server layer → the Gemini key would have to live in the browser (violates PRD §7) *or* require a **separate** backend, adding a second deploy + CORS. |
| **Vite SPA + separate Express/FastAPI backend** | Hides the key but doubles the infra and introduces cross-origin complexity; more moving parts than a 4-week timeline allows. |
| **Astro / SvelteKit / Nuxt** | All can shield a key, but the team's stated skill set is React (PRD §17), and Vercel's tightest, best-documented integration is with its own framework, Next.js. |
| **Pages Router (Next.js)** | Viable, but the App Router is the current default from `create-next-app`, gives us free server rendering for static pages, and is where Next.js investment is going. |

### 3.2 Tailwind CSS

**Why chosen.** Tailwind delivers a **polished, consistent, mobile-first UI fast** — the exact axis SASANA is judged on (PRD §5 "few features, but truly polished"; §20 UI/UX 20%). Utility classes make responsive design (`sm:`/`md:` breakpoints), sufficient contrast, and large tap targets (PRD §7 accessibility) trivial to apply consistently. It also **tree-shakes to a tiny CSS payload** (only classes actually used ship), directly serving the performance budget (§8). It is free and open-source (PRD §8).

**Trade-offs considered.** Utility-class markup is verbose and can look noisy in JSX. We mitigate this by extracting repeated patterns into components (`Button`, `Card`) rather than copy-pasting class strings — so the verbosity lives in one place.

**Alternatives rejected.**

| Alternative | Why rejected |
|---|---|
| **Plain CSS / CSS Modules** | Slower to build a consistent responsive system by hand; easy to drift into inconsistent spacing/contrast under time pressure. |
| **Component libraries (MUI, Chakra, Ant)** | Larger bundles, opinionated "default" look that reads as generic — works against the distinctive, polished UI the competition rewards. Heavier for a mobile-first target. |
| **Styled-components / Emotion (CSS-in-JS)** | Runtime cost and extra client JS; awkward with Server Components. Tailwind is zero-runtime. |

### 3.3 Google Gemini API

**Why chosen.** Gemini is the **only** vendor that delivers *both* required AI capabilities — **vision** (F1 image analysis) and **grounded text** (F2 chat) — behind **one API and one key**, on a **genuinely free tier with no credit card** (PRD §8). `gemini-3.6-flash` and `gemini-3.5-flash-lite` are multimodal (vision + text), fast enough to hit the **< 8 s** target (PRD §3/§7), and support **native structured-JSON output** (`responseMimeType: "application/json"` + `responseSchema`), which makes the F1 contract (PRD §11 — `{status, reason, suggestion, reference}`) reliable to parse instead of scraping free-form text.

> **SDK note (see the callout at the top).** Use **`@google/genai`** (`GoogleGenAI`), not the PRD's `@google/generative-ai`. Minimal current usage:
>
> ```ts
> // lib/gemini.ts
> import { GoogleGenAI, Type } from "@google/genai";
>
> const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
>
> // F1 — vision + JSON mode
> const res = await ai.models.generateContent({
>   model: "gemini-3.6-flash",
>   contents: [
>     { inlineData: { data: base64, mimeType } }, // e.g. "image/jpeg"
>     visionSystemPrompt + `\nContext: ${context}`,
>   ],
>   config: {
>     responseMimeType: "application/json",
>     responseSchema: {
>       type: Type.OBJECT,
>       properties: {
>         status:     { type: Type.STRING },  // compliant|needs_attention|not_compliant|unclear
>         reason:     { type: Type.STRING },
>         suggestion: { type: Type.STRING },
>         reference:  { type: Type.STRING },
>       },
>       required: ["status", "reason", "suggestion", "reference"],
>     },
>   },
> });
> const result = JSON.parse(res.text); // -> VisionResult
> ```

**Trade-offs considered.** On the free tier, "submitted data may be used by Google to improve its products" (PRD §8). We address this head-on with the **UI privacy notice** (PRD §7/§19) and by never persisting photos (§9). Free-tier **rate limits** (~10 req/min, 250/day for Flash; ~15/min, 1,000/day for Flash-Lite — PRD §8) are ample for MVP + demo; we mitigate quota risk with retry/error UI (PRD §7) and post-MVP caching (PRD §19). Pro models are no longer free (as of April 2026, PRD §8) but are not needed.

**Alternatives rejected.**

| Alternative | Why rejected |
|---|---|
| **OpenAI GPT-4o (vision + text)** | Excellent, but **no no-credit-card free tier** — violates the Rp 0 budget (PRD §8). |
| **Anthropic Claude (vision + text)** | Strong multimodal, but no comparable free tier for this use case. |
| **Self-hosted open model (LLaVA/Llama vision)** | "Free" software but needs GPU hosting = real cost + ops complexity; impossible inside a 4-week, Rp 0 plan. |
| **Separate vision API + separate chatbot API** | Two vendors, two keys, two SLAs, two failure modes — more integration and cost than one Gemini key. |

### 3.4 Vercel (hosting)

**Why chosen.** Vercel is built by the makers of Next.js: **git-push-to-deploy**, automatic serverless execution of our API Routes (so the BFF "just works"), a **free Hobby tier** (PRD §8), a **live public URL** for judges (PRD §3 "Website live & accessible"), and **first-class env-var management** so `GEMINI_API_KEY` is set in the dashboard and injected server-side only (§9, PRD §14 step 5). Global CDN + image optimization support the mobile-first performance goals (§8).

**Trade-offs considered.** Vendor lock-in to Vercel-specific features is a theoretical risk, but SASANA uses only standard Next.js + standard env vars, so it remains portable. Free-tier serverless has cold starts (first request after idle is slower) — acceptable against the 8 s budget, and warm during a live demo.

**Alternatives rejected.**

| Alternative | Why rejected |
|---|---|
| **Netlify** | Comparable free tier, but Next.js App Router + serverless routes are best-supported and lowest-friction on Vercel. |
| **GitHub Pages / any static host** | Static only — cannot run the server-side API Routes the BFF requires. Would force the key into the client. |
| **Self-managed VPS / Docker** | Costs money and ops time; overkill for MVP and hostile to a Rp 0, 4-week plan. |

### 3.5 Cost analysis (from PRD §8)

| Layer | Technology | Cost |
|---|---|---|
| Language | TypeScript / JS, HTML, CSS, JSON | Free |
| Frontend | Next.js (React) + Tailwind CSS | Free / open-source |
| Backend (BFF) | Next.js API Routes (Node.js) | Free / open-source |
| AI | Google Gemini API — `gemini-3.6-flash` (vision) & `gemini-3.5-flash-lite` (text) | **Free tier, no credit card** |
| Knowledge base | `data/rules.json` (static) | Free |
| Hosting | Vercel (Hobby) | Free tier |
| Version control | GitHub + Git | Free |
| Tooling | VS Code, npm | Free |

**Total planned API/infra budget for the competition: Rp 0** (PRD §8). Every layer was selected in part to keep this number at zero without sacrificing the two core features.

---

## 4. Component Tree

### 4.1 Hierarchy

```
RootLayout  (app/layout.tsx) ─ Server
│  <LanguageProvider>  (client context, wraps whole app)
│  ├── Header ─ Server shell
│  │     └── LanguageSwitcher ............... Client  (ID/EN toggle)
│  ├── {children}  ← the active route page
│  └── Footer (privacy notice, PRD §7) ...... Server
│
├── LandingPage  (app/page.tsx) ─ Server
│   ├── SituationCheckButton ............... Client (Link CTA -> /check)
│   ├── AssistantButton .................... Client (Link CTA -> /assistant)
│   └── LanguageSwitcher .................... Client (also reachable in header)
│
├── SituationCheckPage  (app/check/page.tsx) ─ Client
│   ├── ContextSelector .................... Client  (temple | general)
│   ├── CameraUploader ..................... Client  (file/camera input, resize)
│   ├── LoadingSpinner ..................... Client  (while POST /api/vision)
│   ├── ResultCard ......................... Client  (status variants)
│   │     └─ variants: compliant | needs_attention | not_compliant | unclear
│   └── ErrorFallback ...................... Client  (API failure + retry)
│
├── AssistantPage  (app/assistant/page.tsx) ─ Client
│   ├── QuickChips ......................... Client  (example questions, FR2.5)
│   ├── ChatBubble (×N) .................... Client  (user | assistant variants)
│   │     └── SourceReference .............. Client  (cited rule, FR2.2 — assistant bubbles only)
│   ├── LoadingSpinner ..................... Client  ("assistant is typing")
│   ├── ErrorFallback ...................... Client  (API failure + retry)
│   └── ChatInput (inline in page) ......... Client  (textarea + send)
│
├── AboutPage  (app/about/page.tsx) ─ Server
│   └── Card (mission, Circular No.7/2025 reference)  ─ Server
│
└── Shared primitives  (components/ui/, components/layout/)
    ├── Button ............................. Client-safe (used server & client)
    ├── Card ............................... Server-safe (presentational)
    ├── LoadingSpinner ..................... Client-safe
    ├── ErrorFallback ...................... Client
    └── LanguageSwitcher / LanguageProvider  Client
```

**Client vs Server rule of thumb (applied above):** a component is a **Client Component** (`'use client'`) if it uses state/effects, event handlers, browser APIs (file input, camera), or context. Otherwise it stays a **Server Component** and ships no JS. The two interactive feature pages (`/check`, `/assistant`) are clients; the two content pages (`/`, `/about`) are servers.

### 4.2 Component specifications

Shared types (`VisionResult`, `ChatResponse`, `Lang`, `ChatMessage`, `Rule`) are defined in [Appendix A](#appendix-a--shared-typescript-types).

#### Layout & shared

| Component | Type | Props interface | State management |
|---|---|---|---|
| **RootLayout** | Server | `{ children: React.ReactNode }` | None. Renders shell + mounts `LanguageProvider`. |
| **LanguageProvider** | Client | `{ children: React.ReactNode }` | `useState<Lang>('en')` + `Context`. The **only** shared/global state in the app (§7). Persists choice to `localStorage`. |
| **LanguageSwitcher** | Client | `{}` (reads context) | `useContext(LanguageContext)`; calls `setLang`. |
| **Button** | Client-safe | `{ variant?: 'primary'\|'secondary'\|'ghost'; size?: 'sm'\|'md'\|'lg'; onClick?; href?; disabled?; children }` | Stateless (presentational). |
| **Card** | Server-safe | `{ children; className?; as?: keyof JSX.IntrinsicElements }` | Stateless. |
| **LoadingSpinner** | Client-safe | `{ label?: string; size?: 'sm'\|'md' }` | Stateless. |
| **ErrorFallback** | Client | `{ message?: string; onRetry: () => void }` | Stateless; delegates retry to parent (PRD §7 reliability). |

#### Landing (`/`)

| Component | Type | Props | State |
|---|---|---|---|
| **SituationCheckButton** | Client | `{}` | Stateless. Wraps `next/link` → `/check`; label via `t(lang,'cta.check')`. Client only because it reads `lang` from context. |
| **AssistantButton** | Client | `{}` | Stateless. `next/link` → `/assistant`. |

#### Situation Check (`/check`)

| Component | Type | Props interface | State management |
|---|---|---|---|
| **SituationCheckPage** | Client | route (no props) | **Owns F1 state** via `useReducer` (§7): `{ phase: 'idle'\|'loading'\|'success'\|'error'; image?: string; context: 'temple'\|'general'; result?: VisionResult; error?: string }`. |
| **ContextSelector** | Client | `{ value: 'temple'\|'general'; onChange: (c) => void }` | Controlled; state lifted to page (FR1 flow step 3). |
| **CameraUploader** | Client | `{ onImageReady: (base64: string, mimeType: string) => void; disabled?: boolean }` | Local `useState` for preview + validation error; uses `<input type="file" accept="image/png,image/jpeg" capture="environment">`; validates size/MIME (FR1.1) via `lib/validation` (client copy), resizes via `<canvas>` before base64 to stay small (§8). |
| **ResultCard** | Client | `{ result: VisionResult }` | Stateless. Chooses styling from `result.status`. |
| ↳ status variants | — | `status: 'compliant'` → green ✓; `'needs_attention'` → yellow ⚠; `'not_compliant'` → red ✕; `'unclear'` → grey ❓ + "retake photo" hint (FR1.5). All render `reason`, `suggestion`, `reference` (never bare "wrong" — FR1.3/1.4). | — |

#### Custom Assistant (`/assistant`)

| Component | Type | Props interface | State management |
|---|---|---|---|
| **AssistantPage** | Client | route (no props) | **Owns chat state**: `messages: ChatMessage[]` + `status: 'idle'\|'loading'\|'error'` via `useState`/`useReducer` (§7). Preserves in-session history (FR2.4). |
| **ChatBubble** | Client | `{ role: 'user'\|'assistant'; content: string; source?: string; grounded?: boolean }` | Stateless; styles by `role`. Renders `SourceReference` only for assistant bubbles with a source. |
| **SourceReference** | Client | `{ source: string; grounded: boolean }` | Stateless. Shows the cited rule (FR2.2); if `grounded === false`, shows a subtle "no official source" note (FR2.1). |
| **QuickChips** | Client | `{ chips: string[]; onPick: (q: string) => void; disabled?: boolean }` | Stateless; chips fill the input/submit (FR2.5). |
| **ChatInput** (inline) | Client | `{ value; onChange; onSend; disabled }` | Controlled input; local `useState` in page. |

#### About (`/about`)

| Component | Type | Props | State |
|---|---|---|---|
| **AboutPage** | Server | none | None — static content. Renders `Card`s with mission + Circular No. 7/2025 reference (PRD §6, §2). Ships zero JS. |

---

## 5. Data Flow Diagrams

### 5.1 F1 — Vision "Situation Check" (happy path)

```
 USER            CLIENT (/check, Client Comp)         BFF (/api/vision, server)     GEMINI
  │                        │                                    │                     │
  │ pick/take photo        │                                    │                     │
  ├───────────────────────►│                                    │                     │
  │                        │ validate JPG/PNG ≤5MB (FR1.1)      │                     │
  │                        │ resize + FileReader → base64       │                     │
  │ tap "Check"            │ set phase=loading (spinner)        │                     │
  ├───────────────────────►│                                    │                     │
  │                        │ POST /api/vision                   │                     │
  │                        │ { image:<base64>, context:"temple"}│                     │
  │                        ├───────────────────────────────────►│                     │
  │                        │                                    │ re-validate input   │
  │                        │                                    │ build vision prompt │
  │                        │                                    │ (PRD §13) + JSON    │
  │                        │                                    │ schema              │
  │                        │                                    │ generateContent(    │
  │                        │                                    │   inlineData+prompt)│
  │                        │                                    ├────────────────────►│
  │                        │                                    │                     │ analyze
  │                        │                                    │◄────────────────────┤ image
  │                        │                                    │ JSON.parse(res.text)│
  │                        │                                    │ → VisionResult      │
  │                        │◄───────────────────────────────────┤                     │
  │                        │ 200 {status,reason,               │                     │
  │                        │      suggestion,reference}         │                     │
  │                        │ set phase=success                  │                     │
  │  ResultCard renders    │                                    │                     │
  │◄───────────────────────┤ (green/yellow/red/grey variant)   │                     │
  │                        │                                    │                     │
```

Response contract per PRD §11: `status ∈ {compliant, needs_attention, not_compliant, unclear}`.

### 5.2 F2 — Chat "Custom Assistant" (happy path)

```
 USER            CLIENT (/assistant)              BFF (/api/chat, server)         KB + GEMINI
  │                     │                                  │                          │
  │ type question       │                                  │                          │
  │ (or tap QuickChip)  │                                  │                          │
  ├────────────────────►│ append user msg to history       │                          │
  │                     │ status=loading                   │                          │
  │                     │ POST /api/chat                   │                          │
  │                     │ {message, lang, history}         │                          │
  │                     ├─────────────────────────────────►│                          │
  │                     │                                  │ retrieveRules(message)   │
  │                     │                                  │  keyword match over      │
  │                     │                                  │  data/rules.json ────────┼──► KB
  │                     │                                  │◄─────────────────────────┤   (rules[])
  │                     │                                  │ build grounded prompt:   │
  │                     │                                  │  system + RULES{...}     │
  │                     │                                  │  (PRD §13, "answer ONLY  │
  │                     │                                  │   from RULES")           │
  │                     │                                  │ generateContent(text) ───┼──► Gemini
  │                     │                                  │◄─────────────────────────┤   answer
  │                     │                                  │ shape → {answer, source, │
  │                     │                                  │          grounded}       │
  │                     │◄─────────────────────────────────┤ 200                      │
  │                     │ append assistant msg             │                          │
  │ ChatBubble +        │ status=idle                      │                          │
  │ SourceReference     │                                  │                          │
  │◄────────────────────┤                                  │                          │
```

`grounded=false` when no rule matches → the answer states "no official information is available" and does **not** fabricate (FR2.1).

### 5.3 Error flows

**(a) API / network failure (both F1 & F2) — NFR reliability (PRD §7):**

```
CLIENT ──POST──► BFF ──► Gemini
                  │        ╳ (timeout / 429 quota / 5xx / network)
                  │◄───────┘
       ◄──────────┤ catch → 200 {status/grounded flag} OR 4xx/5xx {error:"..."}
CLIENT: status=error → <ErrorFallback message onRetry> → user taps Retry → re-POST
```
- BFF wraps the Gemini call in `try/catch`. On failure it returns a **structured, friendly error** (`{ error: string }` with an appropriate HTTP status), never a raw stack trace.
- On `429` (free-tier quota, PRD §8/§19) the message suggests trying again shortly.
- Client shows `ErrorFallback` with a **Retry** button that re-issues the exact same request (PRD §7).

**(b) F1 unclear / irrelevant image — FR1.5:**

```
CLIENT ─base64─► /api/vision ─► Gemini (image too dark/blurry/no subject/non-temple)
                                   │ model follows prompt: cannot assess
                                   ▼
                         VisionResult{ status:"unclear",
                                       reason:"Photo is too dark to assess.",
                                       suggestion:"Please retake in better light.",
                                       reference:"" }
CLIENT: ResultCard (grey ❓ variant) + prominent "Retake photo" CTA → back to CameraUploader
```
The AI is instructed to answer honestly when uncertain rather than guess (FR1.5, PRD §6 edge cases) — `unclear` is a first-class status, not an error.

**(c) F2 ungrounded question — FR2.1:**

```
CLIENT ─message─► /api/chat ─► retrieveRules() returns [] (no keyword match)
                                   │ prompt still says "answer ONLY from RULES;
                                   │  if none, say no official info exists"
                                   ▼
                        ChatResponse{ answer:"I don't have official information
                                             on that in the Bali code of conduct.",
                                      source:null, grounded:false }
CLIENT: assistant ChatBubble (grounded=false) → SourceReference shows neutral note; NO invented rule
```

---

## 6. Route Design

Next.js App Router routing. "Type" is the rendering model of the route's top-level page (Server = zero-JS SSR; Client = hydrated interactive). API routes are server-only Route Handlers.

### 6.1 Page routes

| Route | File | Type | Description |
|---|---|---|---|
| `/` | `app/page.tsx` | **Server** | Landing page — intro + two CTAs (`SituationCheckButton`, `AssistantButton`) + language switcher (PRD §6). |
| `/check` | `app/check/page.tsx` | **Client** | F1 Situation Check — camera/upload → analysis → `ResultCard` (PRD §6/F1). Interactive (file input, state). |
| `/assistant` | `app/assistant/page.tsx` | **Client** | F2 Custom Assistant — grounded chat with history + quick chips (PRD §6/F2). Interactive. |
| `/about` | `app/about/page.tsx` | **Server** | Mission + Governor Circular No. 7/2025 reference (PRD §6, §2). Static. |

### 6.2 API routes (BFF)

| Route | File | Method | Type | Description |
|---|---|---|---|---|
| `/api/vision` | `app/api/vision/route.ts` | `POST` | **Server (Node runtime)** | F1 endpoint. In: `{ image: base64, context: "temple"\|"general" }`. Out: `VisionResult` `{status, reason, suggestion, reference}` (PRD §11). |
| `/api/chat` | `app/api/chat/route.ts` | `POST` | **Server (Node runtime)** | F2 endpoint. In: `{ message, lang, history }`. Out: `ChatResponse` `{answer, source, grounded}` (PRD §11). |

### 6.3 Route notes

- **Runtime:** both API routes use the **Node.js runtime** (the default), not Edge — the `@google/genai` SDK and larger request bodies (base64 images) are best served by Node. Declare explicitly for clarity: `export const runtime = "nodejs";`.
- **Method guard:** each route exports only `POST`. Any other method returns Next's automatic `405 Method Not Allowed`.
- **No dynamic segments** are needed for MVP — the KB is not addressable per-rule (that's a post-MVP RAG concern, PRD §18.7).
- **`layout.tsx`** is not a route; it wraps all four page routes with the shared shell and `LanguageProvider`.
- **Minimal handler shape** (App Router Route Handler, current API):
  ```ts
  // app/api/chat/route.ts
  export const runtime = "nodejs";
  export async function POST(req: Request) {
    const { message, lang, history } = await req.json();
    // validate → retrieve rules → build prompt → call Gemini → shape
    return Response.json(chatResponse); // ChatResponse
  }
  ```

---

## 7. State Management Strategy

**Decision: no global state library (no Redux/Zustand/Jotai) for the MVP.** SASANA has no cross-page shared data beyond the UI language. Each feature page owns a small, self-contained request lifecycle; introducing a store would add ceremony with no payoff. React's built-in primitives (`useState`, `useReducer`, one small `Context`) are sufficient and keep the bundle lean (§8).

### 7.1 Per-surface state

| Surface | State needed | Mechanism | Rationale |
|---|---|---|---|
| **Language (app-wide)** | `lang: 'id' \| 'en'` | **`Context`** (`LanguageProvider`) + `localStorage` | The only truly shared state (PRD §6). Context is the idiomatic React answer for one low-frequency global value — no library warranted. |
| **Landing `/`** | none | — | Static; language via context. |
| **Situation Check `/check`** | `phase: idle \| loading \| success \| error`, plus `image`, `context`, `result?`, `error?` | **`useReducer`** | Several fields transition together through a clear state machine (pick → validate → submit → result/error). A reducer makes illegal states hard and transitions explicit — clearer than 5 correlated `useState`s. |
| **Custom Assistant `/assistant`** | `messages: ChatMessage[]`, `status: idle \| loading \| error`, `input: string` | **`useState`** (messages + status) + controlled input | History is an append-only array (FR2.4); a couple of `useState`s are simpler than a reducer here. Escalate to `useReducer` only if optimistic updates/edits are added. |
| **About `/about`** | none | — | Static server page. |
| **Reusable components** | local only (`CameraUploader` preview/validation error, `ChatInput` value) | **`useState`** | Encapsulated; lifted to the page only when the page needs to act on it. |

### 7.2 The idle/loading/success/error pattern

Both feature pages model their async work as an explicit status enum so the UI is a pure function of state (PRD §7 loading indicator; §7 reliability):

```
idle ──submit──► loading ──┬─► success  (render ResultCard / ChatBubble)
                           └─► error    (render ErrorFallback + Retry ──► loading)
```

- **`idle`** — awaiting input; primary CTA enabled.
- **`loading`** — request in flight; show `LoadingSpinner`/skeleton (§8), disable inputs to prevent double-submit (guards free-tier quota, PRD §8).
- **`success`** — render the result; allow a new attempt.
- **`error`** — render `ErrorFallback`; **Retry** re-enters `loading` with the same payload.

For chat, this status governs only the *pending* turn; completed turns stay in `messages` so history persists across turns within the session (FR2.4). Nothing persists across a full page reload except the language choice — matching the privacy stance (no photo/message persistence, §9).

### 7.3 When to revisit

A global store becomes justified only with post-MVP features that share state across routes — e.g. a Respect Badge or saved history (PRD §18). Documented here so the team doesn't reach for one prematurely.

---

## 8. Performance Budget

Targets are driven by PRD §3 (AI response < 8 s), §7 (mobile-first, show loading), and §5 (polish). The app is small; the budget is about keeping it that way.

### 8.1 Bundle size targets

| Surface | Target (gzipped JS) | Notes |
|---|---|---|
| Shared framework baseline (Next.js + React runtime) | ~80–90 KB | Fixed cost of the framework; unavoidable and cached across routes. |
| `/` and `/about` (Server Components) | **~0 KB route JS** | Static server-rendered HTML; only the small client bits (`LanguageSwitcher`, CTA links) hydrate. |
| `/check` route chunk | **≤ 30 KB** | `CameraUploader`, `ContextSelector`, `ResultCard`, canvas resize logic. |
| `/assistant` route chunk | **≤ 25 KB** | Chat components; no markdown/heavy libs for MVP (plain text bubbles). |
| CSS (Tailwind, purged) | **≤ 15 KB** | Only used utilities ship (§3.2). |

**How we hold the line:** keep static pages as Server Components (no JS), avoid heavy client dependencies (no component library, no CSS-in-JS runtime — §3.2), rely on Next.js **automatic per-route code-splitting** (each page loads only its own chunk), and dynamically import anything incidental. The `@google/genai` SDK is **server-only** (imported by `lib/gemini.ts` → API routes) and therefore **never counts against the client bundle** — a direct benefit of the BFF architecture (§1.3).

### 8.2 Image optimization strategy

Two distinct concerns:

1. **Static assets** (`logo`, icons, `og-image`) → use `next/image` (`<Image>`), which serves modern formats (WebP/AVIF), correct sizes per viewport, and lazy-loads offscreen images. Configure allowed sizes in `next.config.mjs`. This keeps the mobile landing page light.
2. **User-uploaded F1 photos** → these do **not** go through `next/image` (they're transient, never persisted — §9). Instead, **`CameraUploader` downsizes on the client before upload**: draw the picked image onto a `<canvas>` capped at ~1024 px on the long edge, re-encode to JPEG (quality ~0.8), then base64. This:
   - keeps the POST body well under limits and fast on mobile networks (helps the < 8 s target),
   - reduces Gemini token/inline-data cost (quota friendliness, PRD §8),
   - still gives the vision model enough detail to assess attire/behavior (FR1.2).
   Client-side validation enforces JPG/PNG ≤ 5 MB **before** resize (FR1.1); the BFF re-validates the decoded size as defense-in-depth (§9).

### 8.3 API response-time budget (target < 8 s, PRD §3/§7)

| Segment | Budget | Lever |
|---|---|---|
| Client resize + base64 | < 0.5 s | Cap dimensions; do it off the main paint. |
| Network up + BFF overhead | < 0.5 s | Same-origin; minimal server work. |
| **Gemini inference (F1 vision)** | **< 6 s** | Use `gemini-3.6-flash` (or `gemini-3.5-flash-lite` if faster/quota-friendlier); request JSON mode to avoid re-prompts; keep the prompt tight. |
| Gemini inference (F2 text) | < 3 s | `flash-lite`; small grounded context; short max output. |
| Parse + client render | < 0.3 s | Trivial JSON. |

If a call approaches the ceiling, the BFF applies a **request timeout** (e.g. ~12 s) and returns the friendly error path (§5.3a) rather than hanging.

### 8.4 Loading UI strategy

- **Immediate feedback:** the instant a request starts, the page enters `loading` and renders a **`LoadingSpinner`** (F1: "Analyzing your photo…"; F2: an assistant "typing" bubble). Never a blank screen (PRD §7).
- **Skeletons over spinners where layout is known:** `ResultCard` shows a **skeleton** of its final shape while loading so the result doesn't cause layout shift.
- **Suspense/streaming for static pages:** Server Components render instantly; any async server content can sit behind a `<Suspense>` boundary with a skeleton fallback. (For MVP the static pages have no async data, so this mainly future-proofs.)
- **Disable inputs while loading** to prevent duplicate submissions (also protects quota — PRD §8).

---

## 9. Security & Privacy

Directly implements PRD §7 (Security, Privacy) and §19 (free-tier data-use risk).

### 9.1 API-key protection (server-only via BFF)

- `GEMINI_API_KEY` is read **exclusively** in server code (`lib/gemini.ts`, imported only by API routes). It is set in `.env.local` locally and in **Vercel → Project → Settings → Environment Variables** for production (PRD §14).
- **No `NEXT_PUBLIC_` prefix.** Only vars prefixed `NEXT_PUBLIC_` are inlined into the client bundle by Next.js; ours is not, so it is a compile-time impossibility for it to reach the browser.
- **`.env.local` is git-ignored**; `.env.example` documents the variable name with a placeholder and is the only env file committed (PRD §14 "never commit `.env.local`").
- The client only ever calls **same-origin** `/api/*`; it has no knowledge of Google's endpoint or the key (§1.3).

### 9.2 Photo & message privacy (processed in memory only)

- **No persistence.** Uploaded photos and chat messages are held only in function memory for the duration of a single request, passed to Gemini, and discarded when the handler returns. **No database, no file writes, no logging of image bytes or message content.** This is a design property, not just a policy — there is nowhere in the architecture that writes them.
- **In-session only on the client:** chat history lives in React state (FR2.4) and is gone on reload; the F1 photo/result is not stored at all.
- **UI privacy notice (required, PRD §7/§19):** a persistent, plain-language notice on `/check` (and in the footer) states that photos are used only for analysis, are not stored, and that on Gemini's free tier submitted data may be used by Google to improve its products (PRD §8). This turns the free-tier caveat into an honest, visible disclosure.
- **Strip metadata:** the client-side canvas re-encode (§8.2) naturally drops EXIF/GPS from photos before they ever leave the device — a privacy bonus.

### 9.3 CORS considerations

- Because the UI and the BFF share one origin (same Vercel deployment), **F1/F2 requests are same-origin — no CORS preflight, no cross-origin headers needed.** This is a deliberate benefit of the BFF choice over a separate backend (§3.1).
- We **do not** add permissive CORS headers (no `Access-Control-Allow-Origin: *`) to the API routes. Leaving them same-origin-only prevents other sites from calling our endpoints and spending our free-tier quota.

### 9.4 Input sanitization & abuse limits

- **F1 image validation** (`lib/validation.ts`): enforce MIME ∈ {`image/jpeg`, `image/png`} and decoded size ≤ 5 MB (FR1.1) on **both** client (fast UX) and server (authoritative). Reject anything else with a friendly message.
- **F2 message sanitization:** trim, cap length (e.g. ≤ 1,000 chars), and strip control characters before prompt assembly to reduce prompt-injection surface and runaway token usage. The system prompt itself is hardened to "answer ONLY from RULES; never invent" (PRD §13, FR2.1), which bounds what a crafted question can extract.
- **Payload guarding:** validate the request body shape; reject missing/oversized fields early (before calling Gemini) to protect quota (PRD §8/§19).
- **No secrets in URLs:** all sensitive data (image, message) travels in the **POST body**, never in query strings — consistent with privacy rules.
- **Out of MVP scope (noted for honesty):** IP-based rate limiting and CAPTCHA are not in the MVP; the mitigations above plus disabled-while-loading inputs (§8.4) and Gemini's own quotas are the safeguards. Rate limiting is a fast follow if abuse appears.

---

## 10. Development Setup

Concrete, reproducible steps. Supersedes PRD §14 where the SDK package name differs (see top callout).

### 10.1 Prerequisites

- **Node.js 18.18+** (Next.js 14+ requirement) and **npm**.
- A free **Gemini API key** from Google AI Studio (no credit card — PRD §8).
- **Git** + a **GitHub** account; a **Vercel** account (can sign in with GitHub).

### 10.2 Scaffold

```bash
# 1. Create the app (App Router + TypeScript + Tailwind + ESLint)
npx create-next-app@latest sasana \
  --typescript --tailwind --eslint --app --no-src-dir \
  --import-alias "@/*"

cd sasana
```

This generates `app/`, `tailwind.config.ts`, `postcss.config.mjs`, `tsconfig.json` (with the `@/*` alias), `.gitignore` (already ignoring `.env*.local`), and `next.config.mjs`.

### 10.3 Dependencies

```bash
# Runtime — the CURRENT Gemini SDK (NOT the deprecated @google/generative-ai)
npm install @google/genai

# Dev — testing stack (see §11)
npm install -D vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

> Tailwind, PostCSS, and Autoprefixer are already installed and configured by `create-next-app --tailwind` — do **not** re-run the PRD §14 `tailwindcss postcss autoprefixer` install; it's redundant on Next 14+.

### 10.4 Environment variables

```bash
# .env.local  (git-ignored — never commit)
GEMINI_API_KEY=your_real_key_here
```

```bash
# .env.example  (committed — documents required vars, no secrets)
GEMINI_API_KEY=
```

Add the two package scripts if not present, and a test script:

```jsonc
// package.json (scripts)
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest",
  "test:run": "vitest run"
}
```

### 10.5 Run locally

```bash
npm run dev          # http://localhost:3000
```

Then add SASANA files per the scaffold (§2): `data/rules.json`, `lib/*` (types live in `lib/types.ts`), `components/*`, the four pages, and the two API routes. Verify each surface: `/`, `/check`, `/assistant`, `/about`, and `POST /api/vision` / `POST /api/chat` (e.g. via the browser or `curl`).

### 10.6 Deploy to Vercel

1. **Push to GitHub:** `git init && git add . && git commit -m "MVP" && git branch -M main && git remote add origin <repo> && git push -u origin main`.
2. **Import** the repo at **vercel.com → Add New → Project**; Vercel auto-detects Next.js (no build config needed).
3. **Add the env var:** Project → **Settings → Environment Variables** → `GEMINI_API_KEY` = your key (Production + Preview). This is the production equivalent of `.env.local` and stays server-side (§9.1).
4. **Deploy.** Vercel builds and gives a live URL — the "active hosting link" judges need (PRD §3, §20).
5. **Every subsequent `git push`** to `main` auto-redeploys (CI/CD for free).

---

## 11. Testing Strategy

Implements PRD §15 and the Definition of Done "tested on ≥ 10 cases" (PRD §20). **Tooling: Vitest** (chosen over Jest for near-zero config with the Vite/TS toolchain, fast watch mode, and ESM-native support) + **React Testing Library** + **jsdom**.

### 11.1 Test pyramid for SASANA

```
        ┌─────────────────────────────┐
        │  Manual / demo checklist     │  ← PRD §15 (photos, live device, judges)
        ├─────────────────────────────┤
        │  API route tests (mock Gemini)│  ← contracts (PRD §11), grounding (FR2.1)
        ├─────────────────────────────┤
        │  Component tests (RTL)        │  ← ResultCard variants, ChatBubble, errors
        ├─────────────────────────────┤
        │  Unit tests (pure functions)  │  ← validation, retrieveRules, prompt build
        └─────────────────────────────┘
```

### 11.2 Unit tests (pure logic — highest value, fastest)

Target the deterministic functions in `lib/` (no network):

- **`validation.test.ts`** — `isValidImage()` accepts JPG/PNG ≤ 5 MB, rejects GIF, oversized, empty (FR1.1). `sanitizeMessage()` trims, caps length, strips control chars (§9.4).
- **`knowledge.test.ts`** — `retrieveRules("kamen dress temple")` returns the temple-attire rule; an off-topic query returns `[]` (drives the ungrounded path FR2.1); `formatRulesForPrompt()` produces the expected `RULES:` block for both `id`/`en`.
- **`prompts.test.ts`** — the built F1/F2 prompts contain the non-negotiable instructions ("respond ONLY in JSON", "answer ONLY from RULES", "if unsure → unclear") so a wording regression is caught (PRD §13).

### 11.3 Component tests (React Testing Library + jsdom)

- **`ResultCard.test.tsx`** — render each of the **four** statuses and assert the correct color/label and that `reason`, `suggestion`, `reference` all appear (never a bare "wrong" — FR1.3/1.4); `unclear` shows the retake hint (FR1.5).
- **`ChatBubble.test.tsx`** — `role="user"` vs `role="assistant"` styling; `SourceReference` renders only when a source exists; `grounded=false` shows the neutral "no official source" note (FR2.1/2.2).
- **`ErrorFallback.test.tsx`** — renders the message and calls `onRetry` when the button is clicked (PRD §7 reliability).
- **`CameraUploader.test.tsx`** — rejects a too-large/wrong-type file with a visible error and does **not** call `onImageReady` (FR1.1).
- **State-machine smoke:** render `/check` and `/assistant` pages, mock `fetch`, and assert the idle→loading→success/error transitions render the right components (§7).

### 11.4 API route tests (mock the Gemini SDK)

Import the `POST` handler from `app/api/*/route.ts` directly and invoke it with a constructed `Request`, **mocking `lib/gemini.ts`** (via `vi.mock`) so no real API call or key is needed:

- **`api-vision.test.ts`** — valid `{image, context}` → 200 with a body matching the `VisionResult` shape and `status` in the allowed enum (PRD §11); malformed/oversized input → 4xx with `{error}`; mocked Gemini throw → friendly error path (§5.3a).
- **`api-chat.test.ts`** — a KB-covered question → `grounded:true` + a `source`; a KB-miss question → `grounded:false` and an answer that declines rather than fabricates (**the critical grounding test**, FR2.1/PRD §15 "Grounding"); a mocked Gemini failure → friendly error.

*(Real end-to-end Gemini calls are exercised manually in §11.5, not in CI, to keep tests deterministic and quota-free.)*

### 11.5 Manual testing checklist (from PRD §15 + §20)

| # | Area | Procedure | Pass criteria |
|---|---|---|---|
| 1 | **F1 Vision accuracy** | Run **≥ 10** sample photos from `public/sample/`: compliant attire, shorts-in-temple, climbing a shrine, stepping near canang, a blurry/dark shot, a non-temple scene. | Correct `status` + friendly, educational tone (FR1.2–1.5); never judgmental. |
| 2 | **F1 unclear handling** | Submit a dark/blurry/no-subject photo. | Returns `unclear`, asks to retake (FR1.5) — does not guess. |
| 3 | **F2 accuracy** | Ask the **10 benchmark questions** with known answers from `rules.json`. | **≥ 8/10** correct **and** grounded with source (PRD §3 success metric, §15). |
| 4 | **F2 grounding** | Ask a question **not** in the KB (e.g. an unrelated topic). | Assistant declines / says no official info — **does not fabricate** (FR2.1). |
| 5 | **Bilingual** | Ask the same question in Indonesian and English. | Auto-detects language; answers in kind (FR2.3). |
| 6 | **Responsiveness** | Load all pages on a real phone + desktop viewport. | No overflow; large tap targets; readable (PRD §7). |
| 7 | **Failure handling** | Temporarily use a bad key / throttle network. | Friendly error + working **Retry** (PRD §7). |
| 8 | **Performance** | Time F1 and F2 responses on a phone over mobile data. | **< 8 s** per call (PRD §3). |
| 9 | **Privacy notice** | Inspect `/check` and footer. | Notice present and accurate (PRD §7/§19). |
| 10 | **Live deploy** | Open the Vercel URL as a judge would. | Site live, all four routes work, no console errors (PRD §20). |

**Definition of Done (PRD §20):** a feature ships when it works on the **live** site, passes its automated tests, clears the manual checklist on **mobile + desktop**, and demos cleanly.

---

## Appendix A — Shared TypeScript Types

Single source of truth in `lib/types.ts` (the repo keeps types in `lib/`, not a top-level `types/`), imported by client, BFF, and tests. Encodes the PRD §11 contracts and PRD §12 KB shape.

```ts
// lib/types.ts

/** UI + answer language (PRD §6, FR2.3). */
export type Lang = "id" | "en";

/** F1 status enum — PRD §11. */
export type VisionStatus =
  | "compliant"
  | "needs_attention"
  | "not_compliant"
  | "unclear";

/** Response of POST /api/vision — PRD §11. */
export interface VisionResult {
  status: VisionStatus;
  reason: string;        // why (never just "wrong" — FR1.3)
  suggestion: string;    // polite, actionable fix (FR1.4)
  reference: string;     // e.g. "Bali Governor Circular No. 7/2025" ("" if none)
}

/** Request of POST /api/vision. */
export interface VisionRequest {
  image: string;                     // base64 (no data: prefix)
  context: "temple" | "general";     // FR1 flow step 3
}

/** One chat turn kept in session history — FR2.4. */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  source?: string | null;   // assistant only (FR2.2)
  grounded?: boolean;        // assistant only (FR2.1)
}

/** Request of POST /api/chat — PRD §11. */
export interface ChatRequest {
  message: string;
  lang: Lang;
  history: ChatMessage[];
}

/** Response of POST /api/chat — PRD §11. */
export interface ChatResponse {
  answer: string;
  source: string | null;    // null when not grounded
  grounded: boolean;        // false → declined, did not fabricate (FR2.1)
}

/** A knowledge-base rule — PRD §12 (data/rules.json is Rule[]). */
export interface Rule {
  id: string;
  category: string;
  rule_id: string;          // rule text, Indonesian
  rule_en: string;          // rule text, English
  keywords: string[];       // for retrieveRules() matching
  source: string;
  sacred_area: boolean;
}

/** Uniform error envelope returned by API routes on failure (§5.3a). */
export interface ApiError {
  error: string;
}
```

---

*This technical specification is derived from and cross-referenced against [PRD v1.0](./prd.md). Where implementation reality diverges from the PRD — notably the Gemini SDK package name — this document is authoritative and the divergence is flagged inline. Update both documents together as development progresses.*
