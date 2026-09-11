// Derives the favicon set in `public/` from `public/sasana-logo.png`, so the
// logo is drawn once and every size the browser asks for is a resize of it
// rather than a second drawing that can drift. Run `npm run icons` after
// changing the logo, then rebuild the export.
//
// Pure Node — decode, resize, encode and the ICO container are written out
// here because the frontend has no image toolchain and a favicon is not worth
// a dependency. Handles only what the source file is: 8-bit palette PNG,
// non-interlaced. It throws rather than guessing if that stops being true.
import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC =
  process.argv[2] ?? path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const SRC = path.join(PUBLIC, "sasana-logo.png");

/* ---------- decode (palette PNG, 8-bit, non-interlaced) ---------- */

function decodePNG(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a png");
  let o = 8;
  let ihdr, plte, trns;
  const idat = [];
  while (o < buf.length) {
    const len = buf.readUInt32BE(o);
    const type = buf.toString("ascii", o + 4, o + 8);
    const data = buf.subarray(o + 8, o + 8 + len);
    if (type === "IHDR") ihdr = data;
    else if (type === "PLTE") plte = data;
    else if (type === "tRNS") trns = data;
    else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    o += 12 + len;
  }
  const w = ihdr.readUInt32BE(0);
  const h = ihdr.readUInt32BE(4);
  const depth = ihdr[8];
  const color = ihdr[9];
  const interlace = ihdr[12];
  if (depth !== 8 || color !== 3 || interlace !== 0) {
    throw new Error(`unsupported png: depth=${depth} color=${color} interlace=${interlace}`);
  }

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = 1;
  const stride = w * bpp;
  const idx = Buffer.alloc(w * h);
  let prev = Buffer.alloc(stride);
  let p = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[p++];
    const line = Buffer.from(raw.subarray(p, p + stride));
    p += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? line[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      switch (filter) {
        case 0: break;
        case 1: line[x] = (line[x] + a) & 0xff; break;
        case 2: line[x] = (line[x] + b) & 0xff; break;
        case 3: line[x] = (line[x] + ((a + b) >> 1)) & 0xff; break;
        case 4: {
          const pp = a + b - c;
          const pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
          const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
          line[x] = (line[x] + pr) & 0xff;
          break;
        }
        default: throw new Error("bad filter " + filter);
      }
    }
    line.copy(idx, y * stride);
    prev = line;
  }

  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const pi = idx[i];
    rgba[i * 4] = plte[pi * 3];
    rgba[i * 4 + 1] = plte[pi * 3 + 1];
    rgba[i * 4 + 2] = plte[pi * 3 + 2];
    rgba[i * 4 + 3] = trns && pi < trns.length ? trns[pi] : 255;
  }
  return { w, h, rgba };
}

/* ---------- resize (area average, premultiplied) ---------- */

function resize(src, sw, sh, dw, dh) {
  const out = Buffer.alloc(dw * dh * 4);
  const xr = sw / dw, yr = sh / dh;
  for (let y = 0; y < dh; y++) {
    const y0 = Math.floor(y * yr), y1 = Math.max(y0 + 1, Math.ceil((y + 1) * yr));
    for (let x = 0; x < dw; x++) {
      const x0 = Math.floor(x * xr), x1 = Math.max(x0 + 1, Math.ceil((x + 1) * xr));
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let sy = y0; sy < Math.min(y1, sh); sy++) {
        for (let sx = x0; sx < Math.min(x1, sw); sx++) {
          const i = (sy * sw + sx) * 4;
          const al = src[i + 3] / 255;
          r += src[i] * al; g += src[i + 1] * al; b += src[i + 2] * al; a += src[i + 3];
          n++;
        }
      }
      const o = (y * dw + x) * 4;
      const am = a / n;
      const al = am / 255;
      out[o] = al ? Math.round(r / n / al) : 0;
      out[o + 1] = al ? Math.round(g / n / al) : 0;
      out[o + 2] = al ? Math.round(b / n / al) : 0;
      out[o + 3] = Math.round(am);
    }
  }
  return out;
}

/* ---------- composite onto an opaque canvas ---------- */

function onCanvas(src, sw, sh, size, bg, inset) {
  const out = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    out[i * 4] = bg[0]; out[i * 4 + 1] = bg[1]; out[i * 4 + 2] = bg[2]; out[i * 4 + 3] = 255;
  }
  const inner = Math.round(size * inset);
  const off = Math.round((size - inner) / 2);
  const small = resize(src, sw, sh, inner, inner);
  for (let y = 0; y < inner; y++) {
    for (let x = 0; x < inner; x++) {
      const s = (y * inner + x) * 4;
      const d = ((y + off) * size + (x + off)) * 4;
      const a = small[s + 3] / 255;
      out[d] = Math.round(small[s] * a + out[d] * (1 - a));
      out[d + 1] = Math.round(small[s + 1] * a + out[d + 1] * (1 - a));
      out[d + 2] = Math.round(small[s + 2] * a + out[d + 2] * (1 - a));
    }
  }
  return out;
}

/* ---------- encode ---------- */

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32 ? zlib.crc32(body) >>> 0 : crc32(body) >>> 0);
  return Buffer.concat([len, body, crc]);
}

let TABLE;
function crc32(buf) {
  if (!TABLE) {
    TABLE = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      TABLE[n] = c;
    }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function encodePNG(rgba, w, h) {
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function encodeICO(images) {
  const head = Buffer.alloc(6 + images.length * 16);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(images.length, 4);
  let offset = head.length;
  images.forEach((img, i) => {
    const e = 6 + i * 16;
    head[e] = img.size >= 256 ? 0 : img.size;
    head[e + 1] = img.size >= 256 ? 0 : img.size;
    head[e + 2] = 0;
    head[e + 3] = 0;
    head.writeUInt16LE(1, e + 4);
    head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(img.data.length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += img.data.length;
  });
  return Buffer.concat([head, ...images.map((i) => i.data)]);
}

/* ---------- run ---------- */

const { w, h, rgba } = decodePNG(fs.readFileSync(SRC));
console.log(`source ${w}x${h}`);

const ico = encodeICO(
  [16, 32, 48].map((size) => ({ size, data: encodePNG(resize(rgba, w, h, size, size), size, size) })),
);
fs.writeFileSync(path.join(PUBLIC, "favicon.ico"), ico);
console.log("favicon.ico", ico.length, "bytes");

// iOS paints an opaque square behind the icon and clips it to a rounded rect,
// so the mark sits on the --color-bg cream with room for the clip to eat.
const apple = encodePNG(onCanvas(rgba, w, h, 180, [0xf6, 0xf1, 0xe9], 0.72), 180, 180);
fs.writeFileSync(path.join(PUBLIC, "apple-icon.png"), apple);
console.log("apple-icon.png", apple.length, "bytes");
