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

The frontend and the backend are two independent services, each with its own
`package.json` and its own `node_modules`.

**`frontend/`** — **Next.js 15** (App Router) + **React 19** + **Tailwind CSS**

**`backend/`** — **Hono** on Node, run through **tsx**, containerised with
**Docker**. Talks to **Google Gemini** via `@google/genai`. Tested with
**Vitest**.

**`shared/`** — `contract.ts`, the request/response types both sides agree on.
Types only: every declaration there is erased at compile time, so nothing is
bundled across the folder boundary and no build configuration is needed. Change
a type here and TypeScript reports the mismatch on both sides immediately.

The Gemini API key lives **only** in the backend. The browser never receives it.

---

## Getting started

**Requirements:** Node.js 20.18 or newer, npm, and Docker Desktop.

**1. Give the backend a key.** Copy the example file and fill in your own Gemini
API key. Get one free (no credit card) at <https://aistudio.google.com/apikey>:

```bash
cp backend/.env.example backend/.env
```

Only `GEMINI_API_KEY` is required — everything else has a working default.

**2. Start the backend** (first terminal, from the repository root):

```bash
docker compose up backend
```

**3. Start the frontend** (second terminal):

```bash
cd frontend && npm install && npm run dev
```

Open <http://localhost:3000>.

The frontend calls the backend at <http://localhost:3001>, which is the built-in
default — `frontend/.env` only matters when the backend runs somewhere else.

> The backend refuses to start, with a clear message, if `GEMINI_API_KEY` is
> missing. That is deliberate: a misconfigured deploy should break loudly, not
> silently return errors to users.

**Prefer not to use Docker?** `cd backend && npm install && npm run dev` runs the
same server directly on your machine.

---

## Scripts

Run these from inside `frontend/` or `backend/` — there is no root package.

**`frontend/`**

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js dev server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |

**`backend/`**

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API on port 3001, reloading on change |
| `npm start` | Start the API without the watcher |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once (CI-style) |

Tests mock the Gemini SDK, so they need no API key, no network, and consume no
quota.

---

## Project structure

```
frontend/            Next.js app - everything the browser runs
  src/app/             Pages: /, /check, /assistant, /about
  src/components/      React components, grouped by feature
  src/lib/             Client copy (i18n), language state, image handling,
                       and the backend base URL
  public/              Static images

backend/             Hono API - everything that touches Gemini
  src/routes/          POST /api/chat, POST /api/vision
  src/lib/             Gemini client, knowledge base, prompts, validation,
                       errors, caching, logging
  src/data/            rules.json - the knowledge base
  __tests__/           Vitest suites
  Dockerfile

shared/              contract.ts - the API types both sides share (types only)
docs/                PRD, technical / backend / UI specs, ADRs
.scratch/            Working notes. Only the effort being worked by more than
  explore-approach/  one person is committed; the rest is local and ignored.
docker-compose.yml   Local backend container
```

Frontend work never needs a file outside `frontend/`. Changing the shape of an
API response means changing `shared/contract.ts`, and TypeScript will then flag
every place on both sides that has to follow.

---

## Deployment

The two services deploy separately, and no host is chosen yet.

**Frontend** — import the repository at [vercel.com](https://vercel.com) with
`frontend/` as the root directory; Next.js is detected automatically. Set
`NEXT_PUBLIC_API_URL` to the deployed backend URL.

**Backend** — `backend/Dockerfile` runs anywhere that accepts a container:
Railway, Render, Fly.io, Google Cloud Run, or a plain VPS. Set `GEMINI_API_KEY`
and add the deployed frontend origin to `ALLOWED_ORIGINS`, or the browser will be
refused by CORS.

Note that the image build context is the **repository root**, not `backend/`,
because the image also needs `shared/`. `docker-compose.yml` already does this;
a host that builds the Dockerfile itself has to be told the same.

`.env` files are never deployed and never enter the image; they are git-ignored
and local to your machine.

---

## Working the tickets

Work is tracked as markdown files in the repository, not in an external tool.
The effort currently open is **explore-approach**, which corrects how Explore
decides a visitor is near a sacred site.

| Path | Contents |
| --- | --- |
| [`.scratch/explore-approach/spec.md`](.scratch/explore-approach/spec.md) | The decisions every ticket rests on, the file each ticket owns, and the order they merge in |
| [`.scratch/explore-approach/issues/`](.scratch/explore-approach/issues) | One file per ticket, numbered from `01` |

Read the spec first. It is short, and every ticket assumes you have.

**Taking a ticket**

1. Pick one whose `Blocked by:` line is already satisfied.
2. Set its `Status:` line to `claimed` with your name. Commit that one change on
   its own and push it before you start anything else. This is the only thing
   stopping two people from building the same ticket twice.
3. Branch from `main`, named `explore-approach/NN-<slug>`.
4. Touch only the files your ticket lists. Every file in this effort has exactly
   one owning ticket, so a file that is not on your list belongs to someone
   else. If the work seems to need one anyway, stop and write down why under a
   `## Comments` heading at the bottom of your ticket rather than editing it.
5. Names that cross tickets — i18n keys, function signatures — are fixed in the
   ticket that creates them, because the ticket that consumes them is already
   written against those names. Changing one means changing the ticket first.
6. Tick the checklist as you go. When it is all ticked and both
   `npm run test:run` and `npx tsc --noEmit` pass in the workspace you touched,
   open a pull request and set `Status:` to `resolved`.

Merge in dependency order, not in the order tickets happen to finish.

**Where raw material goes**

Only markdown files inside `.scratch/explore-approach/` are committed. Anything
else you put there — a log, a screenshot, a pasted `.env` — is ignored and stays
on your machine. Use a sibling directory such as `.scratch/notes/` for raw
material: everything under `.scratch/` other than this one effort is local by
default, so nothing you leave there can reach GitHub by accident.

That split matters because a file cannot be un-pushed. Deleting it later removes
it from the latest commit, not from the history, and anyone can still read it.
If a credential ever does reach a commit, revoke and reissue it — do not try to
delete your way out.

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
