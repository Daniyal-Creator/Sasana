// Client-side image validation + downscale before upload (ui-spec §5.10, TS §8.2).

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
}

export function validateImage(file: File): ImageError | null {
  if (!ACCEPTED.includes(file.type)) return "type";
  if (file.size > MAX_BYTES) return "size";
  return null;
}

export async function prepareImage(file: File): Promise<PreparedImage> {
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
