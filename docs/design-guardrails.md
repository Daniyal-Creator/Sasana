# Design Guardrails — Anti-Slop Rules

**SASANA — the non-negotiable list**

| | |
|---|---|
| **Document** | Design Guardrails (banned patterns + enforcement) |
| **Companion to** | [UI/UX Specification](./ui-spec.md) · [PRD](./prd.md) · [Technical Specification](./tech-spec.md) |
| **Version** | 1.2 — binding for MVP and after. 1.1 adds the ADR-0001 landing-hero carve-out (§2.2, §6 L8). 1.2 adds the ADR-0009 scroll-fade-up carve-out (§7 M4) |
| **Applies to** | Every PR that touches `app/**`, `components/**`, `globals.css`, `tailwind.config.ts` |
| **Owner** | Manu (frontend/UI) · reviewed by Daniyal · QA-checked by Rafli |

> **Why this document exists.** The UI Spec says what to *build*. This one says what to **never** build. Generic AI-generated interfaces fail in a recognisable way: purple-to-pink gradients on white, Inter everywhere, three identical cards in a row, a glow on every button, colors picked because they looked nice in isolation instead of because a token already existed. SASANA is a cultural-respect product for Bali — a stock "AI startup" look would quietly undermine the credibility the whole product depends on (ui-spec §1 P3). Every rule below is a hard rule, not a preference. Breaking one requires an ADR (§11).

---

## Table of contents

