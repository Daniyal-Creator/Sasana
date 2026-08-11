// Error taxonomy shared by every API route (backend-spec §6.1). Each error
// carries the wire `code` and HTTP status, so routes never decide either.

export type ErrorCode =
  | "invalid_json"
  | "invalid_input"
  | "unsupported_media"
  | "image_too_large"
  | "rate_limited"
  | "timeout"
  | "ai_error"
  | "kb_error"
  | "internal";

export abstract class AppError extends Error {
  abstract readonly code: ErrorCode;
  abstract readonly httpStatus: number;
}

export class ValidationError extends AppError {
  readonly code: ErrorCode;
  readonly httpStatus: number;
  constructor(code: ErrorCode, message: string, httpStatus = 400) {
    super(message);
    this.name = "ValidationError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

export const invalidJson = () => new ValidationError("invalid_json", "Malformed JSON body", 400);
export const invalidInput = (message: string) => new ValidationError("invalid_input", message, 400);
export const unsupportedMedia = () =>
  new ValidationError("unsupported_media", "Only JPEG or PNG is supported", 400);
export const imageTooLarge = () => new ValidationError("image_too_large", "Image exceeds 5 MB", 413);

export class RateLimitError extends AppError {
  readonly code = "rate_limited" as const;
  readonly httpStatus = 429;
  constructor() {
    super("Gemini rate limit exceeded");
    this.name = "RateLimitError";
  }
}

export class TimeoutError extends AppError {
  readonly code = "timeout" as const;
  readonly httpStatus = 504;
  constructor(label = "request") {
    super(`${label} timed out`);
    this.name = "TimeoutError";
  }
}

export class GeminiError extends AppError {
  readonly code = "ai_error" as const;
  readonly httpStatus = 502;
  constructor(message: string) {
    super(message);
    this.name = "GeminiError";
  }
}

export class KnowledgeBaseError extends AppError {
  readonly code = "kb_error" as const;
  readonly httpStatus = 500;
  constructor(message: string) {
    super(message);
    this.name = "KnowledgeBaseError";
  }
}

// Classified by status code rather than class name: the SDK's ApiError carries
// `status`, but proxies and wrapped errors do not always preserve the class.
export function isRateLimit(err: unknown): boolean {
  const e = err as { status?: unknown; code?: unknown; message?: unknown };
  const status = e?.status ?? e?.code;
  const message = String(e?.message ?? "");
  return status === 429 || /429|rate.?limit|resource.?exhausted|quota/i.test(message);
}

export function toGeminiError(err: unknown): AppError {
  if (err instanceof AppError) return err; // TimeoutError already typed by withTimeout
  if (isRateLimit(err)) return new RateLimitError();
  return new GeminiError(String((err as { message?: unknown })?.message ?? "unknown Gemini error"));
}

// Upstream errors can carry a whole JSON error document. Cap it so one bad
// request cannot flood the log, and so nothing an upstream echoed back at us
// gets recorded in full.
const LOGGED_MESSAGE_MAX_CHARS = 300;

export function truncateForLog(message: unknown): string {
  const text = String(message ?? "");
  return text.length > LOGGED_MESSAGE_MAX_CHARS
    ? `${text.slice(0, LOGGED_MESSAGE_MAX_CHARS)}…`
    : text;
}

export function describeError(err: unknown) {
  const e = err as { name?: unknown; status?: unknown; message?: unknown };
  return { name: String(e?.name ?? ""), status: e?.status, message: truncateForLog(e?.message) };
}
