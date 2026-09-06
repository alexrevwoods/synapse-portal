import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, ExternalLink, MessageCircleMore, Radio, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import SocialSignalCard, { type SignalEntry } from "@/components/SocialSignalCard";
import SignalRightsPanel from "@/components/SignalRightsPanel";
import WhoAreWeMark from "@/components/WhoAreWeMark";
import { useDocumentTitle } from "@/components/Head";

function signalExcerpt(value: string) {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > 180 ? `${text.slice(0, 177).trimEnd()}…` : text;
}

export default function PublicSignal() {
  const [, params] = useRoute("/:username/signals/:signalId");
  const username = params?.username || "";
  const signalId = Number(params?.signalId);
  const { isAuthenticated } = useAuth();
  const profiles = trpc.profile.my.useQuery(undefined, { enabled: isAuthenticated });
  const [activeProfileId, setActiveProfileId] = useState<number | undefined>();
  const signal = trpc.social.publicSignal.useQuery({ username, signalId }, { enabled: Boolean(username) && Number.isInteger(signalId) && signalId > 0 });
  const entry = signal.data as SignalEntry | null | undefined;
  const recordEvent = trpc.social.recordPublicSignalEvent.useMutation();
  const displayTitle = entry?.signal.seoTitle || (entry?.signal.body ? signalExcerpt(entry.signal.body) : `${entry?.profile.displayName || "Portal"} Signal`);
  useDocumentTitle(displayTitle ? `${displayTitle} · WhoAreWe` : undefined);

  useEffect(() => {
    if (activeProfileId || !profiles.data?.length) return;
    const saved = typeof window === "undefined" ? 0 : Number(window.localStorage.getItem("whoarewe-active-profile-id"));
    setActiveProfileId(profiles.data.find((profile) => profile.id === saved)?.id || profiles.data.find((profile) => profile.isPublished)?.id || profiles.data[0]?.id);
  }, [activeProfileId, profiles.data]);

  useEffect(() => {
    if (!entry || !username || !signalId) return;
    recordEvent.mutate({ username, signalId, eventType: "signal_view" });
    // One reach event per rendered detail-page visit; aggregate data contains no visitor identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.signal.id, username, signalId]);

  const shareSignal = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      recordEvent.mutate({ username, signalId, eventType: "signal_share" });
      toast.success("Signal link copied");
    } catch {
      toast.info("Copy this Signal URL from your browser to share it");
    }
  };

  if (signal.isLoading) return <main className="min-h-screen bg-[#080B14]" />;
  if (!entry) return <main className="grid min-h-screen place-items-center bg-[#080B14] px-4 text-white"><div className="max-w-md text-center"><Radio className="mx-auto text-slate-600" size={28} /><h1 className="font-display mt-5 text-3xl font-semibold tracking-[-.05em]">This Signal is unavailable.</h1><p className="mt-3 text-sm leading-6 text-slate-500">It may be private, unpublished, or no longer available.</p><Link href="/discover" className="primary-button mt-7">Discover Portals</Link></div></main>;

  return <main className="min-h-screen bg-[#080B14] text-white"><header className="sticky top-0 z-30 border-b border-white/[.07] bg-[#080B14]/90 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6"><div className="flex min-w-0 items-center gap-3"><Link href="/discover" aria-label="Discover Portals"><WhoAreWeMark label={false} /></Link><span className="hidden h-5 w-px bg-white/10 sm:block" /><Link href={`/${entry.profile.username}`} className="flex min-w-0 items-center gap-1.5 truncate text-xs font-bold text-slate-400 transition hover:text-cyan-100"><ArrowLeft size={14} /> <span className="truncate">{entry.profile.displayName}&apos;s Portal</span></Link></div><button type="button" onClick={shareSignal} className="secondary-button shrink-0 !px-3 !py-2 !text-[10px]"><Share2 size={13} /> Share</button></div></header><section className="border-b border-white/[.07] bg-[radial-gradient(circle_at_80%_0%,rgba(0,216,255,.12),transparent_32%),linear-gradient(145deg,rgba(12,22,40,.75),rgba(7,11,20,.35))]"><div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14"><span className="eyebrow"><MessageCircleMore size={12} /> Public Signal</span><h1 className="font-display mt-5 max-w-3xl text-3xl font-semibold leading-tight tracking-[-.055em] text-white sm:text-5xl">{displayTitle}</h1><p className="mt-4 text-sm font-semibold text-slate-400">Published by <Link href={`/${entry.profile.username}`} className="text-cyan-100 hover:text-cyan-50">{entry.profile.displayName}</Link> · @{entry.profile.username}</p></div></section><section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12"><SocialSignalCard entry={entry} activeProfileId={activeProfileId} onRefresh={() => signal.refetch()} /><SignalRightsPanel username={entry.profile.username} signalId={entry.signal.id} ownerName={entry.profile.displayName} license={entry.signal.mediaLicense} media={entry.media || []} /><div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[.08] bg-white/[.02] p-4"><div><p className="text-sm font-bold text-white">More from {entry.profile.displayName}</p><p className="mt-1 text-xs text-slate-500">Explore the Portal, its network, and public Signals.</p></div><Link href={`/${entry.profile.username}`} className="secondary-button !px-3.5 !py-2.5 !text-xs">Visit Portal <ExternalLink size={13} /></Link></div></section></main>;
}
