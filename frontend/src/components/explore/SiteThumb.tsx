import { MERU_BASE, MERU_PATHS } from "@/components/explore/meru";

interface SiteThumbProps {
  /** Sized to the row it sits in. 48 in the list, larger where a Site is the subject. */
  size?: number;
  className?: string;
}

/**
 * The tile at the head of a Site row.
 *
 * It is a thumbnail slot, and what fills it is a meru pictogram rather than a
 * photograph. Two reasons, and neither is a placeholder waiting to be replaced
 * by a stock image:
 *
 * Guardrail I4 forbids synthetic imagery of Balinese temples outright, and the
 * repository holds no licensed photographs of the six real Sites. A Dummy Site
 * makes it sharper still: a photograph of a place that does not exist is the
 * one thing ADR-0012 draws its line against.
 *
 * If licensed photographs of the real Sites ever arrive, this is where they
 * belong, and the surrounding layout does not move.
 */
export function SiteThumb({ size = 48, className = "" }: SiteThumbProps) {
  return (
    <span
      aria-hidden
      className={[
        "grid shrink-0 place-items-center rounded-md border border-border bg-surface-sunken text-primary",
        className,
      ].join(" ")}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        width={Math.round(size * 0.54)}
        height={Math.round(size * 0.54)}
        fill="currentColor"
        focusable="false"
      >
        {MERU_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
        <rect {...MERU_BASE} />
      </svg>
    </span>
  );
}
