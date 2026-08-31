"use client";

import { MERU_BASE, MERU_PATHS } from "@/components/explore/meru";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";
import { approachRadiusM, formatDistance } from "@/lib/geo";
import type { Site } from "@/data/sites";

/**
 * The two circles this Site draws on the map, at their real ratio.
 *
 * The panel used to open with the name and then a column of prose, and the one
 * thing a visitor most needs to picture, how far out they will be told and how
 * far in the customs start, was described nowhere. This is that, and it is not
 * decoration: the radii are the Site's own, the ratio between the rings is the
 * true one, and the shapes match what the map draws, dashed and open for the
 * Approach, solid and filled for the Zone.
 *
 * Shape carries the distinction, not colour alone (Guardrails C6): the two
 * rings differ in stroke and in fill before they differ in anything else, and
 * each is labelled in words with its distance.
 */

/** The Approach ring always fills the frame, so the Zone reads as a share of it. */
const OUTER_R = 52;
const CENTRE = 60;

export function ZoneDiagram({ site }: { site: Site }) {
  const { lang } = useLang();
  const approachM = approachRadiusM(site);
  const innerR = Math.max(12, OUTER_R * (site.radiusM / approachM));
  const meruScale = 16 / 24;

  return (
    <div className="mt-4 flex items-center gap-5 rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 120 120"
        width="108"
        height="108"
        aria-hidden
        focusable="false"
        className="shrink-0"
      >
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r={OUTER_R}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="6 6"
          className="text-primary opacity-60"
        />
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r={innerR}
          className="text-primary"
          fill="currentColor"
          fillOpacity={0.12}
          stroke="currentColor"
          strokeWidth="2"
        />
        <g
          transform={`translate(${CENTRE - 12 * meruScale} ${CENTRE - 12 * meruScale}) scale(${meruScale})`}
          className="text-primary"
          fill="currentColor"
        >
          {MERU_PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
          <rect {...MERU_BASE} />
        </g>
      </svg>

      <dl className="min-w-0 flex-1 space-y-3">
        <div>
          <dt className="flex items-center gap-2 text-sm font-medium text-text">
            <span
              aria-hidden
              className="h-3 w-3 shrink-0 rounded-full border-2 border-primary bg-primary-tint"
            />
            {tExplore(lang, "explore.zone.inside")}
          </dt>
          <dd className="mt-0.5 pl-5 text-sm text-text-secondary">
            {formatDistance(site.radiusM, lang)}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-sm font-medium text-text">
            <span
              aria-hidden
              className="h-3 w-3 shrink-0 rounded-full border border-dashed border-primary"
            />
            {tExplore(lang, "explore.zone.told")}
          </dt>
          <dd className="mt-0.5 pl-5 text-sm text-text-secondary">
            {formatDistance(approachM, lang)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
