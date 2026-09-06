import { describe, expect, it } from "vitest";
import { extraBadgeSlots, verificationBadge } from "../shared/badges";

describe("tiered Profile badges", () => {
  it("does not show a paid verification badge to free Accounts", () => {
    expect(verificationBadge({ plan: "core", status: "free" })).toBeNull();
    expect(extraBadgeSlots({ plan: "nexus", status: "free" })).toBe(0);
  });

  it("shows the standard verified badge and one slot for active Pulse", () => {
    expect(verificationBadge({ plan: "pulse", status: "active" })).toMatchObject({ badgeKey: "verified_member", label: "Verified Member" });
    expect(extraBadgeSlots({ plan: "pulse", status: "active" })).toBe(1);
  });

  it("shows the evolved Nexus badge and two extra slots", () => {
    expect(verificationBadge({ plan: "nexus", status: "active" })).toMatchObject({ badgeKey: "nexus_verified", label: "Nexus Verified" });
    expect(extraBadgeSlots({ plan: "nexus", status: "active" })).toBe(2);
  });
});
