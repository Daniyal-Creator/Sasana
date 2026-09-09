"use client";

import { Binoculars } from "lucide-react";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";

interface NearbyToggleProps {
  active: boolean;
  onToggle: () => void;
  /** How many pixels at the bottom of the map the sheet covers, so this rides
   *  above it exactly as the locate button does. */
  bottomInset: number;
}

/**
 * Turns "Lihat sekitar" on and off.
 *
 * A child of `BaseMap` rather than part of it: the basemap owns the camera and
 * draws nothing of SASANA's own, and the reason this button exists - that Zones
 * and place names cannot share a screen - is entirely SASANA's.
 *
 * The pressed state is carried three ways: `aria-pressed` for a screen reader,
 * a filled face for a glance, and a sentence for everyone else. The sentence is
 * the one that satisfies C6, which survives the /explore carve-out: a visitor
 * who cannot separate the two fills still has to be able to tell the mode is on
 * and how to leave it.
 */
export function NearbyToggle({ active, onToggle, bottomInset }: NearbyToggleProps) {
  const { lang } = useLang();
  const label = tExplore(lang, "explore.around.toggle");

  return (
    <div
      className="pointer-events-none absolute inset-x-3 z-[400] flex flex-col items-end gap-2"
      style={{ bottom: `${bottomInset + 100}px` }}
    >
      {active && (
        <p className="pointer-events-auto max-w-[17rem] rounded-md border border-border bg-surface px-3 py-2 text-xs text-text-secondary shadow-md">
          {tExplore(lang, "explore.around.active")}
        </p>
      )}

      <button
        type="button"
        onClick={onToggle}
        aria-pressed={active}
        className={`pointer-events-auto flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium shadow-md transition-colors duration-150 ${
          active
            ? "border-primary bg-primary text-primary-fg hover:bg-primary-hover"
            : "border-border bg-surface text-primary hover:bg-surface-sunken"
        }`}
      >
        <Binoculars size={18} strokeWidth={1.75} aria-hidden />
        {label}
      </button>
    </div>
  );
}
