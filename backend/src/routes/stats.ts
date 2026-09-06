import { answerCache } from "@/lib/answer-cache";
import { handleApiError } from "@/lib/http";
import { rulesHash } from "@/lib/knowledge";

// The evidence half of the answer cache. A cache nobody can measure is a claim
// rather than a result, and this endpoint is what turns "it saves tokens" into
// a number somebody can put in a report and defend.
//
// Nothing here is sensitive: the store holds normalised keys, never the
// sentences visitors typed, and these are aggregates over those.
export function GET(): Response {
  try {
    return Response.json(answerCache.stats(rulesHash()), { status: 200 });
  } catch (err) {
    return handleApiError(err, { route: "stats", startedAt: Date.now(), lang: "en" });
  }
}
