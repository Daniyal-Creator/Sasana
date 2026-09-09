# ADR-0020 — The place search anchors on a named area, not only on a Site

**Status:** Accepted
**Date:** 2026-09-09
**Supersedes:** the "No Site, no lookup" decision in [ADR-0015](0015-nearby-places-from-openstreetmap.md).
Every other decision in that ADR stands: the Overpass source, the 3 km radius,
the five results, the refusal to cache, the attribution, and the volatility
fence inside the tier.

## Context

ADR-0015 gave the assistant real place data and one hard limit on it:

> **No Site, no lookup.** A question about what is nearby with no place attached
> gets a refusal rather than a guess at the location as well as the answer.

The reasoning was sound and is not in dispute. A model with no map produces
hotel names that sound right, and answering from a guessed location would have
been the same failure wearing a different hat.

But the Site catalogue holds six temples. "Adakah penginapan dekat Ubud" is a
question a visitor actually types, from a visitor who is not standing at any of
the six, and the app refused it. The limit was doing two jobs at once: stopping
a guessed location, and restricting the feature to six places. Only the first
was ever the point.

## Decision

**An area named in the question is geocoded, and that becomes the anchor.**
The Site stays as the fallback, and a refusal stays as the floor.

The order is: an area named in the question, then the Site attached to the
request, then a refusal that asks the visitor to name one. A named area
outranks the Site because naming one is the more deliberate act — somebody
standing at Tanah Lot who asks about Ubud is asking about Ubud.

**What replaces the guarantee "No Site" was carrying** is three conditions in
series rather than one:

1. **The area has to be named**, and found by a regex over the question rather
   than by the model. Function calling would be tidier and would cost a round
   trip on every question, which is the same trade ADR-0015 made for
   `detectPlaceQuery` and for the same reason.
2. **It has to resolve inside Bali.** Nominatim is called with `bounded=1` over
   a Bali viewbox.
3. **What it resolves to has to be an area.** Only `city`, `town`, `village`,
   `suburb`, `island`, and `county` are accepted.

**Condition 3 is not redundant, and that is the part worth recording.** Asked
for `Bogor` bounded to Bali, Nominatim does not return nothing. It returns a
road in Bali named Bogor, `addresstype: road`, importance 0.053. Without the
allow-list, a visitor asking about a city in West Java would have been answered
with hotels around a lane in Denpasar, with nothing on screen suggesting
anything had gone wrong. A bounding box keeps the answer inside Bali; it does
not keep it about a place.

**An `importance` threshold was considered and rejected as the primary filter.**
It is a number with no natural cut: set high enough to exclude that road, it
also excludes small villages that are perfectly real places to look for a
guest house.

**The resolved name reaches the visitor.** The prompt carries Nominatim's own
`display_name` and instructs the answer to say which area was searched. A
geocoder landing on the wrong place is not rare enough to leave silent, and the
visitor is the only party who knows which town they meant.

**Bali remains the whole map.** The knowledge base is Bali Governor Circular
No. 7 of 2025 and nothing else. A search that reached Java would name real
hotels in a place whose customs the app does not hold, which reads as coverage
it does not have.

**A refusal that asks a question.** When nothing anchors the search, the visitor
reads a request for the area with an example to copy, not the standard "what I
can help with" menu. Volatility still outranks it: a question asking a price
gets the price refusal whether or not it named an area, because the class of
fact is settled and where they are is not the reason it cannot be answered.

## Consequences

- **A second third-party service is on the request path.** Nominatim is free,
  volunteer-run, and promises nothing, so a failure returns null and the search
  falls back exactly as if no area had been named.
- **Two HTTP round trips now, for these questions only.** Geocode, then
  Overpass.
- **The regex will miss.** "Penginapan di daerah yang sejuk" names no place and
  will not be made to. A miss falls back to the Site and then to the refusal,
  so the failure mode is being asked where, never being answered about
  somewhere else.
- **The allow-list will reject some real places.** A hamlet that OpenStreetMap
  has not given an administrative type is invisible to it. That is the same
  trade ADR-0015 accepted for uneven Overpass coverage, arrived at from the
  other side.
- **Naming a temple does not anchor a search.** "Penginapan dekat Pura Tanah
  Lot" resolves to something that is not in the allow-list, so it falls back to
  the Site, and refuses when there is none. The alternative — accepting
  attractions and buildings — is what lets a lane back in.
- **ADR-0015's residual gap is unchanged.** Nothing checks the model's sentences
  against the supplied list, so a sixth invented name would still pass. Recorded
  again rather than solved again.
