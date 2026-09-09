// What a photo knows about itself, and what the browser can add.
//
// Read from the ORIGINAL File, before `prepareImage()` touches it. The canvas
// re-encode in lib/image.ts drops every EXIF segment on the floor, so anything
// wanted from the file has to be taken while the bytes are still the camera's.
//
// The parser is hand-rolled rather than a dependency: it reads five tags out of
// a format that has not changed since 1998, and a library for that would be
// more code to audit than the code it saves.

import type { PhotoCoords, PhotoMeta } from "@shared/contract";

export interface ExifData {
  /** Local wall clock, `YYYY-MM-DDTHH:MM:SS`. EXIF carries no zone. */
  takenAt?: string;
  /** Minutes east of UTC, from OffsetTimeOriginal when the camera wrote one. */
  offsetMin?: number;
  coords?: { lat: number; lng: number };
  /** EXIF orientation, 1 to 8. See applyOrientation in lib/image.ts. */
  orientation?: number;
  /** Camera make and model. Shown to the visitor; never sent to the server. */
  device?: string;
}

// Only the head of the file is read. EXIF lives in the first APP1 segment,
// which sits within a few KB of the start; a full 5 MB read to find it would
// cost the visitor a stutter for nothing.
const EXIF_SCAN_BYTES = 256 * 1024;

const TAG = {
  ORIENTATION: 0x0112,
  MAKE: 0x010f,
  MODEL: 0x0110,
  EXIF_IFD: 0x8769,
  GPS_IFD: 0x8825,
  DATE_TIME_ORIGINAL: 0x9003,
  OFFSET_TIME_ORIGINAL: 0x9011,
  GPS_LAT_REF: 0x0001,
  GPS_LAT: 0x0002,
  GPS_LNG_REF: 0x0003,
  GPS_LNG: 0x0004,
} as const;

/** Bytes per EXIF component, indexed by the format code in an IFD entry. */
const FORMAT_SIZE: Record<number, number> = {
  1: 1, // BYTE
  2: 1, // ASCII
  3: 2, // SHORT
  4: 4, // LONG
  5: 8, // RATIONAL
  7: 1, // UNDEFINED
  9: 4, // SLONG
  10: 8, // SRATIONAL
};

interface Entry {
  format: number;
  count: number;
  /** Absolute offset of the value, already resolved past the 4-byte inline slot. */
  valueAt: number;
}

type Ifd = Map<number, Entry>;

/**
 * Reads the EXIF a JPEG carries. Never throws: a PNG, a photo a messaging app
 * has stripped, or a file that is simply malformed all come back as `{}`, and
 * the check proceeds with whatever else is known.
 */
export async function readExif(file: File): Promise<ExifData> {
  try {
    const head = await file.slice(0, EXIF_SCAN_BYTES).arrayBuffer();
    return parseExif(new DataView(head));
  } catch {
    return {};
  }
}

export function parseExif(view: DataView): ExifData {
  const tiffStart = findTiffHeader(view);
  if (tiffStart === null) return {};

  // "II" little-endian (Intel) or "MM" big-endian (Motorola). Everything after
  // the header is read in whichever the file declares.
  const le = view.getUint16(tiffStart) === 0x4949;
  if (view.getUint16(tiffStart + 2, le) !== 0x002a) return {};

  const ifd0At = tiffStart + view.getUint32(tiffStart + 4, le);
  const ifd0 = readIfd(view, ifd0At, tiffStart, le);
  if (!ifd0) return {};

  const out: ExifData = {};

  const orientation = readNumber(view, ifd0.get(TAG.ORIENTATION), le);
  if (orientation && orientation >= 1 && orientation <= 8) out.orientation = orientation;

  const make = readAscii(view, ifd0.get(TAG.MAKE));
  const model = readAscii(view, ifd0.get(TAG.MODEL));
  const device = [make, model].filter(Boolean).join(" ").trim();
  if (device) out.device = device;

  const exifAt = readNumber(view, ifd0.get(TAG.EXIF_IFD), le);
  if (exifAt) {
    const exif = readIfd(view, tiffStart + exifAt, tiffStart, le);
    if (exif) {
      const taken = exifDateToIso(readAscii(view, exif.get(TAG.DATE_TIME_ORIGINAL)));
      if (taken) out.takenAt = taken;
      const offset = parseOffset(readAscii(view, exif.get(TAG.OFFSET_TIME_ORIGINAL)));
      if (offset !== null) out.offsetMin = offset;
    }
  }

  const gpsAt = readNumber(view, ifd0.get(TAG.GPS_IFD), le);
  if (gpsAt) {
    const gps = readIfd(view, tiffStart + gpsAt, tiffStart, le);
    if (gps) {
      const coords = readGpsCoords(view, gps, le);
      if (coords) out.coords = coords;
    }
  }

  return out;
}

