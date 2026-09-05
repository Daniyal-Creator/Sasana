---
status: accepted
---

# Abstract geometric decorative patterns on the assistant page

## Context

The `/assistant` page redesign (see `docs/sasana-chatbot-redesign.md`) calls for
background decoration to replace a large empty canvas. The redesign proposes
three decorative elements: a Balinese geometric repeat pattern, a mandala form,
and a pura (temple) silhouette.

Design guardrails L8 bans "decorative stock photography of temples or tourists"
and states that "outside the landing hero, the only image on screen is the
user's own photo." I4 bans "AI-generated imagery of Balinese people, ceremonies,
or temples."

## Decision

Allow **two** abstract geometric decorative elements on the `/assistant` page
only:

1. A repeating geometric SVG pattern (interlocking curves / angular motifs) used
   as a CSS `background-image`, positioned bottom-left, at opacity **≤ 0.08**.
2. An abstract radial mandala form (concentric geometric shapes), positioned
   top-right, at opacity **≤ 0.08**.

Both are purely geometric and mathematical. Neither depicts a temple, a person,
a ceremony, nor any figurative cultural subject. They are closer to a CSS border
texture than to an illustration.

The **pura silhouette** proposed in the redesign doc is excluded. It is a
recognizable depiction of a sacred building, which falls squarely within L8's
protective intent.

## Scope

- `/assistant` page background only.
- Two SVG elements, both at opacity ≤ 0.08, both `pointer-events: none`.
- No pura silhouettes, no figurative depictions, no photographic elements.
- If either asset is replaced, the replacement must remain purely abstract
  geometric.

## Alternatives considered

1. **No decoration at all** (use structural solutions: surface steps, hairlines,
   shadows). Rejected because the sidebar and topic cards alone do not
   sufficiently fill the visual void on wide desktop screens.
2. **All three elements including pura silhouette.** Rejected because a
   recognizable temple silhouette, even as line-art, weakens the L8 argument.

## Guardrail clauses affected

- **L8** (design-guardrails §6): scoped carve-out for abstract geometric SVG at
  ≤ 8% opacity on `/assistant`. The ban on decorative stock photography and
  figurative cultural imagery remains in full force.
- **I4** (design-guardrails §8): not affected. Neither asset depicts Balinese
  people, ceremonies, or temples.
