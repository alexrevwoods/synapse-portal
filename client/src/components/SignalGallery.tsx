import { useState } from "react";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";

export type SignalMediaItem = {
  id?: number;
  storageUrl: string;
  protectedStorageUrl?: string | null;
  altText: string | null;
  focalX: number;
  focalY: number;
  sortOrder?: number;
};

export default function SignalGallery({ media, aspect = "wide", className = "" }: { media: SignalMediaItem[]; aspect?: "wide" | "square" | null; className?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (!media.length) return null;
  const current = media[Math.min(activeIndex, media.length - 1)];
  const isGallery = media.length > 1;
  return <div className={`mt-4 overflow-hidden rounded-xl border border-white/[.09] bg-slate-950/55 ${className}`}>
    <div className={`relative ${aspect === "square" ? "aspect-square" : "aspect-video"}`}>
      <img src={current.storageUrl} alt={current.altText || "Signal media"} className="h-full w-full object-cover" style={{ objectPosition: `${current.focalX}% ${current.focalY}%` }} loading="lazy" />
      {isGallery && <><div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-slate-950/70 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur"><Images size={12} /> {activeIndex + 1} / {media.length}</div><button aria-label="Previous image" onClick={() => setActiveIndex((index) => (index - 1 + media.length) % media.length)} className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-slate-950/75 text-white backdrop-blur transition hover:bg-slate-900"><ChevronLeft size={16} /></button><button aria-label="Next image" onClick={() => setActiveIndex((index) => (index + 1) % media.length)} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-slate-950/75 text-white backdrop-blur transition hover:bg-slate-900"><ChevronRight size={16} /></button></>}
    </div>
    {isGallery && <div className="flex gap-1.5 overflow-x-auto border-t border-white/[.08] p-2 [scrollbar-width:none]">{media.map((item, index) => <button key={item.id ?? item.storageUrl} type="button" aria-label={`View image ${index + 1}`} aria-pressed={activeIndex === index} onClick={() => setActiveIndex(index)} className={`h-10 w-14 shrink-0 overflow-hidden rounded-md border transition ${activeIndex === index ? "border-cyan-200/65 opacity-100" : "border-transparent opacity-50 hover:opacity-80"}`}><img src={item.storageUrl} alt="" className="h-full w-full object-cover" style={{ objectPosition: `${item.focalX}% ${item.focalY}%` }} /></button>)}</div>}
  </div>;
}
