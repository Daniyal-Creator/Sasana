"use client";

import { SiteThumb } from "@/components/explore/SiteThumb";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";
import type { Site } from "@/data/sites";

interface ApproachCardProps {
  site: Site;
}

/**
 * The notice, and nothing else.
 *
 * It has no controls. Crossing an Approach now turns the panel over to the
 * Site by itself, so there is nothing left for this to ask: the customs are
 * already on the left by the time this is read. What it does is answer the
 * question the panel change raises, which is "why did that just happen".
 *
 * That is also why it may leave on a timer, where an earlier version of this
 * card must not have. Back then it was the only way in and removing itself
 * would have meant a notice that never arrived. Now it is a label on something
 * that is already open, and a label that stays forever is litter over a map.
 */
export function ApproachCard({ site }: ApproachCardProps) {
  const { lang } = useLang();
  const count = site.customs.length;
  const countText =
    count === 1
      ? tExplore(lang, "explore.sheet.count.one")
      : tExplore(lang, "explore.sheet.count.many", { count: String(count) });

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "animate-fadeUp pointer-events-none absolute z-[600]",
        // Below sm the map has no zoom control and the panel is a bottom
        // sheet, so the top edge is free and the card can have the width.
        "inset-x-3 top-3",
        // From sm up it docks to the right rail. `top-[5.5rem]` clears
        // Leaflet's zoom control, which appears at exactly this breakpoint and
        // owns the corner above.
        "sm:inset-x-auto sm:right-3 sm:top-[5.5rem] sm:w-80",
        // On a solid surface, never as bare text over tiles: contrast against
        // a moving basemap cannot be verified, and Voyager changes colour from
        // one tile to the next.
        "rounded-xl border border-border bg-surface p-4 shadow-lg",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <SiteThumb size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            {tExplore(lang, "explore.sheet.approaching")}
          </p>
          <p className="font-display text-lg font-semibold leading-tight text-text">{site.name}</p>
          <p className="mt-1 text-sm text-text-secondary">{countText}</p>
        </div>
      </div>
    </div>
  );
}
