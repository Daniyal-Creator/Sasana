// Which category each Rule belongs to, keyed by Rule id.
//
// The assistant's answer names the Rules it stands on, and nothing else: a
// ChatResponse carries `ruleIds` and no category. Follow-up chips are chosen by
// category, so the mapping has to live somewhere the browser can read without
// a round trip. This is that somewhere.
//
// It is a copy of the `category_en` field in backend/src/data/rules.json,
// slugged. The same arrangement as MEANINGS in `meanings.ts`, for the same
// reason and with the same safeguard: a copy can drift, so it is not trusted to
// stay true by hand. __tests__/rule-categories.test.ts reads rules.json and
// fails if any id here is unknown, if any Rule is missing, or if a category
// disagrees. Regenerate this file rather than retyping it.
//
// Only the category is copied, never the rule text. A category is a filing
// label, not a claim about how to behave, so nothing a visitor acts on is
// duplicated here - the Customs themselves stay in rules.json where the server
// reads them.

/**
 * The eleven categories `rules.json` files its Rules under, slugged from
 * `category_en`.
 *
 * A union rather than a bare string so that a category arriving without a
 * question written for it stops compiling. That is the same guard
 * `HERE_QUESTION_KEY` uses, and it is the moment to decide what to ask.
 */
export type RuleCategory =
  | "dress-code"
  | "access"
  | "sacred-behavior"
  | "offerings"
  | "photography"
  | "ritual-purity"
  | "general-conduct"
  | "environment"
  | "visitor-obligations"
  | "getting-around"
  | "nyepi";

/**
 * Every category, in the order `rules.json` first introduces it.
 *
 * The order is load-bearing. Breadth chips are picked by walking this list, and
 * walking it the same way every time is what lets the cache warm: a question
 * whose text changes on each render is a question that is never answered twice.
 */
export const RULE_CATEGORIES: readonly RuleCategory[] = [
  "dress-code",
  "access",
  "sacred-behavior",
  "offerings",
  "photography",
  "ritual-purity",
  "general-conduct",
  "environment",
  "visitor-obligations",
  "getting-around",
  "nyepi",
] as const;

export const RULE_CATEGORY: Record<string, RuleCategory> = {
  "temple-attire": "dress-code",
  "sacred-area-entry": "access",
  "climbing-sacred": "sacred-behavior",
  "offerings-canang": "offerings",
  photography: "photography",
  "drone-restriction": "photography",
  "menstruation-entry": "ritual-purity",
  "speaking-volume": "sacred-behavior",
  "shoe-removal": "sacred-behavior",
  "touching-sacred-objects": "sacred-behavior",
  "head-level-respect": "sacred-behavior",
  "general-conduct": "general-conduct",
  "no-littering": "environment",
  "licensed-guide": "access",
  "visitor-levy": "visitor-obligations",
  "pay-in-rupiah": "visitor-obligations",
  "money-exchange": "visitor-obligations",
  "driving-licence": "getting-around",
  "road-conduct": "getting-around",
  "impaired-driving": "getting-around",
  "licensed-transport": "getting-around",
  "licensed-accommodation": "visitor-obligations",
  "sacred-photo-attire": "photography",
  "respect-people": "general-conduct",
  "online-conduct": "general-conduct",
  "work-permits": "visitor-obligations",
  "protected-goods": "environment",
  "honour-sacred-objects": "sacred-behavior",
  "respect-adat-culture": "general-conduct",
  "site-specific-rules": "access",
  "protect-water": "environment",
  "nyepi-stay-in": "nyepi",
  "nyepi-quiet-dark": "nyepi",
  "nyepi-no-transport": "nyepi",
  "bargaining-conduct": "general-conduct",
};
