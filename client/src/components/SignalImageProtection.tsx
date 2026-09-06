import { Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type WatermarkStrength = "standard" | "strong" | "maximum";

const options: Array<{ value: WatermarkStrength; title: string; description: string }> = [
  { value: "standard", title: "Standard", description: "Readable repeated ownership mark with more room for the image." },
  { value: "strong", title: "Strong", description: "Balanced coverage for public sharing and ordinary downloads." },
  { value: "maximum", title: "Maximum", description: "Densest, highest-visibility attribution for sensitive work." },
];

export default function SignalImageProtection({ profileId, value, onChange }: { profileId: number; value?: WatermarkStrength | null; onChange?: () => void }) {
  const current = value || "strong";
  const update = trpc.profile.update.useMutation({
    onSuccess: () => { toast.success("New Signal image protection saved"); onChange?.(); },
    onError: (error) => toast.error(error.message),
  });

  return <section className="rounded-2xl border border-cyan-200/[.14] bg-cyan-300/[.025] p-4 sm:p-6">
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-300/[.11] text-cyan-100"><ShieldCheck size={18} /></span>
      <div><span className="eyebrow">Signal image protection</span><h2 className="font-display mt-2 text-xl font-semibold tracking-[-.04em] text-white">Choose your download-protection strength.</h2><p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">New Signal images are permanently marked with your display name and Portal handle before storage. The protected image is what visitors receive in feeds, new tabs, mobile saves, and downloads.</p></div>
    </div>
    <div className="mt-5 grid gap-2.5 sm:grid-cols-3">{options.map((option) => { const active = option.value === current; return <button key={option.value} type="button" disabled={update.isPending} onClick={() => update.mutate({ profileId, signalWatermarkStrength: option.value })} className={`rounded-xl border p-3 text-left transition ${active ? "border-cyan-200/45 bg-cyan-300/[.09]" : "border-white/[.08] bg-slate-950/30 hover:border-white/[.2]"}`}><span className="flex items-center justify-between text-xs font-extrabold text-white">{option.title}{active && <span className="grid h-5 w-5 place-items-center rounded-full bg-cyan-200 text-[#08101A]"><Check size={12} /></span>}</span><span className="mt-2 block text-[10px] leading-4 text-slate-500">{option.description}</span></button>; })}</div>
    <p className="mt-4 text-[10px] leading-5 text-slate-600">This setting applies to newly uploaded images. Existing protected images keep their present mark. No browser can reliably detect or block screenshots; visible image-byte attribution is the protection that also survives a screenshot.</p>
  </section>;
}
