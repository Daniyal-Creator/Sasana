import { describe, expect, it } from "vitest";
import {
  buildPhotoMeta,
  exifDateToIso,
  localWallClock,
  parseExif,
  type ExifData,
} from "@/lib/photo-meta";

// A JPEG with EXIF, assembled byte by byte. The alternative is a base64 blob
// nobody can read or adjust, and half of what is being tested here is whether
// the parser walks offsets correctly - which needs fixtures whose offsets can
// be varied on purpose.

interface Entry {
  tag: number;
  format: number;
  count: number;
  /** Payload bytes. Four or fewer live inside the entry; more go in the data area. */
  bytes: number[];
}

function u16(value: number, le: boolean): number[] {
  return le ? [value & 0xff, (value >> 8) & 0xff] : [(value >> 8) & 0xff, value & 0xff];
}

function u32(value: number, le: boolean): number[] {
  const bytes = [value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >>> 24) & 0xff];
  return le ? bytes : bytes.reverse();
}

function shortEntry(tag: number, value: number, le: boolean): Entry {
  return { tag, format: 3, count: 1, bytes: u16(value, le) };
}

function longEntry(tag: number, value: number, le: boolean): Entry {
  return { tag, format: 4, count: 1, bytes: u32(value, le) };
}

function asciiEntry(tag: number, text: string): Entry {
  const bytes = [...text].map((c) => c.charCodeAt(0));
  bytes.push(0);
  return { tag, format: 2, count: bytes.length, bytes };
}

/** Degrees, minutes, seconds as the three RATIONALs EXIF stores them in. */
function dmsEntry(tag: number, dms: [number, number, number], le: boolean): Entry {
  const bytes: number[] = [];
  for (const part of dms) {
    // A denominator of 100 keeps two decimals of seconds without a float.
    bytes.push(...u32(Math.round(part * 100), le), ...u32(100, le));
  }
  return { tag, format: 5, count: 3, bytes };
}

function ifdSize(entries: Entry[]): number {
  return 2 + entries.length * 12 + 4;
}

interface ExifFixture {
  le?: boolean;
  orientation?: number;
  make?: string;
  model?: string;
  dateTime?: string;
  offsetTime?: string;
  lat?: [number, number, number];
  latRef?: string;
  lng?: [number, number, number];
  lngRef?: string;
}

function buildJpegWithExif(fixture: ExifFixture): DataView {
  const le = fixture.le ?? true;

  const exifEntries: Entry[] = [];
  if (fixture.dateTime) exifEntries.push(asciiEntry(0x9003, fixture.dateTime));
  if (fixture.offsetTime) exifEntries.push(asciiEntry(0x9011, fixture.offsetTime));

  const gpsEntries: Entry[] = [];
  if (fixture.lat) {
    gpsEntries.push(asciiEntry(0x0001, fixture.latRef ?? "N"));
    gpsEntries.push(dmsEntry(0x0002, fixture.lat, le));
  }
  if (fixture.lng) {
    gpsEntries.push(asciiEntry(0x0003, fixture.lngRef ?? "E"));
    gpsEntries.push(dmsEntry(0x0004, fixture.lng, le));
  }

  const ifd0: Entry[] = [];
  if (fixture.orientation) ifd0.push(shortEntry(0x0112, fixture.orientation, le));
  if (fixture.make) ifd0.push(asciiEntry(0x010f, fixture.make));
  if (fixture.model) ifd0.push(asciiEntry(0x0110, fixture.model));

  // Offsets are relative to the TIFF header, so the whole layout is fixed
  // before a single byte is written. IFD0 grows by one entry for each sub-IFD
  // it has to point at.
  const pointers = (exifEntries.length ? 1 : 0) + (gpsEntries.length ? 1 : 0);
  const exifAt = 8 + 2 + (ifd0.length + pointers) * 12 + 4;
  const gpsAt = exifAt + (exifEntries.length ? ifdSize(exifEntries) : 0);
  const dataAt = gpsAt + (gpsEntries.length ? ifdSize(gpsEntries) : 0);

  if (exifEntries.length) ifd0.push(longEntry(0x8769, exifAt, le));
  if (gpsEntries.length) ifd0.push(longEntry(0x8825, gpsAt, le));

  const data: number[] = [];

  function writeIfd(entries: Entry[]): number[] {
    const out: number[] = [...u16(entries.length, le)];
    for (const entry of entries) {
      out.push(...u16(entry.tag, le), ...u16(entry.format, le), ...u32(entry.count, le));
      if (entry.bytes.length <= 4) {
        out.push(...entry.bytes, ...new Array(4 - entry.bytes.length).fill(0));
      } else {
        out.push(...u32(dataAt + data.length, le));
        data.push(...entry.bytes);
        if (data.length % 2 === 1) data.push(0);
      }
    }
    out.push(...u32(0, le));
    return out;
  }

  const body = [
    ...writeIfd(ifd0),
    ...(exifEntries.length ? writeIfd(exifEntries) : []),
    ...(gpsEntries.length ? writeIfd(gpsEntries) : []),
  ];

  const tiff = [
    ...(le ? [0x49, 0x49] : [0x4d, 0x4d]),
    ...u16(0x002a, le),
    ...u32(8, le),
    ...body,
    ...data,
  ];

  const app1Body = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00, ...tiff];
  const segmentLength = app1Body.length + 2;
  const jpeg = [
    0xff,
    0xd8, // SOI
    0xff,
    0xe1, // APP1
    (segmentLength >> 8) & 0xff,
    segmentLength & 0xff,
    ...app1Body,
    0xff,
    0xd9, // EOI
  ];

  return new DataView(new Uint8Array(jpeg).buffer);
}

