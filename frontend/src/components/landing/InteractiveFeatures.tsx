"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Camera,
  MessageCircle,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Radio,
  Compass,
  Sparkles,
  Info,
} from "lucide-react";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";
import { CandiBentarIllustration } from "./CandiBentarIllustration";

const AUTO_CYCLE_INTERVAL_MS = 8000;

interface FeatureMeta {
  id: string;
  tagKey: "about_section.tag.vision" | "about_section.tag.assistant" | "about_section.tag.zones";
  titleKey: "about_section.check.title" | "about_section.assistant.title" | "about_section.zones.title";
  taglineKey: "about_section.check.tagline" | "about_section.assistant.tagline" | "about_section.zones.tagline";
  descKey: "about_section.check.desc" | "about_section.assistant.desc" | "about_section.zones.desc";
  actionKey: "about_section.action.check" | "about_section.action.assistant" | "about_section.action.explore";
  href: "/check" | "/assistant" | "/explore";
  icon: typeof Camera;
  badgeLabel: string;
}

const FEATURES: FeatureMeta[] = [
  {
    id: "vision",
    tagKey: "about_section.tag.vision",
    titleKey: "about_section.check.title",
    taglineKey: "about_section.check.tagline",
    descKey: "about_section.check.desc",
    actionKey: "about_section.action.check",
    href: "/check",
    icon: Camera,
    badgeLabel: "Situation Sensing",
  },
  {
    id: "assistant",
    tagKey: "about_section.tag.assistant",
    titleKey: "about_section.assistant.title",
    taglineKey: "about_section.assistant.tagline",
    descKey: "about_section.assistant.desc",
    actionKey: "about_section.action.assistant",
    href: "/assistant",
    icon: MessageCircle,
    badgeLabel: "SE No. 7/2025",
  },
  {
    id: "zones",
    tagKey: "about_section.tag.zones",
    titleKey: "about_section.zones.title",
    taglineKey: "about_section.zones.tagline",
    descKey: "about_section.zones.desc",
    actionKey: "about_section.action.explore",
    href: "/explore",
    icon: MapPin,
    badgeLabel: "Live Proximity Active",
  },
];

