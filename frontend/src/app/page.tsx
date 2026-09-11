"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Footer } from "@/components/layout/Footer";
import { SitesSlider } from "@/components/explore/SitesSlider";
import { InteractiveFeatures } from "@/components/landing/InteractiveFeatures";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";
import { useScrollFadeUp } from "@/lib/useScrollFadeUp";
import { getLenis } from "@/components/providers/SmoothScroll";

export default function LandingPage() {
  const { lang } = useLang();

  // Handle URL hash navigation (e.g. /#how, /#sites, /#features, /#how-it-works from footer/header)
  useEffect(() => {
    const handleHash = () => {
      const rawHash = window.location.hash.replace("#", "");
      if (!rawHash) return;
      const targetId = rawHash === "how-it-works" ? "how" : rawHash;
      if (targetId === "hero") {
        const lenis = getLenis();
        if (lenis) {
          lenis.scrollTo(0);
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }
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
  const benefitsSectionRef = useScrollFadeUp<HTMLDivElement>();
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
        <section className="relative z-20 mx-auto -mt-16 max-w-5xl px-3 sm:-mt-10 sm:px-6 lg:-mt-12 lg:px-8">
          <div className="rounded-2xl border border-border bg-surface shadow-xl transition-all duration-200 lg:rounded-full">
            <div
              ref={heroActionBarRef}
              className="flex flex-row items-center divide-x divide-border"
            >
              {/* Door 1: AI Vision / Check Situation */}
              <Link
                href="/check"
                data-hero-door
                className="group flex flex-1 flex-col items-center justify-center text-center gap-1.5 px-2 py-3.5 sm:gap-2 sm:px-4 sm:py-4 lg:flex-row lg:items-center lg:justify-start lg:text-left lg:gap-4 lg:px-6 lg:py-5 transition-all duration-200 active:scale-[0.98] first:rounded-l-2xl lg:first:rounded-l-full hover:bg-surface-sunken/80"
              >
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface-sunken text-text-secondary transition-all duration-200 group-hover:scale-105 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-fg">
                  <Camera size={16} strokeWidth={1.75} aria-hidden className="lg:h-5 lg:w-5" />
                </div>
                <div className="min-w-0">
                  <span className="hidden lg:block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    {t(lang, "cta.badge.ai_vision")}
                  </span>
                  <span className="block text-[11px] sm:text-xs lg:text-sm font-semibold leading-tight text-text transition-colors group-hover:text-primary">
                    {t(lang, "cta.check.title")}
                  </span>
                </div>
              </Link>

              {/* Door 2: Chatbot / Tanya Asisten */}
              <Link
                href="/assistant"
                data-hero-door
                className="group flex flex-1 flex-col items-center justify-center text-center gap-1.5 px-2 py-3.5 sm:gap-2 sm:px-4 sm:py-4 lg:flex-row lg:items-center lg:justify-start lg:text-left lg:gap-4 lg:px-6 lg:py-5 transition-all duration-200 active:scale-[0.98] hover:bg-surface-sunken/80"
              >
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface-sunken text-text-secondary transition-all duration-200 group-hover:scale-105 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-fg">
                  <MessageCircle size={16} strokeWidth={1.75} aria-hidden className="lg:h-5 lg:w-5" />
                </div>
                <div className="min-w-0">
                  <span className="hidden lg:block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    {t(lang, "cta.badge.chatbot")}
                  </span>
                  <span className="block text-[11px] sm:text-xs lg:text-sm font-semibold leading-tight text-text transition-colors group-hover:text-primary">
                    {t(lang, "cta.assistant.title")}
                  </span>
                </div>
              </Link>

              {/* Door 3: Geofence / Jelajahi Lokasi */}
              <Link
                href="/explore"
                data-hero-door
                className="group flex flex-1 flex-col items-center justify-center text-center gap-1.5 px-2 py-3.5 sm:gap-2 sm:px-4 sm:py-4 lg:flex-row lg:items-center lg:justify-start lg:text-left lg:gap-4 lg:px-6 lg:py-5 transition-all duration-200 active:scale-[0.98] last:rounded-r-2xl lg:last:rounded-r-full hover:bg-surface-sunken/80"
              >
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface-sunken text-text-secondary transition-all duration-200 group-hover:scale-105 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-fg">
                  <MapPin size={16} strokeWidth={1.75} aria-hidden className="lg:h-5 lg:w-5" />
                </div>
                <div className="min-w-0">
                  <span className="hidden lg:block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    {t(lang, "cta.badge.geofence")}
                  </span>
                  <span className="block text-[11px] sm:text-xs lg:text-sm font-semibold leading-tight text-text transition-colors group-hover:text-primary">
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
        <section id="benefits" className="mx-auto max-w-container scroll-mt-24 px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:px-8" ref={benefitsSectionRef}>
          <BenefitsSection />
        </section>

        {/* Artistic Section Divider */}
        <SectionDivider />

        {/* How it works: Minimal Editorial Step Flow (ADR-0009 compliant) */}
        <section id="how" className="mx-auto max-w-container scroll-mt-24 px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8" ref={howSectionRef}>
          <span id="how-it-works" className="sr-only" />
          <HowItWorksSection />
        </section>
      </div>
      <Footer />
    </>
  );
}
