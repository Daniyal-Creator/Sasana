# UI/UX Specification — SASANA

**AI Etiquette & Balinese Custom Guide for Tourists**

| | |
|---|---|
| **Document** | UI/UX Specification (Design System + Screens) |
| **Companion to** | [Product Requirements Document](./prd.md) · [Technical Specification](./tech-spec.md) · [Design Guardrails](./design-guardrails.md) |
| **Version** | 1.0 (MVP) — derived from PRD v1.0 |
| **Register** | Product UI (design serves the task) with a warm, human landing voice |
| **Theme** | Light, high-contrast (outdoor daylight use). Dark mode is post-MVP. |
| **Audience** | Manu (frontend/UI), Daniyal (integration), Rafli (KB/testing/QA) |

> **How to read this.** Every token, component, and screen here is buildable directly, no interpretation required. Values are given in both **OKLCH** (authoring source of truth) and **hex** (for Tailwind config and quick reference). Cross-references cite the PRD ("PRD §4") and Tech Spec ("TS §4"). Component file paths match TS §2 exactly.

> **Theme rationale (the scene that decided it).** *A foreign tourist stands in bright tropical sunlight at a temple gate, phone at arm's length, wanting a quick reassuring check before stepping in.* Bright ambient light + glanceable stakes force a **light** UI with high luminance contrast. A dark theme would be unreadable in direct sun. This scene (PRD §4 Persona 1) governs contrast targets throughout (§8).

---

## Table of Contents

