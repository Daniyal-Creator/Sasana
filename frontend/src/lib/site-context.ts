// The Site a visitor is currently at, carried from Explore to the Situation
// Check and the Assistant so that both can answer about *this* place rather
// than about temples in general.
//
// This is deliberately not part of the assistant handoff. That payload is
// consumed once - read, then cleared - because it carries a single question
// across one navigation. A Site outlives that: a visitor picks Tirta Empul on
// the map, checks a photo, asks a follow-up, checks another photo. The two have
// different lifetimes, so they get different storage.

import { isDummySite } from "@/data/dummy-sites";
import { SITES, type Site } from "@/data/sites";
import { approachRadiusM, nearestSite, type LatLng } from "@/lib/geo";
import type { SiteContext } from "@shared/contract";

export const SITE_STORAGE_KEY = "sasana.active_site";

/**
 * Narrows a Site to what the backend is allowed to receive: its identity and
 * the ids of the Rules its Customs cite. The Custom text is deliberately left
 * behind - the server holds the rule text, so nothing the browser sends can
 * become a Custom a visitor reads.
 *
 * Returns null for a Dummy Site. Its Customs are real, but its name and
 * location are invented, and ADR-0012 is explicit that a fictional place must
 * not reach the backend. Naming one in a prompt would have the app tell a
 * visitor about a temple that does not exist - the failure the whole product
 * is built to prevent. A visitor near only Dummy Sites falls back to the
 * generic check, which is exactly how the app behaved before any of this.
 */
export function siteContextFrom(site: Site): SiteContext | null {
  if (isDummySite(site)) return null;

  const ruleIds = [...new Set(site.customs.flatMap((custom) => custom.ruleIds))];
  if (ruleIds.length === 0) return null;

  return { id: site.id, name: site.name, ruleIds };
}

/** Reads the active Site. Null during SSR, or when storage is unavailable. */
export function readActiveSite(): SiteContext | null {
  if (typeof window === "undefined" || !window.sessionStorage) return null;
  try {
    const stored = window.sessionStorage.getItem(SITE_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<SiteContext>;
    // Storage can hold anything a previous version wrote; a shape that no
    // longer matches is treated as no Site rather than sent onward.
    if (
      typeof parsed?.id !== "string" ||
      typeof parsed?.name !== "string" ||
      !Array.isArray(parsed?.ruleIds) ||
      parsed.ruleIds.length === 0
    ) {
      return null;
    }
    return { id: parsed.id, name: parsed.name, ruleIds: parsed.ruleIds.map(String) };
  } catch {
    // Corrupted JSON, quota, or a browser refusing storage in private mode.
    return null;
  }
}

/** Records the active Site, or clears it when passed null. */
export function writeActiveSite(site: SiteContext | null): void {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    if (site) {
      window.sessionStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(site));
    } else {
      window.sessionStorage.removeItem(SITE_STORAGE_KEY);
    }
  } catch {
    // Losing the Site costs the next answer its specificity, nothing more.
  }
}

/**
 * The Site a pair of coordinates belongs to, if any.
 *
 * A visitor who opens the check directly, photo already taken, never passed
 * through Explore and so has no Site in storage. Their coordinates can name one
 * anyway, which is the difference between a verdict measured against temples in
 * general and one measured against the Customs of the place they are standing
 * in.
 *
 * The Approach radius is the line, not the Zone: someone in the car park is
 * plainly at the Site for the purpose of judging their photo. Unlike the
 * Approach notice, no accuracy test guards this. ADR-0005 sets that bar because
 * an unprompted notice for the wrong Site interrupts a visitor who asked for
 * nothing; here the visitor has asked a question, the Customs shown are real
 * either way, and the fallback is the generic check.
 */
export function siteContextNear(pos: LatLng): SiteContext | null {
  const { site, distanceM } = nearestSite(pos, SITES);
  if (!site || distanceM > approachRadiusM(site)) return null;
  return siteContextFrom(site);
}
