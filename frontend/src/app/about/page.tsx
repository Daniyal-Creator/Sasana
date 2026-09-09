"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  ExternalLink,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Footer } from "@/components/layout/Footer";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";
import { useScrollFadeUp } from "@/lib/useScrollFadeUp";

/* ─── Data ────────────────────────────────────────────────────────────────── */

interface TeamMember {
  name: string;
  initials: string;
  role: string;
  focus: string;
}

const TEAM: TeamMember[] = [
  {
    name: "Daniyal Hafidz Prasetyo",
    initials: "DH",
    role: "Lead & AI Integration",
    focus: "Gemini Vision \u00b7 System Architecture",
  },
  {
    name: "Manu Caimpiyana Bhimasena",
    initials: "MC",
    role: "Frontend & UI/UX",
    focus: "Design System \u00b7 Interface Craft",
  },
  {
    name: "Rafli Halomoan",
    initials: "RH",
    role: "Knowledge Base & QA",
    focus: "Balinese Customs KB \u00b7 Verification",
  },
];

const PRINCIPLES = [
  { num: "01", titleKey: "about.p1.title" as const, descKey: "about.p1.desc" as const },
  { num: "02", titleKey: "about.p2.title" as const, descKey: "about.p2.desc" as const },
  { num: "03", titleKey: "about.p3.title" as const, descKey: "about.p3.desc" as const },
];

/* ─── Decorative SVGs ───────────────────────────────────────────────────── */

function StarIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}

function MobileHeroWatermark() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.04]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 280 280" fill="none" stroke="currentColor" className="h-72 w-72 text-text">
        <rect x="140" y="80" width="80" height="80" transform="rotate(45 140 120)" strokeWidth="1.5" />
        <circle cx="140" cy="120" r="60" strokeWidth="1" />
        <circle cx="140" cy="120" r="100" strokeWidth="0.5" />
        <circle cx="140" cy="120" r="3" fill="currentColor" />
      </svg>
    </div>
  );
}

function HeroDecoration({ decoRef }: { decoRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={decoRef}
      className="hidden select-none items-center justify-center lg:flex"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 280 320"
        fill="none"
        className="h-64 w-56 text-accent opacity-20 xl:h-80 xl:w-72"
      >
        <rect
          x="140" y="100" width="60" height="60"
          transform="rotate(45 140 130)"
          stroke="currentColor" strokeWidth="1.5" fill="none"
        />
        <rect
          x="140" y="70" width="120" height="120"
          transform="rotate(45 140 130)"
          stroke="currentColor" strokeWidth="0.75" fill="none"
        />
        <line x1="140" y1="20" x2="140" y2="240" stroke="currentColor" strokeWidth="0.5" />
        <line x1="50" y1="130" x2="230" y2="130" stroke="currentColor" strokeWidth="0.5" />
        <path d="M140 40 C140 80 120 100 120 130 C120 160 140 180 140 220" stroke="currentColor" strokeWidth="0.75" fill="none" />
        <path d="M140 40 C140 80 160 100 160 130 C160 160 140 180 140 220" stroke="currentColor" strokeWidth="0.75" fill="none" />
        <path d="M60 130 C100 130 120 110 140 110 C160 110 180 130 220 130" stroke="currentColor" strokeWidth="0.75" fill="none" />
        <path d="M60 130 C100 130 120 150 140 150 C160 150 180 130 220 130" stroke="currentColor" strokeWidth="0.75" fill="none" />
        <circle cx="140" cy="130" r="4" fill="currentColor" fillOpacity="0.3" />
        <circle cx="140" cy="130" r="1.5" fill="currentColor" />
        <rect x="140" y="42" width="6" height="6" transform="rotate(45 140 45)" fill="currentColor" fillOpacity="0.4" />
        <rect x="140" y="212" width="6" height="6" transform="rotate(45 140 215)" fill="currentColor" fillOpacity="0.4" />
        <rect x="55" y="127" width="6" height="6" transform="rotate(45 58 130)" fill="currentColor" fillOpacity="0.4" />
        <rect x="219" y="127" width="6" height="6" transform="rotate(45 222 130)" fill="currentColor" fillOpacity="0.4" />
        <circle cx="105" cy="95" r="2" fill="currentColor" fillOpacity="0.2" />
        <circle cx="175" cy="95" r="2" fill="currentColor" fillOpacity="0.2" />
        <circle cx="105" cy="165" r="2" fill="currentColor" fillOpacity="0.2" />
        <circle cx="175" cy="165" r="2" fill="currentColor" fillOpacity="0.2" />
      </svg>
    </div>
  );
}

/* ─── Page Component ─────────────────────────────────────────────────────── */

