# ADR-0016 — The answer cache is SQLite, invalidated by the knowledge base rather than by time

**Status:** Accepted
**Date:** 2026-09-06
**Replaces:** the in-memory `TTLCache` introduced with the chat route

## Context

Two forces met here. The assistant grew a great deal more expensive: the tier
ladder and its fences cost **+389 prompt tokens per uncached call, +21%**
([ADR-0014](0014-assistant-answer-tiers.md)), and questions that used to be
refused in one short sentence are now answered at length. Separately, a
token-saving mechanism was wanted as a demonstrable piece of engineering.

The cache that existed was a `Map` behind a one-hour TTL. It had three problems,
and only the first is obvious:

1. **It died with the process.** Every restart threw away answers already paid
   for, and a school project restarts constantly.
2. **The TTL answered the wrong question.** An answer derived from
   `rules.json` does not become wrong because an hour passed. It becomes wrong
   when the rules change. Time-based expiry therefore discarded answers that
   were still correct, while an edit to the knowledge base left stale ones in
   place for the rest of the hour.
3. **It keyed on the literal sentence.** Only case and whitespace were
   normalised, so "Boleh pakai celana pendek tidak?" and "Apakah saya boleh
   pakai celana pendek?" were two entries and two Gemini calls.

## Decision

**SQLite through `node:sqlite`.** Node's own module, so no dependency is added
and `backend/package.json` is not touched, which matters because README's rule
on shared files forbids raising somebody else's version. The container already
runs `node:24-alpine`. `@types/node` is still v20 and does not describe the
module, so the small surface actually used is declared in
`src/types/node-sqlite.d.ts`, to be deleted when the types catch up.

**The key is the question's content words, sorted.** `normalizeQuestion` drops
stopwords and Indonesian clitics, deduplicates, and sorts, so all four phrasings
above reduce to `celana|pakai|pendek`. It shares its tokenizer with
`searchRules`: both ask "what is this question about", and two answers to that
would be two behaviours to keep in step. Language and Site stay in the key, the
Site for the sharp reason that serving Tanah Lot's answer at Besakih is a
confident wrong Custom.

**Invalidation is a hash of `rules.json`,** stored on every row and compared on
read. A mismatch is a miss and the row is deleted. No TTL exists at all.

**Two kinds are never stored.** `places` describes the world, which changes on
its own, so a guest house that closes would otherwise keep being named by a
stored sentence. `none` is a refusal, and storing failures would let one unlucky
model call become the permanent answer to a question the app can handle - the
shape of the bug this whole effort began with.

**Only the normalised key is kept, never the sentence a visitor typed.**
`celana|pakai|pendek` still shows which topics get asked about, which is the
analysis this is for, and it is no longer anybody's writing.

**`GET /api/stats`** reports entries, hits, misses, hit rate, and tokens saved.
The saving is **measured, not estimated**: `usageMetadata.totalTokenCount` from
the original call is stored with the entry and added again on every hit.

**`CACHE_ENABLED=false` still counts misses.** That is what makes the claim
testable rather than asserted: run the same questions twice, once cold and once
warm, and put the two readings side by side.

## Why not embeddings

Semantic matching would catch what this cannot - "shorts" and "celana pendek"
will never share a key. It was rejected because it costs an embedding API call
per question, on a feature whose entire purpose is spending fewer tokens. In a
report that has to be defended, "we added an API call to save API calls" is a
question with no answer.

## Consequences

- **This does not make the app cheaper than it was before the tiers.** It pays
  for a feature that was added. Roughly, an uncached question went from ~1,950
  tokens to ~2,441, so the cache has to reach somewhere around a **20 to 40 per
  cent hit rate** to break even against the old behaviour, depending on how
  often the old exact-match cache was hitting. `/api/stats` is what will settle
  that; the honest comparison for measuring the cache itself is cache-off versus
  cache-on at the same feature level, not before versus after everything.
- **Synonyms and morphology still fragment the key.** Clitics are stripped
  (`bolehkah` reaches `boleh`), but prefixes are not: Indonesian carries nasal
  assimilation, so `memakai` is `me`+`pakai` and a naive stripper mangles more
  words than it fixes. Sharper matching is knowledge-base and tokenizer work.
- **The store is a file, and files need a home.** Both compose files mount one;
  without that the saving resets on every deploy and the one number this feature
  exists to produce stays near zero.
- **`node:sqlite` prints an ExperimentalWarning at startup.** Cosmetic, and the
  whole price of the zero-dependency route.
- **One process, one handle.** Fine for a single container; two backends sharing
  a file would contend. On Windows the open handle also locks the file, which is
  why `AnswerCache` exposes `close()` even though the server never calls it.
- **A cap replaces expiry.** Past 5,000 entries the least-hit rows are dropped,
  so the file cannot grow without end now that nothing ages out.
