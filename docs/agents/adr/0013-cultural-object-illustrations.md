---
status: proposed
---

# Explore illustrates the objects a Custom names, breaking I4

Guardrail §8 I4 bans AI-generated imagery of Balinese people, ceremonies, or
temples, and the `/explore` carve-out in §11.1 deliberately keeps it in force
where the visual rules are suspended. `CustomVisual.tsx` breaks it: five inline
SVG illustrations, drawn by an agent, shown beside the Customs in the Explore
panel.

This ADR is the open declaration §11 requires. It does not argue that I4 is
wrong; it argues that this particular set of drawings is worth the exception,
and it fences the exception so that it cannot grow.

## The rule being broken

**§8 I4.** *"No AI-generated imagery of Balinese people, ceremonies, or
temples. Non-negotiable: the product's premise is respect for a living culture,
and synthetic depictions of sacred practice contradict it."*

Precisely what is broken, and what is not:

- **No human figures appear.** The file draws no people, no priests, no
  worshippers. That half of I4 is untouched.
- **Three illustrations depict a temple** in outline (photography etiquette,
  the drone restriction, quiet at a sacred site).
- **One depicts a ceremonial object**, canang sari. This is the sharpest edge
  of the exception: canang is a completed prayer, not decoration, and drawing
  one is drawing sacred practice.
- No illustration depicts a **named real Site**, and none depicts a ceremony in
  progress.

## The problem it blocks

A Custom tells a visitor what to do. Two of them name objects that a first-time
visitor has never seen and cannot picture from the words alone:

- *"Kamen dan selendang wajib dipakai."* A visitor who does not know what a
  kamen is cannot tell whether they are wearing one.
- *"Canang diletakkan di tanah. Berjalanlah mengelilinginya."* This is the
  instruction most easily broken by accident, and it is broken by people who
  did not recognise what was on the ground as an offering. Text cannot fix
  that. Recognition is the whole job.

The product exists to prevent violations caused by ignorance rather than
malice (PRD §2). For these two Customs, the ignorance is visual.

## Alternatives tried

- **Lucide icon in a tile**, which is what the panel shipped with and what the
  guardrails prescribe for this slot. It carries the category ("this row is
  about offerings") and nothing about appearance. A visitor still cannot pick a
  canang out of a crowded courtyard floor.
- **Photographs of the real objects.** None are licensed in this repository,
  and I4 blocks generated ones, so this is not currently available. If licensed
  photographs ever arrive they are strictly better than these drawings and
  should replace them.
- **The meru pictogram** used for Site markers and thumbnails. It is an
  abstract mark meaning "sacred place". It cannot say what a canang looks like,
  and stretching it to try would be worse than either option.

## Scope of the exception

Narrow, and named so it cannot spread:

- **One file:** `frontend/src/components/explore/CustomVisual.tsx`.
- **Five illustrations only**, one per `CustomIcon` value: dress, offerings,
  photography, drones, quiet.
- **No human figures.** If a person is ever drawn, this exception does not
  cover it and a new one is needed.
- **No named real Site**, and no ceremony in progress.
- **Objects and etiquette diagrams only.** The purpose is recognition, not
  atmosphere. A drawing that exists to make the screen prettier is outside this.
- Nothing outside `/explore` is covered, and §11.1 is otherwise unchanged.

## Consequences

- The product now shows synthetic depictions of Balinese sacred objects, in an
  app whose premise is respect for a living culture. That tension is real and
  is not resolved by this document; it is recorded by it.
- **These drawings should be reviewed by someone who knows the culture.** An
  agent drew them from description. A canang drawn wrongly teaches the wrong
  thing to exactly the visitor who most needs it right, which is the failure
  this product exists to prevent. Until such a review happens, this ADR stays
  `proposed`.
- Replacing them with licensed photographs later requires no layout change and
  no new ADR: the slot is the same.

## Sign-off

§11 requires the UI owner plus one reviewer. That has not happened yet, which
is why the status above is `proposed` and not `accepted`. The pull request
carrying this change is where it is granted or refused.
