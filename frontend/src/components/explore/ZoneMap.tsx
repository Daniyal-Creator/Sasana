"use client";

import { useMemo } from "react";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";
import type { LatLng } from "@/lib/geo";
import type { Site } from "@/data/sites";

// Stylized, not survey-accurate. Fixed bounding box over Bali; a 400 m radius
// is far under a pixel at this scale, so zones are drawn larger than true
// scale and clamped to a minimum visible radius (geofencing-ui-prompt §8).

const MIN_LNG = 114.4;
const MAX_LNG = 115.75;
const MIN_LAT = -8.9;
const MAX_LAT = -8.05;

const VIEW_W = 135;
const VIEW_H = 85;

// Sizes below are in viewBox USER UNITS, not CSS pixels. The map renders around
// 343px wide, so one unit is roughly 2.5px and anything sized as if it were a
// pixel value comes out two and a half times too big. Keep that in mind before
// touching these numbers.
const MIN_ZONE_RADIUS = 3.5; // about 9px rendered
const ZONE_UNITS_PER_KM = 8;
const USER_DOT_R = 2.2;
const USER_HALO_R = 5;
const LABEL_FONT = 4.5; // about 11px rendered
const LABEL_GAP = 3.5;

function project(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * VIEW_W;
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * VIEW_H;
  return { x, y };
}

interface ZoneMapProps {
  sites: Site[];
  position?: LatLng | null;
  selectedSiteId?: string | null;
  onSelectSite?: (siteId: string) => void;
  className?: string;
}

export function ZoneMap({
  sites,
  position = null,
  selectedSiteId = null,
  onSelectSite,
  className = "",
}: ZoneMapProps) {
  const { lang } = useLang();
  const interactive = Boolean(onSelectSite);

  const zones = useMemo(
    () =>
      sites.map((site) => {
        const { x, y } = project(site.lat, site.lng);
        return { site, x, y, r: Math.max(MIN_ZONE_RADIUS, (site.radiusM / 1000) * ZONE_UNITS_PER_KM) };
      }),
    [sites],
  );

  const userDot = position ? project(position.lat, position.lng) : null;

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label={tExplore(lang, "explore.map.aria", { count: String(sites.length) })}
      className={`h-full w-full ${className}`}
    >
      <rect x="0" y="0" width={VIEW_W} height={VIEW_H} className="fill-surface-sunken" />
      {/* Water hints. Decorative, not a coastline. */}
      <ellipse cx="12" cy="58" rx="26" ry="40" className="fill-primary-tint" />
      <ellipse cx="128" cy="14" rx="20" ry="24" className="fill-primary-tint" />

      {zones.map(({ site, x, y, r }) => {
        const selected = selectedSiteId === site.id;
        return (
          <circle
            key={site.id}
            cx={x}
            cy={y}
            r={r}
            className="fill-primary stroke-primary"
            fillOpacity={selected ? 0.18 : 0.12}
            strokeWidth={selected ? 3 : 2}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? site.name : undefined}
            onClick={interactive ? () => onSelectSite?.(site.id) : undefined}
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectSite?.(site.id);
                    }
                  }
                : undefined
            }
          >
            <title>{site.name}</title>
          </circle>
        );
      })}

      {userDot && (
        <>
          <circle cx={userDot.x} cy={userDot.y} r={USER_HALO_R} className="fill-primary" fillOpacity={0.18} />
          <circle cx={userDot.x} cy={userDot.y} r={USER_DOT_R} className="fill-primary" />
        </>
      )}

      {/* Only the selected Site is labelled. Six labels at a legible size overlap
          each other and run off the canvas, and the list beside this map already
          names every Site, which is also what a screen reader reads. */}
      {zones
        .filter(({ site }) => site.id === selectedSiteId)
        .map(({ site, x, y, r }) => (
          <text
            key={`label-${site.id}`}
            x={Math.min(Math.max(x, 2), VIEW_W - 2)}
            y={Math.min(y + r + LABEL_GAP, VIEW_H - 1)}
            textAnchor={x < 20 ? "start" : x > VIEW_W - 20 ? "end" : "middle"}
            style={{ fontSize: LABEL_FONT }}
            className="fill-text font-medium"
          >
            {site.name}
          </text>
        ))}
    </svg>
  );
}