"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

function Wordmark({ lang }: { lang: "id" | "en" }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <Image
        src="/sasana-logo.png"
        alt=""
        aria-hidden
        width={64}
        height={64}
        loading="eager"
        className="h-8 w-8 shrink-0 object-contain"
      />
      <span className="font-display text-lg font-semibold tracking-wide text-text transition-colors group-hover:text-primary">
        {t(lang, "app.name")}
      </span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const { lang } = useLang();
  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: isHome ? "#hero" : "/#hero", labelKey: "nav.home" as const },
    { href: isHome ? "#features" : "/#features", labelKey: "nav.features" as const },
    { href: isHome ? "#sites" : "/#sites", labelKey: "nav.sites" as const },
    { href: isHome ? "#benefits" : "/#benefits", labelKey: "nav.benefits" as const },
    { href: isHome ? "#how" : "/#how", labelKey: "nav.how" as const },
    { href: "/about", labelKey: "nav.about" as const },
  ];

  // Landing page: Fixed adaptive header with smooth scroll state transitions & Mobile Drawer
  if (isHome) {
    return (
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-200 ${
          isScrolled || isMobileMenuOpen
            ? "border-b border-border bg-surface/95 backdrop-blur-md px-4 py-3 sm:px-8 shadow-sm"
            : "bg-gradient-to-b from-[rgb(20,17,14)]/85 via-[rgb(20,17,14)]/45 to-transparent px-4 pb-6 pt-4 sm:px-8 sm:pb-8 sm:pt-6"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5">
            {isScrolled && (
              <Image
                src="/sasana-logo.png"
                alt=""
                aria-hidden
                width={64}
                height={64}
                loading="eager"
                className="h-8 w-8 shrink-0 object-contain transition-opacity duration-150"
              />
            )}
            <span
              className={`font-display font-bold tracking-widest transition-colors duration-150 ${
                isScrolled || isMobileMenuOpen
                  ? "text-xl sm:text-2xl text-text"
                  : "text-2xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] group-hover:opacity-90"
              }`}
            >
              {t(lang, "app.name")}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-6 text-sm font-medium lg:gap-8"
            aria-label="Main"
          >
            {navLinks.map(({ href, labelKey }) => (
              <Link
                key={href}
                href={href}
                className={`py-1 transition-colors duration-150 ${
                  isScrolled
                    ? "text-text-secondary hover:text-primary font-medium"
                    : "text-white/85 hover:text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]"
                }`}
              >
                {t(lang, labelKey)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher variant={isScrolled || isMobileMenuOpen ? "default" : "hero"} />

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors md:hidden ${
                isScrolled || isMobileMenuOpen
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

        {/* Mobile Navigation Drawer / Dropdown */}
        {isMobileMenuOpen && (
          <div className="mt-3 border-t border-border/80 pt-3 pb-2 md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
              {navLinks.map(({ href, labelKey }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-sunken active:bg-primary-tint active:text-primary"
                >
                  <span>{t(lang, labelKey)}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    );
  }

  // Other routes (e.g. /about, /check, /explore, /assistant): Sticky frosted header
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-md px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-14 max-w-container items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            aria-label={t(lang, "nav.back")}
            className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:bg-surface-sunken hover:text-text"
          >
            <ArrowLeft size={20} strokeWidth={1.75} aria-hidden />
          </Link>
          <Wordmark lang={lang} />
        </div>

        <nav className="flex items-center gap-2 sm:gap-4" aria-label="Main">
          <div className="hidden items-center gap-4 text-sm font-medium lg:flex">
            {navLinks.map(({ href, labelKey }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-2 py-1 transition-colors duration-150 ${
                  pathname === href
                    ? "font-semibold text-primary"
                    : "text-text-secondary hover:text-primary"
                }`}
              >
                {t(lang, labelKey)}
              </Link>
            ))}
          </div>

          <LanguageSwitcher />

          {/* Subpage Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text hover:bg-surface-sunken lg:hidden"
          >
            {isMobileMenuOpen ? (
              <X size={18} strokeWidth={2} aria-hidden />
            ) : (
              <Menu size={18} strokeWidth={2} aria-hidden />
            )}
          </button>
        </nav>
      </div>

      {/* Subpage Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="border-t border-border py-3 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
            {navLinks.map(({ href, labelKey }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-sunken active:bg-primary-tint active:text-primary"
              >
                <span>{t(lang, labelKey)}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
