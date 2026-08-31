# Design System — SASANA

Technical design specification and design token contract for SASANA. Grounded in [`PRODUCT.md`](./PRODUCT.md), [`docs/ui-spec.md`](./docs/ui-spec.md), and [`docs/design-guardrails.md`](./docs/design-guardrails.md).

---

## 1. Register & Visual Philosophy

- **Register:** `product` (UI serves the task with high contrast, calm spacing, and clear guidance; `/` landing page carries a warmer brand voice).
- **Core Stance:** Warm, grounded, exact. Designed for bright outdoor sunlight at temple gates (Persona 1).
- **Cultural Grounding:** Authentic sacred symbolism over tourist clichés. Colors drawn from volcanic tuff (*paras* stone), the sea of Melasti purification (*segara* indigo), temple gilding (*prada* gold), and the *Nawa Sanga* color compass.

---

## 2. Non-Negotiable Design Laws

| # | Rule | Strict Requirement |
|---|---|---|
| **DL1** | **Gradient Law** | Gradients may **vary alpha, never hue**. Single-token alpha ramps only in three permitted places (skeleton shimmer, photo scrim, scroll-edge mask). No gradient buttons, text, borders, or status surfaces. Multi-hue ramps (purple→pink, teal→lime) are banned. |
| **DL2** | **Tokens Only** | No raw hex, `rgb()`, or arbitrary pixel values in component code. All visual properties must use defined Tailwind tokens. |
| **DL3** | **No Decorative Surface Effects** | No glow, no glassmorphism (`backdrop-blur` permitted only on scrim), no neumorphism, no 3D transforms or parallax. |
| **DL4** | **No Nested Cards** | Cards never sit inside cards. |
| **DL5** | **No Status Left-Stripe** | Status is communicated via header band + icon + label, never a `border-left` stripe. |
| **DL6** | **Calm Motion Budget** | Motion ≤400ms, transform/opacity only. No bounce, elastic, or spring overshoot. Respect `prefers-reduced-motion`. |
| **DL7** | **No Synthetic Imagery** | No AI-generated imagery or stock photos of Balinese people, ceremonies, or temples. The only images are user photos and the approved landing hero photo (ADR-0001). |
| **DL8** | **Redundant Status Signals** | Meaning is never conveyed by color alone. Every status state carries icon + text label + color. |

---

## 3. Color System & Tokens

All fills are solid, flat colors. Warm-tinted neutrals eliminate sterile `#000` / `#fff`.

### 3.1 Brand & Neutral

| Token | Class / Variable | Hex | Role |
|---|---|---|---|
| Canvas Background | `bg-bg` | `#F6F1E9` | App canvas (*paras* volcanic tuff sandstone). |
| Surface | `bg-surface` | `#FFFDF9` | Raised cards, sheets, headers. Warm near-white. |
| Sunken Surface | `bg-surface-sunken` | `#EFE8DC` | Inset areas, upload wells, input tracks. |
| Border | `border-border` | `#E4DACB` | Hairline dividers, card outlines. |
| Strong Border | `border-border-strong` | `#CBBFA8` | Input focus base, emphasised boundaries. |
| Primary Text | `text-text` | `#2A2520` | Primary typography (warm ink, never `#000`). |
| Secondary Text | `text-text-secondary` | `#5C544A` | Supporting prose, captions. |
| Muted Text | `text-text-muted` | `#8A8073` | Placeholders, disabled states, helper notes. |
| Primary (Interactive) | `bg-primary` / `text-primary` | `#1D4E89` | *Segara* indigo. Primary buttons, links, active states. |
| Primary Hover | `bg-primary-hover` | `#163C6B` | Darker active/hover state. |
| Primary Tint | `bg-primary-tint` | `#E7EEF6` | Selected chips, focus halo background. |
| Primary Foreground | `text-primary-fg` | `#FBFCFE` | Text/icons on primary fill. |
| Accent | `text-accent` / `border-accent` | `#B8862B` | *Prada* temple gilding. Logo mark, subtle rules (≤10% of screen). |
| Accent Strong | `text-accent-strong` | `#8A6416` | Gold for text requiring AA contrast. |
| Focus Ring | `colors.focus` | `#3B6FB0` | 2px focus ring with 2px offset for keyboard navigation. |
| Scrim Overlay | `--color-overlay` | `rgba(42,37,32,0.44)` | Warm ink sheet/modal backdrop. |

