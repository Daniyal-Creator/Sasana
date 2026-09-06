"use client";

import { MapPin, ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";
import type { ChatKind } from "@shared/contract";

interface SourceReferenceProps {
  source: string | null;
  kind: ChatKind;
}

export function SourceReference({ source, kind }: SourceReferenceProps) {
  const { lang } = useLang();

  // A refusal already opens by saying it has no rule for the question, and then
  // spends its remaining words offering what it does have. Repeating "no
  // official rule found" underneath undoes that: the visitor is left on the
  // negative note the refusal was rewritten to move them off.
  if (kind === "none") return null;

  // `context` and `general` do carry this line, and there it earns its place:
  // those answers read with authority and have no Rule behind them, so the
  // absence is the one thing the visitor cannot see for themselves. Giving each
  // its own icon and wording is the tier UI - see .scratch/assistant/spec.md.
  if (!source || (kind !== "rule" && kind !== "places")) {
    return <p className="mt-2 text-sm italic text-text-muted">{t(lang, "assistant.nosource")}</p>;
  }

  // A map is a source, but not an official one, so it does not get the shield.
  // A visitor who sees the same badge under "the Circular says" and under
  // "OpenStreetMap says" has been told the two carry equal weight.
  const Icon = kind === "places" ? MapPin : ShieldCheck;

  return (
    <div className="mt-3 border-t border-accent pt-2">
      <p className="flex items-center gap-1.5 text-sm text-text-secondary">
        <Icon size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-accent-strong" />
        {t(lang, "assistant.source", { source })}
      </p>
    </div>
  );
}
