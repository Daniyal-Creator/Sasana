"use client";

import { X } from "lucide-react";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";
import { formatDistance } from "@/lib/geo";
import type { Amenity } from "@shared/contract";

interface DestinationCardProps {
  amenity: Amenity;
  onClear: () => void;
}

/**
 * The Amenity a visitor chose out of an assistant answer, named on the map.
 *
 * A pin on its own is a dot somebody has to remember the meaning of. This says
 * what it is and, more importantly, gives a way to be rid of it: without that
 * the destination would sit on the map until the tab closed.
 *
 * The attribution is not decoration. OpenStreetMap data is ODbL-licensed and
 * the credit travels with anything read from it, which now includes this.
 */
export function DestinationCard({ amenity, onClear }: DestinationCardProps) {
  const { lang } = useLang();

  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-[400] flex justify-center">
      <div className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3 shadow-md">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {tExplore(lang, "explore.amenity.eyebrow")}
          </p>
          <p className="truncate text-base font-medium text-text">{amenity.name}</p>
          <p className="truncate text-sm text-text-secondary">
            {/* The OSM tag as it was written. Turning `guest_house` into
                "hotel" would be the app making a claim the map never did. */}
            {amenity.kind.replace(/_/g, " ")}
            {amenity.distanceM > 0 && ` · ${formatDistance(amenity.distanceM, lang)}`}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {tExplore(lang, "explore.amenity.source")}
          </p>
        </div>

        <button
          type="button"
          onClick={onClear}
          aria-label={tExplore(lang, "explore.amenity.clear")}
          className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:bg-surface-sunken"
        >
          <X size={18} strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </div>
  );
}
