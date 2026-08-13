"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Bell, ScrollText, Compass, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";
import type { LatLng } from "@/lib/geo";
import { isInsideZone, hasExitedZone, nearestSite } from "@/lib/geo";
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

  const viewRef = useRef<View>("asking");
  const announced = useRef<Set<string>>(new Set());
  const approachSiteRef = useRef<Site | null>(null);
  const watchId = useRef<number | null>(null);

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

  if (view === "explore") {
    return (
      <div className="mx-auto w-full max-w-tool flex-1 px-4 py-10 sm:px-6">
        <EmptyState icon={Compass} title={tExplore(lang, "explore.browse.title")}>
          <Button variant="secondary" onClick={() => changeView("asking")}>
            {tExplore(lang, "explore.permission.cta")}
          </Button>
        </EmptyState>
      </div>
    );
  }

  return null;
}