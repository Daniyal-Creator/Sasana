# ADR-0014 — The assistant answers in tiers, fenced by volatility rather than topic

**Status:** Accepted
**Date:** 2026-09-06
**Relaxes:** guardrail W6 (`docs/design-guardrails.md` §9), in the narrow way
described below
**Reinforces:** [ADR-0004](0004-no-open-closed-status.md)

## Context

Guardrail W6 reads: *"Never invent a rule. Ungrounded answers say so plainly
(FR2.1). This is a factual guardrail, not a stylistic one."* Until now the
assistant honoured it in the simplest possible way — every answer either cited
`data/rules.json` or was replaced by a fixed refusal.

With thirteen rules in the knowledge base, that produced a great many refusals.
Two typed one after another on a real screen made the cost visible:

```
boleh saya membawa makanan ke pura?
> Saya tidak punya informasi resmi soal itu dalam tata krama Bali.

kalau saya ke pura tanah lot apakah ada tempat penginapan
dan tempat makan yang bagus disana?
> Saya tidak punya informasi resmi soal itu dalam tata krama Bali.
```

Identical sentences, entirely different causes. The first is an etiquette
question the app is *for* and simply has no rule for yet. The second is
genuinely outside anything it can source. Answering both the same way teaches
the visitor that the assistant knows nothing, which is false and drives them to
whichever app will answer — including the ones that will make something up.

The obvious fix, letting the model answer freely, would end W6 outright. The
question this ADR settles is what to put in its place.

## Decision

**An answer belongs to one of four tiers**, carried as `ChatKind` in
`shared/contract.ts`:

| Tier | Basis | Attribution |
| --- | --- | --- |
| `rule` | Rules the server resolved from its own knowledge base | `ruleIds` + `source` |
| `context` | Balinese custom or meaning, no rule behind it | none |
| `general` | Bali's history, geography, religion, tourism background | none |
| `none` | Cannot be answered | the official fallback |

**The model proposes a tier; the server may only push it down.** Overclaiming,
citing ids that do not exist, or wandering into a forbidden fact each land on a
more careful answer than the model wanted to give. There is no path that ends
higher than what was claimed.

A claimed `rule` that resolves to no known id is refused outright rather than
demoted to `general`. Relabelling a fabricated instruction as background
knowledge would hide the problem rather than stop it — a visitor acts on a
prescription whatever caption sits beneath it.

**The fence is volatility, not topic.** Tiers 2 and 3 may say what something
means and what has happened. They may never say what is happening:

- anything that changes with the date, the hour, the season, or the price —
  opening times, ticket prices, fees, ceremony dates, whether a place is open
  or busy today;
- recommendations of specific businesses — hotels, restaurants, guides, tours.

Enforced twice: the prompt is the fence and does nearly all the work, and
`lib/volatility.ts` is a deliberately narrow net for the obvious misses. The net
runs only over tiers 2 and 3; a `rule` answer skips it, because its content came
from a knowledge base that contains no volatile fact anywhere in it.

## Why

**Topic is a line no machine can hold.** "Culture" versus "logistics" has to be
adjudicated by the same model whose judgement is the thing in doubt, and every
argument about which side a question falls on is an argument the line eventually
loses. Volatility can be stated as a property of the sentence rather than of the
subject, which is why it can be both instructed and mechanically checked.

**Because answers are stored, staleness is permanent.** The persistent answer
cache is coming (`.scratch/assistant/spec.md`, PR-6). A fact that changes does
not merely become wrong once; it is served to every later visitor who asks
something similar. History has no such failure mode, which is exactly why it is
safe to open up and opening times are not.

**W6's actual harm does not extend to tier 3.** W6 exists because a plausible
but unsourced *guideline* gets acted on at a temple gate. "Tanah Lot was founded
by Dang Hyang Nirartha in the 16th century" is not a guideline; nobody behaves
differently at a shrine because of it. The guardrail is relaxed precisely where
its stated reasoning does not reach, and left fully intact where it does — every
prescriptive answer still traces to a Rule.

**ADR-0004 is strengthened, not overturned.** It forbids opening hours and
open/closed status for Sites. The volatility fence forbids the same class of
fact everywhere in the assistant, arriving at it from the other direction.

## Consequences

- **The visible difference must reach the visitor.** A tier-2 or tier-3 answer
  that looks identical to a sourced one would be worse than the refusal it
  replaced. The UI half is PR-4; until it ships, both render with the existing
  "no official source" line, which is true of them if incomplete.
- **The net will produce false positives.** A correct answer will occasionally
  be refused for containing an unlucky phrase, and the visitor will never learn
  why. That trade is deliberate — patterns are kept narrow, and the cases
  guarded against in `__tests__/volatility.test.ts` (`menutupi` containing
  "tutup", `Pulau Seribu Pura` containing "ribu") are the ones that would have
  refused this app's most common correct answers.
- **A residual gap stays open.** The model can still cite a rule id that is real
  but irrelevant, and the server cannot detect it — it only knows the id exists.
  The improvement over the previous design is that the citation is now recorded
  in `ruleIds` and in the logs, so the drift can be found. Before, it left no
  trace at all.
- **Growing the knowledge base stays the real work.** Tier 3 answers the second
  question above; it does nothing for the first. "May I bring food into a
  temple?" is a rule that has not been written yet, and no amount of tiering
  substitutes for writing it.
