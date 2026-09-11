import type { ExploreKey } from "@/lib/i18n.explore";
import type { CustomIcon } from "@/data/sites";

/**
 * What a Custom asks of the visitor, in the only three shapes the rules take.
 *
 * The Zone panel needs this because it puts a word in front of every line, and
 * the word has to be true. "Wajib" over "Foto diperbolehkan di luar halaman
 * dalam" would invent an obligation that no Rule carries, which is the one
 * thing this app may never do (guardrail W6, and the first Product Principle).
 *
 * Marking a permission as a permission is also the more useful reading. It
 * says where the limit is, rather than flattening five different demands into
 * one word that then means nothing.
 */
export type Duty = "required" | "forbidden" | "conditional";

/**
 * Keyed by icon rather than by Custom id, so a Site added later inherits the
 * classification instead of arriving unlabelled. Exhaustive over `CustomIcon`
 * by type, which means a sixth kind of Custom fails the build here rather than
 * shipping a line with no word in front of it.
 *
 * Each entry is the sentence it classifies, so the claim can be checked against
 * the data without leaving this file.
 */
export const DUTY_BY_ICON: Record<CustomIcon, Duty> = {
  // "Kamen dan selendang wajib dipakai untuk masuk ke area pura."
  dress: "required",
  // "Foto diperbolehkan di luar halaman dalam." A permission with two limits.
  photography: "conditional",
  // "Berjalanlah mengelilinginya, jangan pernah melangkahinya."
  offerings: "required",
  // "Menerbangkan drone di area pura tidak diizinkan."
  drones: "forbidden",
  // "Jaga suara tetap pelan di dekat orang yang sedang sembahyang."
  quiet: "required",
};

export const DUTY_LABEL: Record<Duty, ExploreKey> = {
  required: "explore.zone.duty.required",
  forbidden: "explore.zone.duty.forbidden",
  conditional: "explore.zone.duty.conditional",
};
