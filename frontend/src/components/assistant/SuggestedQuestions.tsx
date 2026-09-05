"use client";

import { Landmark, Camera, BookOpen, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";

interface Question {
  chipKey: "shorts" | "drone" | "canang";
  icon: LucideIcon;
}

const QUESTIONS: Question[] = [
  { chipKey: "shorts", icon: Landmark },
  { chipKey: "drone", icon: Camera },
  { chipKey: "canang", icon: BookOpen },
];

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

/**
 * Vertical list of suggested question rows shown below the topic explorer.
 * Each row sends the question directly when clicked.
 */
export function SuggestedQuestions({ onSelect, disabled = false }: SuggestedQuestionsProps) {
  const { lang } = useLang();

  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-text-secondary">
        {t(lang, "assistant.suggested.heading")}
      </h2>
      <div className="overflow-hidden rounded-lg border border-border" role="group" aria-label={t(lang, "assistant.suggested.heading")}>
        {QUESTIONS.map(({ chipKey, icon: Icon }, i) => {
          const question = t(lang, `assistant.chip.${chipKey}`);
          const isLast = i === QUESTIONS.length - 1;
          return (
            <button
              key={chipKey}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(question)}
              className={[
                "flex w-full items-center gap-3 bg-surface px-4 py-3 text-left text-sm text-text",
                "transition-colors duration-150 ease-out",
                !isLast && "border-b border-border",
                disabled ? "cursor-not-allowed opacity-60" : "hover:bg-primary-tint",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <Icon size={16} strokeWidth={1.75} className="shrink-0 text-primary" aria-hidden />
              <span className="flex-1">{question}</span>
              <ChevronRight size={16} strokeWidth={1.75} className="shrink-0 text-text-muted" aria-hidden />
            </button>
          );
        })}
      </div>
    </div>
  );
}
