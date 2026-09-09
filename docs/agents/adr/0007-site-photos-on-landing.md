---
status: accepted
---

# Allow real photographs of Sites on the landing page

ADR-0001 carves out a single hero photograph on the landing page, scoped to "one
real photograph of Bali, chosen by the project owner." The Site showcase section
added below the hero needs a photograph for each of the six Sites in
`frontend/src/data/sites.ts`.

## Decision

- Each Site card on the landing page may show **one real photograph** of that
  Site, chosen by the project owner.
- The same restrictions from ADR-0001 and guardrail I4 apply to every photo:
  - Must be a real photograph, never AI-generated.
  - Must not depict people in a way that could identify them without consent.
  - The project owner records where each photo came from.
- Until photos are sourced, the cards show no image — the layout works with name,
  region, area description, and customs count alone.
- **L8 is narrowed, not removed.** Decorative stock photography remains banned
  everywhere else. This exception is scoped to the landing Site showcase only.

## Why

The Site cards give visitors a sense of the real places they will visit. A text-
only list of six names is harder to scan and less useful than a list that shows
the place. The same reasoning that justified the hero photo (visitors benefit
from seeing the real place) applies here.

## Guardrails broken

| Rule | Clause | Scope of exception |
|---|---|---|
| L8 | "No decorative stock photography of temples" | Landing `/` Site showcase cards only; one photo per Site, real only |

## Consequences

- Six photographs need to be sourced and placed in `public/sites/`. Until then
  the cards render without images.
- If a photo's provenance cannot be confirmed, it must not ship.
