"use client";

import { Navigation, X } from "lucide-react";
import { useLang } from "@/lib/language";
import { tExplore, type ExploreKey } from "@/lib/i18n.explore";
import { formatDistance } from "@/lib/geo";
import { formatDuration, type RouteView } from "@/lib/route";
import type { Amenity, RouteStep } from "@shared/contract";

interface DestinationCardProps {
  amenity: Amenity;
  onClear: () => void;
  route: RouteView;
  onRoute: () => void;
  onHideRoute: () => void;
  /** False when there is no position to start from, which is why the button
   *  explains itself instead of simply sitting there disabled. */
  canRoute: boolean;
}

/**
 * The Amenity a visitor chose out of an assistant answer, named on the map,
 * with the way there.
 *
 * A pin on its own is a dot somebody has to remember the meaning of. This says
 * what it is, gives a way to be rid of it, and holds the one control that
 * turns a place into a journey.
 *
 * The attribution is not decoration. OpenStreetMap data is ODbL-licensed and
 * the credit travels with anything read from it, which is both the pin and the
 * roads under the line.
 */
export function DestinationCard({
  amenity,
  onClear,
  route,
  onRoute,
  onHideRoute,
  canRoute,
}: DestinationCardProps) {
  const { lang } = useLang();

  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-[400] flex justify-center">
      <div className="pointer-events-auto w-full max-w-md rounded-lg border border-border bg-surface px-4 py-3 shadow-md">
        <div className="flex items-start gap-3">
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

        <RouteSection
          route={route}
          onRoute={onRoute}
          onHideRoute={onHideRoute}
          canRoute={canRoute}
        />

        <p className="mt-2 text-xs text-text-muted">
          {tExplore(lang, "explore.amenity.source")}
        </p>
      </div>
    </div>
  );
}

function RouteSection({
  route,
  onRoute,
  onHideRoute,
  canRoute,
}: Pick<DestinationCardProps, "route" | "onRoute" | "onHideRoute" | "canRoute">) {
  const { lang } = useLang();

  if (!canRoute) {
    return (
      <p className="mt-3 border-t border-border pt-3 text-sm text-text-secondary">
        {tExplore(lang, "explore.route.needLocation")}
      </p>
    );
  }

  if (route.status === "idle") {
    return (
      <button
        type="button"
        onClick={onRoute}
        className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-primary bg-primary text-sm font-medium text-primary-fg transition-colors duration-150 hover:bg-primary-hover"
      >
        <Navigation size={16} strokeWidth={1.75} aria-hidden />
        {tExplore(lang, "explore.route.go")}
      </button>
    );
  }

  if (route.status === "loading") {
    return (
      <p className="mt-3 border-t border-border pt-3 text-sm text-text-secondary" aria-live="polite">
        {tExplore(lang, "explore.route.loading")}
      </p>
    );
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      {route.status === "ready" ? (
        <>
          <p className="text-sm font-medium text-text">
            {tExplore(lang, "explore.route.summary", {
              distance: formatDistance(route.route.distanceM, lang),
              duration: formatDuration(route.route.durationS, lang),
            })}
          </p>
          <Steps steps={route.route.steps} />
        </>
      ) : (
        // Never softened, never shortened. A straight line across Bali crosses
        // rice terraces and ravines, and saying so is the whole difference
        // between a useful direction and a wrong distance.
        <p className="text-sm text-text-secondary">
          {tExplore(lang, "explore.route.straight", {
            distance: formatDistance(route.straightM, lang),
          })}
        </p>
      )}

      <button
        type="button"
        onClick={onHideRoute}
        className="mt-2 text-sm font-medium text-primary underline underline-offset-2 transition-colors duration-150 hover:text-primary-hover"
      >
        {tExplore(lang, "explore.route.hide")}
      </button>
    </div>
  );
}

function Steps({ steps }: { steps: RouteStep[] }) {
  const { lang } = useLang();
  if (steps.length === 0) return null;

  return (
    <div className="mt-2">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {tExplore(lang, "explore.route.steps")}
      </p>
      {/* Scrolls rather than growing: a cross-island route fills the screen
          with turns and buries the map it is describing. */}
      <ol className="sasana-scroll mt-1 max-h-40 space-y-1 overflow-y-auto pr-1">
        {steps.map((step, i) => (
          <li key={i} className="flex items-baseline gap-2 text-sm text-text-secondary">
            <span className="min-w-0 flex-1">
              {tExplore(lang, `explore.route.m.${step.maneuver}` as ExploreKey)}
              {step.road && ` ${tExplore(lang, "explore.route.on", { road: step.road })}`}
            </span>
            <span className="shrink-0 tabular-nums text-text-muted">
              {formatDistance(step.distanceM, lang)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
