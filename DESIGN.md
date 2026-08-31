# SASANA — Design System & Context

> **Impeccable Design Context** for SASANA.  
> Authoritative companions: [`docs/design-guardrails.md`](docs/design-guardrails.md) · [`docs/ui-spec.md`](docs/ui-spec.md) · [`CONTEXT.md`](CONTEXT.md)

---

## 1. Product & Design Philosophy

- **Mission**: SASANA is a bilingual guide helping visitors understand and respect Balinese custom at sacred places (Sites and Zones), grounded in Bali Governor Circular No. 7/2025.
- **Tone & Mood**: Dignified, calm, civic, warm, respectful. Not a tourist-brochure toy, not a generic purple AI startup dashboard.
- **Audience Context**: Daylight outdoor readability at temple gates (high contrast, warm organic tones, no unreadable glassmorphism).

---

## 2. Visual Foundation & Tokens

### 2.1 Color Palette
- **Canvas / Background**: Paras stone warm neutral (`#F6F1E9` / `--color-bg`)
- **Surfaces**:
  - `bg-surface` (`#FFFDF9`): Elevated cards, modals, sheets
  - `bg-surface-sunken` (`#EFE8DC`): Base wells, chip backgrounds, skeleton base
- **Text & Ink**:
  - `text-text` (`#2A2520`): Warm ink body and headings (No pure `#000`)
  - `text-text-secondary` (`#5C544A`): Subtitles, helper text
  - `text-text-muted` (`#8A8073`): Captions, timestamps, overlines
- **Primary Brand Color**:
  - `bg-primary` / `text-primary` (`#1D4E89` — Segara Indigo): Interactive work, primary buttons, active links
- **Accent Highlight**:
  - `text-accent` / `bg-accent` (`#B8862B` / `#8A6416` — Prada Gold): ≤10% screen coverage, step numbers, rule borders, badge text
- **Status Semantics**:
  - Compliant / OK: Green (`#2E7D46` / `#E8F3EB`)
  - Needs Attention / Warning: Amber (`#8A5A00` / `#FBF1DE`)
  - Non-Compliant / Alert: Red (`#B23A2E` / `#FBEAE7`)

### 2.2 Typography
- **Display / Headings**: Fraunces (`font-display`, serif, optical sizing, elegant editorial look)
- **UI / Body**: Plus Jakarta Sans (`font-sans`, clean geometric sans-serif)
- **Hierarchy Scale**:
  - `text-xs` (0.75rem / 12px) — Badges, overlines, timestamps
  - `text-sm` (0.875rem / 14px) — Secondary copy, button text
  - `text-base` (1rem / 16px) — Body prose
  - `text-lg` (1.25rem / 20px) — Lead text, card titles
  - `text-h3` (1.563rem / 25px) — Section titles
  - `text-h2` (1.953rem / 31px) — Major section titles
  - `text-h1` (2.488rem / 40px) — Page headings
  - `text-display` (2.986rem / 48px) — Hero headlines

### 2.3 Depth, Radii & Shadows
- **Radii**: `sm` (8px), `md` (12px), `lg` (16px), `xl` (24px), `full` (9999px)
- **Shadows**: Warm ink tint `rgba(42, 37, 32, ...)` — no pure black shadows, no colored neon outer glows.

---

## 3. Strict Design Guardrails (Anti-Slop Rules)

1. **Gradient Law**: A gradient may vary alpha, **never hue**. Single-hue ramps only (`warm ink`, `paras stone`).
2. **No Pure Black / Pure White**: All neutrals are warm-tinted.
3. **No Glassmorphism**: `backdrop-blur` is banned except for modal overlay scrims.
4. **Icons**: Lucide icons only (stroke `1.75`, sizes 16/20/24). No emoji in product UI.
5. **Imagery**: No AI-generated depictions of Balinese ceremonies, people, or temples (I4). Real licensed photograph on landing hero only (ADR-0001).
6. **Copy**: Lead with the fix, not the fault. No marketing filler ("seamless", "unlock"), no em dashes (`—`).

---

## 4. Key UI Components & Layouts

- **Landing Hero**: Full-bleed / 88vh split hero with misty Balinese temple photograph, warm-ink curve overlay, and centered floating 3-segment action bar (`/check`, `/assistant`, `/explore`).
- **Header**: Transparent dark gradient on landing hero; bordered bar with back navigation on subpages.
- **Language Switcher**: Bilingual toggle (`ID` / `EN`).
