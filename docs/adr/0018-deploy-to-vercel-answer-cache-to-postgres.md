# ADR-0018 — The app deploys to Vercel, and the answer cache moves to Supabase Postgres

**Status:** Accepted
**Date:** 2026-09-07
**Supersedes:** the storage half of [ADR-0016](0016-persistent-answer-cache.md). Its
invalidation strategy, its schema and its reasoning all stand; only the engine
underneath changes, and only in production.
**Settles:** the three-way contradiction between `docs/tech-spec.md` §2,
the Deployment section of `README.md`, and `docker-compose.prod.yml`

## Context

Three documents in this repository described three different deployments, and
all three were written as though they were the plan:

| Document | What it says |
| --- | --- |
| `tech-spec.md` §2 | Everything on Vercel. No standalone server, no database. |
| `README.md` § Deployment | Vercel for the frontend, a container anywhere for the backend. "No host is chosen yet." |
| `docker-compose.prod.yml` | Both services as containers on a school VPS, behind nginx. |

Nobody had decided; each document simply recorded what was true when it was
written. A fourth option then arrived from the project supervisor: frontend on
Vercel under a school subdomain, Supabase for the database. This ADR picks one
and writes down what the choice costs.

### The objection that had to be answered first

The backend has already been on Vercel once, and it was moved off for a reason
that is recorded in `src/lib/env.ts`:

> A single 9s cap used to serve both. That number was chosen to stay under
> Vercel's serverless function ceiling — a constraint that disappeared when the
> backend became its own container — and it rejected roughly a fifth of vision
> calls that would otherwise have succeeded.

Returning to Vercel therefore looked like walking back into a bug the project
had already paid to fix. It is not, and the reason is that the platform moved:
**Vercel's Hobby plan now allows a maximum function duration of 300 seconds**
(verified against Vercel's function limits documentation, 2026-09-07). Vision is
capped at 30s by `GEMINI_VISION_TIMEOUT_MS` and its slowest measured run was
16.9s. The ceiling that forced the 9s cap is an order of magnitude away from
binding on us now.

This is the only reason the decision below is available at all. If that limit
ever falls back, this ADR is the first thing to re-read.

### The one thing Vercel genuinely cannot provide

A disk that survives. `AnswerCache` writes a SQLite file and depends on finding
it again on the next request. On Vercel the filesystem is ephemeral: the file is
gone between invocations and is not shared between concurrent instances.

The failure mode matters more than the fact. `node:sqlite` exists on the Node
version Vercel runs, so nothing throws. The cache would simply be empty on every
request — every question a miss, every answer paid for again, and `/api/stats`
reporting a saving of approximately zero. It fails silently, which is precisely
the shape of failure ADR-0016 was written to end.

So the cache cannot come to Vercel unchanged. That is what makes Supabase part
of this decision rather than a separate one: it is not a new feature wanting a
database, it is the existing cache needing somewhere to live.

## Decision

**1. Both workspaces deploy to Vercel, as two projects from this one repository.**
`frontend/` and `backend/` each get their own Vercel project with its own Root
Directory, so the repository layout and the area ownership in `README.md` are
untouched. Hono is supported on Vercel directly — the app is a default export —
so no route handler is rewritten.

**2. The answer cache keeps everything except its engine.** Same key, same
`kb_hash` invalidation, same eviction, same counters, same privacy property.
Rows move from a SQLite file to a Postgres table.

**3. SQLite stays, for local development and for the test suite.** The two
implementations sit behind one interface and `answer-cache.ts` picks between
them on whether `DATABASE_URL` is set. This is deliberate and worth the extra
file: `npm run dev` and `npm run test:run` keep working with no Supabase
account, no network, and no credentials, exactly as they do today. A contributor
working on the landing page should never need a database to run the suite.

**4. `docker-compose.prod.yml` is deleted.** It described a deployment nobody is
going to perform. `docker-compose.yml` — the development compose — stays exactly
as it is; it runs on contributors' laptops and has nothing to do with this.

## Consequences

**A cache read now costs a network round trip.** Roughly 50–100ms against the
~0ms of a local file. Set against what a miss costs — a Gemini chat call,
measured at 1.2–1.4s — a hit is still more than an order of magnitude cheaper,
and **the token saving, which is the number ADR-0016 exists to produce, does not
change at all.** `/api/stats` measures tokens, not milliseconds.

**The cache interface becomes asynchronous.** Postgres cannot be read
synchronously, so `get`, `set`, `stats` and `clear` return promises and their
call sites in `routes/chat.ts` and `routes/stats.ts` await them. This is a
mechanical change and the tests move with it.

**A deploy is now two steps, and their order matters.** The migration in
`supabase/migrations/` has to be applied before code that reads the new table
goes live. Applied backwards, the first request to `/api/chat` finds no table.

**The free tier pauses.** A Supabase project with no activity for about a week
is paused and must be resumed by hand. This is named here rather than discovered
on the morning of a demonstration: somebody should touch the project in the days
before one.

**What did not change: no visitor content is stored.** The store holds the
normalised key — content words, sorted — never the sentence anybody typed, and
`backend-spec.md` §8.6 stays true. Moving rows to a hosted database does not
weaken that, because the rows were already scrubbed before they were written.
Nothing in this ADR authorises storing anything new.