function parse(fixture: ExifFixture): ExifData {
  return parseExif(buildJpegWithExif(fixture));
}

describe("parseExif", () => {
  it("reads the shutter time, the camera, and the orientation", () => {
    const exif = parse({
      orientation: 6,
      make: "Google",
      model: "Pixel 8",
      dateTime: "2026:09:05 17:42:11",
    });

    expect(exif.takenAt).toBe("2026-09-05T17:42:11");
    expect(exif.device).toBe("Google Pixel 8");
    expect(exif.orientation).toBe(6);
  });

  it("reads big-endian files, which is what most cameras write", () => {
    const exif = parse({ le: false, orientation: 3, dateTime: "2026:01:02 08:09:10" });

    expect(exif.orientation).toBe(3);
    expect(exif.takenAt).toBe("2026-01-02T08:09:10");
  });

  it("turns GPS degrees, minutes and seconds into decimal degrees", () => {
    // Pura Tirta Empul, roughly: 8 25' 14.4" S, 115 18' 54" E.
    const exif = parse({
      lat: [8, 25, 14.4],
      latRef: "S",
      lng: [115, 18, 54],
      lngRef: "E",
    });

    expect(exif.coords?.lat).toBeCloseTo(-8.4207, 3);
    expect(exif.coords?.lng).toBeCloseTo(115.315, 3);
  });

  it("reads the recorded UTC offset when the camera wrote one", () => {
    expect(parse({ dateTime: "2026:09:05 17:42:11", offsetTime: "+08:00" }).offsetMin).toBe(480);
    expect(parse({ dateTime: "2026:09:05 17:42:11", offsetTime: "-03:30" }).offsetMin).toBe(-210);
  });

  it("treats a zeroed GPS block as no location at all", () => {
    const exif = parse({ lat: [0, 0, 0], latRef: "N", lng: [0, 0, 0], lngRef: "E" });
    expect(exif.coords).toBeUndefined();
  });

  it("returns nothing for a file that carries no EXIF", () => {
    const bare = new DataView(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]).buffer);
    expect(parseExif(bare)).toEqual({});
  });

  it("returns nothing for something that is not a JPEG", () => {
    const png = new DataView(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).buffer);
    expect(parseExif(png)).toEqual({});
  });

  it("does not throw on a truncated file", () => {
    const full = buildJpegWithExif({ orientation: 6, dateTime: "2026:09:05 17:42:11" });
    const cut = new DataView(full.buffer.slice(0, 20));
    expect(() => parseExif(cut)).not.toThrow();
  });
});

describe("exifDateToIso", () => {
  it("rewrites EXIF's own date format", () => {
    expect(exifDateToIso("2026:09:05 17:42:11")).toBe("2026-09-05T17:42:11");
  });

  it("refuses a date that cannot exist", () => {
    expect(exifDateToIso("2026:13:05 17:42:11")).toBeUndefined();
    expect(exifDateToIso("2026:09:05 25:42:11")).toBeUndefined();
    expect(exifDateToIso("")).toBeUndefined();
  });
});

describe("localWallClock", () => {
  it("writes the same shape EXIF does, in local time", () => {
    expect(localWallClock(new Date(2026, 8, 5, 7, 4, 9))).toBe("2026-09-05T07:04:09");
  });
});

describe("buildPhotoMeta", () => {
  const file = (lastModified: number) => ({ lastModified }) as File;

  it("prefers the shutter time the camera recorded", () => {
    const meta = buildPhotoMeta(file(Date.now()), "upload", {
      takenAt: "2026-09-05T17:42:11",
      offsetMin: 480,
    });

    expect(meta.takenAt).toBe("2026-09-05T17:42:11");
    expect(meta.timeSource).toBe("exif");
    expect(meta.timeZoneOffsetMin).toBe(480);
  });

  it("falls back to the file date for an upload whose EXIF was stripped", () => {
    const meta = buildPhotoMeta(file(new Date(2026, 8, 5, 6, 30, 0).getTime()), "upload", {});

    expect(meta.takenAt).toBe("2026-09-05T06:30:00");
    expect(meta.timeSource).toBe("file");
  });

  it("uses the clock for a camera shot, which has no EXIF and needs none", () => {
    const meta = buildPhotoMeta(file(0), "camera", {});

    expect(meta.timeSource).toBe("clock");
    expect(meta.source).toBe("camera");
    expect(meta.takenAt).toBe(localWallClock(new Date(meta.takenAt!)));
  });

  it("marks EXIF coordinates as coming from the file", () => {
    const meta = buildPhotoMeta(file(0), "upload", { coords: { lat: -8.42, lng: 115.31 } });

    expect(meta.coords).toEqual({ lat: -8.42, lng: 115.31, source: "exif" });
  });

  it("carries no coordinates when the photo had none", () => {
    expect(buildPhotoMeta(file(0), "camera", {}).coords).toBeUndefined();
  });
});
