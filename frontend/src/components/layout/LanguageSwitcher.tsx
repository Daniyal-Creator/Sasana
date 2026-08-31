"use client";

import { useLang } from "@/lib/language";
import { t, type Lang } from "@/lib/i18n";

const SEGMENTS: Lang[] = ["id", "en"];

export function LanguageSwitcher({ variant = "default" }: { variant?: "default" | "hero" }) {
  const { lang, setLang } = useLang();
  const activeIndex = SEGMENTS.indexOf(lang);

  if (variant === "hero") {
    return (
      <div
        role="group"
        aria-label={t(lang, "lang.label")}
        className="flex items-center rounded-full bg-[#c09965]/90 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-white shadow-sm transition-all duration-150 hover:bg-[#b08752]"
      >
        <button
          type="button"
          aria-pressed={lang === "id"}
          onClick={() => setLang("id")}
          className={`transition-opacity ${lang === "id" ? "font-bold text-white opacity-100 underline underline-offset-2" : "text-white/80 opacity-80 hover:opacity-100"}`}
        >
          ID
        </button>
        <span className="mx-1.5 text-white/60">/</span>
        <button
          type="button"
          aria-pressed={lang === "en"}
          onClick={() => setLang("en")}
          className={`transition-opacity ${lang === "en" ? "font-bold text-white opacity-100 underline underline-offset-2" : "text-white/80 opacity-80 hover:opacity-100"}`}
        >
          EN
        </button>
      </div>
    );
  }

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

