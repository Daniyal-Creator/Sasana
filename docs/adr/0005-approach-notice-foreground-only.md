---
status: accepted
---

# Explore raises its notice at the Approach, in the foreground only

PRD FR3.1 asks Explore to detect entry into a defined zone. Screen A makes a
narrower promise in the visitor's own words: the customs arrive "while you are
still outside" the sacred place. The shipped code raised the notice on entering
the **Zone** — the circle where the Customs already apply — so the promise could
not be kept. By the time the sheet opened, the visitor had arrived, and someone
standing in the temple grounds reading the dress code has been told too late to
act on it.

This records the geometry, the reach, and the confidence rule that replace it.
The three are one decision: each of them trades reach for honesty, and reading
any one without the others makes it look like an arbitrary restriction.

## Decision

- **Two circles, two jobs.** `Zone` keeps its meaning from `CONTEXT.md` — the
  area where a Site's Customs apply, `radiusM` per Site, 250 m to 500 m.
  **Approach** is a new term for the wider circle whose crossing raises the
  notice: `radiusM + APPROACH_BUFFER_M`, where `APPROACH_BUFFER_M` is a global
  constant of 400 m, roughly five minutes on foot.
- **The notice fires once, at the Approach.** Entering the Zone afterwards
  raises nothing: the sheet is already open, and a second marker would interrupt
  a visitor whose attention has correctly moved from the phone to the place.
- **Leaving is measured from the Approach**, keeping the existing 100 m
  hysteresis. A Site can be announced again only once the reading passes
  `Approach + 100 m`.
- **Foreground only.** No service worker, no manifest, no Push, no Periodic
  Background Sync. The notice exists only while the page is open, and Screen A
  has to say so.
- **Entering and leaving both require confidence in the fix.** Enter when
  `distance + accuracy <= approach radius`; leave when
  `distance - accuracy > approach radius + 100`. Between the two the app shows a
  signal state rather than guessing.
- **Only `PERMISSION_DENIED` falls back to Explore Mode.**
  `POSITION_UNAVAILABLE` and `TIMEOUT` are transient and do not cancel the
  watch, so the watch stays alive and the signal state covers the gap.
- `CONTEXT.md` gains **Approach**. FR3.1 is narrowed by this ADR: entry is
  detected into the Approach, not the Zone. FR3.6 is unaffected — the position
  is still read on the device and still never stored.

## Considered options

- **Enlarge the Zone to about 800 m** and keep one circle. Rejected. `Zone` is
  defined in the glossary as the area where Customs apply, it is drawn on the
  map, and it is named in copy on three screens. Stretching it to serve the
  timing of a notification would make the glossary false everywhere else it is
  used, in exchange for saving one constant.
- **An `approachM` field per Site.** Rejected. Nothing available to us justifies
  why Besakih would be 900 m and Uluwatu 600 m, so the numbers would be guesses
  wearing the costume of data. This is the same reasoning ADR-0004 used to
  refuse opening hours, applied to a smaller number.
- **A PWA with Push, so the notice reaches a phone in a pocket.** Rejected, and
  this is the option we most wanted. Push requires a user-visible notification,
  a separate permission, and a server — which means the visitor's position has
  to leave the device and be matched against Sites somewhere else. Screen A
  states that location is checked on the device only and that SASANA never
  stores or shares where the visitor has been. Reach bought at the price of that
  sentence is not worth buying, in an app whose whole claim is that it can be
  trusted around sacred places. The cheaper background options do not rescue it
  either: Background Sync may only be requested while the app is open, and
  Periodic Background Sync ties its frequency to how much the user engages with
  the app, so a tourist who opens it twice may receive nothing at all.
- **Ignore `coords.accuracy`**, as the shipped code did. Rejected. A phone in a
  street reports accuracy between 300 m and 1500 m routinely, against Zones of
  250 m to 500 m. The notice would fire where it should not, and at a place
  where being wrong is the specific harm the product exists to prevent.
- **Refuse every reading above a fixed accuracy** and wait for a better one.
  Rejected: indoors it may never arrive, and the visitor is left watching a
  screen that has silently given up.

## Consequences

- **The notice fires late and clears late.** A visitor may read customs slightly
  before they apply, and may still see them shortly after leaving. That is the
  correct direction of error here: reading customs that no longer apply costs
  nothing, and missing them while they apply is the failure.
- **Screen A must state the foreground limit** in the same sentence that makes
  the promise. Without it the app claims a capability it does not have.
- **`ZoneMap` deliberately does not draw the Approach.** Zone radii are clamped
  to a minimum drawn size because a 400 m circle is sub-pixel at this scale
  (ADR-0003); Approach radii are large enough to escape that clamp. Drawing both
  would show a ratio that is an artefact of the clamp and that differs per Site,
  and readers take ratios on a map as information. The Approach is a moment, not
  a place; it belongs in the notice.
- **`hasExitedZone` is gone.** `isInsideZone` stays and now means only "Customs
  apply here". Nothing may reconnect it to the notice without revisiting this
  ADR.
- **`docs/geofencing-ui-prompt.md` §8 and §9.1 no longer describe the code.**
  That file is a task brief from 2026-08-13, not a maintained spec, so it is
  marked historical and pointed here rather than rewritten.
- **The foreground limit and the privacy sentence are one decision.** If the
  product ever needs to reach a visitor whose phone is in their pocket, this ADR
  is reversed and the promise on Screen A is renegotiated at the same time.
  Reversing one without the other is how an app quietly starts lying.
- The Approach buffer is one number in one place. Changing it is a one-line
  change and a test update, so the cost of finding out that 400 m is wrong in
  practice is low.
