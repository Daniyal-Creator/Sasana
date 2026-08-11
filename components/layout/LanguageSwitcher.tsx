"use client";

import { useLang } from "@/lib/language";
import { t, type Lang } from "@/lib/i18n";

const SEGMENTS: Lang[] = ["id", "en"];

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const activeIndex = SEGMENTS.indexOf(lang);

  return (
    <div
      role="group"
      aria-label={t(lang, "lang.label")}
      className="relative flex items-center rounded-full border border-border bg-surface p-1"
    >
      <span
        aria-hidden
        className={[
          "absolute left-1 top-1 h-8 w-11 rounded-full bg-primary",
          "transition-transform duration-200 ease-out-quart",
          activeIndex === 1 ? "translate-x-full" : "translate-x-0",
        ].join(" ")}
      />
      {SEGMENTS.map((segment) => (
        <button
          key={segment}
          type="button"
          aria-pressed={lang === segment}
          onClick={() => setLang(segment)}
          className={[
            "relative z-10 h-8 w-11 rounded-full text-sm font-medium",
            "transition-colors duration-200 ease-out",
            lang === segment ? "text-primary-fg" : "text-text-secondary hover:text-primary",
          ].join(" ")}
        >
          {segment.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
