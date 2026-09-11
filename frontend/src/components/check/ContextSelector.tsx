"use client";

import { Image as ImageIcon } from "lucide-react";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

export type CheckContext = "temple" | "general";

interface ContextSelectorProps {
  value: CheckContext;
  onChange: (c: CheckContext) => void;
  disabled?: boolean;
}

const OPTIONS: CheckContext[] = ["temple", "general"];

/**
 * 3-tier Balinese Meru Pagoda vector icon for the temple context option.
 */
function MeruIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      {/* Spire apex */}
      <path d="M12 1.5c-.3 0-.5.2-.5.5v2h1v-2c0-.3-.2-.5-.5-.5z" />
      {/* Tier 3 roof (top) */}
      <path d="M12 3.8l2.6 2H9.4L12 3.8z" />
      <rect x="8.5" y="5.8" width="7" height="0.9" rx="0.3" />
      {/* Tier 2 roof (middle) */}
      <path d="M12 7l3.6 2.2H8.4L12 7z" />
      <rect x="7.2" y="9.2" width="9.6" height="0.9" rx="0.3" />
      {/* Tier 1 roof (bottom) */}
      <path d="M12 10.4l4.6 2.4H7.4L12 10.4z" />
      <rect x="6" y="12.8" width="12" height="0.9" rx="0.3" />
      {/* Shrine pillar body */}
      <rect x="9" y="13.8" width="6" height="3" rx="0.2" />
      {/* Plinth stepped base */}
      <rect x="5.5" y="16.8" width="13" height="1.4" rx="0.3" />
      <path d="M4 19.4c2.2-.8 4.5-.8 8-.8s5.8 0 8 .8v1.2H4v-1.2z" />
    </svg>
  );
}

export function ContextSelector({ value, onChange, disabled = false }: ContextSelectorProps) {
  const { lang } = useLang();
  const activeIndex = OPTIONS.indexOf(value);

  return (
    <div
      role="radiogroup"
      aria-label={t(lang, "check.context.label")}
      className="relative grid h-11 w-full grid-cols-2 rounded-full border border-border bg-surface p-1 shadow-sm"
    >
      <span
        aria-hidden
        className={[
          "absolute left-1 top-1 h-9 w-[calc(50%-4px)] rounded-full bg-primary shadow-sm",
          "transition-transform duration-200 ease-out-quart",
          activeIndex === 1 ? "translate-x-full" : "translate-x-0",
        ].join(" ")}
      />
      {OPTIONS.map((option) => {
        const isSelected = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(option)}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                e.preventDefault();
                onChange(value === "temple" ? "general" : "temple");
              }
            }}
            className={[
              "relative z-10 flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors duration-200 ease-out",
              isSelected ? "text-primary-fg" : "text-text-secondary hover:text-text",
              disabled ? "cursor-not-allowed opacity-60" : "",
            ].join(" ")}
          >
            {option === "temple" ? (
              <MeruIcon size={18} className="shrink-0" />
            ) : (
              <ImageIcon size={18} strokeWidth={1.75} aria-hidden className="shrink-0" />
            )}
            <span>{t(lang, option === "temple" ? "check.context.temple" : "check.context.general")}</span>
          </button>
        );
      })}
    </div>
  );
}
