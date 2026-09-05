import { Check, Palette } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const themes = [
  { id: "atlas", name: "Atlas", description: "Cyan signal + violet depth", className: "from-cyan-200 via-sky-400 to-violet-400" },
  { id: "aurora", name: "Aurora", description: "Mint light + ocean blue", className: "from-emerald-200 via-cyan-300 to-blue-500" },
  { id: "nocturne", name: "Nocturne", description: "Indigo calm + electric lilac", className: "from-indigo-300 via-violet-400 to-fuchsia-400" },
  { id: "ember", name: "Ember", description: "Peach warmth + magenta energy", className: "from-amber-200 via-rose-400 to-fuchsia-500" },
] as const;

type ThemeId = (typeof themes)[number]["id"];

export default function PortalThemePicker({ profileId, currentTheme, onChange }: { profileId: number; currentTheme: string; onChange: () => void }) {
  const update = trpc.profile.update.useMutation({ onSuccess: () => { toast.success("Portal theme saved"); onChange(); }, onError: (error) => toast.error(error.message) });
  return <section className="rounded-2xl border border-white/[.09] bg-slate-950/30 p-5 sm:p-7"><div className="border-b border-white/[.08] pb-5"><span className="eyebrow"><Palette size={12} /> Visual identity</span><h2 className="font-display mt-3 text-2xl font-semibold tracking-[-.05em] text-white">Choose your Portal atmosphere.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Themes are saved to this Profile and shape the public Portal&apos;s ambient color field.</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{themes.map((theme) => <button key={theme.id} disabled={update.isPending} onClick={() => update.mutate({ profileId, portalTheme: theme.id as ThemeId })} className={`rounded-xl border p-4 text-left transition ${currentTheme === theme.id ? "border-cyan-200/45 bg-cyan-300/[.06]" : "border-white/[.08] bg-white/[.015] hover:border-white/20"}`}><span className={`flex h-10 items-center justify-between rounded-lg bg-gradient-to-r px-2.5 ${theme.className}`}><Palette size={15} className="text-[#07101f]" />{currentTheme === theme.id && <span className="grid h-5 w-5 place-items-center rounded-full bg-[#07101f]/75 text-cyan-100"><Check size={12} /></span>}</span><span className="mt-4 block text-sm font-bold text-white">{theme.name}</span><span className="mt-1 block text-[10px] leading-4 text-slate-500">{theme.description}</span></button>)}</div></section>;
}
