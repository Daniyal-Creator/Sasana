import type { Lang } from "@/lib/i18n";
import type { PreparedImage } from "@/lib/image";
import type { VisionResult } from "@shared/contract";

export const STORAGE_KEY = "sasana.assistant_handoff";

export interface AssistantHandoffPayload {
  question: string;
  imageUrl?: string | null;
  image?: PreparedImage | null;
  lang: Lang;
  contextResult?: VisionResult | null;
}

/**
 * Safely reads the handoff payload from sessionStorage.
 * Returns null during SSR or if storage is inaccessible/empty/corrupted.
 */
export function readHandoff(): AssistantHandoffPayload | null {
  if (typeof window === "undefined" || !window.sessionStorage) return null;
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AssistantHandoffPayload;
    }
  } catch {
    // Ignore storage read errors (e.g. quota, corrupted JSON, or privacy mode)
  }
  return null;
}

/**
 * Safely writes the handoff payload to sessionStorage.
 * If payload is null, removes the key from storage.
 */
export function writeHandoff(payload: AssistantHandoffPayload | null): void {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    if (payload) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage write errors (e.g. quota exceeded)
  }
}

/**
 * Reads the handoff payload and removes it from sessionStorage in one operation.
 */
export function consumeHandoff(): AssistantHandoffPayload | null {
  const payload = readHandoff();
  if (payload && typeof window !== "undefined" && window.sessionStorage) {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage remove errors
    }
  }
  return payload;
}
