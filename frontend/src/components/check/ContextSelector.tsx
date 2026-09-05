"use client";

import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

export type CheckContext = "temple" | "general";

interface ContextSelectorProps {
  value: CheckContext;
  onChange: (c: CheckContext) => void;
  disabled?: boolean;
}

const OPTIONS: CheckContext[] = ["temple", "general"];

export function ContextSelector({ value, onChange, disabled = false }: ContextSelectorProps) {
  const { lang } = useLang();
  const activeIndex = OPTIONS.indexOf(value);

  return (
    <div
      role="radiogroup"
      aria-label={t(lang, "check.context.label")}
      className="relative grid h-11 w-full grid-cols-2 rounded-xl border border-border bg-surface p-1 shadow-sm"
    >
      <span
        aria-hidden
        className={[
          "absolute left-1 top-1 h-9 w-[calc(50%-4px)] rounded-lg bg-primary",
          "transition-transform duration-200 ease-out-quart",
          activeIndex === 1 ? "translate-x-full" : "translate-x-0",
        ].join(" ")}
      />
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          disabled={disabled}
          onClick={() => onChange(option)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              onChange(value === "temple" ? "general" : "temple");
            }
          }}
          className={[
            "relative z-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors duration-200 ease-out",
            value === option ? "text-primary-fg" : "text-text-secondary hover:text-text",
            disabled ? "cursor-not-allowed opacity-60" : "",
          ].join(" ")}
        >
          {t(lang, option === "temple" ? "check.context.temple" : "check.context.general")}
        </button>
      ))}
    </div>
  );
}
