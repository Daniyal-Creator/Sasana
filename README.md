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

## Live

**<https://sasana.smkwikrama.sch.id>**

Public, and nothing to install. Every route in the table below is a page on it:
<https://sasana.smkwikrama.sch.id/check> is the Situation Check,
<https://sasana.smkwikrama.sch.id/explore> is the map. Open it on a phone — that
is the device it was designed at.

---

## Features

| Route | Feature | What it does |
| --- | --- | --- |
| `/` | Landing | The three doors — Situation Check, Assistant, Explore — and what the app is for. |
| `/check` | **Situation Check** | Reads the visitor's own photo and says how it stands against custom: a verdict, the reason behind it, and what to do instead. |
| `/assistant` | **Custom Assistant** | Answers free-form questions about Balinese custom, and shows what each answer stands on. |
| `/explore` | **Explore** | A map of the Sites and their Zones, and the notice that rises when a visitor crosses an Approach. |
| `/explore/<site-id>` | Site link | Opens the map on one Site — `/explore/pura-tirta-empul` is a link you can hand to somebody. |
| `/about` | About | The mission, the team, and the Circular the Rules cite. |
| `/stats` | Cache readings | What the answer cache has saved. A maintenance screen, deliberately not in the header. |

Everything works in **Indonesian and English** — the interface, the answers, the
written directions, and the refusals.

### Situation Check — `/check`

A visitor photographs the thing they are unsure about — what they are wearing at
a gate, where they are standing, what they are about to fly — and gets an answer
before they act.

- **The photo never leaves the device whole.** It is decoded in the browser,
  scaled to 1024 px on its longest edge and re-encoded at quality 0.85 before
  the request is built. JPG or PNG, up to 5 MB in.
- **Two contexts:** _At a temple_ and _General_. It changes what the model is
  asked to look for, not how strictly it judges.
- **Four verdicts,** each with a reason, a suggestion and a reference:
  `compliant`, `needs_attention`, `not_compliant`, and `unclear`. `unclear` is a
  real answer rather than a failure — a dark or cropped photo is told to come
  back better, not guessed at.
- **The photo's own knowledge is used when it has any.** EXIF capture time and
  coordinates travel with it, or a live fix if the visitor taps to add one; the
  time is what tells the model the light to expect. Coordinates that land inside
  a Site's Zone name the Site, and its Customs join the question — as Rule ids
  the server resolves against its own knowledge base, never as text the browser
  supplied.
- **The result hands itself on.** One tap carries the verdict and the photo into
  the Assistant as a follow-up question, so "why is that not allowed?" does not
  have to be typed from scratch.
- **Nothing is kept.** The image is held in memory for the length of one request
  and never written to disk, cached, or logged; only its byte size reaches a log
  line.

### Custom Assistant — `/assistant`

Free-form questions, typed or tapped. The answer always says what it is standing
on, because an unsourced answer that looks official is worse than no answer.

| Tier | What it means |
| --- | --- |
| `rule` | Cites Rules the server resolved in its own knowledge base, and carries their attribution. The only tier with official weight. |
| `context` | Balinese custom, or what something means, with no Rule behind it. Answered, never dressed as official guidance. |
| `general` | Bali more broadly — history, culture, geography. The model's own knowledge, labelled as such. |
| `places` | Real Amenities near a Site, read from OpenStreetMap at request time. Every name, category and distance comes from the map; the model only writes the sentence. |
| `none` | Nothing covers the question, so the answer says so. |

Each tier is drawn with its own icon and its own line beneath the answer, so the
difference reaches the visitor rather than living in the JSON.

- **35 Rules** in `backend/src/data/rules.json`, each with its own source. A test
  enforces that every Custom shown to a visitor traces back to one.
- **A volatility fence.** An answer may say what something means and what has
  happened, never what is happening: opening hours, ticket prices, whether a
  place is open right now, the date of the next ceremony. The prompt is the
  fence and a pattern net behind it catches the misses, because an answer that
  will go stale gets stored and replayed to somebody else next week.
- **It knows where the visitor is, when Explore has established it.** The Site
  travels as ids; the position travels beside it carrying its own accuracy, and
  expires two minutes after it was measured — a phone on a road reports 300–1500
  m of error while a Zone is 250–500 m, so a distance quoted without it would
  read as a precision the device never had.
- **Follow-up chips.** Three questions under an answer, chosen from what it
  cited and always the same three for the same conversation. Each one names its
  own subject, so it can be sent with no history behind it and be answered from
  the cache.
