// The one cache instance the routes share, and the single place that decides
// which of the two stores is behind it (ADR-0018).
//
// Kept apart from the classes so tests can build their own against `:memory:`
// without the module ever opening a file or a socket, and so the process opens
// exactly one handle no matter how many routes import it.
//
// The choice is made by whether DATABASE_URL is set rather than by a NODE_ENV
// check, because the question is not "is this production" but "is there a
// database to talk to". That keeps the local container, a developer's laptop
// and CI on SQLite by default, hands Postgres to any deployment that sets the
// variable, and lets anybody point their own checkout at a scratch Supabase
// project just by setting one variable.
//
// Which of the two production runs is not written down anywhere: ADR-0023 could
// read `/api/stats` from outside and it does not say. The startup line below is
// how you find out from a machine you can read.

import { type AnswerStore, AnswerCache } from "@/lib/cache";
import { PostgresAnswerCache } from "@/lib/cache-postgres";
import { env } from "@/lib/env";
import { logInfo } from "@/lib/logger";

export const answerCache: AnswerStore = env.DATABASE_URL
  ? new PostgresAnswerCache(env.DATABASE_URL, env.CACHE_ENABLED)
  : new AnswerCache(env.CACHE_DB_PATH, env.CACHE_ENABLED);

// Said once at startup, because "the saving is stuck at zero" and "we are
// pointed at the wrong store" look identical from the outside otherwise.
logInfo({
  route: "server",
  event: "cache_store",
  store: env.DATABASE_URL ? "postgres" : "sqlite",
  enabled: env.CACHE_ENABLED,
});
