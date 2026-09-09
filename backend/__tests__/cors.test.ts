import { afterEach, describe, expect, it, vi } from "vitest";

// CORS had no test, and that is exactly how the deployment broke: the API
// allowed http://localhost:3000 and nothing else, so the browser refused every
// call from https://sasana.smkwikrama.sch.id while the server itself stayed
// healthy. The preflight even answered 204 — it simply carried no
// `access-control-allow-origin`, which is the one detail that decides whether
// the real request is allowed to follow.
//
// These tests pin that detail. A 204 is not the assertion; the header is.

const PROD = "https://sasana.smkwikrama.sch.id";
const DEV = "http://localhost:3000";

/**
 * A fresh copy of the app with ALLOWED_ORIGINS set to `origins`.
 *
 * `ALLOWED_ORIGINS` is read once at module scope, so a test that wants a
 * different list has to re-import the module rather than reassign the variable.
 */
async function appWith(origins: string) {
  vi.resetModules();
  vi.stubEnv("ALLOWED_ORIGINS", origins);
  return await import("@/app");
}

/** The preflight a browser sends before POSTing JSON to /api/vision. */
function preflight(origin: string): Request {
  return new Request("http://api.test/api/vision", {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type",
    },
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("CORS — which origins the API answers", () => {
  it("allows an origin that is on the list", async () => {
    const { default: app } = await appWith(DEV);

    const res = await app.request(preflight(DEV));

    expect(res.headers.get("access-control-allow-origin")).toBe(DEV);
  });

  // The production failure, as a test. Note the 204: the status alone would
  // have called this a pass.
  it("sends no allow-origin header for an origin that is not on the list", async () => {
    const { default: app } = await appWith(DEV);

    const res = await app.request(preflight(PROD));

    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("allows the deployed frontend once its origin is added", async () => {
    const { default: app } = await appWith(`${DEV},${PROD}`);

    const res = await app.request(preflight(PROD));

    expect(res.headers.get("access-control-allow-origin")).toBe(PROD);
  });

  it("keeps allowing localhost when a deployed origin is added beside it", async () => {
    const { default: app } = await appWith(`${DEV},${PROD}`);

    const res = await app.request(preflight(DEV));

    expect(res.headers.get("access-control-allow-origin")).toBe(DEV);
  });

  // Somebody will write the list with spaces after the commas, because that is
  // how lists are written.
  it("tolerates whitespace around the commas", async () => {
    const { default: app } = await appWith(`  ${DEV} ,  ${PROD}  `);

    const res = await app.request(preflight(PROD));

    expect(res.headers.get("access-control-allow-origin")).toBe(PROD);
  });

  it("answers a real request from an allowed origin with the header too", async () => {
    const { default: app } = await appWith(PROD);

    const res = await app.request(
      new Request("http://api.test/api/stats", { headers: { Origin: PROD } }),
    );

    expect(res.headers.get("access-control-allow-origin")).toBe(PROD);
  });
});

describe("CORS — what the server says when it refuses", () => {
  // The whole point of resolving the origin in a function rather than handing
  // `cors()` a list. Without this line, a misconfigured deployment is visible
  // only in the visitor's console.
  it("logs the origin it turned away, and what it would have accepted", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { default: app } = await appWith(DEV);

    await app.request(preflight(PROD));

    expect(spy).toHaveBeenCalledOnce();
    const logged = JSON.parse(spy.mock.calls[0][0] as string);
    expect(logged).toMatchObject({
      level: "error",
      route: "cors",
      event: "origin_rejected",
      origin: PROD,
      allowed: [DEV],
    });
  });

  // curl, a health check, anything that is not a browser. Nothing is being
  // denied, so a log line here would be noise on every uptime probe.
  it("says nothing when the request carries no Origin header at all", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { default: app } = await appWith(DEV);

    const res = await app.request(new Request("http://api.test/api/stats"));

    expect(res.headers.get("access-control-allow-origin")).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it("says nothing when the origin is allowed", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { default: app } = await appWith(DEV);

    await app.request(preflight(DEV));

    expect(spy).not.toHaveBeenCalled();
  });
});

describe("resolveOrigin", () => {
  it("returns the origin it was given when that origin is allowed", async () => {
    const { resolveOrigin } = await appWith(`${DEV},${PROD}`);

    expect(resolveOrigin(PROD)).toBe(PROD);
  });

  it("returns null for an origin that is not on the list", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { resolveOrigin } = await appWith(DEV);

    expect(resolveOrigin(PROD)).toBeNull();
  });

  it("returns null for the empty origin Hono passes for a non-browser call", async () => {
    const { resolveOrigin } = await appWith(DEV);

    expect(resolveOrigin("")).toBeNull();
  });

  // A near miss is a miss: a different scheme, a different port and a trailing
  // slash are all different origins, and each one is a real way to get this
  // wrong in a .env file.
  it.each([
    ["http instead of https", "http://sasana.smkwikrama.sch.id"],
    ["a trailing slash", `${PROD}/`],
    ["a different port", "http://localhost:3001"],
    ["a subdomain that was not listed", "https://www.sasana.smkwikrama.sch.id"],
  ])("refuses %s", async (_label, origin) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { resolveOrigin } = await appWith(`${DEV},${PROD}`);

    expect(resolveOrigin(origin)).toBeNull();
  });
});
