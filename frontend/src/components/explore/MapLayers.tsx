"use client";

import { useEffect, useRef } from "react";
import type { Circle, CircleMarker, LayerGroup, Marker } from "leaflet";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";
import { approachRadiusM, formatDistance, type LatLng } from "@/lib/geo";
import type { Site } from "@/data/sites";
import { meruMarkup } from "./meru";
import { amenityPinMarkup } from "./amenityPin";
import type { Amenity } from "@shared/contract";
import { useLeafletMap } from "./BaseMap";

// Leaflet takes colours as strings, so these cannot be Tailwind classes. The
// values are the primary and focus tokens from tailwind.config.ts, copied here
// because that is the only way to hand them to a canvas library. The /explore
// carve-out (guardrails §11.1) covers this; C6 below does not get a pass.
const ZONE_COLOR = "#1D4E89";
const ACCURACY_COLOR = "#3B6FB0";
const DOT_STROKE = "#FBFCFE";

// The route, in the same ink as the Amenity pin it leads to. Deliberately not
// ZONE_COLOR: a blue line crossing a blue circle is two different meanings in
// one hue, and the Zone is the one that must never be misread.
const ROUTE_COLOR = "#8A6416";

/**
 * The visitor's dot is sized in pixels, not metres, so it stays thumb-sized at
 * every zoom. The three circles around it are sized in metres and scale with
 * the map. That difference is deliberate: the circles carry real distances, the
 * dot carries none.
 */
const DOT_RADIUS_PX = 7;

/**
 * Below this the map is answering "where are the sacred places in Bali", and
 * six names on top of each other answer nothing. Above it the map is answering
 * "which one is this", and the name is the answer.
 */
const LABEL_MIN_ZOOM = 12;

interface MapLayersProps {
  sites: Site[];
  position: LatLng | null;
  accuracyM: number | null;
  selectedSiteId: string | null;
  onSelectSite?: (siteId: string) => void;
  /**
   * "Lihat sekitar" is on, so the Zone and the Approach step aside.
   *
   * At the zoom where the basemap names what is around a Site, both circles are
   * wider than the screen (see `lib/nearby.ts`). Leaving them on would not show
   * a visitor more, it would wash the map in blue.
   *
   * The Site marker deliberately stays. Looking at what is around a sacred
   * place, with no mark saying where the sacred place is, is a map with no
   * reason to be open.
   */
  nearby?: boolean;
  /**
   * The one Amenity a visitor is headed for, drawn as a single pin.
   *
   * No Zone and no Approach, and that is the whole distinction rather than an
   * omission: those two circles say what is expected of somebody who crosses
   * them, and nothing is expected of anybody at a guest house.
   *
   * One at a time. Five pins competing with the basemap's own labels is the
   * crowding the "Lihat sekitar" mode exists to avoid, and putting it back
   * through another door would be the same mistake.
   */
  destination?: Amenity | null;
  /**
   * The line to the destination, if one has been asked for.
   *
   * `straight` is not a styling flag. It says the router had nothing to give
   * and this is the direct line between two points, which across Bali can be
   * less than half the distance of the road. It is drawn dashed for the same
   * reason the Approach is: the difference from a real route has to survive
   * somebody who cannot separate the colours (C6).
   */
  route?: { points: [number, number][]; straight: boolean } | null;
}

/**
 * Everything SASANA draws on top of the basemap: the Zone where a Site's
 * Customs apply, the Approach whose crossing raises the notice, the circle of
 * GPS uncertainty, and the visitor.
 *
 * The old SVG map drew Zones larger than life because 400 m was sub-pixel
 * across the whole island, and it hid the Approach because two invented circles
 * side by side read as a real ratio. `L.circle` takes a radius in metres, so
 * all three are now true size and the reason to hide the Approach is gone.
 */