### 3.2 Semantic / Status (Situation Check F1)

Status colors appear **only** in result cards and validation banners, never as general accents or decoration.

| Status (`VisionStatus`) | Meaning | Text / Icon (`*-fg`) | Surface Tint (`*-bg`) | Border (`*-border`) |
|---|---|---|---|---|
| `compliant` | Respectful / All clear | `#2E7D46` (`text-status-ok-fg`) | `#E8F3EB` (`bg-status-ok-bg`) | `#BEDDC6` (`border-status-ok-border`) |
| `needs_attention` | Minor adjustment needed | `#8A5A00` (`text-status-warn-fg`) | `#FBF1DE` (`bg-status-warn-bg`) | `#EEDBA8` (`border-status-warn-border`) |
| `not_compliant` | Action required before entry | `#B23A2E` (`text-status-bad-fg`) | `#FBEAE7` (`bg-status-bad-bg`) | `#EEC4BD` (`border-status-bad-border`) |
| `unclear` | Insufficient photo context | `#6B6459` (`text-status-unknown-fg`) | `#F0ECE4` (`bg-status-unknown-bg`) | `#D9D1C4` (`border-status-unknown-border`) |

---

## 4. Typography

### 4.1 Typefaces

- **Display / Headings / Wordmark:** `Fraunces` (variable opsz serif) — authentic heritage, credibility.
- **UI / Body / Controls:** `Plus Jakarta Sans` — clean humanist geometric sans designed in Indonesia (Tokotype).

### 4.2 Scale (1.25 Major Third)

| Token | Size | Line Height | Weight | Font | Applied To |
|---|---|---|---|---|---|
| `text-display` | 47.8px / 2.986rem | 1.05 | 600 | Fraunces | Desktop landing hero headline |
| `text-h1` | 39.8px / 2.488rem | 1.1 | 600 | Fraunces | Mobile landing hero, primary page titles |
| `text-h2` | 31.2px / 1.953rem | 1.15 | 600 | Fraunces | Major section headings |
| `text-h3` | 25.0px / 1.563rem | 1.2 | 600 | Plus Jakarta Sans | Card titles, result headlines |
| `text-lg` | 20.0px / 1.250rem | 1.4 | 500 | Plus Jakarta Sans | CTA labels, hero lead paragraphs |
| `text-base` | 16.0px / 1.000rem | 1.55 | 400 | Plus Jakarta Sans | Body prose, chat messages, input fields |
| `text-sm` | 14.0px / 0.875rem | 1.5 | 400 | Plus Jakarta Sans | Captions, helper copy, source citations |
| `text-xs` | 12.0px / 0.750rem | 1.4 | 500 | Plus Jakarta Sans | Badges, tags, microcopy |

Prose line length is capped at **65ch** (`max-w-prose` / 680px).

---

## 5. Spacing, Layout & Elevation

### 5.1 Spacing & Rhythm

- Base unit: **4px** (`p-1` = 4px, `p-2` = 8px, `p-3` = 12px, `p-4` = 16px, `p-5` = 20px, `p-6` = 24px, `p-8` = 32px, `p-12` = 48px).
- **Rhythm Principle:** Vary padding for cadence. Do not apply uniform `p-4` across every element. Hero uses `py-12/16`; dense cards use `p-5/6`; controls use `py-3 px-4`.

### 5.2 Content Max-Widths

