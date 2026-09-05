"use client";

import { Clock, MapPin, Smartphone } from "lucide-react";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import type { PhotoMeta } from "@shared/contract";

/**
 * What travels with the photo, shown to the person it belongs to.
 *
 * The check now sends more than pixels, so the visitor gets to see exactly what
 * that is before they press Analyze. Location is the one field they have to ask
 * for: the browser's own permission prompt is the consent, and this row is the
 * reason it appears.
 */

export type LocationPhase = "idle" | "locating" | "unavailable";

interface PhotoMetaBarProps {
  meta: PhotoMeta;
  /** Camera make and model. Shown here, never sent to the server. */
  device?: string;
  /** The Site the coordinates landed in, when they landed in one. */
  siteName?: string;
  phase: LocationPhase;
  onAddLocation: () => void;
  disabled?: boolean;
}

/** `2026-09-05T17:42:11` as the visitor's own clock would read it. */
function formatTaken(takenAt: string, lang: Lang): string {
  const parsed = new Date(takenAt);
  if (Number.isNaN(parsed.getTime())) return takenAt;
  return new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export function PhotoMetaBar({
  meta,
  device,
  siteName,
  phase,
  onAddLocation,
  disabled = false,
}: PhotoMetaBarProps) {
  const { lang } = useLang();

  return (
    <div className="mt-3 rounded-xl border border-border bg-surface px-3 py-2.5">
      <p className="text-xs font-semibold text-text-secondary">{t(lang, "check.meta.title")}</p>

      <ul className="mt-1.5 space-y-1.5 text-xs text-text-secondary">
        {meta.takenAt && (
          <li className="flex items-center gap-2">
            <Clock size={14} strokeWidth={1.75} aria-hidden className="shrink-0 text-text-muted" />
            <span>
              {t(lang, "check.meta.time", { time: formatTaken(meta.takenAt, lang) })}
              {meta.timeSource === "file" && ` ${t(lang, "check.meta.timeApprox")}`}
            </span>
          </li>
        )}

        <li className="flex flex-wrap items-center gap-2">
          <MapPin size={14} strokeWidth={1.75} aria-hidden className="shrink-0 text-text-muted" />
          {meta.coords ? (
            <span>
              {siteName
                ? t(lang, "check.meta.site", { name: siteName })
                : t(lang, "check.meta.location", {
                    lat: meta.coords.lat.toFixed(4),
                    lng: meta.coords.lng.toFixed(4),
                  })}
            </span>
          ) : phase === "locating" ? (
            <span role="status">{t(lang, "check.meta.locating")}</span>
          ) : (
            <>
              <span>
                {phase === "unavailable"
                  ? t(lang, "check.meta.locationUnavailable")
                  : t(lang, "check.meta.locationNone")}
              </span>
              <button
                type="button"
                onClick={onAddLocation}
                disabled={disabled}
                className="font-medium text-primary underline underline-offset-4 transition-colors duration-150 hover:text-primary-hover focus-visible:shadow-focus disabled:cursor-not-allowed disabled:text-text-muted"
              >
                {t(lang, "check.meta.locationAdd")}
              </button>
            </>
          )}
        </li>

        {device && (
          <li className="flex items-center gap-2">
            <Smartphone size={14} strokeWidth={1.75} aria-hidden className="shrink-0 text-text-muted" />
            <span>{t(lang, "check.meta.device", { device })}</span>
          </li>
        )}
      </ul>
    </div>
  );
}
