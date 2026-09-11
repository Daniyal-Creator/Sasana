"use client";

interface ChatLayoutProps {
  children: React.ReactNode;
}

/**
 * The assistant's reading column: one centred panel, at every width.
 *
 * It used to carry a 230px sidebar beside this on `lg+`. The sidebar listed the
 * same four topics as the welcome screen's cards, so on a desktop empty screen
 * a visitor was offered them twice at once; and once a conversation started,
 * where the cards go away, it spent that width on four generic buttons while
 * the follow-up chips above the composer were already offering questions about
 * the answer actually on screen. Its "About sources" note was not lost with it:
 * the hero and the line under the composer both already say the same thing.
 */
export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="relative z-[1] mx-auto flex w-full max-w-assistant-main flex-1 flex-col px-4 sm:px-6">
      {children}
    </div>
  );
}
