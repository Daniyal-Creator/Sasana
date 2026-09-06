"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Bell, ShieldCheck, EyeOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CustomIcon } from "@/components/explore/CustomIcon";
import { BaseMap } from "@/components/explore/BaseMap";
import { MapLayers } from "@/components/explore/MapLayers";
import { useLang } from "@/lib/language";
import type { Lang } from "@/lib/i18n";
import { tExplore } from "@/lib/i18n.explore";
import { SITES } from "@/data/sites";
import { APPROACH_BUFFER_M, type LatLng } from "@/lib/geo";
import { MERU_BASE, MERU_PATHS } from "@/components/explore/meru";

const BALI_CENTER: LatLng = { lat: -8.42, lng: 115.16 };
const BALI_ZOOM = 9;

/** The Site whose Customs stand in for all of them on this screen. */
const EXAMPLE_SITE = SITES[0];

/**
 * The diagram this screen is built around: a Site, the Zone where its Customs
 * apply, the wider Approach whose crossing raises the notice, and a visitor
 * walking across it.
 *
 * Geometry only. Every word sits in HTML beside it, so the labels can be as
 * long as Indonesian needs them to be without breaking the drawing, and a
 * screen reader gets the legend rather than a soup of `<text>` nodes.
 */
function ApproachDiagram() {
  return (
    <div className="relative w-full">
      <svg viewBox="0 0 300 200" aria-hidden focusable="false" className="block h-auto w-full">
        {/* Approach: dashed and unfilled, exactly as the map draws it. The two
            surfaces have to agree or the diagram teaches the wrong thing. */}
        <circle
          cx="108"
          cy="100"
          r="86"
          fill="none"
          stroke="#1D4E89"
          strokeOpacity="0.55"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />

        {/* Zone: solid stroke, faint fill. */}
        <circle
          cx="108"
          cy="100"
          r="45"
          fill="#1D4E89"
          fillOpacity="0.12"
          stroke="#1D4E89"
          strokeWidth="2"
        />

        {/* The walk in. Faint before the crossing, because nothing has happened
            yet; solid after it, because now the visitor knows. */}
        <path
          d="M298 22 C 258 32, 214 30, 174 45"
          fill="none"
          stroke="#8A8073"
          strokeWidth="1.5"
          strokeDasharray="3 5"
          strokeLinecap="round"
        />
        <path d="M174 45 L 142 71" fill="none" stroke="#1D4E89" strokeWidth="1.75" strokeLinecap="round" />

        {/* The crossing itself. */}
        <circle cx="174" cy="45" r="13" fill="#1D4E89" fillOpacity="0.14" />
        <circle cx="174" cy="45" r="5.5" fill="#1D4E89" stroke="#FBFCFE" strokeWidth="2" />

        {/* The gap between the two circles, measured. This is the sentence the
            card makes, drawn: the space to the right of the rings was the
            emptiest part of the picture and it is the part worth explaining. */}
        <g stroke="#8A8073" strokeWidth="1.25" strokeLinecap="round">
          <line x1="153" y1="100" x2="194" y2="100" />
          <line x1="153" y1="94" x2="153" y2="106" />
          <line x1="194" y1="94" x2="194" y2="106" />
        </g>

        {/* The Site, as the same pura pictogram the map markers use. */}
        <g transform="translate(96 87.5)" fill="#1D4E89">
          {MERU_PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
          <rect {...MERU_BASE} />
        </g>
      </svg>

      {/* The number is the real constant, not a caption written to match the
          drawing. Kept in HTML so it inherits the type stack, and hidden from
          screen readers because the paragraph above already says it in words. */}
      <span
        aria-hidden
        className="absolute -translate-x-1/2 text-xs font-medium text-text-muted"
        style={{ left: "57.8%", top: "56%" }}
      >
        {APPROACH_BUFFER_M} m
      </span>
    </div>
  );
}

/**
 * A ring that matches how the map draws the thing it names. Drawn in SVG rather
 * than as a CSS `border-dashed` circle: at 14 across, a dashed border resolves
 * to three or four stray marks and reads as a rendering fault.
 */
function RingKey({ dashed }: { dashed?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden focusable="false" className="mt-0.5 h-4 w-4 shrink-0">
      <circle
        cx="8"
        cy="8"
        r="6.5"
        fill={dashed ? "none" : "#1D4E89"}
        fillOpacity={dashed ? undefined : 0.14}
        stroke="#1D4E89"
        strokeOpacity={dashed ? 0.7 : 1}
        strokeWidth="1.75"
        strokeDasharray={dashed ? "3 2.6" : undefined}
      />
    </svg>
  );
}

/**
 * The map only mounts once it is close to being looked at. It is the heaviest
 * thing on the screen and it sits below the fold on a phone, and this screen's
 * whole job is to be quick enough that a visitor in the sun does not give up on
 * it.
 */
function LazyMiniMap() {
  const { lang } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex min-h-[230px] flex-1 overflow-hidden rounded-lg bg-surface-sunken">
      {show && (
        <BaseMap
          label={tExplore(lang, "explore.map.aria", { count: String(SITES.length) })}
          center={BALI_CENTER}
          zoom={BALI_ZOOM}
          follow={false}
          position={null}
          bottomInset={0}
          leftInset={0}
          focus={null}
          interactive={false}
          showLocate={false}
          onUserPan={() => {}}
          onRecenter={() => {}}
          onTileError={() => {}}
        >
          <MapLayers
            sites={SITES}
            position={null}
            accuracyM={null}
            selectedSiteId={null}
          />
        </BaseMap>
      )}
    </div>
  );
}

