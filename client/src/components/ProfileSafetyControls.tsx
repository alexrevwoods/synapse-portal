import { useState } from "react";
import { Flag, ShieldBan, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const reasons = [
  ["spam", "Spam or deceptive activity"],
  ["harassment", "Harassment or bullying"],
  ["impersonation", "Impersonation"],
  ["hate", "Hate or discrimination"],
  ["unsafe", "Unsafe content or conduct"],
  ["other", "Other concern"],
] as const;

type ReportReason = (typeof reasons)[number][0];

export default function ProfileSafetyControls({ sourceProfileId, targetProfileId, targetUsername, onBlocked }: { sourceProfileId?: number; targetProfileId: number; targetUsername: string; onBlocked?: () => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("harassment");
  const [details, setDetails] = useState("");
  const block = trpc.safety.block.useMutation({ onSuccess: () => { toast.success(`@${targetUsername} is blocked for this Profile`); setOpen(false); onBlocked?.(); }, onError: (error) => toast.error(error.message) });
  const report = trpc.safety.report.useMutation({ onSuccess: () => { toast.success("Report received. It is now available for review."); setDetails(""); setOpen(false); }, onError: (error) => toast.error(error.message) });

  if (!sourceProfileId) return null;
  return <div className="relative"><button type="button" aria-expanded={open} onClick={() => setOpen((current) => !current)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/[.1] bg-white/[.02] text-slate-500 transition hover:border-white/[.2] hover:text-slate-200" title="Safety options"><ShieldCheck size={16} /></button>{open && <div className="absolute right-0 top-12 z-40 w-80 rounded-2xl border border-white/[.12] bg-[#0c1220] p-4 shadow-[0_20px_60px_rgba(0,0,0,.45)]"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-white">Safety controls</p><p className="mt-1 text-xs leading-5 text-slate-500">Actions apply only to the active Profile.</p></div><button onClick={() => setOpen(false)} className="text-slate-500 transition hover:text-white"><X size={16} /></button></div><div className="mt-4 border-t border-white/[.08] pt-4"><p className="text-xs font-bold text-slate-300">Report @{targetUsername}</p><select value={reason} onChange={(event) => setReason(event.target.value as ReportReason)} className="mt-2 h-9 w-full rounded-lg border border-white/10 bg-slate-950/60 px-2 text-xs text-white outline-none"><option value="spam">Spam or deceptive activity</option><option value="harassment">Harassment or bullying</option><option value="impersonation">Impersonation</option><option value="hate">Hate or discrimination</option><option value="unsafe">Unsafe content or conduct</option><option value="other">Other concern</option></select><textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={1000} rows={2} placeholder="Add context (optional)" className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-slate-950/60 px-2.5 py-2 text-xs text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/45" /><button disabled={report.isPending} onClick={() => report.mutate({ reporterProfileId: sourceProfileId, targetProfileId, reason, details: details || undefined })} className="secondary-button mt-2 w-full !px-3 !py-2 !text-xs"><Flag size={13} /> {report.isPending ? "Sending…" : "Send report"}</button></div><div className="mt-4 border-t border-white/[.08] pt-4"><p className="text-xs font-bold text-rose-200">Block @{targetUsername}</p><p className="mt-1 text-[11px] leading-5 text-slate-600">Stops following, Connection requests, reactions, comments, and Timeline visibility between these Profiles.</p><button disabled={block.isPending} onClick={() => { if (window.confirm(`Block @${targetUsername} for this Profile? Existing social connections will be disabled.`)) block.mutate({ sourceProfileId, targetUsername }); }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-rose-300/20 bg-rose-400/[.06] px-3 py-2 text-xs font-bold text-rose-200 transition hover:bg-rose-400/[.12]"><ShieldBan size={13} /> {block.isPending ? "Blocking…" : "Block Profile"}</button></div></div>}</div>;
}
