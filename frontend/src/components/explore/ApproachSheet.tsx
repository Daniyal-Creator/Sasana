"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Camera, MessageCircle, FileText, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CustomIcon } from "@/components/explore/CustomIcon";
import { PanelBack } from "@/components/explore/PanelBack";
import { SiteThumb } from "@/components/explore/SiteThumb";
import { useIsDesktop, PANEL_CLASSES } from "@/components/explore/MapSheet";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";
import { formatDistance, approachRadiusM } from "@/lib/geo";
import type { Site } from "@/data/sites";

// Bottom sheet with two snap points (geofencing-ui-prompt §9.5). Rises with a
// translateY transform; prefers-reduced-motion is handled globally in
// globals.css, which flattens all transitions.

// The map keeps the rest. Longer content scrolls inside rather than pushing
// this up: a notice that grows until it has swallowed the map has stopped being
// a notice over a map.
const FULL_HEIGHT_FRAC = 0.6;

/** How much of the viewport this sheet covers at rest. Exported because the
 *  map underneath has to keep the visitor, the attribution, and the locate
 *  button clear of it, and guessing that number in two places is how they
 *  drift apart. */
export const APPROACH_SHEET_PEEK_FRAC = 0.45;
const PEEK_FRAC = APPROACH_SHEET_PEEK_FRAC;
const DRAG_THRESHOLD_PX = 8;

interface ApproachSheetProps {
  site: Site;
  /** Distance in meters to the site if location is active */
  distanceM?: number | null;
  /**
   * A line of small print under the heading, saying why this notice is not
   * quite what it looks like: a simulated position, or a Site that is not a
   * real place.
   *
   * This used to be a `simulated` boolean. Two conditions now need the same
   * line with different words, and a second boolean beside the first would be
   * two flags that must never both be true. The caller owns the sentence.
   */
  notice?: string | null;
  /**
   * Returns the panel to whatever it was showing before the Approach took it
   * over. The panel now changes by itself when a line is crossed, and a screen
   * that replaces itself without offering a way back has taken something.
   */
  onBack?: () => void;
}

