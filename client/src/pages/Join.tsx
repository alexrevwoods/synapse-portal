import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check, Network, ShieldCheck, Sparkles } from "lucide-react";
import { startLogin } from "@/const";

export default function Join() {
  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#070b14] px-4 py-6 sm:p-8 lg:grid-cols-[.94fr_1.06fr] lg:p-10">
      <div className="grid-noise" />
      <section className="relative z-10 flex min-h-[280px] flex-col justify-between rounded-3xl border border-white/[.09] bg-[radial-gradient(circle_at_55%_35%,rgba(104,90,246,.3),transparent_25%),linear-gradient(145deg,rgba(16,30,57,.92),rgba(8,11,21,.96))] p-6 sm:p-8 lg:min-h-full lg:p-12">
        <Link href="/" className="flex w-fit items-center gap-2 text-xs font-bold text-slate-400 transition hover:text-cyan-100"><ArrowLeft size={14} /> Back to Synapse</Link>
        <div className="max-w-md py-10 lg:py-0"><span className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-200/25 bg-cyan-200/10 text-cyan-100"><Network size={21} /></span><h1 className="font-display mt-7 text-4xl font-semibold tracking-[-.06em] text-white sm:text-5xl">Build the network around your identity.</h1><p className="mt-5 text-sm leading-7 text-slate-400">Start with a Portal people can explore. Then publish Signals, build a Timeline, and make Connections that have a reason to exist.</p></div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-400"><span className="grid h-8 w-8 place-items-center rounded-full bg-cyan-200/10 text-cyan-100"><ShieldCheck size={16} /></span> Paid participation creates a more intentional social layer.</div>
      </section>

      <section className="relative z-10 flex items-center justify-center py-10 lg:py-0"><div className="w-full max-w-md"><div className="mb-8 flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl border border-cyan-200/30 bg-cyan-200/10 text-cyan-100"><Sparkles size={16} /></span><span className="font-display text-base font-semibold tracking-[-.04em]">synapse</span></div><span className="eyebrow">7-day Nexus trial</span><h2 className="font-display mt-5 text-3xl font-semibold tracking-[-.05em] text-white">Begin with the full network.</h2><p className="mt-3 text-sm leading-6 text-slate-500">Create your account to start building. You&apos;ll choose Core, Pulse, or Nexus after the trial—there is no permanent free membership.</p><button onClick={() => startLogin()} className="primary-button mt-8 w-full">Create your Synapse <ArrowRight size={16} /></button><div className="mt-7 space-y-3 border-t border-white/[.09] pt-6">{["Build a public, interactive Portal", "Publish Signals and collect subscribers", "Follow, Connect, and form a chronological Timeline"].map((item) => <p key={item} className="flex items-start gap-2.5 text-xs font-semibold leading-5 text-slate-300"><Check size={15} className="mt-0.5 shrink-0 text-cyan-200" />{item}</p>)}</div><p className="mt-8 text-center text-[11px] leading-5 text-slate-600">By continuing, you agree to the future Synapse Terms and Community Standards.</p></div></section>
    </main>
  );
}
