// How each answering tier presents itself to a visitor.
//
// ADR-0014 opened the assistant up to answers that carry no Rule behind them,
// and made one condition: the difference has to reach the visitor. An
// unsourced answer that looks identical to a sourced one is worse than the
// refusal it replaced, because the visitor now acts on it believing it official.
//
// Guardrail C6 says colour is never the only signal, so the tiers differ by
// icon and by wording, and only then by weight. I1 keeps every icon Lucide at
// stroke 1.75; I5 keeps every icon paired with text.

import { BookOpen, Globe, MapPin, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CopyKey } from "@/lib/i18n";
import type { ChatKind } from "@shared/contract";

export interface TierPresentation {
  icon: LucideIcon;
  /** The line printed under the answer. */
  labelKey: CopyKey;
  /**
   * Whether the line names where the facts came from. Sourced tiers get the
   * separated, higher-contrast treatment; the others stay quiet, because
   * looking authoritative is exactly what they must not do.
   */
  sourced: boolean;
}

/**
 * Keyed by `ChatKind` rather than looked up with a switch, so a tier added to
 * the contract fails to compile here instead of silently rendering nothing.
 * That has already happened once, in the backend's `CHAT_KINDS`.
 */
export const TIER_PRESENTATION: Record<ChatKind, TierPresentation | null> = {
  rule: { icon: ShieldCheck, labelKey: "assistant.source", sourced: true },
  places: { icon: MapPin, labelKey: "assistant.source.map", sourced: true },
  context: { icon: BookOpen, labelKey: "assistant.tier.context", sourced: false },
  general: { icon: Globe, labelKey: "assistant.tier.general", sourced: false },
  // A refusal already opens by saying it has no rule and spends the rest of its
  // words offering what it does have. A line underneath repeating the absence
  // puts the visitor back on the note the refusal was written to move them off.
  none: null,
};

/** The line to print under one answer, or null when it gets none. */
export interface TierLine {
  icon: LucideIcon;
  labelKey: CopyKey;
  /** Interpolation for `labelKey`; only the sourced tiers use it. */
  params?: Record<string, string>;
  /** Drives the weight: separator and accent colour, or quiet muted text. */
  attributed: boolean;
}

/**
 * Which line an answer gets, decided away from the component so it can be
 * tested without a DOM.
 *
 * Written as a pure function after the first version fused two questions that
 * only look alike: "does this tier name a source" and "which wording does it
 * use". Fusing them sent `context` and `general` to the sourced tiers' fallback
 * copy, so both printed "No official rule found for this" and neither said what
 * it actually was. The type checker had nothing to object to.
 */
export function resolveTierLine(kind: ChatKind, source: string | null): TierLine | null {
  const tier = TIER_PRESENTATION[kind];
  if (!tier) return null;

  // An unsourced tier always uses its own wording. There is no source to be
  // missing, so there is nothing to fall back from.
  if (!tier.sourced) {
    return { icon: tier.icon, labelKey: tier.labelKey, attributed: false };
  }

  // A sourced tier that arrived without its source cannot print "Source: " with
  // nothing after it. Saying there is none is honest, and it drops to the quiet
  // treatment, which is what an answer with no attribution has earned.
  if (!source) {
    return { icon: tier.icon, labelKey: "assistant.nosource", attributed: false };
  }

  return { icon: tier.icon, labelKey: tier.labelKey, params: { source }, attributed: true };
}