export function InteractiveFeatures() {
  const { lang } = useLang();
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSelect = useCallback((index: number) => {
    setFeaturedIndex(index);
    setProgress(0);
  }, []);

  // Auto-cycle timer with progress tick: advances featuredIndex when progress reaches 100
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;
    }

    if (isPaused) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      return;
    }

    const tickInterval = 50;
    const step = (tickInterval / AUTO_CYCLE_INTERVAL_MS) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setFeaturedIndex((current) => (current + 1) % FEATURES.length);
          return 0;
        }
        return prev + step;
      });
    }, tickInterval);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPaused]);

  const featured = FEATURES[featuredIndex];
  const FeaturedIcon = featured.icon;

  // The remaining 2 features for the secondary bottom cards
  const secondaryIndices = [
    (featuredIndex + 1) % FEATURES.length,
    (featuredIndex + 2) % FEATURES.length,
  ];

  return (
    <div
      className="w-full"
      role="region"
      aria-roledescription="Dynamic Bento Grid feature showcase"
      aria-label={t(lang, "about_section.title")}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {/* Mobile / Tablet Segmented Switcher (Visible on screens < lg) */}
      <div className="mb-6 lg:hidden">
        <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-border bg-surface-sunken/80 p-1.5 shadow-sm">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            const isCurrent = featuredIndex === idx;
            return (
              <button
                key={feat.id}
                type="button"
                onClick={() => handleSelect(idx)}
                aria-selected={isCurrent}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl py-2.5 px-1 text-center transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                  isCurrent
                    ? "bg-surface text-primary shadow-sm border border-border"
                    : "text-text-secondary hover:bg-surface/50 hover:text-text"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                    isCurrent ? "bg-primary text-primary-fg" : "bg-surface-sunken text-text-secondary"
                  }`}
                >
                  <Icon size={16} strokeWidth={1.75} aria-hidden />
                </div>
                <span className="text-[11px] font-semibold leading-snug line-clamp-1">
                  {t(lang, feat.tagKey)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bento Grid Architecture */}
      <div className="flex flex-col gap-6 sm:gap-8">
        {/* ── Top Hero Stage: Dynamic Featured Element ── */}
        <div
          key={`hero-stage-${featuredIndex}`}
          className="relative overflow-hidden rounded-3xl border border-primary/80 bg-surface shadow-md ring-2 ring-primary/20 transition-all duration-300 animate-fadeUp"
        >
          {/* Top Progress Track: Fills over 5s, loops to next element when full */}
          <div className="absolute inset-x-0 top-0 h-1.5 bg-border/40" aria-hidden="true">
            <div
              className="h-full bg-primary transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Column: Primary Feature Narrative & Direct CTA */}
            <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 lg:p-10 z-10">
              <div>
                {/* Eyebrow Badge & Indicator */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-strong border border-accent/25">
                    <FeaturedIcon size={13} strokeWidth={1.75} aria-hidden />
                    <span>{t(lang, featured.tagKey)}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-secondary">
                    <Radio size={12} strokeWidth={2} className="text-accent animate-pulse" />
                    <span>{featured.badgeLabel}</span>
                  </span>
                </div>

                {/* Main Feature Title */}
                <h3 className="mt-4 font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
                  {t(lang, featured.titleKey)}
                </h3>

                {/* Tagline */}
                <p className="mt-2 font-display text-sm sm:text-base font-semibold text-accent-strong tracking-wide">
                  {t(lang, featured.taglineKey)}
                </p>

                {/* Narrative Description */}
                <p className="mt-3 text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl">
                  {t(lang, featured.descKey)}
                </p>

                {/* Dynamic Bullets based on active feature */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-text-secondary">
                  {featuredIndex === 0 && (
                    <>
                      <div className="flex items-center gap-2 rounded-lg bg-surface-sunken/80 px-3 py-2 border border-border">
                        <ShieldCheck size={15} className="text-accent-strong shrink-0" strokeWidth={1.75} />
                        <span>Kamen & Selendang Verification</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-surface-sunken/80 px-3 py-2 border border-border">
                        <Sparkles size={15} className="text-accent-strong shrink-0" strokeWidth={1.75} />
                        <span>Instant Visual Respect Guidance</span>
                      </div>
                    </>
                  )}
                  {featuredIndex === 1 && (
                    <>
                      <div className="flex items-center gap-2 rounded-lg bg-surface-sunken/80 px-3 py-2 border border-border">
                        <ShieldCheck size={15} className="text-accent-strong shrink-0" strokeWidth={1.75} />
                        <span>Grounded in Circular No. 7/2025</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-surface-sunken/80 px-3 py-2 border border-border">
                        <Sparkles size={15} className="text-accent-strong shrink-0" strokeWidth={1.75} />
                        <span>Etiquette, Customs & Ceremony Meaning</span>
                      </div>
                    </>
                  )}
                  {featuredIndex === 2 && (
                    <>
                      <div className="flex items-center gap-2 rounded-lg bg-surface-sunken/80 px-3 py-2 border border-border">
                        <Compass size={15} className="text-accent-strong shrink-0" strokeWidth={1.75} />
                        <span>500m Approach Advance Notice</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-surface-sunken/80 px-3 py-2 border border-border">
                        <ShieldCheck size={15} className="text-accent-strong shrink-0" strokeWidth={1.75} />
                        <span>100m Sacred Zone Boundaries</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Button CTA */}
              <div className="mt-8 flex items-center gap-4">
                <Link
                  href={featured.href}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-fg shadow-sm transition-all duration-150 hover:bg-primary-hover active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                >
                  <span>{t(lang, featured.actionKey)}</span>
                  <ArrowRight size={16} strokeWidth={2} aria-hidden />
                </Link>

                <span className="text-xs text-text-muted hidden sm:inline">
                  {lang === "id" ? "Berdasarkan SE No. 7/2025" : "Grounded in Circular No. 7/2025"}
                </span>
              </div>
            </div>

            {/* Right Column: Dynamic Rich Visual Stage */}
            <div className="lg:col-span-5 relative flex items-center justify-center p-4 sm:p-6 lg:p-6 bg-surface-sunken/30 lg:border-l border-border/70 min-h-[280px] lg:min-h-[360px]">
              {/* Feature 0 Visual: Candi Bentar Gateway in Viewfinder */}
              {featuredIndex === 0 && (
                <div className="w-full h-full animate-fadeUp">
                  <CandiBentarIllustration />
                </div>
              )}

              {/* Feature 1 Visual: Balinese Etiquette Dialogue Stage (Matches SASANA Chat Design) */}
              {featuredIndex === 1 && (
                <div className="w-full max-w-md space-y-3.5 animate-fadeUp">
                  {/* User Question Bubble (Right-aligned, Blue background, White text) */}
                  <div className="flex items-start justify-end gap-2.5">
                    <div className="rounded-2xl rounded-tr-none bg-primary p-3.5 sm:p-4 text-xs sm:text-sm text-primary-fg font-medium leading-relaxed shadow-sm max-w-[85%]">
                      {t(lang, "about_section.dialog.user")}
                    </div>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 border border-primary/30 text-[11px] font-bold text-primary shadow-2xs">
                      Q
                    </div>
                  </div>

                  {/* Assistant Answer Bubble (Left-aligned, White surface background, Border) */}
                  <div className="flex items-start justify-start gap-2.5 pl-1">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface border border-accent/50 text-[11px] font-bold text-accent-strong shadow-2xs">
                      A
                    </div>
                    <div className="rounded-2xl rounded-tl-none bg-surface p-3.5 sm:p-4 border border-border text-xs sm:text-sm text-text leading-relaxed shadow-xs max-w-[90%]">
                      <p className="text-text font-normal">{t(lang, "about_section.dialog.bot")}</p>
                      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-border pt-2 text-[10px]">
                        <span className="font-mono font-semibold text-primary">{t(lang, "about_section.dialog.source")}</span>
                        <span className="flex items-center gap-1 font-sans text-text-muted">
                          <ShieldCheck size={12} className="text-accent-strong" />
                          <span>Verified</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Feature 2 Visual: Concentric Sacred Zone Radar Radar Stage */}
              {featuredIndex === 2 && (
                <div className="flex flex-col items-center justify-center text-center p-2 w-full animate-fadeUp">
                  <div className="relative flex h-40 w-40 sm:h-44 sm:w-44 items-center justify-center">
                    <svg
                      viewBox="0 0 160 160"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-full w-full"
                      aria-hidden="true"
                    >
                      {/* Outer Ring: Approach 500m */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        className="stroke-accent/40 animate-pulse"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      {/* Inner Ring: Sacred Zone 100m */}
                      <circle
                        cx="80"
                        cy="80"
                        r="42"
                        className="stroke-primary fill-primary/10"
                        strokeWidth="2"
                      />
                      {/* Pulsing Site Marker Center */}
                      <circle
                        cx="80"
                        cy="80"
                        r="14"
                        className="stroke-accent/60 fill-accent/15 animate-ping origin-center"
                        style={{ animationDuration: "2.5s" }}
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="8"
                        className="fill-accent-strong stroke-surface shadow-md"
                        strokeWidth="2.5"
                      />
                    </svg>
                  </div>

                  {/* Radius Legend & Distance Readout */}
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full border border-dashed border-accent-strong" />
                      <span className="text-[11px] font-medium text-text-secondary">
                        {t(lang, "about_section.zones.outer_label")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                      <span className="text-[11px] font-semibold text-text">
                        {t(lang, "about_section.zones.inner_label")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom Split Cards: The Remaining 2 Features (50:50 Desktop Grid) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {secondaryIndices.map((idx) => {
            const feat = FEATURES[idx];
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => handleSelect(idx)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`Switch to ${t(lang, feat.titleKey)}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(idx);
                  }
                }}
              >
                <div>
                  {/* Top Bar: Badge & "Click to swap to top" cue */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-sunken px-3 py-1 text-xs font-bold uppercase tracking-wider text-text-secondary border border-border group-hover:border-primary/30 group-hover:text-primary transition-colors">
                      <Icon size={13} strokeWidth={1.75} aria-hidden />
                      <span>{t(lang, feat.tagKey)}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <span>{lang === "id" ? "Tukar ke atas" : "Swap to stage"}</span>
                      <ArrowUpRight size={13} strokeWidth={2} />
                    </span>
                  </div>

                  {/* Card Title */}
                  <h4 className="mt-4 font-display text-lg sm:text-xl font-bold tracking-tight text-text group-hover:text-primary transition-colors">
                    {t(lang, feat.titleKey)}
                  </h4>

                  {/* Tagline */}
                  <p className="mt-1 font-display text-xs sm:text-sm font-semibold text-accent-strong">
                    {t(lang, feat.taglineKey)}
                  </p>

                  {/* Description summary */}
                  <p className="mt-2 text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-2">
                    {t(lang, feat.descKey)}
                  </p>
                </div>

                {/* Bottom Footer strip with direct link or promotion action */}
                <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-3.5">
                  <span className="text-[11px] text-text-muted">
                    {lang === "id" ? "Klik kartu untuk menaikkan" : "Click card to focus on top"}
                  </span>

                  <Link
                    href={feat.href}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary-hover p-1"
                  >
                    <span>{t(lang, feat.actionKey)}</span>
                    <ArrowRight size={13} strokeWidth={2} aria-hidden />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
