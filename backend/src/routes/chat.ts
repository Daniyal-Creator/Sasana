import { chatCache, chatCacheKey } from "@/lib/cache";
import { askQuestion } from "@/lib/gemini";
import { handleApiError, parseJsonBody } from "@/lib/http";
import { loadRules, rulesByIds } from "@/lib/knowledge";
import { logInfo } from "@/lib/logger";
import { validateChatRequest } from "@/lib/validation";
import type { Lang } from "@shared/contract";

// F2 Custom Assistant (backend-spec §2.2). The Gemini key is read only here,
// server-side; the browser never sees it.

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
    // The Site belongs in the key: once it reaches the prompt the answer is
    // about that place, and serving Tanah Lot's answer at Besakih would be a
    // confident wrong Custom - the failure this app exists to prevent.
    const key = chatCacheKey(parsed.message, lang, parsed.site?.id);

    if (cacheable) {
      const hit = chatCache.get(key);
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
    const answer = await askQuestion(
      parsed.message,
      parsed.history,
      lang,
      rules,
      parsed.site,
      siteRules,
    );
    if (cacheable) chatCache.set(key, answer);

    logInfo({
      route: "chat",
      event: "ok",
      durationMs: Date.now() - started,
      kind: answer.kind,
      citedRules: answer.ruleIds.length,
      siteId: parsed.site?.id,
      siteRules: siteRules.length,
      lang,
    });
    return Response.json(answer, { status: 200, headers: { "x-cache": "MISS" } });
  } catch (err) {
    return handleApiError(err, { route: "chat", startedAt: started, lang });
  }
}
