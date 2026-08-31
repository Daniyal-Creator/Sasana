"use client";

import { Landmark, BookOpen, MapPin, Camera, ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

const TOPICS = [
  { key: "etiquette" as const, icon: Landmark },
  { key: "customs" as const, icon: BookOpen },
  { key: "sites" as const, icon: MapPin },
  { key: "photo" as const, icon: Camera },
] as const;

interface GuideSidebarProps {
  onTopicSelect: (prompt: string) => void;
  disabled?: boolean;
}

/**
 * Sidebar for the assistant page (visible on lg+ only).
 * Contains topic navigation + source trust section.
 */
export function GuideSidebar({ onTopicSelect, disabled = false }: GuideSidebarProps) {
  const { lang } = useLang();

  return (
    <nav aria-label={t(lang, "assistant.sidebar.title")} className="flex flex-col gap-8">
      {/* Title */}
      <h2 className="font-display text-h3 font-semibold text-text">
        {t(lang, "assistant.sidebar.title")}
      </h2>

      {/* Explore section */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-muted">
          {t(lang, "assistant.sidebar.explore")}
        </p>
        <ul className="space-y-1">
          {TOPICS.map(({ key, icon: Icon }) => (
            <li key={key}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onTopicSelect(t(lang, `assistant.topic.${key}.prompt`))}
                className={[
                  "flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-sm text-text",
                  "transition-colors duration-150 ease-out",
                  disabled
                    ? "cursor-not-allowed text-text-muted"
                    : "hover:bg-primary-tint hover:text-primary",
                ].join(" ")}
              >
                <Icon size={20} strokeWidth={1.75} className="shrink-0" aria-hidden />
                {t(lang, `assistant.topic.${key}`)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* About sources */}
      <div className="border-t border-border pt-5">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
          <ShieldCheck size={14} strokeWidth={1.75} aria-hidden className="text-accent-strong" />
          {t(lang, "assistant.sidebar.about.title")}
        </p>
        <p className="text-sm leading-relaxed text-text-secondary">
          {t(lang, "assistant.sidebar.about.body")}
        </p>
      </div>
    </nav>
  );
}
