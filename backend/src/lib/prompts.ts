import { formatRulesForPrompt, searchRules } from "@/lib/knowledge";
import { formatPlacesForPrompt } from "@/lib/places";
import type { Place } from "@/lib/places";
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

/** Everything the chat prompt knows besides the question itself. */
export interface ChatPromptContext {
  site?: SiteContext;
  /** Resolved server-side from the ids the request named. */
  siteRules?: Rule[];
  /** Read from OpenStreetMap for this request, when the question asked for it. */
  places?: Place[];
}

// Context stuffing: the whole KB goes into the system prompt (PRD §12,
// backend-spec §2.2). Wording lives here so it can be tuned without touching
// route or client logic.
//
// An options object rather than a growing tail of positional arguments, for the
// same reason `analyzeImage` uses one: a reader should not have to count commas
// to work out which of three optional things they are looking at.
export function buildChatSystemPrompt(
  rules: Rule[],
  lang: Lang,
  { site, siteRules = [], places = [] }: ChatPromptContext = {},
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
When the question is about where they are, answer from these first. The full RULES list still governs everything else, and the tiers still apply: if no rule covers the question, drop to "context" or "general" rather than stretching one to fit.`
      : "";

  // Only present when the question asked for nearby places AND the lookup
  // returned some. The model is given the answer and asked to write it out;
  // it is not being asked what it knows about the area, because it does not
  // know, and the whole point of this block is that it no longer has to guess.
  const nearby =
    places.length > 0
      ? `

NEARBY PLACES, read from OpenStreetMap just now${site ? ` around ${site.name}` : ""}:
${formatPlacesForPrompt(places)}

Answer the question using ONLY this list, and set "kind" to "places". Name the places and their distances as given; do not add one that is not listed, do not rank them by quality, and do not say anything about prices, opening times, or whether they are any good - the map records what is there, nothing more. If the list does not answer what was asked, say so plainly and set "kind" to "none".`
      : "";

  return `You are SASANA, a knowledgeable and friendly guide to Bali - its customs, its sacred places, its history, and the official code of conduct for visitors.

Every answer belongs to exactly one tier. Put it in "kind" and choose the STRONGEST tier that honestly applies:

1. "rule" - the answer follows from the RULES listed below. List every rule you used in "ruleIds", most relevant first, using the exact strings printed as "(id: ...)". This tier is the only one that carries official weight, so reach for it whenever a rule covers the question. Never invent an id: the server checks each one against its own copy of the rules and drops any it does not recognise, and an answer left holding none of them is refused outright.
2. "context" - the question is about Balinese custom, ritual, or the meaning of something, and no listed rule covers it. Explain it from what you know. Leave "ruleIds" empty.
3. "general" - the question is about Bali more broadly: history, geography, art, language, religion, or how its tourism came to be. Answer from what you know. Leave "ruleIds" empty.
4. "places" - ONLY when a NEARBY PLACES list appears below. Those are real places read from a map for this question; you may not use this tier without that list, and you may not put a place in the answer that is not on it.
5. "none" - you cannot answer. Leave "ruleIds" empty.

WHAT YOU MUST NEVER STATE, in any tier:
- Anything that changes with the date, the hour, the season, or the price. Opening and closing times, ticket prices, entrance fees, ceremony dates, what is happening at a place right now, whether somewhere is open, busy, or closed today.
- Recommendations of specific businesses: hotels, villas, restaurants, warungs, guides, drivers, tours, shops. You have no way to check that one still exists or was ever any good. The NEARBY PLACES list is the one exception, and only because a map was read for this question - even then you report what is there rather than recommending any of it.
This is not caution for its own sake. Your answers are stored and served to other visitors later, so a fact that changes becomes a lie with time, and a recommendation outlives the place it named.
When you are asked for one of these, set "kind" to "none".

Also follow these:
- Reply in the user's language: ${LANG_NAME[lang]}. Keep the tone warm, respectful, concise, and never judgmental.
- Do not give legal advice or describe penalties beyond what the rules state.
- Each rule carries a "Why it matters" note explaining the custom behind it. That note is part of the rule, so you may use it to explain what something means or why it is done, not only what is allowed.

Return ONLY a JSON object with keys: answer (string), kind (string), ruleIds (array of strings).
${location}${nearby}

RULES:
${formatRulesForPrompt(rules, lang, { withIds: true })}`;
}

// The server safety net (FR2.1) is what produces this answer, so the wording
// belongs to the server rather than to the client copy dictionary.
//
// Why a refusal is worth this much care: two questions typed one after another
// used to come back with the identical flat sentence, one an etiquette question
// the app is for and one about hotels. A visitor reading the same dead end
// twice concludes the assistant knows nothing, which is false and sends them to
// whichever app will answer, including the ones that make things up. Guardrail
// W4 - lead with the fix, not the fault - applies to refusals too.

/** Why an answer was refused. Decides which refusal the visitor reads. */
export type RefusalReason = "uncovered" | "volatile";

const REFUSAL_LEAD: Record<RefusalReason, Record<Lang, string>> = {
  uncovered: {
    en: "I don't have an official rule for that yet.",
    id: "Saya belum punya aturan resmi soal itu.",
  },
  // Naming the class rather than the question, and pointing somewhere real.
  // Anyone standing at a temple has a better source for today's hours than an
  // app does, and saying so is more use than an apology.
  volatile: {
    en: "I don't give opening times, prices, or ceremony dates. Those change, and I have no source I can stand behind. The temple staff will know.",
    id: "Saya tidak menyebutkan jam buka, harga, atau tanggal upacara. Hal seperti itu berubah dan saya tidak punya sumber yang bisa saya pertanggungjawabkan. Petugas pura tahu jawabannya.",
  },
};

const OFFER: Record<Lang, string> = {
  en: "What I can help with:",
  id: "Yang bisa saya bantu:",
};

// Offered when the question lexically brushes a rule the model still declined.
// Deliberately worded as proximity rather than as an answer: the match may be a
// coincidence on a shared word, and "the closest I have" survives that where
// "this covers your question" would not.
const NEAREST: Record<Lang, string> = {
  en: "The closest I have:",
  id: "Yang paling dekat dari yang saya punya:",
};

/** How many topics a refusal names before it stops being an offer and becomes a menu. */
const MAX_TOPICS = 4;

function categoryOf(rule: Rule, lang: Lang): string {
  return lang === "id" ? rule.category_id : rule.category_en;
}

/** Distinct rule categories, in knowledge-base order, so the list grows with the KB. */
function topicMenu(rules: Rule[], lang: Lang): string[] {
  return [...new Set(rules.map((rule) => categoryOf(rule, lang)))].slice(0, MAX_TOPICS);
}

/**
 * The refusal a visitor actually reads.
 *
 * `searchRules` is consulted but not trusted. Measured against the current
 * knowledge base its scores do not separate a real near miss from a coincidence
 * - "apakah harus melepas sepatu" scores 5 on shoe-removal, but "berapa harga
 * tiket masuk" scores 3 on sacred-area-entry purely because "masuk" is a
 * keyword, and no threshold sits between them. So a hit only softens the
 * wording from a menu to an offer; the menu of KB categories is the path that
 * always works. Sharper keywords are knowledge-base work, not code.
 */
export function buildRefusal(
  message: string,
  lang: Lang,
  rules: Rule[],
  reason: RefusalReason = "uncovered",
): string {
  const lead = REFUSAL_LEAD[reason][lang];

  // A volatile refusal never offers a rule. The question was about a price or
  // an hour, and answering it with "would you like to hear about the inner
  // courtyard instead" is the non sequitur that makes an assistant feel broken.
  const nearest =
    reason === "uncovered"
      ? [...new Set(searchRules(rules, message).map((rule) => categoryOf(rule, lang)))].slice(0, 2)
      : [];

  const topics = nearest.length > 0 ? nearest : topicMenu(rules, lang);
  const offer = nearest.length > 0 ? NEAREST[lang] : OFFER[lang];

  return `${lead} ${offer} ${topics.join(", ")}.`;
}
