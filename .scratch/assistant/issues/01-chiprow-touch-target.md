# ChipRow chips are 36px tall, under the 44×44 touch-target convention

Status: needs-triage

`components/ui/ChipRow.tsx` renders each follow-up chip as `h-9` (36px) with no
padded hit area. The row itself carries `pb-2`, which pads the container rather
than the target.

`docs/ui-spec.md` §5 opens its component specs with "all interactive targets
**≥44×44px** (P5)", and §8's accessibility checklist repeats it. `Button` §5.1
holds the line explicitly even at its smallest size — "min 44×44 even at `sm`
(pad the hit area)" — and the chip this replaced was specced as "Height 40px
(44px hit area with padding)".

So the strip ships under the convention, and it is the control most likely to be
tapped one-handed: it sits directly above a sticky composer on a 375px screen,
and on mobile it scrolls horizontally, so a mistap lands on the neighbouring
chip and sends a question the visitor did not ask for.

## What would close this

Either of:

- Pad the hit area to 44px without growing the visual pill — e.g. keep `h-9` on
  the inner content and give the button `py-1` plus a negative margin on the
  row, so the recessed look survives.
- Or an ADR in `docs/adr/` recording the deviation and why 36px is right here,
  per the exception process in the guardrails.

§5.14 of `docs/ui-spec.md` records the gap as shipped so the spec does not read
as though this were already settled.

## Comments

Found while documenting `ChipRow` for the spec (PR #71). Not fixed there: that
PR is documentation only, and this is a UI change that wants its own review.
