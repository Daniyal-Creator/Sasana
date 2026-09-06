import { formatRulesForPrompt } from "@/lib/knowledge";
import type { Rule } from "@/lib/types";
import type { Lang, PhotoMeta, SiteContext, VisionContext } from "@shared/contract";

const LANG_NAME: Record<Lang, string> = {
  en: "English",
  id: "Indonesian (Bahasa Indonesia)",
};

// F1 Situation Check (PRD §13, FR1.3-1.5). The language line is an addition to
// backend-spec, which specifies an English-only prompt: the client already
// sends `lang` and the whole UI is bilingual, so an Indonesian user must not
// get an English verdict.
export function buildVisionSystemPrompt(lang: Lang): string {
  return `You are SASANA, a friendly Balinese custom-and-etiquette assistant for tourists.
Analyze the provided photo for compliance with Balinese custom and the sanctity of sacred sites (pura). Focus on:
- Attire appropriateness in sacred areas (a kamen/sarong and sash; shoulders and knees covered).
- Presence of sacred elements (pelinggih/shrines, canang/offerings, temple gates and walls).
- Risky or disrespectful behavior (climbing shrines or sacred trees, stepping on offerings, sitting or standing on sacred structures).

Rules for your answer:
1. Choose a compliance status of exactly one of: "compliant", "needs_attention", "not_compliant", "unclear".
2. ALWAYS include a short, plain-language "reason" and a polite, actionable "suggestion". Never reply with only "wrong".
3. Be warm, respectful, and educational. Assume good intent: tourists usually act out of unfamiliarity, not disrespect. Never shame the user.
4. If the photo is too dark, blurry, empty of people, or clearly unrelated to a person or temple setting, set status to "unclear" and ask for a clearer, well-lit photo instead of guessing.
5. When you reference a rule, prefer "Bali Governor Circular No. 7 of 2025"; otherwise use "Balinese Hindu custom (adat)". If no reference applies, use an empty string.
6. Keep "reason" and "suggestion" under about 240 characters each.
7. Write "reason" and "suggestion" in ${LANG_NAME[lang]}.

Return ONLY a JSON object with keys: status, reason, suggestion, reference. Do not add any text outside the JSON.`;
}

// The context that travels alongside the photo. Naming the Site and the Customs
// that actually hold there is what separates "a temple" from "this temple":
// Batu Bolong carries no photography Custom and Ulun Danu Beratan carries no
// offerings Custom, so a verdict measured against a generic temple can warn
// about something the place does not ask for.
//
// `siteRules` comes from the server's own knowledge base, never from the
// client - the request only named which rules to look up.
export function buildVisionContextLine(
  context: VisionContext,
  lang: Lang,
  site?: SiteContext,
  siteRules: Rule[] = [],
): string {
  if (!site || siteRules.length === 0) {
    return context === "temple"
      ? "Context: the user says they are at or near a temple (pura)."
      : "Context: general setting; it may or may not be a sacred site.";
  }
  return `Context: the user is at ${site.name}, a sacred site (pura).
Judge the photo against the customs that apply at this specific place, listed below. Prefer them over general temple etiquette, and do not raise a custom that is not listed - a rule that does not hold here misleads just as much as no rule at all.

CUSTOMS THAT APPLY AT ${site.name}:
${formatRulesForPrompt(siteRules, lang)}`;
}

// What the visitor's device knew about the photo, written for the model.
//
// It answers questions the pixels cannot: a photo that is dark at 19:30 is a
// photo taken after sunset, not a broken camera, and coordinates place a
// visitor at a real temple rather than at "somewhere with stone walls". Both
// change the verdict a careful reader would give.
//
// The last line is the fence. Time and place are exactly the two facts that
// tempt a model into announcing what is happening at a temple today, and this
// app does not know that: no schedule, no opening hours, no ceremony in
// progress. The metadata is for reading the photograph, not for narrating the
// place.
export function buildPhotoMetaLine(photo?: PhotoMeta): string {
  if (!photo) return "";

  const facts: string[] = [];

  if (photo.takenAt) {
    const clock = photo.takenAt.slice(11, 16);
    const date = photo.takenAt.slice(0, 10);
    const approximate =
      photo.timeSource === "file"
        ? " (the file's own date, which may be later than the shutter)"
        : "";
    facts.push(`- Taken at ${clock} local time on ${date}, which is ${timeOfDay(clock)}${approximate}.`);
  }

  if (photo.coords) {
    const accuracy = photo.coords.accuracyM
      ? `, accurate to about ${photo.coords.accuracyM} m`
      : "";
    facts.push(
      `- Taken at latitude ${photo.coords.lat}, longitude ${photo.coords.lng}${accuracy}.`,
    );
  }

  facts.push(
    photo.source === "camera"
      ? "- Taken with the app's camera moments ago, so the visitor is standing there now."
      : "- Chosen from the visitor's own files, so they may be somewhere else by now.",
  );

  return `

PHOTO METADATA (reported by the visitor's device, not read out of the image):
${facts.join("\n")}
Use it to read the photograph better: it tells you the light to expect and where the visitor is. Do not use it to state opening hours, ceremony dates, or what is happening at a place right now. You do not know those.`;
}

