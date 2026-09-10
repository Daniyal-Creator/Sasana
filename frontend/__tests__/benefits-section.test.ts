import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("BenefitsSection animation and contract checks", () => {
  const componentPath = path.resolve(__dirname, "../src/components/landing/BenefitsSection.tsx");
  const pagePath = path.resolve(__dirname, "../src/app/page.tsx");

  const componentSource = fs.readFileSync(componentPath, "utf8");
  const pageSource = fs.readFileSync(pagePath, "utf8");

  it("integrates BenefitsSection inside page.tsx", () => {
    expect(pageSource).toContain('import { BenefitsSection } from "@/components/landing/BenefitsSection";');
    expect(pageSource).toContain('<section id="benefits"');
    expect(pageSource).toContain("<BenefitsSection />");
  });

  it("implements two-phase sequential transition with GSAP", () => {
    // Phase 1: fast exit
    expect(componentSource).toContain("data-animate-exit");
    expect(componentSource).toContain("gsap.to");
    expect(componentSource).toContain("setDisplayedPillar(activePillar)");

    // Phase 2: sequential timeline
    expect(componentSource).toContain("gsap.timeline");
    expect(componentSource).toContain("data-pillar-header");
    expect(componentSource).toContain("data-benefit-card");
  });

  it("complies with Guardrail M3 (durations within band, <= 400ms)", () => {
    expect(componentSource).toContain("duration: 0.13");
    expect(componentSource).toContain("duration: 0.1");
  });

  it("complies with Guardrail M5 (respects prefers-reduced-motion)", () => {
    expect(componentSource).toContain("(prefers-reduced-motion: reduce)");
  });

  it("provides dynamic hover micro-interactions on benefit micro-cards", () => {
    expect(componentSource).toContain("group-hover:text-primary");
    expect(componentSource).toContain("group-hover:bg-primary");
    expect(componentSource).toContain("group-hover:text-primary-fg");
    expect(componentSource).toContain("hover:border-border-strong");
  });
});
