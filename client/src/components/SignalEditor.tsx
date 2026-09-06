import { useEffect, useState } from "react";
import { Check, ExternalLink, Pencil, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import type { SignalMediaItem } from "./SignalGallery";

type EditableSignal = {
  id: number;
  body: string;
  visibility: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoImageUrl?: string | null;
  media?: SignalMediaItem[];
};

export default function SignalEditor({ profileId, username, signal, onSaved }: { profileId: number; username: string; signal: EditableSignal; onSaved?: () => void }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState(signal.body);
  const [seoTitle, setSeoTitle] = useState(signal.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(signal.seoDescription || "");
  const [seoImageUrl, setSeoImageUrl] = useState(signal.seoImageUrl || "");
  const update = trpc.signals.update.useMutation({
    onSuccess: () => {
      toast.success("Signal and search details updated");
      setOpen(false);
      onSaved?.();
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (open) return;
    setBody(signal.body);
    setSeoTitle(signal.seoTitle || "");
    setSeoDescription(signal.seoDescription || "");
    setSeoImageUrl(signal.seoImageUrl || "");
  }, [open, signal.body, signal.seoDescription, signal.seoImageUrl, signal.seoTitle]);

  const save = () => update.mutate({ profileId, signalId: signal.id, body, seoTitle, seoDescription, seoImageUrl });
  const isPublic = signal.visibility === "public";

  return <div className="mt-4 border-t border-white/[.08] pt-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-[10px] font-bold uppercase tracking-[.1em] text-slate-600">Owner controls</p>
      <div className="flex items-center gap-2">
        {isPublic && <Link href={`/${username}/signals/${signal.id}`} target="_blank" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-cyan-100 transition hover:text-cyan-50">View public Signal <ExternalLink size={12} /></Link>}
        <button type="button" onClick={() => setOpen((value) => !value)} className="secondary-button !px-3 !py-1.5 !text-[10px]">{open ? <X size={12} /> : <Pencil size={12} />}{open ? "Close" : "Edit & SEO"}</button>
      </div>
    </div>
    {open && <div className="mt-3 space-y-3 rounded-xl border border-cyan-200/16 bg-cyan-300/[.035] p-3.5">
      <label className="block text-[10px] font-extrabold uppercase tracking-[.1em] text-slate-500">Signal content<textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={5000} rows={4} className="mt-1.5 w-full resize-y rounded-lg border border-white/[.1] bg-slate-950/55 px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/50" /></label>
      {isPublic && <fieldset className="rounded-lg border border-white/[.08] bg-slate-950/30 p-3"><legend className="flex items-center gap-1.5 px-1 text-[10px] font-extrabold uppercase tracking-[.1em] text-cyan-100"><Search size={12} /> Search & share preview</legend><p className="mb-3 text-[11px] leading-5 text-slate-500">Optional fields replace the automatic preview generated from this Signal. Leave them blank to use the first image and Signal content.</p><div className="grid gap-3 sm:grid-cols-2"><label className="text-[10px] font-bold uppercase tracking-[.08em] text-slate-500">Meta title<input value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} maxLength={120} placeholder="Automatic from Signal" className="mt-1.5 h-9 w-full rounded-lg border border-white/[.1] bg-[#08101A] px-2.5 text-xs font-normal normal-case tracking-normal text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/50" /></label><label className="text-[10px] font-bold uppercase tracking-[.08em] text-slate-500">Featured image<select value={seoImageUrl} onChange={(event) => setSeoImageUrl(event.target.value)} className="mt-1.5 h-9 w-full rounded-lg border border-white/[.1] bg-[#08101A] px-2.5 text-xs font-normal normal-case tracking-normal text-white outline-none focus:border-cyan-200/50"><option value="">First Signal image (automatic)</option>{signal.media?.map((item, index) => <option value={item.storageUrl} key={item.id ?? item.storageUrl}>Image {index + 1}{item.altText ? ` — ${item.altText.slice(0, 42)}` : ""}</option>)}</select></label></div><label className="mt-3 block text-[10px] font-bold uppercase tracking-[.08em] text-slate-500">Meta description<textarea value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} maxLength={200} rows={3} placeholder="Automatic excerpt from Signal" className="mt-1.5 w-full resize-none rounded-lg border border-white/[.1] bg-[#08101A] px-2.5 py-2 text-xs font-normal normal-case tracking-normal text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/50" /></label></fieldset>}
      <button disabled={update.isPending} onClick={save} className="primary-button !px-3.5 !py-2 !text-xs">{update.isPending ? "Saving…" : "Save Signal details"}<Check size={13} /></button>
    </div>}
  </div>;
}
