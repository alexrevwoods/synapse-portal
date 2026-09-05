import { describe, expect, it } from "vitest";
import { normalizePortalUsername } from "./portal";

describe("normalizePortalUsername", () => {
  it("normalizes a public Portal username", () => {
    expect(normalizePortalUsername("  @Alex_Revwoods ")).toBe("alex_revwoods");
  });
});
