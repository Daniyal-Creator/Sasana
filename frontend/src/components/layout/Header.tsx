"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  Home,
  Info,
  MapPin,
  Menu,
  MessageCircle,
  X,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { getLenis } from "@/components/providers/SmoothScroll";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

/* ───────────────────────────────────────────────────────────────────────────
   1. Landing Page Header (pathname === "/")
   - Fixed overlay on hero with smooth transition to solid bar on scroll.
   - Sliding Underline Bar ScrollSpy indicator gliding along the rail.
   - Real-time Scroll Reading Progress Bar at the bottom of the header.
   - Smooth Lenis inertial scrolling when anchor links are clicked.
   - Dedicated "Tentang SASANA" CTA button leading to /about.
   ─────────────────────────────────────────────────────────────────────────── */
function LandingHeader() {
  const { lang } = useLang();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [scrollProgress, setScrollProgress] = useState(0);

  const sectionLinks = [
    { href: "#features", id: "features", labelKey: "nav.features" as const },
    { href: "#sites", id: "sites", labelKey: "nav.sites" as const },
    { href: "#benefits", id: "benefits", labelKey: "nav.benefits" as const },
    { href: "#how", id: "how", labelKey: "nav.how" as const },
  ];

  // Sliding underline measurement state
  const [indicator, setIndicator] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const navTrackRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const isLockedRef = useRef(false);
  const lockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ScrollSpy listener + Reading Progress Calculator
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 30);

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        const progress = Math.min(Math.max((scrollY / maxScroll) * 100, 0), 100);
        setScrollProgress(progress);
      }

      if (isLockedRef.current) return;

      const triggerOffset = Math.max(120, window.innerHeight * 0.28);
      let current = "";

      // If user reaches near the bottom of page, highlight the last section
      if (maxScroll > 0 && scrollY >= maxScroll - 60) {
        current = sectionLinks[sectionLinks.length - 1].id;
      } else {
        // Continuous reverse boundary lookup: a section remains active until the next section reaches the trigger offset
        for (let i = sectionLinks.length - 1; i >= 0; i--) {
          const { id } = sectionLinks[i];
          const el = document.getElementById(id);
          if (el) {
            const top = el.offsetTop - triggerOffset;
            if (scrollY >= top) {
              current = id;
              break;
            }
          }
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
    };
  }, []);

  // Update sliding underline bar position & width
  useEffect(() => {
    const updateIndicator = () => {
      const target = linkRefs.current[activeSection];
      const track = navTrackRef.current;
      if (target && track && activeSection) {
        setIndicator({
          left: target.offsetLeft,
          width: target.offsetWidth,
          opacity: 1,
        });
      } else {
        setIndicator((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeSection]);

  // Smooth Lenis inertial scroll handler with click-locking to prevent intermediate flutter
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;

    isLockedRef.current = true;
    setActiveSection(id);

    if (lockTimeoutRef.current) {
      clearTimeout(lockTimeoutRef.current);
    }

    const unlock = () => {
      isLockedRef.current = false;
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const triggerOffset = Math.max(120, window.innerHeight * 0.28);
      let current = "";
      if (maxScroll > 0 && scrollY >= maxScroll - 60) {
        current = sectionLinks[sectionLinks.length - 1].id;
      } else {
        for (let i = sectionLinks.length - 1; i >= 0; i--) {
          const { id: sId } = sectionLinks[i];
          const targetEl = document.getElementById(sId);
          if (targetEl && scrollY >= targetEl.offsetTop - triggerOffset) {
            current = sId;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(el, {
        offset: -90,
        duration: 1.1,
        onComplete: unlock,
      });
      lockTimeoutRef.current = setTimeout(unlock, 1250);
    } else {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const y = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
      lockTimeoutRef.current = setTimeout(unlock, prefersReduced ? 50 : 800);
    }
  };

  const handleMobileScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    setIsMobileMenuOpen(false);
    handleScrollTo(e, id);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-200 ${isScrolled || isMobileMenuOpen
          ? "border-b border-border bg-surface/95 backdrop-blur-md px-4 py-3 sm:px-8 shadow-sm"
          : "bg-gradient-to-b from-[rgb(20,17,14)]/85 via-[rgb(20,17,14)]/45 to-transparent px-4 pb-6 pt-4 sm:px-8 sm:pb-8 sm:pt-6"
        }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        {/* Wordmark & Brand Logo */}
        <Link href="/#hero" className="group flex items-center gap-2.5">
          {isScrolled && (
            <Image
              src="/sasana-logo.png"
              alt=""
              aria-hidden
              width={32}
              height={32}
              loading="eager"
              className="shrink-0 transition-opacity duration-150"
            />
          )}
          <span
            className={`font-display font-bold tracking-widest transition-colors duration-150 ${isScrolled || isMobileMenuOpen
                ? "text-xl sm:text-2xl text-text"
                : "text-2xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] group-hover:opacity-90"
              }`}
          >
            {t(lang, "app.name")}
          </span>
        </Link>

        {/* Desktop Anchor Navigation with Sliding Underline Bar */}
        <nav
          ref={navTrackRef}
          className="relative hidden md:flex items-center gap-1 lg:gap-2 pb-1"
          aria-label="Landing Page Navigation"
        >
          {/* Base rail hairline */}
          <div
            className={`absolute bottom-0 inset-x-0 h-px transition-colors duration-200 ${isScrolled ? "bg-border/60" : "bg-white/20"
              }`}
            aria-hidden="true"
          />

          {/* Sliding Underline Bar */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 h-[2.5px] rounded-full bg-accent transition-all duration-300 ease-out-quart motion-reduce:transition-none"
            style={{
              transform: `translate3d(${indicator.left}px, 0, 0)`,
              width: `${indicator.width}px`,
              opacity: indicator.opacity,
              left: 0,
            }}
          />

          {sectionLinks.map(({ href, id, labelKey }) => {
            const isActive = activeSection === id;

            return (
              <a
                key={href}
                href={href}
                ref={(el) => {
                  linkRefs.current[id] = el;
                }}
                onClick={(e) => handleScrollTo(e, id)}
                className={`relative z-10 rounded-md px-3.5 py-1.5 text-xs lg:text-sm font-semibold transition-colors duration-200 select-none ${isScrolled
                    ? isActive
                      ? "text-primary font-bold"
                      : "text-text-secondary hover:text-text"
                    : isActive
                      ? "text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                      : "text-white/80 hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]"
                  }`}
              >
                <span>{t(lang, labelKey)}</span>
              </a>
            );
          })}
        </nav>

        {/* Action Elements: About CTA, Language Switcher & Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dedicated About CTA Button */}
          <Link
            href="/about"
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${isScrolled
                ? "border border-primary/25 bg-primary-tint/60 text-primary hover:bg-primary hover:text-primary-fg hover:border-primary shadow-xs"
                : "border border-white/30 bg-white/15 text-white hover:bg-white hover:text-text backdrop-blur-sm drop-shadow-sm"
              }`}
          >
            <Info size={14} strokeWidth={2} aria-hidden />
            <span>{t(lang, "nav.about_sasana")}</span>
          </Link>

          <LanguageSwitcher variant={isScrolled || isMobileMenuOpen ? "default" : "hero"} />

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors md:hidden ${isScrolled || isMobileMenuOpen
                ? "border border-border bg-surface text-text hover:bg-surface-sunken"
                : "border border-white/20 bg-black/20 text-white hover:bg-black/40"
              }`}
          >
            {isMobileMenuOpen ? (
              <X size={20} strokeWidth={2} aria-hidden />
            ) : (
              <Menu size={20} strokeWidth={2} aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* Scroll Reading Progress Bar at the bottom edge of the Header */}
      <div
        className={`pointer-events-none absolute bottom-0 inset-x-0 h-[2px] overflow-hidden transition-opacity duration-200 ${isScrolled ? "opacity-100 bg-border/40" : "opacity-0"
          }`}
        aria-hidden="true"
      >
        <div
          className="h-full bg-accent transition-transform duration-100 ease-out origin-left motion-reduce:transition-none"
          style={{
            transform: `scaleX(${scrollProgress / 100})`,
          }}
        />
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="mt-3 border-t border-border/80 pt-3 pb-2 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
            {sectionLinks.map(({ href, id, labelKey }) => {
              const isActive = activeSection === id;

              return (
                <a
                  key={href}
                  href={href}
                  onClick={(e) => handleMobileScrollTo(e, id)}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${isActive
                      ? "bg-primary-tint/70 text-primary font-semibold"
                      : "text-text hover:bg-surface-sunken active:bg-primary-tint active:text-primary"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-4 w-1 rounded-full transition-colors ${isActive ? "bg-accent" : "bg-transparent"
                        }`}
                      aria-hidden="true"
                    />
                    <span>{t(lang, labelKey)}</span>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {lang === "id" ? "Aktif" : "Active"}
                    </span>
                  )}
                </a>
              );
            })}

            <div className="my-2 h-px w-full bg-border/70" aria-hidden />

            {/* Prominent CTA to About page in Mobile Drawer */}
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary-tint/70 px-4 py-3 text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-primary-fg"
            >
              <Info size={15} strokeWidth={2} aria-hidden />
              <span>{t(lang, "nav.about_sasana")}</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   2. About Page Header (pathname === "/about")
   - Sticky header with Sliding Underline Bar ScrollSpy indicator.
   - Real-time Scroll Reading Progress Bar at the bottom of the header.
   - Smooth Lenis inertial scrolling when anchor links are clicked.
   - Secondary "Ke Beranda" (Home) button and LanguageSwitcher.
   ─────────────────────────────────────────────────────────────────────────── */
function AboutHeader() {
  const { lang } = useLang();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [scrollProgress, setScrollProgress] = useState(0);

  const aboutSectionLinks = [
    { href: "#story", id: "story", labelKey: "about.nav.story" as const },
    { href: "#principles", id: "principles", labelKey: "about.nav.principles" as const },
    { href: "#source", id: "source", labelKey: "about.nav.source" as const },
    { href: "#team", id: "team", labelKey: "about.nav.team" as const },
  ];

  // Sliding underline measurement state
  const [indicator, setIndicator] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const navTrackRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const isLockedRef = useRef(false);
  const lockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ScrollSpy listener + Reading Progress Calculator
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        const progress = Math.min(Math.max((scrollY / maxScroll) * 100, 0), 100);
        setScrollProgress(progress);
      }

      if (isLockedRef.current) return;

      const triggerOffset = Math.max(120, window.innerHeight * 0.28);
      let current = "";

      // If user reaches near bottom, highlight team
      if (maxScroll > 0 && scrollY >= maxScroll - 60) {
        current = aboutSectionLinks[aboutSectionLinks.length - 1].id;
      } else {
        // Continuous reverse boundary lookup: a section remains active until the next section reaches the trigger offset
        for (let i = aboutSectionLinks.length - 1; i >= 0; i--) {
          const { id } = aboutSectionLinks[i];
          const el = document.getElementById(id);
          if (el) {
            const top = el.offsetTop - triggerOffset;
            if (scrollY >= top) {
              current = id;
              break;
            }
          }
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
    };
  }, []);

  // Update sliding underline bar position & width
  useEffect(() => {
    const updateIndicator = () => {
      const target = linkRefs.current[activeSection];
      const track = navTrackRef.current;
      if (target && track && activeSection) {
        setIndicator({
          left: target.offsetLeft,
          width: target.offsetWidth,
          opacity: 1,
        });
      } else {
        setIndicator((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeSection]);

  // Smooth Lenis inertial scroll handler with click-locking to prevent intermediate flutter
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;

    isLockedRef.current = true;
    setActiveSection(id);

    if (lockTimeoutRef.current) {
      clearTimeout(lockTimeoutRef.current);
    }

    const unlock = () => {
      isLockedRef.current = false;
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const triggerOffset = Math.max(120, window.innerHeight * 0.28);
      let current = "";
      if (maxScroll > 0 && scrollY >= maxScroll - 60) {
        current = aboutSectionLinks[aboutSectionLinks.length - 1].id;
      } else {
        for (let i = aboutSectionLinks.length - 1; i >= 0; i--) {
          const { id: sId } = aboutSectionLinks[i];
          const targetEl = document.getElementById(sId);
          if (targetEl && scrollY >= targetEl.offsetTop - triggerOffset) {
            current = sId;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(el, {
        offset: -90,
        duration: 1.1,
        onComplete: unlock,
      });
      lockTimeoutRef.current = setTimeout(unlock, 1250);
    } else {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const y = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
      lockTimeoutRef.current = setTimeout(unlock, prefersReduced ? 50 : 800);
    }
  };

  const handleMobileScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    setIsMobileMenuOpen(false);
    handleScrollTo(e, id);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-md px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-14 max-w-container items-center justify-between gap-3">
        {/* Clean Wordmark: Single click target to Home */}
        <Link href="/" className="group flex items-center gap-2.5">
          <Image
            src="/sasana-logo.png"
            alt=""
            aria-hidden
            width={32}
            height={32}
            loading="eager"
            className="shrink-0 transition-transform duration-150 group-hover:scale-105"
          />
          <span className="font-display text-lg font-bold tracking-wide text-text transition-colors group-hover:text-primary">
            {t(lang, "app.name")}
          </span>
        </Link>

        {/* Desktop About Content Sections Navigation with Sliding Underline Bar */}
        <nav
          ref={navTrackRef}
          className="relative hidden md:flex items-center gap-1 lg:gap-2 pb-1"
          aria-label="About Sections Navigation"
        >
          {/* Base rail hairline */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-border/60" aria-hidden="true" />

          {/* Sliding Underline Bar */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 h-[2.5px] rounded-full bg-accent transition-all duration-300 ease-out-quart motion-reduce:transition-none"
            style={{
              transform: `translate3d(${indicator.left}px, 0, 0)`,
              width: `${indicator.width}px`,
              opacity: indicator.opacity,
              left: 0,
            }}
          />

          {aboutSectionLinks.map(({ href, id, labelKey }) => {
            const isActive = activeSection === id;

            return (
              <a
                key={href}
                href={href}
                ref={(el) => {
                  linkRefs.current[id] = el;
                }}
                onClick={(e) => handleScrollTo(e, id)}
                className={`relative z-10 rounded-md px-3.5 py-1.5 text-xs lg:text-sm font-semibold transition-colors duration-200 select-none ${isActive ? "text-primary font-bold" : "text-text-secondary hover:text-text"
                  }`}
              >
                <span>{t(lang, labelKey)}</span>
              </a>
            );
          })}
        </nav>

        {/* Right Action Tools: Secondary Home Button & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Secondary Button to Return Home */}
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-text-secondary hover:border-primary/40 hover:bg-surface-sunken hover:text-primary transition-all duration-150 shadow-xs active:scale-[0.98]"
          >
            <Home size={14} strokeWidth={1.75} aria-hidden />
            <span>{t(lang, "nav.home")}</span>
          </Link>

          <LanguageSwitcher variant="default" />

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text hover:bg-surface-sunken md:hidden"
          >
            {isMobileMenuOpen ? (
              <X size={18} strokeWidth={2} aria-hidden />
            ) : (
              <Menu size={18} strokeWidth={2} aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* Scroll Reading Progress Bar at the bottom edge of the Header */}
      <div
        className="pointer-events-none absolute bottom-0 inset-x-0 h-[2px] overflow-hidden bg-border/40"
        aria-hidden="true"
      >
        <div
          className="h-full bg-accent transition-transform duration-100 ease-out origin-left motion-reduce:transition-none"
          style={{
            transform: `scaleX(${scrollProgress / 100})`,
          }}
        />
      </div>

      {/* About Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="border-t border-border py-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="About Mobile Navigation">
            {aboutSectionLinks.map(({ href, id, labelKey }) => {
              const isActive = activeSection === id;

              return (
                <a
                  key={href}
                  href={href}
                  onClick={(e) => handleMobileScrollTo(e, id)}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${isActive
                      ? "bg-primary-tint/70 text-primary font-semibold"
                      : "text-text hover:bg-surface-sunken active:bg-primary-tint active:text-primary"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-4 w-1 rounded-full transition-colors ${isActive ? "bg-accent" : "bg-transparent"
                        }`}
                      aria-hidden="true"
                    />
                    <span>{t(lang, labelKey)}</span>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {lang === "id" ? "Aktif" : "Active"}
                    </span>
                  )}
                </a>
              );
            })}

            <div className="my-2 h-px w-full bg-border/70" aria-hidden />

            {/* Return to Home Link in Mobile Drawer */}
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-xs font-bold uppercase tracking-wider text-text-secondary transition-colors hover:bg-surface-sunken hover:text-text"
            >
              <Home size={15} strokeWidth={1.75} aria-hidden />
              <span>{t(lang, "nav.home")}</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   3. Core App Pages Header (/check, /assistant, /explore)
   - Clean brand wordmark linking back to Home.
   - Core product navigation (Situation Check, Assistant, Explore) with active badges.
   - Outline pill button for "About" and LanguageSwitcher.
   ─────────────────────────────────────────────────────────────────────────── */
function AppHeader() {
  const pathname = usePathname();
  const { lang } = useLang();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const featureLinks = [
    {
      href: "/check",
      icon: Camera,
      labelKey: "nav.check" as const,
    },
    {
      href: "/assistant",
      icon: MessageCircle,
      labelKey: "nav.assistant" as const,
    },
    {
      href: "/explore",
      icon: MapPin,
      labelKey: "nav.explore" as const,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-md px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-14 max-w-container items-center justify-between gap-3">
        {/* Clean Wordmark: Single click target to Home */}
        <Link href="/" className="group flex items-center gap-2.5">
          <Image
            src="/sasana-logo.png"
            alt=""
            aria-hidden
            width={32}
            height={32}
            loading="eager"
            className="shrink-0 transition-transform duration-150 group-hover:scale-105"
          />
          <span className="font-display text-lg font-bold tracking-wide text-text transition-colors group-hover:text-primary">
            {t(lang, "app.name")}
          </span>
        </Link>

        {/* Desktop Core Product Feature Navigation */}
        <nav
          className="hidden md:flex items-center gap-1.5 lg:gap-2"
          aria-label="Core Feature Navigation"
        >
          {featureLinks.map(({ href, icon: Icon, labelKey }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${isActive
                    ? "border border-primary/20 bg-primary-tint text-primary font-bold shadow-xs"
                    : "text-text-secondary hover:bg-surface-sunken hover:text-primary"
                  }`}
              >
                <Icon size={15} strokeWidth={1.75} aria-hidden />
                <span>{t(lang, labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Tools: Secondary Home Button & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Secondary Button to Return Home */}
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-text-secondary hover:border-primary/40 hover:bg-surface-sunken hover:text-primary transition-all duration-150 shadow-xs active:scale-[0.98]"
          >
            <Home size={14} strokeWidth={1.75} aria-hidden />
            <span>{t(lang, "nav.home")}</span>
          </Link>

          <LanguageSwitcher variant="default" />

          {/* Subpage Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text hover:bg-surface-sunken md:hidden"
          >
            {isMobileMenuOpen ? (
              <X size={18} strokeWidth={2} aria-hidden />
            ) : (
              <Menu size={18} strokeWidth={2} aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* Subpage Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="border-t border-border py-3 md:hidden">
          <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
            {featureLinks.map(({ href, icon: Icon, labelKey }) => {
              const isActive = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl p-3 text-sm font-medium transition-colors ${isActive
                      ? "border border-primary/20 bg-primary-tint text-primary font-bold shadow-xs"
                      : "text-text hover:bg-surface-sunken active:bg-primary-tint active:text-primary"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive
                          ? "bg-primary text-primary-fg"
                          : "bg-surface-sunken text-text-secondary"
                        }`}
                    >
                      <Icon size={16} strokeWidth={1.75} aria-hidden />
                    </div>
                    <span>{t(lang, labelKey)}</span>
                  </div>
                  {isActive && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {lang === "id" ? "Aktif" : "Active"}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="my-2 h-px w-full bg-border/70" aria-hidden />

            {/* Prominent CTA to Return Home in Mobile Drawer */}
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary-tint/70 px-4 py-3 text-xs font-bold uppercase tracking-wider text-primary shadow-xs transition-colors hover:bg-primary hover:text-primary-fg active:scale-[0.98]"
            >
              <Home size={15} strokeWidth={2} aria-hidden />
              <span>{t(lang, "nav.home")}</span>
            </Link>

            {/* Subdued Secondary About Link in Mobile Drawer */}
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-text-muted hover:bg-surface-sunken hover:text-text transition-colors"
            >
              <div className="flex items-center gap-2">
                <Info size={14} strokeWidth={1.75} aria-hidden />
                <span>{t(lang, "nav.about_sasana")}</span>
              </div>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   Main Header Export
   Tri-Mode Router:
   - "/" -> LandingHeader (In-Page Landing Sections + About CTA)
   - "/about" -> AboutHeader (In-Page About Sections + Home Return)
   - Others -> AppHeader (Core Tool Navigation: Check, Assistant, Explore)
   ─────────────────────────────────────────────────────────────────────────── */
export function Header() {
  const pathname = usePathname();

  if (pathname === "/") {
    return <LandingHeader />;
  }

  if (pathname === "/about") {
    return <AboutHeader />;
  }

  return <AppHeader />;
}
