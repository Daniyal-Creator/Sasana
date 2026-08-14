"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

function Wordmark({ lang }: { lang: "id" | "en" }) {
  return (
    <Link href="/" className="flex items-center gap-2 rounded-full">
      <Image
        src="/sasana-logo.png"
        alt=""
        aria-hidden
        width={64}
        height={64}
        // Eager, but not priority: the landing hero photo is the LCP element and
        // should keep the preload slot to itself.
        loading="eager"
        className="h-8 w-8 shrink-0"
      />
      <span className="font-display text-lg font-semibold tracking-wide text-text">
        {t(lang, "app.name")}
      </span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const { lang } = useLang();
  const isHome = pathname === "/";

  // Landing: a floating solid-surface pill over the hero image (ADR-0001).
  // Solid, not frosted; backdrop-blur stays banned (guardrails D3).
  if (isHome) {
    return (
      <header className="absolute inset-x-0 top-0 z-10 px-4">
        <div className="mx-auto mt-3 flex w-fit max-w-full items-center gap-2 rounded-full bg-surface py-1.5 pl-4 pr-1.5 shadow-md sm:mt-5 sm:gap-4">
          <Wordmark lang={lang} />
          <nav className="flex items-center gap-2 sm:gap-4" aria-label="Main">
            <Link
              href="/about"
              className="hidden rounded-full px-2 py-1 text-sm font-medium text-text-secondary transition-colors duration-150 hover:text-primary sm:inline-block"
            >
              {t(lang, "nav.about")}
            </Link>
            <LanguageSwitcher />
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-14 max-w-container items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
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
          <Link
            href="/about"
            className="hidden rounded-md px-2 py-1 text-sm font-medium text-text-secondary transition-colors duration-150 hover:text-primary md:inline-block"
          >
            {t(lang, "nav.about")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
