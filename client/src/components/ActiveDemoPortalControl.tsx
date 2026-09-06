import { useMemo } from "react";
import { Crown, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function ActiveDemoPortalControl() {
  const demo = trpc.platform.demo.useQuery();
  const portals = trpc.platform.publishedPortals.useQuery();
  const utils = trpc.useUtils();
  const setDemo = trpc.platform.setDemo.useMutation({ onSuccess: (profile) => { toast.success(`${profile.displayName} is now the featured demo Portal`); utils.platform.demo.invalidate(); }, onError: (error) => toast.error(error.message) });
  const activeId = demo.data?.profile?.id?.toString() ?? "";
  const activeName = useMemo(() => demo.data?.profile?.displayName ?? "No published demo selected", [demo.data?.profile?.displayName]);
  return <section className="mb-8 rounded-2xl border border-cyan-200/18 bg-[radial-gradient(circle_at_90%_0%,rgba(119,230,251,.11),transparent_30%),rgba(255,255,255,.02)] p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><span className="eyebrow"><Crown size={12} /> Platform discovery</span><h2 className="font-display mt-3 text-xl font-semibold tracking-[-.04em] text-white">Featured demo Portal</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">This public Portal is used by the landing page&apos;s demo CTA and demo-only exploration guide. Only published Portals can be featured.</p></div>{demo.data?.profile && <a href={`/${demo.data.profile.username}`} target="_blank" rel="noreferrer" className="secondary-button shrink-0 !px-3 !py-2 !text-xs">Preview {activeName} <ExternalLink size={13} /></a>}</div><div className="mt-5 flex flex-col gap-3 sm:flex-row"><select aria-label="Active platform demo Portal" value={activeId} onChange={(event) => event.target.value && setDemo.mutate({ profileId: Number(event.target.value) })} disabled={portals.isLoading || setDemo.isPending} className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/65 px-3 text-sm font-semibold text-white outline-none focus:border-cyan-200/50"><option value="">Choose a published Portal</option>{portals.data?.map((profile) => <option key={profile.id} value={profile.id}>{profile.displayName} · @{profile.username}</option>)}</select><span className="flex items-center gap-2 rounded-xl border border-cyan-200/16 bg-cyan-300/[.06] px-3 text-xs font-bold text-cyan-100"><Sparkles size={14} /> {setDemo.isPending ? "Updating…" : "Landing demo"}</span></div></section>;
}
