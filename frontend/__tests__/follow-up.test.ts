import { describe, expect, it } from "vitest";
import { CHIP_LIMIT, checkFollowUpChips, followUpChips, type FollowUpMessage } from "@/lib/follow-up";
import { RULE_CATEGORIES } from "@/data/rule-categories";

/** Chips are compared by id: the copy they resolve to is i18n's business, not this file's. */
const ids = (chips: { id: string }[]) => chips.map((chip) => chip.id);

const user = (): FollowUpMessage => ({ role: "user" });
const answer = (kind: FollowUpMessage["kind"], ruleIds: string[] = []): FollowUpMessage => ({
  role: "assistant",
  kind,
  ruleIds,
});

describe("followUpChips", () => {
  it("offers nothing before anybody has asked anything", () => {
    expect(ids(followUpChips([]))).toEqual([]);
  });

  it("offers nothing while the visitor's own message is the last one", () => {
    expect(ids(followUpChips([user()]))).toEqual([]);
  });

  it("offers nothing under a refusal", () => {
    // `none` is the assistant saying it has no official information. Three more
    // things to ask underneath that reads as deflection.
    expect(ids(followUpChips([user(), answer("none")]))).toEqual([]);
  });

  it("offers nothing under a list of places", () => {
    // A follow-up here triggers another map lookup, which chat.ts refuses to
    // cache on purpose.
    expect(ids(followUpChips([user(), answer("places")]))).toEqual([]);
  });

  it("leads with the reason behind the Rule the answer cited", () => {
    const chips = followUpChips([user(), answer("rule", ["temple-attire"])]);
    expect(chips[0].id).toBe("assistant.why.dress-code");
  });

  it("offers three chips and no more", () => {
    const chips = followUpChips([user(), answer("rule", ["temple-attire"])]);
    expect(chips).toHaveLength(CHIP_LIMIT);
  });

  it("follows the reason with categories the conversation has not covered", () => {
    const chips = followUpChips([user(), answer("rule", ["temple-attire"])]);
    // Dress Code is what was just answered, so it is not offered again.
    expect(ids(chips).slice(1)).toEqual([
      "assistant.followup.access",
      "assistant.followup.sacred-behavior",
    ]);
  });

  it("skips every category answered earlier in the conversation, not just the last", () => {
    const chips = followUpChips([
      user(),
      answer("rule", ["sacred-area-entry"]), // access
      user(),
      answer("rule", ["climbing-sacred"]), // sacred-behavior
      user(),
      answer("rule", ["temple-attire"]), // dress-code
    ]);
    expect(ids(chips)).toEqual([
      "assistant.why.dress-code",
      "assistant.followup.offerings",
      "assistant.followup.photography",
    ]);
  });

  it("gives the same answer twice for the same conversation", () => {
    // Determinism is the feature: a question whose text changes on each render
    // is a question the cache is never asked for twice.
    const conversation = [user(), answer("rule", ["photography", "head-level-respect"])];
    expect(ids(followUpChips(conversation))).toEqual(ids(followUpChips(conversation)));
  });

  it("reads the category off the first Rule the answer cited", () => {
    const chips = followUpChips([user(), answer("rule", ["photography", "head-level-respect"])]);
    expect(chips[0].id).toBe("assistant.why.photography");
  });

  it("ignores Rule ids the knowledge base does not know", () => {
    const chips = followUpChips([user(), answer("rule", ["not-a-rule", "temple-attire"])]);
    expect(chips[0].id).toBe("assistant.why.dress-code");
  });

  it("falls back to general questions when the answer cites no Rule", () => {
    expect(ids(followUpChips([user(), answer("general")]))).toEqual([
      "assistant.chip.shorts",
      "assistant.chip.drone",
      "assistant.chip.canang",
    ]);
  });

  it("falls back the same way for a context answer", () => {
    expect(ids(followUpChips([user(), answer("context")]))).toEqual(
      ids(followUpChips([user(), answer("general")])),
    );
  });

  it("falls back when a rule answer arrives with an empty ruleIds", () => {
    expect(ids(followUpChips([user(), answer("rule", [])]))).toEqual([
      "assistant.chip.shorts",
      "assistant.chip.drone",
      "assistant.chip.canang",
    ]);
  });

  it("drops a chip the visitor has already tapped", () => {
    const used = new Set(["assistant.followup.access"]);
    const chips = followUpChips([user(), answer("rule", ["temple-attire"])], used);
    expect(ids(chips)).not.toContain("assistant.followup.access");
    expect(chips).toHaveLength(CHIP_LIMIT);
  });

  it("drops a tapped general chip too", () => {
    const used = new Set(["assistant.chip.drone"]);
    expect(ids(followUpChips([user(), answer("general")], used))).toEqual([
      "assistant.chip.shorts",
      "assistant.chip.canang",
    ]);
  });

  it("goes away once every category has been covered", () => {
    // Falling back to the general chips here would offer questions this
    // conversation has already answered.
    const messages: FollowUpMessage[] = [];
    const oneRulePer: Record<string, string> = {
      "dress-code": "temple-attire",
      access: "sacred-area-entry",
      "sacred-behavior": "climbing-sacred",
      offerings: "offerings-canang",
      photography: "photography",
      "ritual-purity": "menstruation-entry",
      "general-conduct": "general-conduct",
      environment: "no-littering",
      "visitor-obligations": "visitor-levy",
      "getting-around": "driving-licence",
      nyepi: "nyepi-stay-in",
    };
    for (const category of RULE_CATEGORIES) {
      messages.push(user(), answer("rule", [oneRulePer[category]]));
    }
    expect(ids(followUpChips(messages))).toEqual([]);
  });
});

describe("checkFollowUpChips", () => {
  it("offers nothing when the photo could not be read", () => {
    // The card already offers to retake it, which is the only move that helps.
    expect(ids(checkFollowUpChips("unclear"))).toEqual([]);
  });

  it("offers three questions for every outcome the photo check could read", () => {
    for (const status of ["compliant", "needs_attention", "not_compliant"] as const) {
      expect(checkFollowUpChips(status), status).toHaveLength(3);
    }
  });

  it("asks something different depending on the outcome", () => {
    expect(ids(checkFollowUpChips("compliant"))).not.toEqual(ids(checkFollowUpChips("not_compliant")));
  });
});
