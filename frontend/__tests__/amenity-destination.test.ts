import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AMENITY_STORAGE_KEY,
  readAmenityDestination,
  writeAmenityDestination,
} from "@/lib/amenity-destination";
import type { Amenity } from "@shared/contract";

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

const MELATI: Amenity = {
  name: "Guest House Melati",
  kind: "guest_house",
  distanceM: 420,
  lat: -8.6202,
  lng: 115.0868,
};

beforeEach(() => {
  mockStorage.clear();
  // @ts-expect-error stubbing window for node environment
  globalThis.window = { sessionStorage: mockStorage };
});

afterEach(() => {
  globalThis.window = originalWindow;
});

describe("the Amenity a visitor is headed for", () => {
  it("comes back as it went in", () => {
    writeAmenityDestination(MELATI);
    expect(readAmenityDestination()).toEqual(MELATI);
  });

  it("is nothing until one is chosen", () => {
    expect(readAmenityDestination()).toBeNull();
  });

  // Unlike the assistant handoff, this is not consumed on read: a visitor looks
  // at where a guest house is, goes back to ask something else, and returns to
  // the map still meaning to go there.
  it("survives being read", () => {
    writeAmenityDestination(MELATI);
    readAmenityDestination();
    expect(readAmenityDestination()).toEqual(MELATI);
  });

  it("is cleared by writing null", () => {
    writeAmenityDestination(MELATI);
    writeAmenityDestination(null);
    expect(readAmenityDestination()).toBeNull();
  });
});

describe("reading storage nobody promised was ours", () => {
  // Storage can hold whatever an older version wrote. A shape that no longer
  // matches has to read as no destination, because the alternative is a pin
  // drawn at NaN, NaN and a map that quietly stops working.
  it.each([
    ["no coordinates", { name: "Melati", kind: "guest_house", distanceM: 10 }],
    ["a latitude that is not a number", { ...MELATI, lat: "-8.62" }],
    ["a latitude that is not finite", { ...MELATI, lat: Number.NaN }],
    ["no name", { ...MELATI, name: undefined }],
    ["nothing at all", {}],
  ])("treats %s as no destination", (_label, stored) => {
    mockStorage.setItem(AMENITY_STORAGE_KEY, JSON.stringify(stored));
    expect(readAmenityDestination()).toBeNull();
  });

  it("treats corrupted JSON as no destination", () => {
    mockStorage.setItem(AMENITY_STORAGE_KEY, "{not json");
    expect(readAmenityDestination()).toBeNull();
  });

  // A missing distance is not a broken record. It is only ever a label on the
  // card, and the point is what the map needs.
  it("keeps a record that lost only its distance", () => {
    mockStorage.setItem(
      AMENITY_STORAGE_KEY,
      JSON.stringify({ name: "Melati", kind: "guest_house", lat: -8.62, lng: 115.09 }),
    );
    expect(readAmenityDestination()).toMatchObject({ name: "Melati", distanceM: 0 });
  });
});

describe("without storage", () => {
  it("reads null and writes nothing rather than throwing", () => {
    // @ts-expect-error a browser that refuses storage in private mode
    globalThis.window = {};
    expect(() => writeAmenityDestination(MELATI)).not.toThrow();
    expect(readAmenityDestination()).toBeNull();
  });
});
