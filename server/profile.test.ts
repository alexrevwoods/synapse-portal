import { describe, expect, it } from "vitest";
import { normalizeUsername } from "./profile";

describe("normalizeUsername", () => {
  it("normalizes a Profile handle for uniqueness and routing", () => {
    expect(normalizeUsername("  @Alex_Revwoods ")).toBe("alex_revwoods");
  });
});
