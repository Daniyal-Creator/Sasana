---
status: accepted
---

# Fictional Sites are shown when no real one is near

Explore cannot be seen working from outside Bali. The map opens on an empty
street, the nearest Site is a thousand kilometres away, and the whole point of
the feature — a circle you cross, a notice that arrives before you arrive —
never happens. So when the nearest real Site is more than 50 km away, Explore
places five Sites around the visitor that do not exist.

This is a deliberate exception to the rule that governs everything else in this
repository, and it is written down here so that the next person to open
`frontend/src/data/dummy-sites.ts` finds the reasoning rather than five invented
temples with no explanation.

## Decision

- **Five Dummy Sites** are built around the visitor's position, named
  `Pura Dummy 1` through `Pura Dummy 5`, with ids prefixed `dummy-`.
- **They appear only when the nearest real Site is more than 50 km away**
  (`DUMMY_THRESHOLD_M`). Nobody standing in Bali ever sees one.
- **The threshold is evaluated once**, on the first fix with
  `accuracy <= 200 m`, and the result is locked for the session. The layout is
  anchored to that same fix and frozen.
- **Only the location and the name are invented.** The Customs each dummy shows
  are real, carry real `ruleIds` into `backend/src/data/rules.json`, and are
  checked by `site-rules.test.ts` under exactly the same assertions as `SITES`.
- **`odalan` is always empty**, per ADR-0004.
- **`source` carries a disclaimer, never a citation.** It reads "Dummy site.
  This place is not real." and is rendered without the "Source:" prefix that
  real Sites get.
- **`SITES` is not touched.** Dummies live in their own module and are merged
  into one list in `explore/page.tsx` and nowhere else.
- **No detail route.** `/explore/[siteId]` reads `SITES` and calls `notFound()`
  for anything else, so `SiteBrief` hides its "see all customs" link for a
  dummy rather than offering a door to a 404.

## Why

The alternative is not "no fiction". It is a visitor outside Bali who opens
Explore, sees nothing, and concludes the feature is broken. The `?simulate=`
switch already covers demonstrating from a desk, but it fakes the visitor's
position, so it can never demonstrate the one thing that matters most: walking
across the Approach line on your own two feet and watching the notice arrive.

The rule this bends is "never invent a rule" (Guardrails W6, `AGENTS.md`). Read
precisely, that rule is about **claims made to a visitor about how to behave at
a sacred place**. A dummy makes no such claim that is not true: its Customs are
the sourced ones, generalised, and they hold at Balinese temples wherever the
visitor happens to be standing. What it invents is a pin on a map.

That is still an invention, and inventions of this kind are how an app starts
lying by degrees. So the line is drawn explicitly, at the narrowest place it can
be drawn, and it is defended by tests rather than by intention:

- the marking word lives inside the Site's own name, so it reaches the list row,
  the brief, the sheet header, the banner, and the map label without a badge
  component that could be forgotten on one of them;
- a test fails if any dummy name stops containing "Dummy";
- a test fails if a dummy's `source` ever comes to contain the words of a real
  citation;
- a test fails if a dummy Custom points at a rule that does not exist.

The 50 km threshold is where the real protection sits. At 5 km, a tourist
staying in Kuta would be handed five temples that do not exist, and that visitor
is precisely the person this product must not mislead. At 50 km the only person
who ever sees a dummy is a person who is not in Bali, for whom the alternative
was an empty map.

The layout is frozen because a dummy recomputed on every position update would
keep pace with the visitor: the distance would never close, the Approach would
never be crossed, and the feature would never fire. Everything about the
distances follows from wanting the first screen to be a map with markers on it
rather than a sheet covering half of one, and from wanting the nearest crossing
to stay a short walk.

## Consequences

- **A visitor outside Bali sees places on a real map that are not there.** The
  threshold decides who that is; the marking decides what they understand.
- **The evaluation is once per session.** Someone who opens the app in Bali and
  then travels will not be given dummies until they reload, and someone who
  walks a few streets keeps the dummies where they were placed. The "place them
  around me again" control is the way back from the second case.
- **Customs are generic.** A dummy cannot say anything specific to a place,
  because there is no place. Three Customs that hold everywhere is the honest
  ceiling.
- **The Site list grows to eleven rows** while dummies are active. The six real
  Sites stay, because a visitor outside Bali is exactly the audience for the
  "preview before you go" use in PRD §F3, and they sort to the bottom on
  distance without any grouping code.
- **A future backend that serves Sites must not serve these.** They are a
  frontend-only construct that exists because the frontend knows where the
  visitor is.

## Alternatives rejected

- **A manual switch (`?demo=1`).** Same value in front of judges, but it does
  nothing for the visitor who opens the app in Jakarta, sees an empty map, and
  never learns that anything was supposed to happen.
- **Real temples with their coordinates moved next to the visitor.** A real
  name, at a false position, under a real governor's circular and a shield
  icon. That is not dummy data; it is a false claim wearing a seal.
- **Plausible Balinese names** such as "Pura Segara Ayu". A name that sounds
  real almost certainly belongs to a temple that exists somewhere, and a
  visitor who searches for it finds one.
- **A badge component beside the name.** The word in the name reaches five
  rendering surfaces for free; a badge has to be remembered at each of them.
