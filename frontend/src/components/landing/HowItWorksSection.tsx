"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Camera,
  MessageCircle,
  MapPin,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { gsap } from "gsap";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

export function HowItWorksSection() {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<"check" | "assistant" | "zones">("check");
  const [displayedTab, setDisplayedTab] = useState<"check" | "assistant" | "zones">("check");

  const tabNavRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const indicatorRef = useRef<HTMLDivElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const featureJourneys = {
    check: {
      id: "check",
      icon: Camera,
      labelKey: "how.feature.check" as const,
      categoryKey: "how.category.check" as const,
      ctaKey: "how.cta.check" as const,
      href: "/check",
      steps: [
        {
          number: "01",
          icon: Camera,
          titleKey: "how.check.step1" as const,
          descKey: "how.check.step1.desc" as const,
        },
        {
          number: "02",
          icon: Sparkles,
          titleKey: "how.check.step2" as const,
          descKey: "how.check.step2.desc" as const,
        },
        {
          number: "03",
          icon: ShieldCheck,
          titleKey: "how.check.step3" as const,
          descKey: "how.check.step3.desc" as const,
        },
      ],
    },
    assistant: {
      id: "assistant",
      icon: MessageCircle,
      labelKey: "how.feature.assistant" as const,
      categoryKey: "how.category.assistant" as const,
      ctaKey: "how.cta.assistant" as const,
      href: "/assistant",
      steps: [
        {
          number: "01",
          icon: MessageCircle,
          titleKey: "how.assistant.step1" as const,
          descKey: "how.assistant.step1.desc" as const,
        },
        {
          number: "02",
          icon: ShieldCheck,
          titleKey: "how.assistant.step2" as const,
          descKey: "how.assistant.step2.desc" as const,
        },
        {
          number: "03",
          icon: Sparkles,
          titleKey: "how.assistant.step3" as const,
          descKey: "how.assistant.step3.desc" as const,
        },
      ],
    },
    zones: {
      id: "zones",
      icon: MapPin,
      labelKey: "how.feature.zones" as const,
      categoryKey: "how.category.zones" as const,
      ctaKey: "how.cta.zones" as const,
      href: "/explore",
      steps: [
        {
          number: "01",
          icon: MapPin,
          titleKey: "how.zones.step1" as const,
          descKey: "how.zones.step1.desc" as const,
        },
        {
          number: "02",
          icon: Sparkles,
          titleKey: "how.zones.step2" as const,
          descKey: "how.zones.step2.desc" as const,
        },
        {
          number: "03",
          icon: ShieldCheck,
          titleKey: "how.zones.step3" as const,
          descKey: "how.zones.step3.desc" as const,
        },
      ],
    },
  } as const;

  const currentJourney = featureJourneys[displayedTab];
  const JourneyIcon = currentJourney.icon;

  // 1. Sliding Tab Indicator Animation
  const updateTabIndicator = useCallback((immediate = false) => {
    const btn = tabRefs.current[activeTab];
    const nav = tabNavRef.current;
    const indicator = indicatorRef.current;
    if (!btn || !nav || !indicator) return;

    // offsetLeft and offsetWidth guarantee exact positioning inside the relative track
    const left = btn.offsetLeft;
    const width = btn.offsetWidth;

    if (immediate) {
      gsap.set(indicator, { x: left, width, opacity: 1 });
    } else {
      gsap.to(indicator, {
        x: left,
        width,
        opacity: 1,
        duration: 0.28,
        ease: "power2.out",
      });
    }
  }, [activeTab]);

  useEffect(() => {
    updateTabIndicator(isInitialMount.current);
    const handleResize = () => updateTabIndicator(true);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateTabIndicator]);

  // 2. Two-Phase Sequential Transition: Exit -> State Swap -> Sequential Entrance
  useEffect(() => {
    if (activeTab === displayedTab) return;

    // Check prefers-reduced-motion
    if (typeof window !== "undefined") {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) {
        setDisplayedTab(activeTab);
        return;
      }
    }

    const container = contentContainerRef.current;
    if (!container) {
      setDisplayedTab(activeTab);
      return;
    }

    // Phase 1: Fast exit of existing content
    const exitElements = container.querySelectorAll("[data-animate-exit]");
    gsap.killTweensOf(exitElements.length ? exitElements : container);

    gsap.to(exitElements.length ? exitElements : container, {
      opacity: 0,
      y: -6,
      duration: 0.1,
      ease: "power2.in",
      onComplete: () => {
        setDisplayedTab(activeTab);
      },
    });
  }, [activeTab, displayedTab]);

  // Phase 2: Sequential Entrance Animation on Displayed Tab
  useEffect(() => {
    const container = contentContainerRef.current;
    if (!container) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Check prefers-reduced-motion
    if (typeof window !== "undefined") {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      // Reset container opacity
      gsap.set(container, { opacity: 1, y: 0 });

      // Desktop Sequential Timeline: Step 1 -> Line 1 -> Step 2 -> Line 2 -> Step 3 -> Footer
      tl.fromTo(
        "[data-step-desktop='0']",
        { opacity: 0, y: 10, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.15 }
      )
        .fromTo(
          "[data-line-desktop='0']",
          { scaleX: 0, transformOrigin: "left" },
          { scaleX: 1, duration: 0.12 },
          "-=0.04"
        )
        .fromTo(
          "[data-step-desktop='1']",
          { opacity: 0, y: 10, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.15 },
          "-=0.04"
        )
        .fromTo(
          "[data-line-desktop='1']",
          { scaleX: 0, transformOrigin: "left" },
          { scaleX: 1, duration: 0.12 },
          "-=0.04"
        )
        .fromTo(
          "[data-step-desktop='2']",
          { opacity: 0, y: 10, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.15 },
          "-=0.04"
        );

      // Mobile Sequential Timeline (Vertical)
      tl.fromTo(
        "[data-step-mobile='0']",
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.14 },
        0
      )
        .fromTo(
          "[data-line-mobile='0']",
          { scaleY: 0, transformOrigin: "top" },
          { scaleY: 1, duration: 0.12 },
          0.08
        )
        .fromTo(
          "[data-step-mobile='1']",
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.14 },
          0.14
        )
        .fromTo(
          "[data-line-mobile='1']",
          { scaleY: 0, transformOrigin: "top" },
          { scaleY: 1, duration: 0.12 },
          0.22
        )
        .fromTo(
          "[data-step-mobile='2']",
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.14 },
          0.28
        );

      // Footer entrance
      tl.fromTo(
        "[data-footer-animate]",
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.15 },
        "-=0.08"
      );
    }, container);

    return () => ctx.revert();
  }, [displayedTab]);

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 sm:p-10 lg:p-12 shadow-sm transition-all duration-200">
      {/* Section Header */}
      <div className="max-w-xl">
        <span className="text-[11px] font-bold uppercase tracking-wider text-accent-strong">
          {lang === "id" ? "PANDUAN LANGKAH" : "STEP-BY-STEP"}
        </span>
        <h2 className="mt-2 font-display text-h2 font-semibold text-text">
          {t(lang, "how.title")}
        </h2>
        <p className="mt-2 text-sm text-text-secondary sm:text-base leading-relaxed">
          {t(lang, "how.subtitle")}
        </p>
      </div>

      {/* Minimalist Feature Selector Tabs with Sliding Indicator */}
      <div className="mt-8 relative border-b border-border/80">
        <div
          ref={tabNavRef}
          className="flex gap-3 sm:gap-8 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 relative"
        >
          {(["check", "assistant", "zones"] as const).map((tabKey) => {
            const item = featureJourneys[tabKey];
            const Icon = item.icon;
            const isActive = activeTab === tabKey;

            return (
              <button
                key={tabKey}
                ref={(el) => {
                  tabRefs.current[tabKey] = el;
                }}
                type="button"
                onClick={() => setActiveTab(tabKey)}
                aria-selected={isActive}
                className={`group relative flex items-center gap-2 pb-3 px-1 text-xs sm:text-sm font-semibold transition-all duration-150 active:scale-[0.98] shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus ${
                  isActive
                    ? "text-primary font-bold"
                    : "text-text-muted hover:text-text"
                }`}
              >
                <div
                  className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary-tint text-primary"
                      : "bg-surface-sunken text-text-muted group-hover:text-text"
                  }`}
                >
                  <Icon size={14} strokeWidth={1.75} aria-hidden className="sm:h-[15px] sm:w-[15px]" />
                </div>
                <span className="whitespace-nowrap">{t(lang, item.labelKey)}</span>
              </button>
            );
          })}

          {/* Sliding Active Underline Indicator */}
          <div
            ref={indicatorRef}
            className="absolute bottom-0 h-0.5 bg-primary rounded-full pointer-events-none opacity-0"
            aria-hidden="true"
          />
        </div>

        {/* Subtle Right Edge Fade Hint on Mobile */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface to-transparent sm:hidden"
          aria-hidden="true"
        />
      </div>

      {/* Dynamic 3-Step Sequential Journey Timeline & Footer */}
      <div ref={contentContainerRef} className="mt-8 sm:mt-10">
        {/* Desktop Step Flow (md:grid with individual animated connecting lines) */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-8 lg:gap-12 relative">
          {currentJourney.steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isLastStep = idx === currentJourney.steps.length - 1;

            return (
              <div
                key={`${currentJourney.id}-${step.number}`}
                data-animate-exit
                data-step-desktop={idx}
                className="group relative flex flex-col items-start transition-all duration-200"
              >
                {/* Connecting Accent Rule Line to Next Step */}
                {!isLastStep && (
                  <div
                    data-line-desktop={idx}
                    className="absolute top-[22px] left-[52px] -right-4 lg:-right-6 h-px bg-border/90 z-0 origin-left"
                    aria-hidden="true"
                  />
                )}

                {/* Step Top Anchor: Number Badge + Action Icon */}
                <div className="flex items-center justify-between w-full relative z-10">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/40 bg-surface font-display text-sm font-bold text-accent-strong shadow-sm group-hover:border-accent group-hover:bg-accent/10 transition-colors">
                    {step.number}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-sunken text-text-secondary group-hover:border-primary/50 group-hover:bg-primary-tint group-hover:text-primary transition-colors">
                    <StepIcon size={16} strokeWidth={1.75} aria-hidden />
                  </div>
                </div>

                {/* Step Content */}
                <h3 className="mt-5 text-base sm:text-lg font-semibold text-text transition-colors group-hover:text-primary">
                  {t(lang, step.titleKey)}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {t(lang, step.descKey)}
                </p>

                {/* Subtle bottom accent tick */}
                <div className="mt-5 h-0.5 w-6 rounded-full bg-accent/30 transition-all duration-200 group-hover:w-12 group-hover:bg-accent" />
              </div>
            );
          })}
        </div>

        {/* Mobile Vertical Connected Timeline (md:hidden) */}
        <div className="md:hidden relative flex flex-col gap-6 pl-2">
          {currentJourney.steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isLastStep = idx === currentJourney.steps.length - 1;

            return (
              <div
                key={`mobile-${currentJourney.id}-${step.number}`}
                data-animate-exit
                data-step-mobile={idx}
                className="flex items-start gap-4 relative z-10"
              >
                {/* Vertical Connecting Line to Next Step */}
                {!isLastStep && (
                  <div
                    data-line-mobile={idx}
                    className="absolute left-[19px] top-[42px] -bottom-6 w-px bg-border/90 z-0 origin-top"
                    aria-hidden="true"
                  />
                )}

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-surface font-display text-xs font-bold text-accent-strong shadow-sm relative z-10">
                  {step.number}
                </span>

                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text">
                      {t(lang, step.titleKey)}
                    </h3>
                    <StepIcon size={14} strokeWidth={1.75} className="text-text-muted shrink-0" aria-hidden />
                  </div>
                  <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                    {t(lang, step.descKey)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Action Footer */}
        <div
          data-animate-exit
          data-footer-animate
          className="mt-10 sm:mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-border/70 pt-6"
        >
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-primary-tint px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            <JourneyIcon size={13} strokeWidth={1.75} aria-hidden />
            <span>{t(lang, currentJourney.categoryKey)}</span>
          </span>

          <Link
            href={currentJourney.href}
            className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full border border-border bg-surface-sunken px-5 py-2.5 text-xs font-semibold text-primary transition-all duration-150 hover:border-primary/50 hover:bg-primary hover:text-primary-fg hover:shadow-sm active:scale-[0.98]"
          >
            <span>{t(lang, currentJourney.ctaKey)}</span>
            <ChevronRight size={15} strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
