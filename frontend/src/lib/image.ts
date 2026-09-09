// Client-side image validation + downscale before upload (ui-spec §5.10, TS §8.2).

import { buildPhotoMeta, readExif } from "@/lib/photo-meta";
import type { PhotoMeta } from "@shared/contract";

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_EDGE = 1024;
const ACCEPTED = ["image/jpeg", "image/png"];
// Always re-encode to JPEG (tech-spec §8.2). A photo kept as PNG stays roughly
// 15x larger, which was enough to push /api/vision past its 9s timeout.
const OUTPUT_TYPE = "image/jpeg";
const OUTPUT_QUALITY = 0.85;

export type ImageError = "type" | "size";

export interface PreparedImage {
  base64: string;
  mimeType: string;
  previewUrl: string;
  name: string;
  /** What the file and the device knew about this photo. */
  meta: PhotoMeta;
  /** Camera make and model, when the file carried one. Shown, never sent. */
  device?: string;
}

/**
 * A photo, ready to check: pixels downscaled, metadata lifted off the original.
 *
 * The order matters. EXIF has to be read from the File itself, because the
 * canvas re-encode below writes a fresh JPEG with no metadata segment at all.
 */
export async function preparePhoto(
  file: File,
  source: PhotoMeta["source"],
): Promise<PreparedImage> {
  const exif = await readExif(file);
  const prepared = await prepareImage(file);
  return { ...prepared, meta: buildPhotoMeta(file, source, exif), device: exif.device };
}

export function validateImage(file: File): ImageError | null {
  if (!ACCEPTED.includes(file.type)) return "type";
  if (file.size > MAX_BYTES) return "size";
  return null;
}

type Pixels = Omit<PreparedImage, "meta" | "device">;

// Rotation is deliberately not applied here. Every browser since 2020 honours
// EXIF Orientation when it decodes an image, so `img.width` and `drawImage`
// already describe the upright photo; transforming it again by hand would turn
// a correct portrait shot on its side. Verified against a hand-built JPEG
// carrying Orientation=6: a 2x1 image decodes as 1x2, already rotated.
async function prepareImage(file: File): Promise<Pixels> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = dataUrl;
  });

  // Re-encode unconditionally, not only when the image is oversized. A photo
  // already under MAX_EDGE used to be forwarded as the untouched original file,
  // so a 3 MB PNG went to the model verbatim.
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    // Canvas unavailable: send the original rather than nothing.
    return {
      base64: dataUrl.split(",")[1],
      mimeType: file.type,
      previewUrl: dataUrl,
      name: file.name,
    };
  }

  // JPEG has no alpha channel; without this fill, transparent PNG regions
  // would come out black and could be read as a dark, unusable photo.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const out = canvas.toDataURL(OUTPUT_TYPE, OUTPUT_QUALITY);

  return {
    base64: out.split(",")[1],
    mimeType: OUTPUT_TYPE,
    previewUrl: out,
    name: file.name,
  };
}
