import { beforeEach, describe, expect, it, vi } from "vitest";
import { BALI_VIEWBOX, extractAreaName, geocodeArea, pickArea } from "@/lib/geocode";
import { buildRefusal } from "@/lib/prompts";
import { loadRules } from "@/lib/knowledge";

function result(
  addresstype: string,
  display_name: string,
  lat = "-8.5170195",
  lon = "115.2550507",
) {
  return { addresstype, display_name, lat, lon };
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("extractAreaName", () => {
  it.each([
    ["adakah penginapan di Ubud?", "Ubud"],
    ["hotel dekat Ubud", "Ubud"],
    ["tempat makan di sekitar Canggu", "Canggu"],
    ["cari penginapan di daerah Sanur", "Sanur"],
    ["where to stay near Seminyak", "Seminyak"],
    ["any restaurant around Kuta", "Kuta"],
    ["restoran di Kuta Utara", "Kuta Utara"],
  ])("reads the area out of %s", (question, expected) => {
    expect(extractAreaName(question)).toBe(expected);
  });

  // The clause after the name is a different question about the same place.
  it("stops the name where the sentence turns", () => {
    expect(extractAreaName("penginapan dekat Ubud yang murah")).toBe("Ubud");
    expect(extractAreaName("hotel near Ubud and a restaurant")).toBe("Ubud");
  });

  // These name nowhere, and handing "mana saya bisa" to a geocoder is how a
  // search ends up somewhere nobody asked about.
  it.each([
    "di mana saya bisa menginap?",
    "ada penginapan di sekitar sini?",
    "where to stay around here",
    "ada tempat makan di dekat sini",
    "adakah hotel?",
  ])("returns null for %s", (question) => {
    expect(extractAreaName(question)).toBeNull();
  });
});

describe("pickArea", () => {
  /**
   * The reason the allow-list exists, kept as a test rather than as a sentence.
   * This payload is what Nominatim really returns for `Bogor` bounded to Bali:
   * not nothing, but a road in Bali that happens to carry the name.
   */
  it("rejects a road that happens to match the name", () => {
    const bogorInBali = [result("road", "Jalan Bogor, Denpasar, Bali, Indonesia", "-8.8010579", "115.1498771")];
    expect(pickArea(bogorInBali)).toBeNull();
  });

  it.each(["city", "town", "village", "suburb", "island", "county"])(
    "accepts an addresstype of %s",
    (type) => {
      expect(pickArea([result(type, "Ubud, Gianyar, Bali, Indonesia")])?.label).toBe(
        "Ubud, Gianyar, Bali, Indonesia",
      );
    },
  );

  it.each(["road", "building", "attraction", "place_of_worship", "shop", "hotel"])(
    "rejects an addresstype of %s",
    (type) => {
      expect(pickArea([result(type, "Somewhere, Bali, Indonesia")])).toBeNull();
    },
  );

  it("takes the first area, skipping whatever ranked above it", () => {
    const mixed = [
      result("road", "Jalan Ubud, Bali"),
      result("town", "Ubud, Gianyar, Bali, Indonesia"),
      result("village", "Ubud Kaja, Bali"),
    ];
    expect(pickArea(mixed)?.label).toBe("Ubud, Gianyar, Bali, Indonesia");
  });

  it("carries the coordinates as numbers", () => {
    const anchor = pickArea([result("town", "Ubud, Gianyar, Bali, Indonesia")]);
    expect(anchor?.lat).toBeCloseTo(-8.517, 3);
    expect(anchor?.lng).toBeCloseTo(115.255, 3);
  });

  it.each([[null], [{}], ["nope"], [[]], [[{ addresstype: "town" }]]])(
    "survives a payload of %s",
    (data) => {
      expect(pickArea(data)).toBeNull();
    },
  );
});

describe("geocodeArea", () => {
  it("asks Nominatim only inside Bali", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));

    await geocodeArea("Ubud");

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain(`viewbox=${encodeURIComponent(BALI_VIEWBOX)}`);
    expect(url).toContain("bounded=1");
    // Nominatim's usage policy requires callers to identify themselves.
    const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers["User-Agent"]).toContain("SASANA");
  });

  // Nominatim is free, volunteer-run and promises nothing. A busy server must
  // cost a visitor their answer, never an error card.
  it("returns null rather than throwing when Nominatim fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("busy", { status: 429 }));
    await expect(geocodeArea("Ubud")).resolves.toBeNull();
  });

  it("returns null rather than throwing when the network is down", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ECONNREFUSED"));
    await expect(geocodeArea("Ubud")).resolves.toBeNull();
  });

  it("returns null when Bali holds nothing but a road by that name", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([result("road", "Jalan Bogor, Denpasar, Bali, Indonesia")]), {
        status: 200,
      }),
    );
    await expect(geocodeArea("Bogor")).resolves.toBeNull();
  });
});

describe("the refusal that asks where", () => {
  const rules = loadRules();

  it.each(["en", "id"] as const)("asks for an area and shows one to copy, in %s", (lang) => {
    const text = buildRefusal("adakah penginapan?", lang, rules, "noArea");
    expect(text).toContain("Ubud");
    expect(text.length).toBeGreaterThan(0);
  });

  // It already asks a question. Following that with "what I can help with:
  // attire, photography" reads as changing the subject rather than waiting.
  it("does not append the topic menu", () => {
    const noArea = buildRefusal("adakah penginapan?", "id", rules, "noArea");
    const uncovered = buildRefusal("adakah penginapan?", "id", rules, "uncovered");
    expect(noArea).not.toContain("Yang bisa saya bantu");
    expect(uncovered).toContain("Yang");
    expect(noArea.length).toBeLessThan(uncovered.length);
  });
});
