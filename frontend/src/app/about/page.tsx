"use client";

import {
  BookOpen,
  Compass,
  ExternalLink,
  HeartHandshake,
  Landmark,
  Lock,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Footer } from "@/components/layout/Footer";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

interface TeamMember {
  name: string;
  initials: string;
  role: string;
  focus: string;
}

const TEAM: TeamMember[] = [
  {
    name: "Daniyal Hafiidz Prasetyo",
    initials: "DH",
    role: "Lead & AI Integration",
    focus: "Gemini Vision & System Architecture",
  },
  {
    name: "Manu Caimpiyana Bhimasena",
    initials: "MC",
    role: "Frontend & UI/UX",
    focus: "Design System & Impeccable Craft",
  },
  {
    name: "Rafli Halomoan",
    initials: "RH",
    role: "Knowledge Base & QA",
    focus: "Balinese Customs KB & Verification",
  },
];

export default function AboutPage() {
  const { lang } = useLang();

  return (
    <>
      <div className="flex-1 pb-16 pt-8 sm:pt-12">
        <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header & Hero */}
          <header className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-accent-strong">
              {t(lang, "about.eyebrow")}
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl lg:text-h1">
              {t(lang, "about.title")}
            </h1>
            <p className="mt-3 text-lg font-medium leading-relaxed text-text sm:text-xl">
              {t(lang, "about.tagline")}
            </p>
          </header>

          <SectionDivider className="my-10" />

          {/* Meaning & Mission Section */}
          <section aria-labelledby="mission-heading" className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Meaning of Sasana */}
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-7">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-sunken text-accent-strong">
                  <BookOpen size={20} strokeWidth={1.75} aria-hidden />
                </div>
                <h2 id="meaning-heading" className="mt-5 font-display text-xl font-semibold text-text">
                  {t(lang, "about.etymology.title")}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {t(lang, "about.etymology.body")}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-accent-strong">
                <ScrollText size={15} strokeWidth={1.75} aria-hidden />
                <span>Tri Hita Karana · Desa Kala Patra</span>
              </div>
            </div>

            {/* Mission */}
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-7">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-primary-tint text-primary">
                  <Compass size={20} strokeWidth={1.75} aria-hidden />
                </div>
                <h2 id="mission-heading" className="mt-5 font-display text-xl font-semibold text-text">
                  {t(lang, "about.mission.title")}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {t(lang, "about.mission.body")}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-primary">
                <Sparkles size={15} strokeWidth={1.75} aria-hidden />
                <span>Real-time · Bilingual · Educational</span>
              </div>
            </div>
          </section>

          {/* Guiding Principles */}
          <section aria-labelledby="principles-heading" className="mt-12">
            <h2 id="principles-heading" className="font-display text-h2 font-semibold text-text">
              {t(lang, "about.principles.title")}
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              {([
                {
                  icon: Landmark,
                  titleKey: "about.p1.title" as const,
                  descKey: "about.p1.desc" as const,
                },
                {
                  icon: HeartHandshake,
                  titleKey: "about.p2.title" as const,
                  descKey: "about.p2.desc" as const,
                },
                {
                  icon: ShieldCheck,
                  titleKey: "about.p3.title" as const,
                  descKey: "about.p3.desc" as const,
                },
              ] as const).map(({ icon: PrincipleIcon, titleKey, descKey }) => (
                <div
                  key={titleKey}
                  className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-sunken text-primary">
                    <PrincipleIcon size={18} strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-text">
                    {t(lang, titleKey)}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-text-secondary sm:text-sm">
                    {t(lang, descKey)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Official Regulation & Legal Reference */}
          <section aria-labelledby="rules-heading" className="mt-12">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-accent/10 text-accent-strong">
                  <ShieldCheck size={26} strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-strong">
                      {t(lang, "about.rules.badge")}
                    </span>
                    <span className="text-xs font-medium text-text-muted">
                      Pemerintah Provinsi Bali
                    </span>
                  </div>
                  <h2 id="rules-heading" className="mt-2 font-display text-xl font-semibold text-text sm:text-2xl">
                    {t(lang, "about.rules.title")}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary sm:text-base">
                    {t(lang, "about.rules.body")}
                  </p>

                  <div className="mt-5">
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
            </div>
          </section>

          {/* Privacy Guarantee */}
          <section aria-labelledby="privacy-heading" className="mt-8">
            <div className="rounded-2xl border border-border bg-surface-sunken/60 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-primary">
                  <Lock size={18} strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 id="privacy-heading" className="text-sm font-semibold text-text sm:text-base">
                    {t(lang, "about.privacy.title")}
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-text-secondary sm:text-sm">
                    {t(lang, "about.privacy.body")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Engineering Team */}
          <section aria-labelledby="team-heading" className="mt-12">
            <div className="flex items-center gap-2 text-accent-strong">
              <Users size={18} strokeWidth={1.75} aria-hidden />
              <h2 id="team-heading" className="font-display text-h2 font-semibold text-text">
                {t(lang, "about.team.title")}
              </h2>
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              {t(lang, "about.team.subtitle")}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {TEAM.map((member) => (
                <div
                  key={member.name}
                  className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-150 hover:border-border-strong hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-tint font-display text-sm font-bold text-primary">
                    {member.initials}
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-text sm:text-base">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-primary">
                    {member.role}
                  </p>
                  <p className="mt-2 text-xs text-text-muted">
                    {member.focus}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
              <span>{t(lang, "about.team.org")}</span>
              <span>{t(lang, "about.version")}</span>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}
