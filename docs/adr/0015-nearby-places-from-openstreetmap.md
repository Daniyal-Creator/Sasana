# ADR-0015 — Nearby places come from OpenStreetMap, never from the model

**Status:** Accepted
**Date:** 2026-09-06
**Extends:** [ADR-0014](0014-assistant-answer-tiers.md)

## Context

ADR-0014 closed off a class of fact rather than a topic: the assistant may say
what something means and what has happened, never what is happening, and it may
not recommend a business. Asking "adakah penginapan terdekat di sekitar Pura
Tanah Lot?" therefore returns a refusal.

The refusal is correct but the question is reasonable, and it is one visitors
actually ask. The obvious response — lift the fence for this case — does not
work, and the reason is not a matter of principle:

**The model has no map.** `gemini-3.5-flash-lite` has no network access and no
place data. Asked for a hotel with the fence removed, it produces a name that
sounds like a Bali hotel: sometimes one that closed, sometimes one that never
existed, always stated with the same confidence as a real one. Removing the
refusal does not give it the ability to answer. It only stops it admitting that
it cannot.

That failure compounds. The answer cache (PR-6) stores replies and serves them
to later visitors, so a hotel invented once is a hotel recommended for months.

## Decision

**A fifth tier, `places`, whose facts are read from OpenStreetMap at request
time.** The Overpass API is queried for named lodging or food within **3 km** of
the Site, and the **5 nearest** are put in the prompt. The model receives the
answer and writes the sentence; every name, category, and distance in its reply
came off the map.

- **Detection is a regex over the question, before Gemini is called.** Function
  calling would be tidier and would cost an extra round trip on every question.
- **`SiteContext` carries `lat`/`lng`.** These are values rather than ids to
  resolve, breaking the pattern the rest of that type follows, because there is
  nothing to resolve them against: the Site catalogue lives in the frontend
  bundle and a second copy in the backend would be a second copy to keep true.
- **No Site, no lookup.** A question about what is nearby with no place attached
  gets a refusal rather than a guess at the location as well as the answer. The
  frontend attaches a Site either from Explore or by recognising one the
  question names.
- **The server verifies the claim.** It knows whether it performed a lookup, so
  a model that returns `kind: "places"` without one is refused. This is the
  rare claim that can be checked outright rather than merely bounded.
- **Map answers are never cached.** Everything else the assistant says derives
  from a knowledge base that changes when somebody edits it. This describes the
  world, which changes on its own.
- **Attribution ships with the answer.** `source` carries "OpenStreetMap
  contributors", shown under a map pin rather than the shield used for the
  Circular, because the two do not carry the same weight.
- **The volatility fence still holds inside the tier.** The map records what is
  there. Prices, opening times, and whether a place is any good are not on it,
  and the prompt says so.

## Why OpenStreetMap rather than Google Places

Google Places and Gemini's own Google Maps grounding both return richer data.
Both also require a billing account, and the project budget is Rp 0
(`docs/tech-spec.md` §5). Overpass needs no key and no card.

There is a second reason that would apply even with a budget: Gemini's search
and maps grounding tends not to combine with `responseSchema` JSON output, which
is the backbone of every route in this backend. Adopting it would mean a second,
differently-shaped code path for one tier.

## Consequences

- **A third-party service is now on the request path.** Overpass is free,
  volunteer-run, and promises nothing. Failure returns an empty list rather than
  an error, so a busy server in Germany costs the visitor an answer, never an
  error card, and the app behaves exactly as it did before this tier existed.
- **Latency rises for these questions only.** One HTTP round trip before the
  Gemini call, capped at 12 s.
- **OSM coverage is uneven and not ours to fix.** A small warung nobody has
  mapped is invisible, and a place that closed stays until a mapper removes it.
  The honest framing, which the prompt enforces, is that this reports what the
  map records rather than what is definitely open.
- **A residual gap stays open.** The model is told to use only the supplied
  list, but nothing checks its sentences against that list; a sixth invented
  name would pass. Name-matching the reply was considered and rejected as too
  brittle - the model legitimately reformats and abbreviates names. The list is
  short and the instruction is explicit, and this is recorded rather than
  solved.
- **Attribution is now an obligation, not a nicety.** OSM data is ODbL-licensed.
  The credit is part of the answer and must not be dropped by a future UI change.
