import { type MouseEvent, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { startLogin } from "@/const";
import SynapseMark from "@/components/SynapseMark";

const blobs = [
  { size: 280, left: 8, top: 8, delay: -4, duration: 18, tone: "cyan" },
  { size: 220, left: 68, top: 14, delay: -11, duration: 22, tone: "violet" },
  { size: 250, left: 22, top: 63, delay: -8, duration: 20, tone: "lime" },
  { size: 190, left: 76, top: 66, delay: -15, duration: 24, tone: "cyan" },
  { size: 155, left: 48, top: 38, delay: -19, duration: 17, tone: "violet" },
  { size: 130, left: 5, top: 42, delay: -6, duration: 21, tone: "lime" },
] as const;

export default function NeuralAccessLogin({ nextPath = "/account", mode = "signin", className }: { nextPath?: string; mode?: "signin" | "create"; className?: string }) {
  const [identity, setIdentity] = useState("");
  const hostRef = useRef<HTMLDivElement>(null);
  const actionLabel = mode === "create" ? "Create free Account" : "Open My Portals";
  const beginAccess = () => { window.sessionStorage.setItem("synapse-post-login", nextPath); startLogin(); };
  const handlePointer = (event: MouseEvent<HTMLDivElement>) => { const host = hostRef.current; if (!host) return; const bounds = host.getBoundingClientRect(); host.style.setProperty("--pointer-x", `${((event.clientX - bounds.left) / bounds.width) * 100}%`); host.style.setProperty("--pointer-y", `${((event.clientY - bounds.top) / bounds.height) * 100}%`); };
  const helper = useMemo(() => mode === "create" ? "Start your Account with secure Synapse access—no card or password required." : "Use the same secure identity that created your existing Portals.", [mode]);
  return <main ref={hostRef} onMouseMove={handlePointer} className={cn("neural-access min-h-screen", className)}><svg aria-hidden="true" className="absolute h-0 w-0"><defs><filter id="neural-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" /><feComposite in="SourceGraphic" in2="goo" operator="atop" /></filter></defs></svg><div className="neural-access__stage" aria-hidden="true">{blobs.map((blob, index) => <span key={index} className={`neural-access__blob neural-access__blob--${blob.tone}`} style={{ width: blob.size, height: blob.size, left: `${blob.left}%`, top: `${blob.top}%`, animationDelay: `${blob.delay}s`, animationDuration: `${blob.duration}s` }} />)}</div><section className="neural-access__panel"><div className="flex items-center justify-between"><SynapseMark /><span className="rounded-full border border-white/10 bg-white/[.035] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[.14em] text-slate-400">Secure identity</span></div><header className="mt-14"><span className="font-mono text-[10px] font-bold uppercase tracking-[.32em] text-cyan-100/65">System node · Synapse</span><h1 className="font-display mt-4 text-5xl font-semibold leading-[.86] tracking-[-.075em] text-white sm:text-6xl">NEURAL<br />ACCESS</h1><p className="mt-6 max-w-sm text-sm leading-6 text-slate-400">{helper}</p></header><form className="mt-12" onSubmit={(event) => { event.preventDefault(); beginAccess(); }}><label className="neural-access__field"><span>Synapse identity <em>optional</em></span><input value={identity} onChange={(event) => setIdentity(event.target.value)} autoComplete="username" placeholder="email or @handle" /><i /></label><div className="mt-5 flex items-start gap-2.5 text-xs leading-5 text-slate-500"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-cyan-100" />Your sign-in continues through your secure Manus session. Synapse never sees or stores a password.</div><div className="neural-access__submit-wrap"><span className="neural-access__mercury" aria-hidden="true" /><button type="submit" className="neural-access__submit"><LockKeyhole size={16} /> {actionLabel} <ArrowRight size={16} /></button></div></form><footer className="mt-10 flex items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-[.1em] text-slate-500"><a href="/" className="transition hover:text-cyan-100">Return to discover</a><a href="/join" className="inline-flex items-center gap-1 transition hover:text-cyan-100">New identity <ArrowUpRight size={12} /></a></footer></section></main>;
}