export function ApproachSheet({ site, distanceM = null, notice = null, onBack }: ApproachSheetProps) {
  const { lang } = useLang();
  const isDesktop = useIsDesktop();
  const [snap, setSnap] = useState<"peek" | "full">("peek");
  const [dragY, setDragY] = useState<number | null>(null);
  const [viewportH, setViewportH] = useState(0);

  const dragStart = useRef<{ y: number; translate: number; moved: boolean } | null>(null);

  useEffect(() => {
    setViewportH(window.innerHeight);
    const onResize = () => setViewportH(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fullHeight = viewportH * FULL_HEIGHT_FRAC;
  const maxTranslate = viewportH * (FULL_HEIGHT_FRAC - PEEK_FRAC);
  const translate = dragY ?? (snap === "full" ? 0 : maxTranslate);

  function handlePointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStart.current = { y: e.clientY, translate, moved: false };
    setDragY(translate);
  }

  function handlePointerMove(e: React.PointerEvent) {
    const start = dragStart.current;
    if (!start) return;
    const delta = start.y - e.clientY;
    if (Math.abs(delta) > DRAG_THRESHOLD_PX) start.moved = true;
    const next = Math.max(0, Math.min(maxTranslate, start.translate + delta));
    setDragY(next);
  }

  function handlePointerUp() {
    const start = dragStart.current;
    if (!start) return;
    if (start.moved) {
      const current = dragY ?? maxTranslate;
      setSnap(current > maxTranslate / 2 ? "peek" : "full");
    } else {
      setSnap((prev) => (prev === "full" ? "peek" : "full"));
    }
    dragStart.current = null;
    setDragY(null);
  }

  const visibleCustoms = site.customs;
  const count = site.customs.length;
  const progress =
    distanceM !== null
      ? Math.max(0.1, Math.min(1, 1 - distanceM / approachRadiusM(site)))
      : 0.5;

  const header = (
    <div className="shrink-0 px-5">
      {onBack && <PanelBack label={tExplore(lang, "explore.panel.backOut")} onClick={onBack} />}

      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-primary-tint/50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <SiteThumb size={48} className="rounded-lg shadow-xs" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9E4D2E]">
                {tExplore(lang, "explore.sheet.approaching")}
              </p>
              <h2 className="font-display text-lg font-bold leading-tight text-[#162A45] sm:text-xl">
                {site.name}
              </h2>
            </div>
          </div>

          {distanceM !== null && (
            <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#9E4D2E] px-3 py-1 shadow-sm">
              <MapPin size={12} strokeWidth={2.5} className="fill-white/20 text-white shrink-0" />
              <span className="text-xs font-bold tracking-wide text-white">
                {formatDistance(distanceM, lang)}
              </span>
            </div>
          )}
        </div>
      </div>

      {notice && (
        <p className="flex items-center gap-2 pt-3 text-xs text-text-muted">
          <Compass size={16} strokeWidth={1.75} aria-hidden className="shrink-0" />
          {notice}
        </p>
      )}
    </div>
  );

  const body = (
    <div data-lenis-prevent className="sasana-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">
      <div className="mt-3 overflow-hidden rounded-xl border border-border/60 bg-surface shadow-xs">
        <ul className="divide-y divide-border/60">
          {visibleCustoms.map((custom) => (
            <li key={custom.id} className="flex items-center gap-3.5 px-4 py-3">
              <span
                aria-hidden
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#ECCFC0] bg-[#F8EDE3] text-[#8E4B28] shadow-xs"
              >
                <CustomIcon icon={custom.icon} size={20} />
              </span>
              <p className="text-xs font-medium leading-relaxed text-[#232B38] sm:text-[13px]">
                {custom.summary[lang]}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer info & provenance with proximity progress bar */}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/60 pt-3 text-xs text-text-muted">
        <div className="flex min-w-0 items-center gap-1.5 text-text-secondary">
          <FileText size={15} strokeWidth={1.75} aria-hidden className="shrink-0 text-primary" />
          <span className="truncate text-xs font-medium">{site.source}</span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div
            className="h-1.5 w-16 overflow-hidden rounded-full bg-border sm:w-20"
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-[#9E4D2E]"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E4D2E]">
            {count} {lang === "id" ? "ADAT" : "CUSTOMS"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 pt-4 sm:flex-row">
        <Button variant="primary" icon={Camera} href="/check" className="flex-1">
          {tExplore(lang, "explore.sheet.checkPhoto")}
        </Button>
        <Button variant="secondary" icon={MessageCircle} href="/assistant" className="flex-1">
          {tExplore(lang, "explore.sheet.ask")}
        </Button>
      </div>
    </div>
  );

  const label = `${tExplore(lang, "explore.sheet.approaching")} ${site.name}`;

  // Desktop: a panel parked against the left edge, so the map is never covered.
  // A sheet that rises from the bottom of a wide screen and stops halfway has
  // nothing anchoring it, and it sits over the middle of the map, which is the
  // part being looked at.
  if (isDesktop) {
    return (
      <div
        role="region"
        aria-label={label}
        data-lenis-prevent
        className={`${PANEL_CLASSES} absolute inset-y-4 left-4 w-[min(380px,38vw)] overflow-hidden rounded-xl border pt-5`}
      >
        {header}
        {body}
      </div>
    );
  }

  return (
    // Full width, matching MapSheet. The two are peers: one bottom sheet on
    // this screen capped at 600 and centred while the other spans the width
    // reads as a mistake on any viewport between 600 and the desktop
    // breakpoint, where the capped one leaves a strip of map down both sides.
    <div className="fixed inset-x-0 bottom-0 z-40 w-full" aria-label={label} role="region">
      <div
        className={[
          // bg-bg, matching MapSheet: the sheet is the ground its content
          // sits on, and the tinted header block reads as raised against it.
          "flex flex-col overflow-hidden rounded-t-xl border border-border bg-bg shadow-lg",
          "will-change-transform",
          dragY === null ? "transition-transform duration-300 ease-out-quart" : "",
        ].join(" ")}
        style={{ height: `${fullHeight}px`, transform: `translateY(${translate}px)` }}
      >
        <button
          type="button"
          aria-label={tExplore(lang, snap === "full" ? "explore.sheet.collapse" : "explore.sheet.expand")}
          className="flex h-11 w-full shrink-0 touch-none items-center justify-center focus-visible:shadow-focus"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <span aria-hidden className="h-1 w-10 rounded-full bg-border-strong" />
        </button>

        {header}
        {body}
      </div>
    </div>
  );
}
