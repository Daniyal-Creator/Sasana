"use client";

import { ExternalLink, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

const TEAM = [
  { name: "Daniyal Hafiidz Prasetyo", role: "Lead · AI integration" },
  { name: "Manu Caimpiyana Bhimasena", role: "Frontend · UI/UX" },
  { name: "Rafli Halomoan", role: "Knowledge base · Testing · Demo" },
];

export default function AboutPage() {
  const { lang } = useLang();

  return (
    <>
      <div className="mx-auto w-full max-w-prose flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="font-display text-h1 font-semibold text-text">{t(lang, "about.title")}</h1>

        <section className="mt-8">
          <h2 className="font-display text-h2 font-semibold text-text">{t(lang, "about.mission.title")}</h2>
          <p className="mt-3 text-base text-text-secondary">{t(lang, "about.mission.body")}</p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-h2 font-semibold text-text">{t(lang, "about.rules.title")}</h2>
          <Card className="mt-4" padding="lg">
            <div className="flex items-start gap-3">
              <ShieldCheck size={24} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-accent-strong" />
              <div>
                <p className="text-base font-medium text-text">{t(lang, "about.rules.body")}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ExternalLink}
                  iconPosition="trailing"
                  href="https://www.baliprov.go.id"
                  className="mt-3 -ml-3"
                >
                  {t(lang, "about.rules.link")}
                </Button>
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-h2 font-semibold text-text">{t(lang, "about.team.title")}</h2>
          <p className="mt-3 text-base font-medium text-text">{t(lang, "about.team.org")}</p>
          <ul className="mt-3 space-y-2">
            {TEAM.map((member) => (
              <li key={member.name} className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-base text-text">{member.name}</span>
                <span className="text-sm text-text-muted">{member.role}</span>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-12 text-sm text-text-muted">{t(lang, "about.version")}</p>
      </div>
      <Footer />
    </>
  );
}
