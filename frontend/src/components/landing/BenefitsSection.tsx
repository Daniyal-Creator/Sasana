"use client";

import { useState, useRef, useEffect } from "react";
import {
  Compass,
  HeartHandshake,
  Landmark,
  CheckCircle2,
} from "lucide-react";
import { gsap } from "gsap";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

type PillarKey = "visitors" | "culture" | "governance";

export function BenefitsSection() {
  const { lang } = useLang();
  const [activePillar, setActivePillar] = useState<PillarKey>("visitors");
  const [displayedPillar, setDisplayedPillar] = useState<PillarKey>("visitors");

  const contentContainerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const pillarsData = {
    visitors: {
      badge: lang === "id" ? "Fokus Wisatawan" : "Visitor Focus",
      headlineKey: "benefits.visitors.headline" as const,
      icon: Compass,
      items: [
        {
          titleKey: "benefits.visitors.p1_title" as const,
          descKey: "benefits.visitors.p1_desc" as const,
          num: "01",
        },
        {
          titleKey: "benefits.visitors.p2_title" as const,
          descKey: "benefits.visitors.p2_desc" as const,
          num: "02",
        },
        {
          titleKey: "benefits.visitors.p3_title" as const,
          descKey: "benefits.visitors.p3_desc" as const,
          num: "03",
        },
      ],
    },
    culture: {
      badge: lang === "id" ? "Pelestarian Adat" : "Heritage Focus",
      headlineKey: "benefits.culture.headline" as const,
      icon: HeartHandshake,
      items: [
        {
          titleKey: "benefits.culture.p1_title" as const,
          descKey: "benefits.culture.p1_desc" as const,
          num: "01",
        },
        {
          titleKey: "benefits.culture.p2_title" as const,
          descKey: "benefits.culture.p2_desc" as const,
          num: "02",
        },
        {
          titleKey: "benefits.culture.p3_title" as const,
          descKey: "benefits.culture.p3_desc" as const,
          num: "03",
        },
      ],
    },
    governance: {
      badge: lang === "id" ? "Tata Kelola Daerah" : "Civic Alignment",
      headlineKey: "benefits.governance.headline" as const,
      icon: Landmark,
      items: [
        {
          titleKey: "benefits.governance.p1_title" as const,
          descKey: "benefits.governance.p1_desc" as const,
          num: "01",
        },
        {
          titleKey: "benefits.governance.p2_title" as const,
          descKey: "benefits.governance.p2_desc" as const,
          num: "02",
        },
        {
          titleKey: "benefits.governance.p3_title" as const,
          descKey: "benefits.governance.p3_desc" as const,
          num: "03",
        },
      ],
    },
  } as const;

  const currentPillar = pillarsData[displayedPillar];
  const PillarIcon = currentPillar.icon;

  // Phase 1: Exit transition when activePillar changes
  useEffect(() => {
    if (activePillar === displayedPillar) return;

    // Respect prefers-reduced-motion (Guardrail M5)
    if (typeof window !== "undefined") {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) {
        setDisplayedPillar(activePillar);
        return;
      }
    }

    const container = contentContainerRef.current;
    if (!container) {
      setDisplayedPillar(activePillar);
      return;
    }

    const exitElements = container.querySelectorAll("[data-animate-exit]");
    gsap.killTweensOf(exitElements.length ? exitElements : container);

    gsap.to(exitElements.length ? exitElements : container, {
      opacity: 0,
      y: -6,
      duration: 0.1,
      ease: "power2.in",
      onComplete: () => {
        setDisplayedPillar(activePillar);
      },
    });
  }, [activePillar, displayedPillar]);

  // Phase 2: Sequential Entrance Animation on Displayed Pillar
  useEffect(() => {
    const container = contentContainerRef.current;
    if (!container) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Respect prefers-reduced-motion (Guardrail M5)
    if (typeof window !== "undefined") {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      // Reset container base properties
      gsap.set(container, { opacity: 1, y: 0 });

      // Sequential Entrance: Header -> Card 0 -> Card 1 -> Card 2
      // Total duration stays strictly ≤400ms (Guardrail M3)
      tl.fromTo(
        "[data-pillar-header]",
        { opacity: 0, y: 8, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.13 }
      )
        .fromTo(
          "[data-benefit-card='0']",
          { opacity: 0, y: 10, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.13 },
          "-=0.05"
        )
        .fromTo(
          "[data-benefit-card='1']",
          { opacity: 0, y: 10, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.13 },
          "-=0.05"
        )
        .fromTo(
          "[data-benefit-card='2']",
          { opacity: 0, y: 10, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.13 },
          "-=0.05"
        );
    }, container);

    return () => ctx.revert();
  }, [displayedPillar]);

  return (
    <>
      <div className="max-w-2xl">
        <h2 className="font-display text-h2 font-semibold text-text">
          {t(lang, "benefits_section.title")}
        </h2>
        <p className="mt-3 text-base text-text-secondary">
          {t(lang, "benefits_section.subtitle")}
        </p>
      </div>

      {/* Segmented Pill Tabs */}
      <div className="mt-8">
        <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-border bg-surface-sunken p-1.5 sm:inline-flex sm:w-auto sm:items-center sm:gap-1 sm:rounded-full">
          {([
            {
              id: "visitors" as const,
              labelKey: "benefits.tab.visitors" as const,
              shortKey: "benefits.tab.visitors.short" as const,
              icon: Compass,
            },
            {
              id: "culture" as const,
              labelKey: "benefits.tab.culture" as const,
              shortKey: "benefits.tab.culture.short" as const,
              icon: HeartHandshake,
            },
            {
              id: "governance" as const,
              labelKey: "benefits.tab.governance" as const,
              shortKey: "benefits.tab.governance.short" as const,
              icon: Landmark,
            },
          ]).map(({ id, labelKey, shortKey, icon: TabIcon }) => {
            const isActive = activePillar === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActivePillar(id)}
                className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[11px] font-semibold transition-all duration-150 active:scale-[0.98] sm:gap-2 sm:rounded-full sm:px-4 sm:py-2.5 sm:text-sm ${
                  isActive
                    ? "bg-primary text-primary-fg shadow-sm"
                    : "text-text-secondary hover:bg-surface/70 hover:text-text"
                }`}
                aria-pressed={isActive}
              >
                <TabIcon size={15} strokeWidth={1.75} aria-hidden className="shrink-0 sm:h-4 sm:w-4" />
                <span className="sm:hidden">{t(lang, shortKey)}</span>
                <span className="hidden sm:inline">{t(lang, labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Pillar Container with Two-Phase GSAP Sequential Animation */}
      <div
        ref={contentContainerRef}
        className="mt-6 rounded-2xl border border-border bg-surface p-5 sm:p-8 shadow-sm transition-all duration-200"
      >
        {/* Pillar Header (Ikon utama, Eyebrow badge, Headline) */}
        <div
          data-animate-exit
          data-pillar-header
          className="flex items-start gap-3.5 sm:gap-4"
        >
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary border border-primary/10">
            <PillarIcon size={22} strokeWidth={1.75} aria-hidden className="sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-accent-strong">
              {currentPillar.badge}
            </span>
            <h3 className="mt-0.5 font-display text-base font-semibold text-text sm:text-xl leading-snug">
              {t(lang, currentPillar.headlineKey)}
            </h3>
          </div>
        </div>

        <div className="my-5 sm:my-6 h-px w-full bg-border" aria-hidden />

        {/* 3 Pillar Benefit Micro-Cards with Sequential Entrance & Dynamic Hover */}
        <div className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-3 md:gap-6">
          {currentPillar.items.map((item, idx) => (
            <div
              key={item.titleKey}
              data-animate-exit
              data-benefit-card={idx}
              className="group flex flex-col justify-start rounded-xl border border-border/80 bg-surface-sunken/40 p-4 sm:p-5 transition-all duration-150 hover:border-border-strong hover:bg-surface-sunken/70"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-primary">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary transition-colors duration-150 group-hover:bg-primary group-hover:text-primary-fg">
                    <CheckCircle2 size={13} strokeWidth={2} aria-hidden />
                  </div>
                  <h4 className="text-xs font-semibold text-text sm:text-sm transition-colors duration-150 group-hover:text-primary">
                    {t(lang, item.titleKey)}
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-text-muted transition-colors duration-150 group-hover:text-accent-strong select-none">
                  {item.num}
                </span>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-text-secondary sm:text-sm">
                {t(lang, item.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
