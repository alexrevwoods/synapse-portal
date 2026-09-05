import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Check, Network, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

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
  const createProfile = trpc.profile.create.useMutation({
    onSuccess: (profile) => {
      toast.success("Identity created. Now shape the Portal around it.");
      navigate(`/builder/${profile.id}`);
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createProfile.mutate({ username, displayName, type, bio: bio || undefined, location: location || undefined });
  };

  if (loading) return <main className="min-h-screen bg-[#070b14]" />;
  if (!isAuthenticated) {
    return <main className="grid min-h-screen place-items-center bg-[#070b14] px-4"><div className="max-w-md rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-cyan-200/10 text-cyan-100"><Network /></span><h1 className="font-display mt-5 text-2xl font-semibold text-white">Build your Synapse</h1><p className="mt-3 text-sm leading-6 text-slate-400">Create an account to establish the Profile that will own your public Portal.</p><button onClick={() => startLogin()} className="primary-button mt-7 w-full">Continue to sign in <ArrowRight size={16} /></button><Link href="/" className="mt-5 inline-flex text-xs font-bold text-slate-500 hover:text-cyan-100">Back to discovery</Link></div></main>;
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <header className="border-b border-white/[.07]"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"><Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-400 transition hover:text-cyan-100"><ArrowLeft size={14} /> Back to Synapse</Link><div className="flex items-center gap-2 font-display text-sm font-semibold"><span className="grid h-7 w-7 place-items-center rounded-lg border border-cyan-200/25 bg-cyan-200/10 text-cyan-100"><Network size={15} /></span> synapse</div></div></header>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[.82fr_1.18fr] lg:items-start lg:py-20">
        <aside className="lg:sticky lg:top-10"><span className="eyebrow"><span className="signal-dot" /> Profile foundation</span><h1 className="font-display mt-6 text-4xl font-semibold tracking-[-.06em] text-white">Start with the identity you want people to explore.</h1><p className="mt-5 max-w-md text-sm leading-7 text-slate-400">An Account pays and logs in. A Profile is the person, business, or project that gets its own Portal, Nodes, Signals, and Network.</p><div className="mt-8 space-y-4 border-l border-white/10 pl-5 text-xs"><p className="font-bold text-cyan-100"><span className="mr-2 text-cyan-200">01</span> Establish the Profile</p><p className="font-semibold text-slate-500"><span className="mr-2">02</span> Add connected Nodes</p><p className="font-semibold text-slate-500"><span className="mr-2">03</span> Publish your Portal</p></div></aside>
        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/[.1] bg-[linear-gradient(145deg,rgba(18,29,51,.9),rgba(8,12,23,.94))] p-5 shadow-[0_25px_70px_rgba(0,0,0,.22)] sm:p-8">
          <div className="flex items-center gap-3 border-b border-white/[.08] pb-6"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-300/10 text-violet-200"><Sparkles size={19} /></span><div><p className="font-display font-semibold text-white">Your first Profile</p><p className="mt-0.5 text-xs text-slate-500">This can represent you or something you&apos;re building.</p></div></div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2"><label className="text-xs font-bold text-slate-300">Display name<input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Alex Revwoods" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/45 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/50" /></label><label className="text-xs font-bold text-slate-300">Synapse handle<div className="mt-2 flex h-11 items-center rounded-xl border border-white/10 bg-slate-950/45 px-3 focus-within:border-cyan-200/50"><span className="text-sm font-bold text-slate-500">@</span><input required value={username} onChange={(event) => setUsername(event.target.value.replace(/^@/, "").replace(/\s/g, ""))} placeholder="alex" className="min-w-0 flex-1 bg-transparent pl-1 text-sm text-white outline-none placeholder:text-slate-600" /></div><span className="mt-1.5 block text-[10px] font-medium text-slate-600">Letters, numbers, and underscores only.</span></label></div>
          <fieldset className="mt-6"><legend className="text-xs font-bold text-slate-300">What is this identity?</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{profileTypes.map(([value, label, description]) => <button type="button" key={value} onClick={() => setType(value)} className={`rounded-xl border p-3 text-left transition ${type === value ? "border-cyan-200/50 bg-cyan-300/[.08]" : "border-white/[.08] bg-white/[.02] hover:border-white/20"}`}><span className="flex items-center justify-between text-xs font-extrabold text-white">{label}{type === value && <Check size={14} className="text-cyan-200" />}</span><span className="mt-1.5 block text-[10px] leading-4 text-slate-500">{description}</span></button>)}</div></fieldset>
          <div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="text-xs font-bold text-slate-300">Location <span className="font-medium text-slate-600">optional</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Toronto, Canada" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/45 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/50" /></label><label className="text-xs font-bold text-slate-300">Short bio <span className="font-medium text-slate-600">optional</span><input value={bio} onChange={(event) => setBio(event.target.value)} placeholder="What should people know?" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/45 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/50" /></label></div>
          <button disabled={createProfile.isPending} className="primary-button mt-8 w-full disabled:cursor-not-allowed disabled:opacity-60">{createProfile.isPending ? "Creating identity…" : "Create Profile and build Portal"} <ArrowRight size={16} /></button>
        </form>
      </div>
    </main>
  );
}
