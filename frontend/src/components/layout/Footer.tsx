"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  const { lang } = useLang();

  return (
    <footer className={`border-t border-border ${className}`}>
      <div className="mx-auto flex max-w-container flex-col gap-3 px-4 py-8 sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 text-sm text-text-secondary">
          <ShieldCheck size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-accent-strong" />
          {t(lang, "footer.privacy")}
        </p>
        <p className="text-xs text-text-muted">{t(lang, "footer.disclaimer")}</p>
        <nav aria-label="Footer" className="flex gap-4 text-sm font-medium">
          <Link href="/" className="rounded-sm text-primary transition-colors duration-150 hover:text-primary-hover">
            {t(lang, "nav.home")}
          </Link>
          <Link href="/about" className="rounded-sm text-primary transition-colors duration-150 hover:text-primary-hover">
            {t(lang, "nav.about")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
