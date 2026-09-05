import { imageTooLarge, invalidInput, unsupportedMedia } from "@/lib/errors";
import type { Lang } from "@shared/contract";
import type { ChatMessage, PhotoCoords, PhotoMeta, SiteContext, VisionContext } from "@shared/contract";

export const MESSAGE_MAX_CHARS = 1000;
export const HISTORY_LIMIT = 6;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
// Base64 inflates by 4/3, plus slack for the data-URL prefix and padding. Used
// to reject an oversized payload before spending memory decoding it.
const MAX_IMAGE_BASE64_CHARS = Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 1024;

const DEL_CHAR_CODE = 127;
const FIRST_PRINTABLE_CHAR_CODE = 32;

function stripControlChars(input: string): string {
  let out = "";
  for (const ch of input) {
    const code = ch.codePointAt(0) ?? 0;
    out += code < FIRST_PRINTABLE_CHAR_CODE || code === DEL_CHAR_CODE ? " " : ch;
  }
  return out;
}

// Strips markup and control characters before the text reaches a prompt
// (backend-spec §8.2). Not a security boundary on its own: the "answer ONLY
// from RULES" instruction plus the server grounding net bound what a crafted
// question can achieve.
export function sanitizeText(input: string, max = MESSAGE_MAX_CHARS): string {
  return stripControlChars(input.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export const SITE_NAME_MAX_CHARS = 120;
export const SITE_ID_MAX_CHARS = 64;
export const SITE_RULE_IDS_LIMIT = 32;

// A malformed `site` is dropped rather than rejected, matching how `context` is
// handled: losing the Site only costs the answer its specificity, and failing
// a visitor's photo check over a bad optional field helps nobody. The values
// that survive are still only *names* - the rule text always comes from the
// server's own knowledge base (see SiteContext in shared/contract.ts).
export function validateSiteContext(raw: unknown): SiteContext | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const s = raw as Record<string, unknown>;

  if (typeof s.id !== "string" || typeof s.name !== "string") return undefined;
  const id = sanitizeText(s.id, SITE_ID_MAX_CHARS);
  const name = sanitizeText(s.name, SITE_NAME_MAX_CHARS);
  if (!id || !name) return undefined;

  if (!Array.isArray(s.ruleIds)) return undefined;
  const ruleIds = [
    ...new Set(
      s.ruleIds
        .filter((value): value is string => typeof value === "string")
        .map((value) => sanitizeText(value, SITE_ID_MAX_CHARS))
        .filter(Boolean),
    ),
  ].slice(0, SITE_RULE_IDS_LIMIT);

  // A Site that names no rules carries no information the prompt can use, so it
  // is the same as having no Site at all.
  if (ruleIds.length === 0) return undefined;

  return { id, name, ruleIds };
}

// Local wall clock as `buildPhotoMeta` writes it. Seconds optional, no zone:
// EXIF does not record one, so neither does the field.
const PHOTO_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
// Kiritimati is UTC+14 and Baker Island UTC-12; anything outside that is noise.
const MAX_TZ_OFFSET_MIN = 14 * 60;
// Five decimal places is about a metre. Beyond that the digits describe the
// receiver's noise rather than the visitor, and the prompt reads no better for
// them.
const COORD_DECIMALS = 5;
const MAX_ACCURACY_M = 100_000;

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function validatePhotoCoords(raw: unknown): PhotoCoords | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const c = raw as Record<string, unknown>;

  const lat = typeof c.lat === "number" ? c.lat : NaN;
  const lng = typeof c.lng === "number" ? c.lng : NaN;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return undefined;
  // 0,0 is what a receiver with no fix writes, not a place anyone photographs.
  if (lat === 0 && lng === 0) return undefined;

  const coords: PhotoCoords = {
    lat: roundTo(lat, COORD_DECIMALS),
    lng: roundTo(lng, COORD_DECIMALS),
    source: c.source === "exif" ? "exif" : "device",
  };

  if (typeof c.accuracyM === "number" && Number.isFinite(c.accuracyM)) {
    const accuracyM = Math.round(Math.abs(c.accuracyM));
    if (accuracyM > 0 && accuracyM <= MAX_ACCURACY_M) coords.accuracyM = accuracyM;
  }
  return coords;
}

