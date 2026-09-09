import { beforeEach, describe, expect, it, vi } from "vitest";
import { TINY_JPEG_BASE64 } from "./fixtures";

const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
  Type: { OBJECT: "OBJECT", STRING: "STRING", BOOLEAN: "BOOLEAN" },
  ThinkingLevel: { MINIMAL: "MINIMAL", LOW: "LOW" },
}));

import { buildPhotoMetaLine } from "@/lib/prompts";
import { validatePhotoMeta } from "@/lib/validation";
import { POST as vision } from "@/routes/vision";
import type { PhotoMeta } from "@shared/contract";

const EVENING_AT_TIRTA_EMPUL: PhotoMeta = {
  source: "camera",
  takenAt: "2026-09-05T18:40:00",
  timeZoneOffsetMin: 480,
  timeSource: "clock",
  coords: { lat: -8.4157, lng: 115.3153, accuracyM: 18, source: "device" },
};

function post(body: unknown): Request {
  return new Request("http://localhost/api/vision", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Every text part the model was handed, flattened for substring assertions. */
function promptText(): string {
  return JSON.stringify(generateContent.mock.calls);
}

beforeEach(() => {
  generateContent.mockReset();
  generateContent.mockResolvedValue({
    text: JSON.stringify({
      status: "compliant",
      reason: "Shoulders and knees are covered.",
      suggestion: "Keep the sash tied while you are inside.",
      reference: "Bali Governor Circular No. 7 of 2025",
    }),
    usageMetadata: { totalTokenCount: 300 },
  });
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("validatePhotoMeta", () => {
  it("keeps a well-formed payload", () => {
    expect(validatePhotoMeta(EVENING_AT_TIRTA_EMPUL)).toEqual(EVENING_AT_TIRTA_EMPUL);
  });

  it("drops anything that is not a photo metadata object", () => {
    expect(validatePhotoMeta(undefined)).toBeUndefined();
    expect(validatePhotoMeta("camera")).toBeUndefined();
    expect(validatePhotoMeta([])).toBeUndefined();
    expect(validatePhotoMeta({})).toBeUndefined();
    expect(validatePhotoMeta({ source: "scanner" })).toBeUndefined();
  });

  it("drops a bad field without losing the good ones alongside it", () => {
    const meta = validatePhotoMeta({
      source: "upload",
      takenAt: "yesterday afternoon",
      coords: { lat: -8.4157, lng: 115.3153, source: "exif" },
    });

    expect(meta?.takenAt).toBeUndefined();
    expect(meta?.coords).toEqual({ lat: -8.4157, lng: 115.3153, source: "exif" });
  });

  it("refuses a timestamp that names a month or an hour that cannot exist", () => {
    expect(validatePhotoMeta({ source: "upload", takenAt: "2026-13-05T10:00:00" })?.takenAt).toBeUndefined();
    expect(validatePhotoMeta({ source: "upload", takenAt: "2026-09-05T25:00:00" })?.takenAt).toBeUndefined();
  });

  it("accepts a timestamp without seconds", () => {
    expect(validatePhotoMeta({ source: "camera", takenAt: "2026-09-05T18:40" })?.takenAt).toBe(
      "2026-09-05T18:40",
    );
  });

  it("refuses coordinates off the globe, and the 0,0 a receiver writes with no fix", () => {
    expect(validatePhotoMeta({ source: "camera", coords: { lat: 91, lng: 0 } })?.coords).toBeUndefined();
    expect(validatePhotoMeta({ source: "camera", coords: { lat: 0, lng: 181 } })?.coords).toBeUndefined();
    expect(validatePhotoMeta({ source: "camera", coords: { lat: 0, lng: 0 } })?.coords).toBeUndefined();
    expect(
      validatePhotoMeta({ source: "camera", coords: { lat: "-8.4", lng: 115.3 } })?.coords,
    ).toBeUndefined();
  });

  it("rounds coordinates to about a metre, so the extra digits never reach a prompt", () => {
    const meta = validatePhotoMeta({
      source: "camera",
      coords: { lat: -8.415712345678, lng: 115.315312345678, source: "device" },
    });

    expect(meta?.coords).toEqual({ lat: -8.41571, lng: 115.31531, source: "device" });
  });

  it("refuses a time zone offset no place on earth uses", () => {
    expect(validatePhotoMeta({ source: "camera", timeZoneOffsetMin: 5000 })?.timeZoneOffsetMin).toBeUndefined();
    expect(validatePhotoMeta({ source: "camera", timeZoneOffsetMin: 420 })?.timeZoneOffsetMin).toBe(420);
  });
});

describe("buildPhotoMetaLine", () => {
  it("is empty when the request carried no metadata", () => {
    expect(buildPhotoMetaLine(undefined)).toBe("");
  });

  it("names the time, the part of the day, and the place", () => {
    const line = buildPhotoMetaLine(EVENING_AT_TIRTA_EMPUL);

    expect(line).toContain("18:40");
    expect(line).toContain("2026-09-05");
    expect(line).toContain("dusk");
    expect(line).toContain("-8.4157");
    expect(line).toContain("115.3153");
    expect(line).toContain("18 m");
  });

  it("says whether the visitor is standing there or picked an old photo", () => {
    expect(buildPhotoMetaLine({ source: "camera" })).toContain("standing there now");
    expect(buildPhotoMetaLine({ source: "upload" })).toContain("somewhere else by now");
  });

  it("flags a file date as the weaker source it is", () => {
    const line = buildPhotoMetaLine({
      source: "upload",
      takenAt: "2026-09-05T06:30:00",
      timeSource: "file",
    });

    expect(line).toContain("file's own date");
  });

  it("tells the model what the metadata may not be used for", () => {
    const line = buildPhotoMetaLine(EVENING_AT_TIRTA_EMPUL);

    expect(line).toContain("Do not use it to state opening hours");
    expect(line).toContain("ceremony dates");
  });
});

describe("POST /api/vision with photo metadata", () => {
  it("puts the time and place in front of the model", async () => {
    const res = await vision(
      post({
        image: TINY_JPEG_BASE64,
        context: "temple",
        lang: "en",
        photo: EVENING_AT_TIRTA_EMPUL,
      }),
    );

    expect(res.status).toBe(200);
    expect(promptText()).toContain("PHOTO METADATA");
    expect(promptText()).toContain("115.3153");
  });

  it("checks the photo as it always did when the metadata is malformed", async () => {
    const res = await vision(
      post({ image: TINY_JPEG_BASE64, context: "temple", lang: "en", photo: "17:42" }),
    );

    expect(res.status).toBe(200);
    expect(promptText()).not.toContain("PHOTO METADATA");
  });

  it("keeps the coordinates out of the log line", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    await vision(
      post({
        image: TINY_JPEG_BASE64,
        context: "temple",
        lang: "en",
        photo: EVENING_AT_TIRTA_EMPUL,
      }),
    );

    const written = JSON.stringify(log.mock.calls);
    expect(written).not.toContain("115.3153");
    expect(written).not.toContain("-8.4157");
  });
});
