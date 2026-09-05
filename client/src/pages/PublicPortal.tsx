import { Link, useRoute } from "wouter";
import { ArrowLeft, Bell, Network, Search } from "lucide-react";
import PortalGraph from "@/components/PortalGraph";

export default function PublicPortal() {
  const [, params] = useRoute("/:username");
  const username = params?.username || "alex";

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <header className="sticky top-0 z-30 border-b border-white/[.07] bg-[#070b14]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/" className="flex items-center gap-2.5" aria-label="Synapse home"><span className="grid h-8 w-8 place-items-center rounded-xl border border-cyan-200/25 bg-cyan-200/10 text-cyan-100"><Network size={17} /></span><span className="font-display hidden text-base font-semibold tracking-[-.04em] text-white sm:block">synapse</span></Link>
            <span className="h-5 w-px bg-white/10" />
            <Link href="/" className="flex items-center gap-1.5 text-xs font-bold text-slate-400 transition hover:text-cyan-100"><ArrowLeft size={14} /> Discover</Link>
          </div>
          <div className="hidden items-center gap-5 text-xs font-bold text-slate-400 md:flex"><button className="flex items-center gap-2 hover:text-cyan-100"><Search size={15} /> Explore</button><Link href="/join" className="hover:text-cyan-100">Join Synapse</Link></div>
          <Link href="/join" className="secondary-button !rounded-full !px-3.5 !py-2.5 !text-xs"><Bell size={14} /> Join</Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/[.07] bg-[radial-gradient(ellipse_55%_120%_at_70%_0%,rgba(86,83,226,.18),transparent_60%)]">
        <div className="mx-auto max-w-7xl px-4 pb-7 pt-10 sm:px-6 lg:px-8 lg:pb-9 lg:pt-14">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-[1.25rem] border border-cyan-200/30 bg-gradient-to-br from-cyan-100 via-sky-300 to-violet-400 font-display text-lg font-bold tracking-[-.08em] text-[#07101f] shadow-[0_0_34px_rgba(119,230,251,.2)]">AR</div><div><div className="mb-1 flex items-center gap-2"><p className="font-display text-2xl font-semibold tracking-[-.05em] text-white">Alex Revwoods</p><span className="h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_12px_#77e6fb]" title="Active Portal" /></div><p className="text-sm font-medium text-slate-400">@{username} · Filmmaker & founder · Toronto</p></div></div>
            <div className="flex gap-2"><Link href="/join" className="primary-button !px-4 !py-3 !text-xs">Follow</Link><Link href="/join" className="secondary-button !px-4 !py-3 !text-xs">Connect</Link></div>
          </div>
          <div className="mt-7 flex gap-6 overflow-x-auto text-xs font-bold"><span className="border-b-2 border-cyan-200 pb-3 text-cyan-100">Portal</span><span className="pb-3 text-slate-500">Feed</span><span className="pb-3 text-slate-500">About</span><span className="pb-3 text-slate-500">Network</span></div>
        </div>
      </section>

      <PortalGraph />
    </main>
  );
}
