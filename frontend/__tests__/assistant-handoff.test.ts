import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  STORAGE_KEY,
  readHandoff,
  writeHandoff,
  consumeHandoff,
  freshProximity,
  PROXIMITY_TTL_MS,
  type AssistantHandoffPayload,
} from "@/lib/assistant-handoff";

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

const mockStorage = new MockStorage();
const originalWindow = globalThis.window;

const samplePayload: AssistantHandoffPayload = {
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

describe("Assistant Handoff Storage (production logic)", () => {
  beforeEach(() => {
    mockStorage.clear();
    // Stub window.sessionStorage so production code interacts with it
    // @ts-expect-error stubbing window for node environment
    globalThis.window = {
      sessionStorage: mockStorage,
    };
  });

  afterEach(() => {
    globalThis.window = originalWindow;
  });

  it("exports the expected canonical STORAGE_KEY", () => {
    expect(STORAGE_KEY).toBe("sasana.assistant_handoff");
  });

  it("writes payload to sessionStorage using writeHandoff", () => {
    writeHandoff(samplePayload);
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual(samplePayload);
  });

  it("removes payload from sessionStorage when writeHandoff is called with null", () => {
    writeHandoff(samplePayload);
    expect(window.sessionStorage.getItem(STORAGE_KEY)).not.toBeNull();

    writeHandoff(null);
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("reads and parses handoff payload using readHandoff", () => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(samplePayload));
    const retrieved = readHandoff();
    expect(retrieved).toEqual(samplePayload);
  });

  it("returns null when readHandoff encounters corrupted JSON", () => {
    window.sessionStorage.setItem(STORAGE_KEY, "{invalid-json-data");
    const retrieved = readHandoff();
    expect(retrieved).toBeNull();
  });

  it("consumes payload and immediately purges storage", () => {
    writeHandoff(samplePayload);
    expect(window.sessionStorage.getItem(STORAGE_KEY)).not.toBeNull();

    const consumed = consumeHandoff();
    expect(consumed).toEqual(samplePayload);
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(readHandoff()).toBeNull();
  });

  it("is safe during SSR when window is undefined", () => {
    // @ts-expect-error simulating SSR
    globalThis.window = undefined;

    expect(readHandoff()).toBeNull();
    expect(() => writeHandoff(samplePayload)).not.toThrow();
    expect(() => writeHandoff(null)).not.toThrow();
    expect(consumeHandoff()).toBeNull();
  });
});

describe("freshProximity", () => {
  const fix = { state: "approach", distanceM: 640, accuracyM: 25 } as const;
  const at = 1_000_000;

  it("returns the fix while it is inside the window", () => {
    expect(freshProximity({ fix, at }, at + 1)).toEqual(fix);
    expect(freshProximity({ fix, at }, at + PROXIMITY_TTL_MS)).toEqual(fix);
  });

  it("drops the fix once the window has passed", () => {
    expect(freshProximity({ fix, at }, at + PROXIMITY_TTL_MS + 1)).toBeNull();
  });

  // A visitor can press "ask", pocket the phone, and walk into the courtyard.
  // Quoting the crossing distance back at them there is the failure this window
  // exists to prevent.
  it("drops a fix that is minutes old", () => {
    expect(freshProximity({ fix, at }, at + 10 * 60_000)).toBeNull();
  });

  it("treats a backwards clock as stale rather than as fresh", () => {
    expect(freshProximity({ fix, at }, at - 1)).toBeNull();
  });

  it("is null when nothing was carried", () => {
    expect(freshProximity(null)).toBeNull();
    expect(freshProximity(undefined)).toBeNull();
  });

  describe("through storage, which is how it actually arrives", () => {
    beforeEach(() => {
      mockStorage.clear();
      // @ts-expect-error stubbing window for node environment
      globalThis.window = { sessionStorage: mockStorage };
    });

    afterEach(() => {
      globalThis.window = originalWindow;
    });

    it("survives the JSON round trip intact", () => {
      const payload: AssistantHandoffPayload = {
        question: "",
        lang: "id",
        proximity: { fix, at },
      };
      writeHandoff(payload);
      expect(freshProximity(consumeHandoff()?.proximity, at + 1)).toEqual(fix);
    });

    // The button Explore uses carries a place and no sentence. A payload that
    // only survived when it had a question would drop the position for exactly
    // the visitor it was measured for.
    it("survives with no question attached", () => {
      writeHandoff({ question: "", lang: "id", proximity: { fix, at } });
      const back = consumeHandoff();
      expect(back?.question).toBe("");
      expect(freshProximity(back?.proximity, at + 1)).toEqual(fix);
    });

    it("is absent, not undefined-shaped, for a payload that never had one", () => {
      writeHandoff({ question: "hi", lang: "en" });
      expect(freshProximity(consumeHandoff()?.proximity)).toBeNull();
    });
  });
});
