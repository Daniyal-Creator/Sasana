interface SkeletonProps {
  variant?: "text" | "block" | "card";
  lines?: number;
  className?: string;
}

// Mirrors the ResultCard shape for the "card" variant so nothing shifts on load
// (ui-spec §5.5). Shimmer is the one permitted gradient here (guardrails §2.2).
export function Skeleton({ variant = "block", lines = 3, className = "" }: SkeletonProps) {
  if (variant === "text") {
    return (
      <div aria-hidden className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 rounded-sm bg-surface-sunken skeleton-shimmer ${i === lines - 1 ? "w-2/3" : "w-full"}`}
          />
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div aria-hidden className={`overflow-hidden rounded-lg border border-border bg-surface ${className}`}>
        <div className="h-12 bg-surface-sunken skeleton-shimmer" />
        <div className="space-y-3 p-5">
          <div className="h-4 w-full rounded-sm bg-surface-sunken skeleton-shimmer" />
          <div className="h-4 w-3/4 rounded-sm bg-surface-sunken skeleton-shimmer" />
          <div className="h-4 w-1/2 rounded-sm bg-surface-sunken skeleton-shimmer" />
        </div>
        <div className="border-t border-border p-4">
          <div className="h-9 w-36 rounded-md bg-surface-sunken skeleton-shimmer" />
        </div>
      </div>
    );
  }

  return <div aria-hidden className={`rounded-md bg-surface-sunken skeleton-shimmer ${className}`} />;
}