1. [The one-line law](#1-the-one-line-law)
2. [Gradients](#2-gradients)
3. [Color](#3-color)
4. [Typography](#4-typography)
5. [Depth, elevation, and surface effects](#5-depth-elevation-and-surface-effects)
6. [Layout and composition](#6-layout-and-composition)
7. [Motion](#7-motion)
8. [Icons, imagery, and emoji](#8-icons-imagery-and-emoji)
9. [Copy](#9-copy)
10. [Enforcement — review checklist and audit commands](#10-enforcement--review-checklist-and-audit-commands)
11. [Exception process](#11-exception-process)

---

## 1. The one-line law

> **Every visual decision must trace to a token in ui-spec §2 and to a reason in ui-spec §1 (P1–P5). Decoration without a reason is a bug.**

Two questions decide any dispute, in this order:

1. **Which token is this?** If the answer is a raw hex, a raw px value, or "I eyeballed it" — stop, use the token or add one properly.
2. **What does it do for the user?** If the answer is "it looks more modern" — remove it. If the answer is "it separates the status band from the body so the eye lands on the suggestion first" — keep it.

A quick self-test before opening a PR: *if this screenshot appeared in a gallery of 100 AI-generated dashboards, would anything identify it as SASANA?* If the answer is the logo only, the design has not done its job.

---

## 2. Gradients

This is the single most common source of slop, so it gets the strictest rule.

### 2.1 The gradient law

> **A gradient may vary alpha. A gradient may never vary hue.**

Concretely, every gradient in this codebase must satisfy **all** of:

| # | Rule |
|---|---|
| G1 | It ramps **one single color token** between opacity values (including fully transparent). No second color. |
| G2 | Its base color is an **existing token** from ui-spec §2.1 — not a new hex. |
| G3 | It appears in one of the **three permitted places** in §2.2. Nowhere else. |
| G4 | **No text ever sits on it.** Contrast (ui-spec §8) cannot be verified against a moving background. |
| G5 | It is **not animated** — no shifting, breathing, or looping gradient, with the sole exception of the skeleton shimmer (§2.2). |

Because chroma stays fixed and only alpha moves, "picking gradient colors" is impossible by construction. That is the point: the failure mode this document targets is *randomly chosen* gradient stops, so the rule removes the choice rather than asking for taste.

### 2.2 The only three permitted gradients

Anything not on this list is banned. These are already accounted for in the UI Spec.

| Where | Purpose | Exact form |
|---|---|---|
| **`Skeleton` shimmer** (ui-spec §5.5, §9.7) | Signals "loading", prevents a dead grey block | `linear-gradient(90deg, transparent 0%, rgb(255 253 249 / .65) 50%, transparent 100%)` sweeping over a `--color-surface-sunken` base. One hue (`--color-surface`), alpha only. Disabled under `prefers-reduced-motion`. |
| **Photo scrim** (ui-spec §4.2, only if text or a control overlays the uploaded photo) | Keeps a control legible over an unpredictable user photo | `linear-gradient(to top, rgb(42 37 32 / .55), rgb(42 37 32 / 0))` — the `--color-overlay` ink, alpha only. Never a decorative tint. |
| **Landing hero scrim** (ADR-0001, landing `/` hero only) | Keeps the hero headline/CTAs legible over the hero landscape image | Same exact form as the photo scrim above: warm ink `42,37,32`, alpha only, never animated. |
| **Scroll-edge fade** (chat list, ui-spec §4.3) | Shows there is more content above the fold | Implemented as `mask-image: linear-gradient(to bottom, transparent, black 24px)` — a mask, not a painted background. No color at all. |

### 2.3 Banned gradient patterns (explicit)

Named so nobody can argue they were "not covered":

| Banned | Why |
|---|---|
| Purple → pink → blue, indigo → violet, teal → lime, orange → pink, or any multi-hue ramp | The canonical AI-slop signature. Instant loss of credibility (P3). |
| Gradient **buttons** and gradient CTAs | `--color-primary` is a flat fill. Flat reads as a real, pressable control; a gradient reads as a decoration. |
| Gradient **text** (`bg-clip-text`, `text-transparent`) | Unverifiable contrast, breaks at zoom, screen-reader-neutral but visually fragile. Violates ui-spec §8. |
| Gradient **borders** / gradient rings | The border tokens are `--color-border` and `--color-border-strong`. A gradient border is decoration with no state meaning. |
| Animated "aurora", mesh, or blob backgrounds; floating gradient orbs | Motion budget is calm and small (P2, ui-spec §9). Also a mobile battery and paint cost (P1). |
| Gradients on **status** surfaces (`--status-*-bg`) | Status must be a flat, comparable tint. A ramp makes green-vs-amber harder to distinguish at a glance (P4). |
| Gradients in the **logo / wordmark** | The mark is prada gold on segara indigo, flat. |
| `bg-gradient-to-*` used "just to add depth" | Depth comes from the shadow scale (ui-spec §2.5). Use it. |

### 2.4 What to use instead

When the instinct says "this area feels flat":

1. **Change the surface token.** `--color-bg` → `--color-surface` → `--color-surface-sunken` are three real steps of depth already.
2. **Add a hairline.** `1px --color-border` separates regions more honestly than a fade.
3. **Add elevation.** `shadow-sm` → `shadow-md` (ui-spec §2.5), warm-tinted, already designed.
4. **Change the spacing rhythm.** Most "flat" complaints are actually uniform-padding complaints — see the rhythm rule in ui-spec §2.3.
5. **Use the accent as a rule, not a wash.** A 1px `--color-accent` rule (as on the landing "how it works", ui-spec §4.1) carries the prada-gold identity at ≤10% coverage.

---

## 3. Color

### 3.1 Rules

| # | Rule |
|---|---|
| C1 | **Tokens only.** No raw hex, `rgb()`, or named CSS colors inside `app/**` or `components/**`. Every color lives in `tailwind.config.ts` / `globals.css` and is consumed by name (`bg-surface`, `text-secondary`, `border-strong`). |
| C2 | **No new colors** without an ADR. The palette is closed at: 8 neutrals, 4 primary, 2 accent, 1 focus, 1 overlay, 12 status. |
| C3 | **Status colors only in status contexts.** `--status-*` is for `ResultCard`, `ErrorFallback`, and inline validation. Never as a general accent, never for decoration, never for a "success-colored" nav item. |
| C4 | **Accent ≤10% of any screen.** Prada gold is a highlight, not a surface. Gold as body text is banned outright (fails AA — ui-spec §8); use `--color-accent-strong`. |
| C5 | **No pure black or pure white.** `#000` / `#fff` are banned everywhere including shadows and overlays. The neutrals are warm-tinted on purpose (paras stone, P3). |
| C6 | **Color is never the only signal.** Every state carries icon + text label + color (ui-spec §8). |
| C7 | **One primary.** Segara indigo does all interactive work. No second "brand" color introduced per-page or per-feature. |

### 3.2 Banned color patterns

- The tropical-teal / sunset-orange **tourist-brochure palette** — the exact cliché ui-spec §1 P3 was written to avoid.
- **Neon or saturated fills** on a light canvas (chroma above the palette's ceiling reads as a toy, not a civic reference tool).
- **Dark mode improvised inline.** Dark theme is post-MVP (ui-spec header). Do not half-ship it with ad-hoc `dark:` classes.
- **Semantic drift**: red used for anything except `not_compliant`, green for anything except `compliant`.
- **Opacity as a color.** `text-white/60` over an arbitrary background is not a token; use `--color-text-secondary` / `--color-text-muted`.

---

## 4. Typography

| # | Rule |
|---|---|
| T1 | **Two families only:** Fraunces (display) and Plus Jakarta Sans (UI/body), per ui-spec §2.2. Adding a third font requires an ADR. |
| T2 | **Inter, Roboto, Arial, Helvetica, Space Grotesk, and bare `system-ui`** are banned as *chosen* faces. They appear only inside the documented fallback stacks. |
| T3 | **Scale only.** Sizes come from `text-xs … text-display`. No arbitrary `text-[17px]`. |
| T4 | **Line length ≤65ch** for prose (ui-spec §3). |
| T5 | **No ALL-CAPS body text**, no letter-spacing tricks on paragraphs. Caps are allowed only on `text-xs` labels/badges. |
| T6 | **One `<h1>` per page**, heading levels never skipped for visual size — size is a token, hierarchy is semantics (ui-spec §8). |

---

## 5. Depth, elevation, and surface effects

| # | Rule |
|---|---|
| D1 | **Shadows come from the scale** (`shadow-sm/md/lg/toast/focus`) and are warm ink `42,37,32`. A pure-black shadow is banned. |
| D2 | **No glow.** Colored outer glows, neon shadows, and `drop-shadow` halos are banned. The only colored ring is `--shadow-focus`, which exists for accessibility. |
| D3 | **No glassmorphism.** `backdrop-blur` is permitted on exactly one element — the modal/sheet scrim (`--color-overlay`). Frosted cards, frosted headers, and frosted nav bars are banned (unreadable in the daylight scenario, P1). |
| D4 | **No neumorphism**, no inner+outer double shadows, no embossed or debossed controls. |
| D5 | **No 3D transforms, tilt-on-hover, or parallax.** |
| D6 | **Radius from the scale only** (8/12/16/24/full). No mixed radii on one element. |
| D7 | **Never nest cards** (already law in ui-spec §5.2). A card inside a card means the information architecture is wrong. |
| D8 | **No `border-left` accent stripe** to convey status (already law in ui-spec §5.3). The status band + icon + label carry it. |

---

## 6. Layout and composition

| # | Rule |
|---|---|
| L1 | **No three identical feature cards in a row.** The landing flow is numbered ①②③ with a connecting rule precisely so it is not the stock card triptych (ui-spec §4.1). |
| L2 | **One primary action per screen** (P4). Two competing primary buttons is a design failure, not a layout choice. |
| L3 | **Vary the padding rhythm.** Uniform padding everywhere is the flattest AI tell there is (ui-spec §2.3). |
| L4 | **Don't center everything.** Centered text is for hero and empty states; body prose and form labels are left-aligned. |
| L5 | **Mobile 375px is the source layout**, not a scaled-down desktop (P1). Every screen must reflow to 320px / 200% zoom without horizontal scroll. |
| L6 | **No carousels, no hero sliders, no infinite marquee.** |
| L7 | **No modal on load**, no cookie-style interstitial, no newsletter capture. The privacy notice is inline and persistent (ui-spec §4.2). |
| L8 | **No decorative stock photography** of temples or tourists. Outside the landing hero, the only image on screen is the user's own photo. Fake cultural imagery is the visual equivalent of cosplay (P3). **Scoped carve-out (ADR-0001):** the landing `/` hero may show one real photograph of Bali, chosen by the project owner. I4 stays fully in force — the hero photo must be a real photograph, never AI-generated. |

---

## 7. Motion

Full spec in ui-spec §9. The guardrails:

| # | Rule |
|---|---|
| M1 | **Transform and opacity only.** Never animate `width`, `height`, `top`, `left`, or `margin`. |
| M2 | **No bounce, elastic, spring-overshoot, or `animate-bounce`** (already law in ui-spec §9). |
| M3 | **Durations stay in band:** 120–150ms feedback, 200ms transitions, 300–400ms entrances. Nothing above 400ms. |
| M4 | **No scroll-jacking, no scroll-triggered reveal chains, no typewriter effects, no confetti.** A compliance result is not a celebration moment (P2). **Scoped carve-out (ADR-0009):** the landing `/` page may use one-shot scroll-triggered fade-up entrances (opacity + translateY, ≤400ms, `once: true`). All other M rules remain in full force. No parallax, no scroll-jacking, no pin. |
| M5 | **`prefers-reduced-motion` is respected everywhere** — entrances degrade to opacity-only, loops stop. |
| M6 | **Loading is a skeleton or a spinner**, never a shifting gradient bar, never a fake progress percentage. |

---

## 8. Icons, imagery, and emoji

| # | Rule |
|---|---|
| I1 | **Lucide only**, stroke `1.75`, sizes 16/20/24 (ui-spec §2.6). No mixing icon libraries, no filled-style icons. |
| I2 | **No emoji in product UI** — not in buttons, headings, status labels, or empty states. Emoji are inconsistent across platforms and read as casual in a document that cites a government circular. (Chat *content* typed by the user is not affected.) |
| I3 | **No 3D illustrations, no isometric blobs, no generic "undraw"-style vector people.** Empty states use a muted Lucide icon plus real copy (ui-spec §5.13). |
| I4 | **No AI-generated imagery of Balinese people, ceremonies, or temples.** Non-negotiable: the product's premise is respect for a living culture, and synthetic depictions of sacred practice contradict it. |
| I5 | **Icons never stand alone as state.** Always icon + text (ui-spec §8). |

---

## 9. Copy

Full voice guide in ui-spec §10. The guardrails, because slop copy is as recognisable as slop visuals:

| # | Rule |
|---|---|
| W1 | **No em dashes** (already in ui-spec §10). |
| W2 | **No marketing filler**: "seamless", "unlock", "elevate", "revolutionary", "powered by AI", "in seconds". State what happens. |
| W3 | **No exclamation stacking**, no shouting, no ALL-CAPS warnings. |
| W4 | **Lead with the fix, not the fault** (FR1.4). "Wrap a kamen before entering", never "You are violating temple rules". |
| W5 | **Never expose raw errors** — no codes, no stack traces (ui-spec §10.6). |
| W6 | **Never invent a rule.** Ungrounded answers say so plainly (FR2.1). This is a factual guardrail, not a stylistic one. |

---

## 10. Enforcement — review checklist and audit commands

### 10.1 PR checklist (paste into the PR description)

- [ ] No gradient outside the three permitted places (§2.2); any present is single-hue alpha-only.
- [ ] No raw hex / `rgb()` in `app/**` or `components/**` — tokens only (§3 C1).
- [ ] No new color, font, radius, or shadow value introduced (§3 C2, §4 T1, §5 D1/D6).
- [ ] No `backdrop-blur` outside the scrim; no glow, no neumorphism (§5).
- [ ] Every state carries icon + text + color, not color alone (§3 C6).
- [ ] Motion is transform/opacity, ≤400ms, reduced-motion honoured (§7).
- [ ] No emoji, no stock or generated imagery (§8).
- [ ] Copy has no em dash and no marketing filler (§9).
- [ ] Screen still reflows at 320px and 200% zoom (§6 L5).

### 10.2 Audit commands

Run from the repo root. Each should return **no results** (or only the documented exceptions).

```bash
# Gradients — expect ONLY Skeleton (shimmer) and the documented scrim/mask
rg -n "gradient|bg-gradient-to|from-\[|via-|to-\[|bg-clip-text" app components

# Raw colors outside the token layer
rg -n "#[0-9a-fA-F]{3,8}\b|rgba?\(" app components

# Banned surface effects
rg -n "backdrop-blur|drop-shadow|animate-bounce|animate-pulse|blur-\d|perspective|rotate-x|rotate-y" app components

# Banned fonts named directly
rg -ni "inter|roboto|arial|helvetica|space grotesk" app components

# Arbitrary values that bypass the scales
rg -n "\[(#|[0-9]+px)" app components

# Emoji in source (rough sweep)
rg -n "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" app components

# Em dash in user-facing copy
rg -n "—" lib/i18n app components
```

Anything these flag is either a violation to fix or an exception to document per §11.

---

## 11. Exception process

Guardrails can be wrong. They cannot be quietly ignored.

To break a rule:

1. Open an issue under `.scratch/` (see `docs/agents/issue-tracker.md`) titled `design-exception: <rule id>`.
2. Record an ADR in `docs/adr/` stating: the rule, the user problem it blocks, the alternatives from §2.4 / §3 that were tried, and the exact scope of the exception.
3. Get sign-off from the UI owner (Manu) plus one reviewer.
4. Add the approved exception to this document — either as a new permitted case or as a named, scoped carve-out. **An exception that is not written back here does not exist.**

Amendments to this document follow the same path. Version it in the header table when it changes.

---

*Binding companion to [ui-spec.md](./ui-spec.md). Where the two documents overlap, the stricter reading applies.*
