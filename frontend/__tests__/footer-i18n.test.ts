import { describe, expect, it } from "vitest";
import { t, type CopyKey } from "@/lib/i18n";

describe("Footer i18n & guardrails verification", () => {
  const footerKeys: CopyKey[] = [
    "footer.brand_statement",
    "footer.closing_copy",
    "footer.group.explore",
    "footer.group.features",
    "footer.group.about",
    "footer.nav.home",
    "footer.nav.sites",
    "footer.nav.how",
    "footer.nav.check",
    "footer.nav.assistant",
    "footer.nav.zones",
    "footer.nav.about",
    "footer.nav.circular",
    "footer.nav.privacy",
    "footer.disclaimer",
    "footer.privacy",
  ];

  it("provides localized strings in both EN and ID for all footer keys", () => {
    for (const key of footerKeys) {
      const enText = t("en", key);
      const idText = t("id", key);

      expect(enText).toBeDefined();
      expect(enText.length).toBeGreaterThan(0);
      expect(idText).toBeDefined();
      expect(idText.length).toBeGreaterThan(0);
    }
  });

  it("complies with Guardrail W1 (No em dashes in footer copy)", () => {
    for (const key of footerKeys) {
      const enText = t("en", key);
      const idText = t("id", key);

      expect(enText).not.toContain("—");
      expect(idText).not.toContain("—");
    }
  });
});
