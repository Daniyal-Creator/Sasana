"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";
import { useScrollFadeUp } from "@/lib/useScrollFadeUp";
import { getLenis } from "@/components/providers/SmoothScroll";

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps = {}) {
  const { lang } = useLang();
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const isHome = pathname === "/";
  const isAbout = pathname === "/about";

  const footerRef = useScrollFadeUp<HTMLDivElement>({
    selector: "[data-footer-block]",
    stagger: 0.08,
    y: 12,
  });

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Top of page navigation for "/" or "/#hero" or "#hero" while on homepage
    if ((href === "/" || href === "/#hero" || href === "#hero") && isHome) {
      e.preventDefault();
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      window.history.pushState(null, "", "/");
      return;
    }

    // Anchor navigation on homepage (e.g. /#sites, /#how)
    if (href.startsWith("/#") && isHome) {
      e.preventDefault();
      const hash = href.replace("/#", "");
      const targetId = hash === "how-it-works" ? "how" : hash;
      const el = document.getElementById(targetId);
      if (el) {
        const yOffset = -90;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        const lenis = getLenis();
        if (lenis) {
          lenis.scrollTo(y);
        } else {
          const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
        }
        window.history.pushState(null, "", `#${hash}`);
      }
      return;
    }

    // Top of page navigation for "/about" while on about page
    if (href === "/about" && isAbout) {
      e.preventDefault();
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      window.history.pushState(null, "", "/about");
      return;
    }

    // Anchor navigation on about page (e.g. /about#charter, /about#source)
    if (href.startsWith("/about#") && isAbout) {
      e.preventDefault();
      const hash = href.replace("/about#", "");
      const targetId =
        hash === "rules" || hash === "privacy" || hash === "charter" ? "source" : hash;
      const el = document.getElementById(targetId);
      if (el) {
        const yOffset = -90;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        const lenis = getLenis();
        if (lenis) {
          lenis.scrollTo(y);
        } else {
          const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
        }
        window.history.pushState(null, "", `#${hash}`);
      }
      return;
    }
  };

  return (
    <footer className={`relative overflow-hidden border-t border-border-strong bg-surface-sunken text-text ${className}`.trim()}>
      {/* Decorative background image */}
      <div className="pointer-events-none absolute inset-0 select-none overflow-hidden" aria-hidden="true">
        <Image
          src="/assets/footer-bg.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-bottom opacity-60 mix-blend-multiply"
        />
      </div>

      <div ref={footerRef} className="relative z-10 mx-auto max-w-container px-4 py-12 sm:px-6 lg:px-8">
        {/* Top: Editorial Brand Area & 3-Column Navigation Grid */}
        <div data-footer-block className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Brand & Closing Statement */}
          <div className="flex flex-col gap-3 lg:col-span-5">
            <Link
              href={isHome ? "#hero" : "/"}
              onClick={(e) => handleAnchorClick(e, "/")}
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
                    href={isHome ? "#hero" : "/#hero"}
                    onClick={(e) => handleAnchorClick(e, "/#hero")}
                    className="inline-flex items-center text-text-secondary transition-all duration-150 hover:translate-x-0.5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {t(lang, "footer.nav.home")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={isHome ? "#sites" : "/#sites"}
                    onClick={(e) => handleAnchorClick(e, "/#sites")}
                    className="inline-flex items-center text-text-secondary transition-all duration-150 hover:translate-x-0.5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {t(lang, "footer.nav.sites")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={isHome ? "#how" : "/#how"}
                    onClick={(e) => handleAnchorClick(e, "/#how")}
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
                    href="/explore"
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
                    onClick={(e) => handleAnchorClick(e, "/about")}
                    className="inline-flex items-center text-text-secondary transition-all duration-150 hover:translate-x-0.5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {t(lang, "footer.nav.about")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about#charter"
                    onClick={(e) => handleAnchorClick(e, "/about#charter")}
                    className="inline-flex items-center text-text-secondary transition-all duration-150 hover:translate-x-0.5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {t(lang, "footer.nav.charter")}
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Middle: Horizontal Trust & Legal Strip */}
        <hr className="my-8 border-border" />
        <div data-footer-block className="flex flex-col gap-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/about#privacy"
            onClick={(e) => handleAnchorClick(e, "/about#privacy")}
            className="group flex items-center gap-2 font-medium text-text transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <ShieldCheck size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-accent-strong" />
            <span className="group-hover:underline">{t(lang, "footer.privacy")}</span>
          </Link>
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
