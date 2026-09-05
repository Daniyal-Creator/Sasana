// The import attribute is required for JSON under Node's ESM loader.
import rulesData from "@/data/rules.json" with { type: "json" };
import { KnowledgeBaseError } from "@/lib/errors";
import type { Lang } from "@shared/contract";
import type { Rule } from "@/lib/types";

let cache: Rule[] | null = null;

// Validates the raw KB payload. Exported as a seam so tests can feed it broken
// data without touching the real rules.json.
export function parseRules(data: unknown): Rule[] {
  if (!Array.isArray(data)) throw new KnowledgeBaseError("rules.json must be an array");
  if (data.length === 0) throw new KnowledgeBaseError("rules.json is empty");
  return data.map((rule, i) => validateRule(rule, i));
}

function validateRule(raw: unknown, i: number): Rule {
  const r = raw as Record<string, unknown>;
  const need = (key: string): string => {
    const value = r?.[key];
    if (typeof value !== "string" || !value) {
      throw new KnowledgeBaseError(`rule[${i}] missing string "${key}"`);
    }
    return value;
  };
  if (!Array.isArray(r?.keywords)) throw new KnowledgeBaseError(`rule[${i}] missing keywords[]`);
  if (typeof r?.sacred_area !== "boolean") throw new KnowledgeBaseError(`rule[${i}] missing sacred_area`);
  return {
    id: need("id"),
    category_en: need("category_en"),
    category_id: need("category_id"),
    rule_en: need("rule_en"),
    rule_id: need("rule_id"),
    why_en: need("why_en"),
    why_id: need("why_id"),
    why_source: need("why_source"),
    keywords: r.keywords.map((k) => String(k).toLowerCase()),
    source: need("source"),
    sacred_area: r.sacred_area,
  };
}

// Reads and validates data/rules.json once, then serves from module cache —
// bad KB data fails loudly at first load, not per request (backend-spec §5).
export function loadRules(): Rule[] {
  if (!cache) cache = parseRules(rulesData);
  return cache;
}

// Resolves rule ids - as sent by a client alongside a Site - against the loaded
// knowledge base. This is where the grounding guarantee is kept: the caller
// names rules, the server supplies their text, and an id the KB does not know
// is dropped rather than echoed back. Order follows the KB, not the caller, so
// the same Site always reads the same way; duplicates collapse.
export function rulesByIds(rules: Rule[], ids: string[]): Rule[] {
  const wanted = new Set(ids);
  return rules.filter((rule) => wanted.has(rule.id));
}

// Formats rules as a numbered list for system-prompt injection
// (context stuffing, PRD §12).
//
// `withIds` prints each rule's id so the model can cite it back. Chat needs
// that - an answer names the ids it stands on and the server resolves them -
// while vision never cites anything, so it keeps the shorter, cheaper form.
export function formatRulesForPrompt(
  rules: Rule[],
  lang: Lang,
  { withIds = false }: { withIds?: boolean } = {},
): string {
  return rules
    .map((r, i) => {
      const text = lang === "id" ? r.rule_id : r.rule_en;
      const why = lang === "id" ? r.why_id : r.why_en;
      const category = lang === "id" ? r.category_id : r.category_en;
      const id = withIds ? `(id: ${r.id}) ` : "";
      // `why` is included so the assistant can answer "what is a canang?" and
      // other meaning questions from the KB instead of declining (ADR-0002).
      // `why_source` is deliberately left out: it is display-only attribution
      // and would only add prompt tokens.
      return `${i + 1}. ${id}[${category}] ${text} Why it matters: ${why} (Source: ${r.source})`;
    })
    .join("\n");
}

// Keyword retrieval over the KB, scored and sorted — the seam where vector
// search lands post-MVP (backend-spec §3.4).
// Question words and filler, EN + ID. Dropped before matching so that a
// stopword sitting inside a multi-word keyword cannot ground an unrelated
// question. None of these are domain terms.
const STOPWORDS = new Set([
  "what", "when", "where", "which", "who", "whom", "why", "how", "the", "this", "that",
  "these", "those", "and", "but", "for", "with", "from", "into", "onto", "are", "was",
  "were", "been", "have", "has", "had", "does", "did", "can", "could", "should", "would",
  "will", "may", "might", "must", "not", "you", "your", "our", "its", "about", "there",
  "here", "then", "than", "also", "any", "all", "some", "very", "just", "only", "more",
  "most", "much", "many", "get", "got",
  "apa", "apakah", "itu", "ini", "yang", "dan", "atau", "dari", "untuk", "dengan", "pada",
  "adalah", "saya", "anda", "kamu", "bisa", "boleh", "harus", "tidak", "ada", "juga",
  "saja", "sudah", "akan", "masih", "lagi", "kalau", "jika", "bagaimana", "kenapa",
  "mengapa", "dimana", "kah",
]);

function keywordMatchesToken(keyword: string, token: string): boolean {
  if (keyword === token) return true;
  return keyword
    .split(/\W+/)
    .some((word) => word === token || (token.length > 3 && word.startsWith(token)));
}

export function searchRules(rules: Rule[], query: string): Rule[] {
  const q = query.toLowerCase();
  const tokens = q.split(/\W+/).filter((t) => t.length > 2 && !STOPWORDS.has(t));
  return rules
    .map((rule) => {
      const phraseHits = rule.keywords.reduce((sum, k) => sum + (q.includes(k) ? 2 : 0), 0);
      // Tokens are matched against the individual words of a keyword, not the
      // raw string: a bare `includes` lets a stopword inside a multi-word
      // keyword ground an unrelated question ("what" from "what is canang"
      // matching "what time is the football match?"). Prefix matching is
      // limited to tokens of 4+ characters so "climb" still finds "climbing"
      // while "the" cannot reach "clothes".
      const tokenHits = tokens.reduce(
        (sum, t) => sum + (rule.keywords.some((k) => keywordMatchesToken(k, t)) ? 1 : 0),
        0,
      );
      return { rule, score: phraseHits + tokenHits };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.rule);
}
