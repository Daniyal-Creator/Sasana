import { describe, expect, it } from "vitest";
import { t } from "@/lib/i18n";

describe("Landing Bento Grid Features Section", () => {
  it("resolves all about_section feature tags properly in both languages", () => {
    const tags = [
      "about_section.tag.vision",
      "about_section.tag.assistant",
      "about_section.tag.zones",
    ] as const;

    for (const tag of tags) {
      const en = t("en", tag);
      const id = t("id", tag);
      expect(en).not.toBe(tag);
      expect(id).not.toBe(tag);
      expect(en.length).toBeGreaterThan(0);
      expect(id.length).toBeGreaterThan(0);
    }
  });

  it("resolves feature titles, taglines, and descriptions in both languages", () => {
    const keys = [
      "about_section.check.title",
      "about_section.check.tagline",
      "about_section.check.desc",
      "about_section.assistant.title",
      "about_section.assistant.tagline",
      "about_section.assistant.desc",
      "about_section.zones.title",
      "about_section.zones.tagline",
      "about_section.zones.desc",
    ] as const;

    for (const key of keys) {
      const en = t("en", key);
      const id = t("id", key);
      expect(en).not.toBe(key);
      expect(id).not.toBe(key);
      expect(en.length).toBeGreaterThan(0);
      expect(id.length).toBeGreaterThan(0);
    }
  });

  it("resolves targeted action CTA labels for all three portals", () => {
    const actions = [
      "about_section.action.check",
      "about_section.action.assistant",
      "about_section.action.explore",
    ] as const;

    for (const action of actions) {
      const en = t("en", action);
      const id = t("id", action);
      expect(en).not.toBe(action);
      expect(id).not.toBe(action);
      expect(en).toContain("→");
      expect(id).toContain("→");
    }
  });

  it("resolves micro-visual dialog and zone copy keys in both languages", () => {
    const microKeys = [
      "about_section.dialog.user",
      "about_section.dialog.bot",
      "about_section.dialog.source",
      "about_section.zones.outer_label",
      "about_section.zones.inner_label",
      "about_section.zones.status_badge",
    ] as const;

    for (const key of microKeys) {
      const en = t("en", key);
      const id = t("id", key);
      expect(en).not.toBe(key);
      expect(id).not.toBe(key);
    }
  });

  it("integrates CandiBentarIllustration into InteractiveFeatures for Situation Check", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const bentoPath = path.resolve(__dirname, "../src/components/landing/InteractiveFeatures.tsx");
    const candiBentarPath = path.resolve(__dirname, "../src/components/landing/CandiBentarIllustration.tsx");

    const bentoSource = fs.readFileSync(bentoPath, "utf8");
    const candiBentarSource = fs.readFileSync(candiBentarPath, "utf8");

    // Must import and render CandiBentarIllustration cleanly without scanning beam
    expect(bentoSource).toContain('import { CandiBentarIllustration } from "./CandiBentarIllustration";');
    expect(bentoSource).toContain("<CandiBentarIllustration />");
    expect(bentoSource).not.toContain("CanangSariIllustration");

    // Must have accessible SVG labeling
    expect(candiBentarSource).toContain('aria-label="Candi Bentar split gate in camera viewfinder illustration"');

    // Must include technical monospace HUD chips
    expect(candiBentarSource).toContain("OBJECT: CANDI BENTAR");
    expect(candiBentarSource).toContain("SACRED PASSAGEWAY · VERIFIED");

    // Scanning laser and its animation beam must be completely removed
    expect(candiBentarSource).not.toContain("scannerBeam");
    expect(candiBentarSource).not.toContain("isScanning");
  });
});
