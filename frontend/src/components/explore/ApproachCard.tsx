"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { SiteThumb } from "@/components/explore/SiteThumb";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";
import { playApproachChime } from "@/lib/audio";
import type { Site } from "@/data/sites";

interface ApproachCardProps {
  site: Site;
  onDismiss?: () => void;
  onClick?: () => void;
}

/**
 * The approach notice card, displayed when crossing the Approach perimeter.
 * Interactive: plays a calm audio chime on arrival, offers a dismiss button,
 * and allows clicking to focus and inspect the site.
 */
export function ApproachCard({ site, onDismiss, onClick }: ApproachCardProps) {
  const { lang } = useLang();

  useEffect(() => {
    playApproachChime();
  }, [site.id]);

  const count = site.customs.length;
  const countText =
    count === 1
      ? tExplore(lang, "explore.sheet.count.one")
      : tExplore(lang, "explore.sheet.count.many", { count: String(count) });

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={onClick}
      className={[
        "animate-approachIn pointer-events-auto absolute z-[600]",
        // Below sm the map has no zoom control and the panel is a bottom
        // sheet, so the top edge is free and the card can have the width.
        "inset-x-3 top-3",
        // From sm up it docks to the right rail. `top-[5.5rem]` clears
        // Leaflet's zoom control, which appears at exactly this breakpoint and
        // owns the corner above.
        "sm:inset-x-auto sm:right-3 sm:top-[5.5rem] sm:w-80",
        // Interactive card styling with smooth hover transitions
        "cursor-pointer rounded-xl border border-border bg-surface p-4 shadow-lg transition-all duration-200 hover:border-border-strong hover:shadow-xl focus-visible:shadow-focus",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <SiteThumb size={40} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {tExplore(lang, "explore.sheet.approaching")}
            </p>
            {onDismiss && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
                aria-label={lang === "id" ? "Tutup pemberitahuan" : "Dismiss notice"}
                className="-mr-1 -mt-1 rounded-md p-1 text-text-muted transition-colors hover:bg-surface-sunken hover:text-text focus-visible:shadow-focus"
              >
                <X size={16} strokeWidth={1.75} aria-hidden />
              </button>
            )}
          </div>
          <p className="font-display text-lg font-semibold leading-tight text-text">{site.name}</p>
          <p className="mt-1 text-sm text-text-secondary">{countText}</p>
        </div>
      </div>
    </div>
  );
}
