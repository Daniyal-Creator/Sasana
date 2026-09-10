# ADR-0023 — Production is one school server behind nginx, not Vercel

**Status:** Accepted
**Date:** 2026-09-10
**Supersedes:** the hosting decision in
[ADR-0018](0018-deploy-to-vercel-answer-cache-to-postgres.md) — decision 1
("Both workspaces deploy to Vercel") and decision 4 (deleting
`docker-compose.prod.yml`). Decisions 2 and 3, which move the answer cache's
engine and keep SQLite for local work, are **not** touched here.

## Context

A backend change merged to `main` and did not reach visitors. Chasing that
turned up something larger: the deployment this repository describes is not the
deployment that is running.

Measured against the live hosts on 2026-09-10:

| Host | Resolves to | What answers |
| --- | --- | --- |
| `sasana.smkwikrama.sch.id` | `103.139.192.14` | the frontend |
| `sasana-api.smkwikrama.sch.id` | `103.139.192.14` | **the live backend**, `Server: nginx/1.26.2` |
| `sasana-be.smkwikrama.sch.id` | `103.139.192.14` | nothing — HTTPS fails outright, HTTP returns a bare 301 |

Three names, one machine. No `x-vercel-id` on any response, no `x-vercel-cache`,
and no `vercel.json` anywhere in the repository. Whatever is serving production,
it is not Vercel.

Two things follow, and the second is the expensive one:

- **The backend host named in `README.md` is the one that does not work.**
  `sasana-be` is documented; `sasana-api` is what `frontend/.env.production` has
  been pointing at, and it is the one that answers.
- **The only written description of the real topology was deleted for being
  obsolete.** ADR-0018's decision 4 removed `docker-compose.prod.yml` on the
  grounds that it "described a deployment nobody is going to perform" — a VPS,
  containers, nginx. That is a fair summary of what is running now. The document
  was not wrong; the plan that replaced it never happened.

So nobody could deploy the backend, because the instructions in the repository
describe a platform the project does not use, and the instructions that matched
reality were thrown away.

## Decision

**Write down what is actually there, and stop describing what is not.**

- **Production is one server, `103.139.192.14`, reached through nginx.** All
  three subdomains point at it.
- **`sasana-api.smkwikrama.sch.id` is the backend's address.** It is what the
  committed static export is built against (`frontend/.env.production`), and
  changing that value means a rebuild of `out/`, not a restart (ADR-0019).
- **`sasana-be.smkwikrama.sch.id` is a dead name.** Recorded so the next person
  who reads ADR-0018 does not spend an afternoon on it. Whether the DNS record
  should be removed is for whoever owns the zone.
- **A deploy is performed by hand on that server, by the project supervisor or
  the school's IT.** Merging to `main` publishes nothing on its own. `README.md`
  says so now, in the place that used to promise the opposite.

## What this ADR deliberately does not claim

The parts that could not be verified from outside the machine are left open
rather than guessed at, because a plausible-sounding infrastructure note is the
same failure as a plausible-sounding Custom:

- **How the backend is started and restarted there.** Containers, a process
  manager, or something else. `docker-compose.yml` in this repository is for
  laptops and says so; it is not evidence about that server.
- **Which answer-cache engine production uses.** `/api/stats` answers normally
  (27 entries, 34 hits, 38,334 tokens saved when checked) and reports
  `enabled: true`, but it does not say whether the rows are in Postgres or in a
  SQLite file, and both work. ADR-0018's decision 2 stands as the intent; this
  ADR does not certify it as the state.

Whoever performs the next deploy should write those two answers into
`README.md`. They are the only things still missing, and they are one deploy
away from being known.

## Consequences

- **A merge is not a release.** Anything time-critical needs the deploy
  requested explicitly, and there is a person in that loop.
- **The frontend and the backend can drift.** `out/` is committed and rebuilt on
  merge; the backend is not. The situated-answer work is exactly that: the card
  shipped in the export and the answer behind it did not, so the feature looked
  broken rather than absent.
- **A verification command belongs in the deploy request**, because the person
  running it is not the person who wrote the change. `README.md` carries one
  that distinguishes old code from new by its response alone.
- **ADR-0018's premise deserves re-reading before anybody tries Vercel again.**
  Its reasoning about function duration and the ephemeral filesystem is sound
  and is not withdrawn. What this ADR records is only that the move was never
  carried out.
