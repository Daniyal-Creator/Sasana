"use client";

import { createContext, useCallback, useContext, useState } from "react";
import {
  readHandoff,
  writeHandoff,
  consumeHandoff,
  type AssistantHandoffPayload,
} from "@/lib/assistant-handoff";

export type { AssistantHandoffPayload };

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
    return readHandoff();
  });

  const setHandoffPayload = useCallback((payload: AssistantHandoffPayload | null) => {
    setHandoffPayloadState(payload);
    writeHandoff(payload);
  }, []);

  const consumeHandoffPayload = useCallback(() => {
    let payload = handoffPayload;
    if (!payload) {
      payload = consumeHandoff();
    } else {
      writeHandoff(null);
    }

    if (payload) {
      setHandoffPayloadState(null);
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