1. [Design Principles](#1-design-principles)
   - [1.6 Design laws (hard bans)](#16-design-laws-hard-bans)
2. [Design System (Full Token Set)](#2-design-system-full-token-set)
3. [Layout Grid](#3-layout-grid)
4. [Page-by-Page Wireframes & Specs](#4-page-by-page-wireframes--specs)
5. [Component Design Specs](#5-component-design-specs)
6. [User Flow Diagrams](#6-user-flow-diagrams)
7. [Responsive Behavior](#7-responsive-behavior)
8. [Accessibility Checklist (WCAG 2.1 AA)](#8-accessibility-checklist-wcag-21-aa)
9. [Micro-interactions & Animations](#9-micro-interactions--animations)
10. [Copy & Tone Guidelines (EN + ID)](#10-copy--tone-guidelines-en--id)
11. [Appendix — Tailwind Token Config](#appendix--tailwind-token-config)

---

## 1. Design Principles

Five principles, each traceable to the PRD's users (§4) and goals (§3). When two principles conflict, they are ranked in this order.

### P1 — Mobile-first, one-handed, outdoors
Persona 1 is a tourist on a phone at a temple, often in sun, often on mobile data (PRD §4, §7). Every layout is designed at **375px first**, single-column, with primary actions reachable by the thumb and legible in daylight. *Maps to:* PRD §3 "Mobile-responsive: Yes"; §7 "mobile-first, most tourists use phones."

### P2 — Calm & reassuring, never judgmental
The user may have *just* realized they might be doing something wrong at a sacred site. The interface must lower anxiety, not raise it. Soft warm surfaces, generous spacing, gentle motion, and copy that always leads with "here's how to fix it" (never a bare red "WRONG"). *Maps to:* PRD §4 "needs non-judgmental answers"; FR1.3/FR1.4 "status + reason + suggestion, always friendly and educational."

### P3 — Culturally respectful (rooted, not decorative)
This app is *about* respect for Balinese custom, so the visual language must earn credibility, not cosplay it. Color and type are grounded in authentic sacred meaning (temple stone, the sea of Melasti purification, prada gilding, the Nawa Sanga color compass) rather than tourist-brochure tropical clichés. *Maps to:* PRD §1 (the name *Sasana* = "code of conduct"), §2 (Circular No. 7/2025 credibility), §6 About page.

### P4 — Instantly clear, low cognitive load
A non-Indonesian-speaking first-time user must understand every screen in seconds. Two features, two big doors on the landing page. One primary action per screen. Status communicated redundantly (color + icon + text + label) so meaning never rests on color alone. *Maps to:* PRD §4 "quick, clear answers"; §5 "few features, but truly polished."

### P5 — Accessible & trustworthy
WCAG 2.1 AA contrast, 44px+ touch targets, full keyboard support, honest system status, and a visible privacy promise about photos. Trust is a feature here: the user is handing over a photo of themselves. *Maps to:* PRD §7 (accessibility, privacy, reliability), §19 (free-tier data-use disclosure).

### 1.6 Design laws (hard bans)

The principles above say what to build. These say what to **never** build — the patterns that make an interface read as generic AI output and quietly cost this product its credibility (P3). They are hard rules, not preferences.

| # | Law | Where it is specified |
|---|---|---|
| **DL1** | **A gradient may vary alpha, never hue.** Single-token alpha ramps only, in three named places (skeleton shimmer, photo scrim, scroll-edge mask). No gradient buttons, gradient text, gradient borders, gradient status surfaces, or animated mesh/aurora backgrounds. Multi-hue ramps (purple→pink, teal→lime, indigo→violet) are banned outright. | Guardrails §2 |
| **DL2** | **Tokens only.** No raw hex, `rgb()`, or arbitrary px in `app/**` / `components/**`. No new color, font, radius, or shadow value without an ADR. | §2, Guardrails §3–§5 |
| **DL3** | **No glow, no glassmorphism, no neumorphism, no 3D tilt.** `backdrop-blur` is permitted on the scrim only. Depth comes from the surface steps and the shadow scale (§2.5). | Guardrails §5 |
| **DL4** | **Never nest cards.** | §5.2 |
| **DL5** | **No `border-left` accent stripe** for status — the header band + icon + label carry it. | §5.3 |
| **DL6** | **No bounce/elastic motion**, never animate layout properties, nothing above 400ms. | §9 |
| **DL7** | **No emoji in product UI**, no stock or AI-generated imagery of Balinese people, ceremonies, or temples. The only image on screen is the user's own photo. | Guardrails §8 |
| **DL8** | **Color is never the only signal** — always icon + text label + color. | §8 |

> Full rationale, the banned-pattern list, the "what to use instead" ladder, the PR checklist, and the `rg` audit commands live in **[Design Guardrails](./design-guardrails.md)**. That document is binding; where the two overlap, the stricter reading applies. Breaking any law requires an ADR (Guardrails §11).

---

## 2. Design System (Full Token Set)

### 2.1 Color

**Strategy: Restrained.** Warm temple-stone neutrals carry the surface; one deep indigo primary does the interactive work; prada gold is a ≤10% accent; the four status colors appear *only* inside results/status contexts so they never compete with the brand. Neutrals are tinted warm (never pure `#000`/`#fff`); chroma is dropped near the extremes.

**All fills are flat.** Every token below is a solid color — buttons, cards, status surfaces, and the header are painted with one value, never a ramp. Gradients are governed by DL1 (§1.6): alpha-only, single-token, and legal in exactly three places (Guardrails §2.2). When a surface feels flat, move a step on the surface scale (`bg` → `surface` → `surface-sunken`), add a `--color-border` hairline, or raise the shadow — not a gradient.

#### Brand & neutral

| Token | OKLCH | Hex | Role & cultural note |
|---|---|---|---|
| `--color-bg` | `oklch(0.968 0.010 78)` | `#F6F1E9` | App canvas. Warm **paras** (volcanic tuff) sandstone temples are carved from. Calm, not clinical. |
| `--color-surface` | `oklch(0.992 0.006 78)` | `#FFFDF9` | Raised surface (cards, bars). Warm near-white, never `#fff`. |
| `--color-surface-sunken` | `oklch(0.945 0.012 78)` | `#EFE8DC` | Inset areas (upload well, input track). |
| `--color-border` | `oklch(0.900 0.014 78)` | `#E4DACB` | Hairline dividers, card borders. |
| `--color-border-strong` | `oklch(0.820 0.018 78)` | `#CBBFA8` | Emphasized borders, input focus base. |
| `--color-text` | `oklch(0.285 0.012 68)` | `#2A2520` | Primary text. Warm ink, never `#000`. |
| `--color-text-secondary` | `oklch(0.470 0.012 68)` | `#5C544A` | Secondary text, captions. |
| `--color-text-muted` | `oklch(0.610 0.012 68)` | `#8A8073` | Placeholder, disabled, helper. |
| `--color-primary` | `oklch(0.420 0.095 250)` | `#1D4E89` | **Segara** (the sea) indigo. The sea receives Melasti purification; calm, trustworthy. Buttons, links, active. |
| `--color-primary-hover` | `oklch(0.365 0.090 250)` | `#163C6B` | Primary hover/active (darker). |
| `--color-primary-tint` | `oklch(0.945 0.028 250)` | `#E7EEF6` | Primary-tinted fills (selected chip, focus halo). |
| `--color-primary-fg` | `oklch(0.985 0.004 250)` | `#FBFCFE` | Text/icon on primary. |
| `--color-accent` | `oklch(0.640 0.100 78)` | `#B8862B` | **Prada** temple-gilding gold. Logo mark, small highlights, decorative rules. ≤10% of surface. |
| `--color-accent-strong` | `oklch(0.520 0.090 74)` | `#8A6416` | Gold when used as *text* (darker, for contrast). |

#### Semantic / status (F1 result states, PRD §11)

Each status defines a **text/icon** color (dark, AA on the tint), a **surface tint** (result-card background), and a **border**. Meaning is carried by icon + label + text too, never color alone (P4, §8).

| Status (`VisionStatus`) | Meaning | Text/Icon | Hex | Surface tint | Hex | Border | Hex |
|---|---|---|---|---|---|---|---|
| `compliant` | Green — all good | `--status-ok-fg` | `#2E7D46` | `--status-ok-bg` | `#E8F3EB` | `--status-ok-border` | `#BEDDC6` |
| `needs_attention` | Amber — minor fix | `--status-warn-fg` | `#8A5A00` | `--status-warn-bg` | `#FBF1DE` | `--status-warn-border` | `#EEDBA8` |
| `not_compliant` | Red — please adjust | `--status-bad-fg` | `#B23A2E` | `--status-bad-bg` | `#FBEAE7` | `--status-bad-border` | `#EEC4BD` |
| `unclear` | Stone — can't tell | `--status-unknown-fg` | `#6B6459` | `--status-unknown-bg` | `#F0ECE4` | `--status-unknown-border` | `#D9D1C4` |

> **Cultural grounding (for the About page and design credibility).** The palette nods to the **Nawa Sanga** color compass (Brahma/south = red, tied here to "please adjust"; harmony/nature green for "compliant", echoing *Tri Hita Karana*), the **Tridatu** sacred thread, and **poleng** duality. This is authentic sacred symbolism, deliberately chosen over the tropical-teal tourist reflex (P3).

#### Focus & overlay

| Token | Hex | Role |
|---|---|---|
| `--color-focus` | `#3B6FB0` | Focus ring (lightened primary, ≥3:1 on both bg and surface). |
| `--color-overlay` | `rgba(42,37,32,0.44)` | Scrim behind sheets/dialogs (warm ink, not black). |

### 2.2 Typography

Two typefaces, both free (Google Fonts, self-hosted via `next/font`). This is a deliberate, non-reflex pairing (P3): a warm heritage serif for identity + credibility, a friendly humanist sans (designed in Indonesia) for everything functional.

| Role | Family | Why | Fallback stack |
|---|---|---|---|
| Display / headings / wordmark | **Fraunces** (opsz variable, soft) | Warm, characterful serif signals heritage and the credibility of official rules (PRD §2). | `Fraunces, "Iowan Old Style", Georgia, serif` |
| UI / body / all functional text | **Plus Jakarta Sans** | Humanist geometric sans **designed by an Indonesian foundry** (Tokotype) — a genuine cultural tie, and excellent on mobile. | `"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |

*Single-font fallback (if the team prefers one file):* use Plus Jakarta Sans for everything, weight 700 for display.

**Type scale** — 1.25 (major third) ratio, base 16px = 1rem. Line-height tightens as size grows.

| Token | rem | px | Line-height | Weight | Family | Applied to |
|---|---|---|---|---|---|---|
| `text-display` | 2.986 | 47.8 | 1.05 | 600 | Fraunces | Landing hero H1 (desktop) |
| `text-h1` | 2.488 | 39.8 | 1.1 | 600 | Fraunces | Landing hero H1 (mobile), page titles |
| `text-h2` | 1.953 | 31.2 | 1.15 | 600 | Fraunces | Section headings |
| `text-h3` | 1.563 | 25 | 1.2 | 600 | Plus Jakarta | Card titles, result headline |
| `text-lg` | 1.25 | 20 | 1.4 | 500 | Plus Jakarta | CTA button label, lead paragraph |
| `text-base` | 1.0 | 16 | 1.55 | 400 | Plus Jakarta | Body, chat messages, inputs |
| `text-sm` | 0.875 | 14 | 1.5 | 400 | Plus Jakarta | Helper text, captions, source ref |
| `text-xs` | 0.75 | 12 | 1.4 | 500 | Plus Jakarta | Labels, badges, legal/privacy micro |

**Weights loaded:** Plus Jakarta Sans 400/500/600/700; Fraunces 500/600. Body max line length **65ch** (prose blocks capped, §3).

### 2.3 Spacing

4px base unit. Aligns 1:1 with Tailwind's default scale, so `p-4` = 16px etc.

| Token | px | Tailwind | Typical use |
|---|---|---|---|
| `space-1` | 4 | `1` | Icon-to-label gap, hairline insets |
| `space-2` | 8 | `2` | Chip padding, tight stacks |
| `space-3` | 12 | `3` | Input padding-y, list gaps |
| `space-4` | 16 | `4` | Default component padding, mobile gutter |
| `space-5` | 20 | `5` | Card padding (mobile) |
| `space-6` | 24 | `6` | Card padding (desktop), section inner gap |
| `space-8` | 32 | `8` | Between stacked cards |
| `space-10` | 40 | `10` | Section padding-y (mobile) |
| `space-12` | 48 | `12` | Section padding-y (desktop), hero rhythm |
| `space-16` | 64 | `16` | Major section separation |

Rhythm rule (P-layout): vary padding for cadence. Hero uses `space-12/16`; dense controls use `space-3/4`. Do **not** apply one uniform padding everywhere.

### 2.4 Border radius

| Token | px | Applied to |
|---|---|---|
| `radius-sm` | 8 | Badges, small inputs, image thumbnails |
| `radius-md` | 12 | Buttons, text inputs, selects |
| `radius-lg` | 16 | Cards, result card, upload well, sheets |
| `radius-xl` | 24 | Hero media, feature panels |
| `radius-full` | 9999 | Quick chips, avatars, icon buttons, pills |

### 2.5 Shadows (elevation)

Warm-tinted (ink `42,37,32`), low and soft — calm, not floaty. Never pure-black shadow, never a colored glow (DL3). Shadows are the *only* depth device besides the surface scale.

| Token | Value | Applied to |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(42,37,32,.05), 0 1px 3px rgba(42,37,32,.04)` | Cards at rest, chips |
| `shadow-md` | `0 4px 12px rgba(42,37,32,.08)` | Card hover, result card, sticky bars |
| `shadow-lg` | `0 12px 32px rgba(42,37,32,.14)` | Bottom sheets, dialogs, language menu |
| `shadow-toast` | `0 8px 24px rgba(42,37,32,.16)` | Toasts / transient banners |
| `shadow-focus` | `0 0 0 3px rgba(59,111,176,.45)` | Focus halo (paired with 2px outline) |

### 2.6 Icons

**Library: Lucide** (`lucide-react`) — MIT, consistent 24px grid, tree-shakeable, stroke-based (calm, matches type). Import per-icon (named, PascalCase): `import { Camera, MessageCircle } from "lucide-react"`.

- **Sizes:** `16` (inline/caption), `20` (buttons, chips), `24` (nav, status, primary actions). **Stroke width `1.75`** app-wide (softer than default 2, per P2).
- **Status icon map (F1):** `compliant` → `CircleCheck`; `needs_attention` → `TriangleAlert`; `not_compliant` → `CircleX`; `unclear` → `CircleHelp`.
- **Core set:** `Camera`, `ImageUp`, `MessageCircle`, `Send`, `Languages`, `ArrowLeft`, `RefreshCw`, `Download`, `ShieldCheck`, `Sparkles`, `X`, `ChevronDown`, `MapPin`.
- **Naming pattern in JSX:** wrap in a sized helper `<Icon as={Camera} size={20} />` or use directly with `size`/`strokeWidth` props. Never use icons as the *only* signifier of state (always pair with text — §8).

---

## 3. Layout Grid

**Mobile-first, single-column core.** Breakpoints match Tailwind defaults; the app is authored at 375px and enhanced upward.

| Breakpoint | Min width | Tailwind | Primary change |
|---|---|---|---|
| Base (mobile) | 0 | — | Single column, full-bleed gutters, sticky bottom actions |
| `sm` | 640px | `sm:` | Larger type, roomier padding; still single column |
| `md` | 768px | `md:` | Landing CTAs go side-by-side; header shows inline nav |
| `lg` | 1024px | `lg:` | Landing hero two-column; content centered with margins |
| `xl` | 1280px | `xl:` | Max widths cap; generous whitespace |

**Max content widths** (centered, `mx-auto`):

| Context | Max width | Reason |
|---|---|---|
| Tool pages (`/check`, `/assistant`) | **600px** | Single-column task; keeps chat/upload focused and thumb-friendly on tablet/desktop. |
| Prose (`/about`, help text) | **680px (≈65ch)** | Optimal reading measure (§2.2). |
| Landing container | **1120px** | Hero can breathe two-column on `lg+`. |
| Global page gutter | 16px base, `sm:24px`, `lg:32px` | Consistent edge padding via `px-4 sm:px-6 lg:px-8`. |

**Grid columns.** Only the landing "how it works" and hero use multi-column (CSS grid). Tool pages are flex column. No 12-col framework needed at this scale.

---

## 4. Page-by-Page Wireframes & Specs

Legend: `[ ]` container/box · `(btn)` button · `<< >>` full-width · `▸` icon.

### 4.1 Landing page (`/`) — Server Component (TS §6)

**Mobile (375px):**

```
┌───────────────────────────────┐
│ ▸SASANA            [ ID | EN ] │  ← header: wordmark + LanguageSwitcher
├───────────────────────────────┤
│                               │
│   Understand and respect      │  ← H1 (Fraunces), text-h1
│   Balinese customs, before    │
│   you enter.                  │
│                               │
│   Your friendly guide to      │  ← lead paragraph, text-lg, secondary
│   sacred sites in Bali.       │
│                               │
│ ┌───────────────────────────┐ │
│ │  ▸Camera                  │ │  ← CTA 1: SituationCheckButton
│ │  Situation Check          │ │     (primary, full-width, ≥56px tall)
│ │  Check a photo for custom │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │  ▸MessageCircle           │ │  ← CTA 2: AssistantButton
│ │  Ask the Assistant        │ │     (secondary, full-width)
│ │  Questions about the rules│ │
│ └───────────────────────────┘ │
│                               │
│   How it works                │  ← text-h2
│   ①──────②──────③            │  ← numbered flow (NOT identical cards)
│   Snap   Get     Enter with   │
│   a photo feedback confidence │
│                               │
├───────────────────────────────┤
│ Not affiliated with the Bali  │  ← footer: credibility + privacy link
│ Govt. Ref: Circular 7/2025.   │
│ Photos are never stored. About│
└───────────────────────────────┘
```

**Desktop (`lg`, hero two-column):** headline + lead on the left (max 520px), the two CTA cards stacked on the right; "how it works" becomes a 3-column horizontal flow with a connecting hairline rule in `--color-accent` at 1px (a rule, **not** a left-stripe). Container capped at 1120px.

- **Components:** `Header`, `LanguageSwitcher`, `SituationCheckButton`, `AssistantButton`, `Button` (in About link), `Footer`, numbered `Step` items.
- **Responsive:** CTAs stack on mobile, sit side-by-side at `md`, and move to a right column at `lg`. Header nav inline from `md`.
- **States:** static page — no loading/error. The only interactive states are hover/focus/active on the two CTAs and the switcher (§5). Empty/edge cases: none (content is fixed).

### 4.2 Situation Check (`/check`) — Client Component (TS §6)

**Mobile — idle / empty:**

```
┌───────────────────────────────┐
│ ▸← Back        ▸SASANA  [ID|EN]│
├───────────────────────────────┤
│  Situation Check              │  ← text-h1
│  Check your photo against     │  ← text-sm secondary
│  Balinese custom.             │
│                               │
│  I'm at a…   [ Temple    ▾ ]  │  ← ContextSelector (segmented/select)
│                               │
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│ │        ▸ImageUp           │ │  ← CameraUploader (empty well)
│ │   Take or upload a photo  │ │     dashed border, radius-lg, sunken bg
│ │   JPG or PNG, up to 5 MB  │ │
│ │  (▸Camera Take) (▸Gallery)│ │  ← two buttons inside well
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
│                               │
│ ▸ShieldCheck  Your photo is   │  ← Privacy notice (persistent, xs)
│   analyzed once, never stored.│
│                               │
│ <<   Analyze photo   >>       │  ← primary btn, sticky bottom, disabled
│                               │     until an image is selected
└───────────────────────────────┘
```

**Mobile — loading:** the well is replaced by the selected photo thumbnail (dimmed) + a centered `LoadingSpinner` and label "Analyzing your photo…"; the Analyze button shows an inline spinner and is disabled; a `ResultCard` **skeleton** occupies the result slot.

**Mobile — success (result shown):** photo thumbnail stays at top; below it the `ResultCard` in one of four variants:

```
┌───────────────────────────────┐   ← not_compliant example
│▓▓▓▓▓ ▸CircleX  Please adjust ▓▓│  ← status header band (tinted bad-bg)
├───────────────────────────────┤
│ You appear to be wearing      │  ← reason (text-base)
│ shorts in a temple area.      │
│                               │
│ ▸ Suggestion                  │
│ Wrap a kamen and sash before  │  ← suggestion (text-base, medium)
│ entering the inner courtyard. │
│                               │
│ Ref: Bali Circular No. 7/2025 │  ← SourceReference (text-sm muted)
├───────────────────────────────┤
│ (▸RefreshCw  Check another)   │  ← secondary btn → resets to idle
└───────────────────────────────┘
```

- **Four status variants** render the same layout with swapped icon/label/colors (full-width tinted header band + full border, **no side-stripe** — §5.3):
  - `compliant` → `CircleCheck`, green, "You're good to go".
  - `needs_attention` → `TriangleAlert`, amber, "A small thing to check".
  - `not_compliant` → `CircleX`, red, "Please adjust".
  - `unclear` → `CircleHelp`, stone, "I can't tell from this photo" + prominent **Retake** CTA (FR1.5).
- **Error state:** `ErrorFallback` replaces the result slot: "Something went wrong analyzing your photo." + `(Try again)` re-submits the same image (PRD §7).
- **Empty state:** the dashed well itself (above) is the empty state.
- **Privacy notice placement:** persistent, directly **above** the Analyze button and again in the footer (PRD §7/§19). Never hidden behind a click.
- **Components:** `ContextSelector`, `CameraUploader`, `Button`, `LoadingSpinner`, `Skeleton`, `ResultCard`, `SourceReference`, `ErrorFallback`, `Header`, `LanguageSwitcher`.
- **Responsive:** at `md+`, max-width 600px centered; the Analyze button becomes a normal (non-sticky) inline button; photo + result can sit side-by-side at `lg` (photo left, result right) if space allows, otherwise stacked.

### 4.3 Custom Assistant (`/assistant`) — Client Component (TS §6)

**Mobile — empty / welcome:**

```
┌───────────────────────────────┐
│ ▸← Back        ▸SASANA  [ID|EN]│
├───────────────────────────────┤
│                               │
│      ▸(avatar) Sasana         │  ← assistant welcome (EmptyState)
│  Hi! Ask me anything about    │
│  Balinese customs and sacred  │
│  sites. I answer from the     │
│  official rules.              │
│                               │
│  Try asking:                  │
│  ( Can I wear shorts? )       │  ← QuickChips (3–5), pill, wrap
│  ( Drone at Tanah Lot? )      │
│  ( What is a canang? )        │
│                               │
│                               │
│                        (grows)│  ← message list scroll area
├───────────────────────────────┤
│ [ Ask about a custom…   ▸Send]│  ← input bar (sticky bottom)
│ Answers come from official ru…│  ← helper micro-copy (xs)
└───────────────────────────────┘
```

**Mobile — conversation:**

```
│                               │
│              ┌──────────────┐ │  ← user bubble (right, primary fill)
│              │ Can I wear   │ │
│              │ shorts?      │ │
│              └──────────────┘ │
│ ┌───────────────────────────┐ │
│ │▸ Modest dress is required  │ │  ← assistant bubble (left, surface)
│ │ at temples. Wear a kamen…  │ │
│ │ ─────────────────────────  │ │
│ │ ▸ Source: Circular 7/2025  │ │  ← SourceReference inside bubble
│ └───────────────────────────┘ │
│ ┌────────┐                    │
│ │ ▸ ● ● ● │                    │  ← typing indicator (assistant)
│ └────────┘                    │
```

- **Message list:** user bubbles right-aligned (`--color-primary` fill, `--color-primary-fg` text, `radius-lg` with the bottom-right corner squared to a tail); assistant bubbles left-aligned (`--color-surface`, `--color-text`, 1px `--color-border`, bottom-left corner squared) with a small circular **avatar** (prada mark on segara) preceding the first assistant bubble in a turn.
- **SourceReference:** a divider + `Source: …` line inside assistant bubbles when `grounded === true` (FR2.2). When `grounded === false`, the bubble instead shows a subtle "No official rule found for this" note (FR2.1) and omits a source.
- **QuickChips:** 3–5 example questions (FR2.5) shown in the empty state and again above the input once the chat is short; tapping fills + sends. They collapse (hide) once the conversation has several turns to save space.
- **Typing indicator:** three-dot pulse in an assistant-styled bubble while awaiting `/api/chat`.
- **Error state:** an assistant-side `ErrorFallback` bubble: "I couldn't reach the assistant just now." + `(Try again)` re-sends the last message.
- **Components:** `EmptyState`, `ChatBubble` (user/assistant), `SourceReference`, `QuickChip` (via `QuickChips`), `Button` (Send/icon), typing `LoadingSpinner` variant, `ErrorFallback`, `Header`, `LanguageSwitcher`.
- **Responsive:** input bar is sticky bottom on mobile; at `md+` max-width 600px centered, input bar pinned to the bottom of the centered column. Avatar hidden below `sm` only if space-constrained (keep by default).

### 4.4 About (`/about`) — Server Component (TS §6)

**Mobile:**

```
┌───────────────────────────────┐
│ ▸← Back        ▸SASANA  [ID|EN]│
├───────────────────────────────┤
│  About SASANA                 │  ← text-h1
│                               │
│  Our mission                  │  ← text-h2
│  SASANA helps visitors        │  ← prose, max 65ch
│  understand and respect Bali's│
│  customs, in real time and in │
│  their own language, so that  │
│  violations are prevented     │
│  before they happen.          │
│                               │
│  The rules we reference       │  ← text-h2
│ ┌───────────────────────────┐ │
│ │ ▸ShieldCheck  Governor     │ │  ← Card: Circular reference
│ │ Circular (SE) No. 7 / 2025 │ │
│ │ Code of conduct for foreign│ │
│ │ tourists in Bali.          │ │
│ │ (▸Download / Read source ) │ │  ← link/download button
│ └───────────────────────────┘ │
│                               │
│  The team                     │  ← text-h2
│  SMK Wikrama Bogor — SASANA   │
│  • Daniyal Hafiidz Prasetyo   │  ← list (PRD §17 names/roles)
│  • Manu Caimpiyana Bhimasena  │
│  • Rafli Halomoan             │
│                               │
│  SASANA v1.0 (MVP)            │  ← app version, text-sm muted
├───────────────────────────────┤
│ Photos are never stored. Home │  ← footer
└───────────────────────────────┘
```

- **Components:** `Card`, `Button` (download/external link), `Header`, `LanguageSwitcher`, `Footer`.
- **Responsive:** single prose column, max 680px; at `lg` the reference `Card` and team list may sit two-column. Ships zero interactive JS (static).
- **States:** static. The download link opens the official source in a new tab (external link → `rel="noopener noreferrer"`, requires user action; no auto-download).
- **Version:** rendered from a constant (`APP_VERSION`), text-sm muted.

---

## 5. Component Design Specs

Conventions: all interactive targets **≥44×44px** (P5); focus = 2px `--color-focus` outline + `shadow-focus` halo; transitions use `--ease-out-quart` (§9); icons stroke `1.75`. Types below are the buildable prop contracts (align with TS Appendix A).

### 5.1 Button — `components/ui/Button.tsx`

```ts
interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;           // optional leading icon
  iconPosition?: "leading" | "trailing";
  loading?: boolean;           // shows spinner, disables
  disabled?: boolean;
  href?: string;               // renders next/link if present
  onClick?: () => void;
  "aria-label"?: string;       // required when icon-only
  children?: React.ReactNode;
}
```

| Variant | Rest | Hover | Active | Text |
|---|---|---|---|---|
| `primary` | bg `--color-primary` | bg `--color-primary-hover` | bg `--color-primary-hover`, `scale .98` | `--color-primary-fg` |
| `secondary` | bg `--color-surface`, 1px `--color-border-strong` | bg `--color-surface-sunken` | `scale .98` | `--color-text` |
| `ghost` | transparent | bg `--color-primary-tint` | `scale .98` | `--color-primary` |
| `danger` | bg `--status-bad-fg` | darker 8% | `scale .98` | white |

- **Sizes:** `sm` h-36px / `text-sm` / px-12; `md` h-44px / `text-base` / px-16; `lg` h-56px / `text-lg` / px-24 (landing CTAs). Radius `radius-md` (pills use `radius-full` via `ghost` chip usage).
- **States:** `disabled` → `--color-text-muted` on `--color-surface-sunken`, `cursor-not-allowed`, no hover. `loading` → leading `LoadingSpinner size=sm`, label stays, pointer disabled.
- **Motion:** `transition-[background,transform] duration-150 ease-out`; press `active:scale-[0.98]`.
- **A11y:** real `<button>` (or `<a>` when `href`); icon-only requires `aria-label`; `disabled`/`aria-disabled`; `loading` sets `aria-busy="true"`. Focus-visible ring only (not on mouse press).
- **Touch:** min 44×44 even at `sm` (pad the hit area).

### 5.2 Card — `components/ui/Card.tsx`

```ts
interface CardProps {
  as?: keyof JSX.IntrinsicElements;   // default "div"
  padding?: "sm" | "md" | "lg";       // 16 / 20 / 24
  interactive?: boolean;              // adds hover elevation + cursor
  className?: string;
  children: React.ReactNode;
}
```

- **Visual:** bg `--color-surface`, 1px `--color-border`, `radius-lg`, `shadow-sm`. `interactive` → `hover:shadow-md`, `hover:-translate-y-0.5`.
- **States:** rest / hover (interactive only) / focus-within (if it contains a link).
- **A11y:** presentational by default; if the whole card is a link, wrap content in one `<a>` and give it the accessible name. **Never nest cards** (design law).
- **Motion:** `transition-[box-shadow,transform] duration-200 ease-out`.

### 5.3 ResultCard — `components/check/ResultCard.tsx`

```ts
interface ResultCardProps {
  result: VisionResult;   // { status, reason, suggestion, reference }
  onReset?: () => void;   // "Check another" / "Retake"
}
```

- **Layout (all variants identical, tokens swap by `status`):** a **full-width status header band** (icon + status label) using the status `-bg` tint and `-fg` text, then body with `reason`, a `Suggestion` subsection, and `SourceReference`. Full 1px `-border` around the card. **No `border-left` accent stripe** (banned); the header band + icon carry status.

| `status` | Icon | Header label (EN) | Header/border tokens |
|---|---|---|---|
| `compliant` | `CircleCheck` | You're good to go | `--status-ok-*` |
| `needs_attention` | `TriangleAlert` | A small thing to check | `--status-warn-*` |
| `not_compliant` | `CircleX` | Please adjust | `--status-bad-*` |
| `unclear` | `CircleHelp` | I can't tell from this photo | `--status-unknown-*` |

- **`unclear` extra:** hides `reference` (usually empty), shows a prominent **Retake photo** primary button wired to `onReset` (FR1.5).
- **States:** static once rendered; the reset button follows Button states. Entrance animation §9.4.
- **A11y:** card `role="status"` + `aria-live="polite"` so screen readers announce the result on render (§8). Status label is real text, not color-only. Icon `aria-hidden` (label conveys meaning).
- **Motion:** entrance fade+rise (§9.4); no motion on the semantic content itself.

### 5.4 LoadingSpinner — `components/ui/LoadingSpinner.tsx`

```ts
interface LoadingSpinnerProps {
  size?: "sm" | "md";     // 16 / 24
  label?: string;         // visible or SR-only status text
  variant?: "ring" | "dots";  // ring = default; dots = chat typing
}
```

- **Visual:** `ring` = 2px `--color-border` track with a `--color-primary` arc rotating; `dots` = three `--color-text-muted` dots pulsing (chat typing indicator).
- **A11y:** wrapper `role="status" aria-live="polite"`; if `label` omitted, include SR-only "Loading". Respects `prefers-reduced-motion` (spinner becomes a static labeled state).
- **Motion:** `animate-spin` (ring) at 0.8s linear; dots keyframe §9.5.

### 5.5 Skeleton — `components/ui/Skeleton.tsx`

```ts
interface SkeletonProps {
  variant?: "text" | "block" | "card";
  lines?: number;         // for "text"
  className?: string;
}
```

- **Visual:** `--color-surface-sunken` base with a subtle shimmer sweep (opacity, not layout). The sweep is the one **permitted gradient** on this screen: a single-hue alpha ramp of `--color-surface`, `linear-gradient(90deg, transparent, rgb(255 253 249 / .65) 50%, transparent)` (DL1, Guardrails §2.2). `card` mirrors `ResultCard` shape (header band bar + 2 text lines + button bar) so there is no layout shift on load (§8/§9).
- **A11y:** `aria-hidden="true"` (the live region on the real result announces); container has SR-only "Analyzing".
- **Motion:** shimmer via `background-position` keyframe; disabled under reduced-motion (static tint).

### 5.6 ChatBubble — `components/assistant/ChatBubble.tsx`

```ts
interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  source?: string | null;   // assistant only
  grounded?: boolean;       // assistant only
  isFirstOfTurn?: boolean;  // controls avatar render
}
```

| Variant | Align | Fill | Text | Corner tail |
|---|---|---|---|---|
| `user` | right | `--color-primary` | `--color-primary-fg` | bottom-right squared |
| `assistant` | left | `--color-surface` + 1px `--color-border` | `--color-text` | bottom-left squared |

- **Assistant extras:** circular avatar (28px, prada mark on segara) shown when `isFirstOfTurn`; renders `SourceReference` when `grounded && source`; renders the "no official rule" note when `grounded === false`.
- **Sizing:** max-width 85% (mobile) / 75% (desktop); padding `space-3`/`space-4`; `radius-lg`; `text-base` 1.55 line-height.
- **A11y:** list of bubbles in a `<ul role="log" aria-live="polite" aria-relevant="additions">` so new messages are announced; each bubble labels its role for SR ("You said…", "Assistant said…") via SR-only text.
- **Motion:** fade+rise in on mount (§9.5); reduced-motion → fade only.

### 5.7 QuickChip — `components/assistant/QuickChips.tsx` (item within `QuickChips`)

```ts
interface QuickChipProps {
  label: string;
  onSelect: (label: string) => void;
  disabled?: boolean;
}
interface QuickChipsProps { chips: string[]; onPick: (q: string) => void; disabled?: boolean; }
```

- **Visual:** pill (`radius-full`), bg `--color-surface`, 1px `--color-border-strong`, `text-sm`, `--color-primary` label. Hover → bg `--color-primary-tint`. Height 40px (44px hit area with padding).
- **States:** rest / hover / active (`scale .98`) / disabled (muted, while a request is in flight).
- **A11y:** real `<button>`; group wrapped with `aria-label="Example questions"`; keyboard: Tab between chips, Enter/Space activates.
- **Motion:** `transition-colors duration-150 ease-out`.

### 5.8 SourceReference — `components/assistant/SourceReference.tsx`

```ts
interface SourceReferenceProps {
  source: string | null;
  grounded: boolean;
}
```

- **Visual:** a top hairline divider (`--color-border`) then a `text-sm` `--color-text-secondary` line with a small `ShieldCheck` icon: `Source: {source}`. If `grounded === false`: no divider, a muted italic note "No official rule found for this" (never fabricated — FR2.1).
- **A11y:** the label "Source:" is real text; icon `aria-hidden`. Not a link in MVP (plain citation), so no focus target.

### 5.9 LanguageSwitcher — `components/layout/LanguageSwitcher.tsx`

```ts
// reads/writes LanguageContext (TS §7); no props
type Lang = "id" | "en";
```

- **Visual:** a two-segment pill toggle `[ ID | EN ]`, active segment filled `--color-primary` / `--color-primary-fg`, inactive `--color-text-secondary` on `--color-surface`. Height 36–40px, each segment ≥44px wide (hit area). Leading `Languages` icon optional on small header.
- **States:** active/inactive per segment; hover on inactive → `--color-primary-tint`; focus ring on the group.
- **Behavior:** updates context, persists to `localStorage` (`sasana.lang`), sets `<html lang>` (§8). All visible copy re-renders via `t(lang, key)` (§10).
- **A11y:** `role="group" aria-label="Language"`; each segment a `button` with `aria-pressed`; keyboard: Tab to group, Arrow/Enter to switch. Announce change politely.
- **Motion:** the active-segment indicator slides via `transform` (200ms ease-out), not width animation (§9.6).

### 5.10 CameraUploader — `components/check/CameraUploader.tsx`

```ts
interface CameraUploaderProps {
  onImageReady: (base64: string, mimeType: string) => void;
  disabled?: boolean;
}
```

- **Empty (well):** dashed 2px `--color-border-strong`, `radius-lg`, `--color-surface-sunken` bg, centered `ImageUp` (24) + prompt + two buttons: **Take photo** (`<input capture="environment">`) and **Upload** (gallery). Min height 200px.
- **Selected (preview):** shows the image thumbnail (`object-cover`, `radius-md`), a small `X` to clear, and a filename/size caption.
- **Validation:** enforce JPG/PNG ≤5MB (FR1.1); on reject show inline `text-sm --status-bad-fg` message and do **not** call `onImageReady`. Client-downsize to ≤1024px long edge before base64 (TS §8.2).
- **States:** empty / drag-over (`--color-primary-tint` fill, on desktop) / selected / error / disabled.
- **A11y:** the well is a labeled control group; buttons are real `<button>`/labeled `<input>`; error uses `aria-describedby` on the control; drag-drop has an equivalent button path (never drag-only).
- **Touch:** both buttons ≥44px; entire well is a large tap target on mobile.

### 5.11 ContextSelector — `components/check/ContextSelector.tsx`

```ts
interface ContextSelectorProps {
  value: "temple" | "general";
  onChange: (c: "temple" | "general") => void;
}
```

- **Visual:** segmented control (preferred over dropdown for 2 options): `[ At a temple | General ]`, active filled `--color-primary`. On very small screens or if extended later, degrade to a native `<select>` with `ChevronDown`. Height 44px.
- **States:** active/inactive segment, hover, focus, disabled (during loading).
- **A11y:** `role="radiogroup" aria-label="Where are you?"`; segments `role="radio" aria-checked`; Arrow-key navigation.
- **Motion:** sliding indicator via `transform` (200ms ease-out).

### 5.12 ErrorFallback — `components/ui/ErrorFallback.tsx`

```ts
interface ErrorFallbackProps {
  message?: string;        // defaults to friendly generic
  onRetry: () => void;
  compact?: boolean;       // inline (chat) vs block (check)
}
```

- **Visual:** `--status-warn-bg` surface, 1px `--status-warn-border`, `TriangleAlert` icon in `--status-warn-fg`, friendly message, and a `secondary` **Try again** button. Never a stack trace, never blame the user (P2).
- **States:** static + the retry button's own states.
- **A11y:** container `role="alert"` (assertive) so failures are announced immediately; retry button clearly labeled.
- **Motion:** fade in (§9).

### 5.13 EmptyState — `components/ui/EmptyState.tsx`

```ts
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;   // e.g. QuickChips or a CTA
}
```

- **Visual:** centered, generous vertical padding (`space-12`), muted icon (32), `text-h3` title, `text-base --color-text-secondary` description, optional actions below. Used for the assistant welcome and any "nothing yet" slot.
- **A11y:** headings use real heading levels; decorative icon `aria-hidden`.
- **Motion:** gentle fade in on mount.

---

## 6. User Flow Diagrams

### 6.1 Situation Check flow (F1)

```
 Landing (/)
   │ tap "Situation Check"
   ▼
 /check  ── idle/empty ────────────────────────────────┐
   │ pick context (temple|general)                      │
   │ Take photo ─or─ Upload                              │
   ▼                                                    │
 image selected → validate (JPG/PNG ≤5MB)               │
   │ invalid → inline error, stay ◄─────────────────────┘
   │ valid → Analyze enabled
   ▼ tap Analyze
 loading (spinner + skeleton)  ── POST /api/vision (TS §5.1)
   │
   ├─ success → ResultCard variant:
   │     compliant  → "You're good to go"      ─┐
   │     needs_attn → "A small thing to check"  ├─ (RefreshCw) "Check another" → idle
   │     not_compl. → "Please adjust"          ─┘
   │     unclear    → "I can't tell" → (Retake) → idle   (FR1.5)
   │
   └─ error → ErrorFallback → (Try again) → loading (same image)   (PRD §7)
```

### 6.2 Assistant flow (F2)

```
 Landing (/)
   │ tap "Ask the Assistant"
   ▼
 /assistant ── empty (welcome + QuickChips)
   │ type a question  ─or─  tap a QuickChip (auto-fills + sends)   (FR2.5)
   ▼ Send
 typing indicator ── POST /api/chat (retrieve rules → grounded prompt, TS §5.2)
   │
   ├─ grounded=true  → assistant bubble + Source: Circular 7/2025   (FR2.2)
   ├─ grounded=false → assistant bubble "No official info…" (no source, no fabrication)  (FR2.1)
   └─ error → ErrorFallback bubble → (Try again) resends last message
   │
   ▼ history preserved in session (FR2.4)
 continue conversation ──► (loop back to "type a question")
```

### 6.3 Language switch flow (persist)

```
 Any page, header [ ID | EN ]
   │ tap the other segment
   ▼
 setLang(next)  →  Context updates
   │
   ├─ localStorage["sasana.lang"] = next     (persists across reloads/pages)
   ├─ <html lang> = next                     (a11y, §8)
   └─ all t(lang, key) copy re-renders (150ms fade)
   │
   ▼ next visit / route change → LanguageProvider reads localStorage → same choice
```

---

## 7. Responsive Behavior

| Page | Mobile (base–`sm`) | Tablet (`md`) | Desktop (`lg`–`xl`) |
|---|---|---|---|
| **Landing `/`** | Single column; CTAs full-width stacked; "how it works" vertical ①②③; header wordmark + switcher only. | CTAs side-by-side (2-col); header shows inline About link; "how it works" 3-col with connecting rule. | Hero two-column (copy left ≤520px, CTAs right); container capped 1120px; larger `text-display`. |
| **Check `/check`** | Full-bleed; Analyze button **sticky** bottom; well ≥200px; result stacks under photo. | Max-w 600px centered; Analyze inline (non-sticky). | Same 600px column; optionally photo left / result right at `lg` if both fit. |
| **Assistant `/assistant`** | Full-height column; input bar sticky bottom; chips wrap; avatar shown. | Max-w 600px centered; input pinned to column bottom. | Same; more vertical room shows more history without scroll. |
| **About `/about`** | Single prose column ≤680px; reference card full-width; team as list. | Same, roomier padding. | Reference card + team may go 2-col; prose stays ≤680px. |
| **Header (all)** | Back arrow (on subpages) + wordmark + `[ID|EN]`. | Adds inline nav where relevant. | Inline nav + switcher, generous gutters. |

Global: gutters `px-4 → sm:px-6 → lg:px-8`; type steps up one notch at `sm`; sticky bottom actions only exist at mobile widths (they become inline at `md+`).

---

## 8. Accessibility Checklist (WCAG 2.1 AA)

**Contrast (target: ≥4.5:1 text, ≥3:1 large text & UI/icons).** The light theme was chosen for outdoor legibility (§theme rationale).

| Pairing | Ratio (approx) | Result |
|---|---|---|
| `--color-text` `#2A2520` on `--color-bg` `#F6F1E9` | ~11:1 | ✅ AAA |
| `--color-text-secondary` `#5C544A` on `--color-surface` | ~6.5:1 | ✅ AA |
| `--color-primary-fg` on `--color-primary` (button) | ~7:1 | ✅ AA |
| `--color-primary` `#1D4E89` as link text on `--color-bg` | ~7:1 | ✅ AA |
| `--status-ok-fg` `#2E7D46` on `--status-ok-bg` `#E8F3EB` | ~4.6:1 | ✅ AA |
| `--status-warn-fg` `#8A5A00` on `--status-warn-bg` `#FBF1DE` | ~5.6:1 | ✅ AA |
| `--status-bad-fg` `#B23A2E` on `--status-bad-bg` `#FBEAE7` | ~5.0:1 | ✅ AA |
| `--status-unknown-fg` `#6B6459` on `--status-unknown-bg` `#F0ECE4` | ~4.7:1 | ✅ AA |
| `--color-accent` gold as **body text** | <4.5:1 | ❌ → use `--color-accent-strong` or restrict gold to ≥24px/decorative |

**Checklist:**

- [ ] **Color is never the only signal.** Every status uses icon + text label + color (P4). Charts/badges labeled.
- [ ] **Focus indicators.** Visible 2px `--color-focus` outline + `shadow-focus` on every interactive element; `:focus-visible` (not on mouse). Ring ≥3:1 against adjacent colors.
- [ ] **Keyboard.** All flows operable without a pointer: Tab order follows DOM; segmented controls use Arrow keys; Enter/Space activate; Esc closes any sheet/menu; no keyboard traps.
- [ ] **Touch targets** ≥44×44px (P5, §5).
- [ ] **Semantic HTML.** One `<h1>` per page; landmarks `<header> <main> <footer> <nav>`; real `<button>`/`<a>`; chat list `role="log"`; result `role="status"`; errors `role="alert"`.
- [ ] **Screen reader / live regions.** Result announced via `aria-live="polite"`; new chat messages via the `log`; errors assertive; loading via `role="status"`.
- [ ] **Form labels.** File input, context selector, and chat input all have programmatic labels; validation errors linked via `aria-describedby`; the send button labeled.
- [ ] **Language attribute switching.** `<html lang="id|en">` updates with the switcher (§6.3); answer language also reflects choice (FR2.3).
- [ ] **Images.** User photo preview has meaningful `alt` ("Your uploaded photo"); decorative icons `aria-hidden`.
- [ ] **Reduced motion.** `@media (prefers-reduced-motion: reduce)` disables entrance/slide animations, keeps opacity-only fades (§9).
- [ ] **Zoom / reflow.** Layout reflows to 320px width and 200% zoom with no horizontal scroll (single-column base helps).
- [ ] **Errors are humane** (P2): friendly, actionable, never a raw error code.

---

## 9. Micro-interactions & Animations

**Global easing tokens** (Tailwind `transitionTimingFunction` extension): `ease-out-quart = cubic-bezier(0.25, 1, 0.5, 1)`, `ease-out-expo = cubic-bezier(0.16, 1, 0.3, 1)`. **No bounce/elastic** (DL6). **Never animate layout props** (width/height/top); use `transform`/`opacity` only. **No animated gradients** (DL1), no scroll-jacking, no confetti, no typewriter reveal — the motion budget stays calm and small (P2, Guardrails §7). Durations: 120–150ms (feedback), 200ms (transitions), 300–400ms (entrances).

| Interaction | Trigger | Spec | Approach |
|---|---|---|---|
| **9.1 Page transition** | route change | 200ms opacity + 8px rise on the incoming `<main>` | Tailwind `animate-[fadeUp]`; reduced-motion → instant |
| **9.2 Button hover** | pointer over | bg shift 150ms; cursor pointer | `transition-colors duration-150 ease-out` |
| **9.3 Button press** | active | `scale(0.98)` 120ms | `active:scale-[0.98] transition-transform` |
| **9.4 ResultCard entrance** | result mount | fade + 12px rise, 320ms `ease-out-quart`; status icon does a subtle 200ms scale-in *after* (`0→1`) to draw the eye calmly | keyframe `resultIn`; icon `delay-150` |
| **9.5 Chat message in** | new bubble | fade + 8px rise, 240ms `ease-out-quart`, staggered per message | keyframe `msgIn` |
| **9.5b Typing indicator** | awaiting reply | 3 dots opacity 0.3→1 loop, 1.2s, staggered 0/150/300ms | keyframe `dotPulse` |
| **9.6 Language switch** | segment toggle | active indicator slides via `transform` 200ms; copy cross-fades 150ms | `transition-transform`; content `key`-remount fade |
| **9.7 Skeleton shimmer** | loading | `background-position` sweep 1.4s linear loop | keyframe `shimmer`; off under reduced-motion |
| **9.8 Upload drag-over** | file drag | well bg → `--color-primary-tint`, border solid, 150ms | `transition-colors` |
| **9.9 Spinner** | any load | ring rotate 0.8s linear | `animate-spin` |

**Keyframe stubs (globals.css):**

```css
@keyframes fadeUp   { from { opacity:0; transform:translateY(8px);  } to { opacity:1; transform:none; } }
@keyframes resultIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
@keyframes msgIn    { from { opacity:0; transform:translateY(8px);  } to { opacity:1; transform:none; } }
@keyframes dotPulse { 0%,100%{opacity:.3} 50%{opacity:1} }
@keyframes shimmer  { from{background-position:-200% 0} to{background-position:200% 0} }
@media (prefers-reduced-motion: reduce) {
  * { animation-duration:.001ms !important; animation-iteration-count:1 !important; transition-duration:.001ms !important; }
}
```

**Approach rule:** use **Tailwind transition utilities** for state feedback (hover/press/color) and **CSS keyframes** (above) for entrances and loops. Keep total motion budget small and calm (P2).

---

## 10. Copy & Tone Guidelines (EN + ID)

**Voice:** a knowledgeable, warm local friend. Always lead with what to do, not what's wrong (FR1.4). Plain words, short sentences, no jargon, **no em dashes**, no exclamation overload. Never shame the user; assume good intent (PRD §2 "ignorance, not malice").

### 10.1 Global / navigation

| Key | EN | ID |
|---|---|---|
| `app.name` | SASANA | SASANA |
| `app.tagline` | Understand and respect Balinese customs, before you enter. | Pahami dan hormati adat Bali, sebelum Anda masuk. |
| `nav.back` | Back | Kembali |
| `nav.home` | Home | Beranda |
| `nav.about` | About | Tentang |
| `lang.label` | Language | Bahasa |

### 10.2 Landing

| Key | EN | ID |
|---|---|---|
| `landing.lead` | Your friendly guide to sacred sites in Bali. | Panduan ramah Anda untuk tempat suci di Bali. |
| `cta.check.title` | Situation Check | Cek Situasi |
| `cta.check.desc` | Check a photo against local custom. | Periksa foto sesuai adat setempat. |
| `cta.assistant.title` | Ask the Assistant | Tanya Asisten |
| `cta.assistant.desc` | Questions about the rules, answered. | Pertanyaan tentang aturan, terjawab. |
| `how.title` | How it works | Cara kerjanya |
| `how.step1` | Snap or upload a photo | Ambil atau unggah foto |
| `how.step2` | Get friendly feedback | Dapatkan masukan yang ramah |
| `how.step3` | Enter with confidence | Masuk dengan percaya diri |
| `footer.disclaimer` | Not affiliated with the Bali government. Reference: Governor Circular No. 7/2025. | Tidak berafiliasi dengan pemerintah Bali. Rujukan: Surat Edaran Gubernur No. 7/2025. |
| `footer.privacy` | Photos are never stored. | Foto tidak pernah disimpan. |

### 10.3 Situation Check

| Key | EN | ID |
|---|---|---|
| `check.title` | Situation Check | Cek Situasi |
| `check.subtitle` | Check your photo against Balinese custom. | Periksa foto Anda sesuai adat Bali. |
| `check.context.label` | Where are you? | Anda sedang di mana? |
| `check.context.temple` | At a temple | Di pura |
| `check.context.general` | General | Umum |
| `check.upload.prompt` | Take or upload a photo | Ambil atau unggah foto |
| `check.upload.hint` | JPG or PNG, up to 5 MB | JPG atau PNG, maksimal 5 MB |
| `check.upload.take` | Take photo | Ambil foto |
| `check.upload.pick` | Upload | Unggah |
| `check.upload.clear` | Remove photo | Hapus foto |
| `check.privacy` | Your photo is analyzed once and never stored. On the free AI tier, Google may use submitted data to improve its products. | Foto Anda dianalisis sekali saja dan tidak pernah disimpan. Pada layanan AI gratis, Google dapat memakai data yang dikirim untuk meningkatkan produknya. |
| `check.analyze` | Analyze photo | Analisis foto |
| `check.loading` | Analyzing your photo… | Menganalisis foto Anda… |
| `check.reset` | Check another | Cek yang lain |

**Result templates** (the AI fills `reason`/`suggestion`; these are the fixed frame labels):

| Status | Header EN | Header ID | Suggestion label EN / ID |
|---|---|---|---|
| `compliant` | You're good to go | Anda sudah sesuai | Tip / Tips |
| `needs_attention` | A small thing to check | Ada hal kecil untuk diperiksa | Suggestion / Saran |
| `not_compliant` | Please adjust before entering | Mohon sesuaikan sebelum masuk | Suggestion / Saran |
| `unclear` | I can't tell from this photo | Saya belum bisa memastikan dari foto ini | Try this / Coba ini |

| Key | EN | ID |
|---|---|---|
| `check.unclear.retake` | Retake photo | Ambil ulang foto |
| `check.source` | Reference: {source} | Rujukan: {source} |
| `check.error` | Something went wrong analyzing your photo. Please try again. | Terjadi masalah saat menganalisis foto Anda. Silakan coba lagi. |
| `common.retry` | Try again | Coba lagi |

### 10.4 Custom Assistant

| Key | EN | ID |
|---|---|---|
| `assistant.welcome.title` | Hi, I'm Sasana | Hai, saya Sasana |
| `assistant.welcome.body` | Ask me anything about Balinese customs and sacred sites. I answer from the official rules. | Tanyakan apa saja tentang adat Bali dan tempat suci. Saya menjawab dari aturan resmi. |
| `assistant.tryasking` | Try asking: | Coba tanyakan: |
| `assistant.chip.shorts` | Can I wear shorts at a temple? | Boleh pakai celana pendek di pura? |
| `assistant.chip.drone` | Can I fly a drone at Tanah Lot? | Boleh terbangkan drone di Tanah Lot? |
| `assistant.chip.canang` | What is a canang offering? | Apa itu canang? |
| `assistant.chip.photo` | Is it okay to take photos inside? | Boleh memotret di dalam? |
| `assistant.input.placeholder` | Ask about a custom… | Tanya tentang adat… |
| `assistant.send` | Send | Kirim |
| `assistant.helper` | Answers come from official rules, not opinions. | Jawaban berasal dari aturan resmi, bukan opini. |
| `assistant.source` | Source: {source} | Sumber: {source} |
| `assistant.ungrounded` | I don't have official information on that in the Bali code of conduct. | Saya tidak punya informasi resmi soal itu dalam tata krama Bali. |
| `assistant.typing` | Sasana is typing… | Sasana sedang mengetik… |
| `assistant.error` | I couldn't reach the assistant just now. Please try again. | Saya belum bisa menghubungi asisten saat ini. Silakan coba lagi. |

### 10.5 About

| Key | EN | ID |
|---|---|---|
| `about.title` | About SASANA | Tentang SASANA |
| `about.mission.title` | Our mission | Misi kami |
| `about.mission.body` | SASANA helps visitors understand and respect Bali's customs, in real time and in their own language, so that violations are prevented before they happen. | SASANA membantu wisatawan memahami dan menghormati adat Bali, secara langsung dan dalam bahasa mereka sendiri, agar pelanggaran dapat dicegah sebelum terjadi. |
| `about.rules.title` | The rules we reference | Aturan yang kami rujuk |
| `about.rules.body` | Governor Circular (SE) No. 7 of 2025 on the code of conduct for foreign tourists in Bali. | Surat Edaran Gubernur (SE) No. 7 Tahun 2025 tentang tata krama bagi wisatawan asing di Bali. |
| `about.rules.link` | Read the official source | Baca sumber resmi |
| `about.team.title` | The team | Tim kami |
| `about.team.org` | SMK Wikrama Bogor — SASANA Group | SMK Wikrama Bogor — SASANA Group |
| `about.version` | SASANA v1.0 (MVP) | SASANA v1.0 (MVP) |

### 10.6 Tone examples (do / don't)

| Situation | ✅ Do | ❌ Don't |
|---|---|---|
| not_compliant result | "Please wrap a kamen and sash before entering the inner courtyard." | "WRONG. You are violating temple rules." |
| unclear result | "I can't tell from this photo. A clearer, well-lit shot will help." | "Invalid image. Analysis failed." |
| ungrounded question | "I don't have official information on that yet." | Inventing a rule that isn't in the knowledge base. |
| error | "Something went wrong. Please try again." | "Error 500: GenAI request failed." |

---

## Appendix — Tailwind Token Config

Drop-in `tailwind.config.ts` extension so components consume tokens by name (TS §2 `tailwind.config.ts`).

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px" },
    extend: {
      colors: {
        bg: "#F6F1E9", surface: "#FFFDF9", "surface-sunken": "#EFE8DC",
        border: { DEFAULT: "#E4DACB", strong: "#CBBFA8" },
        text: { DEFAULT: "#2A2520", secondary: "#5C544A", muted: "#8A8073" },
        primary: { DEFAULT: "#1D4E89", hover: "#163C6B", tint: "#E7EEF6", fg: "#FBFCFE" },
        accent: { DEFAULT: "#B8862B", strong: "#8A6416" },
        focus: "#3B6FB0",
        status: {
          "ok-fg": "#2E7D46", "ok-bg": "#E8F3EB", "ok-border": "#BEDDC6",
          "warn-fg": "#8A5A00", "warn-bg": "#FBF1DE", "warn-border": "#EEDBA8",
          "bad-fg": "#B23A2E", "bad-bg": "#FBEAE7", "bad-border": "#EEC4BD",
          "unknown-fg": "#6B6459", "unknown-bg": "#F0ECE4", "unknown-border": "#D9D1C4",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.4" }], sm: ["0.875rem", { lineHeight: "1.5" }],
        base: ["1rem", { lineHeight: "1.55" }], lg: ["1.25rem", { lineHeight: "1.4" }],
        h3: ["1.563rem", { lineHeight: "1.2" }], h2: ["1.953rem", { lineHeight: "1.15" }],
        h1: ["2.488rem", { lineHeight: "1.1" }], display: ["2.986rem", { lineHeight: "1.05" }],
      },
      borderRadius: { sm: "8px", md: "12px", lg: "16px", xl: "24px" },
      boxShadow: {
        sm: "0 1px 2px rgba(42,37,32,.05), 0 1px 3px rgba(42,37,32,.04)",
        md: "0 4px 12px rgba(42,37,32,.08)",
        lg: "0 12px 32px rgba(42,37,32,.14)",
        toast: "0 8px 24px rgba(42,37,32,.16)",
      },
      transitionTimingFunction: {
        "out-quart": "cubic-bezier(0.25,1,0.5,1)",
        "out-expo": "cubic-bezier(0.16,1,0.3,1)",
      },
      keyframes: {
        fadeUp:   { from: { opacity: "0", transform: "translateY(8px)" },  to: { opacity: "1", transform: "none" } },
        resultIn: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "none" } },
        msgIn:    { from: { opacity: "0", transform: "translateY(8px)" },  to: { opacity: "1", transform: "none" } },
        dotPulse: { "0%,100%": { opacity: ".3" }, "50%": { opacity: "1" } },
      },
      animation: {
        fadeUp: "fadeUp .2s cubic-bezier(0.25,1,0.5,1)",
        resultIn: "resultIn .32s cubic-bezier(0.25,1,0.5,1)",
        msgIn: "msgIn .24s cubic-bezier(0.25,1,0.5,1)",
        dotPulse: "dotPulse 1.2s ease-in-out infinite",
      },
    },
  },
} satisfies Config;
```

---

*Derived from and cross-referenced against [PRD v1.0](./prd.md) and the [Technical Specification](./tech-spec.md). Component names and file paths match the Tech Spec so a developer can move from token → component → screen without translation. Contrast ratios are design-time approximations; verify final values with an automated checker during the a11y audit (PRD §15).*
