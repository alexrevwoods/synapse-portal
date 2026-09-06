import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { INTERESTS, type InterestKey } from "@shared/interests";

export default function ProfileInterestEditor({ profileId, profileName }: { profileId: number; profileName: string }) {
  const interests = trpc.profile.interests.useQuery({ profileId });
  const utils = trpc.useUtils();
  const save = trpc.profile.saveInterests.useMutation({ onSuccess: () => { utils.profile.interests.invalidate({ profileId }); utils.social.suggestions.invalidate({ profileId }); toast.success("Discovery interests updated"); }, onError: (error) => toast.error(error.message) });
  const selected = (interests.data || []) as InterestKey[];
  const toggle = (key: InterestKey) => { const next = selected.includes(key) ? selected.filter((item) => item !== key) : selected.length < 6 ? [...selected, key] : selected; if (next.length === selected.length && !selected.includes(key)) { toast.info("Choose up to six interests"); return; } save.mutate({ profileId, interests: next }); };
  return <section className="mt-6 rounded-2xl border border-violet-200/[.14] bg-violet-300/[.035] p-4 sm:p-5"><div className="flex items-start justify-between gap-4"><div><span className="eyebrow !border-violet-200/25 !bg-violet-300/[.08] !text-violet-100"><Sparkles size={12} /> Discover preferences</span><h2 className="font-display mt-3 text-lg font-semibold text-white">Interests for {profileName}</h2><p className="mt-1 text-xs leading-5 text-slate-500">Private signals that improve transparent follow suggestions. They are not displayed on the public Portal.</p></div><span className="shrink-0 rounded-full border border-white/[.08] bg-slate-950/35 px-2.5 py-1 text-[10px] font-bold text-slate-500">{selected.length}/6</span></div><div className="mt-4 flex flex-wrap gap-2">{INTERESTS.map((interest) => { const active = selected.includes(interest.key); return <button key={interest.key} type="button" disabled={save.isPending} onClick={() => toggle(interest.key)} className={`rounded-full border px-3 py-2 text-[11px] font-bold transition disabled:opacity-60 ${active ? "border-violet-200/45 bg-violet-300/[.13] text-violet-100" : "border-white/[.09] bg-white/[.025] text-slate-400 hover:border-white/20 hover:text-slate-200"}`}>{active && <Check className="mr-1 inline-block" size={12} />}{interest.label}</button>; })}</div></section>;
}
