"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Camera,
  MessageCircle,
  MapPin,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";
import { useTabAnimation } from "@/lib/useTabAnimation";

const AUTO_CYCLE_INTERVAL_MS = 5000;

export function InteractiveFeatures() {
  const { lang } = useLang();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // GSAP Tab transition for detail card payload
  const detailCardRef = useTabAnimation<HTMLDivElement>({
    trigger: activeIndex,
    selector: "[data-feature-animate]",
    y: 8,
    stagger: 0.04,
    duration: 0.28,
  });

  const features = [
    {
      id: "situation-check",
      icon: Camera,
      tagKey: "about_section.tag.vision" as const,
      titleKey: "about_section.check.title" as const,
      descKey: "about_section.check.desc" as const,
      actionKey: "about_section.action.check" as const,
      href: "/check",
      nodePosition: {
        desktop: "top-[8%] left-1/2 -translate-x-1/2",
      },
    },
    {
      id: "assistant",
      icon: MessageCircle,
      tagKey: "about_section.tag.assistant" as const,
      titleKey: "about_section.assistant.title" as const,
      descKey: "about_section.assistant.desc" as const,
      actionKey: "about_section.action.assistant" as const,
      href: "/assistant",
      nodePosition: {
        desktop: "bottom-[10%] left-[8%] sm:left-[10%]",
      },
    },
    {
      id: "zones",
      icon: MapPin,
      tagKey: "about_section.tag.zones" as const,
      titleKey: "about_section.zones.title" as const,
      descKey: "about_section.zones.desc" as const,
      actionKey: "about_section.action.explore" as const,
      href: "/explore",
      nodePosition: {
        desktop: "bottom-[10%] right-[8%] sm:right-[10%]",
      },
    },
  ] as const;

  const currentFeature = features[activeIndex];
  const CurrentIcon = currentFeature.icon;

  const handleSelect = useCallback((index: number) => {
    setActiveIndex(index);
    setProgress(0);
  }, []);

  // Auto-cycle timer with progress tick
  useEffect(() => {
    // Respect prefers-reduced-motion
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
          setActiveIndex((current) => (current + 1) % features.length);
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
  }, [isPaused, features.length]);

  return (
    <div
      className="w-full"
      role="region"
      aria-roledescription="interactive feature constellation"
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
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            const isActive = activeIndex === idx;
            return (
              <button
                key={feature.id}
                type="button"
                onClick={() => handleSelect(idx)}
                aria-selected={isActive}
                className={`group flex flex-col items-center justify-center gap-1.5 rounded-xl py-2.5 px-1 sm:py-3 sm:px-2 text-center transition-all duration-200 cursor-pointer active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus ${
                  isActive
                    ? "bg-surface text-primary shadow-sm border border-border"
                    : "text-text-secondary hover:bg-surface/50 hover:text-text"
                }`}
              >
                <div
                  className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg transition-colors duration-150 ${
                    isActive
                      ? "bg-primary text-primary-fg"
                      : "bg-surface-sunken text-text-secondary group-hover:text-primary"
                  }`}
                >
                  <Icon size={16} strokeWidth={1.75} aria-hidden className="sm:h-[18px] sm:w-[18px]" />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold leading-snug line-clamp-1">
                  {t(lang, feature.titleKey)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Column 60:40 Grid on Desktop (Left: 60% Constellation, Right: 40% Detail Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 lg:items-stretch">
        {/* Left Column (60% / col-span-7): Interactive Constellation Canvas */}
        <div className="relative hidden lg:flex lg:col-span-7 h-[360px] lg:h-full lg:min-h-[420px] w-full items-center justify-center overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
          {/* Balinese Topographic Landscape Illustration Background */}
          <Image
            src="/constellation-bg.png"
            alt=""
            fill
            aria-hidden="true"
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-center pointer-events-none select-none"
            priority
          />
          {/* Soft ambient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-surface/5" aria-hidden="true" />

          {/* Subtle Background Geometry & Accent Lines */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full stroke-border/80 z-10"
            aria-hidden="true"
          >
            {/* Outer & Inner Concentric Orbit Rings */}
            <circle
              cx="50%"
              cy="52%"
              r="140"
              fill="none"
              strokeDasharray="4 6"
              strokeWidth="1"
              className="opacity-40"
            />
            <circle
              cx="50%"
              cy="52%"
              r="88"
              fill="none"
              strokeWidth="1"
              className="opacity-50"
            />

            {/* Triangulation Constellation Lines to Nodes */}
            {/* Center to Top (Situation Check) */}
            <line
              x1="50%"
              y1="52%"
              x2="50%"
              y2="22%"
              strokeWidth={activeIndex === 0 ? "2" : "1"}
              className={`transition-colors duration-300 ${
                activeIndex === 0 ? "stroke-primary opacity-90" : "opacity-35"
              }`}
            />
            {/* Center to Bottom-Left (Assistant) */}
            <line
              x1="50%"
              y1="52%"
              x2="24%"
              y2="76%"
              strokeWidth={activeIndex === 1 ? "2" : "1"}
              className={`transition-colors duration-300 ${
                activeIndex === 1 ? "stroke-primary opacity-90" : "opacity-35"
              }`}
            />
            {/* Center to Bottom-Right (Zones) */}
            <line
              x1="50%"
              y1="52%"
              x2="76%"
              y2="76%"
              strokeWidth={activeIndex === 2 ? "2" : "1"}
              className={`transition-colors duration-300 ${
                activeIndex === 2 ? "stroke-primary opacity-90" : "opacity-35"
              }`}
            />
          </svg>

          {/* Central Hub Emblem with Official SASANA Logo */}
          <div className="relative z-10 flex flex-col items-center justify-center rounded-full border border-border bg-surface p-3.5 shadow-md">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-accent/10 p-2">
              <Image
                src="/sasana-logo.png"
                alt="SASANA Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
            </div>
            <span className="mt-1.5 font-display text-[10px] font-bold uppercase tracking-widest text-text">
              SASANA
            </span>
          </div>

          {/* 3 Satellite Interactive Feature Nodes */}
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            const isActive = activeIndex === idx;

            return (
              <button
                key={feature.id}
                type="button"
                onClick={() => handleSelect(idx)}
                aria-selected={isActive}
                aria-label={t(lang, feature.titleKey)}
                className={`group absolute z-20 flex items-center gap-3 rounded-2xl border p-2.5 transition-all duration-200 cursor-pointer active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus ${
                  feature.nodePosition.desktop
                } ${
                  isActive
                    ? "border-primary bg-surface shadow-md ring-2 ring-primary/20 scale-105"
                    : "border-border bg-surface/90 hover:border-primary/50 hover:bg-surface hover:-translate-y-1 hover:shadow-md hover:scale-[1.03]"
                }`}
              >
                <div
                  className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-150 ${
                    isActive
                      ? "border border-primary bg-primary text-primary-fg shadow-sm"
                      : "border border-border bg-surface-sunken text-text-secondary group-hover:border-primary/50 group-hover:bg-primary-tint group-hover:text-primary"
                  }`}
                >
                  <Icon size={20} strokeWidth={1.75} aria-hidden />

                  {/* Subtle radar beacon ping on inactive nodes to signal interactivity */}
                  {!isActive && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 pointer-events-none" aria-hidden="true">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
                    </span>
                  )}
                </div>

                <div className="text-left pr-2">
                  <span
                    className={`block text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      isActive ? "text-primary" : "text-text-muted group-hover:text-primary"
                    }`}
                  >
                    {t(lang, feature.tagKey)}
                  </span>
                  <span className="block text-xs font-semibold text-text transition-colors group-hover:text-primary">
                    {t(lang, feature.titleKey)}
                  </span>
                </div>

                {isActive && (
                  <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Column (40% / col-span-5): Shared Detail Card with GSAP Staggered Transition */}
        <div
          ref={detailCardRef}
          className="relative lg:col-span-5 flex flex-col justify-between rounded-3xl border border-border bg-surface p-5 sm:p-8 shadow-sm transition-all duration-300"
        >
          {/* Top Progress Track for 5s Auto-Cycle */}
          <div
            className="absolute inset-x-8 top-0 h-1 overflow-hidden rounded-b-full bg-border/40"
            aria-hidden="true"
          >
            <div
              className="h-full bg-primary transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div>
            {/* Top Row: Category Badge & Step Counter */}
            <div data-feature-animate className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-tint px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                <CurrentIcon size={13} strokeWidth={1.75} aria-hidden />
                <span>{t(lang, currentFeature.tagKey)}</span>
              </span>
              <span className="text-xs font-medium text-text-muted">
                {activeIndex + 1} / {features.length}
              </span>
            </div>

            {/* Feature Title */}
            <h3 data-feature-animate className="mt-5 font-display text-xl font-semibold text-text sm:text-2xl">
              {t(lang, currentFeature.titleKey)}
            </h3>

            {/* Feature Narrative Description */}
            <p data-feature-animate className="mt-3 text-sm text-text-secondary leading-relaxed sm:text-base">
              {t(lang, currentFeature.descKey)}
            </p>

            {/* Direct CTA Action Button */}
            <div data-feature-animate className="mt-6">
              <Link
                href={currentFeature.href}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-sunken px-4 py-2.5 text-xs font-semibold text-primary transition-all duration-150 hover:border-primary/50 hover:bg-primary hover:text-primary-fg hover:shadow-sm active:scale-[0.98]"
              >
                <span>{t(lang, currentFeature.actionKey)}</span>
                <ChevronRight size={15} strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </div>

          {/* Civic Authority Citation & About Link Footer Strip */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-border/70 pt-5 text-xs text-text-secondary">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent-strong border border-accent/20">
                <ShieldCheck size={14} strokeWidth={1.75} aria-hidden />
              </div>
              <span className="text-[11px] font-medium text-text-secondary">
                {lang === "id"
                  ? "Berdasarkan SE Gubernur Bali No. 7/2025"
                  : "Grounded in Bali Governor Circular No. 7/2025"}
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              <Link
                href="/about"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary-hover"
              >
                <span>{t(lang, "about_section.link_about")}</span>
                <ChevronRight size={14} strokeWidth={2} aria-hidden />
              </Link>

              {/* Step indicator dots */}
              <div className="flex items-center gap-1.5" aria-hidden>
                {features.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelect(i)}
                    aria-label={`Select feature ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-200 ${
                      activeIndex === i ? "w-6 bg-primary" : "w-2 bg-border-strong hover:bg-text-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
