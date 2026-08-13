# PRD — SASANA (Complete)

**Smart & Culturally-Respectful Tourism Companion for Bali**

|              |                                                                     |
| ------------ | ------------------------------------------------------------------- |
| **Document** | Product Requirements Document (complete)                            |
| **Event**    | Bali AI Tech Fest 2026                                              |
| **Category** | AI Web Innovation Challenge                                         |
| **Sector**   | Tourism (Smart Tourism)                                             |
| **Team**     | SASANA Group — SMK Wikrama Bogor                                    |
| **Members**  | Daniyal Hafiidz Prasetyo, Manu Caimpiyana Bhimasena, Rafli Halomoan |
| **Version**  | 1.1 (MVP — deepened scope)                                          |

---

## Table of Contents

1. Product Overview
2. Problem & Motivation
3. Goals & Success Metrics
4. Target Users
5. MVP Scope
6. Functional Requirements
7. Non-Functional Requirements
8. Technology Stack & Cost
9. System Architecture
10. Project Structure
11. API Contracts
12. Data Model (Knowledge Base)
13. AI Prompt Design
14. Environment & Setup
15. Testing Plan
16. Development Timeline
17. Team Roles
18. Roadmap (Post-MVP)
19. Risks & Mitigation
20. Definition of Done
21. Appendix — Glossary

---

## 1. Product Overview

SASANA is an AI-powered web application positioned as a **smart, culturally-respectful tourism companion for Bali**. Beyond keeping tourists compliant with local customs, it helps them **plan and navigate their visit responsibly**. It helps visitors understand and respect local customs and the sanctity of sacred sites — in real time, in their own language, and even before they arrive — so that violations are prevented before they happen.

This positioning is deliberate: rather than a single-use utility opened only when a tourist fears breaking a rule, SASANA gives visitors reasons to open it repeatedly — to check, plan, and understand — while keeping cultural compliance as its unique differentiator.

The name _Sasana_ is Balinese for "code of conduct / norms of behavior". It can also be read as an acronym: **S**mart **A**dat & **S**acred-site **A**wareness **NA**vigator.

---

## 2. Problem & Motivation

Tourists frequently break Balinese customs — entering sacred temple areas, wearing improper attire, climbing sacred objects, or stepping on offerings. These violations are usually caused by **ignorance, not malice**. Existing information is scattered, mostly in Indonesian, and typically discovered only after a violation has occurred.

The scale is real and growing: Bali received **6.95 million foreign tourist arrivals in 2025** (+9.72% year-on-year, BPS Bali), and **257 foreigners were deported** between 1 Jan – 2 Nov 2025 for various violations. The Bali Provincial Government issued **Governor Circular (SE) No. 7 of 2025** on a new code of conduct for foreign tourists, requiring respect for temple sanctity and modest dress at sacred sites, and prohibiting entry into the main temple area. The rules exist and carry sanctions, but there is **no practical tool that helps tourists comply on the ground**. SASANA fills that gap.

---

## 3. Goals & Success Metrics

**Product goals (MVP):**

- A tourist can check whether their situation/attire complies with local custom using a single photo.
- A tourist can ask free-form questions about local customs and get accurate answers grounded in official regulations.
- A tourist can discover the rules of a specific sacred site — either automatically when nearby, or by exploring a location before they arrive.

**Success metrics:**

| Metric                                              | MVP target                                          |
| --------------------------------------------------- | --------------------------------------------------- |
| Core features fully working during demo             | 3/3 (Situation Check, Custom Assistant, Geofencing) |
| Custom Assistant accuracy on 10 test questions      | ≥ 8/10 aligned with official rules                  |
| AI Vision response time                             | < 8 seconds per photo                               |
| Popular temples covered in knowledge base           | ≥ 5                                                 |
| Feature usable without being in Bali (Explore Mode) | Yes                                                 |
| Supported languages                                 | Indonesian + English                                |
| Website live & accessible to judges                 | Yes (active hosting link)                           |
| Mobile-responsive                                   | Yes                                                 |

---

## 4. Target Users

**Persona 1 — Foreign tourist (primary).** Visits popular temples (Besakih, Tanah Lot, Uluwatu). Unfamiliar with local customs, does not speak Indonesian. Needs quick, clear, non-judgmental answers. Uses a phone. Often wants to check/plan **before** arriving at a site.

**Persona 2 — Local tour guide/agent (secondary).** Wants guests to behave appropriately; can recommend the app.

MVP is focused on Persona 1.

---

## 5. MVP Scope

**In MVP (built & demoed):**