/**
 * The notice itself, at rest, built from a real Site.
 *
 * This section used to describe the notice in a row of small cards, which put
 * a card inside a card and left the visitor reading about a thing instead of
 * looking at it. The one object that answers "what will I be told" is the
 * notice, so the notice is what is shown: the same header block, the same
 * lines, the same attribution, in the same order they arrive in.
 *
 * Every Custom is listed, never the first few. The sheet this mirrors states a
 * count and then lists that many, and a preview that quietly shows three of
 * five would teach the visitor to expect a shorter notice than they will get.
 */
/**
 * The notice itself, at rest, built from a real Site.
 *
 * Displays an authentic preview of the approach sheet that visitors will
 * receive on mobile when entering the site's approach zone.
 */
function NoticePreview() {
  const { lang } = useLang();
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-surface shadow-md">
      {/* The handle */}
      <div className="flex h-6 items-center justify-center bg-surface">
        <span aria-hidden className="h-1 w-10 rounded-full bg-border-strong" />
      </div>

      <div className="px-4 pb-4">
        {/* Approaching Header Banner */}
        <div className="flex items-start justify-between rounded-lg bg-primary-tint p-3.5">
          <div className="flex items-start gap-2.5">
            <MapPin size={18} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                {tExplore(lang, "explore.sheet.approaching")}
              </p>
              <p className="font-display text-lg font-bold leading-tight text-text">
                {EXAMPLE_SITE.name}
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded bg-surface px-2 py-0.5 text-xs font-semibold text-primary shadow-sm border border-border/50">
            400 m
          </span>
        </div>

        {/* Customs list with styled icon tiles */}
        <ul className="mt-2.5 divide-y divide-border">
          {EXAMPLE_SITE.customs.map((custom) => (
            <li key={custom.id} className="flex items-start gap-3 py-2.5">
              <span
                aria-hidden
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border bg-surface-sunken text-primary shadow-sm"
              >
                <CustomIcon icon={custom.icon} size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium leading-snug text-text">{custom.summary[lang]}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Footer info & provenance */}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 text-xs text-text-muted">
          <p className="flex items-center gap-1.5 truncate">
            <ShieldCheck size={14} strokeWidth={1.75} aria-hidden className="shrink-0 text-primary" />
            <span className="truncate">{EXAMPLE_SITE.source}</span>
          </p>
          <span className="shrink-0 font-medium text-accent-strong text-[11px] uppercase tracking-wider">
            {lang === "id" ? "5 Adat Berlaku" : "5 Customs"}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Graphic for 'It speaks once' */
function WhenGraphic({ lang }: { lang: Lang }) {
  return (
    <svg viewBox="0 0 240 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block select-none" aria-hidden="true">
      <rect width="240" height="64" rx="6" fill="#F6F1E9" />
      {/* Radar distance arc */}
      <circle cx="28" cy="32" r="22" stroke="#1D4E89" strokeOpacity="0.25" strokeDasharray="3 3" />
      <circle cx="28" cy="32" r="14" stroke="#1D4E89" strokeOpacity="0.45" strokeDasharray="3 3" />
      <circle cx="28" cy="32" r="5" fill="#1D4E89" />
      {/* Pulse line to notification */}
      <path d="M33 32L64 32" stroke="#1D4E89" strokeWidth="1.5" strokeDasharray="2 2" />
      {/* Notification chip */}
      <rect x="68" y="14" width="162" height="36" rx="6" fill="#FFFDF9" stroke="#E4DACB" strokeWidth="1" />
      <circle cx="84" cy="32" r="7" fill="#E7EEF6" />
      <path d="M84 28V33M84 35H84.01" stroke="#1D4E89" strokeWidth="1.5" strokeLinecap="round" />
      <text x="96" y="27" fill="#1D4E89" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif">
        {lang === "id" ? "1x Notifikasi Tenang" : "1x Quiet Notice"}
      </text>
      <text x="96" y="41" fill="#8A8073" fontSize="9" fontFamily="system-ui, sans-serif">
        {lang === "id" ? "Saat melintasi 800m" : "Crossing 800m approach"}
      </text>
    </svg>
  );
}

/** Graphic for 'Your position stays here' */
function PrivacyGraphic({ lang }: { lang: Lang }) {
  return (
    <svg viewBox="0 0 240 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block select-none" aria-hidden="true">
      <rect width="240" height="64" rx="6" fill="#F6F1E9" />
      {/* On-device vault visual */}
      <rect x="16" y="12" width="28" height="40" rx="4" fill="#FFFDF9" stroke="#CBBFA8" strokeWidth="1.25" />
      <rect x="22" y="16" width="16" height="2" rx="1" fill="#E4DACB" />
      <circle cx="30" cy="46" r="2" fill="#E4DACB" />
      <circle cx="30" cy="30" r="7" fill="#E8F3EB" />
      <path d="M27.5 30L29.5 32L33 28.5" stroke="#2E7D46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Arrow barrier */}
      <path d="M48 32H72" stroke="#2E7D46" strokeWidth="1.5" strokeDasharray="2 2" />
      {/* Shield status box */}
      <rect x="76" y="14" width="154" height="36" rx="6" fill="#FFFDF9" stroke="#BEDDC6" strokeWidth="1" />
      <text x="88" y="27" fill="#2E7D46" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif">
        {lang === "id" ? "100% On-Device" : "100% Local Device"}
      </text>
      <text x="88" y="41" fill="#8A8073" fontSize="9" fontFamily="system-ui, sans-serif">
        {lang === "id" ? "Tanpa pelacakan cloud" : "Zero cloud tracking"}
      </text>
    </svg>
  );
}

/** Graphic for 'Only while this is open' */
function LiveSessionGraphic({ lang }: { lang: Lang }) {
  return (
    <svg viewBox="0 0 240 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block select-none" aria-hidden="true">
      <rect width="240" height="64" rx="6" fill="#F6F1E9" />
      {/* Browser tab beacon */}
      <rect x="14" y="14" width="44" height="36" rx="5" fill="#FFFDF9" stroke="#CBBFA8" strokeWidth="1.25" />
      <rect x="14" y="14" width="44" height="10" rx="5" fill="#EFE8DC" />
      <circle cx="20" cy="19" r="1.5" fill="#B23A2E" />
      <circle cx="25" cy="19" r="1.5" fill="#B8862B" />
      <circle cx="30" cy="19" r="1.5" fill="#2E7D46" />
      <circle cx="36" cy="35" r="5" fill="#E7EEF6" />
      <circle cx="36" cy="35" r="2.5" fill="#1D4E89" />
      {/* Arrow trail */}
      <path d="M62 32H74" stroke="#1D4E89" strokeWidth="1.5" strokeDasharray="2 2" />
      {/* Live status chip */}
      <rect x="78" y="14" width="152" height="36" rx="6" fill="#FFFDF9" stroke="#E4DACB" strokeWidth="1" />
      <circle cx="90" cy="32" r="3" fill="#2E7D46" />
      <text x="98" y="27" fill="#1D4E89" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif">
        {lang === "id" ? "Sesi Berjalan Aktif" : "Active Walking Session"}
      </text>
      <text x="98" y="41" fill="#8A8073" fontSize="9" fontFamily="system-ui, sans-serif">
        {lang === "id" ? "Layar tetap menyala" : "Keep screen unlocked"}
      </text>
    </svg>
  );
}

interface GuideProps {
  onStart: () => void;
}

/**
 * The screen before the map. One job: give a visitor a reason to turn location
 * on, and do it by showing what happens rather than promising it.
 *
 * Pressing Start does not wait for anything. The browser raises its permission
 * prompt and the map appears underneath it either way, so a visitor who
 * dismisses the prompt instead of answering is not left on a screen that has
 * gone quiet.
 */
export function Guide({ onStart }: GuideProps) {
  const { lang } = useLang();
  return (
    <div className="mx-auto w-full max-w-container flex-1 px-4 pb-14 pt-8 sm:px-6 lg:pt-10 xl:max-w-wide">
      {/* Not a card. The opening should read as the page speaking, not as the
          first item in a list of tiles. */}
      {/* The words sit together on the left and the action sits at the end of
          them. Splitting the lead into a second column made that column the
          taller one, which pushed the headline down the page and opened a hole
          above it. */}
      <header className="lg:grid lg:grid-cols-12 lg:items-end lg:gap-10">
        <div className="lg:col-span-8">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent-strong">
            {tExplore(lang, "explore.guide.eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-h1 font-semibold leading-[1.08] text-text lg:text-display">
            {tExplore(lang, "explore.guide.title")}
          </h1>
          <p className="mt-4 max-w-prose text-lg leading-relaxed text-text-secondary">
            {tExplore(lang, "explore.guide.lead")}
          </p>
        </div>

        {/* The action fills its column rather than sitting as a small tab in a
            wide empty one. It is also the thing a visitor in the sun is
            reaching for, so a large target is the right answer twice over. */}
        <div className="mt-6 lg:col-span-4 lg:mt-0 lg:pb-1">
          <Button size="lg" icon={MapPin} onClick={onStart} className="w-full">
            {tExplore(lang, "explore.guide.start")}
          </Button>
          <p className="mt-3 text-sm text-text-muted">
            {tExplore(lang, "explore.guide.startHint")}
          </p>
        </div>
      </header>

      {/* Six cells, four sizes. A grid of equal tiles would say every one of
          these matters the same amount, and they do not: the mechanism is the
          thing worth looking at. */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-6 lg:mt-10">
        {/* The mechanism. Widest cell, and the only one that leads with a
            picture. */}
        <section className="rounded-xl border border-border bg-surface p-6 md:col-span-4 md:row-span-2 md:p-8">
          <h2 className="font-display text-h3 font-semibold text-text">
            {tExplore(lang, "explore.guide.how.title")}
          </h2>
          <p className="mt-2 max-w-prose text-base text-text-secondary">
            {tExplore(lang, "explore.guide.how.body")}
          </p>

          {/* Drawing and legend sit side by side once there is width for it.
              Stacked, the drawing was capped well short of the card and left a
              band of nothing down both sides of the widest cell on the page. */}
          <div className="mt-5 flex flex-col gap-6 lg:mt-6 lg:flex-row lg:items-center lg:gap-8">
            <div className="min-w-0 flex-1">
              <ApproachDiagram />
            </div>

            <dl className="grid gap-5 sm:grid-cols-2 lg:w-[15rem] lg:shrink-0 lg:grid-cols-1">
              <div className="flex gap-3">
                <RingKey dashed />
                <div>
                  <dt className="text-sm font-medium text-text">
                    {tExplore(lang, "explore.guide.how.approach")}
                  </dt>
                  <dd className="mt-0.5 text-sm text-text-secondary">
                    {tExplore(lang, "explore.guide.how.approachBody")}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <RingKey />
                <div>
                  <dt className="text-sm font-medium text-text">
                    {tExplore(lang, "explore.guide.how.zone")}
                  </dt>
                  <dd className="mt-0.5 text-sm text-text-secondary">
                    {tExplore(lang, "explore.guide.how.zoneBody")}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </section>

        {/* The real thing, at real scale. Tall so the island reads. */}
        <section className="flex flex-col rounded-xl border border-border bg-surface p-5 md:col-span-2 md:row-span-2">
          <h2 className="font-display text-lg font-semibold text-text">
            {tExplore(lang, "explore.guide.map.title")}
          </h2>
          <p className="mt-1.5 text-sm text-text-secondary">
            {tExplore(lang, "explore.guide.map.body")}
          </p>
          <div className="mt-4 flex min-h-[230px] flex-1">
            <LazyMiniMap />
          </div>
        </section>

        {/* Three informative notes with dedicated graphic illustrations */}
        <section className="rounded-xl border border-border bg-surface md:col-span-6 shadow-sm overflow-hidden">
          <dl className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <GuideNote
              icon={Bell}
              title={tExplore(lang, "explore.guide.when.title")}
              body={tExplore(lang, "explore.guide.when.body")}
              visual={<WhenGraphic lang={lang} />}
            />
            <GuideNote
              icon={ShieldCheck}
              title={tExplore(lang, "explore.guide.privacy.title")}
              body={tExplore(lang, "explore.guide.privacy.body")}
              visual={<PrivacyGraphic lang={lang} />}
            />
            <GuideNote
              icon={EyeOff}
              title={tExplore(lang, "explore.guide.limit.title")}
              body={tExplore(lang, "explore.guide.limit.body")}
              visual={<LiveSessionGraphic lang={lang} />}
            />
          </dl>
        </section>

        {/* The payoff: Proportional, rich bento section with cultural pillars and live mobile notice preview */}
        <section className="rounded-xl border border-border bg-surface-sunken p-6 md:col-span-6 md:p-8 shadow-sm">
          <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Left Column: Context, Circular Authority Seal, and 3 Cultural Object Pillars */}
            <div className="space-y-5 lg:col-span-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-strong">
                  {lang === "id" ? "PANDUAN RESMI & TERVERIFIKASI" : "VERIFIED OFFICIAL GUIDELINES"}
                </p>
                <h2 className="mt-2 font-display text-h2 font-semibold leading-tight text-text">
                  {tExplore(lang, "explore.guide.customs.title")}
                </h2>
                <p className="mt-2.5 max-w-prose text-base leading-relaxed text-text-secondary">
                  {tExplore(lang, "explore.guide.customs.body", { site: EXAMPLE_SITE.name })}
                </p>
              </div>

              {/* Official Provincial Circular Seal */}
              <div className="flex items-center gap-3.5 rounded-lg border border-border bg-surface p-3.5 shadow-sm">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary-tint text-primary">
                  <ShieldCheck size={22} strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">
                    {lang === "id" ? "Landasan Hukum Resmi" : "Official Legal Lineage"}
                  </p>
                  <p className="text-sm font-medium text-text">
                    {lang === "id" ? "Surat Edaran Gubernur Bali No. 7 Tahun 2025" : "Bali Governor Circular No. 7 of 2025"}
                  </p>
                </div>
              </div>

              {/* 3 Cultural Object Pillars Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex flex-col justify-between rounded-lg border border-border bg-surface p-3.5 shadow-sm">
                  <div>
                    <span className="inline-block rounded bg-primary-tint px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {lang === "id" ? "Tata Busana" : "Attire"}
                    </span>
                    <p className="mt-1.5 text-xs font-semibold text-text">
                      {lang === "id" ? "Kamen & Selendang" : "Kamen & Sash"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-text-secondary">
                      {lang === "id" ? "Menutup bahu & lutut" : "Shoulders & knees"}
                    </p>
                  </div>
                  <div className="mt-2.5 overflow-hidden rounded border border-border/60 bg-surface-sunken">
                    <svg viewBox="0 0 100 42" className="w-full h-auto block select-none" aria-hidden="true">
                      <rect width="100" height="42" fill="#F6F1E9" />
                      <rect x="20" y="8" width="60" height="26" rx="3" fill="#EFE8DC" stroke="#CBBFA8" strokeWidth="1" />
                      <rect x="15" y="14" width="70" height="8" rx="2" fill="#B8862B" stroke="#8A6416" strokeWidth="1" />
                      <circle cx="65" cy="18" r="4" fill="#8A6416" />
                    </svg>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-lg border border-border bg-surface p-3.5 shadow-sm">
                  <div>
                    <span className="inline-block rounded bg-status-ok-bg px-2 py-0.5 text-[11px] font-semibold text-status-ok-fg">
                      {lang === "id" ? "Sesaji" : "Offerings"}
                    </span>
                    <p className="mt-1.5 text-xs font-semibold text-text">
                      Canang Sari
                    </p>
                    <p className="mt-0.5 text-[11px] text-text-secondary">
                      {lang === "id" ? "Berjalan memutarinya" : "Walk around gently"}
                    </p>
                  </div>
                  <div className="mt-2.5 overflow-hidden rounded border border-border/60 bg-surface-sunken">
                    <svg viewBox="0 0 100 42" className="w-full h-auto block select-none" aria-hidden="true">
                      <rect width="100" height="42" fill="#F6F1E9" />
                      <polygon points="50,6 74,21 50,36 26,21" fill="#7E9F5F" stroke="#4A6B34" strokeWidth="1" />
                      <circle cx="50" cy="21" r="5" fill="#B23A2E" />
                      <circle cx="43" cy="21" r="3" fill="#B8862B" />
                      <circle cx="57" cy="21" r="3" fill="#FFFDF9" />
                    </svg>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-lg border border-border bg-surface p-3.5 shadow-sm">
                  <div>
                    <span className="inline-block rounded bg-status-warn-bg px-2 py-0.5 text-[11px] font-semibold text-status-warn-fg">
                      {lang === "id" ? "Kekhidmatan" : "Sacredness"}
                    </span>
                    <p className="mt-1.5 text-xs font-semibold text-text">
                      {lang === "id" ? "Suara & Foto" : "Quiet & Photos"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-text-secondary">
                      {lang === "id" ? "Jaga kesakralan" : "Reverent conduct"}
                    </p>
                  </div>
                  <div className="mt-2.5 overflow-hidden rounded border border-border/60 bg-surface-sunken">
                    <svg viewBox="0 0 100 42" className="w-full h-auto block select-none" aria-hidden="true">
                      <rect width="100" height="42" fill="#F6F1E9" />
                      <circle cx="50" cy="21" r="16" stroke="#E4DACB" strokeWidth="1" strokeDasharray="2 2" />
                      <path d="M42 28C42 16 46 10 50 10C54 10 58 16 58 28H42Z" fill="#B8862B" stroke="#8A6416" strokeWidth="1" />
                      <circle cx="50" cy="8" r="2.5" fill="#8A6416" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Mobile Approach Notice Preview */}
            <div className="lg:col-span-5">
              <NoticePreview />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * One fact inside the band, with visual artwork.
 */
function GuideNote({
  icon: Icon,
  title,
  body,
  visual,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  visual?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between p-5 sm:p-6">
      <div>
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border bg-surface-sunken text-primary shadow-sm"
          >
            <Icon size={20} strokeWidth={1.75} />
          </span>
          <dt className="text-base font-semibold text-text">{title}</dt>
        </div>
        <dd className="mt-2.5 text-sm leading-relaxed text-text-secondary">{body}</dd>
      </div>
      {visual && (
        <div className="mt-4 overflow-hidden rounded-lg border border-border/70 bg-surface-sunken/60">
          {visual}
        </div>
      )}
    </div>
  );
}
