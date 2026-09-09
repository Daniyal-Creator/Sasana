import { describe, expect, it } from "vitest";
import { resolveTierLine, TIER_PRESENTATION } from "@/lib/answer-tier";
import { t } from "@/lib/i18n";
import type { ChatKind, Lang } from "@shared/contract";

const KINDS: ChatKind[] = ["rule", "context", "general", "places", "none"];
const LANGS: Lang[] = ["en", "id"];

describe("TIER_PRESENTATION", () => {
  it("covers every kind the contract allows", () => {
    for (const kind of KINDS) {
      expect(TIER_PRESENTATION).toHaveProperty(kind);
    }
    expect(Object.keys(TIER_PRESENTATION).sort()).toEqual([...KINDS].sort());
  });

  it("prints nothing under a refusal", () => {
    expect(TIER_PRESENTATION.none).toBeNull();
  });

  // ADR-0014: an unsourced answer that looks identical to a sourced one is
  // worse than the refusal it replaced. Guardrail C6 says colour is never the
  // only signal, so the icons have to differ too.
  it("gives every visible tier its own icon", () => {
    const icons = KINDS.map((kind) => TIER_PRESENTATION[kind]?.icon).filter(Boolean);
    expect(new Set(icons).size).toBe(icons.length);
  });

  it("gives every visible tier its own wording", () => {
    const keys = KINDS.map((kind) => TIER_PRESENTATION[kind]?.labelKey).filter(Boolean);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("marks only the tiers that can name where the facts came from", () => {
    expect(TIER_PRESENTATION.rule?.sourced).toBe(true);
    expect(TIER_PRESENTATION.places?.sourced).toBe(true);
    expect(TIER_PRESENTATION.context?.sourced).toBe(false);
    expect(TIER_PRESENTATION.general?.sourced).toBe(false);
  });
});

describe("tier copy", () => {
  it("is written in both languages for every visible tier", () => {
    for (const kind of KINDS) {
      const tier = TIER_PRESENTATION[kind];
      if (!tier) continue;
      for (const lang of LANGS) {
        const text = t(lang, tier.labelKey, { source: "Test Source" });
        expect(text.length).toBeGreaterThan(0);
        expect(text).not.toBe(tier.labelKey); // an unresolved key echoes itself
      }
    }
  });

  // The unsourced tiers have to say so in words, not just look quieter. A
  // visitor who skims the icon and reads nothing else must still not come away
  // believing the answer was official.
  it("says plainly that an unsourced tier is not an official rule", () => {
    expect(t("en", "assistant.tier.context")).toContain("not an official rule");
    expect(t("en", "assistant.tier.general")).toContain("not an official rule");
    expect(t("id", "assistant.tier.context")).toContain("bukan aturan resmi");
    expect(t("id", "assistant.tier.general")).toContain("bukan aturan resmi");
  });

  // These lines used to promise every answer came from an official rule, which
  // stopped being true when the assistant started explaining customs and Bali's
  // background without one.
  it.each(["assistant.helper", "assistant.trust", "assistant.chatheader.subtitle"] as const)(
    "does not overclaim in %s",
    (key) => {
      for (const lang of LANGS) {
        const text = t(lang, key);
        expect(text).not.toMatch(/^Answers come from official rules/);
        expect(text).not.toMatch(/^Jawaban berasal dari aturan resmi/);
        expect(text).not.toMatch(/^Answers grounded in official rules/);
        expect(text).not.toMatch(/^Jawaban berdasarkan aturan resmi/);
      }
    },
  );

  it.each(["assistant.helper", "assistant.trust", "assistant.chatheader.subtitle", "assistant.sidebar.about.body", "assistant.tier.context", "assistant.tier.general"] as const)(
    "W1, no em dashes in %s",
    (key) => {
      for (const lang of LANGS) {
        expect(t(lang, key)).not.toContain("—");
      }
    },
  );
});

describe("resolveTierLine", () => {
  it("prints nothing under a refusal", () => {
    expect(resolveTierLine("none", null)).toBeNull();
  });

  it("names the source for a sourced tier", () => {
    const line = resolveTierLine("rule", "Bali Governor Circular No. 7 of 2025");

    expect(line?.attributed).toBe(true);
    expect(line?.labelKey).toBe("assistant.source");
    expect(t("id", line!.labelKey, line!.params)).toContain("Circular No. 7");
  });

  it("marks a map answer as map data rather than as a rule", () => {
    const line = resolveTierLine("places", "OpenStreetMap contributors");

    expect(line?.attributed).toBe(true);
    expect(t("en", line!.labelKey, line!.params)).toBe("Map data: OpenStreetMap contributors");
  });

  // The regression the browser caught and the unit tests could not: fusing "has
  // a source" with "which wording to use" sent both unsourced tiers to the
  // sourced fallback, so each printed "No official rule found for this" and
  // neither said what it actually was.
  it.each([
    ["context", "assistant.tier.context"],
    ["general", "assistant.tier.general"],
  ] as const)("uses %s's own wording, not the sourced fallback", (kind, expected) => {
    const line = resolveTierLine(kind, null);

    expect(line?.labelKey).toBe(expected);
    expect(line?.attributed).toBe(false);
    expect(t("en", line!.labelKey)).toContain("not an official rule");
  });

  it("ignores a source an unsourced tier should never have carried", () => {
    expect(resolveTierLine("context", "Somewhere")?.labelKey).toBe("assistant.tier.context");
  });

  // Printing "Source: " with nothing after it would be worse than admitting the
  // attribution is missing.
  it("falls back when a sourced tier arrives without its source", () => {
    const line = resolveTierLine("rule", null);

    expect(line?.labelKey).toBe("assistant.nosource");
    expect(line?.attributed).toBe(false);
  });
});

// The /stats page is a client component that fetches, so the node test
// environment cannot render it. What it can check is that none of its copy is
// missing in either language, which is the failure that would actually ship.
describe("stats page copy", () => {
  it.each([
    "stats.title", "stats.body", "stats.tokens", "stats.hitrate", "stats.answered",
    "stats.entries", "stats.on", "stats.off", "stats.kb", "stats.refresh", "stats.error",
  ] as const)("%s is written in both languages", (key) => {
    for (const lang of LANGS) {
      const text = t(lang, key, { hash: "abc123" });
      expect(text.length).toBeGreaterThan(0);
      expect(text).not.toBe(key);
      expect(text).not.toContain("—"); // W1
    }
  });

  it("interpolates the knowledge-base hash rather than printing the placeholder", () => {
    expect(t("id", "stats.kb", { hash: "49cde010" })).toContain("49cde010");
    expect(t("id", "stats.kb", { hash: "49cde010" })).not.toContain("{hash}");
  });
});
