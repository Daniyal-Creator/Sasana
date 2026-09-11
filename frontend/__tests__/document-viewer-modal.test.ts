import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { t } from "@/lib/i18n";

describe("SE No. 7/2025 PDF Document Viewer Modal and Native Mobile Reader contract", () => {
  const pdfPath = path.resolve(__dirname, "../public/docs/SE_Gubernur_Bali_No_7_Tahun_2025.pdf");
  const modalPath = path.resolve(__dirname, "../src/components/about/DocumentViewerModal.tsx");
  const aboutPagePath = path.resolve(__dirname, "../src/app/about/page.tsx");

  it("has the official PDF document asset present and non-empty in public/docs", () => {
    expect(fs.existsSync(pdfPath)).toBe(true);
    const stats = fs.statSync(pdfPath);
    expect(stats.size).toBeGreaterThan(1_000_000); // ~5.6 MB
  });

  it("contains bilingual translations for the trigger button and modal dialog", () => {
    expect(t("id", "about.rules.view_doc")).toContain("SE No. 7/2025");
    expect(t("en", "about.rules.view_doc")).toContain("SE No. 7/2025");

    expect(t("id", "about.modal.doc_title")).toContain("Surat Edaran Gubernur Bali");
    expect(t("en", "about.modal.doc_title")).toContain("Bali Governor Circular");

    expect(t("id", "about.modal.doc_subtitle")).toContain("SASANA");
    expect(t("en", "about.modal.doc_subtitle")).toContain("SASANA");

    expect(t("id", "about.modal.open_new_tab")).toBeDefined();
    expect(t("id", "about.modal.close")).toBeDefined();
  });

  it("implements accessibility dialog standards in DocumentViewerModal", () => {
    const source = fs.readFileSync(modalPath, "utf8");
    expect(source).toContain('role="dialog"');
    expect(source).toContain('aria-modal="true"');
    expect(source).toContain('e.key === "Escape"');
    expect(source).toContain('document.body.style.overflow = "hidden"');
    expect(source).toContain("<iframe");
    expect(source).toContain("SE_Gubernur_Bali_No_7_Tahun_2025.pdf");
  });

  it("integrates responsive triggers into about/page.tsx (Desktop modal vs Mobile native PDF reader)", () => {
    const pageSource = fs.readFileSync(aboutPagePath, "utf8");
    expect(pageSource).toContain('import { DocumentViewerModal } from "@/components/about/DocumentViewerModal";');
    
    // Desktop: triggers DocumentViewerModal
    expect(pageSource).toContain("hidden md:block");
    expect(pageSource).toContain("setIsDocModalOpen(true)");
    expect(pageSource).toContain('aria-haspopup="dialog"');
    
    // Mobile: opens native PDF reader directly in a new tab
    expect(pageSource).toContain("md:hidden");
    expect(pageSource).toContain('href="/docs/SE_Gubernur_Bali_No_7_Tahun_2025.pdf"');
    expect(pageSource).toContain('target="_blank"');
    expect(pageSource).toContain('rel="noopener noreferrer"');
    
    expect(pageSource).toContain("<DocumentViewerModal");
  });

  it("consolidates government portal link into modal on desktop and retains it on mobile", () => {
    const pageSource = fs.readFileSync(aboutPagePath, "utf8");
    const modalSource = fs.readFileSync(modalPath, "utf8");

    // Modal header provides direct portal link on desktop
    expect(modalSource).toContain('href="https://www.baliprov.go.id"');
    expect(modalSource).toContain("about.modal.visit_portal");

    // Card on about page retains portal link in mobile container
    expect(pageSource).toContain('href="https://www.baliprov.go.id"');
  });

  it("applies Paras Cream & Prada Gold styling with FileText icon and warm editorial palette", () => {
    const pageSource = fs.readFileSync(aboutPagePath, "utf8");

    // Must feature FileText icon as an attachment signifier
    expect(pageSource).toContain("<FileText");
    
    // Must feature Paras Cream background and font-display typography
    expect(pageSource).toContain("bg-surface");
    expect(pageSource).toContain("font-display");

    // Must feature Prada Gold accents
    expect(pageSource).toContain("text-accent");
    expect(pageSource).toContain("border-accent/40");
  });
});
