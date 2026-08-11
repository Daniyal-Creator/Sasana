# SASANA

**Smart & culturally-respectful tourism companion for Bali.**

SASANA helps visitors understand and respect Balinese customs and the sanctity of
sacred sites — in real time, in their own language — so that violations are
prevented before they happen rather than discovered afterwards.

_Sasana_ is Balinese for "code of conduct". It also reads as an acronym:
**S**mart **A**dat & **S**acred-site **A**wareness **NA**vigator.

Built for **Bali AI Tech Fest 2026** (AI Web Innovation Challenge) by the SASANA
Group of SMK Wikrama Bogor: Daniyal Hafiidz Prasetyo, Manu Caimpiyana Bhimasena,
and Rafli Halomoan.

---

## Features

| Route | Feature | What it does |
| --- | --- | --- |
| `/check` | **Situation Check** | Analyzes a photo and returns a compliance verdict, the reason, and a polite suggestion. Answers `unclear` and asks for a better photo rather than guessing. |
| `/assistant` | **Custom Assistant** | Answers free-form questions about Balinese customs, grounded in a curated knowledge base. If no rule covers the question, it says so instead of inventing one. |
| `/about` | About | Mission and the reference to Governor Circular No. 7 of 2025. |

Both features work in **Indonesian and English**.

---

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS**
- **Google Gemini** via `@google/genai` — vision and grounded text
- **Vitest** for unit and API-route tests
- Deployed on **Vercel**

The Gemini API key is read **only** on the server, inside API route handlers. It
is never bundled into the browser.

---

## Getting started

**Requirements:** Node.js 18.18 or newer, and npm.

```bash
npm install
```

Create a `.env.local` file in the project root and add a Gemini API key. Get one
free (no credit card) at <https://aistudio.google.com/apikey>:

```bash
GEMINI_API_KEY=your_key_here
```

See [`.env.example`](.env.example) for every supported variable. Only
`GEMINI_API_KEY` is required — the rest have working defaults.

> The app fails at startup with a clear message if the key is missing. That is
> deliberate: a misconfigured deploy should break loudly, not silently return
> errors to users.

```bash
npm run dev
```

Open <http://localhost:3000>.

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once (CI-style) |

Tests mock the Gemini SDK, so they need no API key, no network, and consume no
quota.

---

## Project structure

```
app/            Routes and API handlers
  api/chat/       POST /api/chat   - Custom Assistant
  api/vision/     POST /api/vision - Situation Check
components/     React components, grouped by feature
lib/            Server logic: Gemini client, knowledge base, prompts,
                validation, errors, caching, logging
data/           rules.json - the knowledge base
__tests__/      Vitest suites
docs/           PRD, technical / backend / UI specs, ADRs
```

---

## Deployment

Import the repository at [vercel.com](https://vercel.com); Next.js is detected
automatically. Add `GEMINI_API_KEY` under **Settings → Environment Variables**
for Production and Preview, then redeploy — environment changes only take effect
on a new deployment.

`.env.local` is never deployed; it is git-ignored and local to your machine.

---

## Documentation

| Document | Contents |
| --- | --- |
| [`docs/prd.md`](docs/prd.md) | Product requirements, scope, success metrics |
| [`docs/tech-spec.md`](docs/tech-spec.md) | Architecture, component tree, state, performance |
| [`docs/backend-spec.md`](docs/backend-spec.md) | API contracts, prompts, error handling, knowledge base |
| [`docs/ui-spec.md`](docs/ui-spec.md) | Screens, components, copy |
| [`docs/design-guardrails.md`](docs/design-guardrails.md) | Binding UI rules |
| [`docs/adr/`](docs/adr) | Architecture decision records |

---

## Privacy

Photos and messages are processed in memory for the duration of a single request
and are never written to disk, cached, or logged. Chat history lives only in
browser state for the session. On Gemini's free tier, submitted data may be used
by Google to improve its products — the app states this in the UI.

---

## Credits

Rules are based on **Bali Governor Circular (SE) No. 7 of 2025** on the code of
conduct for foreign tourists, and on documented Balinese Hindu custom (_adat_).
Cultural explanations are pending verification against local sources.

Not affiliated with the Government of Bali.