/** The part of the day a wall clock reading falls in, for the light it implies. */
function timeOfDay(clock: string): string {
  const hour = Number(clock.slice(0, 2));
  if (!Number.isFinite(hour)) return "an unknown time of day";
  if (hour < 5) return "the middle of the night, so any light is artificial";
  if (hour < 10) return "morning";
  if (hour < 15) return "the middle of the day, so shadows are short and hard";
  if (hour < 18) return "late afternoon";
  if (hour < 20) return "dusk, so the photo may be dim without being a bad photo";
  return "night, so the photo may be dim without being a bad photo";
}

// Used when the model returns something unparseable. Failing safe to "unclear"
// keeps FR1.5 behaviour (ask for a better photo) instead of surfacing an error.
export const VISION_PARSE_FALLBACK: Record<Lang, { reason: string; suggestion: string }> = {
  en: {
    reason: "I couldn't read this photo clearly.",
    suggestion: "Please try a clearer, well-lit photo.",
  },
  id: {
    reason: "Saya belum bisa membaca foto ini dengan jelas.",
    suggestion: "Silakan coba foto yang lebih jelas dan terang.",
  },
};

// Context stuffing: the whole KB goes into the system prompt (PRD §12,
// backend-spec §2.2). Wording lives here so it can be tuned without touching
// route or client logic.
export function buildChatSystemPrompt(
  rules: Rule[],
  lang: Lang,
  site?: SiteContext,
  siteRules: Rule[] = [],
): string {
  // The whole KB stays in RULES even when a Site is known: a visitor standing
  // at Besakih may still ask something general, and narrowing the list would
  // turn an answerable question into a refusal. The Site is added as a place to
  // read "here" from, not as a filter.
  const location =
    site && siteRules.length > 0
      ? `

WHERE THE VISITOR IS: ${site.name}.
Words like "here", "this temple", or "this place" refer to ${site.name}. These of the RULES below apply there:
${formatRulesForPrompt(siteRules, lang, { withIds: true })}
When the question is about where they are, answer from these first. The full RULES list still governs everything else, and rule 2 still holds: if nothing covers the question, say so.`
      : "";

  return `You are SASANA, a knowledgeable and friendly guide to Balinese customs and the official code of conduct for visitors in Bali.

Follow these instructions strictly:
1. Answer the user's question ONLY using the RULES listed below. Do NOT invent, assume, or add any rule that is not in the list. Each rule carries a "Why it matters" note explaining the custom behind it; that note is part of the rules, so you may use it to explain what something means or why it is done, not only what is allowed.
2. If the RULES do not cover the question, reply that no official information is available and return an EMPTY "ruleIds" array. Do not guess and do not fabricate a rule.
3. When your answer is based on one or more rules, list their ids in "ruleIds" - the exact strings printed as "(id: ...)" next to each rule. Cite every rule you actually used, most relevant first. Never invent an id: the server checks each one against its own copy of the rules and silently drops any it does not recognise, so a made-up id only costs your answer its grounding.
4. Reply in the user's language: ${LANG_NAME[lang]}. Keep the tone warm, respectful, concise, and never judgmental.
5. Do not give legal advice or describe penalties beyond what the rules state.

Return ONLY a JSON object with keys: answer (string), ruleIds (array of strings).
${location}

RULES:
${formatRulesForPrompt(rules, lang, { withIds: true })}`;
}

// The server safety net (FR2.1) is what produces this answer, so the string
// belongs to the server. It used to be read from the client copy dictionary,
// which is no longer reachable from here; the wording is carried over unchanged
// and the UI no longer ships a copy of it.
const CHAT_FALLBACK: Record<Lang, string> = {
  en: "I don't have official information on that in the Bali code of conduct.",
  id: "Saya tidak punya informasi resmi soal itu dalam tata krama Bali.",
};

export function chatFallback(lang: Lang): string {
  return CHAT_FALLBACK[lang];
}
