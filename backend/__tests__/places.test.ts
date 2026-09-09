import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectPlaceQuery,
  distanceM,
  findNearbyPlaces,
  formatPlacesForPrompt,
  parseOverpass,
} from "@/lib/places";

// Pura Tanah Lot, from frontend/src/data/sites.ts.
const TANAH_LOT = { lat: -8.6212, lng: 115.0868 };

function node(name: string, lat: number, lon: number, tourism = "hotel") {
  return { lat, lon, tags: { name, tourism } };
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("detectPlaceQuery", () => {
  it.each([
    "adakah penginapan terdekat di sekitar pura tanah lot?",
    "di mana saya bisa menginap dekat sini?",
    "any hotel near the temple?",
    "where to stay around Tanah Lot",
    "ada homestay murah?",
  ])("reads %s as lodging", (q) => {
    expect(detectPlaceQuery(q)).toBe("lodging");
  });

  it.each([
    "ada tempat makan yang bagus?",
    "rekomendasi warung dekat pura",
    "any restaurant nearby?",
    "di mana cari kuliner khas?",
  ])("reads %s as food", (q) => {
    expect(detectPlaceQuery(q)).toBe("food");
  });

  // The lookup costs an HTTP round trip, so an ordinary custom question must
  // not trigger one.
  it.each([
    "boleh saya membawa makanan ke pura?",
    "apa itu canang?",
    "boleh pakai celana pendek?",
    "sejarah Tanah Lot?",
  ])("leaves %s alone", (q) => {
    expect(detectPlaceQuery(q)).toBeNull();
  });

  it("leads with lodging when a question asks for both", () => {
    expect(detectPlaceQuery("ada penginapan dan tempat makan yang bagus di sana?")).toBe("lodging");
  });
});

describe("distanceM", () => {
  it("is zero at the same point", () => {
    expect(distanceM(TANAH_LOT.lat, TANAH_LOT.lng, TANAH_LOT.lat, TANAH_LOT.lng)).toBe(0);
  });

  it("measures roughly a kilometre for 0.009 degrees of latitude", () => {
    const d = distanceM(TANAH_LOT.lat, TANAH_LOT.lng, TANAH_LOT.lat + 0.009, TANAH_LOT.lng);
    expect(d).toBeGreaterThan(950);
    expect(d).toBeLessThan(1050);
  });
});

describe("parseOverpass", () => {
  it("sorts by distance and keeps only the limit", () => {
    const data = {
      elements: [
        node("Far Hotel", TANAH_LOT.lat + 0.02, TANAH_LOT.lng),
        node("Near Hotel", TANAH_LOT.lat + 0.001, TANAH_LOT.lng),
        node("Middle Hotel", TANAH_LOT.lat + 0.005, TANAH_LOT.lng),
      ],
    };
    const places = parseOverpass(data, TANAH_LOT.lat, TANAH_LOT.lng, 2, "lodging");

    expect(places.map((p) => p.name)).toEqual(["Near Hotel", "Middle Hotel"]);
    expect(places[0].distanceM).toBeLessThan(places[1].distanceM);
  });

  it("reads a way's center, since a building has no single point", () => {
    const data = {
      elements: [
        { center: { lat: TANAH_LOT.lat + 0.001, lon: TANAH_LOT.lng }, tags: { name: "Resort", tourism: "hotel" } },
      ],
    };
    expect(parseOverpass(data, TANAH_LOT.lat, TANAH_LOT.lng, 5, "lodging")).toHaveLength(1);
  });

  // A hotel mapped as both a point and a building outline arrives twice, and a
  // list naming it at 340 m and again at 350 m reads as broken.
  it("collapses a place mapped as both a node and a way", () => {
    const data = {
      elements: [
        node("Puri Bagus", TANAH_LOT.lat + 0.001, TANAH_LOT.lng),
        { center: { lat: TANAH_LOT.lat + 0.0011, lon: TANAH_LOT.lng }, tags: { name: "puri bagus", tourism: "hotel" } },
      ],
    };
    expect(parseOverpass(data, TANAH_LOT.lat, TANAH_LOT.lng, 5, "lodging")).toHaveLength(1);
  });

  it("drops anything without a name", () => {
    const data = { elements: [{ lat: TANAH_LOT.lat, lon: TANAH_LOT.lng, tags: { tourism: "hotel" } }] };
    expect(parseOverpass(data, TANAH_LOT.lat, TANAH_LOT.lng, 5, "lodging")).toEqual([]);
  });

  it.each([[null], [{}], [{ elements: "nope" }]])("survives a payload of %s", (data) => {
    expect(parseOverpass(data, TANAH_LOT.lat, TANAH_LOT.lng, 5, "lodging")).toEqual([]);
  });
});

describe("findNearbyPlaces", () => {
  it("asks Overpass for the right tags and radius", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ elements: [] }), { status: 200 }));

    await findNearbyPlaces(TANAH_LOT.lat, TANAH_LOT.lng, "lodging", { radiusM: 3000, limit: 5 });

    // The body is a urlencoded form; decoded, it is the Overpass query itself.
    const query = decodeURIComponent(
      String((fetchMock.mock.calls[0][1] as RequestInit).body).replace(/^data=/, "").replace(/\+/g, " "),
    );
    expect(query).toContain("guest_house");
    expect(query).toContain(`around:3000,${TANAH_LOT.lat},${TANAH_LOT.lng}`);
    expect(query).toContain('["name"]'); // so unnamed points never come back
    expect(query).toContain("node["); // a small guest house is one point
    expect(query).toContain("way["); // a resort is a building outline
  });

  // Overpass is a free shared service with no availability promise. A visitor
  // asking about a temple should not see an error card because a volunteer
  // server in Germany is busy.
  it("returns nothing rather than throwing when Overpass fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("busy", { status: 429 }));
    await expect(findNearbyPlaces(TANAH_LOT.lat, TANAH_LOT.lng, "lodging")).resolves.toEqual([]);
  });

  it("returns nothing rather than throwing when the network is down", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ECONNREFUSED"));
    await expect(findNearbyPlaces(TANAH_LOT.lat, TANAH_LOT.lng, "food")).resolves.toEqual([]);
  });
});

describe("formatPlacesForPrompt", () => {
  it("writes metres under a kilometre and kilometres above", () => {
    const text = formatPlacesForPrompt([
      { name: "Warung Bagus", kind: "restaurant", distanceM: 320 },
      { name: "Guest House Melati", kind: "guest_house", distanceM: 2400 },
    ]);

    expect(text).toContain("1. Warung Bagus — restaurant, 320 m");
    expect(text).toContain("2. Guest House Melati — guest house, 2.4 km");
  });
});
