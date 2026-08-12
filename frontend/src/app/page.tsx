"use client";

import Image from "next/image";
import Link from "next/link";
import { Camera, ChevronDown, MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

export default function LandingPage() {
  const { lang } = useLang();

  const steps = [
    t(lang, "how.step1"),
    t(lang, "how.step2"),
    t(lang, "how.step3"),
  ];

  return (
    <>
      <div className="flex-1">
        {/* Hero (ADR-0001): one licensed landscape, full-bleed to the viewport
            edges. Text sits on the alpha-only warm-ink scrim, never on the raw
            image. */}
        <section>
          <div className="hero-viewport relative flex flex-col overflow-hidden bg-surface-sunken">
            <Image
              src="/Hero-bg2.jpg"
              alt=""
              aria-hidden
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div aria-hidden className="hero-scrim absolute inset-0" />

            <div className="relative flex flex-1 flex-col items-center justify-end px-4 pb-10 pt-24 text-center sm:pb-12">
              <p className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary shadow-sm">
                <ShieldCheck size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-accent-strong" />
                {t(lang, "landing.badge")}
              </p>

              <h1 className="mt-5 max-w-hero font-display text-h1 font-semibold text-primary-fg sm:text-display">
                {t(lang, "app.tagline")}
              </h1>
              <p className="mt-4 max-w-hero text-lg text-primary-fg">
                {t(lang, "landing.lead")}
              </p>

              <div className="mt-8 flex w-full max-w-hero flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
                <Button href="/check" variant="primary" size="lg" icon={Camera}>
                  {t(lang, "cta.check.title")}
                </Button>
                <Button href="/assistant" variant="secondary" size="lg" icon={MessageCircle}>
                  {t(lang, "cta.assistant.title")}
                </Button>
              </div>

              <a
                href="#how"
                className="mt-10 flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-medium text-primary-fg transition-colors duration-150 hover:bg-surface hover:text-text"
              >
                {t(lang, "how.title")}
                <ChevronDown size={16} strokeWidth={1.75} aria-hidden />
              </a>
            </div>
          </div>
        </section>

        {/* Feature doors: what each tool does, in one line each */}
        <section className="mx-auto max-w-container px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/check"
              className="group block rounded-lg border border-border bg-surface p-5 shadow-sm transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md sm:p-6"
            >
              <Camera size={24} strokeWidth={1.75} aria-hidden className="text-primary" />
              <p className="mt-3 text-h3 font-semibold text-text">{t(lang, "cta.check.title")}</p>
              <p className="mt-1 text-sm text-text-secondary">{t(lang, "cta.check.desc")}</p>
            </Link>

            <Link
              href="/assistant"
              className="group block rounded-lg border border-border bg-surface p-5 shadow-sm transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md sm:p-6"
            >
              <MessageCircle size={24} strokeWidth={1.75} aria-hidden className="text-primary" />
              <p className="mt-3 text-h3 font-semibold text-text">{t(lang, "cta.assistant.title")}</p>
              <p className="mt-1 text-sm text-text-secondary">{t(lang, "cta.assistant.desc")}</p>
            </Link>
          </div>
        </section>

        {/* How it works: numbered flow with a connecting accent rule, not a card triptych (L1) */}
        <section id="how" className="mx-auto max-w-container scroll-mt-14 px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-h2 font-semibold text-text">{t(lang, "how.title")}</h2>
          <ol className="mt-8 flex flex-col gap-8 md:flex-row md:items-start md:gap-4">
            {steps.map((step, i) => (
              <li key={step} className="flex items-start gap-4 md:flex-1 md:flex-col md:gap-0">
                <div className="flex w-full items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent font-display text-lg font-semibold text-accent-strong">
                    {i + 1}
                  </span>
                  {i < steps.length - 1 && <span aria-hidden className="hidden h-px flex-1 bg-accent md:block" />}
                </div>
                <p className="pt-2 text-base font-medium text-text md:pt-3">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <Footer />
    </>
  );
}
