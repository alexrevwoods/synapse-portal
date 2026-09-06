import { Images, Search, ShieldCheck } from "lucide-react";

type License = "all_rights_reserved" | "credit_required" | "collaboration_allowed";

export default function SignalPublishingOptions({
  isPublic,
  hasMedia,
  showSeoFields,
  onShowSeoFieldsChange,
  seoTitle,
  onSeoTitleChange,
  seoDescription,
  onSeoDescriptionChange,
  mediaLicense,
  onMediaLicenseChange,
}: {
  isPublic: boolean;
  hasMedia: boolean;
  showSeoFields: boolean;
  onShowSeoFieldsChange: (value: boolean) => void;
  seoTitle: string;
  onSeoTitleChange: (value: string) => void;
  seoDescription: string;
  onSeoDescriptionChange: (value: string) => void;
  mediaLicense: License;
  onMediaLicenseChange: (value: License) => void;
}) {
  if (!isPublic && !hasMedia) return null;

  return <div className="mt-4 space-y-3 border-t border-white/[.08] pt-4">
    {hasMedia && <div className="flex items-start gap-2.5 rounded-xl border border-cyan-200/[.14] bg-cyan-300/[.035] p-3 text-xs leading-5 text-slate-400"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-cyan-100" /><p><strong className="font-bold text-cyan-50">Protected before storage.</strong> Your Portal name and handle are permanently embedded into the image bytes before it is published. This is what appears in feeds, mobile saves, downloads, new tabs, and screenshots.</p></div>}
    {hasMedia && <label className="flex items-start gap-2.5 rounded-xl border border-white/[.08] bg-slate-950/30 p-3"><Images size={15} className="mt-0.5 shrink-0 text-violet-200" /><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-slate-200">Media license</span><span className="mt-0.5 block text-[10px] leading-4 text-slate-600">Set the reuse expectation shown with this Signal.</span><select value={mediaLicense} onChange={(event) => onMediaLicenseChange(event.target.value as License)} className="mt-2 h-9 w-full rounded-lg border border-white/[.1] bg-[#08101A] px-2.5 text-xs font-bold text-white outline-none focus:border-violet-200/50"><option value="all_rights_reserved">All rights reserved — reuse requires permission</option><option value="credit_required">Credit required — request permission first</option><option value="collaboration_allowed">Collaboration welcome — contact the owner</option></select></span></label>}
    {isPublic && <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-white/[.08] bg-slate-950/30 p-3 transition hover:border-cyan-200/25"><input checked={showSeoFields} onChange={(event) => onShowSeoFieldsChange(event.target.checked)} type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-cyan-300" /><span><span className="flex items-center gap-1.5 text-xs font-bold text-slate-200"><Search size={14} className="text-cyan-100" /> Add SEO & share details <span className="font-medium text-slate-600">optional</span></span><span className="mt-1 block text-[10px] leading-4 text-slate-600">Post without these fields, or set a Google and social preview now. You can always use <strong className="font-bold text-slate-400">Edit & SEO</strong> later.</span></span></label>}
    {isPublic && showSeoFields && <fieldset className="rounded-xl border border-cyan-200/[.14] bg-cyan-300/[.025] p-3"><legend className="px-1 text-[10px] font-extrabold uppercase tracking-[.1em] text-cyan-100">Optional search preview</legend><div className="grid gap-3 sm:grid-cols-2"><label className="text-[10px] font-bold uppercase tracking-[.08em] text-slate-500">Meta title <span className="font-medium normal-case tracking-normal text-slate-600">{seoTitle.length}/120</span><input value={seoTitle} onChange={(event) => onSeoTitleChange(event.target.value)} maxLength={120} placeholder="How this Signal appears in search" className="mt-1.5 h-9 w-full rounded-lg border border-white/[.1] bg-[#08101A] px-2.5 text-xs font-normal normal-case tracking-normal text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/50" /></label><label className="text-[10px] font-bold uppercase tracking-[.08em] text-slate-500 sm:col-span-2">Meta description <span className="font-medium normal-case tracking-normal text-slate-600">{seoDescription.length}/200</span><textarea value={seoDescription} onChange={(event) => onSeoDescriptionChange(event.target.value)} maxLength={200} rows={3} placeholder="A concise summary for Google and social sharing" className="mt-1.5 w-full resize-none rounded-lg border border-white/[.1] bg-[#08101A] px-2.5 py-2 text-xs font-normal normal-case tracking-normal text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/50" /></label></div><p className="mt-2 text-[10px] leading-4 text-slate-600">If you add images, the first image is used automatically as the share image. After publishing, use Edit & SEO to choose a different gallery image.</p></fieldset>}
  </div>;
}
