import { describe, expect, it } from "vitest";
import { nodeTypes, normalizeUsername } from "./profile";

describe("normalizeUsername", () => {
  it("normalizes a Profile handle for uniqueness and routing", () => {
    expect(normalizeUsername("  @Alex_Revwoods ")).toBe("alex_revwoods");
  });
});

describe("nodeTypes", () => {
  it("includes the richer public Portal categories", () => {
    expect(nodeTypes).toEqual(expect.arrayContaining(["event", "product", "booking", "team"]));
  });
});
