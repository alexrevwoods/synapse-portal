import { describe, expect, it } from "vitest";
import { nodeTypes, normalizeUsername, portalAllowance } from "./profile";

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

describe("portalAllowance", () => {
  it("allows a small connected Portal network during free early access", () => {
    expect(portalAllowance({ plan: "core", status: "free" })).toBe(3);
    expect(portalAllowance({ plan: "nexus", status: "free" })).toBe(3);
  });

  it("scales capacity for active paid plans", () => {
    expect(portalAllowance({ plan: "core", status: "active" })).toBe(3);
    expect(portalAllowance({ plan: "pulse", status: "active" })).toBe(6);
    expect(portalAllowance({ plan: "nexus", status: "active" })).toBe(12);
  });
});
