# 01 — design-exception: I4

**What this is:** the issue §11 of `docs/design-guardrails.md` requires before a
guardrail may be broken. The rule is **§8 I4**, no AI-generated imagery of
Balinese people, ceremonies, or temples, which §11.1 keeps in force inside the
`/explore` carve-out.

**Status:** open, pending sign-off

**Owner:** Daniyal · **UI owner sign-off required:** Manu

**Rule:** §8 I4
**Breaking it:** `frontend/src/components/explore/CustomVisual.tsx`
**ADR:** `docs/adr/0013-cultural-object-illustrations.md`
**Written back to the guardrails:** §11.2

- [x] ADR records the rule, the problem it blocks, the alternatives, the scope
- [x] Exception written back into `docs/design-guardrails.md` as a named,
      scoped carve-out. An exception that is not written back does not exist
- [x] Scope fenced: one file, five illustrations, no human figures, no named
      real Site, no ceremony in progress
- [ ] **Sign-off from the UI owner plus one reviewer.** This is the step an
      agent cannot do. It happens in the pull request
- [ ] **Cultural review of the five drawings.** An agent drew them from
      description. A canang drawn wrongly teaches the wrong thing to the
      visitor who most needs it right. Until someone who knows checks them,
      ADR-0013 stays `proposed`

## Comments

**2026-08-27.** Raised while preparing the branch for its pull request, not
while writing the component: `CustomVisual.tsx` arrived from another session and
the conflict was found by reading §11.1 against it. Daniyal decided to keep the
illustrations and take the exception rather than revert them.
