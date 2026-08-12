// Evaluated at import time so a misconfigured deploy fails at startup with a
// clear message, not at the first user request (backend-spec §7.4).

function required(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(
      `[env] Missing required environment variable: ${name}. ` +
        `Add it to backend/.env for local development, or to the host's ` +
        `environment settings for a deploy.`,
    );
  }
  return value.trim();
}

function optNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export const env = {
  GEMINI_API_KEY: required("GEMINI_API_KEY"),
  // Latest free Flash generation, per PRD §8. The 2.5 models named in
  // backend-spec are stale: gemini-2.5-flash-lite now 404s for new API keys
  // ("no longer available to new users"), and the 3.x line is both faster and
  // more accurate on vision. Verified against the live API on 2026-08-12.
  GEMINI_VISION_MODEL: process.env.GEMINI_VISION_MODEL?.trim() || "gemini-3.6-flash",
  GEMINI_CHAT_MODEL: process.env.GEMINI_CHAT_MODEL?.trim() || "gemini-3.5-flash-lite",
  // Vision and chat get separate caps because their latency profiles are an
  // order of magnitude apart. Measured on gemini-3.6-flash with a 1024px JPEG:
  // chat lands at 1.2-1.4s every time, vision ranges 2.1s to 16.9s (the slowest
  // runs are the first after a cold process).
  //
  // A single 9s cap used to serve both. That number was chosen to stay under
  // Vercel's serverless function ceiling - a constraint that disappeared when
  // the backend became its own container - and it rejected roughly a fifth of
  // vision calls that would otherwise have succeeded, surfacing as a 504 the
  // user could only answer by retrying and waiting again.
  GEMINI_VISION_TIMEOUT_MS: optNumber("GEMINI_VISION_TIMEOUT_MS", 30000),
  GEMINI_CHAT_TIMEOUT_MS: optNumber("GEMINI_CHAT_TIMEOUT_MS", 15000),
  GEMINI_RETRY_BACKOFF_MS: optNumber("GEMINI_RETRY_BACKOFF_MS", 1500),
} as const;
