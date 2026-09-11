"use client";

import { AlertTriangle, ScanFace, Shield, User } from "lucide-react";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

/**
 * Placeholder shown in the result panel when no analysis has been run yet.
 * Displays an empty-state card with preview skeleton rows indicating what
 * the attire, warning, and custom rules analysis will evaluate.
 */
export function CheckEmptyState() {
  const { lang } = useLang();

  return (
    <div className="flex h-full min-h-[340px] flex-col items-center justify-center rounded-2xl border border-border bg-surface/70 p-8 text-center shadow-sm sm:min-h-[380px] lg:min-h-[420px]">
      <ScanFace size={48} strokeWidth={1.5} aria-hidden className="text-text-muted" />
      <p className="mt-4 font-display text-base font-normal text-text-secondary sm:text-lg">
        {t(lang, "check.placeholder")}
      </p>

      {/* Preview skeleton rows */}
      <div className="mt-8 flex w-full max-w-[260px] flex-col gap-3.5 sm:max-w-[280px]" aria-hidden="true">
        {/* Row 1: Attire / User */}
        <div className="flex items-center gap-3">
          <User size={18} strokeWidth={1.75} className="shrink-0 text-text-muted" />
          <div className="h-3 w-full rounded-full bg-surface-sunken" />
        </div>
        {/* Row 2: Context / Advice */}
        <div className="flex items-center gap-3">
          <AlertTriangle size={18} strokeWidth={1.75} className="shrink-0 text-text-muted" />
          <div className="h-3 w-3/5 rounded-full bg-surface-sunken" />
        </div>
        {/* Row 3: Rules / Protection */}
        <div className="flex items-center gap-3">
          <Shield size={18} strokeWidth={1.75} className="shrink-0 text-text-muted" />
          <div className="h-3 w-4/5 rounded-full bg-surface-sunken" />
        </div>
      </div>
    </div>
  );
}


