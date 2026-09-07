"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText?: string;
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  altText,
}: ImagePreviewModalProps) {
  const { lang } = useLang();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(lang, "assistant.photo.preview")}
      className="fixed inset-0 z-50 flex items-center justify-center bg-text/80 p-4 sm:p-6 animate-fadeUp"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-check flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
          <h2 className="text-sm font-semibold text-text">
            {t(lang, "assistant.photo.preview")}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t(lang, "assistant.photo.close")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors duration-150 hover:bg-surface-sunken hover:text-text focus-visible:shadow-focus"
          >
            <X size={18} strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        <div className="flex max-h-[calc(90vh-60px)] items-center justify-center overflow-auto bg-surface-sunken/40 p-3 sm:p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={altText || t(lang, "check.photo.alt")}
            className="max-h-[calc(85vh-80px)] w-auto max-w-full rounded-md object-contain shadow-sm"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
