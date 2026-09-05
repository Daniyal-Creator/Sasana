import { describe, it, expect } from "vitest";
import { useTabAnimation } from "@/lib/useTabAnimation";

describe("useTabAnimation", () => {
  it("exports useTabAnimation as a function", () => {
    expect(typeof useTabAnimation).toBe("function");
  });
});
