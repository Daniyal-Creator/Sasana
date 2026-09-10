"use client";

import { MapPin, X } from "lucide-react";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";
import { formatDistance } from "@/lib/geo";
import { positionLine } from "@/lib/site-context-copy";
import type { Proximity, SiteContext } from "@shared/contract";

interface SiteContextCardProps {
  site: SiteContext;
  /**
   * Where the visitor was standing when they left Explore, while that is still
   * recent enough to say. Null once it expires, and the card then keeps the
   * place and drops the distance rather than disappearing: the Site outlives
   * the fix.
   */
  proximity: Proximity | null;
  /**
   * Lets go of the place entirely. The caller has to clear the stored Site too,
   * not just this card: a card that vanishes while the Site keeps riding along
   * on every question is a screen lying about what it is doing.
   */
  onClear: () => void;
}

/**
 * What the visitor brought with them from Explore, said out loud.
 *
 * Until this existed the context travelled invisibly. `POST /api/chat` carried
 * the Site and the position, the answer was shaped by both, and the screen gave
 * no sign of either, so a visitor landing here saw the same blank prompt as
 * somebody who arrived from the menu and had no reason to ask "what should I do
 * here". The card is the difference between the app knowing where they are and
 * the visitor knowing that it knows.
 *
 * Deliberately not a chat bubble. A bubble from Sasana reads as Sasana
 * speaking, and nothing was said - no model has been called yet. This is a note
 * about the conversation rather than a turn in it, so it sits above the thread
 * and stays put while the thread scrolls.
 */
export function SiteContextCard({ site, proximity, onClear }: SiteContextCardProps) {
  const { lang } = useLang();

  const line = positionLine(proximity);
  const position = line
    ? t(
        lang,
        line.key,
        line.withDistance ? { distance: formatDistance(proximity!.distanceM, lang) } : undefined,
      )
    : null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3">
      <MapPin size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-primary" aria-hidden />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text">
          {t(lang, "assistant.context.about", { site: site.name })}
        </p>
        <p className="mt-0.5 text-xs text-text-secondary">
          {position ?? t(lang, "assistant.context.explain")}
        </p>
      </div>

      <button
        type="button"
        onClick={onClear}
        aria-label={t(lang, "assistant.context.clear")}
        className="-mr-1 shrink-0 rounded-md p-1.5 text-text-muted transition-colors duration-150 ease-out hover:bg-primary-tint hover:text-text focus-visible:shadow-focus"
      >
        <X size={16} strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  );
}
