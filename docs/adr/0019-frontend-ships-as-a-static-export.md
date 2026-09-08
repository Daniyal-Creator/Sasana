# ADR-0019 — The frontend ships as a static export, and the export is committed

**Status:** Accepted
**Date:** 2026-09-08
**Amends:** the frontend half of [ADR-0018](0018-deploy-to-vercel-answer-cache-to-postgres.md).
Its backend decisions — Hono on Vercel, the cache on Supabase Postgres, SQLite
for local development — are untouched.
**Settles:** what "push the build to GitHub" means for a Next.js app, a request
that had no correct answer until the two candidate meanings were measured

## Context

The project supervisor asked for the frontend's build output to be pushed to the
repository, and specifically for its HTML. The request was reasonable and the
repository could not satisfy it, for a reason worth writing down: **`npm run
build` did not produce a folder anybody could read.**

It produced `.next/`, and `.next/` is not the site. Measured on a clean build,
with no accumulated cache:

| Path | Size | Served to a visitor? |
| --- | --- | --- |
| `.next/cache/` | 101 MB | No — compiler cache |
| `.next/server/` | 1.7 MB | No — server bundles |
| `.next/static/` | 1.7 MB | Yes |
| `frontend/public/` | 2.0 MB | Yes — images |

Two things follow. The first is that the 105 MB is 96% compiler cache, which
answers the supervisor's own guess that the size came from the images: it did
not, and the images are 2 MB. The second is that the HTML did exist —
`.next/server/app/index.html` and six siblings — but opening one shows an
unstyled page, because those files reference their CSS and JS by absolute path
and only mean anything when a Next.js server is serving them.

So committing `.next/` would have pushed 105 MB to make seven unreadable files
available. The request was not wrong; the build was answering a different
question.

### What was actually being asked for

A folder of the built site: HTML you can open, with the CSS, JS and images those
pages need, small enough to belong in a repository. Next.js produces exactly
that under `output: "export"`, and the project turned out to already qualify for
it — every route reports `○ (Static)`, there are no route handlers under
`frontend/src/app/`, and there is no middleware. Nothing had to be given up to
enable it, because nothing was using what it takes away.

Measured:

| | `.next/` | `out/` |
| --- | --- | --- |
| Size | 105 MB | **3.9 MB** |
| Files | thousands | 66 |
| HTML openable on its own | No | Yes |

`out/index.html` is 84 KB of rendered markup — 83,252 characters, carrying
`<title>SASANA</title>` and the page's real content, not an empty shell waiting
for JavaScript. That distinction is the one the supervisor was probing with
"ada html hasil buildnya kan? apa js aja?", and it is worth being able to answer
with a file rather than an assurance.

### Why the export is committed rather than built on demand

Committing build output is normally a mistake, and the objection is the honest
one: generated files in version control go stale, and they churn the diff.

Staleness is real and is named in the consequences below. Churn turned out to be
fixable. Next.js generates a random build id per run and stamps it into a
directory name and into every page's HTML, so two builds of identical code
differed in 15 files. Pinning `generateBuildId` removes it entirely: two
consecutive clean builds now produce byte-identical output, verified by
comparing SHA-256 of all 66 files. Nothing rests on that id being unique —
every chunk filename already carries a content hash, so changed code still lands
on a new URL.

What committing buys is that the built site is legible to someone who has no
Node installed and no CI access, which is the actual situation of the person who
asked.

## Decision

**1. `frontend/next.config.mjs` sets `output: "export"`.** `npm run build` writes
a self-contained `out/`.

**2. `images.unoptimized` is set.** A static export has no server to resize an
image on request. Setting it makes `next/image` fail at build time rather than
at run time, which is the cheaper moment to learn about it.

**3. `generateBuildId` is pinned to a constant.** The export is committed, so it
has to be reproducible. See above for why nothing depends on the id varying.

**4. `frontend/out/` is removed from `.gitignore` and committed.** `.next/`
stays ignored.

**5. `frontend/.env.production` is committed, carrying `NEXT_PUBLIC_API_URL`.**
Reproducibility is not only about the build id. That variable is inlined at
build time, so left to each person's shell it would make two people building the
same commit produce two different sites — and both would commit the difference.
The file holds no secret: it is the public address of an API whose whole job is
to be called from a browser. An override belongs in
`frontend/.env.production.local`, which stays ignored.

**6. The backend keeps everything ADR-0018 gave it.** This ADR changes how the
frontend is built, not where the API lives.

## Consequences

**The frontend can never gain a server-side feature without revisiting this.**
No API routes under `frontend/src/app/`, no server actions, no SSR, no ISR,
no middleware. None of these are in use today, which is what made the decision
free — but the door is now shut, and reopening it means editing this ADR rather
than adding a file and being surprised when the build fails.

**CORS becomes load-bearing.** The exported site is a pure browser client, so
every call to the API crosses an origin and the backend's `ALLOWED_ORIGINS` is
the only thing that lets it through. This is not hypothetical: at the time of
writing, the deployed backend at `sasana-api.smkwikrama.sch.id` answers a
request carrying `Origin: http://localhost:3000` with an
`access-control-allow-origin` header and answers the frontend's own deployed
origin without one — so the assistant and the photo check would fail in the
browser while the backend itself stayed perfectly healthy. **Whoever deploys the
frontend must add its origin to `ALLOWED_ORIGINS` and restart the backend.**

**`NEXT_PUBLIC_API_URL` is a build-time input, not a runtime one.** It is inlined
into the JavaScript, so it has to be set wherever the build runs. Building
against the wrong value produces a site that looks fine and talks to nothing.

**The committed export goes stale on its own.** Nothing forces `out/` to match
`frontend/src/`. A change merged without a rebuild leaves the repository holding
a site that no longer matches its source, and git will not complain. Refreshing
it is a manual step in any pull request that changes the frontend, and a CI job
that rebuilds and fails on a dirty `out/` is the obvious next improvement — it is
deliberately not in this ADR, which is already changing enough.

**The export step has been seen to under-produce.** On the first run of this
work, `out/` came out holding the assets and `404.html` but none of the page
HTML, while the build reported success. A clean rerun after deleting `.next` and
`out` produced all 66 files, and every run since has been correct. The cause was
not identified — a file lock on Windows is the suspicion, not a finding. Anyone
who sees a short `out/` should delete both directories and build again rather
than conclude the configuration is wrong.

**What did not change: the deployment target is still open.** A static export
serves from Vercel exactly as it did before, and also from any plain web server,
which is what the school's own host wants. This ADR does not pick between them.
