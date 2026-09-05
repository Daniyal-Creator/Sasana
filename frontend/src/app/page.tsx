"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  HeartHandshake,
  Landmark,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Footer } from "@/components/layout/Footer";
import { SitesSlider } from "@/components/explore/SitesSlider";
import { InteractiveFeatures } from "@/components/landing/InteractiveFeatures";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";
import { useScrollFadeUp } from "@/lib/useScrollFadeUp";
import { useTabAnimation } from "@/lib/useTabAnimation";

export default function LandingPage() {
  const { lang } = useLang();
  const [activePillar, setActivePillar] = useState<"visitors" | "culture" | "governance">("visitors");

  // GSAP Tab transition for Impact & Benefits
  const pillarCardRef = useTabAnimation<HTMLDivElement>({
    trigger: activePillar,
    selector: "[data-benefit-item]",
    y: 8,
    stagger: 0.05,
    duration: 0.28,
  });

  // Scroll-triggered fade-up animations (ADR-0009)
  const heroActionBarRef = useScrollFadeUp<HTMLDivElement>({
    selector: "[data-hero-door]",
    stagger: 0.08,
    y: 14,
  });
  const featuresHeadingRef = useScrollFadeUp<HTMLDivElement>({
    selector: "> *",
    stagger: 0.06,
    y: 10,
  });
  const featuresInteractiveRef = useScrollFadeUp<HTMLDivElement>();
  const sitesSectionRef = useScrollFadeUp<HTMLDivElement>();
  const benefitsRef = useScrollFadeUp<HTMLDivElement>({
    selector: "> *",
    stagger: 0.06,
    y: 10,
  });
  const howSectionRef = useScrollFadeUp<HTMLDivElement>();

  return (
    <>
      <div className="flex-1">
        {/* Hero: full-viewport Balinese temple landscape with misty morning light (ADR-0001) */}
        <section id="hero" className="relative">
          <div className="hero-viewport relative flex flex-col justify-center overflow-hidden bg-surface-sunken px-4 pb-12 pt-20 text-center sm:pb-20 sm:pt-28">
            <Image
              src="/heroBg.webp"
              alt=""
              aria-hidden
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div aria-hidden className="hero-scrim absolute inset-0" />
            {/* Subtle soft edge transition */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-bg/40 via-bg/15 to-transparent sm:h-20"
            />

            <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center">
              {/* Eyebrow badge text */}
              <p className="text-xs font-bold tracking-widest text-[#e2b774] uppercase sm:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                {lang === "id"
                  ? "BERDASARKAN SE. GUBERNUR BALI NO. 7/2025"
                  : "BASED ON BALI GOVERNOR CIRCULAR NO. 7/2025"}
              </p>

              {/* Main Headline */}
              <h1 className="mt-4 font-display text-2xl font-normal tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.2] drop-shadow">
                {t(lang, "app.tagline")}
              </h1>

              {/* Subtitle / Lead */}
              <p className="mt-3 max-w-xl text-sm text-white/90 sm:mt-4 sm:text-lg drop-shadow-sm">
                {t(lang, "landing.lead")}
              </p>
            </div>
          </div>
        </section>

        {/* Floating 3-segment action bar overlapping the hero bottom edge (ADR-0006) */}
        <section className="relative z-20 mx-auto -mt-40 max-w-5xl px-4 sm:-mt-10 lg:-mt-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-surface shadow-xl transition-all duration-200 lg:rounded-full">
            <div
              ref={heroActionBarRef}
              className="flex flex-col divide-y divide-border lg:flex-row lg:items-center lg:divide-x lg:divide-y-0"
            >
              {/* Door 1: AI Vision / Check Situation */}
              <Link
                href="/check"
                data-hero-door
                className="group flex flex-1 items-center gap-3.5 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5 transition-all duration-200 active:scale-[0.98] first:rounded-t-2xl last:rounded-b-2xl hover:bg-surface-sunken/80 lg:first:rounded-l-full lg:first:rounded-tr-none lg:last:rounded-r-full lg:last:rounded-bl-none"
              >
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface-sunken text-text-secondary transition-all duration-200 group-hover:scale-105 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-fg">
                  <Camera size={18} strokeWidth={1.75} aria-hidden className="sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    {t(lang, "cta.badge.ai_vision")}
                  </span>
                  <span className="block text-xs sm:text-sm font-semibold text-text transition-colors group-hover:text-primary">
                    {t(lang, "cta.check.title")}
                  </span>
                </div>
              </Link>

              {/* Door 2: Chatbot / Tanya Asisten */}
              <Link
                href="/assistant"
                data-hero-door
                className="group flex flex-1 items-center gap-3.5 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5 transition-all duration-200 active:scale-[0.98] hover:bg-surface-sunken/80"
              >
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface-sunken text-text-secondary transition-all duration-200 group-hover:scale-105 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-fg">
                  <MessageCircle size={18} strokeWidth={1.75} aria-hidden className="sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    {t(lang, "cta.badge.chatbot")}
                  </span>
                  <span className="block text-xs sm:text-sm font-semibold text-text transition-colors group-hover:text-primary">
                    {t(lang, "cta.assistant.title")}
                  </span>
                </div>
              </Link>

              {/* Door 3: Geofence / Jelajahi Lokasi */}
              <Link
                href="/explore"
                data-hero-door
                className="group flex flex-1 items-center gap-3.5 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5 transition-all duration-200 active:scale-[0.98] first:rounded-t-2xl last:rounded-b-2xl hover:bg-surface-sunken/80 lg:first:rounded-l-full lg:first:rounded-tr-none lg:last:rounded-r-full lg:last:rounded-bl-none"
              >
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface-sunken text-text-secondary transition-all duration-200 group-hover:scale-105 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-fg">
                  <MapPin size={18} strokeWidth={1.75} aria-hidden className="sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    {t(lang, "cta.badge.geofence")}
                  </span>
                  <span className="block text-xs sm:text-sm font-semibold text-text transition-colors group-hover:text-primary">
                    {t(lang, "cta.explore.title")}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Artistic Section Divider */}
        <SectionDivider className="mt-14 sm:mt-16" />

        {/* What SASANA does: 60:40 Interactive Feature Constellation */}
        <section id="features" className="mx-auto max-w-container scroll-mt-24 px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          {/* Section Header */}
          <div className="max-w-xl" ref={featuresHeadingRef}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent-strong">
              {t(lang, "about_section.badge")}
            </span>
            <h2 className="mt-2 font-display text-h2 font-semibold text-text">
              {t(lang, "about_section.title")}
            </h2>
            <p className="mt-2 text-sm text-text-secondary sm:text-base leading-relaxed">
              {t(lang, "about_section.intro")}
            </p>
          </div>

          {/* 60:40 Interactive Feature Constellation & Shared Detail */}
          <div className="mt-8 sm:mt-10" ref={featuresInteractiveRef}>
            <InteractiveFeatures />
          </div>
        </section>

        {/* Artistic Section Divider */}
        <SectionDivider />

        {/* Bali's Famous Sites: Interactive Slider Showcase (ADR-0008) */}
        <section id="sites" className="mx-auto max-w-container scroll-mt-24 px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:px-8" ref={sitesSectionRef}>
          <SitesSlider />
        </section>

        {/* Artistic Section Divider */}
        <SectionDivider />

        {/* Impact & Benefits: Tabbed Segmented View (Multi-stakeholder Value Proposition) */}
        <section id="benefits" className="mx-auto max-w-container scroll-mt-24 px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:px-8" ref={benefitsRef}>
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
                    className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[11px] font-semibold transition-all duration-150 active:scale-[0.98] sm:gap-2 sm:rounded-full sm:px-4 sm:py-2.5 sm:text-sm ${isActive
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

          {/* Active Pillar Card with GSAP Staggered Transition */}
          <div
            ref={pillarCardRef}
            className="mt-6 rounded-2xl border border-border bg-surface p-5 sm:p-8 shadow-sm transition-all duration-200"
          >
            <div data-benefit-item className="flex items-start gap-3.5 sm:gap-4">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary border border-primary/10">
                {activePillar === "visitors" && <Compass size={22} strokeWidth={1.75} aria-hidden className="sm:h-6 sm:w-6" />}
                {activePillar === "culture" && <HeartHandshake size={22} strokeWidth={1.75} aria-hidden className="sm:h-6 sm:w-6" />}
                {activePillar === "governance" && <Landmark size={22} strokeWidth={1.75} aria-hidden className="sm:h-6 sm:w-6" />}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-accent-strong">
                  {activePillar === "visitors" && (lang === "id" ? "Fokus Wisatawan" : "Visitor Focus")}
                  {activePillar === "culture" && (lang === "id" ? "Pelestarian Adat" : "Heritage Focus")}
                  {activePillar === "governance" && (lang === "id" ? "Tata Kelola Daerah" : "Civic Alignment")}
                </span>
                <h3 className="mt-0.5 font-display text-base font-semibold text-text sm:text-xl leading-snug">
                  {activePillar === "visitors" && t(lang, "benefits.visitors.headline")}
                  {activePillar === "culture" && t(lang, "benefits.culture.headline")}
                  {activePillar === "governance" && t(lang, "benefits.governance.headline")}
                </h3>
              </div>
            </div>

            <div className="my-5 sm:my-6 h-px w-full bg-border" aria-hidden />

            {/* 3 Pillar Benefit Micro-Cards */}
            <div className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-3 md:gap-6">
              {([
                {
                  titleKey: `benefits.${activePillar}.p1_title` as const,
                  descKey: `benefits.${activePillar}.p1_desc` as const,
                  num: "01",
                },
                {
                  titleKey: `benefits.${activePillar}.p2_title` as const,
                  descKey: `benefits.${activePillar}.p2_desc` as const,
                  num: "02",
                },
                {
                  titleKey: `benefits.${activePillar}.p3_title` as const,
                  descKey: `benefits.${activePillar}.p3_desc` as const,
                  num: "03",
                },
              ] as const).map(({ titleKey, descKey, num }) => (
                <div
                  key={titleKey}
                  data-benefit-item
                  className="flex flex-col justify-start rounded-xl border border-border/80 bg-surface-sunken/40 p-4 sm:p-5 transition-all duration-150 hover:border-border-strong hover:bg-surface-sunken/70"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-primary">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary">
                        <CheckCircle2 size={13} strokeWidth={2} aria-hidden />
                      </div>
                      <h4 className="text-xs font-semibold text-text sm:text-sm">
                        {t(lang, titleKey)}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-text-muted select-none">
                      {num}
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-text-secondary sm:text-sm">
                    {t(lang, descKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Artistic Section Divider */}
        <SectionDivider />

        {/* How it works: Minimal Editorial Step Flow (ADR-0009 compliant) */}
        <section id="how" className="mx-auto max-w-container scroll-mt-24 px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8" ref={howSectionRef}>
          <HowItWorksSection />
        </section>
      </div>
      <Footer />
    </>
  );
}
