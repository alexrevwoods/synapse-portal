import { Check, Palette } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { resolveSkin } from "@/lib/skins";
import { SYNAPSE_SKINS, SKIN_ALLOWANCE, type MembershipPlan } from "@shared/skins";

export default function PortalThemePicker({ profileId, currentTheme, brandPrimary, brandSecondary, onChange }: { profileId: number; currentTheme: string; brandPrimary?: string | null; brandSecondary?: string | null; onChange: () => void }) {
  const account = trpc.account.overview.useQuery();
  const update = trpc.profile.update.useMutation({ onSuccess: () => { toast.success("Public Portal Skin saved"); onChange(); }, onError: (error) => toast.error(error.message) });
  if (account.isLoading || !account.data) return <section className="rounded-2xl border border-white/[.09] bg-slate-950/30 p-5 sm:p-7"><p className="text-sm text-slate-500">Loading Skin library…</p></section>;
  const plan = account.data.membership.plan as MembershipPlan;
  const allowance = SKIN_ALLOWANCE[plan];
  const allowedSkins = SYNAPSE_SKINS.slice(0, allowance);
  const activeSkinId = resolveSkin(currentTheme).id;
  return <section className="rounded-2xl border border-white/[.09] bg-slate-950/30 p-5 sm:p-7"><div className="border-b border-white/[.08] pb-5"><span className="eyebrow"><Palette size={12} /> Public Portal Skin</span><h2 className="font-display mt-3 text-2xl font-semibold tracking-[-.05em] text-white">Set the atmosphere visitors see.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">This Skin is chosen by the Profile owner and is fixed for Portal visitors. They can explore your Portal, but cannot override its visual identity.</p><p className="mt-3 text-xs font-bold text-cyan-100">Your {plan} membership includes {allowance} Portal Skins.</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{allowedSkins.map((skin) => { const active = activeSkinId === skin.id; const colors = resolveSkin(skin.id, { primary: brandPrimary, secondary: brandSecondary }); return <button key={skin.id} disabled={update.isPending} onClick={() => update.mutate({ profileId, portalTheme: skin.id })} className={`group relative overflow-hidden rounded-xl border p-3 text-left transition ${active ? "border-cyan-200/50 bg-cyan-300/[.06]" : "border-white/[.08] bg-white/[.015] hover:border-white/22"}`}><span className="flex h-10 items-center justify-between rounded-lg px-2.5" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}><Palette size={15} className="text-[#07101f]" />{active && <span className="grid h-5 w-5 place-items-center rounded-full bg-[#07101f]/75 text-cyan-100"><Check size={12} /></span>}</span><span className="mt-3 block text-sm font-bold text-white">{skin.name}</span><span className="mt-1 block text-[10px] leading-4 text-slate-500">{skin.label}</span><span className="mt-2 block text-[9px] font-extrabold uppercase tracking-[.1em] text-slate-600">{skin.tier} · included</span></button>; })}</div><p className="mt-5 text-xs leading-5 text-slate-600">Achievement and add-on Skins will appear in this same library when they are unlocked in a future release.</p></section>;
}