| Token | Value | Target |
|---|---|---|
| `max-w-tool` | `600px` | Single-column task pages (`/check`, `/assistant`). |
| `max-w-prose` | `680px` | Long-form reading (`/about`, guidance text). |
| `max-w-container` | `1120px` | Standard page width, landing layout. |
| `max-w-wide` | `1320px` | Explore guide panel layout. |
| `max-w-hero` | `520px` | Landing hero text container. |

### 5.3 Elevation & Shadows (Warm Ink `42, 37, 32`)

| Token | Class | Value | Applied To |
|---|---|---|---|
| Subtle | `shadow-sm` | `0 1px 2px rgba(42,37,32,.05), 0 1px 3px rgba(42,37,32,.04)` | Cards at rest, chips, pills |
| Default | `shadow-md` | `0 4px 12px rgba(42,37,32,.08)` | Hover states, result cards, sticky bars |
| Floating | `shadow-lg` | `0 12px 32px rgba(42,37,32,.14)` | Bottom sheets, dialogs, popovers |
| Toast | `shadow-toast` | `0 8px 24px rgba(42,37,32,.16)` | Transient alert banners |
| Focus | `shadow-focus` | `0 0 0 3px rgba(59,111,176,.45)` | Accessible keyboard focus ring |

### 5.4 Border Radius

- `rounded-sm` (8px): Badges, image thumbnails, small chips.
- `rounded-md` (12px): Standard buttons, text inputs, selectors.
- `rounded-lg` (16px): Cards, result containers, upload wells, bottom sheets.
- `rounded-xl` (24px): Hero containers, feature panels.
- `rounded-full` (9999px): Action pills, quick filters, icon action buttons.

---

## 6. Iconography & Media

- **Icon Set:** Lucide React (`lucide-react`).
- **Style:** Stroke width `1.75` across all icons; sizes `16` (inline), `20` (controls/chips), `24` (navigation/actions).
- **Status Mapping:**
  - `compliant`: `<CircleCheck size={24} className="text-status-ok-fg" />`
  - `needs_attention`: `<TriangleAlert size={24} className="text-status-warn-fg" />`
  - `not_compliant`: `<CircleX size={24} className="text-status-bad-fg" />`
  - `unclear`: `<CircleHelp size={24} className="text-status-unknown-fg" />`
- **Emoji Rule:** No emoji anywhere in product UI (headings, buttons, status indicators).

---

## 7. Motion & Interaction

- **Duration Bands:** 120–150ms for micro-feedback, 200–240ms for transitions (`fadeUp`, `msgIn`), 320ms for result reveal (`resultIn`).
- **Easing:** `cubic-bezier(0.25, 1, 0.5, 1)` (`ease-out-quart`).
- **Animated Shimmer:** `.skeleton-shimmer` uses single-hue `--color-surface` alpha sweep over sunken background.
- **Accessibility:** `prefers-reduced-motion` disables animations and sets durations to `0.001ms`.

---

## 8. Core Component Patterns

1. **Primary Button:** Solid `bg-primary text-primary-fg hover:bg-primary-hover active:scale-[0.98] rounded-md font-medium min-h-[48px] px-6`.
2. **Card Container:** `bg-surface border border-border rounded-lg p-5 sm:p-6 shadow-sm`.
3. **Status Result Card:** Solid background matching `bg-status-*-bg`, border `border-status-*-border`, header featuring icon + status text + explanation, leading with constructive resolution.
4. **Interactive Focus State:** Visible outline via `:focus-visible` with `outline-2 outline-focus outline-offset-2`.
5. **Touch Targets:** Minimum 44×44px for thumb tap ergonomics.

---

## 9. Scoped Carve-Outs

- **`/explore` Basemap (Guardrails §11.1):** Full-screen raster map (CARTO Voyager tiles) is exempted from the strict single-palette token constraints due to third-party raster tile rendering. Copy rules (§9), contrast rules (C6), and mobile reflow (L5) remain strictly enforced.
- **Landing Hero Photo (ADR-0001):** Single verified photograph of Bali permitted in the landing hero with warm-ink scrim overlay (`.hero-scrim`). AI-generated imagery remains strictly forbidden.
