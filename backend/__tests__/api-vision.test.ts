import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  NOT_AN_IMAGE_BASE64,
  oversizedJpegBase64,
  TINY_GIF_BASE64,
  TINY_JPEG_BASE64,
  TINY_PNG_BASE64,
} from "./fixtures";

const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
  Type: { OBJECT: "OBJECT", STRING: "STRING", BOOLEAN: "BOOLEAN" },
  ThinkingLevel: { MINIMAL: "MINIMAL", LOW: "LOW" },
}));

import { POST } from "@/routes/vision";

// Response.json() is typed `unknown` on Node (it comes from @types/node, not
// from the DOM lib), so every body is read through this helper.
function readBody(res: Response): Promise<Record<string, unknown>> {
  return res.json() as Promise<Record<string, unknown>>;
}

function post(body: unknown): Request {
  return new Request("http://localhost/api/vision", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const OK_RESULT = {
  status: "not_compliant",
  reason: "You appear to be wearing shorts in a temple area.",
  suggestion: "Wrap a kamen and sash before entering the inner courtyard.",
  reference: "Bali Governor Circular No. 7 of 2025",
};

function mockVision(payload: unknown) {
  generateContent.mockResolvedValue({
    text: typeof payload === "string" ? payload : JSON.stringify(payload),
    usageMetadata: { totalTokenCount: 300 },
  });
}

beforeEach(() => {
  generateContent.mockReset();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/vision — analysis", () => {
  it("returns the four-field verdict for a valid JPEG", async () => {
    mockVision(OK_RESULT);
    const res = await POST(post({ image: TINY_JPEG_BASE64, context: "temple", lang: "en" }));

    expect(res.status).toBe(200);
    expect(await readBody(res)).toEqual(OK_RESULT);
  });

  it("accepts a PNG and a data-URL prefix, passing clean base64 to the model", async () => {
    mockVision(OK_RESULT);
    const res = await POST(
      post({ image: `data:image/png;base64,${TINY_PNG_BASE64}`, context: "general", lang: "en" }),
    );

    expect(res.status).toBe(200);
    const inlineData = generateContent.mock.calls[0][0].contents[0].inlineData;
    expect(inlineData.mimeType).toBe("image/png");
    expect(inlineData.data).toBe(TINY_PNG_BASE64);
    expect(inlineData.data).not.toContain("data:");
  });

  it("detects the real format instead of trusting the client's mimeType", async () => {
    mockVision(OK_RESULT);
    await POST(post({ image: TINY_JPEG_BASE64, mimeType: "image/png", context: "temple" }));

    expect(generateContent.mock.calls[0][0].contents[0].inlineData.mimeType).toBe("image/jpeg");
  });

  it("passes the temple context and the requested language into the prompt", async () => {
    mockVision(OK_RESULT);
    await POST(post({ image: TINY_JPEG_BASE64, context: "temple", lang: "id" }));

    const call = generateContent.mock.calls[0][0];
    expect(call.contents[1]).toContain("at or near a temple");
    expect(call.config.systemInstruction).toContain("Indonesian (Bahasa Indonesia)");
  });

  it("coerces an unknown context to general", async () => {
    mockVision(OK_RESULT);
    await POST(post({ image: TINY_JPEG_BASE64, context: "spaceship" }));

    expect(generateContent.mock.calls[0][0].contents[1]).toContain("general setting");
  });

  it("forces an unexpected status value to unclear", async () => {
    mockVision({ ...OK_RESULT, status: "very_bad" });
    const res = await POST(post({ image: TINY_JPEG_BASE64, context: "temple" }));

    expect((await readBody(res)).status).toBe("unclear");
  });

  it("falls back to unclear when the model returns non-JSON", async () => {
    mockVision("sorry, I cannot help with that");
    const res = await POST(post({ image: TINY_JPEG_BASE64, context: "temple", lang: "id" }));

    expect(res.status).toBe(200);
    const json = await readBody(res);
    expect(json.status).toBe("unclear");
    expect(json.reason).toMatch(/belum bisa membaca foto/); // localized fallback
    expect(json.suggestion).toBeTruthy();
  });

  it("never returns a verdict without a reason and a suggestion (FR1.3)", async () => {
    mockVision({ status: "not_compliant", reason: "", suggestion: "", reference: "" });
    const res = await POST(post({ image: TINY_JPEG_BASE64, context: "temple" }));

    const json = await readBody(res);
    expect(json.status).toBe("unclear");
    expect(json.reason).toBeTruthy();
    expect(json.suggestion).toBeTruthy();
  });
});

describe("POST /api/vision — input validation", () => {
  it("rejects a GIF with 400 unsupported_media", async () => {
    const res = await POST(post({ image: TINY_GIF_BASE64, context: "temple" }));

    expect(res.status).toBe(400);
    expect((await readBody(res)).code).toBe("unsupported_media");
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("rejects valid base64 that is not an image at all", async () => {
    const res = await POST(post({ image: NOT_AN_IMAGE_BASE64, context: "temple" }));

    expect(res.status).toBe(400);
    expect((await readBody(res)).code).toBe("unsupported_media");
  });

  it("rejects an image over 5 MB with 413 before calling Gemini", async () => {
    const res = await POST(post({ image: oversizedJpegBase64(), context: "temple" }));

    expect(res.status).toBe(413);
    expect((await readBody(res)).code).toBe("image_too_large");
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("localizes the too-large message", async () => {
    const res = await POST(post({ image: oversizedJpegBase64(), context: "temple", lang: "id" }));

    expect((await readBody(res)).error).toMatch(/lebih besar dari 5 MB/);
  });

  it("rejects a missing or non-string image", async () => {
    for (const body of [{ context: "temple" }, { image: 42 }, { image: "   " }]) {
      const res = await POST(post(body));
      expect(res.status).toBe(400);
      expect((await readBody(res)).code).toBe("invalid_input");
    }
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("rejects a string that is not base64", async () => {
    const res = await POST(post({ image: "!!!! not base64 !!!!", context: "temple" }));

    expect(res.status).toBe(400);
    expect((await readBody(res)).code).toBe("invalid_input");
  });
});

describe("POST /api/vision — upstream failures", () => {
  it("maps a repeated 429 to a friendly rate_limited error", async () => {
    generateContent.mockRejectedValue(Object.assign(new Error("quota"), { status: 429 }));
    const res = await POST(post({ image: TINY_JPEG_BASE64, context: "temple" }));

    expect(res.status).toBe(429);
    expect((await readBody(res)).code).toBe("rate_limited");
    expect(generateContent).toHaveBeenCalledTimes(2); // one retry
  });

  it("maps other upstream errors to 502 ai_error", async () => {
    generateContent.mockRejectedValue(new Error("upstream exploded"));
    const res = await POST(post({ image: TINY_JPEG_BASE64, context: "temple" }));

    expect(res.status).toBe(502);
    expect((await readBody(res)).code).toBe("ai_error");
  });

  it("returns 504 when Gemini never responds", async () => {
    vi.useFakeTimers();
    try {
      generateContent.mockImplementation(() => new Promise(() => {}));
      const pending = POST(post({ image: TINY_JPEG_BASE64, context: "temple" }));
      await vi.advanceTimersByTimeAsync(10_000);
      const res = await pending;

      expect(res.status).toBe(504);
      expect((await readBody(res)).code).toBe("timeout");
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("POST /api/vision — privacy", () => {
  it("never writes image bytes to the logs", async () => {
    const logged: string[] = [];
    vi.spyOn(console, "log").mockImplementation((line) => void logged.push(String(line)));
    vi.spyOn(console, "error").mockImplementation((line) => void logged.push(String(line)));

    mockVision(OK_RESULT);
    await POST(post({ image: TINY_JPEG_BASE64, context: "temple" }));

    const all = logged.join("\n");
    expect(all).not.toContain(TINY_JPEG_BASE64);
    expect(all).not.toContain(TINY_JPEG_BASE64.slice(0, 40));
    expect(all).toContain("imageBytes"); // size is logged, content is not
  });
});
