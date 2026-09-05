"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";

export type SheetStage = "peek" | "full";

/**
 * How much of the sheet stays visible in `peek`. Exported because `BaseMap`
 * lifts the OpenStreetMap attribution by exactly this much: the attribution is
 * a licence requirement, so it may never end up behind the sheet.
 */
export const PEEK_HEIGHT_PX = 132;

/**
 * How tall the sheet is allowed to get on a phone, as a share of the viewport.
 * The map keeps the rest. Longer content does not push this up; it scrolls
 * inside, because a panel that grows until it has swallowed the map has stopped
 * being a panel over a map.
 */
export const SHEET_FULL_FRAC = 0.6;
const FULL_MAX_SVH = SHEET_FULL_FRAC * 100;

/** Past a third of the travel the sheet commits to the other stage. Below it,
 *  it springs back: a short drag reads as a mis-touch, not an instruction. */
const COMMIT_FRACTION = 1 / 3;

/**
 * At this width and up the sheet stops being a sheet. It becomes a panel parked
 * against the left edge, the way a desktop map tool does it, and the map is
 * never covered at all. Matches Tailwind's `md`.
 */
const DESKTOP_QUERY = "(min-width: 768px)";

/**
 * Shared by both layouts so the two never drift apart.
 *
 * `bg-bg` rather than `bg-surface`: the panel is a ground, not a card. Cards
 * and rows keep `bg-surface`, so they lift off it the way they do on the
 * landing page. When both were the same near-white, a list of rows on a panel
 * was one flat sheet with hairlines ruled across it.
 */
export const PANEL_CLASSES =
  "pointer-events-auto z-[500] flex flex-col border-border bg-bg shadow-lg";

interface MapSheetProps {
  stage: SheetStage;
  onStageChange: (stage: SheetStage) => void;
  children: React.ReactNode;
}

/**
 * Two layouts, one component.
 *
 * On a phone: a bottom sheet with two stages, not the three Google Maps uses.
 * Three snap points with momentum is a bug surface out of proportion to six
 * Sites, and two carries most of the feel.
 *
 * On a desktop: a fixed panel down the left side. A sheet that rises from the
 * bottom of a wide screen and stops halfway has nothing anchoring it, and it
 * covers the middle of the map, which is the part being looked at.
 *
 * This component knows nothing about Sites, the map, or GPS. It owns position
 * and gesture; the caller owns content.
 */
export function MapSheet({ stage, onStageChange, children }: MapSheetProps) {
  const { lang } = useLang();
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isDesktop = useIsDesktop();

  // Live offset in px while a finger is down. null means "not dragging", which
  // is also what re-enables the snap transition.
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const dragStartY = useRef(0);

  // How far the sheet slides between the two stages. It has to be state rather
  // than something measured during render: on the first pass the element does
  // not exist yet, so a measurement taken there is zero and the sheet opens
  // fully expanded and never corrects itself.
  const [travelPx, setTravelPx] = useState(0);
  const travel = useRef(0);
  travel.current = travelPx;

  // The first measurement moves the sheet from "unmeasured" to its resting
  // place, and that move must not be animated: without this the sheet appears
  // fully open on load and then slides down, which reads as the screen
  // correcting a mistake in front of the visitor.
  const [ready, setReady] = useState(false);

  const collapsed = stage === "peek";

  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const measure = () => setTravelPx(Math.max(0, el.offsetHeight - PEEK_HEIGHT_PX));
    measure();
    const frame = requestAnimationFrame(() => setReady(true));
    // The content decides the height, and the content changes: a signal notice
    // appears, a Site is selected, the visitor rotates the phone.
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartY.current = e.clientY;
    setDragOffset(0);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (dragOffset === null) return;
      const raw = e.clientY - dragStartY.current;
      // Clamp to the corridor between the two stages so the sheet can never be
      // dragged off the bottom of the screen or above its own full height.
      const min = collapsed ? -travel.current : 0;
      const max = collapsed ? 0 : travel.current;
      setDragOffset(Math.min(max, Math.max(min, raw)));
    },
    [collapsed, dragOffset],
  );

  const endDrag = useCallback(() => {
    if (dragOffset === null) return;
    const moved = Math.abs(dragOffset);
    const committed = travel.current > 0 && moved > travel.current * COMMIT_FRACTION;
    if (committed) onStageChange(collapsed ? "full" : "peek");
    setDragOffset(null);
  }, [collapsed, dragOffset, onStageChange]);

  const toggle = useCallback(() => {
    onStageChange(collapsed ? "full" : "peek");
  }, [collapsed, onStageChange]);

  // A sheet that opens should show its content from the top, not wherever the
  // visitor left it last time.
  useEffect(() => {
    if (stage === "full") scrollRef.current?.scrollTo({ top: 0 });
  }, [stage]);

  if (isDesktop) {
    return (
      <div
        ref={sheetRef}
        className={`${PANEL_CLASSES} absolute inset-y-4 left-4 w-[min(380px,38vw)] rounded-xl border`}
      >
        <div
          ref={scrollRef}
          className="sasana-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-6"
        >
          {children}
        </div>
      </div>
    );
  }

  const restingOffset = collapsed ? travelPx : 0;
  const offset = dragOffset === null ? restingOffset : restingOffset + dragOffset;

  return (
    <div
      ref={sheetRef}
      className={`${PANEL_CLASSES} absolute inset-x-0 bottom-0 rounded-t-xl border-t`}
      style={{
        maxHeight: `${FULL_MAX_SVH}svh`,
        transform: `translateY(${offset}px)`,
        // No transition while a finger is down: the sheet has to track the
        // finger exactly. Transform only, never height, so the map behind it
        // is not relaid out on every frame.
        transition:
          ready && dragOffset === null ? "transform 240ms cubic-bezier(0.25,1,0.5,1)" : "none",
      }}
    >
      <button
        type="button"
        onClick={toggle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        aria-expanded={!collapsed}
        aria-label={tExplore(lang, collapsed ? "explore.sheet.expand" : "explore.sheet.collapse")}
        // touch-action sits on the handle alone. On the whole sheet it would
        // also kill scrolling inside the content.
        className="flex h-11 w-full shrink-0 touch-none items-center justify-center"
      >
        <span aria-hidden className="h-1 w-10 rounded-full bg-border-strong" />
      </button>

      <div
        ref={scrollRef}
        className="sasana-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-8 sm:px-6"
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Layout that changes structurally, not fluidly, so it is a media query rather
 * than a breakpoint class: the two branches render different DOM and run
 * different gesture code, and CSS cannot switch that.
 */
export function useIsDesktop(): boolean {
  // False on the server and on the first client pass, so the phone layout is
  // what hydrates. Correcting to the panel afterwards is invisible; the reverse
  // would flash a full-width panel across a phone.
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return isDesktop;
}
