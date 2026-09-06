import { useMemo, useState } from "react";
import { Link } from "wouter";
import { CornerDownRight, MessageCircle, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import SignalGallery, { type SignalMediaItem } from "./SignalGallery";

type Profile = { id: number; username: string; displayName: string; type: string; location?: string | null };
type Comment = { comment: { id: number; signalId: number; profileId: number; parentCommentId: number | null; body: string; createdAt: Date | string }; profile: Profile };
export type SignalEntry = {
  signal: { id: number; body: string; type: string; visibility: string; publishedAt: Date | string | null; imageAspect?: "wide" | "square" | null };
  profile: Profile;
  reactionCount: number;
  reactedByCurrentProfile: boolean;
  comments: Comment[];
  media?: SignalMediaItem[];
};

function initials(name: string) { return name.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase(); }
function formatDate(value: Date | string | null) { if (!value) return "Just now"; return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value)); }

export default function SocialSignalCard({ entry, activeProfileId, onRefresh, compact = false }: { entry: SignalEntry; activeProfileId?: number; onRefresh?: () => void; compact?: boolean }) {
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const { signal, profile, comments, media = [] } = entry;
  const reactions = trpc.social.toggleReaction.useMutation({ onSuccess: () => onRefresh?.(), onError: (error) => toast.error(error.message) });
  const addComment = trpc.social.addComment.useMutation({ onSuccess: () => { setCommentText(""); setReplyTo(null); onRefresh?.(); }, onError: (error) => toast.error(error.message) });
  const rootComments = useMemo(() => comments.filter((comment) => !comment.comment.parentCommentId), [comments]);
  const replies = useMemo(() => new Map(rootComments.map((comment) => [comment.comment.id, comments.filter((reply) => reply.comment.parentCommentId === comment.comment.id)])), [comments, rootComments]);
  const submitComment = () => {
    if (!activeProfileId) return;
    if (!commentText.trim()) return;
    addComment.mutate({ profileId: activeProfileId, signalId: signal.id, body: commentText, parentCommentId: replyTo ?? undefined });
  };

  return <article className={`rounded-2xl border border-white/[.08] bg-[linear-gradient(145deg,rgba(18,28,48,.6),rgba(8,12,23,.66))] p-4 shadow-[0_14px_32px_rgba(0,0,0,.12)] ${compact ? "" : "sm:p-5"}`}>
    <div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-200/20 bg-gradient-to-br from-cyan-100 via-sky-300 to-violet-400 text-xs font-extrabold text-[#08101A]">{initials(profile.displayName)}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-bold text-white">{profile.displayName}</p><p className="mt-0.5 text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">@{profile.username} · {formatDate(signal.publishedAt)}</p></div><span className="rounded-full border border-white/[.08] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[.1em] text-slate-600">{signal.type}</span></div><SignalGallery media={media} aspect={signal.imageAspect} />{signal.body && <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">{signal.body}</p>}</div></div>
    <div className="mt-4 flex items-center gap-2 border-t border-white/[.08] pt-3"><button disabled={!activeProfileId || reactions.isPending} onClick={() => activeProfileId ? reactions.mutate({ profileId: activeProfileId, signalId: signal.id }) : toast.info("Build and publish your Portal before reacting.")} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold transition ${entry.reactedByCurrentProfile ? "bg-cyan-300/[.11] text-cyan-100" : "text-slate-500 hover:bg-white/[.04] hover:text-slate-300"}`}><Sparkles size={14} className={entry.reactedByCurrentProfile ? "fill-cyan-100" : ""} /> {entry.reactionCount || "Spark"}</button><button onClick={() => activeProfileId ? document.getElementById(`comment-${signal.id}`)?.focus() : toast.info("Build and publish your Portal before commenting.")} className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-500 transition hover:bg-white/[.04] hover:text-slate-300"><MessageCircle size={14} /> {comments.length || "Comment"}</button>{!activeProfileId && <Link href="/onboarding" className="ml-auto text-[10px] font-bold text-cyan-100 hover:text-cyan-50">Join to participate</Link>}</div>
    {!compact && <div className="mt-3 space-y-3">{rootComments.map((item) => <div key={item.comment.id}><div className="flex gap-2.5"><div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/[.05] text-[9px] font-extrabold text-slate-300">{initials(item.profile.displayName)}</div><div className="min-w-0 flex-1 rounded-xl bg-white/[.025] px-3 py-2.5"><p className="text-xs font-bold text-slate-200">{item.profile.displayName} <span className="ml-1 font-medium text-slate-600">@{item.profile.username}</span></p><p className="mt-1 text-xs leading-5 text-slate-400">{item.comment.body}</p><button onClick={() => activeProfileId ? setReplyTo(item.comment.id) : toast.info("Build and publish your Portal before replying.")} className="mt-2 text-[10px] font-bold text-cyan-100/70 hover:text-cyan-100">Reply</button></div></div>{(replies.get(item.comment.id) || []).map((reply) => <div key={reply.comment.id} className="ml-9 mt-2 flex gap-2.5"><CornerDownRight size={13} className="mt-2 text-slate-600" /><div className="min-w-0 flex-1 rounded-xl bg-white/[.018] px-3 py-2.5"><p className="text-xs font-bold text-slate-300">{reply.profile.displayName} <span className="ml-1 font-medium text-slate-600">@{reply.profile.username}</span></p><p className="mt-1 text-xs leading-5 text-slate-500">{reply.comment.body}</p></div></div>)}</div>)}
      {activeProfileId && <div className="flex gap-2 pt-1"><input id={`comment-${signal.id}`} value={commentText} onChange={(event) => setCommentText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submitComment(); } }} placeholder={replyTo ? "Write a thoughtful reply…" : "Add to the conversation…"} className="h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/45 px-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/45" /><button disabled={!commentText.trim() || addComment.isPending} onClick={submitComment} className="secondary-button !px-3 !py-2 !text-xs"><Send size={13} /></button></div>}{replyTo && <button onClick={() => setReplyTo(null)} className="text-[10px] font-bold text-slate-500 hover:text-slate-300">Cancel reply</button>}</div>}
  </article>;
}
