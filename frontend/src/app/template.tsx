"use client";

// Page-transition wrapper (ui-spec §9.1): 200ms fade + 8px rise on every route change.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col animate-fadeUp">{children}</div>;
}
