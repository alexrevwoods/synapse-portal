import { useEffect, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { ArrowLeft, ExternalLink, Globe2, LayoutDashboard, Network, Plus, Save, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import NodeGraphEditor from "@/components/NodeGraphEditor";

const nodeOptions = [
  ["web", "Website"],
  ["content", "Content"],
  ["social", "Social account"],
  ["identity", "Connected identity"],
  ["conversion", "Contact or CTA"],
  ["synapse", "Synapse destination"],
] as const;

type NodeType = (typeof nodeOptions)[number][0];

export default function PortalBuilder() {
  const { isAuthenticated, loading } = useAuth();
  const [, params] = useRoute("/builder/:profileId");
  const [, navigate] = useLocation();
  const profileId = Number(params?.profileId);
  const utils = trpc.useUtils();
  const builder = trpc.profile.builder.useQuery({ profileId }, { enabled: isAuthenticated && Boolean(profileId) });
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [showNodeForm, setShowNodeForm] = useState(false);
  const [nodeType, setNodeType] = useState<NodeType>("web");
  const [nodeTitle, setNodeTitle] = useState("");
  const [nodeSubtitle, setNodeSubtitle] = useState("");
  const [nodeUrl, setNodeUrl] = useState("");
  const [nodeDescription, setNodeDescription] = useState("");

  useEffect(() => {
    if (!builder.data) return;
    setDisplayName(builder.data.profile.displayName);
    setBio(builder.data.profile.bio || "");
    setLocation(builder.data.profile.location || "");
    setWebsiteUrl(builder.data.profile.websiteUrl || "");
  }, [builder.data]);

  const refresh = () => utils.profile.builder.invalidate({ profileId });
  const updateProfile = trpc.profile.update.useMutation({ onSuccess: () => { toast.success("Profile details saved"); refresh(); }, onError: (error) => toast.error(error.message) });
  const publish = trpc.profile.setPublished.useMutation({ onSuccess: (profile) => { toast.success(profile.isPublished ? "Portal published to the Network" : "Portal returned to draft mode"); refresh(); }, onError: (error) => toast.error(error.message) });
  const createNode = trpc.profile.createNode.useMutation({ onSuccess: () => { toast.success("Node added to your Portal"); setNodeTitle(""); setNodeSubtitle(""); setNodeUrl(""); setNodeDescription(""); setShowNodeForm(false); refresh(); }, onError: (error) => toast.error(error.message) });

  if (loading) return <main className="min-h-screen bg-[#070b14]" />;
  if (!isAuthenticated) return <main className="grid min-h-screen place-items-center bg-[#070b14] px-4"><div className="max-w-md rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center"><Network className="mx-auto text-cyan-100" /><h1 className="font-display mt-5 text-2xl font-semibold text-white">Your Portal Builder awaits</h1><p className="mt-3 text-sm leading-6 text-slate-400">Sign in to build and publish a Profile.</p><button onClick={() => startLogin()} className="primary-button mt-7 w-full">Sign in to continue</button></div></main>;
  if (builder.isLoading) return <main className="min-h-screen bg-[#070b14] p-10 text-sm font-bold text-slate-500">Loading Portal Builder…</main>;
  if (!builder.data) return <main className="grid min-h-screen place-items-center bg-[#070b14] px-4"><div className="text-center"><p className="font-display text-2xl font-semibold text-white">Profile not found</p><Link href="/onboarding" className="primary-button mt-6">Create a Profile</Link></div></main>;

  const { profile, nodes, connections } = builder.data;
  const saveDetails = () => updateProfile.mutate({ profileId, displayName, bio: bio || undefined, location: location || undefined, websiteUrl: websiteUrl || "" });
  const addNode = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const index = nodes.length;
    const positions = [[20, 28], [80, 28], [18, 73], [80, 73], [50, 18], [50, 82]];
    const [positionX, positionY] = positions[index % positions.length];
    createNode.mutate({ profileId, type: nodeType, title: nodeTitle, subtitle: nodeSubtitle || undefined, description: nodeDescription || undefined, targetUrl: nodeUrl || "", positionX, positionY });
  };

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <header className="sticky top-0 z-30 border-b border-white/[.07] bg-[#070b14]/85 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"><div className="flex items-center gap-3"><Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-400 transition hover:text-cyan-100"><ArrowLeft size={14} /><span className="hidden sm:inline">Synapse</span></Link><span className="h-4 w-px bg-white/10" /><span className="font-display text-sm font-semibold text-white">Portal Builder</span></div><div className="flex items-center gap-2"><Link href={`/signals/${profileId}`} className="secondary-button !px-3 !py-2.5 !text-xs"><Send size={14} /> Signals</Link><Link href={`/network/${profileId}`} className="secondary-button !px-3 !py-2.5 !text-xs"><Network size={14} /> Network</Link><Link href={`/${profile.username}`} target="_blank" className="secondary-button !px-3 !py-2.5 !text-xs"><ExternalLink size={14} /> Preview</Link><button onClick={() => publish.mutate({ profileId, isPublished: !profile.isPublished })} disabled={publish.isPending} className={profile.isPublished ? "secondary-button !px-3 !py-2.5 !text-xs" : "primary-button !px-3 !py-2.5 !text-xs"}>{profile.isPublished ? "Unpublish" : "Publish Portal"}</button></div></div></header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:px-8">
        <aside className="rounded-2xl border border-white/[.08] bg-slate-950/35 p-4 lg:sticky lg:top-22 lg:h-fit"><div className="flex items-center gap-2 border-b border-white/[.08] pb-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-200/10 text-cyan-100"><LayoutDashboard size={17} /></span><div><p className="text-xs font-extrabold text-white">{profile.displayName}</p><p className="mt-0.5 text-[10px] font-bold text-slate-600">@{profile.username}</p></div></div><div className="mt-4 space-y-1 text-xs font-bold"><button className="flex w-full items-center gap-2 rounded-lg bg-cyan-300/[.1] px-3 py-2.5 text-cyan-100"><Sparkles size={15} /> Portal setup</button><button className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-slate-500 hover:bg-white/[.03]"><Globe2 size={15} /> Theme: Atlas</button><button className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-slate-500 hover:bg-white/[.03]"><Send size={15} /> Signals <span className="ml-auto rounded bg-white/[.05] px-1.5 py-0.5 text-[9px]">Next</span></button></div><div className="mt-5 rounded-xl border border-white/[.07] bg-white/[.02] p-3 text-[11px] leading-5 text-slate-500">Your Portal is <span className={profile.isPublished ? "font-bold text-cyan-100" : "font-bold text-violet-200"}>{profile.isPublished ? "live" : "a draft"}</span>. Only published Profiles can follow or Connect.</div></aside>
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/[.09] bg-[linear-gradient(145deg,rgba(17,29,52,.84),rgba(8,12,23,.9))] p-5 sm:p-7"><div className="flex flex-col gap-4 border-b border-white/[.08] pb-5 sm:flex-row sm:items-center sm:justify-between"><div><span className="eyebrow">Profile root node</span><h1 className="font-display mt-3 text-2xl font-semibold tracking-[-.05em] text-white">Who does this Portal represent?</h1></div><span className="rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.13em] text-slate-500">{profile.type}</span></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold text-slate-300">Display name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/45 px-3 text-sm text-white outline-none focus:border-cyan-200/50" /></label><label className="text-xs font-bold text-slate-300">Location<input value={location} onChange={(event) => setLocation(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/45 px-3 text-sm text-white outline-none focus:border-cyan-200/50" /></label><label className="text-xs font-bold text-slate-300 sm:col-span-2">Short biography<input value={bio} onChange={(event) => setBio(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/45 px-3 text-sm text-white outline-none focus:border-cyan-200/50" /></label><label className="text-xs font-bold text-slate-300 sm:col-span-2">Website <span className="font-medium text-slate-600">optional</span><input value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://example.com" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/45 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/50" /></label></div><button onClick={saveDetails} disabled={updateProfile.isPending} className="secondary-button mt-5 !px-4 !py-2.5 !text-xs"><Save size={14} /> {updateProfile.isPending ? "Saving…" : "Save details"}</button></section>

          <section className="rounded-2xl border border-white/[.09] bg-slate-950/30 p-5 sm:p-7"><div className="flex flex-col gap-3 border-b border-white/[.08] pb-5 sm:flex-row sm:items-center sm:justify-between"><div><span className="eyebrow">Connected Nodes</span><h2 className="font-display mt-3 text-2xl font-semibold tracking-[-.05em] text-white">Map what surrounds this identity.</h2><p className="mt-2 text-sm leading-6 text-slate-500">Each Node is a reusable identity object—never just a button in a list.</p></div><button onClick={() => setShowNodeForm((current) => !current)} className="primary-button !px-4 !py-2.5 !text-xs"><Plus size={14} /> Add Node</button></div>
            {showNodeForm && <form onSubmit={addNode} className="mt-5 rounded-xl border border-cyan-200/20 bg-cyan-300/[.04] p-4"><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold text-slate-300">Node type<select value={nodeType} onChange={(event) => setNodeType(event.target.value as NodeType)} className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/65 px-3 text-xs text-white outline-none">{nodeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-xs font-bold text-slate-300">Title<input required value={nodeTitle} onChange={(event) => setNodeTitle(event.target.value)} placeholder="North Star Studio" className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/65 px-3 text-xs text-white outline-none placeholder:text-slate-600" /></label><label className="text-xs font-bold text-slate-300">Subtitle <span className="font-medium text-slate-600">optional</span><input value={nodeSubtitle} onChange={(event) => setNodeSubtitle(event.target.value)} placeholder="Creative studio" className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/65 px-3 text-xs text-white outline-none placeholder:text-slate-600" /></label><label className="text-xs font-bold text-slate-300">Destination URL <span className="font-medium text-slate-600">optional</span><input value={nodeUrl} onChange={(event) => setNodeUrl(event.target.value)} placeholder="https://…" className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/65 px-3 text-xs text-white outline-none placeholder:text-slate-600" /></label><label className="text-xs font-bold text-slate-300 sm:col-span-2">Node context <span className="font-medium text-slate-600">optional</span><input value={nodeDescription} onChange={(event) => setNodeDescription(event.target.value)} placeholder="Give visitors a reason to explore this connection." className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/65 px-3 text-xs text-white outline-none placeholder:text-slate-600" /></label></div><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setShowNodeForm(false)} className="secondary-button !px-3 !py-2.5 !text-xs">Cancel</button><button disabled={createNode.isPending} className="primary-button !px-3 !py-2.5 !text-xs">{createNode.isPending ? "Adding…" : "Add to Portal"}</button></div></form>}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">{nodes.map((node) => <div key={node.id} className="rounded-xl border border-white/[.08] bg-white/[.02] p-4"><div className="flex items-start justify-between gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-200/[.08] text-cyan-100"><Network size={16} /></span><span className="rounded-full border border-white/[.08] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[.12em] text-slate-600">{node.type}</span></div><p className="mt-4 text-sm font-bold text-white">{node.title}</p><p className="mt-1 text-xs text-slate-500">{node.subtitle || "No subtitle"}</p></div>)}{nodes.length === 0 && <div className="rounded-xl border border-dashed border-white/[.13] p-7 text-center sm:col-span-2"><Network className="mx-auto text-slate-600" size={24} /><p className="mt-3 text-sm font-bold text-slate-300">Your Portal begins at the root.</p><p className="mt-1 text-xs text-slate-600">Add your first Node to reveal the map.</p></div>}</div></section>
          <NodeGraphEditor profileId={profileId} nodes={nodes} connections={connections} onChange={refresh} />
          <section className="rounded-2xl border border-white/[.09] bg-white/[.02] p-5"><div className="flex items-center justify-between"><div><p className="font-display text-lg font-semibold text-white">Publish when the map feels true.</p><p className="mt-1 text-xs leading-5 text-slate-500">{connections.length} Node relationships are now modeled. Drag Nodes in the Graph Editor and create direct relationship paths as the Portal evolves.</p></div><button onClick={() => publish.mutate({ profileId, isPublished: !profile.isPublished })} className={profile.isPublished ? "secondary-button !px-3 !py-2.5 !text-xs" : "primary-button !px-3 !py-2.5 !text-xs"}>{profile.isPublished ? "Unpublish" : "Publish"}</button></div></section>
        </div>
      </div>
    </main>
  );
}
