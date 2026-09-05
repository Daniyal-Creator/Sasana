import { describe, expect, it, beforeEach } from "vitest";
import type { AssistantHandoffPayload } from "@/lib/assistant-context";

class MockStorage implements Storage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }

  get length(): number {
    return Object.keys(this.store).length;
  }
}

if (typeof globalThis.sessionStorage === "undefined") {
  Object.defineProperty(globalThis, "sessionStorage", {
    value: new MockStorage(),
    writable: true,
    configurable: true,
  });
}

const STORAGE_KEY = "sasana.assistant_handoff";

describe("Assistant Handoff Data", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("stores and retrieves handoff payload properly", () => {
    const payload: AssistantHandoffPayload = {
      question: "Can I wear shorts at this temple?",
      imageUrl: "data:image/jpeg;base64,abc123mock",
      lang: "en",
      contextResult: {
        status: "needs_attention",
        reason: "Shorts require a kamen wrap",
        suggestion: "Rent a sarong at the entrance",
        reference: "Circular 7/2025",
      },
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    const retrieved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");

    expect(retrieved.question).toBe("Can I wear shorts at this temple?");
    expect(retrieved.imageUrl).toBe("data:image/jpeg;base64,abc123mock");
    expect(retrieved.lang).toBe("en");
    expect(retrieved.contextResult?.status).toBe("needs_attention");
  });

  it("clears storage when payload is consumed", () => {
    const payload: AssistantHandoffPayload = {
      question: "Apakah boleh memotret?",
      imageUrl: null,
      lang: "id",
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    expect(sessionStorage.getItem(STORAGE_KEY)).not.toBeNull();

    sessionStorage.removeItem(STORAGE_KEY);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
