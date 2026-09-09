---
status: accepted
---

# One-shot scroll-triggered fade-up entrances on the landing page

Guardrails §7 M4 bans scroll-triggered reveal chains. This ADR records a
scoped exception for the landing page, where subtle one-shot fade-up entrance
animations give the editorial sections a sense of life without scroll-jacking
or interrupting task flow.

## Context

The landing page (`/`) is the only page in Sasana that is editorial rather than
task-oriented. Its long-scroll layout has five distinct sections below the fold
(features, sites, benefits, how-it-works, footer). Without any entrance
motion these sections feel static and flat — all content is visible at once
with no visual rhythm as the visitor scrolls.

GSAP ScrollTrigger is the industry-standard library for scroll-driven
animation. Adding a lightweight fade-up (opacity + translateY) when a section
first enters the viewport is a well-established pattern that differs from the
"scroll-jacking" M4 was written to prevent: the scroll is never hijacked, no
content is pinned, and the visitor is never forced to wait for an animation
before reading.

## Decision

Allow **one-shot scroll-triggered fade-up entrances** on the landing page,
subject to the following constraints:

| Constraint | Rule | Detail |
|---|---|---|
| Properties | M1 | `opacity` and `transform: translateY()` only. No width, height, left, top, or margin. |
| Duration | M3 | Each element ≤300ms. Total stagger sequence ≤400ms (e.g. 3 items × 60ms stagger + 300ms = 420ms, rounded to 380ms by using 40ms stagger or 280ms duration). |
| Replay | — | `once: true`. Animations fire on first viewport entry only — no replay on scroll-back. |
| Easing | — | `power2.out` (close to the existing `out-quart` token). No bounce, spring, or elastic (M2). |
| Reduced motion | M5 | Under `prefers-reduced-motion: reduce`, all elements are set to visible immediately with no animation. |
| No parallax | D5 | No differential scroll speeds, no background parallax, no pin. |
| Scope | — | Landing page (`/`) only. Never on Check, Assistant, Explore, or About. |
| Library | — | GSAP core + ScrollTrigger plugin. No other GSAP plugins. |

## Alternatives considered

1. **CSS `@scroll-timeline` / `animation-timeline: scroll()`** — native but
   browser support is incomplete (no Safari stable as of Aug 2026) and the API
   is lower-level. GSAP provides a single abstraction with automatic cleanup.
2. **Intersection Observer + CSS classes** — workable for simple fade-in, but
   lacks stagger control and requires manual timing math. GSAP stagger is more
   maintainable.
3. **No animation at all** (status quo) — rejected because the landing page
   is the first impression of Sasana and deserves the editorial polish that
   other ADRs (0001, 0007, 0008) have already established for its visual
   identity.

## Consequences

- **New dependency**: `gsap` is added to `frontend/package.json`. GSAP core
  is free for non-commercial use; Sasana is an educational project (SMK
  Wikrama Bogor).
- **Guardrails §7 M4** receives a scoped carve-out annotation, following the
  same pattern as §2.2 and §6 L8 (ADR-0001).
- **Implementation**: a single reusable hook (`useScrollFadeUp`) in
  `frontend/src/lib/` keeps the GSAP logic centralized and testable.
- **Performance**: GSAP ScrollTrigger is ~8 KB gzipped. Animations use
  `transform` and `opacity` (compositor-friendly), so no layout thrashing on
  mobile.
