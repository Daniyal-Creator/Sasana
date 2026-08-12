import { afterEach, describe, expect, it, vi } from "vitest";
import { TTLCache, chatCacheKey } from "@/lib/cache";

afterEach(() => {
  vi.useRealTimers();
});

describe("TTLCache", () => {
  it("returns a stored value and undefined for an unknown key", () => {
    const cache = new TTLCache<string>(1000, 10);
    cache.set("a", "value");

    expect(cache.get("a")).toBe("value");
    expect(cache.get("missing")).toBeUndefined();
  });

  it("expires an entry once its TTL has passed", () => {
    vi.useFakeTimers();
    const cache = new TTLCache<string>(60_000, 10);
    cache.set("a", "value");

    vi.advanceTimersByTime(59_999);
    expect(cache.get("a")).toBe("value");

    vi.advanceTimersByTime(2);
    expect(cache.get("a")).toBeUndefined();
    expect(cache.size).toBe(0); // the expired entry is dropped, not just hidden
  });

  it("evicts the oldest entry when full", () => {
    const cache = new TTLCache<number>(60_000, 3);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);
    cache.set("d", 4);

    expect(cache.size).toBe(3);
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("d")).toBe(4);
  });

  it("treats a re-set key as the newest entry", () => {
    const cache = new TTLCache<number>(60_000, 3);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("a", 10); // refreshes recency, so "b" is now oldest
    cache.set("c", 3);
    cache.set("d", 4);

    expect(cache.get("a")).toBe(10);
    expect(cache.get("b")).toBeUndefined();
  });

  it("clears every entry", () => {
    const cache = new TTLCache<number>(60_000, 10);
    cache.set("a", 1);
    cache.clear();

    expect(cache.size).toBe(0);
    expect(cache.get("a")).toBeUndefined();
  });
});

describe("chatCacheKey", () => {
  it("ignores case and surrounding or repeated whitespace", () => {
    expect(chatCacheKey("  Can I   wear SHORTS? ", "en")).toBe(chatCacheKey("can i wear shorts?", "en"));
  });

  it("keeps languages apart", () => {
    expect(chatCacheKey("same question", "en")).not.toBe(chatCacheKey("same question", "id"));
  });
});
