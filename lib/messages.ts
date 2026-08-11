import type { ErrorCode } from "@/lib/errors";

// The API's own safe, localized error copy (backend-spec §6.3). The UI renders
// its own per-feature message from lib/i18n; these are what curl and any other
// caller see, and they never contain internals.

export const ERROR_MESSAGES: Record<ErrorCode, { en: string; id: string }> = {
  invalid_json: {
    en: "We couldn't read that request. Please try again.",
    id: "Kami tidak dapat membaca permintaan itu. Silakan coba lagi.",
  },
  invalid_input: {
    en: "That input doesn't look right. Please check and try again.",
    id: "Masukan tersebut tampak tidak sesuai. Mohon periksa dan coba lagi.",
  },
  unsupported_media: {
    en: "Please use a JPG or PNG image.",
    id: "Silakan gunakan gambar JPG atau PNG.",
  },
  image_too_large: {
    en: "The photo is larger than 5 MB. Please use a smaller image.",
    id: "Foto lebih besar dari 5 MB. Silakan gunakan gambar yang lebih kecil.",
  },
  rate_limited: {
    en: "We're a little busy right now. Please try again in a moment.",
    id: "Kami sedang sibuk saat ini. Silakan coba lagi sebentar.",
  },
  timeout: {
    en: "That took too long. Please try again.",
    id: "Prosesnya terlalu lama. Silakan coba lagi.",
  },
  ai_error: {
    en: "Something went wrong. Please try again.",
    id: "Terjadi masalah. Silakan coba lagi.",
  },
  kb_error: {
    en: "Something went wrong on our side. Please try again.",
    id: "Terjadi masalah di sisi kami. Silakan coba lagi.",
  },
  internal: {
    en: "Something went wrong. Please try again.",
    id: "Terjadi masalah. Silakan coba lagi.",
  },
};
