"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MapPin,
  MapPinOff,
  Bell,
  ScrollText,
  Compass,
  ShieldCheck,
  ChevronRight,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ZoneMap } from "@/components/explore/ZoneMap";
import { ApproachSheet } from "@/components/explore/ApproachSheet";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";
import type { LatLng } from "@/lib/geo";
import {
  haversineMeters,
  formatDistance,
  hasEnteredApproach,
  hasExitedApproach,
  approachRadiusM,
  nearestSite,
} from "@/lib/geo";
import { SITES } from "@/data/sites";
import type { Site } from "@/data/sites";

type View = "asking" | "outside" | "inside" | "explore";

// A fix this vague cannot decide whether the visitor is inside an Approach, so
// the notice waits (ADR-0005). The grace period exists so a reading that is
// briefly poor does not flicker a status message onto the screen.
const LOW_ACCURACY_M = 200;
const LOW_ACCURACY_GRACE_MS = 20_000;

// timeout: without one the browser may never call back at all, and the page
// would sit silent forever. maximumAge lets a fix from the last ten seconds be
// reused, which matters for a visitor walking with the screen on.
const WATCH_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15_000,
  maximumAge: 10_000,
};

// The simulated walk starts outside the Approach and steps inward, so what is
// demonstrated is the crossing itself rather than the destination.
const SIMULATED_STEP_MS = 900;
const SIMULATED_ACCURACY_M = 15;
const EARTH_RADIUS_M = 6_371_000;

function metresNorthOf(site: Site, metres: number): LatLng {
  return {
    lat: site.lat + (metres / EARTH_RADIUS_M) * (180 / Math.PI),
    lng: site.lng,
  };
}

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

/** Carries an icon and a text label, never colour alone (Guardrails C9). */
function SignalNotice() {
  const { lang } = useLang();
  return (
    <Card padding="md" className="mt-6">
      <div className="flex items-start gap-3">
        <Navigation
          size={20}
          strokeWidth={1.75}
          aria-hidden
          className="mt-0.5 shrink-0 text-primary"
        />
        <div>
          <p className="font-medium text-text">{tExplore(lang, "explore.signal.searching.title")}</p>
          <p className="mt-1 text-sm text-text-secondary">
            {tExplore(lang, "explore.signal.searching.body")}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <ExploreInner />
    </Suspense>
  );
}

