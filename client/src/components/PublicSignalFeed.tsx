import { Globe2, Lock, Send, UsersRound } from "lucide-react";

type Signal = { id: number; body: string; type: string; visibility: string; publishedAt: Date | string | null };

type Profile = { displayName: string; username: string; type: string };

const icons = { public: Globe2, followers: UsersRound, connections: UsersRound, private: Lock, subscribers: UsersRound } as const;

function formatDate(value: Date | string | null) {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}

export default function PublicSignalFeed({ profile, signals }: { profile: Profile; signals: Signal[] }) {
  return <section className="mt-8 border-t border-white/[.08] pt-8"><div className="flex items-end justify-between gap-4"><div><span className="eyebrow">Profile Feed</span><h2 className="font-display mt-4 text-2xl font-semibold tracking-[-.05em] text-white">Signals from {profile.displayName}</h2></div><span className="text-xs font-bold text-slate-600">{signals.length} public</span></div><div className="mt-5 grid gap-3 lg:grid-cols-2">{signals.map((signal) => { const Icon = icons[signal.visibility as keyof typeof icons] || Globe2; return <article key={signal.id} className="rounded-xl border border-white/[.08] bg-white/[.02] p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-500"><span className="grid h-6 w-6 place-items-center rounded-lg bg-cyan-300/[.08] text-cyan-100"><Icon size={12} /></span>@{profile.username} · {formatDate(signal.publishedAt)}</div><span className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-600">{signal.type}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{signal.body}</p></article>; })}{signals.length === 0 && <div className="rounded-xl border border-dashed border-white/[.12] p-7 text-center lg:col-span-2"><Send className="mx-auto text-slate-600" size={22} /><p className="mt-3 text-sm font-bold text-slate-400">No public Signals yet.</p><p className="mt-1 text-xs text-slate-600">This Profile will share updates here when the time is right.</p></div>}</div></section>;
}
