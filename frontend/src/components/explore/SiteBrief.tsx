"use client";

import { useState } from "react";
import { MapPin, ShieldCheck, Camera, Compass, Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CustomIcon } from "@/components/explore/CustomIcon";
import { CustomVisual } from "@/components/explore/CustomVisual";
import { PanelBack } from "@/components/explore/PanelBack";
import { SiteThumb } from "@/components/explore/SiteThumb";
import { ZoneDiagram } from "@/components/explore/ZoneDiagram";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";
import { formatDistance } from "@/lib/geo";
import type { Lang } from "@/lib/i18n";
import type { Site, Odalan } from "@/data/sites";
import { isDummySite } from "@/data/dummy-sites";
import { MEANINGS } from "@/data/meanings";

const ODALAN_WINDOW_DAYS = 7;

function daysUntil(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - midnight.getTime()) / 86_400_000);
}

function formatOdalanDate(dateStr: string, lang: Lang): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-GB", {
    day: "numeric",
    month: "long",
  }).format(new Date(y, m - 1, d));
}

/**
 * The ceremony worth mentioning, if there is one inside the window.
 *
 * `force` is the demo switch that used to live on the detail route, moved here
 * with it: `?odalan=1` shows the notice for the nearest recorded ceremony
 * whatever its date. It exists so the notice can be seen without waiting for a
 * real one, which is the only alternative that does not involve typing a date
 * that is not true (ADR-0004).
 */
function upcomingOdalan(site: Site, force: boolean): Odalan | undefined {
  if (force) return site.odalan[0];
  return site.odalan.find((entry) => {
    const days = daysUntil(entry.date);
    return days >= 0 && days <= ODALAN_WINDOW_DAYS;
  });
}

interface SiteBriefProps {
  site: Site;
  distanceM: number | null;
  /** Returns the panel to the list it was opened from. */
  onBack?: () => void;
}

/**
 * What the sheet shows when a visitor inspects a Site: what is expected of them
 * here, and why each of those things is asked.
 *
 * The why layer is the point. A rule read at the gate is a rule forgotten by the
 * courtyard; a reason is not. Every line of it traces to a Rule in the knowledge
 * base and carries its own attribution, and a test fails if it ever drifts from
 * the source (`__tests__/site-rules.test.ts`).
 */
