# ADR-0021 — Routes come from OSRM, are labelled as driving, and fall back to a line that says so

**Status:** Accepted
**Date:** 2026-09-09
**Builds on:** [ADR-0020](0020-amenity-anchor-from-a-named-area.md), which made an
Amenity a place a visitor can choose, and [ADR-0019](0019-frontend-ships-as-a-static-export.md),
which is why the router is proxied.

## Context

A visitor can now be told that a guest house is 400 m from a temple and pick it
off the answer. Until this, that is where it stopped: a pin, and no way to get
there. The obvious next step is directions, and the obvious next step is where
the honesty problems are.

## Decision

**OSRM's public demo server, proxied through the backend.** No API key and no
billing account, which is what makes it affordable at a project budget of Rp 0
(`docs/tech-spec.md` §5). Proxied rather than called from the browser for the
same reason as `lib/places.ts`: the frontend ships as a static export, so
anything it holds is public, and the proxy is the one place a User-Agent stays
honest and a cache can later be hung.

**The route is called a driving route, everywhere, always.** Not a
presentational choice. Measured against the live demo server, Kuta to Tanah Lot:

```
driving: distance 22817.6 m, duration 1587 s
foot:    distance 22817.6 m, duration 1587 s
```

Identical to the decimal. The demo deployment carries the car profile and
answers every profile name with it, so a route offered as walking would be a car
route wearing the wrong word. The UI says "rute berkendara" and the wire format
carries `profile: "driving"` rather than implying it, so the label cannot drift
away from the thing it names.

**A line, and written steps. Not turn-by-turn.** Live navigation is a second
product inside the first: re-routing when the visitor leaves the line, a wake
lock, background position, and the responsibility that comes with telling
somebody to turn while they are driving. The static export has no service
worker to build any of that on.

**OSRM's maneuver vocabulary is narrowed by the server.** It returns a maneuver
type and a modifier, not a sentence, and its full vocabulary is larger than this
app needs and is not bilingual. The server reduces it to fourteen values the UI
can name in both languages; anything unrecognised becomes "carry on", because a
turn invented for a maneuver nobody mapped is worse than an instruction that
says nothing.

**No route is a 200, not an error.** The demo server is free, volunteer-run and
explicitly not for production; it will be unavailable sometimes. The client
draws the straight line between the two points instead, and **says that is what
it is**. The wording is fixed in `explore.route.straight` and a test asserts it
still contains "not a road route" in both languages.

That sentence is the feature, not a caveat attached to it. Tanah Lot to Ubud is
about 20 km direct and about 32 km by road. Unlabelled, the fallback is a lie
about how far away something is; labelled, it is a true statement about
direction and a floor on distance. **Anybody shortening it into "20 km away" has
removed the part that made it publishable.**

**One thing at a time.** Asking for a route turns "Lihat sekitar" off, and
turning "Lihat sekitar" on hides the route. They are two questions about the
same screen — what is around me, and how do I get to this one place — and the
map can only answer one.

## Why not a deep link to a map app

Handing the visitor to Google Maps or a `geo:` URL would give real turn-by-turn
for nothing, and was the recommendation put to the project owner. It was
declined, and the reason is worth recording: it ends the visit. SASANA's job is
not finished when somebody sets off, and a handoff means the app cannot say
anything about the place they arrive at.

## Consequences

- **A third third-party service is on the request path**, after Overpass and
  Nominatim, and it is the one with the weakest promise: the OSRM demo server
  asks not to be used for production traffic. If this ever carries real load it
  needs a different host, and the fallback is what makes that survivable rather
  than urgent.
- **Walking routes do not exist yet.** OpenRouteService has a real pedestrian
  profile and a free tier; the price is an API key in the backend environment.
  That is the move if the driving-only label starts costing more than the key
  would.
- **Route requests are not cached**, deliberately for now. A route between two
  fixed points is far more stable than a list of hotels — roads change over
  years — so caching is safe in a way ADR-0015 explicitly ruled out for places.
  It is left for `.scratch/amenity/` because optimising something that has never
  run is guessing at which part is slow.
- **The step list is cut at twelve.** A cross-island route returns nearly
  thirty, at which point it is a wall rather than directions, and the ones that
  matter are at the start.
- **A route request leaves a position on a third-party server.** OSRM is sent
  the point the visitor is standing at, which is a real change from the app's
  standing claim that position is read and checked on the device. It happens
  only when the visitor presses the button, and the `/explore` privacy copy is
  now the place that has to stay true about it.
- **Attribution widens again.** The roads under the line are OpenStreetMap's,
  so the ODbL credit covers the tiles, the Amenity, and now the route.
