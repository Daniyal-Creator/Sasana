"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import { LocateFixed } from "lucide-react";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";
import type { LatLng } from "@/lib/geo";
import "leaflet/dist/leaflet.css";

/**
 * CARTO Voyager: OpenStreetMap data, raster tiles, free without an API key and
 * without a billing account. Google Maps Platform requires a card even for its
 * free quota, and the project budget is Rp 0 (tech-spec §5).
 *
 * `{r}` is filled in by Leaflet itself with `@2x` on retina screens.
 */
const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

/**
 * If the Zone circles ever drown in Voyager's road colours, point TILE_URL here
 * instead. Positron is the same service in near-monochrome, so this is a
 * one-string change and not a rewrite.
 */
const TILE_URL_QUIET = "https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png";
void TILE_URL_QUIET;

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors ' +
  '&copy; <a href="https://carto.com/attributions">CARTO</a>';

const MIN_ZOOM = 8;
const MAX_ZOOM = 18;

/** Four failures with no successful tile at all is a network problem. One
 *  failure at the edge of the viewport is not, and must not blank the screen. */
const TILE_ERROR_THRESHOLD = 4;

const MapContext = createContext<LeafletMap | null>(null);

/** The Leaflet instance this map owns. `MapLayers` draws into it rather than
 *  creating a second one. Never null inside `children`, which are not rendered
 *  until the map exists. */
export function useLeafletMap(): LeafletMap | null {
  return useContext(MapContext);
}

interface BaseMapProps {
  /** Announced to a screen reader in place of the map itself. */
  label: string;
  center: LatLng;
  zoom: number;
  follow: boolean;
  position: LatLng | null;
  /**
   * How many pixels at the bottom of the map are covered by the sheet. Three
   * things depend on it and all three are wrong without it: the visitor gets
   * centred behind the sheet, the licence attribution disappears under it, and
   * the locate button goes with them.
   */
  bottomInset: number;
  /**
   * How many pixels down the left edge are covered by the desktop panel. Same
   * job as `bottomInset`, other axis: on a wide screen the panel sits beside
   * the map rather than under it, so centring on the container centre would put
   * the visitor behind it.
   */
  leftInset: number;
  /** Somewhere to look that is not the visitor. Set a new object to move. */
  focus: { center: LatLng; zoom: number } | null;
  /** Off for a map that is being shown rather than used, as on the Guide. */
  interactive?: boolean;
  /** Off when there is no position to centre on and the button would only be a
   *  disabled control taking up map. */
  showLocate?: boolean;
  onUserPan: () => void;
  onRecenter: () => void;
  onTileError: () => void;
  children?: React.ReactNode;
}

/**
 * Owns the Leaflet instance: loading it without breaking SSR, the tile layer,
 * the camera, and the two things the page needs to hear about — the visitor
 * taking the map over, and tiles failing to arrive.
 *
 * It draws nothing of SASANA's own. Zones, the Approach, and the visitor's dot
 * belong to `MapLayers`.
 */
