import { analyzeImage } from "@/lib/gemini";
import { handleApiError, parseJsonBody } from "@/lib/http";
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
    const result = await analyzeImage(data, mimeType, parsed.context, lang);

    logInfo({
      route: "vision",
      event: "ok",
      durationMs: Date.now() - started,
      imageBytes: bytes,
      mimeType,
      context: parsed.context,
      status: result.status,
      lang,
    });
    return Response.json(result, { status: 200 });
  } catch (err) {
    return handleApiError(err, { route: "vision", startedAt: started, lang });
  }
}
