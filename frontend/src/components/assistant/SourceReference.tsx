"use client";

import { ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

interface SourceReferenceProps {
  source: string | null;
  grounded: boolean;
}

export function SourceReference({ source, grounded }: SourceReferenceProps) {
  const { lang } = useLang();

  if (!grounded) {
    return <p className="mt-2 text-sm italic text-text-muted">{t(lang, "assistant.nosource")}</p>;
  }

  if (!source) return null;

  return (
    <div className="mt-3 border-t border-border pt-2">
      <p className="flex items-center gap-1.5 text-sm text-text-secondary">
        <ShieldCheck size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-accent-strong" />
        {t(lang, "assistant.source", { source })}
      </p>
    </div>
  );
}
