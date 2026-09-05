import { Link, useRoute } from "wouter";
import { ArrowLeft, Bell, Clock3, Network, Send } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import SocialSignalCard from "@/components/SocialSignalCard";

export default function Timeline() {
  const { isAuthenticated, loading } = useAuth();
  const [, params] = useRoute("/timeline/:profileId");
  const profileId = Number(params?.profileId);
  const profile = trpc.profile.builder.useQuery({ profileId }, { enabled: isAuthenticated && Boolean(profileId) });
  const timeline = trpc.social.timeline.useQuery({ profileId }, { enabled: isAuthenticated && Boolean(profileId) });
  const utils = trpc.useUtils();
  const refresh = () => { utils.social.timeline.invalidate({ profileId }); utils.social.notifications.invalidate({ profileId }); };

  if (loading) return <main className="min-h-screen bg-[#070b14]" />;
  if (!isAuthenticated) return <main className="grid min-h-screen place-items-center bg-[#070b14] px-4"><div className="max-w-md rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center"><Clock3 className="mx-auto text-cyan-100" /><h1 className="font-display mt-5 text-2xl font-semibold text-white">Your intentional Timeline</h1><p className="mt-3 text-sm leading-6 text-slate-400">Sign in to see the latest Signals from the Profiles you intentionally follow or Connect with.</p><button onClick={() => startLogin()} className="primary-button mt-7 w-full">Sign in to continue</button></div></main>;
  if (profile.isLoading || timeline.isLoading) return <main className="min-h-screen bg-[#070b14] p-10 text-sm font-bold text-slate-500">Loading Timeline…</main>;
  if (!profile.data || !timeline.data) return <main className="grid min-h-screen place-items-center bg-[#070b14] px-4 text-white"><div className="text-center"><p className="font-display text-2xl font-semibold">Profile not found</p><Link href="/onboarding" className="primary-button mt-6">Create a Profile</Link></div></main>;

  return <main className="min-h-screen bg-[#070b14] text-white"><header className="sticky top-0 z-30 border-b border-white/[.07] bg-[#070b14]/85 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6"><div className="flex items-center gap-3"><Link href={`/builder/${profileId}`} className="flex items-center gap-2 text-xs font-bold text-slate-400 transition hover:text-cyan-100"><ArrowLeft size={14} /> Builder</Link><span className="h-4 w-px bg-white/10" /><span className="font-display text-sm font-semibold">Timeline</span></div><div className="flex gap-2"><Link href={`/notifications/${profileId}`} className="secondary-button !px-3 !py-2.5 !text-xs"><Bell size={14} /> Notifications</Link><Link href={`/signals/${profileId}`} className="primary-button !px-3 !py-2.5 !text-xs"><Send size={14} /> Signal</Link></div></div></header><div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12"><span className="eyebrow"><span className="signal-dot" /> Chronological by design</span><h1 className="font-display mt-5 text-3xl font-semibold tracking-[-.055em]">The people you chose. The latest Signals.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">No recommendations competing for attention. Your Timeline is a direct view of public Signals from your own identity, accepted Connections, and followed Profiles.</p><div className="mt-8 space-y-4">{timeline.data.map((entry) => <SocialSignalCard key={entry.signal.id} entry={entry} activeProfileId={profileId} onRefresh={refresh} />)}{timeline.data.length === 0 && <div className="rounded-2xl border border-dashed border-white/[.12] p-10 text-center"><Network className="mx-auto text-slate-600" size={28} /><p className="mt-4 text-sm font-bold text-slate-300">Your Timeline is forming.</p><p className="mt-2 text-xs leading-5 text-slate-600">Follow a public Profile or accept a Connection, then their new Signals will appear here chronologically.</p><Link href={`/network/${profileId}`} className="secondary-button mt-5 !px-3 !py-2.5 !text-xs">Open Network</Link></div>}</div></div></main>;
}