/** Walks the JPEG marker chain to the APP1 segment that starts with "Exif\0\0". */
function findTiffHeader(view: DataView): number | null {
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null;

  let at = 2;
  while (at + 4 <= view.byteLength) {
    if (view.getUint8(at) !== 0xff) return null;
    const marker = view.getUint8(at + 1);
    // Start of scan: image data from here on, no more metadata segments.
    if (marker === 0xda) return null;
    const length = view.getUint16(at + 2);
    if (length < 2) return null;

    if (marker === 0xe1 && at + 10 <= view.byteLength) {
      const tag = String.fromCharCode(
        view.getUint8(at + 4),
        view.getUint8(at + 5),
        view.getUint8(at + 6),
        view.getUint8(at + 7),
      );
      if (tag === "Exif" && view.getUint8(at + 8) === 0) return at + 10;
    }
    at += 2 + length;
  }
  return null;
}

function readIfd(view: DataView, at: number, tiffStart: number, le: boolean): Ifd | null {
  if (at < 0 || at + 2 > view.byteLength) return null;
  const count = view.getUint16(at, le);
  const entries: Ifd = new Map();

  for (let i = 0; i < count; i += 1) {
    const entryAt = at + 2 + i * 12;
    if (entryAt + 12 > view.byteLength) break;

    const tag = view.getUint16(entryAt, le);
    const format = view.getUint16(entryAt + 2, le);
    const components = view.getUint32(entryAt + 4, le);
    const size = FORMAT_SIZE[format];
    if (!size) continue;

    // Up to four bytes live in the entry itself; anything longer is stored
    // elsewhere and the entry holds an offset from the TIFF header.
    const total = size * components;
    const valueAt = total <= 4 ? entryAt + 8 : tiffStart + view.getUint32(entryAt + 8, le);
    if (valueAt < 0 || valueAt + total > view.byteLength) continue;

    entries.set(tag, { format, count: components, valueAt });
  }
  return entries;
}

function readNumber(view: DataView, entry: Entry | undefined, le: boolean): number | undefined {
  if (!entry) return undefined;
  if (entry.format === 3) return view.getUint16(entry.valueAt, le);
  if (entry.format === 4) return view.getUint32(entry.valueAt, le);
  if (entry.format === 9) return view.getInt32(entry.valueAt, le);
  return undefined;
}

function readAscii(view: DataView, entry: Entry | undefined): string {
  if (!entry || entry.format !== 2) return "";
  let out = "";
  for (let i = 0; i < entry.count; i += 1) {
    const code = view.getUint8(entry.valueAt + i);
    if (code === 0) break;
    out += String.fromCharCode(code);
  }
  return out.trim();
}

/** One RATIONAL: a numerator over a denominator, both unsigned 32-bit. */
function readRational(view: DataView, at: number, le: boolean): number {
  const denominator = view.getUint32(at + 4, le);
  if (denominator === 0) return 0;
  return view.getUint32(at, le) / denominator;
}

