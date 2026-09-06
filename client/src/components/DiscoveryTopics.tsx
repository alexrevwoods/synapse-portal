import { Compass } from "lucide-react";
import { Link } from "wouter";
import { INTERESTS } from "@shared/interests";

export default function DiscoveryTopics() {
  return <section className="mb-8 rounded-2xl border border-white/[.08] bg-white/[.018] p-4 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="flex items-center gap-2 text-xs font-bold text-slate-300"><Compass size={14} className="text-cyan-100" /> Explore by topic</p><p className="mt-1 text-[11px] text-slate-600">Open a public view of Portals and Signals connected to each interest.</p></div><Link href="/discover/technology" className="text-[11px] font-bold text-cyan-100 hover:text-cyan-50">Browse topics</Link></div><div className="mt-4 flex gap-2 overflow-x-auto pb-1">{INTERESTS.map((interest) => <Link key={interest.key} href={`/discover/${interest.key}`} className="shrink-0 rounded-full border border-white/[.09] bg-slate-950/35 px-3 py-2 text-[11px] font-bold text-slate-400 transition hover:border-violet-200/35 hover:bg-violet-300/[.08] hover:text-violet-100">{interest.label}</Link>)}</div></section>;
}