export function BaseMap({
  label,
  center,
  zoom,
  follow,
  position,
  bottomInset,
  leftInset,
  focus,
  interactive = true,
  showLocate = true,
  onUserPan,
  onRecenter,
  onTileError,
  children,
}: BaseMapProps) {
  const { lang } = useLang();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [map, setMap] = useState<LeafletMap | null>(null);

  // `setView` fires the same `zoomstart` a pinch does, so the camera has to say
  // when a move is its own doing. Without this the map turns follow off the
  // instant it starts following.
  const programmatic = useRef(false);

  // Where the camera was last pointed on purpose, and whether the visitor has
  // taken it over since. Together they let the map re-frame when the panel
  // changes size without ever yanking it back from someone who has panned away.
  const framedOn = useRef<{ center: LatLng; zoom: number } | null>(null);
  const userMoved = useRef(false);

  // Read once, at construction. Putting them in the effect's deps would tear
  // the map down and rebuild it every time the visitor moves.
  const initial = useRef({ center, zoom, interactive });
  const handlers = useRef({ onUserPan, onTileError });
  handlers.current = { onUserPan, onTileError };

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    let cancelled = false;

    (async () => {
      // Leaflet touches `window` at import time, and App Router really does
      // render this on the server. Importing it inside the effect keeps the
      // module off the server without a second file and a `dynamic()` wrapper.
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const instance = L.map(containerRef.current, {
        center: [initial.current.center.lat, initial.current.center.lng],
        zoom: initial.current.zoom,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        // Placed by hand instead, so it can be positioned against the sheet.
        zoomControl: false,
        // A map on the Guide is an illustration that happens to be true, not a
        // control. Leaving drag on there would also swallow the page scroll on
        // a phone, which is the one gesture that screen depends on.
        dragging: initial.current.interactive,
        touchZoom: initial.current.interactive,
        scrollWheelZoom: initial.current.interactive,
        doubleClickZoom: initial.current.interactive,
        boxZoom: initial.current.interactive,
        keyboard: initial.current.interactive,
      });

      if (initial.current.interactive) {
        L.control.zoom({ position: "topright" }).addTo(instance);
      }

      const tiles = L.tileLayer(TILE_URL, {
        subdomains: "abcd",
        maxZoom: 20,
        attribution: ATTRIBUTION,
      }).addTo(instance);

      let loadedOnce = false;
      let failures = 0;
      let reported = false;
      tiles.on("load", () => {
        loadedOnce = true;
      });
      tiles.on("tileerror", () => {
        if (loadedOnce || reported) return;
        failures += 1;
        if (failures >= TILE_ERROR_THRESHOLD) {
          reported = true;
          handlers.current.onTileError();
        }
      });

      // `dragstart` only ever comes from the visitor. `zoomstart` does not, so
      // it is gated on the flag the camera sets before it moves itself.
      instance.on("dragstart", () => {
        userMoved.current = true;
        handlers.current.onUserPan();
      });
      instance.on("zoomstart", () => {
        if (programmatic.current) return;
        userMoved.current = true;
        handlers.current.onUserPan();
      });
      instance.on("moveend", () => {
        programmatic.current = false;
      });

      mapRef.current = instance;
      setMap(instance);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      setMap(null);
    };
  }, []);

  // The OpenStreetMap and CARTO credit is a licence condition, so it is lifted
  // clear of the sheet rather than being allowed to sit behind it. Set inline:
  // Leaflet's own stylesheet also targets these controls, and fighting it from
  // globals.css is a cascade argument nobody wins twice.
  useEffect(() => {
    if (!map) return;
    const stack = map
      .getContainer()
      .querySelector<HTMLElement>(".leaflet-bottom.leaflet-right");
    if (stack) stack.style.bottom = `${bottomInset}px`;
  }, [map, bottomInset]);

  /**
   * The map centre that puts `target` in the middle of the strip the visitor
   * can actually see. Centring on the container centre buries the visitor
   * behind the sheet, which is exactly where the eye is not looking.
   */
  const centreFor = useCallback(
    (instance: LeafletMap, target: LatLng, zoom: number) => {
      if (bottomInset <= 0 && leftInset <= 0) return target;
      // Screen y grows downwards and x rightwards, so pushing the centre down
      // and left moves the target up and right, out from under the panel.
      const shifted = instance
        .project(target, zoom)
        .add([-leftInset / 2, bottomInset / 2]);
      return instance.unproject(shifted, zoom);
    },
    [bottomInset, leftInset],
  );

  useEffect(() => {
    if (!map || !follow || !position) return;
    const zoom = map.getZoom();
    framedOn.current = { center: position, zoom };
    userMoved.current = false;
    programmatic.current = true;
    map.setView(centreFor(map, position, zoom), zoom, { animate: true });
  }, [map, follow, position, centreFor]);

  // Looking somewhere the visitor is not: a Site chosen from the list or
  // tapped on the map.
  useEffect(() => {
    if (!map || !focus) return;
    framedOn.current = focus;
    userMoved.current = false;
    programmatic.current = true;
    map.setView(centreFor(map, focus.center, focus.zoom), focus.zoom, { animate: true });
  }, [map, focus, centreFor]);

  /**
   * The panel changed size, so the strip of map the visitor can see did too.
   * Re-frame on what the camera was last pointed at, otherwise dragging the
   * sheet up leaves the Site it describes underneath it, and crossing the
   * desktop breakpoint drops it off the screen entirely.
   *
   * Skipped once the visitor has moved the map themselves: at that point the
   * camera is theirs, and pulling it back would be the map arguing.
   */
  useEffect(() => {
    const target = framedOn.current;
    if (!map || !target || userMoved.current) return;
    programmatic.current = true;
    map.setView(centreFor(map, target.center, target.zoom), target.zoom, { animate: false });
    // centreFor is derived from the insets, so listing it here would be the
    // same trigger twice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, bottomInset, leftInset]);

  const recenter = useCallback(() => {
    onRecenter();
    const instance = mapRef.current;
    if (!instance || !position) return;
    const zoom = Math.max(instance.getZoom(), 14);
    programmatic.current = true;
    instance.setView(centreFor(instance, position, zoom), zoom, { animate: true });
  }, [onRecenter, position, centreFor]);

  return (
    // `isolate` matters: Leaflet gives its own controls z-index up to 1000, and
    // without a stacking context here they would paint over the sheet.
    <div className="explore-map relative isolate min-h-0 flex-1">
      <div
        ref={containerRef}
        role="region"
        aria-label={label}
        className="absolute inset-0 bg-surface-sunken"
      />
      <MapContext.Provider value={map}>{map ? children : null}</MapContext.Provider>

      {showLocate && (
      <button
        type="button"
        onClick={recenter}
        disabled={!position}
        aria-label={tExplore(lang, "explore.map.locate")}
        className="absolute right-3 z-[400] flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-md transition-colors duration-150 hover:bg-surface-sunken disabled:opacity-50"
        style={{ bottom: `${bottomInset + 44}px` }}
      >
        <LocateFixed size={20} strokeWidth={1.75} aria-hidden />
      </button>
      )}
    </div>
  );
}