export default function AboutPage() {
  const { lang } = useLang();

  // Mobile navigation active tracking
  const [activeNav, setActiveNav] = useState<string>("hero");
  const [activePrincipleIndex, setActivePrincipleIndex] = useState<number>(0);
  const principlesTrackRef = useRef<HTMLDivElement>(null);

  // Scroll animations per section (M1-M5 compliant, bi-directional)
  const heroTextRef = useScrollFadeUp<HTMLDivElement>({
    selector: ".hero-animate",
    stagger: 0.06,
    y: 12,
    duration: 0.35,
  });

  const heroDecoRef = useScrollFadeUp<HTMLDivElement>({
    y: 8,
    rotate: -5,
    duration: 0.45,
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

  const privacyRef = useScrollFadeUp<HTMLElement>({
    y: 12,
    duration: 0.35,
  });

  const teamRef = useScrollFadeUp<HTMLElement>({
    selector: ".team-animate",
    stagger: 0.06,
    y: 12,
    duration: 0.35,
  });

  const closingRef = useScrollFadeUp<HTMLElement>({
    selector: ".closing-animate",
    stagger: 0.06,
    y: 12,
    duration: 0.35,
  });

  // Track active section for mobile sticky navigation
  useEffect(() => {
    const sectionIds = ["hero", "story", "principles", "source", "team"];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveNav(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const yOffset = -90;
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
    setActiveNav(id);
  };

  const navItems = [
    { id: "hero", label: t(lang, "about.nav.about") },
    { id: "story", label: t(lang, "about.nav.story") },
    { id: "principles", label: t(lang, "about.nav.principles") },
    { id: "source", label: t(lang, "about.nav.source") },
    { id: "team", label: t(lang, "about.nav.team") },
  ];

  return (
    <>
      <div className="flex-1 bg-bg">
        {/* ── Mobile Sticky Sub-Nav (Pocket Guide Menu) ───────────── */}
        <div className="sticky top-14 z-20 border-b border-border bg-bg/95 backdrop-blur-none md:hidden">
          <nav
            aria-label="About page sections"
            className="no-scrollbar flex items-center gap-1 overflow-x-auto px-4 py-2"
          >
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                    isActive
                      ? "font-semibold text-accent-strong"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-accent" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <main className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">

          {/* ── 1. Hero ────────────────────────────────────────────── */}
          <header
            id="hero"
            className="relative pb-10 pt-8 sm:pb-16 sm:pt-16 lg:pb-20 lg:pt-20"
          >
            {/* Mobile Dramatic Editorial Hero (< 768px) */}
            <div ref={heroTextRef} className="relative block text-center md:hidden">
              <MobileHeroWatermark />
              
              <div className="hero-animate mx-auto mb-3 flex items-center justify-center gap-1.5 text-accent-strong">
                <StarIcon className="h-3.5 w-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-widest">
                  {t(lang, "about.eyebrow")}
                </span>
              </div>

              <h1 className="hero-animate font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                Memahami Bali dengan rasa{" "}
                <span className="text-accent-strong">hormat.</span>
              </h1>

              <p className="hero-animate mx-auto mt-4 max-w-md text-sm leading-relaxed text-text-secondary">
                {t(lang, "about.tagline")}
              </p>

              <div className="hero-animate mt-6 flex items-center justify-center gap-3">
                <div className="h-px w-12 bg-border" />
                <span className="font-display text-xs font-medium tracking-wider text-text-muted">
                  SASANA / 01
                </span>
                <div className="h-px w-12 bg-border" />
              </div>
            </div>

            {/* Desktop 55/45 Editorial Hero (≥ 768px) */}
            <div className="hidden md:grid md:grid-cols-[55fr_45fr] md:items-center md:gap-8">
              <div className="max-w-prose">
                <span className="hero-animate block text-xs font-bold uppercase tracking-widest text-accent-strong">
                  {t(lang, "about.eyebrow")}
                </span>
                <h1 className="hero-animate mt-4 whitespace-pre-line font-display text-display font-semibold tracking-tight text-text lg:text-hero">
                  {t(lang, "about.title")}
                </h1>
                <p className="hero-animate mt-5 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
                  {t(lang, "about.tagline")}
                </p>
                <div className="hero-animate mt-8 h-px w-full bg-border" />
                <div className="hero-animate mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
                  <span>{t(lang, "about.meta")}</span>
                  <span>{t(lang, "about.version")}</span>
                </div>
              </div>
              <HeroDecoration decoRef={heroDecoRef} />
            </div>
          </header>

          <SectionDivider />

          {/* ── 2. Our Story ───────────────────────────────────────── */}
          <section
            id="story"
            ref={storyRef}
            aria-labelledby="story-heading"
            className="py-10 sm:py-16 lg:py-20"
          >
            {/* Mobile Story Magazine Layout (< 768px) */}
            <div className="block md:hidden">
              <div className="flex items-baseline justify-between">
                <span className="story-animate font-display text-3xl font-semibold text-text-muted/60">
                  {t(lang, "about.story.eyebrow")}
                </span>
                <span className="story-animate block -rotate-2 rounded-full border border-border bg-surface px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-strong shadow-sm">
                  CULTURAL GUIDE
                </span>
              </div>

              <span className="story-animate mt-2 block text-[11px] font-bold uppercase tracking-widest text-accent-strong">
                {t(lang, "about.story.title")}
              </span>

              <h2
                id="story-heading-mobile"
                className="story-animate mt-2 font-display text-2xl font-semibold leading-tight tracking-tight text-text"
              >
                {t(lang, "about.story.lead")}
              </h2>

              <div className="mt-4 flex flex-col gap-3">
                <p className="story-animate text-sm leading-relaxed text-text-secondary">
                  {t(lang, "about.story.body1")}
                </p>
                <p className="story-animate text-sm leading-relaxed text-text-secondary">
                  {t(lang, "about.story.body2")}
                </p>
              </div>

              <blockquote className="story-animate mt-5 border-l-2 border-accent pl-4">
                <p className="font-display text-base font-semibold leading-snug text-text">
                  {"\u201C"}{t(lang, "about.story.quote")}{"\u201D"}
                </p>
              </blockquote>
            </div>

            {/* Desktop 2-column Story (≥ 768px) */}
            <div className="hidden md:grid md:grid-cols-[2fr_3fr] md:gap-8">
              <div>
                <span className="story-animate block text-xs font-bold uppercase tracking-widest text-accent-strong">
                  {t(lang, "about.story.eyebrow")}
                </span>
                <h2
                  id="story-heading"
                  className="story-animate mt-3 font-display text-h2 font-semibold tracking-tight text-text sm:text-h1"
                >
                  {t(lang, "about.story.title")}
                </h2>
                <p className="story-animate mt-4 font-display text-lg font-medium leading-snug text-text sm:text-h3">
                  {t(lang, "about.story.lead")}
                </p>
              </div>
              <div className="flex flex-col gap-5">
                <p className="story-animate text-base leading-relaxed text-text-secondary">
                  {t(lang, "about.story.body1")}
                </p>
                <p className="story-animate text-base leading-relaxed text-text-secondary">
                  {t(lang, "about.story.body2")}
                </p>
                <blockquote className="story-animate mt-4 border-l-2 border-accent pl-5">
                  <p className="font-display text-h3 font-semibold leading-snug text-text">
                    {"\u201C"}{t(lang, "about.story.quote")}{"\u201D"}
                  </p>
                </blockquote>
              </div>
            </div>
          </section>

          <SectionDivider />

          {/* ── 3. Principles ──────────────────────────────────────── */}
          <section
            id="principles"
            ref={principlesRef}
            aria-labelledby="principles-heading"
            className="py-10 sm:py-16 lg:py-20"
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
                {PRINCIPLES.map(({ num, titleKey, descKey }) => (
                  <div
                    key={titleKey}
                    className="flex-none w-[calc(100vw-48px)] max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-sm"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <span className="font-display text-3xl font-semibold text-accent-strong">
                      {num}
                    </span>
                    <h3 className="mt-3 font-display text-lg font-semibold text-text">
                      {t(lang, titleKey)}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-text-secondary sm:text-sm">
                      {t(lang, descKey)}
                    </p>
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

            {/* Desktop Vertical Numbered List (≥ 768px) */}
            <div className="mt-10 hidden md:block">
              {PRINCIPLES.map(({ num, titleKey, descKey }) => (
                <div
                  key={titleKey}
                  className="principle-animate group border-t border-border py-7 last:border-b sm:py-9"
                >
                  <div className="flex items-start gap-5 sm:gap-8">
                    <span className="shrink-0 font-display text-h3 font-semibold text-text-muted transition-colors duration-200 group-hover:text-accent-strong sm:text-h2">
                      {num}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-text transition-transform duration-200 group-hover:translate-x-0.5 sm:text-h3">
                        {t(lang, titleKey)}
                      </h3>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">
                        {t(lang, descKey)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <SectionDivider />

          {/* ── 4. Official Foundation ─────────────────────────────── */}
          <section
            id="source"
            ref={foundationRef}
            aria-labelledby="rules-heading"
            className="py-10 sm:py-16 lg:py-20"
          >
            <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-sunken/60 px-5 py-7 sm:px-8 sm:py-10">
              {/* Decorative Number Watermark 07 */}
              <span
                className="pointer-events-none absolute -right-2 -top-4 select-none font-display text-8xl font-bold text-text opacity-[0.05] sm:text-9xl"
                aria-hidden="true"
              >
                07
              </span>

              <div className="foundation-animate relative z-10 flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-accent-strong sm:h-10 sm:w-10">
                  <ShieldCheck size={20} strokeWidth={1.75} aria-hidden />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-accent-strong sm:text-xs">
                    {t(lang, "about.rules.eyebrow")}
                  </span>
                </div>
              </div>

              <div className="relative z-10">
                <h2
                  id="rules-heading"
                  className="foundation-animate mt-4 font-display text-xl font-semibold text-text sm:mt-5 sm:text-h2"
                >
                  {t(lang, "about.rules.title")}
                </h2>
                <p className="foundation-animate mt-1.5 font-display text-sm font-medium text-text sm:text-lg">
                  {t(lang, "about.rules.subtitle")}
                </p>
                <p className="foundation-animate mt-2.5 max-w-xl text-xs leading-relaxed text-text-secondary sm:text-base">
                  {t(lang, "about.rules.body")}
                </p>

                <div className="foundation-animate mt-5">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ExternalLink}
                    iconPosition="trailing"
                    href="https://www.baliprov.go.id"
                  >
                    {t(lang, "about.rules.link")}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* ── 5. Privacy Promise ─────────────────────────────────── */}
          <section
            ref={privacyRef}
            aria-labelledby="privacy-heading"
            className="pb-10 sm:pb-16 lg:pb-20"
          >
            <div className="flex items-start gap-3.5 rounded-xl border border-border bg-surface-sunken/40 px-4 py-4 sm:items-center sm:gap-5 sm:px-6 sm:py-6">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-primary sm:h-9 sm:w-9">
                <Lock size={16} strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 id="privacy-heading" className="text-xs font-semibold text-text sm:text-base">
                  {t(lang, "about.privacy.title")}
                </h2>
                <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary sm:text-sm">
                  {t(lang, "about.privacy.body")}
                </p>
              </div>
            </div>
          </section>

          <SectionDivider />

          {/* ── 6. Team ────────────────────────────────────────────── */}
          <section
            id="team"
            ref={teamRef}
            aria-labelledby="team-heading"
            className="py-10 sm:py-16 lg:py-20"
          >
            <div className="team-animate">
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

            {/* Compact Stacked Team List on Mobile / 3-Column on Desktop */}
            <div className="mt-6 grid grid-cols-1 gap-0 sm:grid-cols-3 sm:gap-8">
              {TEAM.map((member, i) => (
                <div key={member.name} className="team-animate group">
                  {/* Mobile divider between items */}
                  {i > 0 && <div className="h-px bg-border sm:hidden" />}
                  <div className="flex items-center gap-4 py-4 sm:block sm:py-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-tint font-display text-xs font-bold text-primary transition-colors duration-150 group-hover:bg-accent group-hover:text-surface sm:h-11 sm:w-11 sm:text-sm">
                      {member.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-text sm:mt-4 sm:text-base">
                        {member.name}
                      </h3>
                      <p className="text-xs font-medium text-primary sm:mt-1">
                        {member.role}
                      </p>
                      <p className="text-[11px] text-text-muted sm:mt-1 sm:text-xs">
                        {member.focus}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="team-animate mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted sm:mt-8">
              <span>{t(lang, "about.team.org")}</span>
            </div>
          </section>

          {/* ── 7. Closing ─────────────────────────────────────────── */}
          <SectionDivider />

          <section
            ref={closingRef}
            aria-label="Closing statement"
            className="py-12 text-center sm:py-16 lg:py-24"
          >
            <div className="closing-animate mx-auto mb-4 flex items-center justify-center text-accent-strong">
              <StarIcon className="h-4 w-4" />
            </div>

            <p className="closing-animate mx-auto max-w-xl font-display text-2xl font-semibold leading-snug tracking-tight text-text sm:text-h2 lg:text-h1">
              {t(lang, "about.closing.line1")}
              <br />
              <span className="text-text-secondary">
                {t(lang, "about.closing.line2")}
              </span>
            </p>

            <p className="closing-animate mt-4 text-xs font-bold uppercase tracking-widest text-accent-strong">
              {"\u2014 SASANA"}
            </p>

            <div className="closing-animate mx-auto mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-text-muted sm:gap-6">
              <span>{t(lang, "about.team.org")}</span>
              <span className="hidden sm:inline" aria-hidden="true">\u00b7</span>
              <span>{t(lang, "about.version")}</span>
            </div>
          </section>

        </main>
      </div>
      <Footer />
    </>
  );
}
