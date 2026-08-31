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

const STAGGER_CLASSES = ["", "stagger-delay-1", "stagger-delay-2", "stagger-delay-3"];

interface TopicExplorerProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

/**
 * 2x2 grid of topic cards for the assistant welcome state.
 * Clicking a card injects its prompt into the chat.
 */
export function TopicExplorer({ onSelect, disabled = false }: TopicExplorerProps) {
  const { lang } = useLang();

  return (
    <div>
      <h2 className="mb-4 text-sm font-medium text-text-secondary">
        {t(lang, "assistant.explore.heading")}
      </h2>
      <div className="grid grid-cols-2 gap-3" role="group" aria-label={t(lang, "assistant.explore.heading")}>
        {TOPICS.map(({ key, icon: Icon }, i) => (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(t(lang, `assistant.topic.${key}.prompt`))}
            className={[
              "animate-staggerIn flex flex-col items-start gap-2 rounded-lg border border-border bg-surface p-4 text-left shadow-sm",
              "transition-[transform,border-color,box-shadow] duration-200 ease-out",
              disabled
                ? "cursor-not-allowed opacity-60"
                : "hover:-translate-y-0.5 hover:border-accent hover:shadow-md active:scale-[0.98]",
              STAGGER_CLASSES[i],
            ].join(" ")}
          >
            <Icon size={20} strokeWidth={1.75} className="text-primary" aria-hidden />
            <span className="text-sm font-medium text-text">
              {t(lang, `assistant.topic.${key}`)}
            </span>
            <span className="text-xs leading-snug text-text-secondary">
              {t(lang, `assistant.topic.${key}.desc`)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
