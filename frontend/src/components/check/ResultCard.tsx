"use client";

import { CircleCheck, CircleHelp, CircleX, RefreshCw, Sparkles, TriangleAlert, Camera } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLang } from "@/lib/language";
import { t, type CopyKey } from "@/lib/i18n";
import type { VisionResult, VisionStatus } from "@shared/contract";

interface ResultCardProps {
  result: VisionResult;
  onReset?: () => void;
}

// Status carried by header band + icon + label together, never color alone
// (ui-spec §5.3, DL5/DL8). No side-stripe.
const statusConfig: Record<
  VisionStatus,
  { icon: LucideIcon; labelKey: CopyKey; tipKey: CopyKey; band: string; borderClass: string }
> = {
  compliant: {
    icon: CircleCheck,
    labelKey: "result.compliant",
    tipKey: "result.tip.compliant",
    band: "bg-status-ok-bg text-status-ok-fg",
    borderClass: "border-status-ok-border",
  },
  needs_attention: {
    icon: TriangleAlert,
    labelKey: "result.needs_attention",
    tipKey: "result.tip.needs_attention",
    band: "bg-status-warn-bg text-status-warn-fg",
    borderClass: "border-status-warn-border",
  },
  not_compliant: {
    icon: CircleX,
    labelKey: "result.not_compliant",
    tipKey: "result.tip.not_compliant",
    band: "bg-status-bad-bg text-status-bad-fg",
    borderClass: "border-status-bad-border",
  },
  unclear: {
    icon: CircleHelp,
    labelKey: "result.unclear",
    tipKey: "result.tip.unclear",
    band: "bg-status-unknown-bg text-status-unknown-fg",
    borderClass: "border-status-unknown-border",
  },
};

export function ResultCard({ result, onReset }: ResultCardProps) {
  const { lang } = useLang();
  const config = statusConfig[result.status];
  const StatusIcon = config.icon;
  const isUnclear = result.status === "unclear";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`overflow-hidden rounded-lg border bg-surface shadow-md animate-resultIn ${config.borderClass}`}
    >
      <div className={`flex items-center gap-2 px-5 py-3 ${config.band}`}>
        <StatusIcon size={24} strokeWidth={1.75} aria-hidden />
        <span className="text-base font-semibold">{t(lang, config.labelKey)}</span>
      </div>

      <div className="space-y-4 p-5">
        <p className="text-base text-text">{result.reason}</p>

        {result.suggestion && (
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary">
              <Sparkles size={16} strokeWidth={1.75} aria-hidden className="text-accent-strong" />
              {t(lang, config.tipKey)}
            </p>
            <p className="mt-1 text-base font-medium text-text">{result.suggestion}</p>
          </div>
        )}

        {!isUnclear && result.reference && (
          <p className="text-sm text-text-muted">{t(lang, "check.source", { source: result.reference })}</p>
        )}
      </div>

      {onReset && (
        <div className="border-t border-border p-4">
          {isUnclear ? (
            <Button variant="primary" icon={Camera} onClick={onReset}>
              {t(lang, "check.unclear.retake")}
            </Button>
          ) : (
            <Button variant="secondary" icon={RefreshCw} onClick={onReset}>
              {t(lang, "check.reset")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
