"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";
import { useScrollFadeUp } from "@/lib/useScrollFadeUp";

export function Footer() {
  const { lang } = useLang();
  const currentYear = new Date().getFullYear();

  const footerRef = useScrollFadeUp<HTMLDivElement>({
    selector: "[data-footer-block]",
    stagger: 0.08,
    y: 12,
  });

  return (
    <footer className="border-t border-border-strong bg-surface-sunken text-text">
      <div ref={footerRef} className="mx-auto max-w-container px-4 py-12 sm:px-6 lg:px-8">
        {/* Top: Editorial Brand Area & 3-Column Navigation Grid */}
        <div data-footer-block className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Brand & Closing Statement */}
          <div className="flex flex-col gap-3 lg:col-span-5">
            <Link
              href="/"
              className="group inline-flex w-fit items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-accent" aria-hidden />
              <span className="font-display text-xl font-normal tracking-wide text-text transition-colors duration-150 group-hover:text-primary">
                SASANA
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-text-secondary">
              {t(lang, "footer.brand_statement")}
            </p>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {/* Group 1: Explore */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {t(lang, "footer.group.explore")}
              </h3>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li>
                  <Link
                    href="/"
                    className="inline-flex items-center text-text-secondary transition-all duration-150 hover:translate-x-0.5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {t(lang, "footer.nav.home")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/explore"
                    className="inline-flex items-center text-text-secondary transition-all duration-150 hover:translate-x-0.5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {t(lang, "footer.nav.sites")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#how-it-works"
                    className="inline-flex items-center text-text-secondary transition-all duration-150 hover:translate-x-0.5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {t(lang, "footer.nav.how")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Group 2: Features */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {t(lang, "footer.group.features")}
              </h3>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li>
                  <Link
                    href="/check"
                    className="inline-flex items-center text-text-secondary transition-all duration-150 hover:translate-x-0.5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {t(lang, "footer.nav.check")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/assistant"
                    className="inline-flex items-center text-text-secondary transition-all duration-150 hover:translate-x-0.5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {t(lang, "footer.nav.assistant")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#features"
                    className="inline-flex items-center text-text-secondary transition-all duration-150 hover:translate-x-0.5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {t(lang, "footer.nav.zones")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Group 3: About */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {t(lang, "footer.group.about")}
              </h3>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="inline-flex items-center text-text-secondary transition-all duration-150 hover:translate-x-0.5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {t(lang, "footer.nav.about")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about#rules"
                    className="inline-flex items-center text-text-secondary transition-all duration-150 hover:translate-x-0.5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {t(lang, "footer.nav.circular")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about#privacy"
                    className="inline-flex items-center text-text-secondary transition-all duration-150 hover:translate-x-0.5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {t(lang, "footer.nav.privacy")}
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Middle: Horizontal Trust & Legal Strip */}
        <hr className="my-8 border-border" />
        <div data-footer-block className="flex flex-col gap-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-medium text-text">
            <ShieldCheck size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-accent-strong" />
            <span>{t(lang, "footer.privacy")}</span>
          </div>
          <p className="text-text-muted">{t(lang, "footer.disclaimer")}</p>
        </div>

        {/* Bottom: Copyright & Micro-Copy */}
        <hr className="my-6 border-border" />
        <div data-footer-block className="flex flex-col gap-2 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>{`\u00A9 ${currentYear} SASANA`}</span>
          <span className="text-text-secondary">{t(lang, "footer.closing_copy")}</span>
        </div>
      </div>
    </footer>
  );
}
