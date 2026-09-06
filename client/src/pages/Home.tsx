import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Check, Compass, GitFork, Layers3, Network, Sparkles, UsersRound } from "lucide-react";
import HolographicCard from "@/components/HolographicCard";
import InteractiveSynapseNetwork from "@/components/InteractiveSynapseNetwork";
import HomeSkinPicker from "@/components/HomeSkinPicker";
import SynapseMark from "@/components/SynapseMark";
import { useAuth } from "@/_core/hooks/useAuth";
import { getGuestSkin } from "@/lib/skins";
import { trpc } from "@/lib/trpc";

const principles = [
  {
    icon: GitFork,
    label: "Portals acquire",
    description: "A public, interactive identity that makes people want to explore what you do.",
  },
  {
    icon: UsersRound,
    label: "Networks retain",
    description: "Purposeful follows and Connections turn discovery into a lasting social graph.",
  },
  {
    icon: Layers3,
    label: "Signals make it live",
    description: "Publish thoughtful updates without surrendering your audience to an algorithm.",
  },
];

const plans = [
  { name: "Free Core", price: "Free", note: "One identity, intentionally built.", features: ["1 Profile", "Public Portal", "Signals, Follow & Connect", "6 included Skins"] },
  { name: "Pulse", price: "Later", note: "For people shaping several worlds.", features: ["Up to 3 Profiles", "9 included Skins", "Scheduled Signals & Nodes", "Advanced customization"], featured: true },
  { name: "Nexus", price: "Later", note: "The full surface area of your network.", features: ["Up to 5 Profiles", "12 Skins + Brand Studio", "Custom-domain setup", "Advanced Path Analytics"] },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [guestSkin, setGuestSkin] = useState(() => getGuestSkin());
  const demo = trpc.platform.demo.useQuery();
  const demoProfile = demo.data?.profile;
  const demoPath = demoProfile ? `/${demoProfile.username}` : "/mediarevolution";
  const demoInitials = demoProfile?.displayName.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "MR";

  useEffect(() => {
    if (!isAuthenticated) return;
    const nextPath = window.sessionStorage.getItem("synapse-post-login");
    if (!nextPath) return;
    window.sessionStorage.removeItem("synapse-post-login");
    navigate(nextPath);
  }, [isAuthenticated, navigate]);

  return (
    <main className="page-shell min-h-screen bg-[#070b14]">
      <div className="grid-noise" />
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Synapse home">
          <SynapseMark />
        </Link>
        <nav className="hidden items-center gap-7 text-xs font-bold text-slate-400 md:flex">
          <Link href="/discover" className="transition hover:text-cyan-100">Discover</Link>
          <a href="#membership" className="transition hover:text-cyan-100">Membership</a>
          <Link href={demoPath} className="transition hover:text-cyan-100">Explore a Portal</Link>
        </nav>
        {isAuthenticated ? <Link href="/account" className="secondary-button !rounded-full !px-4 !py-2.5 !text-xs">My Portals</Link> : <div className="flex items-center gap-3"><Link href="/access?next=/account" className="hidden text-xs font-bold text-slate-400 transition hover:text-cyan-100 sm:block">Sign in</Link><Link href="/join" className="secondary-button !rounded-full !px-4 !py-2.5 !text-xs">Join Synapse</Link></div>}
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.03fr_.97fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-24">
        <div className="max-w-2xl">
          <span className="eyebrow"><span className="signal-dot" /> An intentional social identity network</span>
          <h1 className="font-display mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl lg:text-[4.2rem] lg:leading-[1.02]">
            Your internet presence isn&apos;t a list. <span className="bg-gradient-to-r from-cyan-200 via-sky-300 to-violet-300 bg-clip-text text-transparent">It&apos;s a network.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base font-medium leading-7 text-slate-400 sm:text-lg">
            Build an identity people can explore. Connect your work, projects, places, and people—then participate in a social layer built around real relationships.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={isAuthenticated ? "/account" : "/join"} className="primary-button">{isAuthenticated ? "Open My Portals" : "Create free Account"} <ArrowRight size={16} /></Link>
            <Link href={demoPath} className="secondary-button">Explore a live Portal <Compass size={16} /></Link>
          </div>
          <Link href={demoPath} className="mt-3 flex w-fit max-w-full items-center gap-3 rounded-xl border border-cyan-200/16 bg-cyan-300/[.045] px-3 py-2.5 transition hover:border-cyan-200/35 hover:bg-cyan-300/[.08]">
            <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-cyan-200/25 bg-gradient-to-br from-cyan-200 via-sky-300 to-violet-400 text-[10px] font-extrabold text-[#07101f]">{demoProfile?.avatarUrl ? <img src={demoProfile.avatarUrl} alt="" className="h-full w-full object-cover" /> : demoInitials}</span>
            <span className="min-w-0"><span className="block text-[9px] font-extrabold uppercase tracking-[.14em] text-cyan-100">Featured demo Portal</span><span className="mt-0.5 block truncate text-xs font-bold text-white">{demoProfile?.displayName || "Media Revolution"} <span className="font-medium text-slate-500">· @{demoProfile?.username || "mediarevolution"}</span></span></span>
            <Compass size={15} className="shrink-0 text-cyan-100" />
          </Link>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-2"><Check size={14} className="text-cyan-200" /> Create an Account free</span>
            <span className="flex items-center gap-2"><Check size={14} className="text-cyan-200" /> No card or payment details</span>
            <span className="flex items-center gap-2"><Check size={14} className="text-cyan-200" /> No ads. No attention traps.</span>
          </div>
          {isAuthenticated ? <Link href="/skins" className="mt-8 inline-flex items-center gap-2 text-xs font-bold text-cyan-100 transition hover:text-cyan-50">Shape your full platform Skin <ArrowRight size={14} /></Link> : <HomeSkinPicker activeSkin={guestSkin} onChange={setGuestSkin} />}
        </div>

        <InteractiveSynapseNetwork className="min-h-[390px] overflow-visible sm:min-h-[455px]">
          <div className="absolute inset-8 rounded-[2rem] border border-cyan-100/[0.11] bg-[radial-gradient(circle_at_68%_25%,rgba(103,92,246,.25),transparent_25%),linear-gradient(145deg,rgba(17,30,56,.85),rgba(7,11,20,.5))] shadow-[0_32px_90px_rgba(0,0,0,.34)]" />
          <div className="absolute left-[11%] top-[17%] h-11 w-11 rounded-full border border-cyan-100/30 bg-cyan-300/10 shadow-[0_0_30px_rgba(119,230,251,.28)]" />
          <div className="absolute right-[14%] top-[16%] h-20 w-20 rounded-3xl border border-violet-200/20 bg-violet-300/10" />
          <div className="absolute bottom-[14%] left-[13%] h-14 w-14 rounded-2xl border border-cyan-100/20 bg-sky-400/10" />
          <div className="absolute bottom-[11%] right-[13%] h-12 w-12 rounded-full border border-violet-200/25 bg-violet-300/10" />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 460" preserveAspectRatio="none" aria-hidden="true">
            <path d="M105 105 L300 225 L490 90 M300 225 L125 370 M300 225 L485 370" fill="none" stroke="rgba(124,212,251,.34)" strokeWidth="1" strokeDasharray="4 6" />
            <circle cx="300" cy="225" r="8" fill="#baf2ff" opacity=".9" />
          </svg>
          <HolographicCard className="absolute left-1/2 top-1/2 w-[13.5rem] -translate-x-1/2 -translate-y-1/2 p-4 sm:w-[16rem] sm:p-5">
            <div className="flex items-center justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-200 to-violet-400 text-[#07101f]"><Sparkles size={17} /></span>
              <span className="text-[9px] font-extrabold uppercase tracking-[.15em] text-cyan-100/55">Your Portal</span>
            </div>
            <p className="font-display mt-6 text-xl font-semibold tracking-tight text-white">Everything that makes you, you.</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">A clear map of the people, work, ideas, and moments connected to your identity.</p>
            <div className="mt-5 flex items-center gap-2 text-[10px] font-bold text-cyan-100"><span className="signal-dot !h-1.5 !w-1.5" /> 12 active nodes</div>
          </HolographicCard>
        </InteractiveSynapseNetwork>
      </section>

      <section id="model" className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-xl"><span className="eyebrow">Built for an intentional internet</span><h2 className="font-display mt-5 text-3xl font-semibold tracking-[-.05em] text-white sm:text-4xl">One system. Three connected layers.</h2></div>
          <p className="max-w-sm text-sm leading-6 text-slate-500">The Portal makes identity explorable. The Profile makes it social. The Network makes it valuable over time.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {principles.map(({ icon: Icon, label, description }, index) => (
            <HolographicCard key={label} className="p-6">
              <span className="mb-10 flex text-xs font-extrabold tracking-[.14em] text-slate-600">0{index + 1}</span>
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[.035] text-cyan-100"><Icon size={20} /></span>
              <h3 className="font-display mt-6 text-xl font-semibold text-white">{label}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
            </HolographicCard>
          ))}
        </div>
      </section>

      <section className="relative z-10 border-y border-white/[0.07] bg-slate-950/25">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[.82fr_1.18fr] lg:items-center lg:px-8 lg:py-24">
          <div><span className="eyebrow">Discovery first</span><h2 className="font-display mt-5 text-3xl font-semibold tracking-[-.05em] text-white sm:text-4xl">The Portal acquires. The Network retains.</h2><p className="mt-5 max-w-md text-sm leading-7 text-slate-400">A stranger can immediately understand and explore a public identity. When they want to follow, Connect, react, or publish, Synapse invites them to become an intentional participant.</p><Link href={demoPath} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-cyan-100 transition hover:gap-3">See the Portal experience <ArrowRight size={16} /></Link></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Account", "Profile", "Portal", "Nodes", "Signals", "Network"].map((item, index) => <div key={item} className={`rounded-2xl border p-5 ${index === 2 || index === 5 ? "border-cyan-200/25 bg-cyan-300/[.07]" : "border-white/[.08] bg-white/[.02]"}`}><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-600">0{index + 1}</p><p className="font-display mt-5 text-lg font-semibold text-white">{item}</p><p className="mt-1 text-xs leading-5 text-slate-500">{["The secure sign-in that owns your Profiles.", "The identity being represented.", "The public interactive layer.", "Everything connected to identity.", "What the identity publishes.", "The relationship system."][index]}</p></div>)}
          </div>
        </div>
      </section>

      <section id="membership" className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center"><span className="eyebrow">Start with your identity</span><h2 className="font-display mt-5 text-3xl font-semibold tracking-[-.05em] text-white sm:text-4xl">Create free. Expand when you need to.</h2><p className="mt-4 text-sm leading-6 text-slate-500">Every new Account begins with Free Core—one Profile, public Portal, social participation, and six platform Skins. Paid upgrades are planned for later.</p></div>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => <HolographicCard key={plan.name} className={`pricing-tier p-6 ${plan.featured ? "pricing-tier--featured" : ""}`}><div className="flex items-center justify-between"><p className="font-display text-lg font-semibold text-white">{plan.name}</p>{plan.featured && <span className="rounded-full bg-cyan-200 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[.13em] text-[#061018]">Planned</span>}</div><p className="mt-5 font-display text-4xl font-semibold tracking-[-.05em] text-white">{plan.price}{plan.price === "Free" && <span className="ml-1 text-sm font-medium text-slate-500">to start</span>}</p><p className="mt-3 min-h-10 text-sm leading-5 text-slate-500">{plan.note}</p><ul className="mt-6 space-y-3 border-t border-white/[.09] pt-5">{plan.features.map((feature) => <li key={feature} className="flex items-center gap-2 text-xs font-semibold text-slate-300"><Check size={14} className="text-cyan-200" />{feature}</li>)}</ul><Link href="/join" className={plan.name === "Free Core" ? "primary-button mt-7 w-full" : "secondary-button mt-7 w-full"}>{plan.name === "Free Core" ? "Create free Account" : "Included later"}</Link></HolographicCard>)}
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[.07] px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 font-semibold text-slate-400"><Network size={14} className="text-cyan-200" /> Synapse · Identity, in motion.</div><div className="flex gap-5"><a href="#model" className="hover:text-slate-300">Principles</a><a href="#membership" className="hover:text-slate-300">Membership</a><Link href={demoPath} className="hover:text-slate-300">Demo Portal</Link></div></div></footer>
    </main>
  );
}
