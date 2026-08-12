"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "leading" | "trailing";
  loading?: boolean;
  disabled?: boolean;
  href?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  "aria-label"?: string;
  className?: string;
  children?: React.ReactNode;
}

const variantClasses = {
  primary: "bg-primary text-primary-fg hover:bg-primary-hover",
  secondary: "border border-border-strong bg-surface text-text hover:bg-surface-sunken",
  ghost: "bg-transparent text-primary hover:bg-primary-tint",
  danger: "bg-status-bad-fg text-primary-fg hover:bg-status-bad-fg",
};

const sizeClasses = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-base",
  lg: "h-14 px-6 text-lg",
};

const iconSize = { sm: 16, md: 20, lg: 20 };

export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "leading",
  loading = false,
  disabled = false,
  href,
  type = "button",
  onClick,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-md font-medium",
    "transition-[background-color,transform] duration-150 ease-out active:scale-[0.98]",
    "focus-visible:shadow-focus",
    isDisabled
      ? "cursor-not-allowed bg-surface-sunken text-text-muted hover:bg-surface-sunken"
      : variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(" ");

  const content = (
    <>
      {loading ? (
        <LoadingSpinner size="sm" />
      ) : (
        Icon && iconPosition === "leading" && <Icon size={iconSize[size]} strokeWidth={1.75} aria-hidden />
      )}
      {children}
      {!loading && Icon && iconPosition === "trailing" && (
        <Icon size={iconSize[size]} strokeWidth={1.75} aria-hidden />
      )}
    </>
  );

  if (href && !isDisabled) {
    return (
      <Link href={href} className={classes} aria-label={rest["aria-label"]}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-label={rest["aria-label"]}
      className={classes}
    >
      {content}
    </button>
  );
}
