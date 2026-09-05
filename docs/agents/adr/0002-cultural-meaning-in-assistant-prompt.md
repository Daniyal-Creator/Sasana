# ADR-0002 — The cultural-meaning layer goes into the assistant prompt

**Status:** Accepted
**Date:** 2026-08-12
**Supersedes:** the "display-only" decision recorded in
`.scratch/content-sections/issues/01-rules-page-and-impact-section.md`
("Konsekuensi yang sudah diterima", bullet 3)

## Context

Each rule in `data/rules.json` now carries a cultural-meaning layer
(`why_en` / `why_id`) explaining the custom behind the rule, plus a
`why_source` attribution.

The earlier `content-sections` session accepted that this layer would be
**display-only** — rendered on a future `/rules` page but deliberately kept out
of the assistant's system prompt, because PRD §12 stuffs the entire knowledge
base into that prompt and adding a paragraph per rule would inflate tokens.

Live testing of the finished assistant (ticket 02) exposed the cost of that
choice. One of the four example chips on the assistant screen asks
"What is a canang offering?" / "Apa itu canang?". Gemini declined it:

```
I don't have official information on that in the Bali code of conduct.
```

The decline was correct behaviour, not a bug. The KB regulated *behaviour*
around canang ("do not step on or over canang") but contained no *meaning*, and
FR2.1 requires the assistant to decline rather than fabricate. The result is
that a first-screen example question — the one judges are most likely to click —
reliably returns nothing.

Keeping the layer display-only would leave that hole open: a `/rules` page can
show the meaning, but the assistant would still decline the question.

## Decision

`why_en` / `why_id` are included in the rules block that
`formatRulesForPrompt()` builds, so the assistant can answer questions about
meaning as well as permission. Instruction #1 of the chat system prompt states
explicitly that the "Why it matters" note is part of the rules.

`why_source` stays out of the prompt. It is attribution for humans, shown in the
UI, and contributes nothing to an answer.

## Consequences

- The assistant can answer "what is X" and "why is X done" for anything the KB
  covers, and those answers stay grounded with a source and `grounded: true`.
- Prompt size roughly doubles: measured at ~700 → ~1,500 prompt tokens for a
  13-rule KB. Against the free-tier context window (1M tokens) this is
  negligible, and free-tier limits are enforced per request rather than per
  token. Measured latency did not regress (chat stayed near 1 s).
- The anti-fabrication guarantee is unchanged. Meaning text is *data in the KB*,
  subject to the same "answer ONLY from RULES" instruction and the same
  server-side grounding net in `safeParseChat`.
- The cost the original decision worried about is real but was mispriced: it
  traded a first-screen feature failure for a token saving that does not matter
  at this KB size. If the KB grows past roughly 50 rules, revisit by moving to
  retrieval (`searchRules`, backend-spec §3.4) instead of dropping the layer —
  retrieval shrinks the prompt without giving up the capability.

## Integrity constraint (unchanged)

The `content-sections` session ruled that inventing cultural meaning is a
violation in the same class as fabricating a rule. That still holds. Every
`why_*` entry carries a `why_source`, and the content is drawn from documented
Balinese Hindu practice (tri mandala zoning, pelinggih as "seat", canang sari
and Tri Hita Karana, cuntaka, the head-and-feet hierarchy, desa adat and
awig-awig). It remains **pending verification against local sources** — Rafli's
role under PRD §17 — before the competition submission.
