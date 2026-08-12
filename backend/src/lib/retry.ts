import { isRateLimit } from "@/lib/errors";

// One-shot retry on 429 only (backend-spec §4.4). Other failures throw
// immediately: retrying a bad request just burns quota twice.
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { retries: number; backoffMs: number },
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= opts.retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < opts.retries && isRateLimit(err)) {
        await sleep(opts.backoffMs * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}
