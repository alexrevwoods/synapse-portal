import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Check, Network, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import NeuralAccessLogin from "@/components/ui/neural-access-login";
import { trpc } from "@/lib/trpc";
import { INTERESTS, type InterestKey } from "@shared/interests";

const profileTypes = [
  ["personal", "Personal", "A person and everything connected to them."],
  ["creator", "Creator", "An artist, maker, writer, or independent voice."],
  ["business", "Business", "A company, brand, studio, or service."],
  ["organization", "Organization", "A community, non-profit, or collective."],
  ["project", "Project", "A product, initiative, or idea in motion."],
] as const;

type ProfileType = (typeof profileTypes)[number][0];

export default function Onboarding() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [type, setType] = useState<ProfileType>("creator");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState<InterestKey[]>([]);
  const existingProfiles = trpc.profile.my.useQuery(undefined, { enabled: isAuthenticated });
  const createProfile = trpc.profile.create.useMutation({
    onSuccess: (profile) => {
      toast.success("Identity created. Now shape the Portal around it.");
      navigate(`/builder/${profile.id}`);
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createProfile.mutate({ username, displayName, type, bio: bio || undefined, location: location || undefined, interests });
  };

  if (loading) return <main className="min-h-screen bg-[#070b14]" />;
  if (!isAuthenticated) {
    return <NeuralAccessLogin nextPath="/onboarding" mode="create" />;
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <header className="border-b border-white/[.07]"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"><Link href="/account" className="flex items-center gap-2 text-xs font-bold text-slate-400 transition hover:text-cyan-100"><ArrowLeft size={14} /> My Portals</Link><div className="flex items-center gap-2 font-display text-sm font-semibold"><span className="grid h-7 w-7 place-items-center rounded-lg border border-cyan-200/25 bg-cyan-200/10 text-cyan-100"><Network size={15} /></span> synapse</div></div></header>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[.82fr_1.18fr] lg:items-start lg:py-20">
        <aside className="lg:sticky lg:top-10"><span className="eyebrow"><span className="signal-dot" /> Profile foundation</span><h1 className="font-display mt-6 text-4xl font-semibold tracking-[-.06em] text-white">{existingProfiles.data?.length ? "Add another identity." : "Start with the identity you want people to explore."}</h1><p className="mt-5 max-w-md text-sm leading-7 text-slate-400">A free Account securely logs you in. A Profile is the person, business, or project that gets its own Portal, Nodes, Signals, and Network.</p>{existingProfiles.data?.length ? <div className="mt-6 rounded-xl border border-cyan-200/20 bg-cyan-300/[.05] p-4 text-xs leading-5 text-slate-400"><span className="font-bold text-cyan-100">Existing Profiles stay safe.</span> You already have {existingProfiles.data.length} {existingProfiles.data.length === 1 ? "Portal" : "Portals"} under this Account. This form creates a separate identity with a different handle.</div> : null}<div className="mt-8 space-y-4 border-l border-white/10 pl-5 text-xs"><p className="font-bold text-cyan-100"><span className="mr-2 text-cyan-200">01</span> Establish the Profile</p><p className="font-semibold text-slate-500"><span className="mr-2">02</span> Add connected Nodes</p><p className="font-semibold text-slate-500"><span className="mr-2">03</span> Publish your Portal</p></div></aside>
        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/[.1] bg-[linear-gradient(145deg,rgba(18,29,51,.9),rgba(8,12,23,.94))] p-5 shadow-[0_25px_70px_rgba(0,0,0,.22)] sm:p-8">
          <div className="flex items-center gap-3 border-b border-white/[.08] pb-6"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-300/10 text-violet-200"><Sparkles size={19} /></span><div><p className="font-display font-semibold text-white">{existingProfiles.data?.length ? "A new Profile" : "Your first Profile"}</p><p className="mt-0.5 text-xs text-slate-500">This can represent you or something you&apos;re building.</p></div></div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2"><label className="text-xs font-bold text-slate-300">Display name<input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Alex Revwoods" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/45 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/50" /></label><label className="text-xs font-bold text-slate-300">Synapse handle<div className="mt-2 flex h-11 items-center rounded-xl border border-white/10 bg-slate-950/45 px-3 focus-within:border-cyan-200/50"><span className="text-sm font-bold text-slate-500">@</span><input required value={username} onChange={(event) => setUsername(event.target.value.replace(/^@/, "").replace(/\s/g, ""))} placeholder="alex" className="min-w-0 flex-1 bg-transparent pl-1 text-sm text-white outline-none placeholder:text-slate-600" /></div><span className="mt-1.5 block text-[10px] font-medium text-slate-600">Letters, numbers, and underscores only.</span></label></div>
          <fieldset className="mt-6"><legend className="text-xs font-bold text-slate-300">What is this identity?</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{profileTypes.map(([value, label, description]) => <button type="button" key={value} onClick={() => setType(value)} className={`rounded-xl border p-3 text-left transition ${type === value ? "border-cyan-200/50 bg-cyan-300/[.08]" : "border-white/[.08] bg-white/[.02] hover:border-white/20"}`}><span className="flex items-center justify-between text-xs font-extrabold text-white">{label}{type === value && <Check size={14} className="text-cyan-200" />}</span><span className="mt-1.5 block text-[10px] leading-4 text-slate-500">{description}</span></button>)}</div></fieldset>
          <fieldset className="mt-6"><legend className="flex items-center justify-between gap-3 text-xs font-bold text-slate-300"><span>What are you here for? <span className="font-medium text-slate-600">optional</span></span><span className="text-[10px] font-medium text-slate-600">{interests.length}/6</span></legend><p className="mt-1.5 text-[11px] leading-5 text-slate-500">Pick a few interests to receive transparent, shared-interest follow suggestions in Discover. This never changes the public Profile.</p><div className="mt-3 flex flex-wrap gap-2">{INTERESTS.map((interest) => { const selected = interests.includes(interest.key); const unavailable = !selected && interests.length >= 6; return <button type="button" key={interest.key} disabled={unavailable} onClick={() => setInterests((current) => selected ? current.filter((key) => key !== interest.key) : [...current, interest.key])} className={`rounded-full border px-3 py-2 text-[11px] font-bold transition disabled:cursor-not-allowed disabled:opacity-35 ${selected ? "border-violet-200/45 bg-violet-300/[.12] text-violet-100" : "border-white/[.09] bg-white/[.025] text-slate-400 hover:border-white/20 hover:text-slate-200"}`}>{selected && <Check size={12} className="mr-1 inline-block" />}{interest.label}</button>; })}</div></fieldset>
          <div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="text-xs font-bold text-slate-300">Location <span className="font-medium text-slate-600">optional</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Toronto, Canada" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/45 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/50" /></label><label className="text-xs font-bold text-slate-300">Short bio <span className="font-medium text-slate-600">optional</span><input value={bio} onChange={(event) => setBio(event.target.value)} placeholder="What should people know?" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/45 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/50" /></label></div>
          <button disabled={createProfile.isPending} className="primary-button mt-8 w-full disabled:cursor-not-allowed disabled:opacity-60">{createProfile.isPending ? "Creating identity…" : "Create free Profile and build Portal"} <ArrowRight size={16} /></button>
        </form>
      </div>
    </main>
  );
}
