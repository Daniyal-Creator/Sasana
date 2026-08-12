// Backend-only shapes. The request/response contract shared with the frontend
// lives in shared/contract.ts - anything the browser can observe belongs there,
// not here.

/** One knowledge-base entry, as stored in src/data/rules.json. */
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
