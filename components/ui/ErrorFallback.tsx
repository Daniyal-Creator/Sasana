"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

interface ErrorFallbackProps {
  message?: string;
  onRetry: () => void;
  compact?: boolean;
}

export function ErrorFallback({ message, onRetry, compact = false }: ErrorFallbackProps) {
  const { lang } = useLang();

  return (
    <div
      role="alert"
      className={[
        "rounded-lg border border-status-warn-border bg-status-warn-bg animate-fadeUp",
        compact ? "p-4" : "p-5",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <TriangleAlert size={20} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-status-warn-fg" />
        <div className="space-y-3">
          <p className="text-base text-text">{message ?? t(lang, "check.error")}</p>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {t(lang, "common.retry")}
          </Button>
        </div>
      </div>
    </div>
  );
}
