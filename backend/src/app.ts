// The Hono app: routes, CORS and nothing else.
//
// Deliberately free of any call that binds a port or starts a process, because
// two different entry points import it and only one of them is allowed to
// listen (ADR-0018):
//
//   src/index.ts   default-exports this app. Vercel imports it and calls it
//                  per request; a `serve()` here would try to open a socket
//                  inside a serverless function.
//   src/server.ts  imports it and calls `serve()`. This is what `npm run dev`,
//                  `npm run start` and the development container run.
//
// The route handlers stay plain Web-standard `(Request) => Promise<Response>`
// functions. Hono hands them the untouched request via `c.req.raw` and uses the
// returned Response as-is, so the handlers depend on no framework at all -
// which is also why the test suite can call them directly.

import { Hono } from "hono";
import { cors } from "hono/cors";

import { logError } from "@/lib/logger";
import { POST as chat } from "@/routes/chat";
import { GET as route } from "@/routes/route";
import { GET as stats } from "@/routes/stats";
import { POST as vision } from "@/routes/vision";

// The browser calls this server cross-origin, from the frontend's own hostname.
// Comma-separated so a deploy can add its domain without a code change.
export const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

/**
 * Whether a browser origin may call this API — and a log line when it may not.
 *
 * A list would have decided this on its own. The reason to write the function
 * out is the log: a refused origin is invisible from the server side otherwise.
 * The preflight still answers 204, the response simply carries no
 * `access-control-allow-origin`, and the only place the failure appears is the
 * visitor's console. A deployment can therefore be misconfigured for days while
 * `/health` says `{"ok":true}` and every log line looks normal — which is what
 * happened here, and what cost the time this function is meant to save.
 *
 * An empty origin is not a refusal. Hono passes `""` when the request carries no
 * `Origin` header at all, which is curl, a health check, or anything that is not
 * a browser. Nothing is being denied, so nothing is reported.
 */
export function resolveOrigin(origin: string): string | null {
  if (!origin) return null;
  if (ALLOWED_ORIGINS.includes(origin)) return origin;

  logError({
    route: "cors",
    event: "origin_rejected",
    origin,
    allowed: ALLOWED_ORIGINS,
  });
  return null;
}

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: resolveOrigin,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

// Liveness probe. Lets a frontend developer confirm the server is up without
// spending Gemini quota.
app.get("/health", (c) => c.json({ ok: true }));

app.post("/api/chat", (c) => chat(c.req.raw));
app.post("/api/vision", (c) => vision(c.req.raw));
// Read-only aggregates over the answer cache. Spends no quota, so it is safe to
// poll while demonstrating the saving.
app.get("/api/stats", () => stats());
// Directions to a chosen Amenity. Spends no Gemini quota; it reads a public
// routing service and hands back the line and the written steps.
app.get("/api/route", (c) => route(c.req.raw));

export default app;
