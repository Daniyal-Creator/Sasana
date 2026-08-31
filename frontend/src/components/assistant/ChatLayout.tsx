"use client";

interface ChatLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Two-panel layout wrapper for the assistant page.
 * Desktop (lg+): sidebar (230px fixed) + main panel.
 * Mobile (<lg): sidebar hidden, single column.
 */
export function ChatLayout({ sidebar, children }: ChatLayoutProps) {
  return (
    <div className="relative z-[1] mx-auto flex w-full max-w-container flex-1 gap-0 px-4 sm:px-6 lg:gap-6 lg:px-8">
      {/* Sidebar — desktop only */}
      <aside className="hidden w-[230px] shrink-0 border-r border-border py-6 pr-5 lg:block">
        {sidebar}
      </aside>
      {/* Main panel */}
      <div className="flex min-w-0 max-w-assistant-main flex-1 flex-col">{children}</div>
    </div>
  );
}
