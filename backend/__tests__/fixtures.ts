// Smallest valid image payloads, used to exercise magic-byte detection without
// checking binary files into the repo.

/** 1x1 white JPEG. Starts FF D8 FF. */
export const TINY_JPEG_BASE64 =
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a" +
  "HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAA" +
  "AAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==";

/** 1x1 transparent PNG. Starts 89 50 4E 47. */
export const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

/** 1x1 GIF. Starts 47 49 46 38 - neither JPEG nor PNG. */
export const TINY_GIF_BASE64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/** Valid base64 whose bytes are not any known image format. */
export const NOT_AN_IMAGE_BASE64 = Buffer.from("this is plain text, not an image").toString("base64");

/** A JPEG header followed by enough padding to exceed the 5 MB cap. */
export function oversizedJpegBase64(): string {
  const buf = Buffer.alloc(5 * 1024 * 1024 + 1024);
  buf[0] = 0xff;
  buf[1] = 0xd8;
  buf[2] = 0xff;
  return buf.toString("base64");
}
