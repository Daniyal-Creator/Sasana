# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Foreign tourist (primary):** Standing in bright tropical sunlight at a temple gate, phone held at arm's length, on mobile data, reading little or no Indonesian. First visit to the site or to Bali. The job to be done is *tell me what is expected of me here before I take another step*. The moment is time-boxed and mildly anxious.
- **Local guide or tour operator (secondary):** Wants guests to behave respectfully and can recommend the app to visitors without friction or embarrassment.
- **Competition judge (load-bearing):** Bali AI Tech Fest 2026 judges evaluating remotely from a desk. Explore Mode provides a simulated geofenced tour so the location-aware experience can be fully evaluated without physical presence in Bali.

## Product Purpose

Prevent violations of Balinese custom (*adat*) caused by ignorance rather than malice, before they happen rather than after. SASANA provides three clear doors into the same core mission:
1. **Situation Check (`/check`):** Vision-based attire and etiquette check from a camera photo.
2. **Adat Assistant (`/assistant`):** Bilingual Q&A grounded strictly in official rules.
3. **Explore Mode (`/explore`):** Interactive map and geofenced zone notifications for sacred sites.

Success means accurate guidance delivered in seconds, bilingual accessibility (ID/EN), verifiable rule lineage, and seamless mobile outdoor usability.

## Positioning

The only real-time cultural etiquette companion for Bali sacred sites that guarantees zero invented advice: every guideline traces directly to official regional circulars and authoritative adat sources. SASANA acts as a calm, knowledgeable local friend rather than a punitive authority or a generic tourism brochure.

## Operating Context

- **Physical Environment:** Direct tropical sunlight outdoors at temple gates and sacred grounds; high glare, noisy surroundings, intermittent mobile data connectivity.
- **Emotional State:** Mild anxiety and uncertainty from tourists wanting to be respectful while navigating unfamiliar cultural protocols.
- **Evaluation Environment:** Desktop/laptop evaluation by hackathon judges using simulated GPS coordinates and demo scenarios.

## Capabilities and Constraints

- **Hard Rule — Never Invent a Rule:** Every custom, rule, opening hour, or ritual restriction displayed must trace back to a verified record in `backend/src/data/rules.json` (grounded in Circular No. 7 / 2025). Plausible but unverified statements are strictly banned.
- **Bilingual Interface:** Full English and Indonesian localization with dynamic `<html lang>` sync and clear, simple language.
- **No Synthetic Cultural Imagery:** Prohibited from using AI-generated imagery or stock photos of Balinese people, ceremonies, or sacred sites. Only verified authentic assets and user-uploaded photos are permitted.
- **Strict Color & Gradient Rules:** Solid token-driven palette (*paras* stone, *segara* indigo, *prada* gold). Gradients may vary alpha, never hue.

## Brand Commitments

- **Voice:** Warm, grounded, exact. Leads with the fix rather than the fault; assumes good intent and lowers user anxiety.
- **Identity & Tokens:** Authentic sacred symbolism (paras stone sandstone `#F6F1E9`, segara indigo `#1D4E89`, prada gold `#B8862B`, status semantics). No emoji in product UI.
- **Provenance Transparency:** The system explicitly states its source authority and proudly answers "I do not have official information on that" when no verified rule exists.

## Evidence on Hand

- **Authoritative Rules Data:** `backend/src/data/rules.json` with rule IDs, circular citations, and verified customs.
- **Official Policy:** Bali Provincial Government Circular (Surat Edaran) No. 7 of 2025 on tourist obligations and prohibitions at sacred places.
- **Benchmark QA Suite:** 10 curated benchmark cultural scenarios for grounding the Assistant.
- **Design Tokens & Guardrails:** [`DESIGN.md`](DESIGN.md), [`docs/ui-spec.md`](docs/ui-spec.md), and [`docs/design-guardrails.md`](docs/design-guardrails.md).

## Product Principles

1. **Never Invent a Rule:** Truth and provenance outrank feature completeness; unverified guidance is never shown.
2. **Mobile-First & Outdoor Legible:** Optimized for 375px single-handed use, high contrast in bright sunlight, 44px touch targets.
3. **Calm and Reassuring:** Low cognitive load, clear single primary action, copy that leads with constructive resolution.
4. **Culturally Grounded:** Respectful, authentic terminology (Site, Zone, Custom, Adat) without tourist clichés or decorative spirituality.
5. **Privacy & Trust First:** Fast on-device or direct-to-backend image processing; respectful handling of user photos and location data.

## Accessibility & Inclusion

- **Target Standard:** WCAG 2.1 AA compliance across all views.
- **Light Theme Only:** Tailored specifically for outdoor visibility and contrast in direct sunlight.
- **Redundant Status Signals:** Every status is communicated via color + icon + clear text label (never color alone).
- **Accessible Motion:** Respects `prefers-reduced-motion` with instant transitions and zero motion budget when enabled.
- **Keyboard & Screen Reader Support:** Full focus-visible rings, logical tab order, ARIA attributes, and accessible dismiss triggers.
