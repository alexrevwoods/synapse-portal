import { useEffect, useRef } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Bell, Check, MessageCircle, Sparkles, UserPlus, UsersRound } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

const notificationCopy = {
  follow: { label: "started following this Profile", icon: UserPlus },
  connection_request: { label: "sent a Connection request", icon: UsersRound },
  connection_accepted: { label: "accepted your Connection request", icon: Check },
  signal_reaction: { label: "sparked one of your Signals", icon: Sparkles },
  signal_comment: { label: "commented on your Signal", icon: MessageCircle },
  signal_reply: { label: "replied in a Signal conversation", icon: MessageCircle },
} as const;

function initials(name: string) { return name.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase(); }
function dateLabel(value: Date | string) { return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value)); }

export default function Notifications() {
  const { isAuthenticated, loading } = useAuth();
  const [, params] = useRoute("/notifications/:profileId");
  const profileId = Number(params?.profileId);
  const profile = trpc.profile.builder.useQuery({ profileId }, { enabled: isAuthenticated && Boolean(profileId) });
  const notifications = trpc.social.notifications.useQuery({ profileId }, { enabled: isAuthenticated && Boolean(profileId) });
  const markRead = trpc.social.markNotificationsRead.useMutation();
  const didMarkRead = useRef(false);
  useEffect(() => {
    if (didMarkRead.current || !notifications.data?.some((entry) => !entry.notification.readAt) || markRead.isPending) return;
    didMarkRead.current = true;
    markRead.mutate({ profileId });
  }, [notifications.data, profileId, markRead]);

  if (loading) return <main className="min-h-screen bg-[#080B14]" />;
  if (!isAuthenticated) return <main className="grid min-h-screen place-items-center bg-[#080B14] px-4"><div className="max-w-md rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center"><Bell className="mx-auto text-cyan-100" /><h1 className="font-display mt-5 text-2xl font-semibold text-white">Keep the Network close</h1><p className="mt-3 text-sm leading-6 text-slate-400">Sign in to see follows, Connection requests, Signal conversations, and other activity around your identity.</p><button onClick={() => startLogin()} className="primary-button mt-7 w-full">Sign in to continue</button></div></main>;
  if (profile.isLoading || notifications.isLoading) return <main className="min-h-screen bg-[#080B14] p-10 text-sm font-bold text-slate-500">Loading notifications…</main>;
  if (!profile.data || !notifications.data) return <main className="grid min-h-screen place-items-center bg-[#080B14] px-4 text-white"><div className="text-center"><p className="font-display text-2xl font-semibold">Profile not found</p><Link href="/onboarding" className="primary-button mt-6">Create a Profile</Link></div></main>;

  return <main className="min-h-screen bg-[#080B14] text-white"><header className="sticky top-0 z-30 border-b border-white/[.07] bg-[#080B14]/85 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6"><div className="flex items-center gap-3"><Link href={`/timeline/${profileId}`} className="flex items-center gap-2 text-xs font-bold text-slate-400 transition hover:text-cyan-100"><ArrowLeft size={14} /> Timeline</Link><span className="h-4 w-px bg-white/10" /><span className="font-display text-sm font-semibold">Notifications</span></div><span className="rounded-full border border-cyan-200/20 bg-cyan-300/[.08] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.11em] text-cyan-100">{notifications.data.filter((entry) => !entry.notification.readAt).length} new</span></div></header><div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12"><span className="eyebrow"><span className="signal-dot" /> For @{profile.data.profile.username}</span><h1 className="font-display mt-5 text-3xl font-semibold tracking-[-.055em]">What&apos;s happening around your identity.</h1><div className="mt-8 space-y-2">{notifications.data.map((entry) => { const info = notificationCopy[entry.notification.type]; const Icon = info.icon; return <article key={entry.notification.id} className={`flex gap-3 rounded-xl border p-4 ${entry.notification.readAt ? "border-white/[.07] bg-white/[.015]" : "border-cyan-200/18 bg-cyan-300/[.045]"}`}><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[.08] bg-white/[.035] text-cyan-100">{entry.actor ? initials(entry.actor.displayName) : <Icon size={15} />}</div><div className="min-w-0 flex-1"><p className="text-sm leading-6 text-slate-300"><span className="font-bold text-white">{entry.actor?.displayName || "WhoAreWe"}</span> {info.label}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.1em] text-slate-600">{dateLabel(entry.notification.createdAt)}</p></div><Icon size={15} className="mt-1 text-slate-600" /></article>; })}{notifications.data.length === 0 && <div className="rounded-2xl border border-dashed border-white/[.12] p-10 text-center"><Bell className="mx-auto text-slate-600" size={25} /><p className="mt-4 text-sm font-bold text-slate-300">Nothing new yet.</p><p className="mt-2 text-xs leading-5 text-slate-600">As people follow, Connect, and respond to your Signals, the activity will appear here.</p></div>}</div></div></main>;
}
