import { answerCache } from "@/lib/answer-cache";
import { answerKey } from "@/lib/cache";
import { askQuestion } from "@/lib/gemini";
import { handleApiError, parseJsonBody } from "@/lib/http";
import { loadRules, normalizeQuestion, rulesByIds, rulesHash } from "@/lib/knowledge";
import { logInfo } from "@/lib/logger";
import { detectPlaceQuery, findNearbyPlaces } from "@/lib/places";
import { validateChatRequest } from "@/lib/validation";
import type { Lang } from "@shared/contract";

// F2 Custom Assistant (backend-spec §2.2). The Gemini key is read only here,
// server-side; the browser never sees it.

// Three kilometres is a short drive rather than a walk, which matches how a
// visitor at a temple actually looks for somewhere to sleep or eat. Five is
// what fits in a chat bubble without becoming a directory listing.
const PLACES_RADIUS_M = 3000;
const PLACES_LIMIT = 5;

export async function POST(req: Request): Promise<Response> {
  const started = Date.now();
  let lang: Lang = "en";
  try {
    const body = await parseJsonBody(req);
    const parsed = validateChatRequest(body);
    lang = parsed.lang;

    // Only first-turn questions are cached. A follow-up depends on its own
    // history, so a cached answer keyed on the question alone could land in the
    // wrong conversation.
    const cacheable = parsed.history.length === 0;
    const kbHash = rulesHash();
    const key = answerKey(normalizeQuestion(parsed.message), lang, parsed.site?.id);

    if (cacheable) {
      const hit = answerCache.get(key, kbHash);
      if (hit) {
        logInfo({
          route: "chat",
          event: "cache_hit",
          durationMs: Date.now() - started,
          kind: hit.kind,
          lang,
        });
        return Response.json(hit, { status: 200, headers: { "x-cache": "HIT" } });
      }
    }

    const rules = loadRules();
    // Rule text always comes from here, never from the request body. The client
    // only named which ids apply where the visitor is standing.
    const siteRules = parsed.site ? rulesByIds(rules, parsed.site.ruleIds) : [];

    // Asking the map is decided before Gemini is called, not by Gemini: a regex
    // over the question is cheaper than a round trip spent letting the model
    // request a tool. It needs somewhere to search from, so a question about
    // what is nearby with no Site attached simply gets no list, and the
    // assistant says it cannot answer rather than guessing a location too.
    const category = detectPlaceQuery(parsed.message);
    const origin = parsed.site;
    const places =
      category && typeof origin?.lat === "number" && typeof origin?.lng === "number"
        ? await findNearbyPlaces(origin.lat, origin.lng, category, {
            radiusM: PLACES_RADIUS_M,
            limit: PLACES_LIMIT,
          })
        : [];

    const { response: answer, totalTokens } = await askQuestion(
      parsed.message,
      parsed.history,
      lang,
      rules,
      { site: parsed.site, siteRules, places },
    );

    // Two kinds are deliberately never stored.
    //
    // `places` describes the world, which changes on its own, so a guest house
    // that closes would otherwise keep being named by a stored sentence. Every
    // other answer here derives from a knowledge base that only changes when
    // somebody edits it, and the hash catches that.
    //
    // `none` is a refusal. Storing failures would let one unlucky model call
    // become the permanent answer to a question the app can perfectly well
    // handle - which is the shape of the bug this whole effort started from.
    const storable = answer.kind !== "places" && answer.kind !== "none";
    if (cacheable && storable) answerCache.set(key, answer, totalTokens ?? 0, kbHash);

    logInfo({
      route: "chat",
      event: "ok",
      durationMs: Date.now() - started,
      kind: answer.kind,
      citedRules: answer.ruleIds.length,
      siteId: parsed.site?.id,
      siteRules: siteRules.length,
      placeQuery: category ?? undefined,
      places: places.length,
      cached: cacheable && storable,
      lang,
    });
    return Response.json(answer, { status: 200, headers: { "x-cache": "MISS" } });
  } catch (err) {
    return handleApiError(err, { route: "chat", startedAt: started, lang });
  }
}