1. **F1 — AI Vision "Situation Check"**
2. **F2 — Custom Assistant** (chatbot grounded in official rules)
3. **F3 — Geofencing & Location Awareness** (with **Live Mode** + **Explore Mode**, including temple open/closed status and Odalan alerts)
4. **Supporting pages:** landing page, result view, language switcher (ID/EN), about page.

**Out of MVP (see Roadmap):** culture-aware trip planner, cultural-meaning education module, real-time voice guide, Respect Badge, additional languages (Mandarin/Korean/Japanese/French), full RAG with vector search.

**Guiding principle:** three focused core features, each executed deeply and polished — past winners won on execution quality, not feature count. F3 is largely client-side, so it adds strong product value without heavy backend cost.

---

## 6. Functional Requirements

### F1 — AI Vision "Situation Check"

The user uploads/takes a photo; the AI assesses compliance with local custom and returns feedback + suggestions.

**User flow:**

1. User taps "Situation Check".
2. User uploads a photo or captures one via camera.
3. (Optional) User selects context: "I'm at a temple" / "General".
4. AI analyzes the photo and displays the result.

**Result shown:** status (**Compliant / Needs Attention / Not Compliant**, green/yellow/red), short explanation, polite suggestion, rule reference.

| ID    | Requirement                                                                                                                                                 |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1.1 | Support JPG/PNG images, max 5 MB                                                                                                                            |
| FR1.2 | Detect at least: attire appropriateness in sacred areas, presence of sacred symbols/sites (pelinggih, offerings/canang), risky behavior (climbing/stepping) |
| FR1.3 | Output is always status + reason + suggestion, never just "wrong"                                                                                           |
| FR1.4 | Tone is always friendly and educational, never judgmental                                                                                                   |
| FR1.5 | If the photo is unclear/irrelevant, ask for a new photo instead of guessing                                                                                 |
| FR1.6 | Response returned as structured JSON for rendering                                                                                                          |

**Edge cases:** dark/blurry photo, no person in frame, non-temple context. The AI must answer honestly when uncertain.

### F2 — Custom Assistant

A chatbot where users ask free-form questions; answers are drawn from a knowledge base of official rules (not fabricated).

**User flow:** user types a question → system retrieves relevant rules → AI composes an answer grounded in those rules, in the user's language → answer shown with source.

| ID    | Requirement                                                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------ |
| FR2.1 | Answers must be grounded in the knowledge base; if no rule exists, state that no official info is available — do not fabricate |
| FR2.2 | Each answer includes a source reference when available                                                                         |
| FR2.3 | Support Indonesian & English (auto-detect from the question)                                                                   |
| FR2.4 | Preserve conversation history within a session                                                                                 |
| FR2.5 | Provide quick example-question chips                                                                                           |

### F3 — Geofencing & Location Awareness

When a user is near a sacred site, the app automatically shows a location card with that site's rules. Because judges and users may not be physically in Bali, the feature has **two modes**, so it can always be experienced.

**Modes:**

- **Live Mode (real GPS):** the browser Geolocation API provides the user's coordinates → the app computes distance (Haversine) to each temple in `temples.json` → if the user is within a temple's radius, a location alert pop-up appears with that temple's rules.
- **Explore Mode (works anywhere):** if the user is not near any zone, or denies location access, the app shows a friendly message and invites them to pick a temple from a map/list. Selecting one shows the same location card and rules. This doubles as a genuine **"preview before you go"** planning feature and as the **demo mechanism for judges** testing from outside Bali.

**Location card content:** temple name, general rules (from SE No. 7/2025) + location-specific rules, source, current **open/closed status**, and an **Odalan (ceremony-day) alert** when applicable.

| ID    | Requirement                                                                                        |
| ----- | -------------------------------------------------------------------------------------------------- |
| FR3.1 | Detect entry into a defined zone using Geolocation + Haversine distance against `temples.json`     |
| FR3.2 | If not in a zone or permission denied, gracefully switch to Explore Mode with a clear message      |
| FR3.3 | Location card shows general + location-specific rules, source, open/closed status, and Odalan note |
| FR3.4 | Provide a visible "Explore locations" entry point so the feature can always be triggered           |
| FR3.5 | The feature must be fully experienceable without the user being in Bali                            |
| FR3.6 | Request location permission with a clear reason; process location client-side, never store it      |

**Edge cases:** permission denied, GPS unavailable, user far from all zones → fall back to Explore Mode.

### Supporting Features

