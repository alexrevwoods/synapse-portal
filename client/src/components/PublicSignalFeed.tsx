import { Send } from "lucide-react";
import SocialSignalCard, { type SignalEntry } from "./SocialSignalCard";

type Profile = { displayName: string; username: string; type: string };

export default function PublicSignalFeed({ profile, entries, activeProfileId, onRefresh }: { profile: Profile; entries: SignalEntry[]; activeProfileId?: number; onRefresh?: () => void }) {
  return <section className="mt-8 border-t border-white/[.08] pt-8"><div className="flex items-end justify-between gap-4"><div><span className="eyebrow">Profile Feed</span><h2 className="font-display mt-4 text-2xl font-semibold tracking-[-.05em] text-white">Signals from {profile.displayName}</h2></div><span className="text-xs font-bold text-slate-600">{entries.length} public</span></div><div className="mt-5 grid gap-3 lg:grid-cols-2">{entries.map((entry) => <SocialSignalCard key={entry.signal.id} entry={entry} activeProfileId={activeProfileId} onRefresh={onRefresh} compact />)}{entries.length === 0 && <div className="rounded-xl border border-dashed border-white/[.12] p-7 text-center lg:col-span-2"><Send className="mx-auto text-slate-600" size={22} /><p className="mt-3 text-sm font-bold text-slate-400">No public Signals yet.</p><p className="mt-1 text-xs text-slate-600">This Profile will share updates here when the time is right.</p></div>}</div></section>;
}
