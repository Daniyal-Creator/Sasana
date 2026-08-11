import { AppError, invalidJson, truncateForLog, ValidationError, type ErrorCode } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/lib/messages";
import { logError } from "@/lib/logger";
import type { Lang } from "@/lib/i18n";

export async function parseJsonBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) throw invalidJson();
    return body as Record<string, unknown>;
  } catch (err) {
    if (err instanceof ValidationError) throw err;
    throw invalidJson();
  }
}

// The single error boundary for every route: maps any thrown value to a safe
// status and localized message, logs it with context, and never lets an
// internal message or stack cross the boundary (backend-spec §6.2).
export function handleApiError(
  err: unknown,
  ctx: { route: string; startedAt: number; lang?: Lang },
): Response {
  const lang: Lang = ctx.lang ?? "en";
  const isApp = err instanceof AppError;
  const code: ErrorCode = isApp ? err.code : "internal";
  const status = isApp ? err.httpStatus : 500;

  logError({
    route: ctx.route,
    event: "error",
    code,
    httpStatus: status,
    durationMs: Date.now() - ctx.startedAt,
    err: {
      name: String((err as { name?: unknown })?.name ?? ""),
      message: truncateForLog((err as { message?: unknown })?.message),
    },
  });

  return Response.json({ error: ERROR_MESSAGES[code][lang], code }, { status });
}