- **Landing page:** short intro + three large buttons ("Situation Check", "Ask the Custom Assistant", "Explore Locations").
- **Language switcher:** ID / EN.
- **About page:** mission + reference to Circular No. 7/2025 (credibility).

---

## 7. Non-Functional Requirements

- **Privacy:** photos and location are processed only for their function and never stored permanently; state this in the UI.
- **Performance:** AI response < 8 s; show a loading indicator.
- **Responsive:** mobile-first (most tourists use phones).
- **Accessibility:** sufficient contrast, readable text, large tap targets.
- **Reliability:** on API failure, show a friendly message + retry.
- **Security:** API keys live only on the server as environment variables.

---

## 8. Technology Stack & Cost

| Layer              | Technology                                                                    | Cost                      |
| ------------------ | ----------------------------------------------------------------------------- | ------------------------- |
| Language           | JavaScript (TypeScript optional), HTML, CSS, JSON                             | Free                      |
| Frontend           | Next.js (React) + Tailwind CSS                                                | Free / open-source        |
| Backend            | Next.js API Routes (Node.js)                                                  | Free / open-source        |
| AI                 | Google Gemini API (latest **Flash** generation: vision + text)                | **Free tier** (see below) |
| Geolocation        | Browser Geolocation API + Haversine distance (own logic)                      | Free                      |
| Map (Explore Mode) | Inline SVG drawn from design tokens, no tiles and no map library ([ADR-0003](./adr/0003-stylized-svg-map.md)) | Free |
| Knowledge base     | JSON files (`rules.json`, `temples.json`) + Balinese calendar data for Odalan | Free                      |
| Hosting            | Vercel                                                                        | Free tier                 |
| Version control    | GitHub + Git                                                                  | Free                      |
| Editor / tooling   | VS Code, npm                                                                  | Free                      |

**Gemini cost & precision note:** the free tier requires no credit card and covers our needs. Use the **latest free Flash model** (e.g. Gemini 3 Flash / 3.6 Flash, the current free default as of July 2026) rather than older 2.5 Flash — the newer Flash generation is significantly more accurate on vision tasks, which matters for precision. Free-tier limits (~10 req/min, ~1,500 req/day, 1M-token context) are more than enough for MVP + demo. Precision strategy for the free model: narrow the task, use structured prompts with examples, and handle uncertainty (return "unclear" and ask for a new photo instead of guessing). Caveat: on the free tier, submitted data may be used by Google to improve its products — hence the privacy notice in the UI. Pro models are paid-only since April 2026, but we do not need them.

**Total planned API budget for the competition: Rp 0.**

---

## 9. System Architecture

```
[ Browser / User (mobile-first) ]
        |                 |
        |          Geolocation API + inline SVG map (ADR-0003)
        |          (client-side geofence: Haversine vs temples.json)
   Frontend — Next.js + Tailwind (React components)
        |  internal fetch() to /api/*
   Backend — Next.js API Routes (Node.js)
        |                         |
   Gemini API                Knowledge Base
 (Vision + Text)      (rules.json, temples.json, calendar)
```

AI calls are server-side (API key stays secret). Geofencing runs mostly client-side against local temple data, keeping it fast, free, and privacy-friendly.

---

## 10. Project Structure

```
sasana/
├── app/
│   ├── page.tsx                # Landing page (3 entry points)
│   ├── check/page.tsx          # F1 — Situation Check UI
│   ├── assistant/page.tsx      # F2 — Custom Assistant UI
│   ├── explore/page.tsx        # F3 — Geofencing (Live) + Explore map/list
│   ├── about/page.tsx          # About + Circular reference
│   └── api/
│       ├── vision/route.ts     # F1 endpoint (image -> analysis)
│       └── chat/route.ts       # F2 endpoint (question -> answer)
├── components/                 # Reusable UI (Button, ResultCard, ChatBubble, LocationCard...)
├── lib/
│   ├── gemini.ts               # Gemini client wrapper
│   ├── knowledge.ts            # Load & format the rules KB
│   ├── geo.ts                  # Haversine + geofence check + Explore selection
│   └── calendar.ts             # Odalan / temple open-closed logic
├── data/
│   ├── rules.json              # Knowledge base (custom rules)
│   └── temples.json            # Temple coordinates + per-site rules
├── public/                     # Static assets, icons
├── .env.local                  # GEMINI_API_KEY (not committed)
├── .env.example                # Documents required env vars
├── README.md
└── package.json
```

---

## 11. API Contracts

### `POST /api/vision` — Situation Check

**Request** (multipart/form-data or base64 JSON):

