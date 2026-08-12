"use client";

interface QuickChipsProps {
  chips: string[];
  onPick: (question: string) => void;
  disabled?: boolean;
}

export function QuickChips({ chips, onPick, disabled = false }: QuickChipsProps) {
  return (
    <div role="group" aria-label="Example questions" className="flex flex-wrap justify-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip}
          type="button"
          disabled={disabled}
          onClick={() => onPick(chip)}
          className={[
            "h-10 rounded-full border border-border-strong bg-surface px-4 text-sm font-medium text-primary",
            "transition-colors duration-150 ease-out active:scale-[0.98]",
            disabled ? "cursor-not-allowed text-text-muted" : "hover:bg-primary-tint",
          ].join(" ")}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
