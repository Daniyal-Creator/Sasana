"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { MapPin, Bell, ShieldCheck, Camera, Compass, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CustomIcon } from "@/components/explore/CustomIcon";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";
import { haversineMeters, formatDistance } from "@/lib/geo";
import type { LatLng } from "@/lib/geo";
import type { Lang } from "@/lib/i18n";
import { SITES } from "@/data/sites";
import type { Custom } from "@/data/sites";

// Site detail (geofencing-ui-prompt §9.6): accordion of customs, the Odalan
// notice when one falls within seven days, and the Explore Mode escape hatch.

const ODALAN_WINDOW_DAYS = 7;

function daysUntil(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target.getTime() - todayMidnight.getTime()) / 86_400_000);
}

function formatOdalanDate(dateStr: string, lang: Lang): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-GB", {
    day: "numeric",
    month: "long",
  }).format(new Date(y, m - 1, d));
}

function CustomRow({
  custom,
  lang,
  open,
  onToggle,
  panelId,
}: {
  custom: Custom;
  lang: Lang;
  open: boolean;
  onToggle: () => void;
  panelId: string;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-surface-sunken"
      >
        <CustomIcon icon={custom.icon} size={20} className="shrink-0 text-primary" />
        <span className="min-w-0 flex-1">
          <span className="block text-base font-medium text-text">{custom.title[lang]}</span>
          <span className="block truncate text-sm text-text-secondary">{custom.summary[lang]}</span>
        </span>
        <ChevronDown
          size={20}
          strokeWidth={1.75}
          aria-hidden
          className={[
            "shrink-0 text-text-muted transition-transform duration-200 ease-out",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>
      {open && (
        <div id={panelId} className="px-4 pb-4 pl-12">
          <p className="text-sm text-text-secondary">{custom.detail[lang]}</p>
        </div>
      )}
    </li>
  );
}

export default function SiteDetailPage() {
  const { lang } = useLang();
  const params = useParams<{ siteId: string }>();
  const site = SITES.find((s) => s.id === params.siteId);

  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [position, setPosition] = useState<LatLng | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!("permissions" in navigator)) return;
    navigator.permissions.query({ name: "geolocation" }).then((status) => {
      if (cancelled || status.state !== "granted") return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!cancelled) setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const upcomingOdalan = useMemo(
    () =>
      site
        ? site.odalanDates.find((date) => {
            const days = daysUntil(date);
            return days >= 0 && days <= ODALAN_WINDOW_DAYS;
          })
        : undefined,
    [site],
  );

  if (!site) notFound();

  const distance = position ? haversineMeters(position, site) : null;
  const meta = distance
    ? tExplore(lang, "explore.detail.meta", {
        region: site.region,
        distance: formatDistance(distance, lang),
      })
    : tExplore(lang, "explore.detail.metaNoDistance", { region: site.region });

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <div className="mx-auto w-full max-w-tool flex-1 px-4 pb-6 pt-6 sm:px-6">
        <h1 className="font-display text-h2 font-semibold text-text">{site.name}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
          <MapPin size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-primary" />
          {meta}
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-lg bg-primary-tint p-4">
          <MapPin size={20} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-primary" />
          <p className="text-sm text-text">{tExplore(lang, "explore.detail.band")}</p>
        </div>

        {upcomingOdalan && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-status-warn-border bg-status-warn-bg p-4">
            <Bell size={20} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-status-warn-fg" />
            <div>
              <p className="text-sm font-medium text-status-warn-fg">
                {tExplore(lang, "explore.detail.odalan.title", {
                  date: formatOdalanDate(upcomingOdalan, lang),
                })}
              </p>
              <p className="mt-1 text-sm text-status-warn-fg">
                {tExplore(lang, "explore.detail.odalan.body")}
              </p>
            </div>
          </div>
        )}

        <h2 className="mt-8 font-display text-h3 font-semibold text-text">
          {tExplore(lang, "explore.detail.customsTitle")}
        </h2>
        <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-surface shadow-sm">
          {site.customs.map((custom) => (
            <CustomRow
              key={custom.id}
              custom={custom}
              lang={lang}
              open={openIds.has(custom.id)}
              onToggle={() => toggle(custom.id)}
              panelId={`custom-${site.id}-${custom.id}`}
            />
          ))}
        </ul>

        <p className="mt-4 flex items-center gap-2 text-sm text-text-muted">
          <ShieldCheck size={16} strokeWidth={1.75} aria-hidden className="shrink-0" />
          {tExplore(lang, "explore.detail.source", { source: site.source })}
        </p>
      </div>

      {/* Sticky action bar on mobile, inline at md+ (matches /check pattern) */}
      <div className="sticky bottom-0 border-t border-border bg-bg px-4 py-3 md:static md:border-0 md:bg-transparent md:py-0">
        <div className="mx-auto max-w-tool space-y-3 md:px-2 md:pb-8">
          <Button size="lg" icon={Camera} href="/check" className="w-full">
            {tExplore(lang, "explore.detail.checkPhoto")}
          </Button>
          <Button size="lg" variant="secondary" icon={Compass} href={`/explore?simulate=${site.id}`} className="w-full">
            {tExplore(lang, "explore.detail.simulate")}
          </Button>
        </div>
      </div>
    </>
  );
}