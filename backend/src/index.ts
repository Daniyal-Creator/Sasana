// Backend entrypoint.
//
// The route handlers stay plain Web-standard `(Request) => Promise<Response>`
// functions. Hono hands them the untouched request via `c.req.raw` and uses the
// returned Response as-is, so the handlers depend on no framework at all - which
// is also why the test suite can call them directly.

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { logInfo } from "@/lib/logger";
import { POST as chat } from "@/routes/chat";
import { POST as vision } from "@/routes/vision";

const PORT = Number(process.env.PORT ?? 3001);

// The browser now calls this server cross-origin, so the frontend origin has to
// be allowed explicitly. Comma-separated so a deploy can add its own domain
// without a code change.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: ALLOWED_ORIGINS,
    allowMethods: ["POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

// Liveness probe. Lets Docker and a frontend developer confirm the server is up
// without spending Gemini quota.
app.get("/health", (c) => c.json({ ok: true }));

app.post("/api/chat", (c) => chat(c.req.raw));
app.post("/api/vision", (c) => vision(c.req.raw));

serve({ fetch: app.fetch, port: PORT }, (info) => {
  logInfo({ route: "server", event: "listening", port: info.port, origins: ALLOWED_ORIGINS });
});
