import { describe, expect, it } from "vitest";
import { INTERESTS, getInterestLabel } from "../shared/interests";

describe("discovery interest catalog", () => {
  it("provides unique, human-readable interest options", () => {
    expect(INTERESTS.length).toBeGreaterThanOrEqual(10);
    expect(new Set(INTERESTS.map((interest) => interest.key)).size).toBe(INTERESTS.length);
    expect(getInterestLabel("technology")).toBe("Technology");
  });
});
