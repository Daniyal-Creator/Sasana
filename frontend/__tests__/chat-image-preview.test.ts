import { describe, expect, it } from "vitest";
import { t, type CopyKey } from "@/lib/i18n";

describe("Chat image preview & i18n", () => {
  const photoKeys: CopyKey[] = [
    "assistant.photo.preview",
    "assistant.photo.view",
    "assistant.photo.close",
  ];

  it("provides localized strings in both EN and ID for all assistant photo keys", () => {
    for (const key of photoKeys) {
      const enText = t("en", key);
      const idText = t("id", key);

      expect(enText).toBeDefined();
      expect(enText.length).toBeGreaterThan(0);
      expect(idText).toBeDefined();
      expect(idText.length).toBeGreaterThan(0);
    }
  });

  it("complies with Guardrail W1 (No em dashes in copy)", () => {
    for (const key of photoKeys) {
      const enText = t("en", key);
      const idText = t("id", key);

      expect(enText).not.toContain("—");
      expect(idText).not.toContain("—");
    }
  });
});
