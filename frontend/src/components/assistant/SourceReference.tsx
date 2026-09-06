"use client";

import { ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";
import type { ChatKind } from "@shared/contract";

interface SourceReferenceProps {
  source: string | null;
  kind: ChatKind;
}

export function SourceReference({ source, kind }: SourceReferenceProps) {
  const { lang } = useLang();

  // `context` reads as "no official source" for now, which is true of it: it is
  // an answer with no Rule behind it. Giving it its own icon and wording is the
  // tier-2 UI, and it lands with the server half that starts producing it - see
  // .scratch/assistant/spec.md. Until then nothing returns this kind.
  if (kind !== "rule" || !source) {
    return <p className="mt-2 text-sm italic text-text-muted">{t(lang, "assistant.nosource")}</p>;
  }

  return (
    <div className="mt-3 border-t border-accent pt-2">
      <p className="flex items-center gap-1.5 text-sm text-text-secondary">
        <ShieldCheck size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-accent-strong" />
        {t(lang, "assistant.source", { source })}
      </p>
    </div>
  );
}