// Dropped rather than rejected, exactly like `site`: metadata makes an answer
// sharper, and failing a visitor's photo check over a malformed optional field
// helps nobody. Every field is filtered independently, so a bad timestamp does
// not cost the request its coordinates.
export function validatePhotoMeta(raw: unknown): PhotoMeta | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const p = raw as Record<string, unknown>;
  if (p.source !== "camera" && p.source !== "upload") return undefined;

  const meta: PhotoMeta = { source: p.source };

  if (typeof p.takenAt === "string" && PHOTO_TIME.test(p.takenAt.trim())) {
    const takenAt = p.takenAt.trim();
    // Rejects 2026-13-45T99:99 - the pattern above only counts digits.
    if (!Number.isNaN(Date.parse(`${takenAt.slice(0, 19).padEnd(19, ":00")}Z`))) {
      meta.takenAt = takenAt;
      if (p.timeSource === "exif" || p.timeSource === "file" || p.timeSource === "clock") {
        meta.timeSource = p.timeSource;
      }
    }
  }

  if (
    typeof p.timeZoneOffsetMin === "number" &&
    Number.isFinite(p.timeZoneOffsetMin) &&
    Math.abs(p.timeZoneOffsetMin) <= MAX_TZ_OFFSET_MIN
  ) {
    meta.timeZoneOffsetMin = Math.round(p.timeZoneOffsetMin);
  }

  const coords = validatePhotoCoords(p.coords);
  if (coords) meta.coords = coords;

  return meta;
}

export interface ValidatedChatRequest {
  message: string;
  lang: Lang;
  history: ChatMessage[];
  site?: SiteContext;
}

export function validateChatRequest(body: Record<string, unknown>): ValidatedChatRequest {
  if (typeof body.message !== "string") {
    throw invalidInput("`message` must be a string");
  }
  if (body.message.trim().length > MESSAGE_MAX_CHARS) {
    throw invalidInput(`\`message\` must be at most ${MESSAGE_MAX_CHARS} characters`);
  }
  const message = sanitizeText(body.message);
  if (message.length < 1) {
    throw invalidInput("`message` must not be empty");
  }

  return {
    message,
    lang: body.lang === "id" ? "id" : "en",
    history: normalizeHistory(body.history),
    site: validateSiteContext(body.site),
  };
}

export interface ValidatedVisionRequest {
  image: string;
  context: VisionContext;
  lang: Lang;
  site?: SiteContext;
  photo?: PhotoMeta;
}

export function validateVisionRequest(body: Record<string, unknown>): ValidatedVisionRequest {
  if (typeof body.image !== "string" || body.image.trim() === "") {
    throw invalidInput("`image` must be a non-empty base64 string");
  }
  return {
    image: body.image,
    // Anything unrecognised becomes "general" rather than an error: a wrong
    // context only softens the prompt, it does not make the answer unsafe.
    context: body.context === "temple" ? "temple" : "general",
    lang: body.lang === "id" ? "id" : "en",
    site: validateSiteContext(body.site),
    photo: validatePhotoMeta(body.photo),
  };
}

export interface DecodedImage {
  /** Clean base64, no data-URL prefix - what the SDK wants. */
  data: string;
  mimeType: "image/jpeg" | "image/png";
  bytes: number;
}

// The client's declared mimeType is never trusted; the format is read from the
// file's own magic bytes (backend-spec §2.1). A caller that is not our UI can
// claim anything.
export function decodeAndValidateImage(input: string): DecodedImage {
  const cleaned = input.replace(/^data:image\/[a-zA-Z+]+;base64,/, "").trim();

  if (cleaned.length > MAX_IMAGE_BASE64_CHARS) throw imageTooLarge();
  if (!/^[A-Za-z0-9+/\r\n]+={0,2}$/.test(cleaned)) {
    throw invalidInput("`image` is not valid base64");
  }

  const buffer = Buffer.from(cleaned, "base64");
  if (buffer.length === 0) throw invalidInput("`image` decoded to zero bytes");

  const mimeType = detectImageType(buffer);
  if (!mimeType) throw unsupportedMedia();
  if (buffer.length > MAX_IMAGE_BYTES) throw imageTooLarge();

  return { data: cleaned.replace(/[\r\n]/g, ""), mimeType, bytes: buffer.length };
}

function detectImageType(buffer: Buffer): "image/jpeg" | "image/png" | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (buffer.length >= 8 && PNG_SIGNATURE.every((byte, i) => buffer[i] === byte)) {
    return "image/png";
  }
  return null;
}

// Invalid entries are dropped rather than rejected: a malformed history item is
// the client's bug, and failing the whole question over it helps nobody.
function normalizeHistory(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is { role: string; content: string } => {
      const m = item as { role?: unknown; content?: unknown };
      return (
        (m?.role === "user" || m?.role === "assistant") &&
        typeof m?.content === "string" &&
        m.content.trim().length > 0
      );
    })
    .map((m) => ({ role: m.role as ChatMessage["role"], content: sanitizeText(m.content) }))
    .filter((m) => m.content.length > 0)
    .slice(-HISTORY_LIMIT);
}
