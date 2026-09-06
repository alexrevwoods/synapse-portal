import { Bolt, Gem, Leaf, Orbit, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const options = [
  { value: "spark", label: "Spark", Icon: Sparkles },
  { value: "orbit", label: "Orbit", Icon: Orbit },
  { value: "bolt", label: "Bolt", Icon: Bolt },
  { value: "gem", label: "Gem", Icon: Gem },
  { value: "leaf", label: "Leaf", Icon: Leaf },
] as const;
const accents = ["#00D8FF", "#9B4DFF", "#7CFF3D", "#FFB85C", "#FF6F91"];

export default function PortalMapAppearance({ profileId, accentColor, icon, onChange }: { profileId: number; accentColor?: string | null; icon?: string | null; onChange: () => void }) {
  const update = trpc.profile.update.useMutation({ onSuccess: () => { toast.success("Map identity saved"); onChange(); }, onError: (error) => toast.error(error.message) });
  const selectedIcon = options.some((option) => option.value === icon) ? icon as (typeof options)[number]["value"] : "spark";
  const save = (updates: { mapAccentColor?: string; mapIcon?: (typeof options)[number]["value"] }) => update.mutate({ profileId, ...updates });
  return <section className="rounded-2xl border border-white/[.09] bg-[linear-gradient(135deg,rgba(0,216,255,.065),rgba(155,77,255,.08),rgba(255,255,255,.018))] p-4 sm:p-6"><div className="flex flex-col gap-3 border-b border-white/[.08] pb-4 sm:flex-row sm:items-center sm:justify-between"><div><span className="eyebrow"><Orbit size={12} /> Root map identity</span><h2 className="font-display mt-3 text-xl font-semibold tracking-[-.045em] text-white">Make your main Portal instantly recognizable.</h2><p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500">Choose the root glow and icon visitors see at the center of your connected map.</p></div><span style={{ color: accentColor || "#00D8FF", borderColor: `${accentColor || "#00D8FF"}55`, backgroundColor: `${accentColor || "#00D8FF"}12` }} className="grid h-11 w-11 place-items-center rounded-xl border"><Sparkles size={18} /></span></div><div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.35fr]"><div><p className="text-[10px] font-extrabold uppercase tracking-[.13em] text-slate-500">Map color</p><div className="mt-3 flex flex-wrap gap-2">{accents.map((color) => <button key={color} type="button" aria-label={`Use ${color} map accent`} disabled={update.isPending} onClick={() => save({ mapAccentColor: color })} style={{ backgroundColor: color, boxShadow: accentColor === color ? `0 0 0 3px #08101A, 0 0 0 5px ${color}` : undefined }} className="h-8 w-8 rounded-full transition hover:scale-110 disabled:opacity-50" />)}</div></div><div><p className="text-[10px] font-extrabold uppercase tracking-[.13em] text-slate-500">Root icon</p><div className="mt-3 grid grid-cols-5 gap-2">{options.map(({ value, label, Icon }) => <button key={value} type="button" aria-label={`Use ${label} map icon`} disabled={update.isPending} onClick={() => save({ mapIcon: value })} style={selectedIcon === value ? { borderColor: accentColor || "#00D8FF", color: accentColor || "#00D8FF", backgroundColor: `${accentColor || "#00D8FF"}14` } : undefined} className="grid h-10 place-items-center rounded-lg border border-white/[.08] bg-white/[.02] text-slate-500 transition hover:border-white/[.2] hover:text-white disabled:opacity-50"><Icon size={16} /></button>)}</div></div></div></section>;
}
