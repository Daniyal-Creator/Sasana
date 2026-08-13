"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MapPin, MapPinOff, Bell, ScrollText, Compass, ShieldCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ZoneMap } from "@/components/explore/ZoneMap";
import { ApproachSheet } from "@/components/explore/ApproachSheet";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";
import type { LatLng } from "@/lib/geo";
import { haversineMeters, formatDistance, isInsideZone, hasExitedZone, nearestSite } from "@/lib/geo";
import { SITES } from "@/data/sites";
import type { Site } from "@/data/sites";

type View = "asking" | "outside" | "inside" | "explore";

function FeatureRow({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Bell;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-4">
      <Icon size={24} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-primary" />
      <div>
        <p className="font-medium text-text">{title}</p>
        <p className="text-sm text-text-secondary">{body}</p>
      </div>
    </li>
  );
}

export default function ExplorePage() {
  const { lang } = useLang();
  const [view, setView] = useState<View>("asking");
  const [position, setPosition] = useState<LatLng | null>(null);
  const [approachSite, setApproachSite] = useState<Site | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string>(SITES[0].id);

  const viewRef = useRef<View>("asking");
  const announced = useRef<Set<string>>(new Set());
  const approachSiteRef = useRef<Site | null>(null);
  const watchId = useRef<number | null>(null);

  const closest = useMemo(() => {
    if (!position) return [];
    return [...SITES]
      .map((site) => ({ site, distanceM: haversineMeters(position, site) }))
      .sort((a, b) => a.distanceM - b.distanceM)
      .slice(0, 3);
  }, [position]);

  function changeView(next: View) {
    viewRef.current = next;
    setView(next);
  }

  function handlePosition(p: LatLng) {
    setPosition(p);
    if (viewRef.current === "explore") return;

    const { site } = nearestSite(p, SITES);
    if (isInsideZone(p, site)) {
      if (!announced.current.has(site.id)) {
        announced.current.add(site.id);
        approachSiteRef.current = site;
        setApproachSite(site);
        changeView("inside");
      }
      return;
    }

    if (approachSiteRef.current && hasExitedZone(p, approachSiteRef.current)) {
      announced.current.delete(approachSiteRef.current.id);
      if (viewRef.current === "inside") changeView("outside");
      return;
    }

    if (viewRef.current === "asking") changeView("outside");
  }

  function startWatching() {
    if (!("geolocation" in navigator)) {
      changeView("explore");
      return;
    }
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => handlePosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => changeView("explore"),
      { enableHighAccuracy: true },
    );
  }

  useEffect(() => {
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  if (view === "asking") {
    return (
      <div className="mx-auto w-full max-w-tool flex-1 px-4 pb-10 pt-10 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-tint">
            <MapPin size={32} strokeWidth={1.75} aria-hidden className="text-primary" />
          </div>
          <h1 className="mt-5 font-display text-h1 font-semibold text-text">
            {tExplore(lang, "explore.permission.title")}
          </h1>
          <p className="mt-3 max-w-prose text-base text-text-secondary">
            {tExplore(lang, "explore.permission.body")}
          </p>
        </div>

        <ul className="mt-8 space-y-5">
          <FeatureRow
            icon={Bell}
            title={tExplore(lang, "explore.permission.feature1.title")}
            body={tExplore(lang, "explore.permission.feature1.body")}
          />
          <FeatureRow
            icon={ScrollText}
            title={tExplore(lang, "explore.permission.feature2.title")}
            body={tExplore(lang, "explore.permission.feature2.body")}
          />
          <FeatureRow
            icon={Compass}
            title={tExplore(lang, "explore.permission.feature3.title")}
            body={tExplore(lang, "explore.permission.feature3.body")}
          />
        </ul>

        <Card padding="md" className="mt-8">
          <p className="flex items-start gap-3 text-sm text-text-secondary">
            <ShieldCheck
              size={20}
              strokeWidth={1.75}
              aria-hidden
              className="mt-0.5 shrink-0 text-accent-strong"
            />
            {tExplore(lang, "explore.permission.privacy")}
          </p>
        </Card>

        <div className="mt-8 space-y-2">
          <Button size="lg" icon={MapPin} className="w-full" onClick={startWatching}>
            {tExplore(lang, "explore.permission.cta")}
          </Button>
          <Button variant="ghost" size="lg" className="w-full" onClick={() => changeView("explore")}>
            {tExplore(lang, "explore.permission.notnow")}
          </Button>
        </div>
      </div>
    );
  }

  if (view === "outside" && position) {
    return (
      <div className="mx-auto w-full max-w-tool flex-1 px-4 pb-10 pt-6 sm:px-6">
        <h1 className="font-display text-h2 font-semibold text-text">
          {tExplore(lang, "explore.nearby.title")}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">{tExplore(lang, "explore.nearby.subtitle")}</p>

        <div className="mt-6">
          <ZoneMap sites={SITES} position={position} className="h-48 rounded-lg" />
          <p className="mt-2 text-center text-xs text-text-muted">
            {tExplore(lang, "explore.map.notToScale")}
          </p>
        </div>

        <EmptyState
          icon={MapPinOff}
          title={tExplore(lang, "explore.none.title")}
          description={tExplore(
            lang,
            "explore.none.description",
            closest[0] ? { distance: formatDistance(closest[0].distanceM, lang) } : undefined,
          )}
        >
          <Button variant="secondary" onClick={() => changeView("explore")}>
            {tExplore(lang, "explore.browse.title")}
          </Button>
        </EmptyState>

        <p className="mt-8 text-xs font-medium uppercase tracking-wide text-text-muted">
          {tExplore(lang, "explore.closest.label")}
        </p>
        <ul className="mt-2 divide-y divide-border rounded-lg border border-border bg-surface shadow-sm">
          {closest.map(({ site, distanceM }) => (
            <li key={site.id}>
              <Link
                href={`/explore/${site.id}`}
                className="flex min-h-11 items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-surface-sunken"
              >
                <MapPin size={20} strokeWidth={1.75} aria-hidden className="shrink-0 text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-medium text-text">{site.name}</span>
                  <span className="block truncate text-sm text-text-secondary">
                    {site.areaLabel[lang]}
                  </span>
                </span>
                <span className="shrink-0 text-sm text-text-secondary">
                  {formatDistance(distanceM, lang)}
                </span>
                <ChevronRight size={20} strokeWidth={1.75} aria-hidden className="shrink-0 text-text-muted" />
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-text-muted">
          <ShieldCheck size={16} strokeWidth={1.75} aria-hidden />
          {tExplore(lang, "explore.checked")}
        </p>
      </div>
    );
  }

  if (view === "inside" && approachSite) {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-tool min-h-0 flex-1 px-4 pt-4 sm:px-6">
          <ZoneMap
            sites={SITES}
            position={position}
            selectedSiteId={approachSite.id}
            className="rounded-lg"
          />
          <p className="mt-2 pb-2 text-center text-xs text-text-muted">
            {tExplore(lang, "explore.map.notToScale")}
          </p>
        </div>
        <ApproachSheet site={approachSite} />
      </div>
    );
  }

  if (view === "explore") {
    const selected = SITES.find((site) => site.id === selectedSiteId) ?? SITES[0];
    const selectedDistance = position ? haversineMeters(position, selected) : null;
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-tool min-h-0 flex-1 flex-col px-4 pt-4 sm:px-6">
          <h1 className="sr-only">{tExplore(lang, "explore.browse.title")}</h1>

          <ZoneMap
            sites={SITES}
            position={position}
            selectedSiteId={selected.id}
            onSelectSite={setSelectedSiteId}
            className="min-h-0 flex-1 rounded-lg"
          />
          <p className="mt-2 text-center text-xs text-text-muted">
            {tExplore(lang, "explore.map.notToScale")}
          </p>

          <Card className="mt-4">
            <h2 className="font-display text-h2 font-semibold text-text">{selected.name}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
              <MapPin size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-primary" />
              {selected.region}
              {selectedDistance !== null && (
                <span aria-hidden>·</span>
              )}
              {selectedDistance !== null && formatDistance(selectedDistance, lang)}
            </p>
            <p className="mt-1 text-sm text-text-secondary">{selected.areaLabel[lang]}</p>
            <p className="mt-3 text-base text-text">{selected.customs[0].summary[lang]}</p>
            <div className="mt-4">
              <Button
                variant="secondary"
                icon={ScrollText}
                href={`/explore/${selected.id}`}
              >
                {tExplore(lang, "explore.card.seeAll")}
              </Button>
            </div>
          </Card>

          <div className="mt-6 pb-10">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              {tExplore(lang, "explore.sites.label")}
            </p>
            <ul className="mt-2 divide-y divide-border rounded-lg border border-border bg-surface shadow-sm">
              {SITES.map((site) => (
                <li key={site.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedSiteId(site.id)}
                    aria-pressed={site.id === selected.id}
                    className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-surface-sunken"
                  >
                    <MapPin size={20} strokeWidth={1.75} aria-hidden className="shrink-0 text-primary" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-medium text-text">{site.name}</span>
                      <span className="block truncate text-sm text-text-secondary">
                        {site.areaLabel[lang]}
                      </span>
                    </span>
                    {site.id === selected.id && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return null;
}