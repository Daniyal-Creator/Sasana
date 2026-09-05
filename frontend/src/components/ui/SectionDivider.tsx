/**
 * Artistic Section Divider for SASANA landing page.
 *
 * Grounded in authentic Balinese sacred geometry:
 * Features a stylized Padma (sacred lotus) rosette flanked by Prada gold hairlines
 * and subtle geometric diamond beads (patra motif).
 *
 * Fully compliant with Design Guardrails:
 * - Single-hue alpha variations only (no multi-hue ramps)
 * - Restrained accent gold (<= 10% coverage)
 * - Real SVG geometric vectors (no stock illustrations, no emoji)
 */

import { useScrollFadeUp } from "@/lib/useScrollFadeUp";

interface SectionDividerProps {
  className?: string;
}

export function SectionDivider({ className = "" }: SectionDividerProps) {
  const dividerRef = useScrollFadeUp<HTMLDivElement>({
    y: 6,
    duration: 0.35,
  });

  return (
    <div
      ref={dividerRef}
      role="separator"
      aria-hidden="true"
      className={`mx-auto flex max-w-container items-center justify-center gap-3 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 ${className}`}
    >
      {/* Left Hairline */}
      <div className="h-px flex-1 bg-border" />

      {/* Flanking Left Diamond Bead */}
      <div className="h-1.5 w-1.5 rotate-45 rounded-[0.5px] bg-accent/50" />

      {/* Center Balinese Padma (Lotus) Geometric Rosette */}
      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/40 bg-surface text-accent-strong shadow-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          {/* Central sacred diamond core */}
          <rect x="9.5" y="9.5" width="5" height="5" transform="rotate(45 12 12)" fill="currentColor" fillOpacity="0.15" />
          
          {/* 4 cardinal lotus petals (Padma Nawa Sanga) */}
          <path d="M12 3C12 7 9 9 9 12C9 15 12 17 12 21" />
          <path d="M12 3C12 7 15 9 15 12C15 15 12 17 12 21" />
          <path d="M3 12C7 12 9 9 12 9C15 9 17 12 21 12" />
          <path d="M3 12C7 12 9 15 12 15C15 15 17 12 21 12" />
          
          {/* Corner accent nodes */}
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </div>

      {/* Flanking Right Diamond Bead */}
      <div className="h-1.5 w-1.5 rotate-45 rounded-[0.5px] bg-accent/50" />

      {/* Right Hairline */}
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
