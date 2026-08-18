import { describe, expect, it } from "vitest";
import { formatDistance } from "@/lib/geo";

describe("frontend test harness", () => {
  it("resolves the @ path alias and executes pure helper functions", () => {
    expect(formatDistance(400, "en")).toBe("400 m");
  });
});
