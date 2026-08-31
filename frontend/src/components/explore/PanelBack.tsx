"use client";

import { ChevronLeft } from "lucide-react";

interface PanelBackProps {
  label: string;
  onClick: () => void;
}

/**
 * The way back out of whatever the panel has turned into.
 *
 * The panel replaces its own contents rather than navigating, so the browser's
 * back button is not the way home and every layer that replaces another has to
 * offer one of these. One component rather than a copy per layer: two back
 * controls that drift apart is two different products in one panel.
 */
export function PanelBack({ label, onClick }: PanelBackProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-ml-2 mb-3 flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-primary transition-colors duration-150 hover:bg-primary-tint focus-visible:shadow-focus"
    >
      <ChevronLeft size={18} strokeWidth={1.75} aria-hidden className="shrink-0" />
      {label}
    </button>
  );
}
