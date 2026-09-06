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
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once (CI-style) |

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

## Trying Explore without being in Bali

Explore raises its notice when you cross the **Approach** around a sacred site —
a circle 400 m outside the site's own Zone. Walking into one is not an option
for most people testing this, so there are two ways to see it happen.

**Simulate the walk.** Add `?simulate=` and a site id:

```bash
http://localhost:3000/explore?simulate=pura-tanah-lot
```

The simulated position starts 200 m outside the Approach and steps inward, so
what you see is the crossing rather than the destination: the screen shows
nearby sites first, then the notice rises as the line is crossed. Site ids live
in `frontend/src/data/sites.ts`; `pura-tanah-lot` is a good first one.

While a simulation is running the panel carries a **Simulated location** label,
so a reading from this mode can never be mistaken for a real one.

**Or override the device position.** Chrome DevTools → the three-dot menu →
More tools → Sensors → Location → Other, and enter the latitude and longitude
of a site from `sites.ts`. This exercises the real geolocation path, including
the accuracy handling, which the simulation does not.

**What this does not do.** Nothing arrives while the page is closed. There is no
background notification, no service worker, and no push: the notice exists only
while Explore is open on screen. That limit is a deliberate trade recorded in
[`docs/adr/0005-approach-notice-foreground-only.md`](docs/adr/0005-approach-notice-foreground-only.md),
and Explore says so on its own permission screen.

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

## Working together

The repo is carved into areas, each owned by one person:

| Area | Owner | Branch prefix | Spec |
| --- | --- | --- | --- |
| Geofencing | Daniyal | `geofencing/` | `.scratch/geofencing/spec.md` |
| Assistant | Daniyal | `assistant/` | `.scratch/assistant/spec.md` |
| AI vision | Manu | `vision/` | `.scratch/vision/spec.md` |
| Landing page | Rafli | `landing/` | `.scratch/landing/spec.md` |

Each owner writes their own `spec.md` and has it read before starting. Writing
it is the point: it is where you decide what "done" means for your area, so
nobody discovers three different answers in the last week.

**Development is centralised on Daniyal as of 2026-09-05.** Manu and Rafli are
paused, so their areas have no active owner and Daniyal picks up work that
lands in them. The table stays as it is rather than being rewritten: the
pause is temporary, and an area with a named owner is easier to hand back than
one that has been dissolved. What does *not* change while it holds is the rule
below on files more than one area touches — a contract change is still its own
pull request, merged first, because the reason for that is the dependency
order, not the head count.

The Assistant area was added the same day. The chatbot used to sit between
backend and frontend owned by nobody, which is part of why a grounding bug in
`safeParseChat` survived as long as it did.

**Branch, merge, repeat**

1. Branch from `main`, named `<area>/<slug>` — `geofencing/akurasi-approach`,
   `vision/prompt-cache`, `landing/hero-copy`. No ticket numbers: the areas do
   not carve up a shared object, so there is nothing to number.
2. Merge into `main` **as soon as a piece is done**, not when your whole area
   is. Nobody waits for anybody — your files are separate — so a branch held
   back for three weeks buys nothing and costs every conflict at once.
3. To pick up other people's work, run `git merge main` inside your branch, not
   `git rebase`. The history comes out slightly untidier and `--force` never has
   to be typed. On a team of three with no second pair of eyes, that trade is
   worth making.
4. Whoever merges later resolves the conflict, in their own branch, before the
   pull request. That also means the slowest to merge does the most work, which
   is the incentive we want.

**Files more than one area touches**

| File | Rule |
| --- | --- |
| `shared/contract.ts` | Owned by AI vision. Contract changes ship as their own small pull request, merged before anything that depends on them. |
| `frontend/tailwind.config.ts` | Owned by geofencing. Ask before changing a token. |
| `frontend/src/app/globals.css` | Append only, inside a marked block (`/* landing */`, `/* explore */`). Never add a global selector — `body`, `h1`, `*` — because that changes pages you do not own without touching a line of theirs. |
| `*/package.json` | Append only. Add a dependency freely; do not bump somebody else's version. |
| `*/package-lock.json` | Never resolve a conflict by hand. Take the version from `main`, then run `npm install` again. |

**Getting into `main`**

A pull request is required, for everybody, including whoever owns the
repository — an owner pushing straight to `main` is exactly how the other two
end up staring at a red `main` with no pull request to blame. No review from
another person is required; there are three of you, and an approval queue would
only slow the merges down.

CI runs `npm ci`, `npm run typecheck`, and `npm run test:run` in both
workspaces, and has to be green before a pull request can merge.

A page that already works must not get worse. A page that does not exist yet may
land half-finished, as long as nothing in `Header.tsx` links to it.

**Where raw material goes**

Only markdown inside a committed effort directory under `.scratch/` ships —
`.scratch/geofencing/`, `.scratch/vision/`, `.scratch/landing/`, and the
finished `.scratch/explore-approach/`. Anything else you put there — a log, a
screenshot, a pasted `.env` — is ignored and stays on your machine. Use a
sibling directory such as `.scratch/notes/` for raw material: everything under
`.scratch/` other than those efforts is local by default, so nothing you leave
there can reach GitHub by accident.

That split matters because a file cannot be un-pushed. Deleting it later removes
it from the latest commit, not from the history, and anyone can still read it.
If a credential ever does reach a commit, revoke and reissue it — do not try to
delete your way out.

**The explore-approach effort (finished)**

[`.scratch/explore-approach/`](.scratch/explore-approach) is kept as a record.
It ran under a different arrangement — numbered tickets carving up one shared
feature, one owning ticket per file, merged in dependency order — because three
people were building parts of the same screen. Read it as history, not as
instructions.

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
