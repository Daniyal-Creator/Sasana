"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { Lang } from "@/lib/i18n";
import type { PreparedImage } from "@/lib/image";
import type { VisionResult } from "@shared/contract";

const STORAGE_KEY = "sasana.assistant_handoff";

export interface AssistantHandoffPayload {
  question: string;
  imageUrl?: string | null;
  image?: PreparedImage | null;
  lang: Lang;
  contextResult?: VisionResult | null;
}

interface AssistantContextValue {
  handoffPayload: AssistantHandoffPayload | null;
  setHandoffPayload: (payload: AssistantHandoffPayload | null) => void;
  consumeHandoffPayload: () => AssistantHandoffPayload | null;
}

const AssistantContext = createContext<AssistantContextValue>({
  handoffPayload: null,
  setHandoffPayload: () => {},
  consumeHandoffPayload: () => null,
});

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [handoffPayload, setHandoffPayloadState] = useState<AssistantHandoffPayload | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as AssistantHandoffPayload;
      }
    } catch {
      // Ignore storage read errors (e.g. quota or privacy mode)
    }
    return null;
  });

  const setHandoffPayload = useCallback((payload: AssistantHandoffPayload | null) => {
    setHandoffPayloadState(payload);
    if (typeof window === "undefined") return;
    try {
      if (payload) {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } else {
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage write errors
    }
  }, []);

  const consumeHandoffPayload = useCallback(() => {
    let payload = handoffPayload;
    if (!payload && typeof window !== "undefined") {
      try {
        const stored = window.sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          payload = JSON.parse(stored) as AssistantHandoffPayload;
        }
      } catch {
        // Ignore storage read errors
      }
    }

    if (payload) {
      setHandoffPayloadState(null);
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          // Ignore storage remove errors
        }
      }
    }

    return payload;
  }, [handoffPayload]);

  return (
    <AssistantContext.Provider value={{ handoffPayload, setHandoffPayload, consumeHandoffPayload }}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  return useContext(AssistantContext);
}
