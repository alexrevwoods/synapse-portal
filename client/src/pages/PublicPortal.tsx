import { useEffect, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { ArrowLeft, Bell, Network, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { resolveSkin } from "@/lib/skins";
import LivePortalGraph from "@/components/LivePortalGraph";
import PortalGraph from "@/components/PortalGraph";
import ProfileSafetyControls from "@/components/ProfileSafetyControls";
import PublicSignalFeed from "@/components/PublicSignalFeed";
import SynapseMark from "@/components/SynapseMark";
import DemoPortalGuide from "@/components/DemoPortalGuide";
import ProfileBadgeStrip from "@/components/ProfileBadgeStrip";
import type { SignalEntry } from "@/components/SocialSignalCard";

const demoProfile = {
  id: -1,
  displayName: "Alex Revwoods",
  username: "alex",
  type: "creator",
  bio: "A filmmaker and founder building sharper stories for growing brands.",
  location: "Toronto",
};

const demoEntries: SignalEntry[] = [
  {
    signal: { id: -1, body: "A small reminder from the studio: clarity is often more memorable than noise. Building the next film with that in mind.", type: "text", visibility: "public", publishedAt: new Date() },
    profile: demoProfile,
    reactionCount: 18,
    reactedByCurrentProfile: false,
    comments: [],
  },
  {
    signal: { id: -2, body: "New work is on the way. The first cut is always where the real story begins.", type: "text", visibility: "public", publishedAt: new Date(Date.now() - 86400000 * 3) },
    profile: demoProfile,
    reactionCount: 7,
    reactedByCurrentProfile: false,
    comments: [],
  },
];

function initials(name: string) { return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }

export default function PublicPortal() {
  const [, params] = useRoute("/:username");
  const username = params?.username || "alex";
  const [, navigate] = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const portal = trpc.portal.getPublic.useQuery({ username });
  const myProfiles = trpc.profile.my.useQuery(undefined, { enabled: isAuthenticated });
  const [following, setFollowing] = useState(false);
  const [connectionRequested, setConnectionRequested] = useState(false);
  const sourceProfileId = myProfiles.data?.[0]?.id;
  const publicFeed = trpc.social.publicFeed.useQuery({ username, activeProfileId: sourceProfileId }, { enabled: Boolean(username) });
  const platformDemo = trpc.platform.demo.useQuery();
  const trackPortal = trpc.portal.track.useMutation();
  const follow = trpc.relationships.follow.useMutation({ onSuccess: () => { setFollowing(true); toast.success("Following added to your Timeline"); }, onError: (error) => toast.error(error.message) });
  const requestConnection = trpc.relationships.requestConnection.useMutation({ onSuccess: () => { setConnectionRequested(true); toast.success("Connection request sent"); }, onError: (error) => toast.error(error.message) });

  const profile = portal.data?.profile ?? (username === "alex" ? demoProfile : null);
  const isDemo = !portal.data && username === "alex";
  const isFeaturedDemo = Boolean(portal.data?.profile.id && portal.data.profile.id === platformDemo.data?.profile?.id);
  const portalTheme = isDemo ? "atlas" : portal.data?.profile.portalTheme || "atlas";
  const portalSkin = resolveSkin(portalTheme, { primary: !isDemo ? portal.data?.profile.brandPrimaryColor : undefined, secondary: !isDemo ? portal.data?.profile.brandSecondaryColor : undefined });
  const avatarUrl = !isDemo ? portal.data?.profile.avatarUrl : undefined;
  const brandLogoUrl = !isDemo ? portal.data?.profile.brandLogoUrl : undefined;
  const feedEntries = isDemo ? demoEntries : publicFeed.data ?? [];

  useEffect(() => {
    if (!profile || isDemo) return;
    let visitorId = window.sessionStorage.getItem("synapse-visitor-id");
    if (!visitorId) {
      visitorId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      window.sessionStorage.setItem("synapse-visitor-id", visitorId);
    }
    trackPortal.mutate({ username, eventType: "portal_view", visitorId });
  }, [profile?.id, isDemo, username]);

  const beginParticipation = (action: "follow" | "connect") => {
    if (!isAuthenticated) {
      window.sessionStorage.setItem("synapse-post-login", `/onboarding?intent=${action}&target=${username}`);
      startLogin();
      return;
    }
    if (!sourceProfileId) { navigate("/onboarding"); return; }
    const source = myProfiles.data?.find((item) => item.id === sourceProfileId);
    if (!source?.isPublished) { toast.info("Publish your own Portal before participating in the Network."); navigate(`/builder/${sourceProfileId}`); return; }
    if (action === "follow") follow.mutate({ sourceProfileId, targetUsername: username });
    else requestConnection.mutate({ sourceProfileId, targetUsername: username });
  };

  if (!profile && !portal.isLoading) return <main className="grid min-h-screen place-items-center bg-[#070b14] px-4 text-white"><div className="max-w-md text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[.03] text-slate-400"><Search size={20} /></span><h1 className="font-display mt-5 text-3xl font-semibold tracking-[-.05em]">This Portal isn&apos;t available.</h1><p className="mt-3 text-sm leading-6 text-slate-500">It may be unpublished, private, or no longer part of the public Network.</p><Link href="/" className="primary-button mt-7">Explore Synapse</Link></div></main>;
  if (!profile || loading) return <main className="min-h-screen bg-[#070b14]" />;

  return <main className="min-h-screen bg-[#070b14] text-white">
    <header className="sticky top-0 z-30 border-b border-white/[.07] bg-[#070b14]/80 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"><div className="flex items-center gap-3 sm:gap-5"><Link href="/" className="flex items-center gap-2.5" aria-label="Synapse home"><SynapseMark label={false} /><span className="font-display hidden text-base font-semibold tracking-[-.04em] text-white sm:block">synapse</span></Link><span className="h-5 w-px bg-white/10" /><Link href="/" className="flex items-center gap-1.5 text-xs font-bold text-slate-400 transition hover:text-cyan-100"><ArrowLeft size={14} /> Discover</Link></div><div className="hidden items-center gap-5 text-xs font-bold text-slate-400 md:flex"><button className="flex items-center gap-2 hover:text-cyan-100"><Search size={15} /> Explore</button><Link href="/onboarding" className="hover:text-cyan-100">Build a Portal</Link></div><Link href="/onboarding" className="secondary-button !rounded-full !px-3.5 !py-2.5 !text-xs"><Bell size={14} /> Join free</Link></div></header>
    <section style={{ backgroundImage: `radial-gradient(ellipse 55% 120% at 70% 0%,${portalSkin.secondary}36,transparent 60%)` }} className="relative overflow-hidden border-b border-white/[.07]"><div className="mx-auto max-w-7xl px-4 pb-7 pt-10 sm:px-6 lg:px-8 lg:pb-9 lg:pt-14"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div className="flex items-center gap-4"><div style={{ borderColor: `${portalSkin.primary}66`, boxShadow: `0 0 34px ${portalSkin.primary}33`, background: avatarUrl ? undefined : `linear-gradient(135deg, ${portalSkin.primary}, ${portalSkin.secondary})` }} className="grid h-16 w-16 place-items-center overflow-hidden rounded-[1.25rem] border font-display text-lg font-bold tracking-[-.08em] text-[#07101f]">{avatarUrl ? <img src={avatarUrl} alt={`${profile.displayName} avatar`} className="h-full w-full object-cover" /> : initials(profile.displayName)}</div><div>{brandLogoUrl && <img src={brandLogoUrl} alt={`${profile.displayName} logo`} className="mb-2 h-6 max-w-28 object-contain object-left" />}<div className="mb-1 flex flex-wrap items-center gap-2"><p className="font-display text-2xl font-semibold tracking-[-.05em] text-white">{profile.displayName}</p><span style={{ background: portalSkin.primary, boxShadow: `0 0 12px ${portalSkin.primary}` }} className="h-2 w-2 rounded-full" title="Published Portal" /></div>{!isDemo && <ProfileBadgeStrip badges={portal.data?.badges || []} compact />}<p className="mt-1.5 text-sm font-medium text-slate-400">@{profile.username} · {profile.type}{profile.location ? ` · ${profile.location}` : ""}</p></div></div><div className="flex gap-2"><button disabled={follow.isPending || following} onClick={() => beginParticipation("follow")} className={following ? "secondary-button !px-4 !py-3 !text-xs" : "primary-button !px-4 !py-3 !text-xs"}>{following ? "Following" : follow.isPending ? "Following…" : "Follow"}</button><button disabled={requestConnection.isPending || connectionRequested} onClick={() => beginParticipation("connect")} className="secondary-button !px-4 !py-3 !text-xs">{connectionRequested ? "Requested" : requestConnection.isPending ? "Sending…" : "Connect"}</button>{!isDemo && <ProfileSafetyControls sourceProfileId={sourceProfileId} targetProfileId={profile.id} targetUsername={profile.username} onBlocked={() => navigate("/")} />}</div></div><div className="mt-7 flex gap-6 overflow-x-auto text-xs font-bold"><span style={{ borderColor: portalSkin.primary, color: portalSkin.primary }} className="border-b-2 pb-3">Portal</span><span className="pb-3 text-slate-500">Feed</span><span className="pb-3 text-slate-500">About</span><span className="pb-3 text-slate-500">Network</span></div></div></section>
    <section className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pb-16"><div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400"><div className="flex items-center gap-2"><span className="signal-dot" aria-hidden="true" /><span className="font-semibold uppercase tracking-[0.14em]">Public Portal · @{profile.username}</span></div><span className="rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 font-semibold text-slate-400">{isDemo || isFeaturedDemo ? "Interactive demo" : "Published identity"}</span></div>{isDemo ? <PortalGraph embedded /> : <LivePortalGraph profile={profile} nodes={portal.data?.nodes ?? []} connections={portal.data?.connections ?? []} onNodeOpen={(nodeId) => trackPortal.mutate({ username, eventType: "node_open", nodeId })} />}<PublicSignalFeed profile={profile} entries={feedEntries} activeProfileId={isDemo ? undefined : sourceProfileId} onRefresh={() => { publicFeed.refetch(); }} /></section>{isFeaturedDemo && <DemoPortalGuide />}
  </main>;
}
