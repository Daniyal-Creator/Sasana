"use client";

import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";
import { resolveTierLine } from "@/lib/answer-tier";
import type { ChatKind } from "@shared/contract";

interface SourceReferenceProps {
  source: string | null;
  kind: ChatKind;
}

export function SourceReference({ source, kind }: SourceReferenceProps) {
  const { lang } = useLang();

  const line = resolveTierLine(kind, source);
  if (!line) return null;

  const { icon: Icon, labelKey, params, attributed } = line;

  // Weight follows attribution. The separator and the accent colour belong to
  // answers that can name where they came from; background and history stay
  // muted, because reading with authority is the one thing they must not do.
  return (
    <div className={attributed ? "mt-3 border-t border-accent pt-2" : "mt-2"}>
      <p
        className={[
          "flex items-center gap-1.5 text-sm",
          attributed ? "text-text-secondary" : "text-text-muted",
        ].join(" ")}
      >
        <Icon
          size={16}
          strokeWidth={1.75}
          aria-hidden
          className={`shrink-0 ${attributed ? "text-accent-strong" : "text-text-muted"}`}
        />
        {t(lang, labelKey, params)}
      </p>
    </div>
  );
}
