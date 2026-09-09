"use client";

import { ExternalLink, Navigation, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLang } from "@/lib/language";
import { tExplore, type ExploreKey } from "@/lib/i18n.explore";
import { formatDistance, type LatLng } from "@/lib/geo";
import { formatDuration, mapsDirectionsUrl, type RouteView } from "@/lib/route";
import type { Amenity, RouteStep } from "@shared/contract";

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
  const externalUrl = mapsDirectionsUrl({ lat: amenity.lat, lng: amenity.lng }, from);

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

      <Directions
        route={route}
        onRoute={onRoute}
        onHideRoute={onHideRoute}
        externalUrl={externalUrl}
        canRoute={from !== null}
      />

      <p className="mt-3 text-xs text-text-muted">{tExplore(lang, "explore.amenity.source")}</p>
    </section>
  );
}

function Directions({
  route,
  onRoute,
  onHideRoute,
  externalUrl,
  canRoute,
}: {
  route: RouteView;
  onRoute: () => void;
  onHideRoute: () => void;
  externalUrl: string;
  canRoute: boolean;
}) {
  const { lang } = useLang();

  // The door out is on the panel in every state, and it leads the two where
  // SASANA cannot draw a line itself. A visitor at a temple gate with no way to
  // get anywhere is the one outcome worth avoiding at the cost of sending them
  // out of the app.
  const external = (variant: "primary" | "secondary") => (
    <Button
      href={externalUrl}
      external
      variant={variant}
      size="sm"
      icon={ExternalLink}
      iconPosition="trailing"
      className="w-full"
    >
      {tExplore(lang, "explore.route.external")}
    </Button>
  );

  if (!canRoute) {
    return (
      <div className="mt-4 space-y-2">
        <p className="text-sm text-text-secondary">
          {tExplore(lang, "explore.route.needLocation")}
        </p>
        {external("primary")}
      </div>
    );
  }

  if (route.status === "idle" || route.status === "loading") {
    return (
      <div className="mt-4 space-y-2">
        <Button
          onClick={onRoute}
          size="sm"
          icon={Navigation}
          loading={route.status === "loading"}
          className="w-full"
        >
          {tExplore(lang, route.status === "loading" ? "explore.route.loading" : "explore.route.go")}
        </Button>
        {external("secondary")}
        <p className="text-xs text-text-muted">{tExplore(lang, "explore.route.externalHint")}</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {route.status === "ready" ? (
        <>
          <p className="text-sm font-medium text-text">
            {tExplore(lang, "explore.route.summary", {
              distance: formatDistance(route.route.distanceM, lang),
              duration: formatDuration(route.route.durationS, lang),
            })}
          </p>
          <Steps steps={route.route.steps} />
          <div className="mt-3">{external("secondary")}</div>
        </>
      ) : (
        <>
          {/* Never softened, never shortened. A straight line across Bali
              crosses rice terraces and ravines, and saying so is the whole
              difference between a useful direction and a wrong distance. */}
          <p className="text-sm text-text-secondary">
            {tExplore(lang, "explore.route.straight", {
              distance: formatDistance(route.straightM, lang),
            })}
          </p>
          {/* Promoted here, because this is the state where SASANA has nothing
              better to offer than a line that is not a road. */}
          <div className="mt-3">{external("primary")}</div>
        </>
      )}

      <button
        type="button"
        onClick={onHideRoute}
        className="mt-3 text-sm font-medium text-primary underline underline-offset-2 transition-colors duration-150 hover:text-primary-hover"
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
    <div className="mt-3">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {tExplore(lang, "explore.route.steps")}
      </p>
      {/* No scrollbox of its own. The panel scrolls, and a second scroll area
          nested inside it was the floating card's problem, not this one's. */}
      <ol className="mt-1.5 space-y-1.5">
        {steps.map((step, i) => (
          <li key={i} className="flex items-baseline gap-3 text-sm">
            <span className="min-w-0 flex-1 text-text-secondary">
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
