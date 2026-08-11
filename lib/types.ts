export type VisionStatus = "compliant" | "needs_attention" | "not_compliant" | "unclear";

export type VisionContext = "temple" | "general";

export interface VisionResult {
  status: VisionStatus;
  reason: string;
  suggestion: string;
  reference: string;
}

export interface ChatResponse {
  answer: string;
  source: string | null;
  grounded: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  source?: string | null;
  grounded?: boolean;
  error?: boolean;
}

export interface Rule {
  id: string;
  category_en: string;
  category_id: string;
  rule_id: string;
  rule_en: string;
  /** Cultural meaning behind the rule. Goes into the assistant prompt (ADR-0002). */
  why_en: string;
  why_id: string;
  /** Attribution for the cultural claim. Display-only; never sent to the model. */
  why_source: string;
  keywords: string[];
  source: string;
  sacred_area: boolean;
}
