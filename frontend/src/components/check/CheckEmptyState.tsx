"use client";

import { ScanFace } from "lucide-react";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

/**
 * Placeholder shown in the result panel when no analysis has been run yet.
 */
export function CheckEmptyState() {
  const { lang } = useLang();

  return (
    <div className="flex h-full min-h-[300px] sm:min-h-[340px] lg:min-h-[380px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-strong p-8 text-center bg-transparent">
      <ScanFace size={44} strokeWidth={1.5} aria-hidden className="text-text-muted" />
      <p className="mt-4 text-sm font-medium text-text-secondary">
        {t(lang, "check.placeholder")}
      </p>
    </div>
  );
}

