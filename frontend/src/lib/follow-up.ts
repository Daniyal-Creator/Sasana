// Which follow-up questions to offer under an answer, and under a photo check.
//
// Kept out of the components that draw them so the judgement can be tested
// without a renderer, the same arrangement as `site-context-copy.ts`. Nothing
// here knows about language: it returns copy keys and lets the caller resolve
// them, which is what keeps the rules below checkable against a list rather
// than against prose.
//
// Two rules run through all of it.
//
// What a chip SENDS is a whole question, whatever it says on its face. It goes
// with no history, because `chat.ts` only caches first-turn questions and a
// chip that cannot be cached spends a Gemini call to save a visitor some
// typing. That trade is only worth making where the question stands on its own,
// so `question` always names its own subject and never says "that" or "here".
// `short` is free to, because it is read with the answer still above it.
//
// A chip is DETERMINISTIC. Given the same conversation it offers the same three
// questions, in the same order, every time. Shuffling them would read as
// variety and cost the whole point: a question whose text changes on each
// render is a question the cache is never asked for twice.

import { RULE_CATEGORIES, RULE_CATEGORY, type RuleCategory } from "@/data/rule-categories";
import type { CopyKey } from "@/lib/i18n";
import type { ChatKind, VisionStatus } from "@shared/contract";

/** How many chips fit above the composer before the strip stops being a shortcut. */
export const CHIP_LIMIT = 3;

/**
 * One offered question: what the chip says, and what tapping it sends.
 *
 * They are separate keys because they answer to different readers. `short` is
 * read with the answer still on screen above it, so it can be as brief as
 * speech. `question` is read by a server that was given no history, so it has
 * to carry its own subject.
 */
export interface FollowUpChip {
  /** Stable across renders, and what `used` is checked against. */
  id: string;
  short: CopyKey;
  question: CopyKey;
}

/** What the chooser needs from a message. A deliberate subset of the UI's own type. */
export interface FollowUpMessage {
  role: "user" | "assistant";
  kind?: ChatKind;
  ruleIds?: string[];
}

/**
 * The three questions offered when an answer cites no Rule of its own.
 *
 * Reused from the welcome screen rather than written again, and not only to
 * save three strings: those keys are the ones a visitor is most likely to have
 * already sent from the empty state, so their answers are the ones most likely
 * to be sitting in the cache already.
 */
const GENERAL_CHIPS: FollowUpChip[] = [
  { id: "assistant.chip.shorts", short: "assistant.chip.shorts.short", question: "assistant.chip.shorts" },
  { id: "assistant.chip.drone", short: "assistant.chip.drone.short", question: "assistant.chip.drone" },
  { id: "assistant.chip.canang", short: "assistant.chip.canang.short", question: "assistant.chip.canang" },
];

/** Tiers that get no chips at all, and why the list is exactly these two. */
function tierCarriesChips(kind: ChatKind | undefined): boolean {
  // `none` is the assistant saying it has no official information. Offering
  // three more things to ask underneath that reads as deflection rather than as
  // help. `places` is a list of real businesses read from the map at request
  // time; a follow-up there triggers another lookup, which `chat.ts` refuses to
  // cache on purpose, so a shortcut into it is a shortcut into spending.
  return kind !== "none" && kind !== "places";
}

/** The category a Rule id is filed under, or undefined for an id nothing knows. */
function categoryOf(ruleId: string): RuleCategory | undefined {
  return RULE_CATEGORY[ruleId];
}

/**
 * Every category this conversation has already been answered about.
 *
 * Read across the whole history rather than off the last answer, because a
 * visitor who asked about drones eight messages ago has been told about
 * photography and does not need it offered as though it were new.
 */
function categoriesDiscussed(messages: readonly FollowUpMessage[]): Set<RuleCategory> {
  const seen = new Set<RuleCategory>();
  for (const message of messages) {
    if (message.role !== "assistant") continue;
    for (const ruleId of message.ruleIds ?? []) {
      const category = categoryOf(ruleId);
      if (category) seen.add(category);
    }
  }
  return seen;
}

/**
 * The chips to show under the newest answer, or an empty list for no strip.
 *
 * `used` holds the chips this visitor has already tapped. They are dropped
 * rather than re-offered: a shortcut to a question you have had answered is not
 * a shortcut.
 */
export function followUpChips(
  messages: readonly FollowUpMessage[],
  used: ReadonlySet<string> = new Set(),
): FollowUpChip[] {
  const last = messages[messages.length - 1];
  if (!last || last.role !== "assistant") return [];
  if (!tierCarriesChips(last.kind)) return [];

  const unused = (chips: FollowUpChip[]) => chips.filter((chip) => !used.has(chip.id));

  // The category the answer itself stood on. First known id wins rather than
  // the commonest, because "first" is stable across renders and "commonest" is
  // a tie waiting to be broken arbitrarily.
  const cited = (last.ruleIds ?? []).map(categoryOf).find(Boolean);
  if (!cited) return unused(GENERAL_CHIPS).slice(0, CHIP_LIMIT);

  const discussed = categoriesDiscussed(messages);
  const fresh = RULE_CATEGORIES.filter((category) => !discussed.has(category));

  // Everything has been covered. The strip goes away rather than falling back
  // to the general chips, which by this point are questions this conversation
  // has already answered.
  if (fresh.length === 0) return [];

  const why: FollowUpChip = {
    id: `assistant.why.${cited}`,
    // One line for all eleven categories. "Kenapa begitu?" needs no subject
    // while the answer it points at is still on screen, and giving it one per
    // category would be eleven ways of writing the same two words.
    short: "assistant.why.short",
    question: `assistant.why.${cited}`,
  };
  const breadth = fresh.map(
    (category): FollowUpChip => ({
      id: `assistant.followup.${category}`,
      short: `assistant.followup.${category}.short`,
      question: `assistant.followup.${category}`,
    }),
  );

  // The reason first. It is the one chip about what the visitor just read, and
  // burying it under two changes of subject wastes the only depth on offer.
  return unused([why, ...breadth]).slice(0, CHIP_LIMIT);
}

/**
 * The chips to show under a photo check, by outcome.
 *
 * These are not the assistant's chips and deliberately do not share its list.
 * The card hands the check's own result to the assistant along with the
 * question, so a chip here may point at "this result" where one in a fresh
 * chat could not, and what a visitor needs next differs completely between
 * being told they are fine and being told they are not.
 *
 * `unclear` returns nothing. The card already offers to retake the photo, which
 * is the only move that helps, and questions about a result the system could
 * not read would be answered from nothing.
 */
export function checkFollowUpChips(status: VisionStatus): FollowUpChip[] {
  if (status === "unclear") return [];
  return ([1, 2, 3] as const).map((n) => ({
    id: `check.followup.${status}.${n}`,
    short: `check.followup.${status}.${n}.short`,
    question: `check.followup.${status}.${n}`,
  }));
}
