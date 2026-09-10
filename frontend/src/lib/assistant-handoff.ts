import type { Lang } from "@/lib/i18n";
import type { PreparedImage } from "@/lib/image";
import type { Proximity, VisionResult } from "@shared/contract";

export const STORAGE_KEY = "sasana.assistant_handoff";

/**
 * How long a fix may be quoted back at the visitor.
 *
 * Somebody can press "ask", put the phone in a pocket, and walk on. Two minutes
 * is long enough to cross the page and type a question, and short enough that
 * nobody is told they are 640 m from a gate they are now standing in.
 */
export const PROXIMITY_TTL_MS = 120_000;

/** A fix with the moment it was taken, so its staleness is checkable later. */
export interface TimedProximity {
  fix: Proximity;
  /** `Date.now()` when Explore wrote it. */
  at: number;
}

export interface AssistantHandoffPayload {
  question: string;
  imageUrl?: string | null;
  image?: PreparedImage | null;
  lang: Lang;
  contextResult?: VisionResult | null;
  /**
   * Where the visitor stood when they left Explore.
   *
   * It rides here rather than in the stored Site (`site-context.ts`) for the
   * reason `Proximity` records: a Site outlives a navigation and a position does
   * not. This payload is read once and cleared, which is exactly a position's
   * lifetime - and `at` closes the gap the payload cannot, for a visitor who
   * opens the page and types nothing for ten minutes.
   */
  proximity?: TimedProximity | null;
}

/**
 * The fix, if it is still recent enough to say out loud. Null otherwise, and a
 * null here costs an answer its specificity and nothing else.
 */
export function freshProximity(
  timed: TimedProximity | null | undefined,
  now: number = Date.now(),
): Proximity | null {
  if (!timed) return null;
  const age = now - timed.at;
  // A negative age means the clock moved backwards between writing and reading.
  // Treated as stale rather than as fresh: an unexplained timestamp is not
  // evidence the visitor is still there.
  if (age < 0 || age > PROXIMITY_TTL_MS) return null;
  return timed.fix;
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
