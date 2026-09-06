import { BadgeCheck, Crown, Sparkles } from "lucide-react";

export type ProfileBadge = { badgeKey: string; label: string; tone: "cyan" | "violet" | "lime" | "amber" | "rose"; verified?: boolean };
const tones = { cyan: "border-cyan-200/30 bg-cyan-300/[.08] text-cyan-100", violet: "border-violet-200/30 bg-violet-300/[.09] text-violet-100", lime: "border-lime-200/30 bg-lime-300/[.09] text-lime-100", amber: "border-amber-200/30 bg-amber-300/[.09] text-amber-100", rose: "border-rose-200/30 bg-rose-300/[.09] text-rose-100" };

export default function ProfileBadgeStrip({ badges, compact = false }: { badges: ProfileBadge[]; compact?: boolean }) {
  if (!badges.length) return null;
  return <div className="flex flex-wrap items-center gap-1.5" aria-label="Profile badges">{badges.map((badge) => { const Icon = badge.verified ? (badge.badgeKey === "nexus_verified" ? Crown : BadgeCheck) : Sparkles; return <span key={badge.badgeKey} title={badge.label} className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-extrabold uppercase tracking-[.09em] ${tones[badge.tone]}`}><Icon size={compact ? 11 : 12} /> {!compact && badge.label}</span>; })}</div>;
}