function readGpsCoords(view: DataView, gps: Ifd, le: boolean): { lat: number; lng: number } | null {
  const lat = readDms(view, gps.get(TAG.GPS_LAT), le);
  const lng = readDms(view, gps.get(TAG.GPS_LNG), le);
  if (lat === null || lng === null) return null;

  const latRef = readAscii(view, gps.get(TAG.GPS_LAT_REF)).toUpperCase();
  const lngRef = readAscii(view, gps.get(TAG.GPS_LNG_REF)).toUpperCase();

  const signedLat = latRef === "S" ? -lat : lat;
  const signedLng = lngRef === "W" ? -lng : lng;

  if (!isFinite(signedLat) || !isFinite(signedLng)) return null;
  if (Math.abs(signedLat) > 90 || Math.abs(signedLng) > 180) return null;
  // A camera that had no fix writes zeroes rather than omitting the tag. Null
  // Island is in the Gulf of Guinea, so treating it as "no location" costs
  // nothing and keeps a meaningless 0,0 out of the prompt.
  if (signedLat === 0 && signedLng === 0) return null;

  return { lat: signedLat, lng: signedLng };
}

/** Degrees, minutes, seconds - three RATIONALs - collapsed to decimal degrees. */
function readDms(view: DataView, entry: Entry | undefined, le: boolean): number | null {
  if (!entry || entry.format !== 5 || entry.count < 3) return null;
  const degrees = readRational(view, entry.valueAt, le);
  const minutes = readRational(view, entry.valueAt + 8, le);
  const seconds = readRational(view, entry.valueAt + 16, le);
  return degrees + minutes / 60 + seconds / 3600;
}

/** `2026:09:05 17:42:11` is EXIF's format, and nothing else's. */
export function exifDateToIso(raw: string): string | undefined {
  const match = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(raw);
  if (!match) return undefined;
  const [, year, month, day, hour, minute, second] = match;
  if (Number(month) < 1 || Number(month) > 12 || Number(day) < 1 || Number(day) > 31) {
    return undefined;
  }
  if (Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59) return undefined;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

/** `+07:00` as minutes east of UTC. */
function parseOffset(raw: string): number | null {
  const match = /^([+-])(\d{2}):?(\d{2})$/.exec(raw.trim());
  if (!match) return null;
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  if (minutes > 14 * 60) return null;
  return match[1] === "-" ? -minutes : minutes;
}

/** A Date as local wall clock, the same shape EXIF writes. */
export function localWallClock(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

/**
 * The time and place of a photo, weakest source last.
 *
 * A camera shot has no EXIF at all, so it falls to the clock - which for a
 * photo taken one second ago is the most accurate source there is. An uploaded
 * file with its EXIF stripped falls to `lastModified`, which is when the file
 * reached this device rather than when the shutter fired; the `timeSource`
 * field says which of the three it was, so the prompt never claims more
 * precision than it has.
 */
export function buildPhotoMeta(
  file: File,
  source: PhotoMeta["source"],
  exif: ExifData,
): PhotoMeta {
  const now = new Date();
  const meta: PhotoMeta = {
    source,
    timeZoneOffsetMin: exif.offsetMin ?? -now.getTimezoneOffset(),
  };

  if (exif.takenAt) {
    meta.takenAt = exif.takenAt;
    meta.timeSource = "exif";
  } else if (source === "upload" && file.lastModified > 0) {
    meta.takenAt = localWallClock(new Date(file.lastModified));
    meta.timeSource = "file";
  } else {
    meta.takenAt = localWallClock(now);
    meta.timeSource = "clock";
  }

  if (exif.coords) {
    meta.coords = { ...exif.coords, source: "exif" };
  }

  return meta;
}

/** How long to wait for a fix before giving up and checking without one. */
const GEOLOCATION_TIMEOUT_MS = 12_000;

/**
 * Asks the browser where the visitor is. Resolves to null on refusal, on a
 * device without a fix, and on a page served over plain HTTP - every one of
 * which is a normal thing for a visitor's phone to do, none of which should
 * stop them checking a photo.
 */
export function requestDeviceCoords(): Promise<PhotoCoords | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracyM: Math.round(position.coords.accuracy),
          source: "device",
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 60_000 },
    );
  });
}
