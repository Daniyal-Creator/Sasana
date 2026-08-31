# Working in this repository

Instructions for any coding agent working here, whichever tool it runs in.
`CLAUDE.md` points at this file, so there is one copy to keep true rather than
several that drift.

## Hard rules

Five rules that hold for every change, whatever you were asked to do. They are
copied here rather than linked because they are the ones most expensive to
discover late; the full version, with the reasoning, is the **Working together**
section of [`README.md`](README.md).

1. **Never push to `main`.** Every change goes through a pull request, for
   everybody. GitHub enforces this — a direct push is rejected outright — so an
   attempt costs you a round trip rather than a mistake.
2. **Branch as `<area>/<slug>`**, from an up-to-date `main`: `geofencing/`,
   `vision/`, `landing/`. One branch per finished piece, alive for days rather
   than weeks. Merge as soon as a piece is done, not when the area is.
3. **`git merge main`, never `git rebase`**, and never force-push. The history
   comes out untidier and nobody can erase work that has not been pushed yet.
4. **Do not touch a file another area owns.** `shared/contract.ts` belongs to AI
   vision; `frontend/tailwind.config.ts` to geofencing. `globals.css` and
   `package.json` take additions only — never a global CSS selector, never a
   version bump on somebody else's dependency. A `package-lock.json` conflict is
   resolved by taking `main`'s copy and running `npm install`, never by hand.
   If the work seems to need a file you do not own, say so instead of editing it.
5. **Be green before opening the pull request**: `npm run typecheck` and
   `npm run test:run` in each workspace you touched. CI runs exactly these, so a
   red run here is a red run there.

## UI work

Any change under `frontend/src/app/**`, `frontend/src/components/**`,
`frontend/src/app/globals.css`, or `frontend/tailwind.config.ts` must follow
[`docs/design-guardrails.md`](docs/design-guardrails.md) — a binding list of
banned patterns covering gradients, color, type, depth, layout, motion, and
copy — alongside [`docs/ui-spec.md`](docs/ui-spec.md).

The law people break most often: **a gradient may vary alpha, never hue.**

Breaking a guardrail is allowed, but only in the open: it takes an ADR in
[`docs/adr/`](docs/adr) saying which clause is being broken and why. Silently
breaking one gets the work sent back.

**One scoped exception is live.** `/explore` runs a third-party raster basemap
that fills the screen and carries a palette no token can reach, so the visual
rules are suspended there. The scope, and the rules that stay in force inside it
anyway, are written as a named carve-out in
[§11 of the guardrails](docs/design-guardrails.md#11-exception-process). Nothing
outside `frontend/src/app/explore/**` and `frontend/src/components/explore/**`
is covered by it.

## Vocabulary

[`CONTEXT.md`](CONTEXT.md) is the glossary that the product, the copy, and the
code all share. It lists the word to use and the words people reach for by
reflex that are wrong here — Site not temple, Zone not geofence, Custom not
rule. Use its words in identifiers and in anything a visitor reads. If a term
you need is missing, add it there rather than inventing one locally.

## Never invent a rule

This app tells visitors how to behave at sacred places. A guideline that is
plausible but unsourced is worse than no guideline, because a visitor acts on
it. Every Custom shown to a visitor traces to a Rule in
`backend/src/data/rules.json`, and a test enforces that the link exists. The
same standard applies to opening hours, ceremony dates, and anything else the
app might assert — see [`docs/adr/0004-no-open-closed-status.md`](docs/adr/0004-no-open-closed-status.md)
for what this costs in practice and why it is worth paying.

## Issue tracker

Issues and specs are tracked as markdown files under `.scratch/`. See
[`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md).

Most of `.scratch/` is local working notes. An effort worked by more than one
person is committed so everyone can read it, and only its markdown ships. Before
you touch code, read the **Working together** section of
[`README.md`](README.md) first: it covers who owns which area, branch naming,
when to merge, and the rules for the files more than one area touches.

## Triage labels

Five canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`,
`ready-for-human`, `wontfix`. See
[`docs/agents/triage-labels.md`](docs/agents/triage-labels.md).

## Domain docs

Single-context layout: one `CONTEXT.md` plus `docs/adr/` at the repository
root. See [`docs/agents/domain.md`](docs/agents/domain.md).