```json
{ "image": "<base64>", "context": "temple" }
```

**Response:**

```json
{
  "status": "not_compliant",
  "reason": "You are wearing shorts inside a temple area.",
  "suggestion": "Please wear a kamen and sash before entering.",
  "reference": "Bali Governor Circular No. 7/2025"
}
```

`status` ∈ `compliant` | `needs_attention` | `not_compliant` | `unclear`.

### `POST /api/chat` — Custom Assistant

**Request:**

```json
{ "message": "Can I fly a drone at Tanah Lot?", "lang": "en", "history": [] }
```

**Response:**

```json
{
  "answer": "Flying drones over temple areas is restricted...",
  "source": "Bali Governor Circular No. 7/2025",
  "grounded": true
}
```

If no rule matches, `grounded` is `false` and the answer states that no official information is available.

### F3 — Geofencing (client-side, no server endpoint)

Geofencing runs in the browser: it reads the user's coordinates (Live Mode) or a chosen temple (Explore Mode) and matches against `temples.json` using `lib/geo.ts`. No network request is required, which keeps it fast and free. Odalan / open-closed status is derived locally via `lib/calendar.ts`.

---

## 12. Data Model (Knowledge Base)

`data/rules.json` — general custom rules (for the Assistant & Vision references):

```json
[
  {
    "id": "temple-attire",
    "category": "Dress Code",
    "rule_id": "Wajib mengenakan kamen dan selendang saat memasuki kawasan pura.",
    "rule_en": "A kamen and sash must be worn when entering temple grounds.",
    "keywords": ["attire", "dress", "kamen", "temple", "clothes"],
    "source": "Bali Governor Circular No. 7 of 2025",
    "sacred_area": true
  }
]
```

`data/temples.json` — per-site data for Geofencing / Explore:

```json
[
  {
    "id": "pura-besakih",
    "name": "Pura Besakih",
    "lat": -8.3739,
    "lng": 115.4515,
    "radius_m": 300,
    "general_rules": [
      "Modest dress required",
      "Do not enter the inner (utama) area unless praying"
    ],
    "specific_rules": [
      "Wear a kamen and sash",
      "Menstruating women may not enter"
    ],
    "source": ["SE No. 7/2025", "On-site temple signage"],
    "odalan": "Purnama Kadasa"
  }
]
```

For the MVP, `rules.json` is injected into the assistant's system prompt (context-stuffing). When the KB grows, migrate to embeddings + vector search (see Roadmap). `temples.json` starts with ≥ 5 curated popular temples.

---

## 13. AI Prompt Design

**F1 Vision system prompt (essence):** "You are a Balinese custom-compliance assistant. Analyze the image for attire and behavior in sacred contexts. Respond ONLY in JSON: {status, reason, suggestion, reference}. Be friendly and educational, never judgmental. If unsure, set status to 'unclear' and ask for a clearer photo."

**F2 Assistant system prompt (essence):** "You are SASANA, a guide to Balinese customs. Answer ONLY using the RULES provided below. If the rules do not cover the question, say no official information is available — do NOT invent rules. Reply in the user's language. Cite the source when possible. \n\nRULES:\n{{knowledge_base}}"

---

## 14. Environment & Setup

```bash
# 1. Create the app
npx create-next-app@latest sasana

# 2. Install dependencies
npm install @google/generative-ai leaflet
npm install -D tailwindcss postcss autoprefixer

# 3. Configure environment
echo "GEMINI_API_KEY=your_key_here" > .env.local

# 4. Run locally
npm run dev

# 5. Deploy: push to GitHub, import repo in Vercel, add GEMINI_API_KEY in Vercel env settings
```

Get a free API key at Google AI Studio. Never commit `.env.local`.

---

## 15. Testing Plan

| Area              | How to test                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| F1 Vision         | 10+ sample photos (compliant, non-compliant, unclear); verify correct status & tone                    |
| F2 Assistant      | 10 benchmark questions with known answers from the rules; expect ≥ 8/10 correct & grounded             |
| Grounding         | Ask a question NOT in the KB; assistant must decline, not fabricate                                    |
| F3 Geofence logic | Unit-test the Haversine + in-radius function with fixed coordinates (no GPS needed)                    |
| F3 Live Mode      | Use Chrome DevTools → Sensors → override location to a temple's coordinates; verify the alert triggers |
| F3 Explore Mode   | From any location, pick a temple; verify the same location card + rules appear                         |
| Responsiveness    | Test on mobile + desktop viewport                                                                      |
| Failure handling  | Simulate API error / denied location; expect friendly fallback                                         |
| Performance       | Measure response time; target < 8 s                                                                    |

