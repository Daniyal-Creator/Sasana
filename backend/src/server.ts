// The Node entry point: the same app as a long-lived process.
//
// This is what `npm run dev`, `npm run start` and the development container
// run. The other entry, `src/index.ts`, only re-exports the app for a
// serverless host to invoke per request (ADR-0018); nothing this repository
// describes deploys it that way any more (ADR-0023).

import { serve } from "@hono/node-server";

import app, { ALLOWED_ORIGINS } from "@/app";
import { logInfo } from "@/lib/logger";

const PORT = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port: PORT }, (info) => {
  logInfo({ route: "server", event: "listening", port: info.port, origins: ALLOWED_ORIGINS });
});
