"use client";

import { LanguageProvider } from "@/lib/language";
import { AssistantProvider } from "@/lib/assistant-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AssistantProvider>{children}</AssistantProvider>
    </LanguageProvider>
  );
}
