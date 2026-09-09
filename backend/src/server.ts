// The Node entry point: the same app as a long-lived process.
//
// This is what `npm run dev`, `npm run start` and the development container
// run. Vercel runs `src/index.ts` instead, which only re-exports the app
// (ADR-0018).

import { serve } from "@hono/node-server";

import app, { ALLOWED_ORIGINS } from "@/app";
import { logInfo } from "@/lib/logger";

const PORT = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port: PORT }, (info) => {
  logInfo({ route: "server", event: "listening", port: info.port, origins: ALLOWED_ORIGINS });
});
