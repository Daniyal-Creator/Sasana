import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  SITE_STORAGE_KEY,
  readActiveSite,
  siteContextFrom,
  writeActiveSite,
} from "@/lib/site-context";
import { SITES } from "@/data/sites";
import { buildDummySites } from "@/data/dummy-sites";
import type { Site } from "@/data/sites";

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

const realSite = SITES[0];

beforeEach(() => {
  mockStorage.clear();
  // @ts-expect-error stubbing window for node environment
  globalThis.window = { sessionStorage: mockStorage };
});

afterEach(() => {
  globalThis.window = originalWindow;
});

describe("siteContextFrom", () => {
  it("narrows a real Site to its identity and its Customs' rule ids", () => {
    const context = siteContextFrom(realSite);

    expect(context).not.toBeNull();
    expect(context?.id).toBe(realSite.id);
    expect(context?.name).toBe(realSite.name);
    expect(context?.ruleIds.length).toBeGreaterThan(0);
  });

  it("carries no Custom text, only rule ids", () => {
    // The server holds the rule text. If a Custom's wording could travel from
    // the browser, a crafted client could put words in the app's mouth.
    const serialised = JSON.stringify(siteContextFrom(realSite));
    const firstCustom = realSite.customs[0];

    expect(serialised).not.toContain(firstCustom.title.en);
    expect(serialised).not.toContain(firstCustom.summary.en);
  });

  it("collapses rule ids shared by two Customs", () => {
    const context = siteContextFrom(realSite);

    expect(context?.ruleIds).toEqual([...new Set(context?.ruleIds)]);
  });

  it("every rule id it emits comes from the Site's own Customs", () => {
    const fromCustoms = new Set(realSite.customs.flatMap((c) => c.ruleIds));

    for (const id of siteContextFrom(realSite)?.ruleIds ?? []) {
      expect(fromCustoms.has(id)).toBe(true);
    }
  });

  it("refuses a Dummy Site, whose name is invented", () => {
    // ADR-0012: a fictional place must not reach the backend. Naming one in a
    // prompt would have the app describe a temple that does not exist.
    const [dummy] = buildDummySites({ lat: -8.65, lng: 115.22 }, "en");

    expect(siteContextFrom(dummy)).toBeNull();
  });

  it("refuses a Site whose Customs cite no rules", () => {
    const bare = { ...realSite, customs: [] } as Site;

    expect(siteContextFrom(bare)).toBeNull();
  });
});

describe("readActiveSite and writeActiveSite", () => {
  it("round-trips a Site through storage", () => {
    const context = siteContextFrom(realSite);
    writeActiveSite(context);

    expect(readActiveSite()).toEqual(context);
  });

  it("reads nothing when no Site has been recorded", () => {
    expect(readActiveSite()).toBeNull();
  });

  it("clears the Site when passed null", () => {
    writeActiveSite(siteContextFrom(realSite));
    writeActiveSite(null);

    expect(readActiveSite()).toBeNull();
    expect(mockStorage.getItem(SITE_STORAGE_KEY)).toBeNull();
  });

  it.each([
    ["corrupted JSON", "{not json"],
    ["a shape from another version", JSON.stringify({ id: "x" })],
    ["an empty rule list", JSON.stringify({ id: "x", name: "X", ruleIds: [] })],
    ["rule ids that are not an array", JSON.stringify({ id: "x", name: "X", ruleIds: "a" })],
  ])("treats %s as no Site rather than sending it onward", (_label, stored) => {
    mockStorage.setItem(SITE_STORAGE_KEY, stored);

    expect(readActiveSite()).toBeNull();
  });

  it("reads nothing during SSR, where there is no window", () => {
    // @ts-expect-error removing window for the SSR case
    globalThis.window = undefined;

    expect(readActiveSite()).toBeNull();
    expect(() => writeActiveSite(siteContextFrom(realSite))).not.toThrow();
  });
});
