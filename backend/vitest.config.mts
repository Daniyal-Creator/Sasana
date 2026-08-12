import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirrors the tsconfig path aliases.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@shared": fileURLToPath(new URL("../shared", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    env: {
      // src/lib/env.ts validates at import time; the Gemini SDK is mocked in
      // tests, so this key is never used to reach the network.
      GEMINI_API_KEY: "test-key-not-real",
      GEMINI_RETRY_BACKOFF_MS: "0",
      // Pinned so the timeout tests do not depend on the production defaults.
      // Both advance fake timers by 10s, which has to overshoot these.
      GEMINI_VISION_TIMEOUT_MS: "5000",
      GEMINI_CHAT_TIMEOUT_MS: "5000",
    },
  },
});
