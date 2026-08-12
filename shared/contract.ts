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