export function MapLayers({
  sites,
  position,
  accuracyM,
  selectedSiteId,
  onSelectSite,
  nearby = false,
  destination = null,
  route = null,
}: MapLayersProps) {
  const map = useLeafletMap();
  const { lang } = useLang();

  /**
   * Two groups, and the split is the whole point.
   *
   * `siteGroup` is torn down and rebuilt whenever the Site list changes, which
   * now happens in normal use: the five Dummy Sites arrive a moment after the
   * first fix. `meGroup` holds the visitor, and it is tied to the map alone.
   *
   * They used to be one group, and the visitor went down with the rebuild. The
   * effect that draws the dot only re-runs when the position changes, so the
   * dot came back on the next fix and the bug hid. After a simulated walk
   * there is no next fix: the real watch has been stopped, so the visitor
   * vanished from the map and stayed gone.
   */
  const groupRef = useRef<LayerGroup | null>(null);
  const meGroupRef = useRef<LayerGroup | null>(null);
  const zonesRef = useRef<Map<string, Circle>>(new Map());
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const destGroupRef = useRef<LayerGroup | null>(null);
  const routeGroupRef = useRef<LayerGroup | null>(null);
  const accuracyRef = useRef<Circle | null>(null);
  const dotRef = useRef<CircleMarker | null>(null);
  const selectHandler = useRef(onSelectSite);
  selectHandler.current = onSelectSite;

  // Zones and Approaches. Rebuilt only when the Site list changes, which for
  // the MVP is never, but nothing here assumes that.
  useEffect(() => {
    if (!map) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled) return;

      const group = L.layerGroup().addTo(map);
      groupRef.current = group;

      for (const site of sites) {
        // Approach first, so it sits under the Zone. It is six times the area
        // of the Zone, so leaving it interactive would swallow every click
        // meant for the circle inside it.
        L.circle([site.lat, site.lng], {
          radius: approachRadiusM(site),
          color: ZONE_COLOR,
          weight: 1.5,
          opacity: 0.55,
          dashArray: "6 6",
          fill: false,
          interactive: false,
          className: "sasana-zone",
        })
          .bindTooltip(tExplore(lang, "explore.map.approach"))
          .addTo(group);

        // Zone. Solid stroke and a fill against the Approach's dashed and
        // empty one: guardrail C6 survives the carve-out, so the two circles
        // must differ by more than colour.
        const zone = L.circle([site.lat, site.lng], {
          radius: site.radiusM,
          color: ZONE_COLOR,
          weight: 2,
          fillColor: ZONE_COLOR,
          fillOpacity: 0.12,
          interactive: Boolean(selectHandler.current),
          className: "sasana-zone",
        })
          .bindTooltip(`${site.name} — ${tExplore(lang, "explore.map.zone")}`)
          .addTo(group);

        zone.on("click", () => selectHandler.current?.(site.id));
        zonesRef.current.set(site.id, zone);

        // The Site itself. A Zone without a mark at its centre is a ring around
        // nothing: it shows where the Customs apply but never says what is in
        // there. divIcon rather than L.marker's default, whose image path
        // breaks under a bundler and which cannot be styled anyway.
        const marker = L.marker([site.lat, site.lng], {
          icon: L.divIcon({
            className: "sasana-marker-wrap",
            html: `<span class="sasana-marker">${meruMarkup(15)}</span>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          }),
          keyboard: true,
          title: site.name,
          alt: site.name,
          // Above the circles, below the visitor.
          zIndexOffset: 100,
        })
          .bindTooltip(site.name, {
            permanent: true,
            direction: "top",
            offset: [0, -16],
            className: "sasana-marker-label",
          })
          .addTo(group);

        marker.on("click", () => selectHandler.current?.(site.id));
        markersRef.current.set(site.id, marker);
      }

      // The circles just drawn went into the same overlay pane as the visitor,
      // after it, so they paint over the dot until it is lifted back.
      dotRef.current?.bringToFront();
    })();

    return () => {
      cancelled = true;
      groupRef.current?.remove();
      groupRef.current = null;
      zonesRef.current.clear();
      markersRef.current.clear();
    };
  }, [map, sites, lang]);

  /**
   * The route line, under everything else it might cross.
   *
   * Its own group, and rebuilt whole whenever the line changes: a polyline has
   * no useful in-place update, and there is only ever one.
   */
  useEffect(() => {
    if (!map) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !route) return;

      const group = L.layerGroup().addTo(map);
      routeGroupRef.current = group;

      L.polyline(route.points, {
        color: ROUTE_COLOR,
        weight: route.straight ? 3 : 5,
        opacity: 0.9,
        dashArray: route.straight ? "8 8" : undefined,
        interactive: false,
      }).addTo(group);

      dotRef.current?.bringToFront();
    })();

    return () => {
      cancelled = true;
      routeGroupRef.current?.remove();
      routeGroupRef.current = null;
    };
  }, [map, route]);

  /**
   * The destination pin, in a group of its own.
   *
   * Not in `siteGroup`: that one is rebuilt whenever the Site list changes, and
   * a destination has nothing to do with the Sites. Not in `meGroup` either,
   * which belongs to the visitor and outlives everything.
   */
  useEffect(() => {
    if (!map) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !destination) return;

      const group = L.layerGroup().addTo(map);
      destGroupRef.current = group;

      L.marker([destination.lat, destination.lng], {
        icon: L.divIcon({
          className: "sasana-amenity-wrap",
          html: `<span class="sasana-amenity">${amenityPinMarkup(16)}</span>`,
          iconSize: [28, 28],
          iconAnchor: [14, 26],
        }),
        keyboard: true,
        title: destination.name,
        alt: destination.name,
        // Above the Sites, below the visitor: it is what the visitor asked to
        // be shown, and the one thing that must never be covered is them.
        zIndexOffset: 200,
      })
        .bindTooltip(destination.name, {
          permanent: true,
          direction: "top",
          offset: [0, -28],
          className: "sasana-amenity-label",
        })
        .addTo(group);

      dotRef.current?.bringToFront();
    })();

    return () => {
      cancelled = true;
      destGroupRef.current?.remove();
      destGroupRef.current = null;
    };
  }, [map, destination]);

  /**
   * The visitor's own group, created once per map and removed only with it.
   * Nothing about the Site list can reach it.
   */
  useEffect(() => {
    if (!map) return;
    return () => {
      meGroupRef.current?.remove();
      meGroupRef.current = null;
      accuracyRef.current = null;
      dotRef.current = null;
    };
  }, [map]);

  // Names are hidden by a class on the container rather than by unbinding the
  // tooltips: Leaflet reopens permanent tooltips on its own schedule, and
  // fighting that produces labels that flicker back on mid-pan.
  useEffect(() => {
    if (!map) return;
    const container = map.getContainer();
    const apply = () => {
      container.classList.toggle("sasana-labels-off", map.getZoom() < LABEL_MIN_ZOOM);
    };
    apply();
    map.on("zoomend", apply);
    return () => {
      map.off("zoomend", apply);
    };
  }, [map]);

  // Zones and Approaches hide by the same means as the names above, and for the
  // same reason: a class on the container, so nothing has to be torn down and
  // rebuilt to make a circle disappear for a moment.
  useEffect(() => {
    if (!map) return;
    const container = map.getContainer();
    container.classList.toggle("sasana-zones-off", nearby);
    return () => {
      container.classList.remove("sasana-zones-off");
    };
  }, [map, nearby]);

  // Selection is carried by stroke weight on the Zone and by a filled marker,
  // never by hue alone: a visitor who cannot separate the two colours still has
  // to be able to see which Site the sheet is describing (C6).
  useEffect(() => {
    for (const [id, zone] of zonesRef.current) {
      zone.setStyle({ weight: id === selectedSiteId ? 4 : 2 });
    }
    for (const [id, marker] of markersRef.current) {
      const el = marker.getElement()?.querySelector(".sasana-marker");
      el?.classList.toggle("is-selected", id === selectedSiteId);
    }
  }, [selectedSiteId]);

  // The visitor moves every few seconds. These layers are moved and resized in
  // place rather than destroyed and rebuilt, which would make the dot blink.
  useEffect(() => {
    if (!map) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !map) return;

      // Created here rather than in an effect of its own: both would race the
      // same dynamic import, and the loser would find no group and draw
      // nothing. Whichever pass gets here first makes it.
      let group = meGroupRef.current;
      if (!group) {
        group = L.layerGroup().addTo(map);
        meGroupRef.current = group;
      }

      if (!position) {
        accuracyRef.current?.remove();
        accuracyRef.current = null;
        dotRef.current?.remove();
        dotRef.current = null;
        return;
      }

      const latlng: [number, number] = [position.lat, position.lng];

      if (accuracyM !== null) {
        const label = tExplore(lang, "explore.map.accuracy", {
          distance: formatDistance(accuracyM, lang),
        });
        if (accuracyRef.current) {
          accuracyRef.current.setLatLng(latlng).setRadius(accuracyM).setTooltipContent(label);
        } else {
          accuracyRef.current = L.circle(latlng, {
            radius: accuracyM,
            stroke: false,
            fillColor: ACCURACY_COLOR,
            fillOpacity: 0.12,
            interactive: false,
          })
            .bindTooltip(label)
            .addTo(group);
        }
      } else {
        accuracyRef.current?.remove();
        accuracyRef.current = null;
      }

      // Added last so nothing can cover the visitor.
      if (dotRef.current) {
        dotRef.current.setLatLng(latlng);
      } else {
        dotRef.current = L.circleMarker(latlng, {
          radius: DOT_RADIUS_PX,
          color: DOT_STROKE,
          weight: 3,
          fillColor: ZONE_COLOR,
          fillOpacity: 1,
          interactive: false,
        }).addTo(group);
      }
      dotRef.current.bringToFront();
    })();

    return () => {
      cancelled = true;
    };
  }, [map, position, accuracyM, lang]);

  return null;
}
