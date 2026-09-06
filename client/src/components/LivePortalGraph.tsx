import { type CSSProperties, type TouchEvent as ReactTouchEvent, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CalendarCheck2, CalendarDays, ChevronDown, Globe2, Link2, Mail, Music2, ShoppingBag, Sparkles, UsersRound, Video } from "lucide-react";
import HolographicCard from "./HolographicCard";
import InteractiveSynapseNetwork from "./InteractiveSynapseNetwork";

type NodeCategory = "identity" | "social" | "web" | "content" | "conversion" | "synapse" | "event" | "product" | "booking" | "team";
type LiveNode = { id: number; type: NodeCategory; title: string; subtitle: string | null; description: string | null; targetUrl: string | null; accentColor?: string | null; positionX: number; positionY: number; };
type LiveConnection = { fromNodeId: number; toNodeId: number };
type LiveProfile = { displayName: string; username: string; type: string; bio: string | null; location: string | null };

const typeIcons: Record<NodeCategory, typeof Sparkles> = {
  identity: UsersRound, social: Globe2, web: Link2, content: Video, conversion: Mail, synapse: Sparkles,
  event: CalendarDays, product: ShoppingBag, booking: CalendarCheck2, team: UsersRound,
};

function firstInitials(name: string) { return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }

export default function LivePortalGraph({ profile, nodes, connections, onNodeOpen }: { profile: LiveProfile; nodes: LiveNode[]; connections: LiveConnection[]; onNodeOpen?: (nodeId: number) => void }) {
  const [selectedId, setSelectedId] = useState<number | "root">("root");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const selectedNode = nodes.find((node) => node.id === selectedId);
  const selected = selectedNode
    ? { title: selectedNode.title, kind: selectedNode.subtitle || selectedNode.type, summary: selectedNode.description || "A connected part of this identity.", targetUrl: selectedNode.targetUrl, icon: typeIcons[selectedNode.type] }
    : { title: profile.displayName, kind: `${profile.type} ${profile.location ? `· ${profile.location}` : ""}`, summary: profile.bio || "A public identity built to be explored.", targetUrl: null, icon: Sparkles };
  const SelectedIcon = selected.icon;
  const focusPosition = selectedNode ? { x: selectedNode.positionX, y: selectedNode.positionY } : { x: 50, y: 50 };
  const nodeLookup = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === "Escape") setIsDetailOpen(false); }; window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, []);
  const openNode = (id: number | "root") => {
    const sameNode = selectedId === id;
    setSelectedId(id);
    setIsDetailOpen((wasOpen) => sameNode ? !wasOpen : true);
    if (typeof id === "number" && (!sameNode || !isDetailOpen)) onNodeOpen?.(id);
  };
  const dismissOnSwipe = (event: ReactTouchEvent<HTMLDivElement>) => {
    const endY = event.changedTouches[0]?.clientY;
    if (touchStartY !== null && endY && endY - touchStartY > 52) setIsDetailOpen(false);
    setTouchStartY(null);
  };

  return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
    <InteractiveSynapseNetwork className="portal-stage has-map-focus">
      <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 backdrop-blur-md"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#77e6fb]" />Live identity map</div>
      {nodes.length === 0 && <p className="absolute inset-x-7 bottom-7 z-10 max-w-xs text-xs font-medium leading-6 text-slate-400">This Portal is published and ready. Add connected Nodes in the Portal Builder to bring this identity map to life.</p>}
      <svg className="graph-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {nodes.map((node) => <line key={`root-${node.id}`} x1="50" y1="50" x2={node.positionX} y2={node.positionY} />)}
        {connections.map((connection) => { const from = nodeLookup.get(connection.fromNodeId); const to = nodeLookup.get(connection.toNodeId); if (!from || !to) return null; return <line key={`${connection.fromNodeId}-${connection.toNodeId}`} x1={from.positionX} y1={from.positionY} x2={to.positionX} y2={to.positionY} className="muted" />; })}
        {nodes.length > 0 && <circle className="graph-pulse" r="0.8"><animateMotion dur="5.5s" repeatCount="indefinite" path={`M50,50 L${nodes[0].positionX},${nodes[0].positionY}`} /></circle>}
      </svg>
      <span aria-hidden="true" className={`map-focus-orb ${isDetailOpen ? "is-active" : ""}`} style={{ left: `${focusPosition.x}%`, top: `${focusPosition.y}%` }} />
      <button type="button" aria-pressed={selectedId === "root"} aria-expanded={selectedId === "root" && isDetailOpen} aria-label={`Open ${profile.displayName}`} onClick={() => openNode("root")} style={{ left: "50%", top: "50%" } as CSSProperties} className={`portal-node portal-node--root ${selectedId === "root" ? "is-active" : ""}`}><span className="portal-node__icon">{firstInitials(profile.displayName)}</span><span className="portal-node__copy"><span className="portal-node__label">{profile.displayName}</span><span className="portal-node__kind">{profile.type}{profile.location ? ` · ${profile.location}` : ""}</span></span></button>
      {nodes.map((node) => { const Icon = typeIcons[node.type]; return <button key={node.id} type="button" aria-pressed={selectedId === node.id} aria-expanded={selectedId === node.id && isDetailOpen} aria-label={`Open ${node.title}`} onClick={() => openNode(node.id)} style={{ left: `${node.positionX}%`, top: `${node.positionY}%`, borderColor: node.accentColor || undefined, boxShadow: node.accentColor ? `0 0 24px ${node.accentColor}2b` : undefined } as CSSProperties} className={`portal-node ${selectedId === node.id ? "is-active" : ""}`}><span className="portal-node__icon">{node.type === "content" && node.title.toLowerCase().includes("music") ? <Music2 size={16} strokeWidth={1.9} /> : <Icon size={16} strokeWidth={1.9} />}</span><span className="portal-node__copy"><span className="portal-node__label">{node.title}</span><span className="portal-node__kind">{node.subtitle || node.type}</span></span></button>; })}
      <div className={`mobile-node-overlay lg:hidden ${isDetailOpen ? "is-open" : ""}`} aria-hidden={!isDetailOpen}>
        <div className="mobile-node-overlay__pulse" aria-hidden="true" />
        <div className="mobile-node-overlay__surface" onTouchStart={(event) => setTouchStartY(event.touches[0]?.clientY ?? null)} onTouchEnd={dismissOnSwipe}>
          <div className="mobile-node-overlay__drag-handle" aria-hidden="true" />
          <div className="flex items-start justify-between gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-200/20 bg-cyan-300/10 text-cyan-100"><SelectedIcon size={19} strokeWidth={1.8} /></span><div className="min-w-0 flex-1"><p className="text-[9px] font-extrabold uppercase tracking-[.13em] text-cyan-100">Selected Node</p><p className="font-display mt-1 truncate text-lg font-semibold tracking-tight text-white">{selected.title}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.11em] text-slate-500">{selected.kind}</p></div><button type="button" onClick={() => setIsDetailOpen(false)} aria-label="Minimize Node detail" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[.04] text-slate-400 transition hover:text-white"><ChevronDown size={17} /></button></div>
          <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-300">{selected.summary}</p>
          <div className="mt-4 flex items-center gap-2">{selected.targetUrl ? <a href={selected.targetUrl} target="_blank" rel="noreferrer" className="primary-button flex-1 !px-3 !py-2.5 !text-xs">Open link <ArrowUpRight size={14} /></a> : <span className="flex-1 rounded-lg border border-white/[.08] bg-white/[.025] px-3 py-2.5 text-center text-[10px] font-bold text-slate-400">Explore another Node</span>}<button type="button" onClick={() => setIsDetailOpen(false)} className="secondary-button !px-3 !py-2.5 !text-xs">Map</button></div>
        </div>
      </div>
    </InteractiveSynapseNetwork>
    <HolographicCard className="hidden min-h-[24rem] flex-col p-5 lg:flex lg:min-h-full"><div className="mb-7 flex items-start justify-between gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-200/20 bg-cyan-300/10 text-cyan-100"><SelectedIcon size={21} strokeWidth={1.75} /></div><span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{selected.kind}</span></div><div><p className="font-display text-2xl font-semibold tracking-tight text-white">{selected.title}</p><p className="mt-3 text-sm font-medium leading-6 text-slate-300">{selected.summary}</p><p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-slate-500">Nodes provide context before a visitor follows a path or leaves this Portal.</p></div><div className="mt-auto pt-7">{selected.targetUrl ? <a href={selected.targetUrl} target="_blank" rel="noreferrer" className="primary-button w-full">Open destination <ArrowUpRight size={15} /></a> : <div className="rounded-xl border border-white/[.08] bg-white/[.025] px-4 py-3 text-center text-xs font-bold text-slate-400">Explore the connected Nodes</div>}</div></HolographicCard>
  </div>;
}
