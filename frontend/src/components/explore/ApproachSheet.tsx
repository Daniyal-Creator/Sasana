"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Camera, MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CustomIcon } from "@/components/explore/CustomIcon";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";
import type { Site } from "@/data/sites";

// Bottom sheet with two snap points (geofencing-ui-prompt §9.5). Rises with a
// translateY transform; prefers-reduced-motion is handled globally in
// globals.css, which flattens all transitions.

const FULL_HEIGHT_FRAC = 0.85;
const PEEK_FRAC = 0.45;
const DRAG_THRESHOLD_PX = 8;

interface ApproachSheetProps {
  site: Site;
}

export function ApproachSheet({ site }: ApproachSheetProps) {
  const { lang } = useLang();
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

  const visibleCustoms = site.customs.slice(0, 3);
  const count = site.customs.length;
  const countText =
    count === 1
      ? tExplore(lang, "explore.sheet.count.one")
      : tExplore(lang, "explore.sheet.count.many", { count: String(count) });

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-tool"
      aria-label={`${tExplore(lang, "explore.sheet.approaching")} ${site.name}`}
      role="region"
    >
      <div
        className={[
          "flex flex-col overflow-hidden rounded-t-xl border border-border bg-surface shadow-lg",
          "will-change-transform",
          dragY === null ? "transition-transform duration-300 ease-out-quart" : "",
        ].join(" ")}
        style={{ height: `${fullHeight}px`, transform: `translateY(${translate}px)` }}
      >
        <button
          type="button"
          aria-label={snap === "full" ? "Collapse" : "Expand"}
          className="flex h-9 w-full shrink-0 items-center justify-center focus-visible:shadow-focus"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <span aria-hidden className="h-1 w-10 rounded-full bg-border-strong" />
        </button>

        <div className="shrink-0 px-5">
          <div className="flex items-start gap-3 rounded-md bg-primary-tint p-4">
            <MapPin size={20} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                {tExplore(lang, "explore.sheet.approaching")}
              </p>
              <p className="font-display text-h3 font-semibold text-text">{site.name}</p>
            </div>
          </div>

          <p className="pt-4 text-base text-text">
            {tExplore(lang, "explore.sheet.sacredArea")} {countText}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          <ul className="divide-y divide-border">
            {visibleCustoms.map((custom) => (
              <li key={custom.id} className="flex items-start gap-3 py-3">
                <CustomIcon icon={custom.icon} size={20} className="mt-0.5 shrink-0 text-primary" />
                <p className="text-sm text-text">{custom.summary[lang]}</p>
              </li>
            ))}
          </ul>

          <p className="flex items-center gap-2 pt-3 text-sm text-text-muted">
            <ShieldCheck size={16} strokeWidth={1.75} aria-hidden className="shrink-0" />
            {site.source}
          </p>

          <div className="flex gap-3 pt-4">
            <Button variant="primary" icon={Camera} href="/check" className="flex-1">
              {tExplore(lang, "explore.sheet.checkPhoto")}
            </Button>
            <Button variant="secondary" icon={MessageCircle} href="/assistant" className="flex-1">
              {tExplore(lang, "explore.sheet.ask")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}