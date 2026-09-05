import { analyzeImage } from "@/lib/gemini";
import { handleApiError, parseJsonBody } from "@/lib/http";
import { loadRules, rulesByIds } from "@/lib/knowledge";
import { logInfo } from "@/lib/logger";
import { decodeAndValidateImage, validateVisionRequest } from "@/lib/validation";
import type { Lang } from "@shared/contract";

// F1 Situation Check (backend-spec §2.1). Photos are held in memory for the
// length of one request and never written to disk, cached, or logged - only
// their size is (backend-spec §8.6).

export async function POST(req: Request): Promise<Response> {
  const started = Date.now();
  let lang: Lang = "en";
  try {
    const body = await parseJsonBody(req);
    const parsed = validateVisionRequest(body);
    lang = parsed.lang;

    const { data, mimeType, bytes } = decodeAndValidateImage(parsed.image);
    // The request named rule ids; their text comes from the server's own
    // knowledge base, so nothing the client sent can reach the prompt as a
    // Custom. An id the KB does not know simply drops out.
    const siteRules = parsed.site ? rulesByIds(loadRules(), parsed.site.ruleIds) : [];
    const result = await analyzeImage(data, mimeType, parsed.context, lang, parsed.site, siteRules);

    logInfo({
      route: "vision",
      event: "ok",
      durationMs: Date.now() - started,
      imageBytes: bytes,
      mimeType,
      context: parsed.context,
      siteId: parsed.site?.id,
      siteRules: siteRules.length,
      status: result.status,
      lang,
    });
    return Response.json(result, { status: 200 });
  } catch (err) {
    return handleApiError(err, { route: "vision", startedAt: started, lang });
  }
}
