---
status: accepted
---

# Horizontal card slider for famous sites showcase on landing page

`docs/design-guardrails.md` §6 L6 specifies "No carousels, no hero sliders, no infinite marquee" to prevent decorative AI-slop motion and inaccessible rotating banners. The landing page (`/`) originally used a 3×2 card grid for the six sacred sites in `frontend/src/data/sites.ts`, which consumed significant vertical height and cluttered the landing page flow.

## Decision

- The "Bali's Famous Sites" section on the landing page is rendered as a **responsive horizontal card slider with gentle auto-advance and looping** (`SitesSlider.tsx`).
- The slider must strictly adhere to the following guardrails:
  - **Auto-advance & Looping**: Slides advance every 5 seconds with seamless loop-around from the last slide back to the first.
  - **Pause on Interaction**: Auto-advance immediately pauses on mouse hover (`onMouseEnter`), touch hold (`onTouchStart`), and keyboard focus (`onFocusCapture`) so visitors can read details comfortably.
  - **Single-hue alpha ramps only**: Focus and border states use established design tokens (`--color-border`, `--color-primary`, etc.).
  - **Touch and keyboard accessibility**: Uses CSS scroll-snap (`snap-x snap-mandatory`), supports keyboard arrow navigation (`ArrowLeft` / `ArrowRight`), and provides explicit `aria-roledescription="carousel"` and `aria-label` landmarks.
  - **Respects reduced motion**: Animations degrade to instant position changes when `prefers-reduced-motion: reduce` is active.
  - **Pagination**: Provides interactive dot indicators indicating the active slide and allowing direct navigation.
- **L6 is narrowed, not removed.** Infinite marquees and hero sliders remain banned. This exception is scoped strictly to the landing page Site showcase.

## Why

Displaying six full cards in a 3×2 grid added excessive vertical density to the landing page. A horizontal slider with gentle auto-sliding preserves full visibility of all six sites while keeping the page layout clean, focused, and intuitive for visitors on both mobile and desktop.

## Guardrails broken

| Rule | Clause | Scope of exception |
|---|---|---|
| L6 | "No carousels, no hero sliders, no infinite marquee" | Landing `/` Famous Sites showcase only; accessible scroll-snap slider with 5s auto-slide, pause-on-hover, and looping |

## Consequences

- The Famous Sites section uses the `SitesSlider` component with 5s auto-sliding, loop-around, touch swipe, navigation buttons, and dot indicators.
- All six sites remain easily discoverable without cluttering the landing page.
