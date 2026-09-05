// The HTTP contract between the frontend and the backend.
//
// TYPES ONLY. Every declaration here is erased at compile time, so neither
// bundler has anything to resolve across the folder boundary and no build
// configuration is needed to share this file. Adding a runtime value - a const,
// an enum, a function - breaks that guarantee. Keep this file declarations only.

/** UI and response language. */
export type Lang = "id" | "en";

export type VisionStatus = "compliant" | "needs_attention" | "not_compliant" | "unclear";

export type VisionContext = "temple" | "general";

/**
 * The Site a visitor is at, when Explore has established which one.
 *
 * The client sends the Site's identity and the ids of the Rules its Customs
 * cite - never the text of a Custom. The server resolves every id against its
 * own knowledge base, so a client cannot put words in the app's mouth: the
 * worst a crafted one achieves is naming the wrong subset of real Rules.
 * Sending the Custom text instead would move the grounding into the browser
 * and break "never invent a rule" at its root.
 *
 * Optional everywhere. A visitor who is not near a Site simply omits it, which
 * is why adding this could not change how the app already behaves.
 */
export interface SiteContext {
  /** The Site's id, as it appears in the frontend Site data. */
  id: string;
  /** The Site's display name, used only to name the place in the prompt. */
  name: string;
  /** Rule ids drawn from the Site's own Customs. Resolved server-side. */
  ruleIds: string[];
}

/** `POST /api/vision` response body. */
export interface VisionResult {
  status: VisionStatus;
  reason: string;
  suggestion: string;
  reference: string;
}

/** `POST /api/chat` response body. */
export interface ChatResponse {
  answer: string;
  source: string | null;
  grounded: boolean;
}

/** One turn of assistant conversation, as sent in the `POST /api/chat` history. */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  source?: string | null;
  grounded?: boolean;
  error?: boolean;
}
