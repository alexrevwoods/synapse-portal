import { ChevronDown, Plus, SwitchCamera } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function ProfileSwitcher({ activeProfileId, destination }: { activeProfileId: number; destination: (profileId: number) => string }) {
  const profiles = trpc.profile.my.useQuery();
  const [, navigate] = useLocation();
  const active = profiles.data?.find((profile) => profile.id === activeProfileId);
  if (profiles.isLoading || !profiles.data || profiles.data.length < 2) return <Link href="/onboarding" className="secondary-button !px-3 !py-2.5 !text-xs"><Plus size={14} /> New identity</Link>;
  return <div className="flex items-center gap-1.5"><span className="hidden items-center gap-1 text-[10px] font-extrabold uppercase tracking-[.11em] text-slate-600 xl:flex"><SwitchCamera size={12} /> Acting as</span><div className="relative"><select aria-label="Switch active Profile" value={activeProfileId} onChange={(event) => { const nextId = Number(event.target.value); window.localStorage.setItem("synapse-active-profile-id", String(nextId)); navigate(destination(nextId)); }} className="h-9 appearance-none rounded-lg border border-white/[.1] bg-slate-950/70 py-0 pl-3 pr-8 text-xs font-bold text-slate-200 outline-none transition hover:border-cyan-200/35 focus:border-cyan-200/50"><option value={activeProfileId}>{active?.displayName || "Active Profile"}</option>{profiles.data.filter((profile) => profile.id !== activeProfileId).map((profile) => <option key={profile.id} value={profile.id}>{profile.displayName} · @{profile.username}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" size={13} /></div><Link href="/onboarding" aria-label="Create another Profile" className="grid h-9 w-9 place-items-center rounded-lg border border-white/[.1] text-slate-400 transition hover:border-cyan-200/35 hover:text-cyan-100"><Plus size={15} /></Link></div>;
}
