"use client";

import { LocateFixed, MapPin, ShieldCheck, Camera, MessageCircle, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PanelBack } from "@/components/explore/PanelBack";
import { OdalanNotice } from "@/components/explore/OdalanNotice";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";
import { formatDistance } from "@/lib/geo";
import { DUTY_BY_ICON, DUTY_LABEL, type Duty } from "@/lib/duty";
import type { Site } from "@/data/sites";
import { isDummySite } from "@/data/dummy-sites";

/**
 * Colour is never the only signal (guardrail C6, which survives the /explore
 * carve-out). Each marker carries its own word, so the three are still three
 * for a visitor who cannot separate indigo from red.
 */
const DUTY_CLASSES: Record<Duty, string> = {
  required: "border-primary/35 bg-primary-tint text-primary",
  forbidden: "border-status-bad-border bg-status-bad-bg text-status-bad-fg",
  conditional: "border-border-strong bg-surface-sunken text-text-secondary",
};

interface ZoneDutiesProps {
  site: Site;
  distanceM: number | null;
  /** Leaves the Zone panel for wherever it was opened from. */
  onBack: () => void;
  /** Opens the full Site brief underneath this one. */
  onDetail: () => void;
  /** Takes the question to the Assistant with this Site attached. */
  onAsk: () => void;
}

/**
 * The panel a visitor gets for standing inside a Zone.
 *
 * Deliberately not the Site brief. That panel answers "what is this place",
 * with a photograph, the two circles, and a reason folded under every rule; it
 * is written for somebody deciding whether to go. This one answers "what is
 * being asked of me, now that I am here", and it is written for somebody who
 * has already arrived and is about to take another step.
 *
 * So the Zone diagram is gone: it explains a feature to a visitor who is past
 * the point the feature was explaining. The illustrations and the folded
 * reasons are gone too, not because they are wrong but because they belong to
 * the reading screen, and they are one tap away on the button at the foot.
 *
 * Every sentence here is `custom.detail`, unedited. Nothing on this panel is
 * written for it, because a line that tells a visitor what they must do at a
 * temple is the last place in this app where new prose may appear.
 */
export function ZoneDuties({ site, distanceM, onBack, onDetail, onAsk }: ZoneDutiesProps) {
  const { lang } = useLang();

  return (
    <div>
      <PanelBack label={tExplore(lang, "explore.panel.back")} onClick={onBack} />

      {/* The arrival, said plainly and first. Everything below it is
          consequence, and a visitor who reads only the top of the panel has
          still been told the thing that changed. */}
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
        <LocateFixed size={15} strokeWidth={2} aria-hidden className="shrink-0" />
        {tExplore(lang, "explore.zone.overline")}
      </p>

      <h2 className="mt-1.5 font-display text-h3 font-semibold leading-tight text-text">
        {site.name}
      </h2>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-primary" />
          {site.region}
        </span>
        {distanceM !== null && (
          <>
            <span aria-hidden className="text-text-muted">
              ·
            </span>
            <span className="tabular-nums">{formatDistance(distanceM, lang)}</span>
          </>
        )}
      </p>

      <OdalanNotice site={site} />

      {/* The instruction to the visitor about the list, rather than a label
          naming it. "Adat di sini" describes a section; this asks for
          something, which is the difference the whole panel turns on. */}
      <p className="mt-6 border-t border-border-strong pt-5 text-base font-semibold leading-snug text-text">
        {tExplore(lang, "explore.zone.heading", { count: String(site.customs.length) })}
      </p>

      <ul className="mt-4 divide-y divide-border">
        {site.customs.map((custom) => {
          const duty = DUTY_BY_ICON[custom.icon];
          return (
            <li key={custom.id} className="py-4 first:pt-0">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <span
                  className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[0.6875rem] font-semibold uppercase leading-none tracking-wide ${DUTY_CLASSES[duty]}`}
                >
                  {tExplore(lang, DUTY_LABEL[duty])}
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  {custom.title[lang]}
                </span>
              </p>
              {/* The whole instruction, not the one-line version of it. A
                  visitor standing inside the Zone is the one person who needs
                  the sentence that says what to actually do with their hands. */}
              <p className="mt-2 text-base leading-relaxed text-text">{custom.detail[lang]}</p>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 flex items-start gap-2 text-xs text-text-muted">
        <ShieldCheck size={14} strokeWidth={1.75} aria-hidden className="mt-px shrink-0" />
        {isDummySite(site)
          ? site.source
          : tExplore(lang, "explore.detail.source", { source: site.source })}
      </p>

      <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5">
        <Button icon={Camera} href="/check" className="w-full">
          {tExplore(lang, "explore.detail.checkPhoto")}
        </Button>
        <Button variant="secondary" icon={MessageCircle} onClick={onAsk} className="w-full">
          {tExplore(lang, "explore.detail.ask")}
        </Button>
        {/* The way to everything this panel left out: the photograph, the two
            circles, and the reason under every rule. Last and quietest of the
            three, because reading about the place is not what a visitor who
            has just crossed the line most needs to do. */}
        <Button variant="ghost" icon={ScrollText} onClick={onDetail} className="w-full">
          {tExplore(lang, "explore.zone.detail")}
        </Button>
      </div>
    </div>
  );
}
