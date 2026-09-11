"use client";

import { CornerDownLeft } from "lucide-react";

interface Chip {
  /** Stable across renders, so React keeps the element when the list shifts. */
  id: string;
  /** What the chip says. Short, because the answer it belongs to is right above it. */
  label: string;
  /**
   * What the chip sends, which is longer and says more.
   *
   * A screen reader hears this rather than the label: somebody who cannot see
   * the answer above the chip has none of the context that lets "Kenapa
   * begitu?" mean anything.
   */
  question: string;
}

interface ChipRowProps {
  chips: Chip[];
  onPick: (chip: Chip) => void;
  disabled?: boolean;
  /** Named for screen readers. There is no visible heading, on purpose. */
  label: string;
}

/**
 * A row of follow-up questions, offered above a composer.
 *
 * Deliberately NOT the welcome screen's `TopicExplorer` card or
 * `SuggestedQuestions` row. Those mean "here is somewhere to start"; this one
 * sits under an answer and means "here is something to say back", and two
 * different meanings wearing the same clothes is how an interface stops being
 * read.
 *
 * So it is recessed rather than raised: `surface-sunken` against the page, with
 * secondary ink, under a composer that is `surface` with a shadow. The eye
 * takes the composer as the thing being offered and these as what came before
 * it. Hovering lifts a chip into primary, which is the only moment it competes.
 *
 * The corner-return glyph carries the meaning that the colour cannot. It is the
 * same redundancy the status bands use: never the colour alone.
 */
export function ChipRow({ chips, onPick, disabled = false, label }: ChipRowProps) {
  if (chips.length === 0) return null;

  return (
    <div
      role="group"
      aria-label={label}
      // Horizontal scroll rather than a second line. The composer is sticky to
      // the bottom of a 375px screen and a wrapped row would push the message
      // a visitor is replying to off the top of it.
      //
      // A chip carries a whole question, so on a narrow screen the row is
      // always wider than the screen and the last chip is always cut. The mask
      // is what stops that reading as a rendering fault: the cut edge fades
      // instead of stopping dead, which is the one thing that says "keep
      // going". A mask, not a painted background, which is the scroll-edge
      // mask DL1 names (Guardrails 2.2). It is dropped from `sm` up, where
      // the row wraps and nothing is ever clipped.
      className={[
        "-mx-1 flex gap-2 overflow-x-auto px-1 pb-2",
        "[mask-image:linear-gradient(to_right,#000_calc(100%-32px),transparent)]",
        "sm:flex-wrap sm:overflow-x-visible sm:[mask-image:none]",
      ].join(" ")}
      style={{ scrollbarWidth: "none" }}
    >
      {chips.map((chip, i) => (
        <button
          key={chip.id}
          type="button"
          disabled={disabled}
          onClick={() => onPick(chip)}
          aria-label={chip.question}
          style={{ animationDelay: `${i * 50}ms` }}
          className={[
            "flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border",
            "bg-surface-sunken px-3.5 text-sm text-text-secondary whitespace-nowrap",
            "animate-staggerIn transition-colors duration-150 ease-out",
            "focus-visible:outline-none focus-visible:shadow-focus",
            disabled
              ? "cursor-not-allowed opacity-60"
              : "hover:border-border-strong hover:bg-primary-tint hover:text-primary active:scale-[0.98]",
          ].join(" ")}
        >
          <CornerDownLeft size={14} strokeWidth={1.75} aria-hidden className="shrink-0" />
          {chip.label}
        </button>
      ))}
    </div>
  );
}
