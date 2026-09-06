import { useState } from "react";
import { Check, Download, ExternalLink, FileWarning, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import type { SignalMediaItem } from "./SignalGallery";

const rights = {
  all_rights_reserved: { title: "All rights reserved", detail: "Reuse, redistribution, or commercial use requires the owner’s permission." },
  credit_required: { title: "Credit required", detail: "Please credit the owner and request permission before reuse or redistribution." },
  collaboration_allowed: { title: "Collaboration welcome", detail: "Contact the owner through their Portal before reusing this work." },
} as const;

type License = keyof typeof rights;

export default function SignalRightsPanel({
  username,
  signalId,
  ownerName,
  license = "all_rights_reserved",
  media,
}: {
  username: string;
  signalId: number;
  ownerName: string;
  license?: License;
  media: SignalMediaItem[];
}) {
  const [confirmingIndex, setConfirmingIndex] = useState<number | null>(null);
  const protectedDownload = trpc.social.protectedSignalDownload.useMutation({
    onSuccess: (download) => {
      const anchor = document.createElement("a");
      anchor.href = download.url;
      anchor.download = download.fileName;
      anchor.rel = "noreferrer";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setConfirmingIndex(null);
      toast.success("Protected image download started");
    },
    onError: (error) => toast.error(error.message),
  });
  const selected = confirmingIndex === null ? null : media[confirmingIndex];
  const policy = rights[license] || rights.all_rights_reserved;

  return <section className="mt-6 overflow-hidden rounded-2xl border border-violet-200/[.16] bg-[linear-gradient(145deg,rgba(67,35,104,.14),rgba(8,12,23,.5))]">
    <div className="flex gap-3 p-4 sm:p-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-200/20 bg-violet-300/[.1] text-violet-100"><ShieldCheck size={18} /></span><div><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-violet-200">Image rights & downloads</p><h2 className="font-display mt-1 text-lg font-semibold tracking-[-.035em] text-white">{policy.title}</h2><p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-400">{policy.detail}</p></div></div>
    <div className="border-t border-white/[.08] bg-slate-950/25 p-4 sm:p-5"><p className="flex items-start gap-2 text-xs leading-5 text-slate-500"><FileWarning size={14} className="mt-0.5 shrink-0 text-cyan-100" />The in-app image is clean for comfortable viewing. A download uses a separate, permanently watermarked copy that identifies <strong className="font-bold text-slate-300">{ownerName}</strong> and @{username}.</p>{media.length > 0 ? <div className="mt-4 flex flex-wrap gap-2">{media.map((item, index) => <button key={item.id ?? item.storageUrl} type="button" onClick={() => setConfirmingIndex(index)} className="secondary-button !px-3 !py-2 !text-[10px]"><Download size={13} /> Download protected image{media.length > 1 ? ` ${index + 1}` : ""}</button>)}</div> : <p className="mt-4 text-xs text-slate-600">This Signal has no downloadable image.</p>}</div>
    {selected && <div className="border-t border-violet-200/[.14] bg-[#080B14]/85 p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-white">Acknowledge image rights</p><p className="mt-1 text-xs leading-5 text-slate-500">You are downloading a permanently watermarked copy. You agree to respect the selected license and not remove or obscure the ownership mark.</p></div><button type="button" onClick={() => setConfirmingIndex(null)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-white/[.06] hover:text-white" aria-label="Close download acknowledgement"><X size={15} /></button></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={protectedDownload.isPending || !selected.id} onClick={() => selected.id && protectedDownload.mutate({ username, signalId, mediaId: Number(selected.id) })} className="primary-button !px-3.5 !py-2.5 !text-xs"><Check size={14} /> {protectedDownload.isPending ? "Preparing…" : "I understand — download protected copy"}</button><Link href={`/${username}`} className="secondary-button !px-3.5 !py-2.5 !text-xs">Contact owner <ExternalLink size={13} /></Link></div></div>}
  </section>;
}
