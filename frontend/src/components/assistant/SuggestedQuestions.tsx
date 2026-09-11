"use client";

import { Landmark, Camera, BookOpen, ChevronRight, Shirt, Flower2, Volume2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLang } from "@/lib/language";
import { t } from "@/lib/i18n";
import { HERE_QUESTION_KEY, questionKindsFor } from "@/lib/site-context-copy";
import { SITES, type Site } from "@/data/sites";
import type { SiteContext } from "@shared/contract";

interface Question {
  chipKey: "shorts" | "drone" | "canang";
  icon: LucideIcon;
}

const QUESTIONS: Question[] = [
  { chipKey: "shorts", icon: Landmark },
  { chipKey: "drone", icon: Camera },
  { chipKey: "canang", icon: BookOpen },
];

/** The face each kind of Custom wears in this list. Copy lives beside the rule. */
const KIND_ICON = {
  dress: Shirt,
  photography: Camera,
  offerings: Flower2,
  drones: Landmark,
  quiet: Volume2,
} as const;

/**
 * The Site behind a carried context, when the bundle knows it.
 *
 * `SiteContext` carries rule ids rather than Customs, so the Customs are looked
 * up here. A Dummy Site never reaches this: `siteContextFrom` returns null for
 * one, so nothing with an invented name is ever in `SITES` to find.
 */
function siteFor(context: SiteContext | null | undefined): Site | undefined {
  return context ? SITES.find((site) => site.id === context.id) : undefined;
}

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
  /**
   * The place the visitor arrived with. When it is set the questions are about
   * that Site instead of temples in general, which is the whole reason somebody
   * who just crossed an Approach is standing on this screen.
   */
  site?: SiteContext | null;
}

/**
 * Vertical list of suggested question rows shown below the topic explorer.
 * Each row sends the question directly when clicked.
 */
export function SuggestedQuestions({ onSelect, disabled = false, site }: SuggestedQuestionsProps) {
  const { lang } = useLang();

  const here = siteFor(site);
  const kinds = here ? questionKindsFor(here) : [];
  const rows = kinds.length
    ? kinds.map((kind) => ({
        id: kind,
        icon: KIND_ICON[kind],
        question: t(lang, HERE_QUESTION_KEY[kind], { site: here!.name }),
      }))
    : QUESTIONS.map(({ chipKey, icon }) => ({
        id: chipKey,
        icon,
        question: t(lang, `assistant.chip.${chipKey}`),
      }));

  const heading = kinds.length
    ? t(lang, "assistant.suggested.here")
    : t(lang, "assistant.suggested.heading");

  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-text-secondary">{heading}</h2>
      <div className="overflow-hidden rounded-lg border border-border" role="group" aria-label={heading}>
        {rows.map(({ id, icon: Icon, question }, i) => {
          const isLast = i === rows.length - 1;
          return (
            <button
              key={id}
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
