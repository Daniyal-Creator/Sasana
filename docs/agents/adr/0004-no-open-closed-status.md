---
status: accepted
---

# Sites do not show an open or closed status

PRD FR3.3 requires the location card to show "general + location-specific rules,
source, **open/closed status**, and Odalan note". Explore ships without the
open/closed status. We have no source for opening hours that we could stand
behind, and a wrong one causes exactly the harm this product exists to prevent.

## Decision

- No Site displays opening hours, an open/closed badge, or anything derived from
  them. `Site` carries no hours field, so the UI cannot drift into showing one.
- The **Odalan notice stays**, driven by a hand-entered `odalanDates: string[]`
  on each Site and shown when a date falls within the next seven days. It is a
  dated notice about a known ceremony, not a live status claim.
- Odalan dates are **not** computed from the Balinese pawukon calendar. The
  210-day cycle is a real implementation with its own correctness risk, and
  getting it subtly wrong would produce confidently incorrect ceremony dates,
  which is worse than a short hand-maintained list.
- FR3.3 is narrowed by this ADR. The PRD text is not silently ignored; it is
  amended here.

## Why

Sacred sites are not shops. Access depends on ceremony, on the temple's own
calendar, and on the discretion of the people there on the day, and many of the
six sites have no published hours at all. Neither Circular No. 7/2025 nor
`rules.json` carries hours, so any value we shipped would be guessed, scraped
from a source we cannot verify, or inferred by a model.

Guardrails W6 says never invent a rule. The same reasoning applies harder here:
a visitor who reads "Open" on their phone, travels to Besakih during a closed
ceremony, and walks in anyway has been actively misled by an app whose entire
premise is preventing that. An absent status sends them to ask someone, which is
the correct behaviour regardless of what the app says.

## Consequences

- The Odalan list is hand-maintained and **will go stale**. An empty
  `odalanDates` array is the safe default and simply shows no notice; a wrong
  date is worse than none, so entries should be dropped when they cannot be
  confirmed rather than left to age.
- If open/closed is ever genuinely needed, the data has to come from site
  management or an official tourism source, with the date it was obtained
  recorded next to it. It must never come from a model, a maps listing, or a
  scrape.
