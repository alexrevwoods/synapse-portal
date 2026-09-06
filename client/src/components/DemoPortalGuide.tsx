import { useState } from "react";
import { Compass, MessageCircle, MousePointer2, X } from "lucide-react";

const steps = [
  { icon: MousePointer2, title: "Explore the map", description: "Tap a glowing Node to see its context. Tap the map again to return and continue exploring." },
  { icon: MessageCircle, title: "Follow the Signals", description: "Scroll below the map to see public updates. Signals make a Portal feel alive without turning it into an algorithmic feed." },
];

export default function DemoPortalGuide() {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(true);
  if (!open) return null;
  const current = steps[step];
  const Icon = current.icon;
  return <aside aria-label="Demo Portal guide" className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-sm rounded-2xl border border-cyan-200/25 bg-[#0a1525]/95 p-4 shadow-[0_20px_52px_rgba(0,0,0,.52)] backdrop-blur-xl sm:left-auto sm:right-6"><button onClick={() => setOpen(false)} aria-label="Close demo guide" className="absolute right-3 top-3 text-slate-500 transition hover:text-white"><X size={16} /></button><div className="flex gap-3 pr-6"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-cyan-200/20 bg-cyan-300/[.09] text-cyan-100"><Icon size={18} /></span><div><p className="text-[10px] font-extrabold uppercase tracking-[.13em] text-cyan-100">Live demo · {step + 1} of {steps.length}</p><p className="mt-1 text-sm font-bold text-white">{current.title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{current.description}</p></div></div><div className="mt-4 flex items-center justify-between"><span className="flex gap-1.5">{steps.map((_, index) => <span key={index} className={`h-1.5 w-1.5 rounded-full ${index === step ? "bg-cyan-200" : "bg-white/15"}`} />)}</span><button onClick={() => step === steps.length - 1 ? setOpen(false) : setStep((value) => value + 1)} className="flex items-center gap-1.5 text-xs font-bold text-cyan-100 hover:text-cyan-50">{step === steps.length - 1 ? "Start exploring" : "Next"} <Compass size={14} /></button></div></aside>;
}
