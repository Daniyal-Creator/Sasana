"use client";

import { useSearchParams } from "next/navigation";
import { Bell } from "lucide-react";
import { useLang } from "@/lib/language";
import { tExplore } from "@/lib/i18n.explore";
import type { Lang } from "@/lib/i18n";
import type { Site, Odalan } from "@/data/sites";

const ODALAN_WINDOW_DAYS = 7;

function daysUntil(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - midnight.getTime()) / 86_400_000);
}

function formatOdalanDate(dateStr: string, lang: Lang): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-GB", {
    day: "numeric",
    month: "long",
  }).format(new Date(y, m - 1, d));
}

/**
 * The ceremony worth mentioning, if there is one inside the window.
 *
 * `force` is the demo switch that used to live on the detail route: `?odalan=1`
 * shows the notice for the nearest recorded ceremony whatever its date. It
 * exists so the notice can be seen without waiting for a real one, which is the
 * only alternative that does not involve typing a date that is not true
 * (ADR-0004).
 */
export function upcomingOdalan(site: Site, force: boolean): Odalan | undefined {
  if (force) return site.odalan[0];
  return site.odalan.find((entry) => {
    const days = daysUntil(entry.date);
    return days >= 0 && days <= ODALAN_WINDOW_DAYS;
  });
}

/**
 * A dated ceremony notice, or nothing.
 *
 * One component rather than a copy in each panel that wants it. Both the Site
 * brief and the Zone panel show this, and a ceremony notice that says one thing
 * on one screen and something else on the next is the class of mistake this app
 * exists to avoid.
 */
export function OdalanNotice({ site }: { site: Site }) {
  const { lang } = useLang();
  const searchParams = useSearchParams();
  const odalan = upcomingOdalan(site, searchParams.get("odalan") === "1");

  if (!odalan) return null;

  return (
    <div className="mt-4 rounded-md border border-status-warn-border bg-status-warn-bg p-3">
      <p className="flex items-start gap-2 text-sm font-medium text-status-warn-fg">
        <Bell size={16} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0" />
        {tExplore(lang, "explore.detail.odalan.title", {
          date: formatOdalanDate(odalan.date, lang),
        })}
      </p>
      <p className="mt-1 pl-6 text-sm text-status-warn-fg">
        {tExplore(lang, "explore.detail.odalan.body")}
      </p>
    </div>
  );
}
