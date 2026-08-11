interface CardProps {
  padding?: "sm" | "md" | "lg";
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
}

const paddingClasses = { sm: "p-4", md: "p-5", lg: "p-6" };

export function Card({ padding = "md", interactive = false, className = "", children }: CardProps) {
  return (
    <div
      className={[
        "rounded-lg border border-border bg-surface shadow-sm",
        paddingClasses[padding],
        interactive
          ? "transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md"
          : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
