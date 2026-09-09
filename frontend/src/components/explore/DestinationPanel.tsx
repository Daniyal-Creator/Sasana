"use client";

import { X } from "lucide-react";
import { RouteActions } from "@/components/explore/RouteActions";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";
import { formatDistance, type LatLng } from "@/lib/geo";
import type { RouteView } from "@/lib/route";
import type { Amenity } from "@shared/contract";

interface DestinationPanelProps {
  amenity: Amenity;
  onClear: () => void;
  route: RouteView;
  onRoute: () => void;
  onHideRoute: () => void;
  /** Where the visitor is, for the route origin. Null when there is no fix. */
  from: LatLng | null;
}

/**
 * The Amenity a visitor chose, and the ways of getting there.
 *
 * It lives in the panel rather than over the map, and that is not a move for
 * tidiness. Floating, it covered the thing it described, it had to cap the
 * directions at a scrollbox of its own inside a sheet that already scrolls, and
 * it read as a dialog the visitor had to dismiss. In the panel it is what it
 * actually is: the task they are on, sitting above everything else they might
 * do next.
 *
 * The attribution is not decoration. OpenStreetMap data is ODbL-licensed and
 * the credit travels with anything read from it, which is both the pin and the
 * roads under the line.
 */
export function DestinationPanel({
  amenity,
  onClear,
  route,
  onRoute,
  onHideRoute,
  from,
}: DestinationPanelProps) {
  const { lang } = useLang();

  return (
    <section className="mb-5 border-b border-border pb-5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {tExplore(lang, "explore.amenity.eyebrow")}
          </p>
          <p className="truncate text-lg font-medium text-text">{amenity.name}</p>
          <p className="truncate text-sm text-text-secondary">
            {/* The OSM tag as it was written. Turning `guest_house` into
                "hotel" would be the app making a claim the map never did. */}
            {amenity.kind.replace(/_/g, " ")}
            {amenity.distanceM > 0 && ` · ${formatDistance(amenity.distanceM, lang)}`}
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

      <div className="mt-4">
        <RouteActions
          to={{ lat: amenity.lat, lng: amenity.lng }}
          from={from}
          route={route}
          onRoute={onRoute}
          onHideRoute={onHideRoute}
        />
      </div>

      <p className="mt-3 text-xs text-text-muted">{tExplore(lang, "explore.amenity.source")}</p>
    </section>
  );
}