---

## 16. Development Timeline

Aligned with the competition schedule — Work Submission 18 August – 14 September 2026 (~4 weeks).

| Week               | Focus                                                                      | Deliverable                               |
| ------------------ | -------------------------------------------------------------------------- | ----------------------------------------- |
| Week 1 (18–24 Aug) | Setup, UI/UX design, build KB (`rules.json` + `temples.json` ≥ 5 temples)  | Repo ready, wireframes, data              |
| Week 2 (25–31 Aug) | Build F2 (Custom Assistant)                                                | Grounded chatbot working                  |
| Week 3 (1–7 Sep)   | Build F1 (AI Vision) + F3 (Geofencing: Live + Explore, mostly client-side) | Photo analysis + location feature working |
| Week 4 (8–14 Sep)  | Polish, test, deploy, README, demo prep                                    | Live site + docs + presentation           |

---

## 17. Team Roles

| Member                    | Primary role                                                   |
| ------------------------- | -------------------------------------------------------------- |
| Daniyal Hafiidz Prasetyo  | Lead & AI integration (Gemini, backend/API)                    |
| Manu Caimpiyana Bhimasena | Frontend & UI/UX (Next.js + Tailwind), Explore map             |
| Rafli Halomoan            | Knowledge base (rules + temples), testing, & presentation/demo |

Roles adjust to strengths; collaboration stays cross-role.

---

## 18. Roadmap (Post-MVP)

**Phase 2 (near-term — the deepened companion vision):**

1. **Culture-aware Trip Planner** — builds an itinerary that already includes dress code, ceremony times, and etiquette per location.
2. **Cultural-Meaning Education** — explains the philosophy behind each rule, so tourists comply out of understanding, not fear.

**Phase 3 (later):**

3. **Real-Time Voice Guide** (hands-free).
4. **Respect Badge** — digital reward for respectful tourists.
5. **Additional languages:** Mandarin, Korean, Japanese, French.
6. **Full RAG** with embeddings + vector search (scales the KB).
7. **Official data partnership** with desa adat / Bali Tourism Office for verified, authoritative rules.
8. **Integration as a "responsible tourism layer"** embeddable into existing tourism apps.

---

## 19. Risks & Mitigation

| Risk                                       | Mitigation                                                                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| AI Vision misjudges a photo                | Always show status + reason; ask for a new photo when uncertain; use latest Flash; test broadly                         |
| Chatbot fabricates answers                 | Strict grounding + "do not fabricate" instruction                                                                       |
| Judges can't test geofencing (not in Bali) | Explore Mode lets anyone trigger the feature from any location                                                          |
| Too many features, time runs out           | Lock scope to 3 core features; rest is roadmap; F3 is mostly client-side (light)                                        |
| Free API quota limit                       | Monitor usage; cache common answers                                                                                     |
| Incomplete / inaccurate rules data         | Prioritize core rules from Circular No. 7/2025 & ≥ 5 popular temples; cite sources; verify with local sources over time |
| Team skill gaps                            | Pair up; start with F2 (simpler) before F1/F3                                                                           |

---

## 20. Definition of Done

A feature is done when it works fully on the live site, is tested on ≥ 10 cases (or unit-tested logic for geofencing), renders cleanly on mobile & desktop, and demos without errors. The project is competition-ready when the site is live, source code + README are on GitHub, and presentation material is prepared.

**Mapping to judging criteria:** Idea & social impact (30%) → §1–2; AI implementation (25%) → §6, 8, 13; Website quality (25%) → §6 (F3), 7, 15, 20; UI/UX (20%) → §6 (supporting features) & §7.

---

## 21. Appendix — Glossary

- **Pura:** a Balinese Hindu temple.
- **Kamen & selendang (sash):** traditional cloth and sash required when entering temples.
- **Pelinggih:** a shrine structure within a temple.
- **Canang:** a small daily offering, often placed on the ground.
- **Odalan:** a temple anniversary ceremony held per the Balinese calendar.
- **Awig-awig / pararem:** written customary rules / decisions of a Balinese customary village (desa adat).
- **Tri Hita Karana:** the Balinese philosophy of harmony between humans, nature, and the divine.
- **Geofencing:** triggering an action when a device enters a defined geographic zone.
- **SE No. 7/2025:** Bali Governor Circular No. 7 of 2025 on the code of conduct for foreign tourists.

---

_This is the complete MVP-stage PRD (v1.1, deepened scope) and will be updated as development progresses._
