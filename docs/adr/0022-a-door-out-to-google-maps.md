# ADR-0022 — A door out to Google Maps, beside SASANA's own route rather than instead of it

**Status:** Accepted
**Date:** 2026-09-09
**Revisits:** the "Why not a deep link to a map app" section of
[ADR-0021](0021-driving-routes-from-osrm-with-a-labelled-fallback.md). That
section is not overturned; it answered a different question.

## Context

ADR-0021 considered handing the visitor to Google Maps **instead of** drawing a
route, and declined: a handoff ends the visit, and SASANA's job is not finished
when somebody sets off. That reasoning stands.

What it did not settle is whether the door should exist **as well**. Two things
since have made the case:

- **The router is a free demo server** that is explicitly not for production. A
  straight line with an honest label is better than a wrong distance, but it is
  still a visitor standing at a temple gate with no way to get anywhere.
- **The route is always a car route.** Somebody on foot, or on a scooter in
  traffic, is being handed a line that answers a question they did not ask.

## Decision

**The door is on the panel in every state.** Secondary beside a route that
worked, and the first thing offered in the two states where SASANA has nothing
better: no position to route from, and no road route available.

The destination and `travelmode=driving` always ride in the URL. The origin
rides only when there is a fix; without one, Google starts from wherever the
visitor's own device says they are, which is a better failure than no route.

**It is named, not described.** The button says "Buka di Google Maps" rather
than "open in a map app", because a visitor about to leave the site is owed the
name of where they are going.

## Consequences

- **Some visitors will leave and not come back**, which is exactly what ADR-0021
  was protecting against. The trade is deliberate: an app that cannot get you
  anywhere is a worse outcome than an app you left.
- **The visitor's position reaches Google** when they press it with a fix
  available. Same shape as the OSRM call, on an explicit press, and covered by
  the wording already narrowed in `explore.permission.privacy`.
- **A second route is now reachable for the same journey**, and the two will not
  agree on distance or time. That is honest rather than confusing: one is a demo
  server with no traffic data and the other has live traffic, and the panel says
  which is which.
