// The two judgements behind the carried-context UI, kept out of the components
// that draw it so they can be tested without a renderer: which sentence a
// position earns, and which questions a Site earns.

import type { CustomIcon, Site } from "@/data/sites";
import type { CopyKey } from "@/lib/i18n";
import type { Proximity } from "@shared/contract";

/** Which line the card shows about the visitor's position, and whether it names a distance. */
export interface PositionLine {
  key: CopyKey;
  /** False where the sentence is about the place rather than about a number. */
  withDistance: boolean;
}

/**
 * The sentence a fix earns, or null when there is no fix left to describe.
 *
 * Two cases print no number, for different reasons. Inside the Zone the state
 * is the information and a distance to the centre of an area you are standing
 * in answers nothing. A fix no better than the distance it reports is the other
 * one, and it is the same rule the prompt already follows: a phone reporting
 * plus or minus 500 m about a 400 m gap has produced arithmetic, not a fact
 * about where somebody is. Deciding it here rather than leaving it to whoever
 * writes the copy is what keeps the screen and the answer saying the same thing.
 */
export function positionLine(proximity: Proximity | null | undefined): PositionLine | null {
  if (!proximity) return null;
  if (proximity.state === "zone") {
    return { key: "assistant.context.inside", withDistance: false };
  }
  if (proximity.accuracyM >= proximity.distanceM) {
    return { key: "assistant.context.unsure", withDistance: false };
  }
  return {
    key:
      proximity.state === "approach"
        ? "assistant.context.approaching"
        : "assistant.context.away",
    withDistance: true,
  };
}

/**
 * One question per kind of Custom, keyed by the icon a Custom already carries.
 *
 * The mapping is the grounding. A question is offered only where the Site
 * really holds a Custom of that kind, so tapping it lands on that Site's own
 * Rules rather than on a subject the assistant then has to refuse. A record
 * rather than a lookup function on purpose: adding a `CustomIcon` without a
 * question here stops compiling, which is the moment to decide what to ask.
 */
export const HERE_QUESTION_KEY: Record<CustomIcon, CopyKey> = {
  dress: "assistant.here.dress",
  photography: "assistant.here.photography",
  offerings: "assistant.here.offerings",
  drones: "assistant.here.drones",
  quiet: "assistant.here.quiet",
};

/** How many Site questions fit before the list stops being a shortcut. */
export const HERE_LIMIT = 3;

/**
 * The kinds of Custom this Site actually carries, in the order it carries them.
 *
 * Deduplicated because a Site may hold two Customs of one kind, and the same
 * question printed twice reads as a broken list rather than as thoroughness.
 */
export function questionKindsFor(site: Site): CustomIcon[] {
  return [...new Set(site.customs.map((custom) => custom.icon))].slice(0, HERE_LIMIT);
}
