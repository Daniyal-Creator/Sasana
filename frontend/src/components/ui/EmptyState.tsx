import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center animate-fadeUp">
      {Icon && <Icon size={32} strokeWidth={1.75} aria-hidden className="mb-4 text-text-muted" />}
      <h2 className="text-h3 font-semibold text-text">{title}</h2>
      {description && <p className="mt-2 max-w-prose text-base text-text-secondary">{description}</p>}
      {children && <div className="mt-6 w-full">{children}</div>}
    </div>
  );
}
