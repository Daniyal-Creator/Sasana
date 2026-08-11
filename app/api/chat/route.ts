import { chatCache, chatCacheKey } from "@/lib/cache";
import { askQuestion } from "@/lib/gemini";
import { handleApiError, parseJsonBody } from "@/lib/http";
import { loadRules } from "@/lib/knowledge";
import { logInfo } from "@/lib/logger";
import { validateChatRequest } from "@/lib/validation";
import type { Lang } from "@/lib/i18n";

// F2 Custom Assistant (backend-spec §2.2). The Gemini key is read only here,
// server-side; the browser never sees it.

export const runtime = "nodejs";
export const maxDuration = 15; // seconds; the 9s app timeout fires first

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
    const key = chatCacheKey(parsed.message, lang);

    if (cacheable) {
      const hit = chatCache.get(key);
      if (hit) {
        logInfo({
          route: "chat",
          event: "cache_hit",
          durationMs: Date.now() - started,
          grounded: hit.grounded,
          lang,
        });
        return Response.json(hit, { status: 200, headers: { "x-cache": "HIT" } });
      }
    }

    const answer = await askQuestion(parsed.message, parsed.history, lang, loadRules());
    if (cacheable) chatCache.set(key, answer);

    logInfo({
      route: "chat",
      event: "ok",
      durationMs: Date.now() - started,
      grounded: answer.grounded,
      lang,
    });
    return Response.json(answer, { status: 200, headers: { "x-cache": "MISS" } });
  } catch (err) {
    return handleApiError(err, { route: "chat", startedAt: started, lang });
  }
}
