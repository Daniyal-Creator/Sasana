---
status: accepted
---

# A stylized SVG map instead of Leaflet and OpenStreetMap tiles

PRD §8 named **Leaflet + OpenStreetMap** as the map for Explore Mode, and the
architecture sketch in PRD §9 drew it the same way. The Explore UI does not use
them. It draws an inline `<svg>` with
a fixed projection over Bali, showing Zones as circles on an abstract surface.
A future reader looking for Leaflet in `package.json` will not find it, and this
records why.

## Decision

- `components/explore/ZoneMap.tsx` renders an inline SVG. Longitude `114.40` to
  `115.75` and latitude `-8.90` to `-8.05` map linearly onto the viewport box.
  No tiles, no map library, no network request.
- Land and water are painted with existing surface tokens; Zones are `circle`
  elements stroked in `--color-primary` with an alpha-only fill. Every value on
  the map traces to a token, so Guardrails C1/C2 hold on this screen like any
  other.
- Because a 400 m Zone on a 95 km box is sub-pixel, drawn radii are clamped to a
  minimum of 14px. The map is therefore **not to scale**, and the UI must say so
  in visible copy. Overstating precision on a screen about sacred boundaries is
  the failure mode this clause exists to prevent.
- The SVG is never the only carrier of information. Every Site, distance, and
  Custom shown on the map also appears as text in the list beneath it.

## Considered options

- **Leaflet + OSM raster tiles**, as specified. Rejected on three counts. The
  tiles carry a fixed palette (green landmass, pink and magenta POI markers)
  that cannot be tokenized and would occupy most of the screen, which is a
  direct C1/C2 breach with no available remedy. Leaflet touches `window` at
  import and needs a `dynamic(..., { ssr: false })` wrapper in the App Router,
  which is a common failure point. And tiles require a network round trip, which
  contradicts the rest of F3 running entirely offline against bundled data.
- **A vector basemap** (MapLibre with a styled tile source). Rejected as a much
  larger dependency for a screen that shows six circles and a dot.
- **No map at all**, list only. Rejected: the spatial relationship between the
  visitor and a Zone is the feature, and a list cannot show it.

## Consequences

- **PRD §8 and §9 were amended** to name the inline SVG and point here. The
  `tech-spec.md` never named a map library, so nothing there needed changing.
- No panning, no zooming, no streets, no wayfinding. The moment the product
  needs to answer "how do I get there", this decision is reversed and a real map
  library comes back. That is an acceptable reversal cost: `ZoneMap` is one
  component behind a narrow prop interface, and nothing else in Explore depends
  on how it draws.
- Adding a seventh Site outside the Bali bounding box silently places it off
  canvas. If the product ever leaves Bali, the projection bounds become data
  rather than a constant.
