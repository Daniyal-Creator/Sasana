"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  ExternalLink,
  FileText,
  Lock,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Footer } from "@/components/layout/Footer";
import { DocumentViewerModal } from "@/components/about/DocumentViewerModal";
import { getLenis } from "@/components/providers/SmoothScroll";
import { useLang } from "@/lib/language";
import { t, type CopyKey } from "@/lib/i18n";
import { useScrollFadeUp } from "@/lib/useScrollFadeUp";
import { SITES, type Site } from "@/data/sites";
import { TEAM, type TeamMember } from "@/data/team";
import {
  HeroBottomSkyline,
  StoryBottomWatermark,
  PrinciplesBottomWatermark,
  CharterBottomWatermark,
  TeamBottomWatermark,
} from "@/components/about/BalineseWatermarks";

/* ─── Data Types & Definitions ───────────────────────────────────────────── */

interface PrincipleItem {
  num: string;
  titleKey: CopyKey;
  tagKey: CopyKey;
  descKey: CopyKey;
  footerKey: CopyKey;
}

const PRINCIPLES: PrincipleItem[] = [
  {
    num: "01",
    titleKey: "about.p1.title",
    tagKey: "about.p1.tag",
    descKey: "about.p1.desc",
    footerKey: "about.p1.footer",
  },
  {
    num: "02",
    titleKey: "about.p2.title",
    tagKey: "about.p2.tag",
    descKey: "about.p2.desc",
    footerKey: "about.p2.footer",
  },
  {
    num: "03",
    titleKey: "about.p3.title",
    tagKey: "about.p3.tag",
    descKey: "about.p3.desc",
    footerKey: "about.p3.footer",
  },
];

interface TimelineItem {
  phaseKey: CopyKey;
  titleKey: CopyKey;
  descKey: CopyKey;
  year: string;
  icon: typeof Compass;
  highlights: CopyKey[];
}

const TIMELINE: TimelineItem[] = [
  {
    phaseKey: "about.timeline.phase1.period",
    titleKey: "about.timeline.phase1.title",
    descKey: "about.timeline.phase1.desc",
    year: "2023–2024",
    icon: Compass,
    highlights: [
      "about.timeline.phase1.h1",
      "about.timeline.phase1.h2",
      "about.timeline.phase1.h3",
    ],
  },
  {
    phaseKey: "about.timeline.phase2.period",
    titleKey: "about.timeline.phase2.title",
    descKey: "about.timeline.phase2.desc",
    year: "Jan 2025",
    icon: ShieldCheck,
    highlights: [
      "about.timeline.phase2.h1",
      "about.timeline.phase2.h2",
      "about.timeline.phase2.h3",
    ],
  },
  {
    phaseKey: "about.timeline.phase3.period",
    titleKey: "about.timeline.phase3.title",
    descKey: "about.timeline.phase3.desc",
    year: "2025–Now",
    icon: Sparkles,
    highlights: [
      "about.timeline.phase3.h1",
      "about.timeline.phase3.h2",
      "about.timeline.phase3.h3",
    ],
  },
];

interface ImpactMetric {
  countKey: CopyKey;
  labelKey: CopyKey;
  subKey: CopyKey;
  icon: typeof MapPin;
}

const IMPACT_METRICS: ImpactMetric[] = [
  {
    countKey: "about.impact.sites_count",
    labelKey: "about.impact.sites_label",
    subKey: "about.impact.sites_sub",
    icon: MapPin,
  },
  {
    countKey: "about.impact.rules_count",
    labelKey: "about.impact.rules_label",
    subKey: "about.impact.rules_sub",
    icon: ShieldCheck,
  },
  {
    countKey: "about.impact.privacy_count",
    labelKey: "about.impact.privacy_label",
    subKey: "about.impact.privacy_sub",
    icon: Lock,
  },
];

/* ─── Sites Slider Data (Authentic project photographs) ──────────────────── */

const PREFERRED_SITE_ORDER = [
  "pura-besakih",
  "pura-tanah-lot",
  "pura-luhur-uluwatu",
  "pura-tirta-empul",
  "pura-batu-bolong",
  "pura-ulun-danu-beratan",
];