- **An answer cache that measures itself.** A first-turn question's answer is
  stored and served again when somebody asks the same thing in different words.
  A situated answer, a `places` answer and a refusal are never stored — see
  [Measuring what the answer cache saves](#measuring-what-the-answer-cache-saves).

### Explore — `/explore`

A map of Bali's sacred Sites that tells a visitor what a place expects of them
while there is still time to act on it.

- **The Guide comes first.** Before the map, a screen that asks for location by
  showing what the app will do with it rather than promising.
- **Two ways in.** _Live Mode_ finds the Site you are near from the device's own
  position; _Explore Mode_ is picking one by hand, from anywhere in the world.
- **Six Sites,** each with its own Zone: Pura Tanah Lot, Pura Luhur Uluwatu,
  Pura Besakih, Pura Batu Bolong, Pura Tirta Empul and Pura Ulun Danu Beratan.
  Zone radii run 250–500 m and are the Site's own; the **Approach** is one
  global 400 m ring outside it, because nothing available justifies why one Site
  would warn earlier than another.
- **Crossing the Approach raises the notice** — the Customs of the place you are
  walking towards, with a soft two-tone chime synthesised in the browser rather
  than shipped as a sound file. The Zone is where the Customs take effect; the
  Approach is where you are told, which is the whole point of the distinction.
- **A Site brief** for every Site: its Customs with the reason behind each one,
  its area, and its Zone drawn to scale.
- **Amenities and directions.** A place to eat or stay found through the
  Assistant can be sent to the map and kept as a destination, and
  `GET /api/route` returns the line to draw plus the written turns — named as a
  driving route, because that is what the public router actually returns for
  every profile.
- **No background anything.** The notice exists only while Explore is open on
  screen: no service worker, no push. See
  [Trying Explore without being in Bali](#trying-explore-without-being-in-bali).

### About — `/about`

The mission, how the project came about, the principles it holds to, the team,
and the **Governor Circular No. 7 of 2025** that most Rules cite.

### What the backend serves

| Endpoint | Purpose |
| --- | --- |
| `POST /api/chat` | One assistant turn: the answer, its tier, the Rule ids behind it, and any Amenities. |
| `POST /api/vision` | One Situation Check: verdict, reason, suggestion, reference. |
| `GET /api/route` | Directions to a chosen Amenity. Spends no Gemini quota. |
| `GET /api/stats` | Answer-cache aggregates. Spends no Gemini quota, so it is safe to poll during a demo. |
| `GET /health` | Liveness. Confirms the server is up without spending quota. |

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

## Measuring what the answer cache saves

The assistant stores an answer to a first-turn question and serves it again
when somebody asks the same thing, however they word it. `GET /api/stats`
reports what that has been worth, and `/stats` shows the same numbers on a
screen. Neither is linked from the header: they are maintenance readings, not
something a visitor came for.

The saving is measured rather than estimated. Each entry records what its
original Gemini call actually cost, and every later hit adds that figure again.

To measure it yourself, run the same questions twice, once with the cache off
and once with it on. Misses are counted either way, so the two readings compare:

```bash
CACHE_ENABLED=false docker compose up -d backend
```

Ask a set of questions, note `/api/stats`, then repeat with the cache on and a
fresh database (`rm backend/data/answers.db`). One such run, sixteen questions
being eight asked twice in different words:

| | Cache off | Cache on |
| --- | --- | --- |
| Questions asked | 16 | 16 |
| Gemini calls | 16 | 9 |
| Tokens spent | 61,532 | 34,639 |

A 43.7% saving, and `tokensSaved` reported 26,932 against a measured difference
of 26,893. Seven of the eight pairs collapsed to one entry; the pair that did
not was "bawa drone" against "menerbangkan drone", which is the synonym limit
[ADR-0016](docs/adr/0016-persistent-answer-cache.md) records.

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
  src/app.ts           The Hono app: routes and CORS, binds no port
  src/index.ts         Serverless entry (ADR-0018) - default-exports the app
  src/server.ts        Node entry - `npm run dev` / `start`, the dev container
  src/routes/          POST /api/chat, POST /api/vision, GET /api/route, GET /api/stats
  src/lib/             Gemini client, knowledge base, prompts, validation,
                       errors, caching, logging
  src/data/            rules.json - the knowledge base
  __tests__/           Vitest suites
  Dockerfile           Development container. How the school server runs the
                       backend is not recorded - see Deployment.

shared/              contract.ts - the API types both sides share (types only)
supabase/migrations/ The answer cache's schema. Apply before the code that
                     needs it - see Deployment.
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

**One school server, `103.139.192.14`, behind nginx.** All three subdomains
point at it. Deploys are performed by hand on that machine by the project
supervisor or the school's IT; merging to `main` publishes nothing on its own.

```
frontend/  ──▶  sasana.smkwikrama.sch.id      ┐
backend/   ──▶  sasana-api.smkwikrama.sch.id  ┘ 103.139.192.14, nginx
```

This section used to describe two Vercel projects and a Supabase database, and
that deployment was never carried out. What it costs to have found that out the
slow way, and the two things still not written down, are in
[ADR-0023](docs/adr/0023-production-is-one-school-server-behind-nginx.md).
`docker-compose.yml` is for laptops only and is not how that server runs.

`sasana-be.smkwikrama.sch.id` appears in older documents and is a dead name: it
resolves, and it serves nothing.

### How nginx must serve the frontend export

`out/` is a static export with **no server behind it**, so how nginx resolves a
path is the whole of the frontend's routing.

**What was running on 2026-09-10 resolved almost nothing.** Measured from
outside the machine that day:

| Request | Response |
| --- | --- |
| `/check` | `200`, 82122 bytes |
| `/about` | `200`, 82122 bytes |
| `/favicon.ico` | `200`, 82122 bytes |
| `/definitely-not-a-real-path-xyz123` | `200`, 82122 bytes |
| `/check.html` | `200`, 23054 bytes — the real page |

Four different paths returned a byte-identical document: `out/index.html`, the
landing page, under a `200`. Anything that was not a file on disk fell back to
it. So **every route except `/` was broken on reload, on a shared link, and on
anything arriving from search** — the visitor landed on the landing page while
the address bar still read `/check`, and the console carried React error #418,
because `Header` renders one tree for `/` and a different one everywhere else
and the two cannot be reconciled. Clicking back into the page did nothing: the
router already believed it was there. Navigating from the landing page worked,
which is why this survived — the client router never asks the server.

**The export no longer depends on that being fixed.** `trailingSlash: true` in
`next.config.mjs` makes the build write `out/check/index.html` rather than
`out/check.html`, and a directory with an `index.html` in it is something the
host already resolves — that is how it served the directory listings below. A
deploy of the current `out/` is enough to make the routes work again.

The block is still what the server should be, and two of its lines fix things
the export cannot reach:

```nginx
server {
    server_name sasana.smkwikrama.sch.id;
    root /path/to/out;                        # wherever the export is copied

    autoindex off;                            # was on — see below

    location / {
        try_files $uri $uri.html $uri/ =404;  # was a fallback to /index.html
    }

    error_page 404 /404.html;                 # out/404.html ships and is never served
}
```

Nothing in the app needs a catch-all. Every route is pre-rendered to its own
file, `/explore/[siteId]` included, so a path that matches nothing genuinely is
a 404 — and with the fallback gone it says so, instead of quietly serving the
landing page. `$uri.html` is belt and braces: it keeps a flat export working if
`trailingSlash` is ever turned back off.

`autoindex` was on: `/sites/`, `/explore/` and `/_next/` returned directory
listings, including files like `sites/README.md` that were never meant to be
served. That one no rebuild can fix, only the server.

**Not verified:** the directives above describe behaviour measured from outside,
not a config file anybody has read. Whoever performs this edit should write the
real `location` block and the real document root into this section, and correct
it if the running config reaches the same result another way.

Check the routes landed:

```bash
curl -sL https://sasana.smkwikrama.sch.id/check | grep -q heroBg.webp && echo BROKEN || echo OK
```

`heroBg.webp` belongs to the landing page and to nothing else, so finding it
under `/check` means the fallback is still answering.

### Every deploy

Merge to `main`, then **ask for the deploy**. It does not happen by itself.

The frontend is the exception in one direction only: `out/` is committed
(ADR-0019), so rebuilding and merging it is what publishes the site. The backend
has no equivalent, which is why the two can drift apart — a merged frontend
change and an unmerged-to-the-server backend change look, from the outside, like
a broken feature rather than a missing deploy.

Nothing else is needed for an ordinary backend change: no new dependencies, no
new environment variables, no migration. A change under `supabase/migrations/`
is the one exception, and it must be applied **before** the code that reads it
goes live.

### Checking a deploy landed

Run this from anywhere. It distinguishes old code from new by the response
alone, so the person who performs the deploy does not have to have read the
change:

```bash
curl -s -D - -X POST https://sasana-api.smkwikrama.sch.id/api/chat -H "content-type: application/json" -d '{"message":"apa yang harus saya siapkan sebelum masuk?","lang":"id","site":{"id":"pura-tirta-empul","name":"Pura Tirta Empul","ruleIds":["temple-attire"],"lat":-8.4156,"lng":115.3153},"proximity":{"state":"approach","distanceM":640,"accuracyM":25}}'
```

A situated question must never be served from the cache. `x-cache: HIT`, or an
answer that names no distance, means the running code predates
[#50](https://github.com/Daniyal-Creator/Sasana/pull/50).

### Secrets

`.env` files are never deployed and never committed — they are git-ignored and
local to your machine. Production values live on the server. `DATABASE_URL` and
`GEMINI_API_KEY` belong to the backend only; anything named `NEXT_PUBLIC_*` is
compiled into the browser bundle and is readable by every visitor, so nothing
secret may ever be given that name.

Do not run `docker compose config` on a machine that holds real values: it
prints every interpolated secret to the terminal.

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
