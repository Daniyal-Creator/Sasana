import type { ChatResponse } from "@shared/contract";

// Serverless caveat: this lives in one warm function instance and is not shared
// across instances or cold starts. That is fine for the MVP - it is a
// best-effort hit-rate booster against the free-tier quota (PRD §19), not a
// correctness mechanism. A shared store (e.g. Vercel KV) is a post-MVP option.

const ONE_HOUR_MS = 60 * 60 * 1000;
const MAX_ENTRIES = 200;

export class TTLCache<V> {
  private store = new Map<string, { value: V; expiresAt: number }>();

  constructor(
    private readonly ttlMs: number,
    private readonly max: number,
  ) {}

  get(key: string): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: V): void {
    // Re-inserting must refresh recency, so drop the old position first.
    this.store.delete(key);
    if (this.store.size >= this.max) {
      const oldest = this.store.keys().next();
      if (!oldest.done) this.store.delete(oldest.value);
    }
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  get size(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }
}

export const chatCache = new TTLCache<ChatResponse>(ONE_HOUR_MS, MAX_ENTRIES);

// Language is part of the key: the same question must not return an English
// answer to an Indonesian asker.
export function chatCacheKey(message: string, lang: string): string {
  return `${lang}::${message.toLowerCase().replace(/\s+/g, " ").trim()}`;
}
