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

// Required only on the provider actually in use, so a laptop running the free
// Google key is not asked for gateway credentials it will never send, and a
// deploy pointed at the gateway is not asked for a Google key it does not have.
function requiredWhen(condition: boolean, name: string): string {
  return condition ? required(name) : (process.env[name]?.trim() ?? "");
}

function optNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/**
 * Who serves the two AI features.
 *
 * `google` calls Google directly with a free-tier key: no extra hop, and the
 * only path where `thinkingLevel: MINIMAL` is actually honoured. Right for
 * local work, wrong for a room full of people - the free tier's per-minute and
 * per-day caps are what this project keeps hitting.
 *
 * `koboi` calls KoboiLLM, an OpenAI-compatible gateway in front of the same
 * Gemini models, on a paid quota bought with local payment, with one key per
 * feature so a spent vision quota cannot take the chatbot down with it.
 *
 * Deliberately a deploy-time switch: the same commit runs either way.
 */
const AI_PROVIDERS = ["google", "koboi"] as const;
export type AiProvider = (typeof AI_PROVIDERS)[number];

const AI_PROVIDER = (process.env.AI_PROVIDER?.trim() || "google") as AiProvider;
if (!AI_PROVIDERS.includes(AI_PROVIDER)) {
  throw new Error(
    `[env] AI_PROVIDER must be one of ${AI_PROVIDERS.join(", ")}; received "${AI_PROVIDER}".`,
  );
}
const usingKoboi = AI_PROVIDER === "koboi";

export const env = {
  AI_PROVIDER,
  GEMINI_API_KEY: requiredWhen(!usingKoboi, "GEMINI_API_KEY"),
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
  // A single 9s cap used to serve both. That number was chosen to stay under a
  // serverless function's execution ceiling - a constraint that went away with
  // the serverless deploy itself (ADR-0023) - and it rejected roughly a fifth of
  // vision calls that would otherwise have succeeded, surfacing as a 504 the
  // user could only answer by retrying and waiting again.
  GEMINI_VISION_TIMEOUT_MS: optNumber("GEMINI_VISION_TIMEOUT_MS", 30000),
  GEMINI_CHAT_TIMEOUT_MS: optNumber("GEMINI_CHAT_TIMEOUT_MS", 15000),
  GEMINI_RETRY_BACKOFF_MS: optNumber("GEMINI_RETRY_BACKOFF_MS", 1500),
  // The three timeouts above keep their GEMINI_ names but bound BOTH providers:
  // the budget belongs to the feature, not to the vendor serving it, and the
  // gateway fronts the same models at the same speeds. Renaming them would
  // break every environment already setting them for no gain here.
  //
  // Gateway settings. Required only when AI_PROVIDER=koboi; inert otherwise, so
  // the keys can sit filled in and unused until the switch is thrown.
  //
  // The base URL ends at /v1 because the adapter appends /chat/completions.
  KOBOI_BASE_URL:
    process.env.KOBOI_BASE_URL?.trim().replace(/\/+$/, "") || "https://lite.koboillm.com/v1",
  // One key per feature. Each is scoped in the KoboiLLM dashboard to exactly
  // the model below it, so a key that leaks cannot spend on anything else.
  KOBOI_VISION_API_KEY: requiredWhen(usingKoboi, "KOBOI_VISION_API_KEY"),
  KOBOI_CHAT_API_KEY: requiredWhen(usingKoboi, "KOBOI_CHAT_API_KEY"),
  // Verified against GET /v1/models on 2026-09-07: the gateway lists these ids
  // plain, with no provider prefix.
  KOBOI_VISION_MODEL: process.env.KOBOI_VISION_MODEL?.trim() || "gemini-3.6-flash",
  KOBOI_CHAT_MODEL: process.env.KOBOI_CHAT_MODEL?.trim() || "gemini-3.5-flash-lite",
  // Supabase Postgres, and the switch between the cache's two stores
  // (ADR-0018). Set, the answer cache is the hosted table; unset, it is the
  // local SQLite file below.
  //
  // Unset is the right default and not merely a convenience: `npm run dev` and
  // `npm run test:run` then need no database, no credentials and no network,
  // so somebody working on the landing page can run the whole suite without a
  // Supabase account. A deployment that wants the hosted table sets it in that
  // server's own environment; whether production does is not recorded, and the
  // `cache_store` line `answer-cache.ts` logs at startup is what says so on a
  // machine you can read (ADR-0023).
  //
  // Use the TRANSACTION POOLER string (port 6543), not the direct connection.
  // It is the safe default either way: a host that opens and drops connections
  // constantly is exactly what the pooler exists for, and the direct port will
  // exhaust its connection limit.
  DATABASE_URL: process.env.DATABASE_URL?.trim() || "",
  // Where the SQLite answer cache keeps its table, when that is the store in
  // use. Relative to the working directory, which is /app/backend in the
  // development container; docker-compose mounts a volume there so the answers
  // survive a rebuild.
  CACHE_DB_PATH: process.env.CACHE_DB_PATH?.trim() || "./data/answers.db",
  // The switch that makes the saving measurable. Turning it off still records
  // misses, so the same questions can be run twice - once cold, once warm - and
  // the two /api/stats readings put side by side.
  CACHE_ENABLED: process.env.CACHE_ENABLED?.trim() !== "false",
} as const;
