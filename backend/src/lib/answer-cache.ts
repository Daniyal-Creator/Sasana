// The one cache instance the routes share.
//
// Kept apart from the class so tests can build their own against `:memory:`
// without the module ever opening a file, and so the process opens exactly one
// database handle no matter how many routes import it.

import { AnswerCache } from "@/lib/cache";
import { env } from "@/lib/env";

export const answerCache = new AnswerCache(env.CACHE_DB_PATH, env.CACHE_ENABLED);
