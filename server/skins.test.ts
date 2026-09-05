import { describe, expect, it } from "vitest";
import { canUseSkin, getSkin, skinsForPlan } from "../shared/skins";

describe("Synapse Skin library", () => {
  it("exposes the correct number of included Skins for every membership", () => {
    expect(skinsForPlan("core")).toHaveLength(6);
    expect(skinsForPlan("pulse")).toHaveLength(9);
    expect(skinsForPlan("nexus")).toHaveLength(12);
  });

  it("keeps Nexus-only Brand Studio out of lower tiers", () => {
    expect(canUseSkin("core", "brand")).toBe(false);
    expect(canUseSkin("pulse", "brand")).toBe(false);
    expect(canUseSkin("nexus", "brand")).toBe(true);
  });

  it("maps legacy Portal theme selections into the Skin library", () => {
    expect(getSkin("atlas").id).toBe("signal");
    expect(getSkin("aurora").id).toBe("lagoon");
  });
});
