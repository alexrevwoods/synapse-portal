export type BadgeTone = "cyan" | "violet" | "lime" | "amber" | "rose";
export type MembershipBadgeState = { plan: "core" | "pulse" | "nexus"; status: "free" | "trialing" | "active" | "canceled" };
export type PublicBadge = { badgeKey: string; label: string; tone: BadgeTone; verified?: boolean };

export const BADGE_CATALOG: PublicBadge[] = [
  { badgeKey: "early_builder", label: "Early Builder", tone: "cyan" },
  { badgeKey: "network_weaver", label: "Network Weaver", tone: "violet" },
  { badgeKey: "signal_steward", label: "Signal Steward", tone: "lime" },
  { badgeKey: "community_host", label: "Community Host", tone: "amber" },
  { badgeKey: "creative_force", label: "Creative Force", tone: "rose" },
];

export function verificationBadge(membership?: MembershipBadgeState | null): PublicBadge | null {
  if (membership?.status !== "active" || membership.plan === "core") return null;
  return membership.plan === "nexus" ? { badgeKey: "nexus_verified", label: "Nexus Verified", tone: "violet", verified: true } : { badgeKey: "verified_member", label: "Verified Member", tone: "cyan", verified: true };
}

export function extraBadgeSlots(membership?: MembershipBadgeState | null) {
  if (membership?.status !== "active") return 0;
  return membership.plan === "nexus" ? 2 : membership.plan === "pulse" ? 1 : 0;
}

export function catalogBadge(key: string) { return BADGE_CATALOG.find((badge) => badge.badgeKey === key) ?? null; }
