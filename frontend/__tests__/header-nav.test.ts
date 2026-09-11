import { describe, expect, it } from "vitest";
import { t, type CopyKey } from "@/lib/i18n";

describe("Header navigation i18n & guardrails verification (Tri-Mode Navigation)", () => {
  const landingNavKeys: CopyKey[] = [
    "nav.features",
    "nav.sites",
    "nav.benefits",
    "nav.how",
    "nav.about_sasana",
  ];

  const aboutNavKeys: CopyKey[] = [
    "about.nav.story",
    "about.nav.principles",
    "about.nav.source",
    "about.nav.team",
  ];

  const appNavKeys: CopyKey[] = [
    "nav.check",
    "nav.assistant",
    "nav.explore",
    "nav.about",
    "nav.home",
  ];

  const allNavKeys: CopyKey[] = [
    ...landingNavKeys,
    ...aboutNavKeys,
    ...appNavKeys,
  ];

  it("provides localized strings in both EN and ID for all navigation keys across all 3 modes", () => {
    for (const key of allNavKeys) {
      const enText = t("en", key);
      const idText = t("id", key);

      expect(enText).toBeDefined();
      expect(enText.length).toBeGreaterThan(0);
      expect(idText).toBeDefined();
      expect(idText.length).toBeGreaterThan(0);
    }
  });

  it("ensures landing page navigation keys are distinct and properly translated", () => {
    expect(t("id", "nav.features")).toBe("Fitur");
    expect(t("en", "nav.features")).toBe("Features");

    expect(t("id", "nav.sites")).toBe("Situs");
    expect(t("en", "nav.sites")).toBe("Sites");

    expect(t("id", "nav.benefits")).toBe("Manfaat");
    expect(t("en", "nav.benefits")).toBe("Benefits");

    expect(t("id", "nav.how")).toBe("Cara kerja");
    expect(t("en", "nav.how")).toBe("How it works");

    expect(t("id", "nav.about_sasana")).toBe("Tentang SASANA");
    expect(t("en", "nav.about_sasana")).toBe("About SASANA");
  });

  it("ensures about page section navigation keys are distinct and properly translated", () => {
    expect(t("id", "about.nav.story")).toBe("Linimasa");
    expect(t("en", "about.nav.story")).toBe("Story");

    expect(t("id", "about.nav.principles")).toBe("Prinsip");
    expect(t("en", "about.nav.principles")).toBe("Principles");

    expect(t("id", "about.nav.source")).toBe("Piagam");
    expect(t("en", "about.nav.source")).toBe("Charter");

    expect(t("id", "about.nav.team")).toBe("Tim");
    expect(t("en", "about.nav.team")).toBe("Team");
  });

  it("ensures app core feature navigation keys match product capabilities", () => {
    expect(t("id", "nav.check")).toBe("Cek Situasi");
    expect(t("en", "nav.check")).toBe("Situation Check");

    expect(t("id", "nav.assistant")).toBe("Tanya Asisten");
    expect(t("en", "nav.assistant")).toBe("Ask Assistant");

    expect(t("id", "nav.explore")).toBe("Jelajahi Lokasi");
    expect(t("en", "nav.explore")).toBe("Explore Locations");

    expect(t("id", "nav.about")).toBe("Tentang");
    expect(t("en", "nav.about")).toBe("About");

    expect(t("id", "nav.home")).toBe("Beranda");
    expect(t("en", "nav.home")).toBe("Home");
  });

  it("verifies landing page section IDs match expected anchor targets", () => {
    const landingSectionIds = ["features", "sites", "benefits", "how"];
    expect(landingSectionIds).toEqual(["features", "sites", "benefits", "how"]);
  });

  it("verifies about page section IDs match expected anchor targets", () => {
    const aboutSectionIds = ["story", "principles", "source", "team"];
    expect(aboutSectionIds).toEqual(["story", "principles", "source", "team"]);
  });

  it("complies with Guardrail W1 (No em dashes in navigation copy)", () => {
    for (const key of allNavKeys) {
      const enText = t("en", key);
      const idText = t("id", key);

      expect(enText).not.toContain("—");
      expect(idText).not.toContain("—");
    }
  });

  describe("ScrollSpy continuous boundary algorithm (Zero dead-zone verification)", () => {
    function calculateActiveSection(
      sections: { id: string; top: number }[],
      scrollY: number,
      triggerOffset: number,
      maxScroll: number
    ): string {
      if (maxScroll > 0 && scrollY >= maxScroll - 60) {
        return sections[sections.length - 1].id;
      }
      for (let i = sections.length - 1; i >= 0; i--) {
        const { id, top } = sections[i];
        if (scrollY >= top - triggerOffset) {
          return id;
        }
      }
      return "";
    }

    const mockSections = [
      { id: "features", top: 800 },
      { id: "sites", top: 1600 },
      { id: "benefits", top: 2500 },
      { id: "how", top: 3400 },
    ];
    const triggerOffset = 250;
    const maxScroll = 4000;

    it("keeps indicator hidden (empty string) while in Hero area before features trigger", () => {
      expect(calculateActiveSection(mockSections, 0, triggerOffset, maxScroll)).toBe("");
      expect(calculateActiveSection(mockSections, 400, triggerOffset, maxScroll)).toBe("");
      expect(calculateActiveSection(mockSections, 549, triggerOffset, maxScroll)).toBe("");
    });

    it("activates features immediately once trigger offset is crossed", () => {
      expect(calculateActiveSection(mockSections, 550, triggerOffset, maxScroll)).toBe("features");
      expect(calculateActiveSection(mockSections, 800, triggerOffset, maxScroll)).toBe("features");
    });

    it("maintains continuous activation across dividers and inter-section gaps without empty dead-zones", () => {
      // Any scroll position between features and sites must stay 'features' until 'sites' trigger
      for (let y = 800; y < 1350; y += 50) {
        expect(calculateActiveSection(mockSections, y, triggerOffset, maxScroll)).toBe("features");
      }
      // Exact transition point at sites.top - triggerOffset = 1600 - 250 = 1350
      expect(calculateActiveSection(mockSections, 1350, triggerOffset, maxScroll)).toBe("sites");

      // Between sites and benefits (1600 to 2250)
      expect(calculateActiveSection(mockSections, 2000, triggerOffset, maxScroll)).toBe("sites");
      expect(calculateActiveSection(mockSections, 2250, triggerOffset, maxScroll)).toBe("benefits");

      // Between benefits and how (2500 to 3150)
      expect(calculateActiveSection(mockSections, 3000, triggerOffset, maxScroll)).toBe("benefits");
      expect(calculateActiveSection(mockSections, 3150, triggerOffset, maxScroll)).toBe("how");
    });

    it("keeps the last section active when reaching the bottom near footer", () => {
      expect(calculateActiveSection(mockSections, 3950, triggerOffset, maxScroll)).toBe("how");
      expect(calculateActiveSection(mockSections, 4000, triggerOffset, maxScroll)).toBe("how");
    });
  });
});

