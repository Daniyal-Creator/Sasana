"use client";

import { ExternalLink, Navigation } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLang } from "@/lib/language";
import { tExplore, type ExploreKey } from "@/lib/i18n.explore";
import { formatDistance, type LatLng } from "@/lib/geo";
import { formatDuration, mapsDirectionsUrl, type RouteView } from "@/lib/route";
import type { RouteStep } from "@shared/contract";

interface RouteActionsProps {
  /** Where the visitor is going: an Amenity, or a Site. */
  to: LatLng;
  /** Where they are. Null when there is no fix to start from. */
  from: LatLng | null;
  /**
   * The route, when this panel is the one that asked for it.
   *
   * A surface that does not own the current route is passed `idle`, which is
   * how one route at a time is enforced without any surface having to know
   * about the others: whoever asked last is the only one showing anything.
   */
  route: RouteView;
  onRoute: () => void;
  onHideRoute: () => void;
}

/**
 * Getting to a place: SASANA's own route, and the way out to Google Maps.
 *
 * One component for both the Amenity panel and the Site panel, because the
 * hardest part of this is a sentence rather than a layout. The straight-line
 * wording is load-bearing (ADR-0021) and a second copy of it is a second place
 * for somebody to shorten it into a lie about distance.
 */
export function RouteActions({ to, from, route, onRoute, onHideRoute }: RouteActionsProps) {
  const { lang } = useLang();
  const externalUrl = mapsDirectionsUrl(to, from);

  // The door out is on the panel in every state, and it leads the two where
  // SASANA cannot draw a line itself. A visitor at a temple gate with no way to
  // get anywhere is the one outcome worth avoiding at the cost of sending them
  // out of the app (ADR-0022).
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

  if (!from) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-text-secondary">
          {tExplore(lang, "explore.route.needLocation")}
        </p>
        {external("primary")}
      </div>
    );
  }

  if (route.status === "idle" || route.status === "loading") {
    return (
      <div className="space-y-2">
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
    <div>
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