function ExploreInner() {
  const { lang } = useLang();
  const searchParams = useSearchParams();
  const simulateId = searchParams.get("simulate");
  const simulatedSite = simulateId ? SITES.find((s) => s.id === simulateId) : undefined;

  const [view, setView] = useState<View>("asking");
  const [position, setPosition] = useState<LatLng | null>(null);
  const [approachSite, setApproachSite] = useState<Site | null>(null);
  const [simulated] = useState(Boolean(simulatedSite));
  const [selectedSiteId, setSelectedSiteId] = useState<string>(SITES[0].id);
  const [signalUnsure, setSignalUnsure] = useState(false);

  const viewRef = useRef<View>("asking");
  const announced = useRef<Set<string>>(new Set());
  const approachSiteRef = useRef<Site | null>(null);
  const watchId = useRef<number | null>(null);
  const lowAccuracyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closest = useMemo(() => {
    if (!position) return [];
    return [...SITES]
      .map((site) => ({ site, distanceM: haversineMeters(position, site) }))
      .sort((a, b) => a.distanceM - b.distanceM)
      .slice(0, 3);
  }, [position]);

  const changeView = useCallback((next: View) => {
    viewRef.current = next;
    setView(next);
  }, []);

  /** A vague fix is only worth reporting once it has persisted. */
  const noteUncertainFix = useCallback(() => {
    if (lowAccuracyTimer.current !== null) return;
    lowAccuracyTimer.current = setTimeout(() => setSignalUnsure(true), LOW_ACCURACY_GRACE_MS);
  }, []);

  const noteConfidentFix = useCallback(() => {
    if (lowAccuracyTimer.current !== null) {
      clearTimeout(lowAccuracyTimer.current);
      lowAccuracyTimer.current = null;
    }
    setSignalUnsure(false);
  }, []);

  const handlePosition = useCallback(
    (p: LatLng, accuracyM: number) => {
      setPosition(p);
      if (accuracyM > LOW_ACCURACY_M) noteUncertainFix();
      else noteConfidentFix();

      if (viewRef.current === "explore") return;

      const { site } = nearestSite(p, SITES);

      if (hasEnteredApproach(p, accuracyM, site)) {
        // Crossing the Approach is what raises the notice. Reaching the Zone
        // afterwards raises nothing: the sheet is already open, and a second
        // marker would interrupt a visitor who is finally looking at the place
        // rather than the phone (ADR-0005).
        if (!announced.current.has(site.id)) {
          announced.current.add(site.id);
          approachSiteRef.current = site;
          setApproachSite(site);
          changeView("inside");
        }
        return;
      }

      const left = approachSiteRef.current;
      if (left && hasExitedApproach(p, accuracyM, left)) {
        announced.current.delete(left.id);
        approachSiteRef.current = null;
        if (viewRef.current === "inside") changeView("outside");
        return;
      }

      if (viewRef.current === "asking") changeView("outside");
    },
    [changeView, noteConfidentFix, noteUncertainFix],
  );

  const startWatching = useCallback(() => {
    if (!("geolocation" in navigator)) {
      changeView("explore");
      return;
    }
    if (watchId.current !== null) return;
    watchId.current = navigator.geolocation.watchPosition(
      (pos) =>
        handlePosition(
          { lat: pos.coords.latitude, lng: pos.coords.longitude },
          pos.coords.accuracy,
        ),
      (err) => {
        // Only a refusal is permanent. POSITION_UNAVAILABLE and TIMEOUT are
        // transient and do not cancel the watch, so throwing away Live Mode for
        // them costs the visitor the feature over a passing loss of signal.
        if (err.code === err.PERMISSION_DENIED) {
          if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
          }
          changeView("explore");
          return;
        }
        noteUncertainFix();
      },
      WATCH_OPTIONS,
    );
  }, [changeView, handlePosition, noteUncertainFix]);

  // A visitor who has already granted location should not be asked to grant it
  // again on every visit. Screen A exists to explain the request, not to be a
  // toll gate.
  useEffect(() => {
    if (simulatedSite) return;
    let cancelled = false;
    (async () => {
      try {
        const status = await navigator.permissions?.query({ name: "geolocation" });
        if (!status || cancelled) return;
        if (status.state === "granted") startWatching();
        else if (status.state === "denied") changeView("explore");
      } catch {
        // The Permissions API is missing or refused the query. Screen A is the
        // correct fallback, so there is nothing to do.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [simulatedSite, startWatching, changeView]);

  // The simulated walk: outside the Approach, then across it.
  useEffect(() => {
    if (!simulatedSite) return;
    const approach = approachRadiusM(simulatedSite);
    const legs = [approach + 200, approach + 60, approach - 60, simulatedSite.radiusM - 50];
    let leg = 0;
    handlePosition(metresNorthOf(simulatedSite, legs[leg]), SIMULATED_ACCURACY_M);
    const id = setInterval(() => {
      leg += 1;
      if (leg >= legs.length) {
        clearInterval(id);
        return;
      }
      handlePosition(metresNorthOf(simulatedSite, legs[leg]), SIMULATED_ACCURACY_M);
    }, SIMULATED_STEP_MS);
    return () => clearInterval(id);
  }, [simulatedSite, handlePosition]);

  useEffect(() => {
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      if (lowAccuracyTimer.current !== null) clearTimeout(lowAccuracyTimer.current);
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

        {signalUnsure && <SignalNotice />}

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
        <ApproachSheet site={approachSite} simulated={simulated} />
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
