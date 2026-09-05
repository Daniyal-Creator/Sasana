"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  MapPinOff,
  SearchX,
  Bell,
  ScrollText,
  Compass,
  ShieldCheck,
  Navigation,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { BaseMap } from "@/components/explore/BaseMap";
import { MapLayers } from "@/components/explore/MapLayers";
import {
  MapSheet,
  PEEK_HEIGHT_PX,
  SHEET_FULL_FRAC,
  useIsDesktop,
  type SheetStage,
} from "@/components/explore/MapSheet";
import { SiteBrief } from "@/components/explore/SiteBrief";
import { PanelBack } from "@/components/explore/PanelBack";
import { SiteSearch, matchesQuery } from "@/components/explore/SiteSearch";
import { SiteThumb } from "@/components/explore/SiteThumb";
import { Guide } from "@/components/explore/Guide";
import { ApproachCard } from "@/components/explore/ApproachCard";
import { ApproachSheet, APPROACH_SHEET_PEEK_FRAC } from "@/components/explore/ApproachSheet";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";
import { siteContextFrom, writeActiveSite } from "@/lib/site-context";
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
import {
  DUMMY_THRESHOLD_M,
  NEAREST_DUMMY_ID,
  buildDummySites,
  isDummySite,
} from "@/data/dummy-sites";
import type { DummySite } from "@/data/dummy-sites";

/**
 * "checking" is the frame before anything is known: the permission state comes
 * back from a promise, and until it does, rendering the Guide is a guess. It
 * was the wrong guess for every visitor who had already granted location, who
 * got the Guide flashed at them and then taken away again.
 */
type View = "checking" | "asking" | "outside" | "inside" | "explore";

// A fix this vague cannot decide whether the visitor is inside an Approach, so
// the notice waits. The grace period exists so a reading that is briefly poor
// does not flicker a status message onto the screen.
const LOW_ACCURACY_M = 200;
const LOW_ACCURACY_GRACE_MS = 20_000;

/**
 * How long the Dummy Sites wait for a fix worth anchoring on before settling
 * for the best one seen so far.
 *
 * A phone outdoors clears 200 m in seconds. A laptop never does: wifi and IP
 * geolocation routinely report a kilometre or more, so the old rule of "anchor
 * only on a fix under 200 m" meant the dummies silently never appeared on the
 * machine most of this gets demonstrated from, with nothing on screen to say
 * why.
 *
 * Settling for a vague fix costs less than it looks. The five are placed
 * relative to the visitor and the visitor's own position carries the same
 * error, so the distances between them stay right and the map still shows five
 * temples around you. What a vague fix does prevent is the Approach ever
 * firing, and that is already true of real Sites and already explained by the
 * signal notice.
 */
const DUMMY_ANCHOR_WAIT_MS = 3_000;

/**
 * How long the Approach card stays before it withdraws.
 *
 * It may withdraw at all only because the panel it announces has already
 * opened. Long enough to read a name and a count without hurrying, short
 * enough that it is not still sitting on the map a minute later.
 */
const APPROACH_CARD_MS = 6_000;

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

// Where the map opens before there is a position to open it on, and how close
// it comes once there is one.
const BALI_CENTER: LatLng = { lat: -8.45, lng: 115.1 };
const ISLAND_ZOOM = 9;
const WALKING_ZOOM = 14;

// Choosing a Site from the list moves the map to it. Without this the browse
// screen sits at island zoom, where a 400 m Zone is a couple of pixels wide and
// there is no way to reach it: the map is true to scale now, and true to scale
// means small until you go closer.
const SITE_ZOOM = 14;

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

/**
 * The Site list, in both the nearby panel and the browse panel.
 *
 * A row used to be a link to /explore/<id>, which threw away the map. It now
 * moves the camera and turns the panel over to that Site, which is what the
 * marker on the map does. Two doors, one room.
 */
