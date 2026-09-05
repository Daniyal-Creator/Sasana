"use client";

import { Landmark, BookOpen, MapPin, Camera } from "lucide-react";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

const TOPICS = [
  { key: "etiquette" as const, icon: Landmark },
  { key: "customs" as const, icon: BookOpen },
  { key: "sites" as const, icon: MapPin },
  { key: "photo" as const, icon: Camera },
] as const;

interface MobileTopicChipsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

/**
 * Horizontal scrolling topic chips for mobile, replacing the sidebar.
 * Visible on <lg only (hidden on lg+).
 */
export function MobileTopicChips({ onSelect, disabled = false }: MobileTopicChipsProps) {
  const { lang } = useLang();

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 lg:hidden"
      role="group"
      aria-label={t(lang, "assistant.sidebar.explore")}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {TOPICS.map(({ key, icon: Icon }) => (
        <button
          key={key}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(t(lang, `assistant.topic.${key}.prompt`))}
          className={[
            "flex shrink-0 items-center gap-1.5 rounded-full border border-border-strong bg-surface px-3 py-2 text-xs font-medium",
            "transition-colors duration-150 ease-out active:scale-[0.98]",
            disabled
              ? "cursor-not-allowed text-text-muted"
              : "text-text hover:bg-primary-tint hover:text-primary",
          ].join(" ")}
        >
          <Icon size={14} strokeWidth={1.75} aria-hidden />
          {t(lang, `assistant.topic.${key}`)}
        </button>
      ))}
    </div>
  );
}
