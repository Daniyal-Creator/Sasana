---
status: accepted
---

# Technical feature labels on landing page action doors

Guardrails §9 W2 and `CONTEXT.md` explicitly avoid generic technology labels
like "AI", "Chatbot", and "Geofence" in visitor-facing copy, preferring domain
terms like "Situation Check", "Assistant", and "Explore". For the landing hero
action bar, the owner decided to present technical category overlines ("AI
VISION", "CHATBOT", "GEOFENCE") above the specific feature titles ("Check
Situation", "Tanya Asisten", "Jelajahi Lokasi") to provide clear affordances
for visitors scanning the three capabilities.

## Decision

- The landing page (`/`) hero action bar shows three segmented action items with
  category badges/overlines:
  1. `AI VISION` / `Check Situation`
  2. `CHATBOT` / `Tanya Asisten` (or `Ask Assistant` in English)
  3. `GEOFENCE` / `Jelajahi Lokasi` (or `Explore Locations` in English)
- **Scope is strictly limited to the landing page hero action bar.** Tool pages
  (`/check`, `/assistant`, `/explore`), system prompts, internal components, and
  documentation continue to adhere to the domain vocabulary in `CONTEXT.md`.

## Considered options

- Use pure domain vocabulary (`SITUATION CHECK`, `ASSISTANT`, `EXPLORE`) without
  technology terms (rejected by owner in favor of clear technology-type labels).
- Full adoption of technology terms across all app pages (rejected to maintain
  cultural respect focus across tool interfaces).

## Consequences

- Exception to Guardrails §9 W2 recorded for landing action bar category labels.
- `CONTEXT.md` updated to note the landing page badge exception.
