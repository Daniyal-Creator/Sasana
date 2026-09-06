---
status: accepted
---

# Editorial closing footer with structured navigation and trust strip

`docs/design-guardrails.md` and `docs/ui-spec.md` establish SASANA as a calm, dignified cultural-respect guide for sacred places in Bali. The original footer was purely functional and minimal (a single short disclaimer and two inline links), which left the end of long-scroll pages feeling abrupt and disconnected from the brand identity.

## Context

Per `docs/footer-reference.md`, the footer is redesigned with an **Editorial Closing Footer** pattern: serving as a memorable, quiet closing statement for visitors rather than a stock SaaS link dump or ad-hoc card container.

Key architectural questions addressed:
1. **Background surface and daylight readability**: Whether to introduce a dark navy background or retain SASANA's warm paras stone palette.
2. **Navigation grouping**: Structuring links cleanly into three functional groups without broken links.
3. **Trust & legal positioning**: Highlighting privacy ("Photos are never stored") and official circular grounding (SE No. 7/2025) as prominent, first-class micro-UI.

## Decision

1. **Surface Tone**: Use **Warm Cream (`bg-surface-sunken` with `border-t border-border-strong`)**.
   - Preserves high-contrast outdoor readability under Bali sunlight (P1 in `DESIGN.md`).
   - 100% compliant with closed color tokens (Guardrails §3 C1/C2) without introducing arbitrary hex values.
2. **Layout Structure (4-area desktop, reflowing cleanly to mobile)**:
   - **Brand Area (Left)**: SASANA wordmark in Fraunces (`font-display`) with Prada Gold dot accent + Brand statement: *"Visit sacred places with confidence and respect."*
   - **Navigation Columns (Right)**: Three distinct groups:
     - **Explore**: Home (`/`), Sacred Sites (`/explore`), How It Works (`/#how-it-works`).
     - **Features**: Situation Check (`/check`), Custom Assistant (`/assistant`), Zones & Notices (`/#features`).
     - **About**: About SASANA (`/about`), Official Circular (`/about#rules`), Privacy Assurance (`/about#privacy`).
3. **Trust & Legal Strip**:
   - A dedicated horizontal split strip separated by hairlines (`border-border`).
   - Left: `ShieldCheck` icon in Prada Gold (`text-accent-strong`) with *"Photos are never stored."*
   - Right: *"Not affiliated with the Bali government. Reference: Governor Circular No. 7/2025."*
4. **Bottom Bar**:
   - Left: Copyright `© 2026 SASANA`.
   - Right: Closing micro-copy *"Travel prepared. Visit respectfully."*
5. **No floating button clutter**: No decorative floating elements; all interactions remain grounded within the structural flow.
6. **Guardrail Compliance**:
   - Micro-interaction: Subtle link hover `hover:text-primary hover:translate-x-0.5 transition-all duration-150` (≤200ms transform/opacity, Guardrails §7 M3).
   - Typography: Fraunces (`font-display`) for brand and titles, Plus Jakarta Sans (`font-sans`) for body and links (Guardrails §4 T1).
   - Icons: Lucide `ShieldCheck` only (stroke `1.75`, Guardrails §8 I1).
   - Copy: No em dashes, no marketing jargon, bilingual EN/ID support (Guardrails §9).

## Alternatives Considered

1. **Dark Navy background (`#14283B`)**:
   - Rejected because introducing raw dark navy breaks token enclosure (Guardrails C1/C2) and degrades outdoor daylight legibility at temple gates compared to the warm paras stone surface scale.
2. **Minimal 2-link footer (status quo)**:
   - Rejected because visitors could not easily discover the primary tool capabilities (`/check`, `/assistant`, `/explore`, `/about`) from the footer.

## Consequences

- The `<Footer />` component provides a cohesive, professional closing experience across all pages (`/`, `/check`, `/about`, etc.).
- All user-facing strings are strictly localized in `frontend/src/lib/i18n.ts`.
- The design strictly complies with all anti-slop rules in `docs/design-guardrails.md`.
