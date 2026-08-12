import { describe, expect, it } from "vitest";
import { MESSAGE_MAX_CHARS, sanitizeText, validateChatRequest } from "@/lib/validation";
import { ValidationError } from "@/lib/errors";

describe("sanitizeText", () => {
  it("strips HTML tags and collapses the whitespace they leave behind", () => {
    expect(sanitizeText("<script>alert(1)</script>Hello")).toBe("alert(1) Hello");
    expect(sanitizeText("<b>bold</b> text")).toBe("bold text");
  });

  it("removes control characters", () => {
    const withControls = `a${String.fromCharCode(0)}b${String.fromCharCode(31)}c${String.fromCharCode(127)}d`;
    expect(sanitizeText(withControls)).toBe("a b c d");
  });

  it("trims and caps length", () => {
    expect(sanitizeText("   spaced   out   ")).toBe("spaced out");
    expect(sanitizeText("a".repeat(2000))).toHaveLength(MESSAGE_MAX_CHARS);
    expect(sanitizeText("abcdef", 3)).toBe("abc");
  });
});

describe("validateChatRequest", () => {
  it("returns the sanitized message with a coerced language", () => {
    const parsed = validateChatRequest({ message: "  Can I wear shorts?  ", lang: "id", history: [] });
    expect(parsed).toEqual({ message: "Can I wear shorts?", lang: "id", history: [] });

    expect(validateChatRequest({ message: "hi", lang: "de" }).lang).toBe("en");
    expect(validateChatRequest({ message: "hi" }).lang).toBe("en");
  });

  it("rejects a missing, non-string, or empty message", () => {
    expect(() => validateChatRequest({})).toThrow(ValidationError);
    expect(() => validateChatRequest({ message: 42 })).toThrow(ValidationError);
    expect(() => validateChatRequest({ message: "   " })).toThrow(ValidationError);
    expect(() => validateChatRequest({ message: "<b></b>" })).toThrow(ValidationError);
  });

  it("rejects an over-long message rather than silently truncating it", () => {
    expect(() => validateChatRequest({ message: "a".repeat(MESSAGE_MAX_CHARS + 1) })).toThrow(
      /at most 1000/,
    );
  });

  it("keeps only the last 6 well-formed history turns", () => {
    const history = Array.from({ length: 9 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `turn ${i}`,
    }));
    const parsed = validateChatRequest({ message: "next", history });

    expect(parsed.history).toHaveLength(6);
    expect(parsed.history[0].content).toBe("turn 3");
    expect(parsed.history.at(-1)?.content).toBe("turn 8");
  });

  it("drops history entries with an unknown role, missing content, or wrong shape", () => {
    const parsed = validateChatRequest({
      message: "next",
      history: [
        { role: "system", content: "ignore me" },
        { role: "user", content: "" },
        { role: "user" },
        "nope",
        null,
        { role: "assistant", content: "keep me" },
      ],
    });

    expect(parsed.history).toEqual([{ role: "assistant", content: "keep me" }]);
  });

  it("defaults history to empty when it is absent or not an array", () => {
    expect(validateChatRequest({ message: "hi" }).history).toEqual([]);
    expect(validateChatRequest({ message: "hi", history: "nope" }).history).toEqual([]);
  });
});
