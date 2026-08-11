---
status: accepted
---

# One photographic hero image on the landing page

Guardrails §6 L8 says the only image on screen is the user's own photo, which
made the landing page purely typographic. Daniyal (project owner) decided the
landing hero should carry a large image, in the spirit of reference layouts
like Haven, to give the first screen a sense of place. We record a scoped
exception to L8 rather than repeal it.

## Decision

- The landing page (`/`) shows **one** hero image, chosen and supplied by the
  project owner: `public/Hero-bg2.jpg` — a dawn photograph of a Balinese
  temple in mist, with figures carrying offerings in the foreground.
- **Guardrail I4 is untouched and remains in force.** I4 bans *AI-generated*
  imagery of Balinese people, ceremonies, or temples; the hero is a real
  photograph, so I4 does not apply. The hero must never be replaced with a
  synthetic image of these subjects.
- **L8 is the guardrail actually relaxed here.** L8 bans decorative stock
  photography "of temples or tourists". The owner's judgement (2026-08-05) is
  that a real photograph of Bali is the right opening image for a product
  about Balinese custom, and that the L8 concern — synthetic or generic
  cultural set-dressing — is not what this image is. The carve-out is
  therefore worded as: the landing hero may show one real photograph of Bali,
  owner-chosen.
- Text or controls over the hero image sit on the **alpha-only warm-ink
  scrim** already specified for the photo scrim (Guardrails §2.2):
  `linear-gradient(rgb(42 37 32 / a), rgb(42 37 32 / b))` — single hue, alpha
  only, never animated. Contrast for overlaid text is verified against the
  scrim's darkest usable stop.
- Scope is exactly this: one image, landing hero only. Tool pages (`/check`,
  `/assistant`), About, and every other surface keep L8 as written.

## Considered options

- Stay typographic (rejected by owner: first screen lacks a sense of place).
- AI-generated imagery, painterly or photoreal (rejected by owner 2026-08-05:
  a real photograph is more honest than synthetic scenery for a
  cultural-respect product — this is also what I4 encodes).
- A landscape-only photograph with no people, ceremony, or temple (the
  narrower carve-out drafted first, superseded when the owner picked this
  image).

## Open items

- **License and source are not yet recorded.** The file was supplied directly
  and its provenance is unverified. Before launch, confirm the photographer
  and licence; if the licence requires attribution, add a credit link in the
  hero's bottom-right corner.
- **Resolution:** the supplied file is 940x671, which is below what a
  full-viewport hero wants on desktop. A higher-resolution copy of the same
  photograph should replace it before launch.
- The image depicts what appears to be a real ceremony. If the project ever
  needs to defend the choice, the argument above (real photograph, not
  synthetic; subject matter is the product's own subject) is the record.

## Consequences

- Guardrails §2.2 gains a fourth permitted gradient site (hero scrim, same
  exact form as the photo scrim) and §6 L8 gains this named carve-out.
- Issue trail: `.scratch/landing-hero/issues/01-design-exception-L8.md`.
