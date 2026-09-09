# ADR-0017 — The chat prompt carries the rules a question is about, not all of them

**Status:** Accepted
**Date:** 2026-09-07
**Supersedes:** the context-stuffing decision in PRD §12 and backend-spec §2.2,
which `backend-spec` §3.4 already anticipated would be replaced here

## Context

Stuffing the whole knowledge base into the system prompt was right at thirteen
rules. At twenty-seven it costs **3,880 prompt tokens on average, measured
live**, against **73 tokens of output** — the prompt is 98% of what a question
costs, and every question pays for twenty-six rules that have nothing to do
with it.

`searchRules` has existed since the beginning as the seam for this
(backend-spec §3.4) and, since the Indonesian keyword work, is finally good
enough to drive it.

The objection was written into the code, in `buildChatSystemPrompt`:

> The whole KB stays in RULES even when a Site is known: a visitor standing at
> Besakih may still ask something general, and **narrowing the list would turn
> an answerable question into a refusal**.

That objection is correct, and it is the thing this decision had to answer with
evidence rather than with confidence.

## What was measured first

Fifty labelled questions, in both languages, every rule represented at least
once. Recall came out at 100% for k=3 — but that corpus was written while
looking at the rules, so its vocabulary was biased toward theirs.

A second set was written deliberately against the grain, phrased the way a
visitor types rather than the way a rule reads. Recall fell to **11/14 (79%)**,
and the shape of the failure is what decided the design:

| | Result |
| --- | --- |
| Answering rule ranked below k | **never happened** |
| Answering rule missing entirely | 3 of 14 |

Raising k from 3 to 8 changed nothing. Retrieval does not fail by ranking the
right rule low. It fails by returning **nothing at all**: "Ada yang ditaruh di
tanah depan pintu" is answered by `offerings-canang` and matches none of its
keywords.

## Decision

`selectRules(rules, message, siteRules, limit = 5)`:

- the top **5** rules `searchRules` returns, plus
- the Site's own rules, always, because a visitor standing somewhere is owed
  what applies there whether or not their wording matched it, and
- **the entire knowledge base whenever retrieval returns nothing**, since that
  is the only way it was observed to fail, and it is exactly the case that used
  to be answerable.

Citations resolve against **what was sent**, not against the full base. A model
naming a rule it was not shown is working from memory, which is the thing this
whole design guards against. A refusal still offers topics from everything the
assistant knows, because "what I can help with" is a claim about the app rather
than about one request.

## Consequences

- **Measured live at 1,635 prompt tokens on average**, down from 3,880, on a
  set deliberately weighted toward the fallback (3 of 12 questions). On a
  realistic mix the offline figure is about 1,240. Rules sent averaged 8.4 of 27.
- **Twelve of twelve live answers were unchanged**, cited ids included, and both
  fallback questions were answered correctly with the rule the narrowed prompt
  would have hidden.
- **A missed rule now degrades softly.** Before the tiers, a rule the prompt
  omitted meant a bare refusal. Now the model drops to `context` and still
  explains, losing the official source line rather than the answer. That is what
  makes narrowing affordable at all, and it did not exist when the original
  objection was written.
- **The corpus is now load-bearing.** `retrieval.fixtures.ts` is what says the
  cut is safe, so a rule added without keywords that reach it will pass its own
  sourcing test and quietly become unreachable. `retrieval.test.ts` asserts
  every labelled question still survives the cut, and the fixtures should grow
  with the knowledge base.
- **The saving is not free of risk, only of measured risk.** Fourteen adversarial
  questions is a small sample. If refusals rise after this ships, the first
  thing to check is `rulesSent` in the logs against what the question was about.