function SiteList({
  rows,
  selectedSiteId,
  onSelect,
}: {
  rows: { site: Site; distanceM: number | null }[];
  selectedSiteId: string | null;
  onSelect: (siteId: string) => void;
}) {
  const { lang } = useLang();
  return (
    <ul className="mt-2 divide-y divide-border rounded-lg border border-border bg-surface">
      {rows.map(({ site, distanceM }) => {
        const selected = site.id === selectedSiteId;
        return (
          <li key={site.id}>
            <button
              type="button"
              onClick={() => onSelect(site.id)}
              aria-pressed={selected}
              className={[
                "flex w-full items-center gap-3 px-3 py-3 text-left transition-colors duration-150",
                selected ? "bg-primary-tint" : "hover:bg-surface-sunken",
              ].join(" ")}
            >
              <SiteThumb size={48} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-medium text-text">{site.name}</span>
                <span className="block truncate text-sm text-text-secondary">
                  {site.areaLabel[lang]}
                </span>
              </span>
              {/* The chevron that used to close the row is gone. Every row is
                  a button and reads as one, and the twenty pixels it held were
                  being taken out of the area label, which truncated at every
                  width. Tabular figures keep the distances in a column. */}
              {distanceM !== null && (
                <span className="shrink-0 pr-1 text-sm tabular-nums text-text-secondary">
                  {formatDistance(distanceM, lang)}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Lays the Dummy Sites out again around wherever the visitor is now.
 *
 * They are frozen on purpose: a dummy recomputed on every fix would keep pace
 * with the visitor and never be reached. The cost of freezing is that walking
 * a few streets, or opening the page at home and then arriving somewhere else,
 * leaves five examples behind at the old address. This is the way back.
 */
function ReplaceDummies({ onClick }: { onClick: () => void }) {
  const { lang } = useLang();
  return (
    <div className="mt-4 flex justify-center">
      <Button variant="secondary" size="sm" icon={Compass} onClick={onClick}>
        {tExplore(lang, "explore.dummy.replace")}
      </Button>
    </div>
  );
}

/**
 * What the list becomes when the search matches nothing.
 *
 * It names the way out rather than reporting the absence, because the visitor
 * is one keystroke from the whole list and the screen should say so.
 */
function NoMatches() {
  const { lang } = useLang();
  return (
    <div className="mt-2 rounded-lg border border-border bg-surface px-6 py-10 text-center">
      <SearchX size={28} strokeWidth={1.75} aria-hidden className="mx-auto text-text-muted" />
      <p className="mt-3 font-medium text-text">{tExplore(lang, "explore.search.none.title")}</p>
      <p className="mx-auto mt-1 max-w-prose text-sm text-text-secondary">
        {tExplore(lang, "explore.search.none.body")}
      </p>
    </div>
  );
}

/** Carries an icon and a text label, never colour alone (Guardrails C6). */
function SignalNotice() {
  const { lang } = useLang();
  return (
    <Card padding="md" className="mt-4">
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

/**
 * What the map area becomes when the tiles never arrive. The point of the
 * screen survives without them: the sheet is raised to full by the caller, so
 * every Site, distance, and Custom is still on screen as text.
 */
function OfflineSurface() {
  const { lang } = useLang();
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-surface-sunken px-8 text-center">
      <WifiOff size={32} strokeWidth={1.75} aria-hidden className="text-text-muted" />
      <p className="mt-3 font-medium text-text">{tExplore(lang, "explore.map.offline.title")}</p>
      <p className="mt-1 max-w-prose text-sm text-text-secondary">
        {tExplore(lang, "explore.map.offline.body")}
      </p>
    </div>
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
  /**
   * A real Site can be simulated the moment the page loads: its coordinates
   * ship in the bundle. A Dummy Site cannot, because it does not exist until a
   * real fix has said where the visitor is. So the two take different routes in:
   * simulating a real Site skips the location request entirely, while
   * simulating a dummy waits for the anchor and only then starts walking.
   */
  const simulatingRealSite = Boolean(simulateId && SITES.some((s) => s.id === simulateId));

  const [view, setView] = useState<View>("checking");
  const [position, setPosition] = useState<LatLng | null>(null);
  const [accuracyM, setAccuracyM] = useState<number | null>(null);
  const [approachSite, setApproachSite] = useState<Site | null>(null);
  const [simulated] = useState(Boolean(simulateId));
  const [selectedSiteId, setSelectedSiteId] = useState<string>(SITES[0].id);
  const [signalUnsure, setSignalUnsure] = useState(false);
  const [query, setQuery] = useState("");

  // Where the Dummy Sites were laid out. Set once, from the first fix good
  // enough to trust, and only when no real Site is anywhere near. null means
  // there are none, which is the case for everybody standing in Bali.
  const [dummyAnchor, setDummyAnchor] = useState<LatLng | null>(null);

  /**
   * Which step of the simulated walk the visitor is standing on, and which
   * walk it belongs to.
   *
   * The Site is part of it because the walk can now be started from inside the
   * panel, over and over, on a different Site each time. A bare leg counter
   * would still be sitting at the end of the last walk and the next one would
   * never take a step.
   */
  const [simulateStep, setSimulateStep] = useState<{ id: string; leg: number } | null>(null);

  // Map state. `follow` is the camera; the visitor takes it back by dragging.
  const [follow, setFollow] = useState(true);
  const [tilesFailed, setTilesFailed] = useState(false);
  const [sheetStage, setSheetStage] = useState<SheetStage>("peek");
  const [bannerSite, setBannerSite] = useState<Site | null>(null);
  const [focus, setFocus] = useState<{ center: LatLng; zoom: number } | null>(null);

  // The panel has two states: the list it opened with, and one Site. null is
  // the list. It replaces its own contents rather than navigating, so the map
  // underneath keeps its camera and the visitor never loses their place.
  const [panelSiteId, setPanelSiteId] = useState<string | null>(null);

  // ApproachSheet sizes itself as a fraction of the viewport, and the desktop
  // panel as a fraction of the width, so how much of the map either one hides
  // is only knowable at runtime.
  const isDesktop = useIsDesktop();
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const measure = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Mirrors MapSheet's desktop width, w-[min(380px,38vw)] inset by left-4.
  const panelInset = Math.min(380, viewport.w * 0.38) + 32;

  // How much map the sheet is covering *right now*. Centring against the peek
  // height while the sheet is open puts the Site the sheet is describing behind
  // the sheet, which is the one place it must not be.
  const sheetInsetNow =
    sheetStage === "full" ? Math.round(viewport.h * SHEET_FULL_FRAC) : PEEK_HEIGHT_PX;

  const viewRef = useRef<View>("checking");
  /**
   * The last thing the panel was showing that was not an Approach.
   *
   * Recorded on every render rather than captured at the moment of crossing,
   * because the crossing happens inside a callback that geolocation froze long
   * ago and cannot read current state. Whatever this holds is what Back
   * returns to.
   */
  const panelBefore = useRef<{ view: View; panelSiteId: string | null; query: string }>({
    view: "outside",
    panelSiteId: null,
    query: "",
  });
  /**
   * Which Sites have already raised their notice on this visit.
   *
   * One set, where there used to be two. They were separate because the notice
   * had two forms: a sheet that took the screen in Live Mode, and a banner in
   * Explore Mode, and one memory serving both would have made dismissing the
   * banner suppress the sheet. There is only the card now, so the reason is
   * gone and a second set would only be something to keep in step.
   *
   * Cleared when the visitor genuinely leaves that Approach, so a Site can
   * speak again on a later return.
   */
  const announced = useRef<Set<string>>(new Set());
  const bannerSiteRef = useRef<Site | null>(null);
  const approachSiteRef = useRef<Site | null>(null);
  const watchId = useRef<number | null>(null);
  const lowAccuracyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // `handlePosition` is captured by watchPosition when the watch starts and is
  // never re-subscribed, so anything it reads that can change afterwards has to
  // come through a ref. Reading `dummySites` from the closure instead would
  // freeze it at the empty array it held before the anchor was set, and no
  // dummy would ever raise the notice.
  const dummySitesRef = useRef<DummySite[]>([]);
  const dummyDecided = useRef(false);
  /** The sharpest fix seen so far, in case no sharp one ever arrives. */
  const bestFix = useRef<{ p: LatLng; accuracy: number } | null>(null);
  const dummyAnchorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Whether the visitor has pointed at a Site themselves. Once they have, the
  // selection is theirs and nothing moves it for them.
  const siteChosenByHand = useRef(false);

  // Rebuilt when the language changes, because a dummy's `source` is its
  // marking rather than a citation and has to be readable. The coordinates do
  // not move with it: they are a function of the anchor alone.
  const dummySites = useMemo(
    () => (dummyAnchor ? buildDummySites(dummyAnchor, lang) : []),
    [dummyAnchor, lang],
  );

  // The one place the real list and the invented one meet. Everywhere else in
  // the app still imports SITES and still gets six real places.
  const allSites = useMemo(() => [...SITES, ...dummySites], [dummySites]);

  // Hands the Site to the Situation Check and the Assistant, so a photo taken
  // here is judged against this Site's own Customs rather than against temple
  // etiquette in general.
  //
  // Read from the Approach the visitor has actually crossed into, and failing
  // that from the Site whose panel they opened by hand. Deliberately NOT from
  // `selectedSiteId`: that starts at SITES[0] as the map's opening camera, so
  // using it would tell a visitor who has only glanced at Explore that they are
  // standing at Tanah Lot - a confident wrong place, which is the failure this
  // product exists to prevent. No Approach and no open panel means no claim.
  //
  // `siteContextFrom` returns null for a Dummy Site, whose name is invented;
  // ADR-0012 forbids a fictional place reaching the backend. That clears the
  // Site and restores the generic check, exactly how both pages behaved before.
  useEffect(() => {
    const here = approachSite ?? allSites.find((s) => s.id === panelSiteId) ?? null;
    writeActiveSite(here ? siteContextFrom(here) : null);
  }, [allSites, approachSite, panelSiteId]);

  useEffect(() => {
    dummySitesRef.current = dummySites;
  }, [dummySites]);

  const searching = query.trim().length > 0;

  /**
   * Search runs over every Site, not over whatever the panel happens to be
   * showing. Screen B lists the three closest; a visitor who types "Besakih"
   * there means the temple, not "the temple if it is already on screen".
   */
  const searchRows = useMemo(() => {
    if (!searching) return [];
    return allSites
      .filter((site) => matchesQuery(site, query, lang))
      .map((site) => ({ site, distanceM: position ? haversineMeters(position, site) : null }))
      .sort((a, b) => (a.distanceM ?? Infinity) - (b.distanceM ?? Infinity));
  }, [allSites, query, lang, position, searching]);

  useEffect(() => {
    if (view === "inside" || view === "checking" || view === "asking") return;
    panelBefore.current = { view, panelSiteId, query };
  }, [view, panelSiteId, query]);

  /** Puts the panel back the way the Approach found it. */
  const restorePanel = useCallback(() => {
    const before = panelBefore.current;
    approachSiteRef.current = null;
    setApproachSite(null);
    viewRef.current = before.view;
    setView(before.view);
    setPanelSiteId(before.panelSiteId);
    setQuery(before.query);
    setSheetStage("peek");
  }, []);

  const closest = useMemo(() => {
    if (!position) return [];
    return [...allSites]
      .map((site) => ({ site, distanceM: haversineMeters(position, site) }))
      .sort((a, b) => a.distanceM - b.distanceM)
      .slice(0, 3);
  }, [position, allSites]);

  const changeView = useCallback((next: View) => {
    viewRef.current = next;
    setView(next);
    setSheetStage("peek");
    setPanelSiteId(null);
    // A filter carried into another view is a list that looks broken for a
    // reason the visitor left behind on the last screen.
    setQuery("");
    // Explore Mode is manual browsing and the visitor may be nowhere near any
    // Site, so the camera should not drag them back to themselves.
    setFollow(next !== "explore");
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

  /**
   * Where the five Dummy Sites are laid out, decided once.
   *
   * Separate from `handlePosition` because two callers reach it: a fix sharp
   * enough to trust, and the timer that gives up waiting for one.
   */
  const anchorDummies = useCallback((p: LatLng) => {
    dummyDecided.current = true;
    if (dummyAnchorTimer.current !== null) {
      clearTimeout(dummyAnchorTimer.current);
      dummyAnchorTimer.current = null;
    }
    if (nearestSite(p, SITES).distanceM <= DUMMY_THRESHOLD_M) return;
    setDummyAnchor(p);
    // The browse camera follows the selected Site, and the selection starts on
    // the first real one. Left alone, tapping Browse from outside Bali flies
    // the map a thousand kilometres to Tanah Lot while the list under it is
    // headed by a dummy 900 m away.
    if (!siteChosenByHand.current) setSelectedSiteId(NEAREST_DUMMY_ID);
  }, []);

  const handlePosition = useCallback(
    /** `fromSimulation` marks a position the app invented rather than measured. */
    (p: LatLng, accuracy: number, fromSimulation = false) => {
      setPosition(p);
      setAccuracyM(accuracy);
      if (accuracy > LOW_ACCURACY_M) noteUncertainFix();
      else noteConfidentFix();

      // Decided once and never revisited: re-testing the 50 km line on every
      // update would let a reading that wanders across it add and remove five
      // temples over and over. Simulated positions never anchor, because the
      // anchor has to be a real answer to "where is the visitor".
      if (!dummyDecided.current && !fromSimulation) {
        const best = bestFix.current;
        if (!best || accuracy < best.accuracy) bestFix.current = { p, accuracy };

        if (accuracy <= LOW_ACCURACY_M) {
          anchorDummies(p);
        } else if (dummyAnchorTimer.current === null) {
          // No fix worth trusting yet. Give it a few seconds, then place them
          // on the best reading there was rather than leaving the map empty
          // with nothing to explain the emptiness.
          dummyAnchorTimer.current = setTimeout(() => {
            dummyAnchorTimer.current = null;
            const settled = bestFix.current;
            if (!dummyDecided.current && settled) anchorDummies(settled.p);
          }, DUMMY_ANCHOR_WAIT_MS);
        }
      }

      const { site } = nearestSite(p, [...SITES, ...dummySitesRef.current]);

      if (hasEnteredApproach(p, accuracy, site)) {
        // Crossing the Approach turns the panel over to the Site and raises
        // the card that says so. Reaching the Zone afterwards raises nothing:
        // they have been told, and a second interruption would land on someone
        // who is finally looking at the place rather than the phone.
        if (!announced.current.has(site.id)) {
          announced.current.add(site.id);
          bannerSiteRef.current = site;
          setBannerSite(site);
          approachSiteRef.current = site;
          setApproachSite(site);
          changeView("inside");
          setSheetStage("full");
        }
        return;
      }

      const left = approachSiteRef.current;
      if (left && hasExitedApproach(p, accuracy, left)) {
        announced.current.delete(left.id);
        approachSiteRef.current = null;
        // Walking out returns the panel to whatever the Approach interrupted,
        // not to a fixed screen: the visitor may have been browsing.
        if (viewRef.current === "inside") restorePanel();
      }

      // A card clears once its Site's Approach is genuinely behind us.
      const banner = bannerSiteRef.current;
      if (banner && hasExitedApproach(p, accuracy, banner)) {
        bannerSiteRef.current = null;
        setBannerSite(null);
      }

      // Forgetting is checked against the Site list rather than against the
      // card that is currently up. Answering the card clears `bannerSiteRef`,
      // so keying this off that ref would mean a Site that was waved away
      // never speaks again for the rest of the session.
      for (const id of announced.current) {
        const site = [...SITES, ...dummySitesRef.current].find((s) => s.id === id);
        if (site && hasExitedApproach(p, accuracy, site)) announced.current.delete(id);
      }

      if (viewRef.current === "asking" || viewRef.current === "checking") {
        changeView("outside");
      }
    },
    [anchorDummies, changeView, noteConfidentFix, noteUncertainFix, restorePanel],
  );

  const stopWatching = useCallback(() => {
    if (watchId.current === null) return;
    navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
  }, []);

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
    if (simulatingRealSite) return;
    let cancelled = false;
    (async () => {
      let next: View = "asking";
      try {
        const status = await navigator.permissions?.query({ name: "geolocation" });
        if (status?.state === "granted") next = "outside";
        else if (status?.state === "denied") next = "explore";
      } catch {
        // The Permissions API is missing or refused the query. The Guide is the
        // correct fallback: it is the only screen that works without knowing.
      }
      if (cancelled) return;
      // Granted means the visitor has already answered this question once.
      // Asking again, even as a screen they have to dismiss, is the app
      // forgetting a conversation it already had. Straight to the map, with the
      // signal notice carrying the wait for the first fix.
      changeView(next);
      if (next === "outside") startWatching();
    })();
    return () => {
      cancelled = true;
    };
  }, [simulatingRealSite, startWatching, changeView]);

  /**
   * The simulated walk: outside the Approach, then across it.
   *
   * One leg per render, not one interval for the whole road. The walk used to
   * be a `setInterval` kept in a ref, guarded by a second ref that stopped it
   * ever starting twice, and cleared from a different effect. Every one of
   * those parts was a way to strand it: any stray cleanup, in dev under
   * StrictMode or on a re-run, killed the timer while the guard made sure it
   * could never be rebuilt. The visitor landed on the first leg and stayed
   * there for good.
   *
   * Driving it from state removes the failure rather than defending against
   * it. Re-running this effect re-applies the leg the visitor is already on
   * and re-arms one timeout, so it is idempotent: it can be interrupted any
   * number of times and simply carries on.
   *
   * Looked up against `allSites` rather than `SITES`, which is what lets a
   * Dummy Site be simulated too. A dummy is absent from that list until the
   * anchor lands, so the first passes find nothing and the walk begins the
   * moment the five exist.
   */
  useEffect(() => {
    if (!simulateId) return;
    const target = allSites.find((site) => site.id === simulateId);
    if (!target) return;

    const approach = approachRadiusM(target);
    const legs = [approach + 200, approach + 60, approach - 60, target.radiusM - 50];
    // A different Site than the one the last walk was for starts from the top.
    const leg = simulateStep?.id === simulateId ? simulateStep.leg : 0;
    if (leg >= legs.length) return;

    // This Site may already have spoken on this visit, which would keep the
    // card from arriving at the end of a walk the visitor just asked for.
    if (leg === 0) announced.current.delete(simulateId);

    // Real fixes would otherwise keep arriving underneath the simulation and
    // argue with it about where the visitor is. Idempotent, so calling it once
    // per leg costs nothing.
    stopWatching();
    handlePosition(metresNorthOf(target, legs[leg]), SIMULATED_ACCURACY_M, true);

    const id = setTimeout(
      () => setSimulateStep({ id: simulateId, leg: leg + 1 }),
      SIMULATED_STEP_MS,
    );
    return () => clearTimeout(id);
  }, [simulateId, allSites, simulateStep, handlePosition, stopWatching]);

  // Entering Explore Mode turns the camera loose, which leaves it wherever the
  // visitor happened to be standing. That can be open sea, while the sheet
  // underneath describes a temple. Point the map at whatever the sheet is
  // talking about instead. Selecting a different Site is handled by
  // `selectSite`, so this deliberately does not depend on the selection.
  useEffect(() => {
    if (view !== "explore") return;
    const site = allSites.find((s) => s.id === selectedSiteId);
    if (site) setFocus({ center: { lat: site.lat, lng: site.lng }, zoom: SITE_ZOOM });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // Tiles failing is not the visitor's problem to solve, but it does mean the
  // text is now the only thing carrying the screen, so it comes up in full.
  useEffect(() => {
    if (tilesFailed) setSheetStage("full");
  }, [tilesFailed]);

  /**
   * The map views are full-screen surfaces: the map fills the viewport and the
   * panel scrolls inside itself, so the document must never scroll. It
   * otherwise does, briefly. The shared route entrance in app/template.tsx
   * lifts the whole page 8px, and for those 200ms the document is 8px too
   * tall, which on Windows throws a 15px scrollbar with stepper arrows down
   * the side of the map on every arrival. Locking it here says what those
   * screens are, rather than reaching into a file this area does not own.
   *
   * The Guide is excluded, and the exclusion is the point: it is a long page
   * of panels that has to scroll like any other. Locking the document for the
   * whole route once left it unreadable below the fold.
   */
  useEffect(() => {
    if (view === "asking" || view === "checking") return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [view]);

  useEffect(() => {
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      if (lowAccuracyTimer.current !== null) clearTimeout(lowAccuracyTimer.current);
      if (dummyAnchorTimer.current !== null) clearTimeout(dummyAnchorTimer.current);
    };
  }, []);

  /**
   * The card withdraws by itself. Nothing is lost with it: the panel it
   * announced is open on the left and stays open, and `announced` keeps the
   * card from returning while the visitor is still inside the same Approach.
   */
  useEffect(() => {
    if (!bannerSite) return;
    const id = setTimeout(() => {
      bannerSiteRef.current = null;
      setBannerSite(null);
    }, APPROACH_CARD_MS);
    return () => clearTimeout(id);
  }, [bannerSite]);

  /**
   * One Site, chosen. The marker on the map and the row in the list are two
   * doors into the same thing, so they do the same thing: the camera goes
   * there and the panel starts describing it.
   */
  const selectSite = useCallback((siteId: string) => {
    siteChosenByHand.current = true;
    setSelectedSiteId(siteId);
    setPanelSiteId(siteId);
    // Choosing a Site by hand is the visitor pointing at somewhere other than
    // themselves, so the camera stops chasing them and goes where they pointed.
    setFollow(false);
    const site = allSites.find((s) => s.id === siteId);
    if (site) setFocus({ center: { lat: site.lat, lng: site.lng }, zoom: SITE_ZOOM });
    setSheetStage("full");
  }, [allSites]);

  const closePanelSite = useCallback(() => setPanelSiteId(null), []);

  /**
   * Re-anchoring reuses the same five ids at new coordinates, so the memory of
   * which of them have already spoken has to be cleared with them. Without
   * that, a dummy the visitor met at the old anchor would sit silent at the
   * new one, which looks exactly like the feature being broken.
   */
  const replaceDummies = useCallback(() => {
    if (!position) return;
    for (const site of dummySitesRef.current) {
      announced.current.delete(site.id);
    }
    if (approachSiteRef.current && isDummySite(approachSiteRef.current)) {
      approachSiteRef.current = null;
      setApproachSite(null);
    }
    if (bannerSiteRef.current && isDummySite(bannerSiteRef.current)) {
      bannerSiteRef.current = null;
      setBannerSite(null);
    }
    setDummyAnchor(position);
    setFollow(true);
  }, [position]);

  const panelSite = panelSiteId ? allSites.find((s) => s.id === panelSiteId) : undefined;

  /**
   * The Site being announced, looked up fresh rather than rendered from the
   * object that was captured when its Approach was crossed.
   *
   * A dummy's `source` is written in the language that was active when it was
   * built, so the stored object goes stale the moment the visitor switches
   * language: every other line of the sheet turned Indonesian while that one
   * stayed English. Everything else on screen already derives its Site from
   * `allSites` on each render, which is why nothing else drifted.
   */
  const approachSiteLive = approachSite
    ? (allSites.find((s) => s.id === approachSite.id) ?? approachSite)
    : null;

  // The two are mutually exclusive by construction: a simulated walk never
  // anchors dummies. Written as a chain anyway, so that the day one of them
  // moves, the sheet still shows one line rather than two contradictory ones.
  const sheetNotice = approachSiteLive && isDummySite(approachSiteLive)
    ? tExplore(lang, "explore.dummy.sheetNotice")
    : simulated
      ? tExplore(lang, "explore.sheet.simulated")
      : null;

  /** The map, or the surface that stands in for it when the tiles never come. */
  const mapSurface = (selected: string | null, sheetInset: number) =>
    tilesFailed ? (
      <OfflineSurface />
    ) : (
      <BaseMap
        label={
          // Six real Sites are in Bali; the dummies are wherever the visitor
          // is. One label claiming all of them are in Bali is simply false,
          // and it is the only description a screen reader gets.
          dummySites.length > 0
            ? tExplore(lang, "explore.map.aria.dummy", {
                count: String(allSites.length),
                dummies: String(dummySites.length),
              })
            : tExplore(lang, "explore.map.aria", { count: String(allSites.length) })
        }
        center={position ?? BALI_CENTER}
        zoom={position ? WALKING_ZOOM : ISLAND_ZOOM}
        follow={follow}
        position={position}
        bottomInset={isDesktop ? 0 : sheetInset}
        leftInset={isDesktop ? panelInset : 0}
        focus={focus}
        onUserPan={() => setFollow(false)}
        onRecenter={() => setFollow(true)}
        onTileError={() => setTilesFailed(true)}
      >
        <MapLayers
          sites={allSites}
          position={position}
          accuracyM={accuracyM}
          selectedSiteId={selected}
          onSelectSite={selectSite}
        />
      </BaseMap>
    );

  // Pressing Start does two things at once: it asks the browser for location and
  // it shows the map. Nothing waits on the permission dialog, so a visitor who
  // dismisses it rather than answering still ends up somewhere. If they allow
  // it, Live Mode arrives on the next fix; if they refuse, the watch reports
  // PERMISSION_DENIED and the screen settles into Explore Mode.
  const start = useCallback(() => {
    changeView("outside");
    startWatching();
  }, [changeView, startWatching]);

  if (view === "checking") {
    return <div className="flex-1" />;
  }

  if (view === "asking") {
    return <Guide onStart={start} />;
  }

  if (view === "outside") {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {mapSurface(panelSiteId, sheetInsetNow)}

        {bannerSite && (
          <ApproachCard site={bannerSite} />
        )}

        <MapSheet stage={sheetStage} onStageChange={setSheetStage}>
          {panelSite ? (
            <SiteBrief
              site={panelSite}
              distanceM={position ? haversineMeters(position, panelSite) : null}
              onBack={closePanelSite}
            />
          ) : (
            <>
              <h1 className="font-display text-h3 font-semibold text-text">
                {tExplore(lang, "explore.nearby.title")}
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                {tExplore(lang, "explore.nearby.subtitle")}
              </p>

              {(signalUnsure || !position) && <SignalNotice />}

              {/* With dummies on screen the old headline stands directly above
                  a row reading "Pura Dummy 1, 900 m", and the screen argues
                  with itself. The first sentence stays true either way; what
                  changes is whether anything explains why the list below is
                  not empty. */}
              {/* The "nothing near you" panel answers a question about where
                  the visitor is standing. While a search is open the question
                  on screen is a different one, so it steps aside. */}
              {!searching && position && (
                <EmptyState
                  icon={MapPinOff}
                  title={tExplore(
                    lang,
                    dummySites.length > 0 ? "explore.dummy.none.title" : "explore.none.title",
                  )}
                  description={
                    dummySites.length > 0
                      ? tExplore(lang, "explore.dummy.none.description")
                      : tExplore(
                          lang,
                          "explore.none.description",
                          closest[0]
                            ? { distance: formatDistance(closest[0].distanceM, lang) }
                            : undefined,
                        )
                  }
                >
                  <Button variant="secondary" onClick={() => changeView("explore")}>
                    {tExplore(lang, "explore.browse.title")}
                  </Button>
                </EmptyState>
              )}

              <div className="mt-6">
                <SiteSearch value={query} onChange={setQuery} />
              </div>

              {/* Without a fix there is no "closest", so the list becomes every
                  Site. The screen stays useful while the first reading arrives
                  rather than showing an empty frame around a spinner. */}
              <p className="mt-5 text-xs font-medium uppercase tracking-wide text-text-muted">
                {tExplore(
                  lang,
                  searching
                    ? "explore.search.label"
                    : position
                      ? "explore.closest.label"
                      : "explore.sites.label",
                )}
              </p>
              {searching && searchRows.length === 0 ? (
                <NoMatches />
              ) : (
                <SiteList
                  rows={
                    searching
                      ? searchRows
                      : position
                        ? closest
                        : allSites.map((site) => ({ site, distanceM: null as number | null }))
                  }
                  selectedSiteId={selectedSiteId}
                  onSelect={selectSite}
                />
              )}

              {!searching && dummySites.length > 0 && (
                <ReplaceDummies onClick={replaceDummies} />
              )}

              <p className="mt-6 flex items-center justify-center gap-2 text-xs text-text-muted">
                <ShieldCheck size={16} strokeWidth={1.75} aria-hidden />
                {tExplore(lang, "explore.checked")}
              </p>
            </>
          )}
        </MapSheet>
      </div>
    );
  }

  if (view === "inside" && approachSiteLive) {
    // ApproachSheet is already a two-stage sheet of its own, so it stands in
    // for MapSheet here rather than being nested inside it.
    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {mapSurface(approachSiteLive.id, Math.round(viewport.h * APPROACH_SHEET_PEEK_FRAC))}

        {/* The card belongs here too, and only here in practice: the crossing
            that raises it is the same crossing that switches to this view, so
            leaving it out of this branch meant it was set and never rendered. */}
        {bannerSite && <ApproachCard site={bannerSite} />}

        <ApproachSheet site={approachSiteLive} notice={sheetNotice} onBack={restorePanel} />
      </div>
    );
  }

  if (view === "explore") {
    const selected = allSites.find((site) => site.id === selectedSiteId) ?? allSites[0];
    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <h1 className="sr-only">{tExplore(lang, "explore.browse.title")}</h1>

        {mapSurface(selected.id, sheetInsetNow)}

        {bannerSite && (
          <ApproachCard site={bannerSite} />
        )}

        <MapSheet stage={sheetStage} onStageChange={setSheetStage}>
          {panelSite ? (
            <SiteBrief
              site={panelSite}
              distanceM={position ? haversineMeters(position, panelSite) : null}
              onBack={closePanelSite}
            />
          ) : (
            <>
              {/* Only with a fix. Without one there is no "nearby" to go back
                  to: a visitor who refused location is not in Browse by
                  choice, and a door onto an empty room is worse than none. */}
              {position && (
                <PanelBack
                  label={tExplore(lang, "explore.panel.backToNearby")}
                  onClick={() => changeView("outside")}
                />
              )}

              <SiteSearch value={query} onChange={setQuery} />

              <p className="mt-5 text-xs font-medium uppercase tracking-wide text-text-muted">
                {tExplore(lang, searching ? "explore.search.label" : "explore.sites.label")}
              </p>
              {searching && searchRows.length === 0 ? (
                <NoMatches />
              ) : (
                <SiteList
                  rows={
                    searching
                      ? searchRows
                      : allSites.map((site) => ({
                          site,
                          distanceM: position ? haversineMeters(position, site) : null,
                        }))
                  }
                  selectedSiteId={selectedSiteId}
                  onSelect={selectSite}
                />
              )}

              {!searching && dummySites.length > 0 && (
                <ReplaceDummies onClick={replaceDummies} />
              )}
            </>
          )}
        </MapSheet>
      </div>
    );
  }

  return null;
}
