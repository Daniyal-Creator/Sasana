import { answerCache } from "@/lib/answer-cache";
import { answerKey } from "@/lib/cache";
import { askQuestion } from "@/lib/gemini";
import { handleApiError, parseJsonBody } from "@/lib/http";
import { loadRules, normalizeQuestion, rulesByIds, rulesHash, selectRules } from "@/lib/knowledge";
import { logInfo } from "@/lib/logger";
import { extractAreaName, geocodeArea, type Anchor } from "@/lib/geocode";
import { detectPlaceQuery, findNearbyPlaces } from "@/lib/places";
import { validateChatRequest } from "@/lib/validation";
import type { Lang, SiteContext } from "@shared/contract";

// F2 Custom Assistant (backend-spec §2.2). The Gemini key is read only here,
// server-side; the browser never sees it.

// Three kilometres is a short drive rather than a walk, which matches how a
// visitor at a temple actually looks for somewhere to sleep or eat. Five is
// what fits in a chat bubble without becoming a directory listing.
const PLACES_RADIUS_M = 3000;
const PLACES_LIMIT = 5;

/** How much of a name has to line up before it counts as naming the same place. */
const NAME_MATCH_MIN = 3;

/**
 * Whether the area a question names is the Site the request already carries.
 *
 * "Adakah penginapan di sekitar Pura Tanah Lot", asked from Pura Tanah Lot,
 * names the place the request already said the visitor is at. Geocoding it
 * would spend a round trip to be told what is already known, and would then be
 * turned down by the area allow-list anyway, because a temple is not an area.
 *
 * Containment either way, because the two names rarely match exactly: a visitor
 * types "Tanah Lot" for a Site called "Pura Tanah Lot".
 */
function namesTheSite(named: string, site?: SiteContext): boolean {
  if (!site) return false;
  const asked = named.toLowerCase().trim();
  const here = site.name.toLowerCase().trim();
  if (asked.length < NAME_MATCH_MIN) return false;
  return here.includes(asked) || asked.includes(here);
}

/**
 * Where to search from, strongest claim first.
 *
 * The area the visitor named wins over the Site they are standing at, because
 * naming one is the more deliberate act: somebody at Tanah Lot asking about
 * Ubud is asking about Ubud. The Site is the fallback for the far commoner
 * "penginapan di dekat sini", which names nowhere and does not need to.
 *
 * Null is a real answer, not a failure. ADR-0020 keeps ADR-0015's rule that a
 * search with nowhere to search is refused rather than pointed at a guess; what
 * changed is only that a Site is no longer the sole way to avoid that.
 */
async function resolveAnchor(message: string, site?: SiteContext): Promise<Anchor | null> {
  const named = extractAreaName(message);
  if (named && !namesTheSite(named, site)) {
    const found = await geocodeArea(named);
    if (found) return found;
  }

  if (site && typeof site.lat === "number" && typeof site.lng === "number") {
    return { label: site.name, lat: site.lat, lng: site.lng };
  }

  return null;
}

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
      const hit = await answerCache.get(key, kbHash);
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
    // request a tool. It still needs somewhere to search from, and when nothing
    // in the request says where, the assistant asks rather than guesses.
    const category = detectPlaceQuery(parsed.message);
    const anchor = category ? await resolveAnchor(parsed.message, parsed.site) : null;
    const places =
      category && anchor
        ? await findNearbyPlaces(anchor.lat, anchor.lng, category, {
            radiusM: PLACES_RADIUS_M,
            limit: PLACES_LIMIT,
          })
        : [];

    // Only the rules this question is about go into the prompt. An empty
    // retrieval falls back to the whole knowledge base, which is what keeps a
    // question worded away from the rules' own vocabulary answerable - see
    // selectRules.
    const sent = selectRules(rules, parsed.message, siteRules);

    const context = {
      site: parsed.site,
      siteRules,
      places,
      placesArea: anchor?.label,
      unanchoredPlaceQuery: Boolean(category) && anchor === null,
      allRules: rules,
    };

    const first = await askQuestion(parsed.message, parsed.history, lang, sent, context);

    /**
     * One second chance, and only where the server can tell the answer went
     * wrong without reading it.
     *
     * The server knows it put a list of real places in front of the model. An
     * answer that came back on any other tier did not use them, which in
     * practice means the model obeyed the standing ban on recommending
     * businesses over the exception written for exactly this question. Measured
     * after the prompt was rewritten: four runs in five landed on `places`, the
     * fifth still opened with "Maaf, saya tidak dapat memberikan rekomendasi".
     *
     * Asking again is the honest repair. The question does not change, the
     * facts do not change, and nothing about the reply is rewritten - the
     * second answer stands or falls on its own. If it declines too, that
     * refusal is the answer.
     */
    const retry =
      places.length > 0 && first.response.kind !== "places"
        ? await askQuestion(parsed.message, parsed.history, lang, sent, context)
        : null;

    const useRetry = retry !== null && retry.response.kind === "places";
    const answer = useRetry ? retry.response : first.response;
    const totalTokens = (first.totalTokens ?? 0) + (retry?.totalTokens ?? 0);

    // A question the map was read for is never stored, whatever tier came
    // back.
    //
    // The old rule looked at the ANSWER: `places` and `none` were skipped and
    // everything else kept. That let the worst case through. Asked "bisakah
    // anda berikan rekomendasi penginapan di ubud", the model sometimes reads
    // the standing ban on recommending businesses, ignores the map list it was
    // handed, and answers at the `rule` tier with "I cannot recommend
    // accommodation" - which is storable, so it was stored, and from then on
    // every visitor asking that question got the refusal without the map ever
    // being consulted again. Measured: `x-cache: HIT` on a question whose whole
    // point is that a lookup happens.
    //
    // The question is the thing that describes the world here, not just the
    // answer, so the lookup is what decides. ADR-0015 arrived at the same rule
    // from the other side.
    const lookedUp = Boolean(category && anchor);

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
    const storable = answer.kind !== "places" && answer.kind !== "none" && !lookedUp;
    if (cacheable && storable) await answerCache.set(key, answer, totalTokens ?? 0, kbHash);

    logInfo({
      route: "chat",
      event: "ok",
      durationMs: Date.now() - started,
      kind: answer.kind,
      citedRules: answer.ruleIds.length,
      siteId: parsed.site?.id,
      siteRules: siteRules.length,
      placeQuery: category ?? undefined,
      placeArea: anchor?.label,
      lookedUp,
      // Worth seeing in the logs: how often the model has to be asked twice
      // before it uses the map it was handed.
      retried: retry !== null,
      retryUsed: useRetry,
      places: places.length,
      rulesSent: sent.length,
      rulesTotal: rules.length,
      cached: cacheable && storable,
      lang,
    });
    return Response.json(answer, { status: 200, headers: { "x-cache": "MISS" } });
  } catch (err) {
    return handleApiError(err, { route: "chat", startedAt: started, lang });
  }
}
