import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirrors the tsconfig "@/*" path alias (project root).
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    env: {
      // lib/env.ts validates at import time; the Gemini SDK is mocked in tests,
      // so this key is never used to reach the network.
      GEMINI_API_KEY: "test-key-not-real",
      GEMINI_RETRY_BACKOFF_MS: "0",
    },
  },
});
