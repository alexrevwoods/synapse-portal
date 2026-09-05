import { useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Globe2, Lock, Network, Send, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

const visibilityOptions = [
  ["public", "Public", Globe2, "Anyone can discover this Signal."],
  ["followers", "Followers", UsersRound, "Visible to Profiles that follow you."],
  ["connections", "Connections", Network, "For accepted Connections only."],
  ["private", "Private", Lock, "Visible only to this Profile."],
] as const;

type Visibility = (typeof visibilityOptions)[number][0];

function formatDate(value: Date | string | null) {
  if (!value) return "Draft";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function Signals() {
  const { isAuthenticated, loading } = useAuth();
  const [, params] = useRoute("/signals/:profileId");
  const profileId = Number(params?.profileId);
  const profile = trpc.profile.builder.useQuery({ profileId }, { enabled: isAuthenticated && Boolean(profileId) });
  const signals = trpc.signals.listMine.useQuery({ profileId }, { enabled: isAuthenticated && Boolean(profileId) });
  const utils = trpc.useUtils();
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const publish = trpc.signals.create.useMutation({
    onSuccess: () => {
      setBody("");
      toast.success("Signal published");
      utils.signals.listMine.invalidate({ profileId });
      utils.profile.builder.invalidate({ profileId });
    },
    onError: (error) => toast.error(error.message),
  });

  if (loading) return <main className="min-h-screen bg-[#070b14]" />;
  if (!isAuthenticated) return <main className="grid min-h-screen place-items-center bg-[#070b14] px-4"><div className="max-w-md rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center"><Send className="mx-auto text-cyan-100" /><h1 className="font-display mt-5 text-2xl font-semibold text-white">Publish from your identity</h1><p className="mt-3 text-sm leading-6 text-slate-400">Sign in to write a Signal and build a thoughtful public feed.</p><button onClick={() => startLogin()} className="primary-button mt-7 w-full">Sign in to continue</button></div></main>;
  if (profile.isLoading || signals.isLoading) return <main className="min-h-screen bg-[#070b14] p-10 text-sm font-bold text-slate-500">Loading Signals…</main>;
  if (!profile.data || !signals.data) return <main className="grid min-h-screen place-items-center bg-[#070b14] px-4 text-white"><div className="text-center"><p className="font-display text-2xl font-semibold">Profile not found</p><Link href="/onboarding" className="primary-button mt-6">Create a Profile</Link></div></main>;

  const selectedVisibility = visibilityOptions.find(([value]) => value === visibility)!;
  const VisibilityIcon = selectedVisibility[2];
  return (
    <main className="min-h-screen bg-[#070b14] text-white"><header className="sticky top-0 z-30 border-b border-white/[.07] bg-[#070b14]/85 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"><div className="flex items-center gap-3"><Link href={`/builder/${profileId}`} className="flex items-center gap-2 text-xs font-bold text-slate-400 transition hover:text-cyan-100"><ArrowLeft size={14} /> Portal Builder</Link><span className="h-4 w-px bg-white/10" /><span className="font-display text-sm font-semibold text-white">Signals</span></div><Link href={`/${profile.data.profile.username}`} target="_blank" className="secondary-button !px-3 !py-2.5 !text-xs">View public Feed</Link></div></header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:py-12"><div><span className="eyebrow"><span className="signal-dot" /> Native publishing</span><h1 className="font-display mt-5 text-3xl font-semibold tracking-[-.055em] text-white">What&apos;s alive in your world?</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Signals turn a Portal into a living identity. Start with a focused text update—no engagement bait required.</p>
        <section className="mt-7 rounded-2xl border border-cyan-200/20 bg-[linear-gradient(145deg,rgba(17,43,69,.62),rgba(10,14,28,.9))] p-5"><textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={5000} rows={6} placeholder="Share an update, an idea, or something you are building…" className="w-full resize-none bg-transparent text-base leading-7 text-white outline-none placeholder:text-slate-600" /><div className="mt-4 flex flex-col gap-3 border-t border-white/[.08] pt-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-2">{visibilityOptions.map(([value, label, Icon]) => <button key={value} type="button" onClick={() => setVisibility(value)} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.1em] transition ${visibility === value ? "border-cyan-200/45 bg-cyan-300/[.1] text-cyan-100" : "border-white/[.08] bg-white/[.02] text-slate-500 hover:text-slate-300"}`}><Icon size={12} /> {label}</button>)}</div><button disabled={!body.trim() || publish.isPending} onClick={() => publish.mutate({ profileId, type: "text", body, visibility })} className="primary-button !px-4 !py-2.5 !text-xs">{publish.isPending ? "Publishing…" : "Publish Signal"} <Send size={14} /></button></div></section>
        <div className="mt-8"><div className="flex items-center justify-between"><h2 className="font-display text-xl font-semibold text-white">Published Signals</h2><span className="text-xs font-bold text-slate-600">{signals.data.length} total</span></div><div className="mt-4 space-y-3">{signals.data.map((signal) => { const icon = visibilityOptions.find(([value]) => value === signal.visibility)?.[2] || VisibilityIcon; const Icon = icon; return <article key={signal.id} className="rounded-xl border border-white/[.08] bg-white/[.02] p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-500"><Icon size={12} className="text-cyan-200" /> {signal.visibility} · {formatDate(signal.publishedAt)}</div><span className="rounded-full border border-white/[.08] px-2 py-1 text-[9px] font-bold uppercase tracking-[.1em] text-slate-600">{signal.type}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{signal.body}</p></article>; })}{signals.data.length === 0 && <div className="rounded-xl border border-dashed border-white/[.12] p-8 text-center"><Send className="mx-auto text-slate-600" size={24} /><p className="mt-3 text-sm font-bold text-slate-300">No Signals yet.</p><p className="mt-1 text-xs text-slate-600">Your first thought can make this identity feel alive.</p></div>}</div></div>
      </div><aside className="h-fit rounded-2xl border border-white/[.08] bg-slate-950/35 p-5 lg:sticky lg:top-24"><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-cyan-100">Publishing as</p><p className="font-display mt-3 text-lg font-semibold text-white">{profile.data.profile.displayName}</p><p className="mt-1 text-xs text-slate-500">@{profile.data.profile.username}</p><div className="mt-5 border-t border-white/[.08] pt-4"><p className="flex items-center gap-2 text-xs font-bold text-slate-300"><VisibilityIcon size={14} className="text-cyan-200" /> {selectedVisibility[1]} visibility</p><p className="mt-2 text-xs leading-5 text-slate-600">{selectedVisibility[3]}</p></div></aside></div>
    </main>
  );
}
