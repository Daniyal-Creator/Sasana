"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, ExternalLink, ShieldCheck, X } from "lucide-react";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentViewerModal({ isOpen, onClose }: DocumentViewerModalProps) {
  const { lang } = useLang();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard dismiss (Escape) & body scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8"
    >
      {/* Dimmed backdrop with subtle blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Modal Dialog Content Container */}
      <div className="relative z-10 flex flex-col w-full max-w-5xl h-[92vh] sm:h-[88vh] bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-sunken/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/40 bg-primary text-accent shrink-0">
              <ShieldCheck size={20} strokeWidth={2} aria-hidden />
            </div>
            <div className="min-w-0">
              <h3
                id="doc-modal-title"
                className="font-display text-sm sm:text-base font-semibold text-text truncate"
              >
                {t(lang, "about.modal.doc_title")}
              </h3>
              <p className="text-[11px] text-text-muted truncate">
                {t(lang, "about.modal.doc_subtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Direct Bali Provincial Government Portal Link */}
            <a
              href="https://www.baliprov.go.id"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-primary hover:border-primary/40"
            >
              <ExternalLink size={13} strokeWidth={1.75} aria-hidden />
              <span>{t(lang, "about.modal.visit_portal")}</span>
            </a>

            {/* Direct Open in New Tab / Download Link */}
            <a
              href="/docs/SE_Gubernur_Bali_No_7_Tahun_2025.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary-tint px-3 py-1.5 text-xs font-semibold text-primary transition-all duration-150 hover:bg-primary hover:text-primary-fg focus-visible:shadow-focus"
            >
              <Download size={13} strokeWidth={1.75} aria-hidden />
              <span>{t(lang, "about.modal.open_new_tab")}</span>
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-sunken transition-colors focus-visible:shadow-focus"
              aria-label={t(lang, "about.modal.close")}
            >
              <X size={18} strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>

        {/* Modal Body: Embedded PDF Iframe */}
        <div className="flex-1 w-full bg-[#525659] relative">
          <iframe
            src="/docs/SE_Gubernur_Bali_No_7_Tahun_2025.pdf#toolbar=1&navpanes=0"
            className="w-full h-full border-0"
            title={t(lang, "about.modal.doc_title")}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