const SLIDER_SITES = SITES
  .filter((s): s is Site & { image: string } => !!s.image)
  .sort((a, b) => {
    const idxA = PREFERRED_SITE_ORDER.indexOf(a.id);
    const idxB = PREFERRED_SITE_ORDER.indexOf(b.id);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

/* ─── Decorative SVGs ───────────────────────────────────────────────────── */

function StarIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}






/* ─── Hero Sites Slider Component (5s Auto-Rotation) ─────────────────────── */

function HeroSitesSlider({
  decoRef,
  isMobile = false,
}: {
  decoRef?: RefObject<HTMLDivElement | null>;
  isMobile?: boolean;
}) {
  const { lang } = useLang();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide every 5 seconds (5000ms), pausing on hover/interaction & honoring reduced-motion
  useEffect(() => {
    if (isPaused) return;
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery.matches) return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDER_SITES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const currentSite = SLIDER_SITES[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + SLIDER_SITES.length) % SLIDER_SITES.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % SLIDER_SITES.length);
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(index);
  };

  if (isMobile) {
    return (
      <div
        className="hero-animate relative mt-5"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <Link
          href={`/explore?site=${currentSite.id}`}
          className="group block relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-surface-sunken shadow-sm"
          aria-label={`Jelajahi ${currentSite.name}`}
        >
          {SLIDER_SITES.map((site, index) => (
            <div
              key={site.id}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Image
                src={site.image}
                alt={site.name}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                priority={index === 0}
              />
            </div>
          ))}

          {/* Scrim Overlay */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[rgb(42,37,32)]/85 via-[rgb(42,37,32)]/25 to-transparent pointer-events-none" />

          {/* Top Counter & Explore Pill */}
          <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-0.5 font-mono text-[10px] font-medium text-white/95 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span>0{currentIndex + 1} / 0{SLIDER_SITES.length}</span>
          </div>

          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-0.5 text-[10px] font-medium text-white/95 backdrop-blur-md transition-colors group-hover:bg-primary">
            <span>{lang === "id" ? "Explore" : "Explore"}</span>
            <ArrowRight size={10} />
          </div>

          {/* Slide Tag & Content */}
          <div className="absolute inset-x-0 bottom-0 z-20 p-3.5 text-white">
            <div className="flex items-center gap-1.5 text-accent">
              <MapPin size={12} aria-hidden />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#e2b774]">
                {currentSite.region}
              </span>
            </div>
            <p className="mt-0.5 font-display text-base font-semibold leading-tight text-white">
              {currentSite.name}
            </p>
            <p className="mt-0.5 text-xs text-white/80 line-clamp-1">
              {currentSite.areaLabel[lang]}
            </p>
          </div>

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/35 text-white/90 backdrop-blur-sm transition active:scale-95"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/35 text-white/90 backdrop-blur-sm transition active:scale-95"
          >
            <ChevronRight size={14} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3.5 right-3.5 z-30 flex items-center gap-1">
            {SLIDER_SITES.map((site, index) => (
              <button
                key={site.id}
                type="button"
                onClick={(e) => handleDotClick(index, e)}
                aria-label={`Slide ${index + 1}: ${site.name}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-4 bg-[#e2b774]"
                    : "w-1.5 bg-white/40 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </Link>
      </div>
    );
  }

  // Desktop 55/45 Magazine Split-Hero Showcase (Clean without outer container)
  return (
    <div
      ref={decoRef}
      className="relative hidden select-none md:block"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Link
        href={`/explore?site=${currentSite.id}`}
        className="group block relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface-sunken shadow-md transition-all duration-300 hover:shadow-lg hover:border-accent/40"
        aria-label={`Jelajahi ${currentSite.name} di peta explore`}
      >
        {SLIDER_SITES.map((site, index) => (
          <div
            key={site.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={site.image}
              alt={site.name}
              fill
              sizes="(min-width: 1024px) 480px, 360px"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              priority={index === 0}
            />
          </div>
        ))}

        {/* Subtle warm photo scrim (Guardrails §2.2) */}
        <div
          className="absolute inset-0 z-10 bg-gradient-to-t from-[rgb(42,37,32)]/85 via-[rgb(42,37,32)]/20 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Top Bar Floating Badges Inside Image */}
        <div className="absolute top-3.5 inset-x-3.5 z-20 flex items-center justify-between pointer-events-none">
          {/* Slide Counter Badge */}
          <div className="flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-medium font-mono text-white/95 backdrop-blur-md pointer-events-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span>0{currentIndex + 1} / 0{SLIDER_SITES.length}</span>
          </div>

          {/* Quick Explore Hint Pill */}
          <div className="flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white/95 backdrop-blur-md transition-all duration-200 group-hover:bg-primary group-hover:text-primary-fg pointer-events-auto">
            <span>{lang === "id" ? "Buka di Explore" : "Explore on Map"}</span>
            <ArrowRight size={12} />
          </div>
        </div>

        {/* Overlay Content Tag */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-5 text-white">
          <div className="flex items-center gap-1.5 text-accent">
            <MapPin size={13} aria-hidden />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#e2b774]">
              {currentSite.region}
            </span>
          </div>
          <h3 className="mt-1 font-display text-xl font-semibold leading-tight text-white sm:text-2xl">
            {currentSite.name}
          </h3>
          <p className="mt-0.5 text-xs text-white/80 line-clamp-1 sm:text-sm">
            {currentSite.areaLabel[lang]}
          </p>
        </div>

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous temple"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-black/75 hover:scale-110 active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next temple"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-black/75 hover:scale-110 active:scale-95"
        >
          <ChevronRight size={18} />
        </button>

        {/* Progress Indicator Dots */}
        <div className="absolute bottom-5 right-5 z-30 flex items-center gap-1.5">
          {SLIDER_SITES.map((site, index) => (
            <button
              key={site.id}
              type="button"
              onClick={(e) => handleDotClick(index, e)}
              aria-label={`Slide ${index + 1}: ${site.name}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-5 bg-[#e2b774]"
                  : "w-1.5 bg-white/40 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </Link>
    </div>
  );
}

/* ─── Stacked Timeline Deck Component (Layered Perspective & Details) ─── */

function StackedTimelineDeck() {
  const { lang } = useLang();
  const [activePhase, setActivePhase] = useState(0);
  const [isNudging, setIsNudging] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);

  // Subtle peek / nudge animation when scrolled into viewport
  useEffect(() => {
    const el = deckRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNudging(true);
          const timer = setTimeout(() => setIsNudging(false), 900);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const currentItem = TIMELINE[activePhase];

  const handleCardClick = (index: number) => {
    if (index === activePhase) {
      setActivePhase((prev) => (prev + 1) % TIMELINE.length);
    } else {
      setActivePhase(index);
    }
  };

  const handleNext = () => {
    setActivePhase((prev) => (prev + 1) % TIMELINE.length);
  };

  return (
    <div
      ref={deckRef}
      className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[44fr_56fr] lg:gap-12"
    >
      {/* ── Sisi Kiri: Story Compact + Layered Perspective Deck ─── */}
      <div className="flex flex-col">
        {/* Compact Foundation Story */}
        <div className="story-animate">
          <span className="block text-[11px] font-bold uppercase tracking-widest text-accent-strong sm:text-xs">
            {t(lang, "about.story.eyebrow")}
          </span>
          <h2
            id="story-heading"
            className="mt-1 font-display text-2xl font-semibold tracking-tight text-text sm:text-h2"
          >
            {t(lang, "about.story.title")}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary sm:text-sm">
            {t(lang, "about.story.body_compact")}
          </p>
        </div>

        {/* Hairline Divider & Chronology Sub-Header */}
        <div className="story-animate mt-5 border-t border-border/70 pt-4 sm:mt-6 sm:pt-5">
          <div className="mb-3 flex items-center justify-between gap-2 px-0.5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent-strong sm:text-[11px]">
                {t(lang, "about.timeline.eyebrow")}
              </span>
              <h3 className="font-display text-base font-semibold text-text sm:text-lg">
                {t(lang, "about.timeline.title")}
              </h3>
            </div>
            {/* Subtle Hint Cue */}
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-medium text-accent-strong sm:text-[11px]">
                {t(lang, "about.timeline.tap_hint")}
              </span>
            </div>
          </div>
        </div>

        {/* Stacked Cards Area */}
        <div className="relative h-[250px] sm:h-[265px] w-full select-none">
          {TIMELINE.map((item, index) => {
            const offset = (index - activePhase + TIMELINE.length) % TIMELINE.length;
            const ItemIcon = item.icon;
            const isActive = offset === 0;

            let transformStyle = "";
            let zIndex = 10;
            let opacity = 0.7;
            let borderClass = "border-border/80 bg-surface-sunken";
            let shadowClass = "shadow-sm";

            if (offset === 0) {
              zIndex = 30;
              opacity = 1;
              borderClass = "border-accent/60 bg-surface ring-1 ring-accent/20";
              shadowClass = "shadow-lg";
              transformStyle = "translate3d(0px, 0px, 0px) scale(1) rotate(0deg)";
            } else if (offset === 1) {
              zIndex = 20;
              opacity = 0.9;
              borderClass = "border-border bg-surface";
              shadowClass = "shadow-md";
              transformStyle = isNudging
                ? "translate3d(18px, 18px, 0px) scale(0.96) rotate(3.5deg)"
                : "translate3d(12px, 14px, 0px) scale(0.96) rotate(1.5deg)";
            } else {
              zIndex = 10;
              opacity = 0.75;
              borderClass = "border-border/70 bg-surface-sunken";
              shadowClass = "shadow-sm";
              transformStyle = isNudging
                ? "translate3d(32px, 32px, 0px) scale(0.92) rotate(6.5deg)"
                : "translate3d(24px, 26px, 0px) scale(0.92) rotate(3deg)";
            }

            return (
              <div
                key={item.year}
                onClick={() => handleCardClick(index)}
                style={{
                  zIndex,
                  transform: transformStyle,
                  opacity,
                }}
                className={`absolute inset-x-0 top-0 h-[210px] sm:h-[225px] cursor-pointer rounded-2xl border p-5 sm:p-6 transition-all duration-500 ease-out hover:scale-[1.01] hover:-translate-y-1 ${borderClass} ${shadowClass}`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-border bg-surface-sunken px-2.5 py-0.5 font-mono text-[10px] font-bold text-accent-strong">
                      {item.year}
                    </span>
                    <span className="text-[11px] font-semibold text-text-muted">
                      {t(lang, item.phaseKey)}
                    </span>
                  </div>

                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-tint text-primary">
                    <ItemIcon size={14} strokeWidth={1.75} aria-hidden />
                  </div>
                </div>

                {/* Card Title */}
                <h4 className="mt-3 font-display text-base font-semibold leading-snug text-text sm:text-lg">
                  {t(lang, item.titleKey)}
                </h4>

                {/* Snippet preview */}
                <p className="mt-2 text-xs leading-relaxed text-text-secondary line-clamp-2">
                  {t(lang, item.descKey)}
                </p>

                {/* Card Bottom Indicator */}
                <div className="mt-3.5 flex items-center justify-between border-t border-border/60 pt-2.5 text-[10px] text-text-muted">
                  {isActive ? (
                    <span className="font-semibold text-accent-strong flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Babak Aktif · Klik untuk ganti
                    </span>
                  ) : (
                    <span className="text-text-muted hover:text-text">
                      Klik untuk membuka
                    </span>
                  )}
                  <span className="font-mono">0{index + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Sisi Kanan: Editorial Detail Card ────────────────────── */}
      <div className="relative rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-md">
        {/* Top Monogram & Phase Header */}
        <div className="flex items-start justify-between border-b border-border pb-5">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-accent-strong">
              {currentItem.year} · {t(lang, currentItem.phaseKey)}
            </span>
            <h4 className="mt-2 font-display text-xl font-semibold leading-tight text-text sm:text-2xl">
              {t(lang, currentItem.titleKey)}
            </h4>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="font-display text-4xl font-bold text-accent-strong/80 sm:text-5xl">
              0{activePhase + 1}
            </span>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="mt-5">
          <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
            {t(lang, currentItem.descKey)}
          </p>
        </div>

        {/* Key Highlights / Impacts */}
        <div className="mt-6 rounded-xl border border-border/70 bg-surface-sunken/50 p-4 sm:p-5">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-accent-strong">
            Poin Sorotan & Dampak
          </span>
          <div className="mt-3 space-y-2.5">
            {currentItem.highlights.map((highlightKey) => (
              <div key={highlightKey} className="flex items-start gap-2.5">
                <CheckCircle2
                  size={15}
                  className="mt-0.5 shrink-0 text-accent-strong"
                  aria-hidden
                />
                <span className="text-xs text-text sm:text-sm leading-relaxed">
                  {t(lang, highlightKey)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Progress Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {TIMELINE.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhase(idx)}
                aria-label={`Buka Babak 0${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activePhase
                    ? "w-6 bg-accent"
                    : "w-2 bg-border hover:bg-border-strong"
                }`}
              />
            ))}
            <span className="ml-2 font-mono text-xs text-text-muted">
              Babak {activePhase + 1} dari {TIMELINE.length}
            </span>
          </div>

          {/* Next Chapter Button */}
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-surface-sunken px-4 py-2 text-xs font-semibold text-accent-strong transition-all duration-200 hover:bg-accent hover:text-surface active:scale-95 shadow-sm"
          >
            <span>{t(lang, "about.timeline.next_phase")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page Component ─────────────────────────────────────────────────────── */

export default function AboutPage() {
  const { lang } = useLang();

  const [activePrincipleIndex, setActivePrincipleIndex] = useState<number>(0);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const principlesTrackRef = useRef<HTMLDivElement>(null);

  // Scroll animations per section (M1-M5 compliant)
  const heroTextRef = useScrollFadeUp<HTMLDivElement>({
    selector: ".hero-animate",
    stagger: 0.06,
    y: 12,
    duration: 0.35,
  });

  const heroDecoRef = useScrollFadeUp<HTMLDivElement>({
    y: 8,
    duration: 0.45,
  });

  const impactRef = useScrollFadeUp<HTMLDivElement>({
    selector: ".impact-animate",
    stagger: 0.06,
    y: 10,
    duration: 0.35,
  });

  const storyRef = useScrollFadeUp<HTMLElement>({
    selector: ".story-animate",
    stagger: 0.06,
    y: 12,
    duration: 0.35,
  });

  const principlesRef = useScrollFadeUp<HTMLElement>({
    selector: ".principle-animate",
    stagger: 0.06,
    y: 12,
    duration: 0.35,
  });

  const foundationRef = useScrollFadeUp<HTMLElement>({
    selector: ".foundation-animate",
    stagger: 0.06,
    y: 12,
    duration: 0.35,
  });

  const teamRef = useScrollFadeUp<HTMLElement>({
    selector: ".team-animate",
    stagger: 0.06,
    y: 12,
    duration: 0.35,
  });




  // Handle URL hash navigation (e.g. /about#source from footer)
  useEffect(() => {
    const handleHash = () => {
      const rawHash = window.location.hash.replace("#", "");
      if (!rawHash) return;
      const targetId =
        rawHash === "rules" || rawHash === "privacy" || rawHash === "charter" ? "source" : rawHash;
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          const yOffset = -90;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          const lenis = getLenis();
          if (lenis) {
            lenis.scrollTo(y);
          } else {
            const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
          }
        }, 150);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Handle mobile principles scroll-snap tracking
  const handlePrinciplesScroll = () => {
    const track = principlesTrackRef.current;
    if (!track) return;
    const cardWidth = track.firstElementChild ? (track.firstElementChild as HTMLElement).offsetWidth + 14 : 300;
    const index = Math.round(track.scrollLeft / cardWidth);
    setActivePrincipleIndex(Math.min(Math.max(index, 0), PRINCIPLES.length - 1));
  };

  const scrollToPrinciple = (index: number) => {
    const track = principlesTrackRef.current;
    if (!track) return;
    const cardWidth = track.firstElementChild ? (track.firstElementChild as HTMLElement).offsetWidth + 14 : 300;
    track.scrollTo({ left: index * cardWidth, behavior: "smooth" });
    setActivePrincipleIndex(index);
  };



  return (
    <>
      <div className="relative flex-1 overflow-x-hidden bg-bg">


        <main className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">

          {/* ── 1. Hero: Magazine Split-Hero with 5s Sites Slider ──── */}
          <header
            id="hero"
            className="relative overflow-hidden pb-16 pt-6 sm:pb-20 sm:pt-12 lg:pb-24 lg:pt-16"
          >

            {/* Mobile Editorial Hero (< 768px) */}
            <div ref={heroTextRef} className="relative block md:hidden">
              
              <div className="hero-animate mb-3 flex items-center justify-center gap-1.5 text-accent-strong">
                <StarIcon className="h-3.5 w-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-widest">
                  {t(lang, "about.eyebrow")}
                </span>
              </div>

              <h1 className="hero-animate text-center font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                Memahami Bali dengan rasa{" "}
                <span className="text-accent-strong">hormat.</span>
              </h1>

              <p className="hero-animate mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-text-secondary">
                {t(lang, "about.tagline")}
              </p>

              {/* Mobile Hero 5s Sites Slider */}
              <HeroSitesSlider isMobile />
            </div>

            {/* Desktop 55/45 Magazine Split-Hero (≥ 768px) */}
            <div className="hidden md:grid md:grid-cols-[55fr_45fr] md:items-center md:gap-10">
              <div className="max-w-prose">
                <div className="hero-animate inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent-strong shadow-sm">
                  <StarIcon className="h-3 w-3" />
                  <span>{t(lang, "about.eyebrow")}</span>
                </div>
                <h1 className="hero-animate mt-4 whitespace-pre-line font-display text-display font-semibold tracking-tight text-text lg:text-hero">
                  {t(lang, "about.title")}
                </h1>
                <p className="hero-animate mt-5 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
                  {t(lang, "about.tagline")}
                </p>
                <div className="hero-animate mt-6 h-px w-full bg-border" />
                <div className="hero-animate mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
                  <span>{t(lang, "about.meta")}</span>
                  <span>{t(lang, "about.version")}</span>
                </div>
              </div>

              {/* Framed 5-Second Auto-Rotating Sites Slider */}
              <HeroSitesSlider decoRef={heroDecoRef} />
            </div>

            {/* ── Quick Impact & Pillars Ribbon ─────────────────────── */}
            <div
              ref={impactRef}
              className="relative z-10 mt-8 rounded-2xl border border-border bg-surface shadow-sm sm:mt-12"
            >
              <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {IMPACT_METRICS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.labelKey}
                      className="impact-animate flex items-center gap-4 p-4 sm:p-5"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-sunken text-accent-strong">
                        <Icon size={20} strokeWidth={1.75} aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-display text-xl font-bold tracking-tight text-text sm:text-2xl">
                            {t(lang, item.countKey)}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-text">
                          {t(lang, item.labelKey)}
                        </p>
                        <p className="text-[11px] text-text-muted">
                          {t(lang, item.subKey)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <HeroBottomSkyline />
          </header>

          <SectionDivider />

          {/* ── 2. Our Story & Origin Timeline (Unified Chronology Container) ── */}
          <section
            id="story"
            ref={storyRef}
            aria-labelledby="story-heading"
            className="relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24 scroll-mt-24"
          >
            <div className="relative z-10 rounded-2xl border border-border bg-surface-sunken/40 p-5 sm:p-8 lg:p-10">
              <StackedTimelineDeck />
            </div>
            <StoryBottomWatermark />
          </section>

          <SectionDivider />

          {/* ── 3. Principles: Editorial Pillars ──────────────────── */}
          <section
            id="principles"
            ref={principlesRef}
            aria-labelledby="principles-heading"
            className="relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24 scroll-mt-24"
          >
            <div className="principle-animate">
              <span className="block text-[11px] font-bold uppercase tracking-widest text-accent-strong sm:text-xs">
                {t(lang, "about.principles.eyebrow")}
              </span>
              <h2
                id="principles-heading"
                className="mt-2 font-display text-2xl font-semibold tracking-tight text-text sm:mt-3 sm:text-h1"
              >
                {t(lang, "about.principles.title")}
              </h2>
            </div>

            {/* Mobile Touch Horizontal Scroll-Snap Slider (< 768px) */}
            <div className="mt-6 block md:hidden">
              <div
                ref={principlesTrackRef}
                onScroll={handlePrinciplesScroll}
                className="no-scrollbar -mx-4 flex gap-3.5 overflow-x-auto px-4 py-2"
                style={{ scrollSnapType: "x mandatory" }}
              >
                {PRINCIPLES.map(({ num, titleKey, tagKey, descKey, footerKey }) => (
                  <div
                    key={titleKey}
                    className="flex-none w-[calc(100vw-48px)] max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-sm"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-3xl font-semibold text-accent-strong">
                        {num}
                      </span>
                      <span className="rounded-full border border-border bg-surface-sunken px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-strong">
                        {t(lang, tagKey)}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-semibold text-text">
                      {t(lang, titleKey)}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-text-secondary sm:text-sm">
                      {t(lang, descKey)}
                    </p>
                    <div className="mt-4 border-t border-border pt-3 text-[11px] font-medium text-text-muted">
                      {t(lang, footerKey)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Indicator and Dots */}
              <div className="mt-4 flex items-center justify-between px-1 text-xs text-text-muted">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-accent-strong">
                    0{activePrincipleIndex + 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {PRINCIPLES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => scrollToPrinciple(i)}
                        aria-label={`Jump to principle 0${i + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-200 ${
                          activePrincipleIndex === i
                            ? "w-6 bg-accent"
                            : "w-1.5 bg-border hover:bg-border-strong"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[11px] text-text-muted">
                  {t(lang, "about.principles.swipe_hint")}
                </span>
              </div>
            </div>

            {/* Desktop 3-Column Structured Editorial Pillars (≥ 768px) */}
            <div className="mt-8 hidden grid-cols-1 gap-6 md:grid md:grid-cols-3">
              {PRINCIPLES.map(({ num, titleKey, tagKey, descKey, footerKey }) => (
                <div
                  key={titleKey}
                  className="principle-animate group flex flex-col justify-between rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:border-accent/50 hover:shadow-md sm:p-7"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-3xl font-bold text-accent-strong/80 transition-colors group-hover:text-accent-strong">
                        {num}
                      </span>
                      <span className="rounded-full border border-border bg-surface-sunken px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-strong">
                        {t(lang, tagKey)}
                      </span>
                    </div>

                    <h3 className="mt-4 font-display text-lg font-semibold text-text sm:text-xl">
                      {t(lang, titleKey)}
                    </h3>
                    <p className="mt-2.5 text-xs leading-relaxed text-text-secondary sm:text-sm">
                      {t(lang, descKey)}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-border pt-4 text-[11px] font-medium text-text-muted">
                    {t(lang, footerKey)}
                  </div>
                </div>
              ))}
            </div>
            <PrinciplesBottomWatermark />
          </section>

          <SectionDivider />

          {/* ── 4. Cultural Charter: Official Foundation & Privacy ─── */}
          <section
            id="source"
            ref={foundationRef}
            aria-labelledby="charter-heading"
            className="relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24 scroll-mt-24"
          >
            <span id="charter" className="sr-only" />
            <span id="rules" className="sr-only" />
            <span id="privacy" className="sr-only" />
            <div className="foundation-animate">
              <span className="block text-[11px] font-bold uppercase tracking-widest text-accent-strong sm:text-xs">
                {t(lang, "about.charter.eyebrow")}
              </span>
              <h2
                id="charter-heading"
                className="mt-2 font-display text-2xl font-semibold tracking-tight text-text sm:mt-3 sm:text-h1"
              >
                {t(lang, "about.charter.title")}
              </h2>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-text-secondary sm:text-base">
                {t(lang, "about.charter.subtitle")}
              </p>
            </div>

            {/* Unified Cultural Integrity Card */}
            <div className="relative mt-6 overflow-hidden rounded-2xl border border-border bg-surface-sunken/60 p-6 sm:mt-8 sm:p-8 lg:p-10 shadow-sm">
              {/* Decorative Watermark Number 07 */}
              <span
                className="pointer-events-none absolute -right-3 -top-6 select-none font-display text-8xl font-bold text-text opacity-[0.04] sm:text-9xl"
                aria-hidden="true"
              >
                07
              </span>

              <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                {/* Left Panel: Bali Governor Circular No. 7/2025 */}
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-accent-strong">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-accent-strong">
                        <ShieldCheck size={20} strokeWidth={1.75} aria-hidden />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-accent-strong">
                        {t(lang, "about.rules.eyebrow")}
                      </span>
                    </div>

                    <h3 className="mt-4 font-display text-lg font-semibold text-text sm:text-xl">
                      {t(lang, "about.rules.subtitle")}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-text-secondary sm:text-sm">
                      {t(lang, "about.rules.body")}
                    </p>

                    <div className="mt-4 space-y-2 text-xs text-text">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-status-ok-fg shrink-0" aria-hidden />
                        <span>Penjagaan kesucian kawasan pura (Utama, Madya, Nista Mandala)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-status-ok-fg shrink-0" aria-hidden />
                        <span>Kewajiban tata busana adat sopan (kamen & selendang)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-status-ok-fg shrink-0" aria-hidden />
                        <span>Penghormatan ritual dan upacara keagamaan masyarakat Bali</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/80">
                    {/* Desktop: triggers DocumentViewerModal with Paras Cream & Prada Gold Button */}
                    <div className="hidden md:block">
                      <button
                        type="button"
                        aria-haspopup="dialog"
                        onClick={() => setIsDocModalOpen(true)}
                        className="group inline-flex items-center gap-2.5 rounded-xl border border-accent/40 bg-surface px-5 py-3 text-sm font-semibold text-text shadow-sm transition-all duration-200 ease-out hover:border-accent hover:text-accent-strong hover:shadow-md active:scale-[0.98] focus-visible:shadow-focus cursor-pointer select-none"
                      >
                        <FileText size={18} strokeWidth={2} className="text-accent shrink-0 transition-colors duration-200 group-hover:text-accent-strong" aria-hidden />
                        <span className="font-display tracking-wide">{t(lang, "about.rules.view_doc")}</span>
                        <ArrowRight
                          size={16}
                          strokeWidth={2}
                          className="text-accent shrink-0 transition-all duration-200 ease-out group-hover:text-accent-strong group-hover:translate-x-1"
                          aria-hidden
                        />
                      </button>
                    </div>

                    {/* Mobile: opens native PDF reader directly, with government portal link neatly beneath */}
                    <div className="flex flex-col items-start gap-3 md:hidden w-full">
                      <a
                        href="/docs/SE_Gubernur_Bali_No_7_Tahun_2025.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex w-full items-center justify-between gap-3 rounded-xl border border-accent/40 bg-surface px-4 py-3 text-sm font-semibold text-text shadow-sm transition-all duration-200 ease-out hover:border-accent hover:text-accent-strong hover:shadow-md active:scale-[0.98] focus-visible:shadow-focus select-none"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText size={18} strokeWidth={2} className="text-accent shrink-0 transition-colors duration-200 group-hover:text-accent-strong" aria-hidden />
                          <span className="font-display tracking-wide truncate">
                            {t(lang, "about.rules.view_doc")}
                          </span>
                        </div>
                        <ArrowRight
                          size={16}
                          strokeWidth={2}
                          className="text-accent shrink-0 transition-all duration-200 ease-out group-hover:text-accent-strong group-hover:translate-x-1"
                          aria-hidden
                        />
                      </a>

                      <Button
                        variant="ghost"
                        size="sm"
                        icon={ExternalLink}
                        iconPosition="trailing"
                        href="https://www.baliprov.go.id"
                        external
                        className="text-text-secondary hover:text-primary px-1 text-xs"
                      >
                        {t(lang, "about.rules.link")}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Strict On-Device Privacy Commitment */}
                <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-sm">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-sunken text-primary">
                          <Lock size={18} strokeWidth={1.75} aria-hidden />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                          {t(lang, "about.privacy.eyebrow")}
                        </span>
                      </div>
                      <span className="rounded-full border border-border bg-surface-sunken px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        {t(lang, "about.privacy.badge")}
                      </span>
                    </div>

                    <h3 className="mt-4 font-display text-lg font-semibold text-text sm:text-xl">
                      {t(lang, "about.privacy.title")}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-text-secondary sm:text-sm">
                      {t(lang, "about.privacy.body")}
                    </p>

                    <div className="mt-4 space-y-2 text-xs text-text">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-status-ok-fg shrink-0" aria-hidden />
                        <span>Analisis visual sementara di memori lokal (RAM)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-status-ok-fg shrink-0" aria-hidden />
                        <span>Tidak ada penyimpanan citra ke server maupun basis data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-status-ok-fg shrink-0" aria-hidden />
                        <span>Menjamin kenyamanan dan rasa aman pengunjung</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-border text-[11px] text-text-muted">
                    SASANA Zero-Trace Privacy Architecture
                  </div>
                </div>
              </div>
            </div>
            <CharterBottomWatermark />
          </section>

          <SectionDivider />

          {/* ── 5. Team: Curatorial Dossier Cards ──────────────────── */}
          <section
            id="team"
            ref={teamRef}
            aria-labelledby="team-heading"
            className="relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24 scroll-mt-24"
          >
            <div className="relative z-10 team-animate">
              <span className="block text-[11px] font-bold uppercase tracking-widest text-accent-strong sm:text-xs">
                {t(lang, "about.team.eyebrow")}
              </span>
              <h2
                id="team-heading"
                className="mt-2 font-display text-2xl font-semibold tracking-tight text-text sm:mt-3 sm:text-h1"
              >
                {t(lang, "about.team.title")}
              </h2>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-text-secondary sm:text-base">
                {t(lang, "about.team.subtitle")}
              </p>
            </div>

            {/* 3-Column Structured Dossier Profile Cards */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {TEAM.map((member) => (
                <div
                  key={member.name}
                  className="team-animate group relative flex flex-col justify-between rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:border-accent/50 hover:shadow-md"
                >
                  <div>
                    {/* Role Tag (Top-right absolute) */}
                    <span className="absolute top-6 right-6 rounded-full border border-border bg-surface-sunken px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      {member.tag}
                    </span>

                    {/* Monogram Avatar / Photo */}
                    <div className="relative flex h-[105px] w-[105px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-accent/40 bg-surface-sunken font-display text-2xl font-bold text-accent-strong shadow-sm transition-all duration-300 group-hover:border-accent group-hover:shadow-md">
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={105}
                          height={105}
                          className="h-full w-full object-cover object-top scale-105 transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        member.initials
                      )}
                    </div>

                    <h3 className="mt-4 font-display text-lg font-semibold text-text transition-colors group-hover:text-primary sm:text-xl">
                      {member.name}
                    </h3>
                    <p className="text-xs font-semibold text-primary">
                      {t(lang, member.roleKey)}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-accent-strong">
                      {t(lang, member.focusKey)}
                    </p>

                    <p className="mt-3 text-xs leading-relaxed text-text-secondary sm:text-sm">
                      {t(lang, member.descKey)}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-border pt-3 text-[11px] text-text-muted">
                    {t(lang, "about.team.org")}
                  </div>
                </div>
              ))}
            </div>
            <TeamBottomWatermark />
          </section>



        </main>
      </div>
      <DocumentViewerModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
      />
      <Footer />
    </>
  );
}