export function SiteBrief({ site, distanceM, onBack }: SiteBriefProps) {
  const { lang } = useLang();
  const searchParams = useSearchParams();
  const odalan = upcomingOdalan(site, searchParams.get("odalan") === "1");
  const [expandedCustoms, setExpandedCustoms] = useState<Record<string, boolean>>({});

  function toggleCustom(id: string) {
    setExpandedCustoms((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  return (
    <div>
      {onBack && <PanelBack label={tExplore(lang, "explore.panel.back")} onClick={onBack} />}

      {/* The mark carries the top of the panel so the name is not the only
          thing arriving. Same tile as the row this was opened from, one size
          up, which is what makes moving between the two read as one object
          rather than two screens. */}
      <div className="flex items-start gap-3">
        <SiteThumb size={56} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-h3 font-semibold leading-tight text-text">
            {site.name}
          </h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-primary" />
              {site.region}
            </span>
            {distanceM !== null && (
              <>
                <span aria-hidden className="text-text-muted">
                  ·
                </span>
                <span className="tabular-nums">{formatDistance(distanceM, lang)}</span>
              </>
            )}
          </p>
          <p className="mt-0.5 text-sm text-text-secondary">{site.areaLabel[lang]}</p>
        </div>
      </div>

      <ZoneDiagram site={site} />

      {odalan && (
        <div className="mt-4 rounded-md border border-status-warn-border bg-status-warn-bg p-3">
          <p className="flex items-start gap-2 text-sm font-medium text-status-warn-fg">
            <Bell size={16} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0" />
            {tExplore(lang, "explore.detail.odalan.title", {
              date: formatOdalanDate(odalan.date, lang),
            })}
          </p>
          <p className="mt-1 pl-6 text-sm text-status-warn-fg">
            {tExplore(lang, "explore.detail.odalan.body")}
          </p>
        </div>
      )}

      <h3 className="mt-6 text-xs font-medium uppercase tracking-wide text-text-muted">
        {tExplore(lang, "explore.detail.customsTitle")}
      </h3>

      {/* Deliberately not a list of cards. Each Custom is a rule and a reason,
          separated by a hairline: the rhythm carries the grouping, and a card
          per item would turn five short paragraphs into five boxes. */}
      <ul className="mt-3 divide-y divide-border">
        {site.customs.map((custom) => {
          const meanings = custom.ruleIds
            .map((ruleId) => MEANINGS[ruleId])
            .filter((m): m is (typeof MEANINGS)[string] => Boolean(m));
          const isExpanded = !!expandedCustoms[custom.id];

          return (
            <li key={custom.id} className="py-5 first:pt-0">
              <div className="flex items-start gap-3">
                {/* The icon sits in a tile rather than floating beside the
                    text. Bare glyphs down a column of prose disappear into it;
                    tiles give the list a spine to scan. */}
                <span
                  aria-hidden
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border bg-surface text-primary"
                >
                  <CustomIcon icon={custom.icon} size={20} />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    {custom.title[lang]}
                  </p>
                  {/* The instruction, not the essay. A visitor at a gate acts on
                      this line, so it is the largest thing in the row. */}
                  <p className="mt-0.5 text-base font-medium leading-snug text-text">
                    {custom.summary[lang]}
                  </p>
                </div>
              </div>

              {/* Cultural Visual Object representation */}
              <div className="mt-3">
                <CustomVisual icon={custom.icon} customId={custom.id} />
              </div>

              {/* The reason, as a collapsible dropdown */}
              {meanings.length > 0 && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => toggleCustom(custom.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`custom-meaning-${custom.id}`}
                    className="flex w-full items-center justify-between rounded-md bg-surface-sunken/70 px-3 py-2 text-xs font-medium text-text-secondary hover:bg-surface-sunken hover:text-text transition-colors focus-visible:shadow-focus"
                  >
                    <span className="flex items-center gap-1.5 font-medium text-accent-strong uppercase tracking-wide">
                      {tExplore(lang, "explore.detail.why")}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <span>
                        {isExpanded
                          ? lang === "id"
                            ? "Tutup penjelasan"
                            : "Hide explanation"
                          : lang === "id"
                            ? "Lihat penjelasan"
                            : "Read explanation"}
                      </span>
                      <ChevronDown
                        size={15}
                        strokeWidth={2}
                        aria-hidden
                        className={`transition-transform duration-200 ease-out-quart ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </span>
                  </button>

                  {isExpanded && (
                    <div
                      id={`custom-meaning-${custom.id}`}
                      className="mt-2 space-y-2.5 animate-fadeUp"
                    >
                      {meanings.map((meaning, i) => (
                        <div key={i} className="rounded-md bg-surface-sunken p-3">
                          <p className="text-sm leading-relaxed text-text-secondary">
                            {meaning.why[lang]}
                          </p>
                          <p className="mt-2 flex items-start gap-1.5 text-xs text-text-muted">
                            <ShieldCheck
                              size={13}
                              strokeWidth={1.75}
                              aria-hidden
                              className="mt-px shrink-0"
                            />
                            {meaning.source}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* A dummy's `source` is a disclaimer, not a citation, so it is not
          introduced by "Source:". Reading "Source: Dummy site, this place is
          not real" turns the one line that admits the place is invented into
          something that looks like provenance for it. */}
      <p className="mt-4 flex items-start gap-2 text-xs text-text-muted">
        <ShieldCheck size={14} strokeWidth={1.75} aria-hidden className="mt-px shrink-0" />
        {isDummySite(site)
          ? site.source
          : tExplore(lang, "explore.detail.source", { source: site.source })}
      </p>

      {/* The two actions that used to sit at the foot of the detail route.
          That route is gone: it showed the same Customs, the same source, and
          the same Odalan notice as this panel, one navigation away from the map
          that gives them their context. These are the only things it had that
          this did not, so they moved here rather than being lost with it.

          Stacked rather than side by side at any width. The panel is 380px on
          a desktop however wide the window is, and "Lihat seolah-olah saya di
          sini" does not survive being given half of that. */}
      <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5">
        <Button icon={Camera} href="/check" className="w-full">
          {tExplore(lang, "explore.detail.checkPhoto")}
        </Button>
        {/* Same route, different query: the walk starts in place rather than
            reloading the map the visitor is already looking at. */}
        <Button
          variant="secondary"
          icon={Compass}
          href={`/explore?simulate=${site.id}`}
          className="w-full"
        >
          {tExplore(lang, "explore.detail.simulate")}
        </Button>
      </div>
    </div>
  );
}
