export type MembershipPlan = "core" | "pulse" | "nexus";
export type SkinTier = MembershipPlan;

export type SynapseSkin = {
  id: string;
  name: string;
  tier: SkinTier;
  primary: string;
  secondary: string;
  base: string;
  label: string;
};

export const SYNAPSE_SKINS: SynapseSkin[] = [
  { id: "signal", name: "Signal", tier: "core", primary: "#77e6fb", secondary: "#7467ff", base: "#070b14", label: "Cyan signal + violet depth" },
  { id: "lagoon", name: "Lagoon", tier: "core", primary: "#5eead4", secondary: "#2787f5", base: "#061419", label: "Sea glass + deep blue" },
  { id: "iris", name: "Iris", tier: "core", primary: "#c4b5fd", secondary: "#5966ff", base: "#0d0a1f", label: "Lilac light + indigo" },
  { id: "ember", name: "Ember", tier: "core", primary: "#fbbf7b", secondary: "#ec4899", base: "#180b12", label: "Soft ember + magenta" },
  { id: "moss", name: "Moss", tier: "core", primary: "#a7f3d0", secondary: "#16a47b", base: "#07160f", label: "Fresh green + forest" },
  { id: "arctic", name: "Arctic", tier: "core", primary: "#c8edff", secondary: "#3b82f6", base: "#07111d", label: "Ice white + cobalt" },
  { id: "ultraviolet", name: "Ultraviolet", tier: "pulse", primary: "#e9a8ff", secondary: "#8b5cf6", base: "#12091d", label: "Electric lilac + ultraviolet" },
  { id: "copper", name: "Copper", tier: "pulse", primary: "#fdba74", secondary: "#c2410c", base: "#1a0d08", label: "Warm metal + copper" },
  { id: "petal", name: "Petal", tier: "pulse", primary: "#f9a8d4", secondary: "#a855f7", base: "#1b0a1b", label: "Rose petal + orchid" },
  { id: "obsidian", name: "Obsidian", tier: "nexus", primary: "#e5e7eb", secondary: "#5b667a", base: "#07090d", label: "Graphite + silver" },
  { id: "velocity", name: "Velocity", tier: "nexus", primary: "#a3ff12", secondary: "#15b8a6", base: "#07130f", label: "Volt lime + teal" },
  { id: "brand", name: "Brand Studio", tier: "nexus", primary: "#77e6fb", secondary: "#7467ff", base: "#080b14", label: "Your own company colors" },
];

export const SKIN_ALLOWANCE: Record<MembershipPlan, number> = { core: 6, pulse: 9, nexus: 12 };
export const LEGACY_SKIN_IDS: Record<string, string> = { atlas: "signal", aurora: "lagoon", nocturne: "ultraviolet" };

export function normalizeSkinId(value?: string | null) {
  return LEGACY_SKIN_IDS[value || ""] || value || "signal";
}

export function getSkin(id?: string | null): SynapseSkin {
  const normalized = normalizeSkinId(id);
  return SYNAPSE_SKINS.find((skin) => skin.id === normalized) || SYNAPSE_SKINS[0];
}

export function isKnownSkin(id?: string | null) {
  const normalized = normalizeSkinId(id);
  return SYNAPSE_SKINS.some((skin) => skin.id === normalized);
}

export function canUseSkin(plan: MembershipPlan, id?: string | null) {
  const skin = getSkin(id);
  return SKIN_ALLOWANCE[plan] >= SKIN_ALLOWANCE[skin.tier];
}

export function skinsForPlan(plan: MembershipPlan) {
  return SYNAPSE_SKINS.filter((skin) => canUseSkin(plan, skin.id));
}
