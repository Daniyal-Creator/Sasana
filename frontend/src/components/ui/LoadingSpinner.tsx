interface LoadingSpinnerProps {
  size?: "sm" | "md";
  label?: string;
  variant?: "ring" | "dots";
}

export function LoadingSpinner({ size = "md", label, variant = "ring" }: LoadingSpinnerProps) {
  if (variant === "dots") {
    return (
      <span role="status" className="inline-flex items-center gap-1 px-1">
        <span className="sr-only">{label ?? "Loading"}</span>
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-text-muted animate-dotPulse"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
    );
  }

  const dim = size === "sm" ? "h-4 w-4" : "h-6 w-6";
  return (
    <span role="status" className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className={`${dim} animate-spin rounded-full border-2 border-border border-t-primary`}
      />
      {label ? <span className="text-sm text-text-secondary">{label}</span> : <span className="sr-only">Loading</span>}
    </span>
  );
}
