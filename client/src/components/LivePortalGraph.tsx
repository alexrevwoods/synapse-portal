import { type CSSProperties, useMemo, useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, FileText, Globe2, Link2, Mail, Music2, Sparkles, UsersRound, Video } from "lucide-react";
import HolographicCard from "./HolographicCard";
import InteractiveSynapseNetwork from "./InteractiveSynapseNetwork";

type LiveNode = {
  id: number;
  type: "identity" | "social" | "web" | "content" | "conversion" | "synapse";
  title: string;
  subtitle: string | null;
  description: string | null;
  targetUrl: string | null;
  accentColor?: string | null;
  positionX: number;
  positionY: number;
};

type LiveConnection = { fromNodeId: number; toNodeId: number };

type LiveProfile = {
  displayName: string;
  username: string;
  type: string;
  bio: string | null;
  location: string | null;
};

const typeIcons = {
  identity: UsersRound,
  social: Globe2,
  web: Link2,
  content: Video,
  conversion: Mail,
  synapse: Sparkles,
};

function firstInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function LivePortalGraph({ profile, nodes, connections, onNodeOpen }: { profile: LiveProfile; nodes: LiveNode[]; connections: LiveConnection[]; onNodeOpen?: (nodeId: number) => void }) {
  const [selectedId, setSelectedId] = useState<number | "root">("root");
  const selectedNode = nodes.find((node) => node.id === selectedId);
  const selected = selectedNode
    ? {
        title: selectedNode.title,
        kind: selectedNode.subtitle || selectedNode.type,
        summary: selectedNode.description || "A connected part of this identity.",
        targetUrl: selectedNode.targetUrl,
        icon: typeIcons[selectedNode.type],
      }
    : {
        title: profile.displayName,
        kind: `${profile.type} ${profile.location ? `· ${profile.location}` : ""}`,
        summary: profile.bio || "A public identity built to be explored.",
        targetUrl: null,
        icon: Sparkles,
      };
  const SelectedIcon = selected.icon;
  const nodeLookup = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <InteractiveSynapseNetwork className="portal-stage">
        <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#77e6fb]" />
          Live identity map
        </div>
        {nodes.length === 0 && <p className="absolute inset-x-7 bottom-7 z-10 max-w-xs text-xs font-medium leading-6 text-slate-400">This Portal is published and ready. Add connected Nodes in the Portal Builder to bring this identity map to life.</p>}
        <svg className="graph-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {nodes.map((node) => <line key={`root-${node.id}`} x1="50" y1="50" x2={node.positionX} y2={node.positionY} />)}
          {connections.map((connection) => {
            const from = nodeLookup.get(connection.fromNodeId);
            const to = nodeLookup.get(connection.toNodeId);
            if (!from || !to) return null;
            return <line key={`${connection.fromNodeId}-${connection.toNodeId}`} x1={from.positionX} y1={from.positionY} x2={to.positionX} y2={to.positionY} className="muted" />;
          })}
          {nodes.length > 0 && <circle className="graph-pulse" r="0.8"><animateMotion dur="5.5s" repeatCount="indefinite" path={`M50,50 L${nodes[0].positionX},${nodes[0].positionY}`} /></circle>}
        </svg>

        <button
          type="button"
          aria-pressed={selectedId === "root"}
          aria-label={`Open ${profile.displayName}`}
          onClick={() => setSelectedId("root")}
          style={{ left: "50%", top: "50%" } as CSSProperties}
          className={`portal-node portal-node--root ${selectedId === "root" ? "is-active" : ""}`}
        >
          <span className="portal-node__icon">{firstInitials(profile.displayName)}</span>
          <span className="portal-node__copy"><span className="portal-node__label">{profile.displayName}</span><span className="portal-node__kind">{profile.type}{profile.location ? ` · ${profile.location}` : ""}</span></span>
        </button>

        {nodes.map((node) => {
          const Icon = typeIcons[node.type];
          return (
            <button
              key={node.id}
              type="button"
              aria-pressed={selectedId === node.id}
              aria-label={`Open ${node.title}`}
              onClick={() => { setSelectedId(node.id); onNodeOpen?.(node.id); }}
              style={{ left: `${node.positionX}%`, top: `${node.positionY}%`, borderColor: node.accentColor || undefined, boxShadow: node.accentColor ? `0 0 24px ${node.accentColor}2b` : undefined } as CSSProperties}
              className={`portal-node ${selectedId === node.id ? "is-active" : ""}`}
            >
              <span className="portal-node__icon">{node.type === "content" && node.title.toLowerCase().includes("music") ? <Music2 size={16} strokeWidth={1.9} /> : <Icon size={16} strokeWidth={1.9} />}</span>
              <span className="portal-node__copy"><span className="portal-node__label">{node.title}</span><span className="portal-node__kind">{node.subtitle || node.type}</span></span>
            </button>
          );
        })}
      </InteractiveSynapseNetwork>

      <HolographicCard className="flex min-h-[24rem] flex-col p-5 lg:min-h-full">
        <div className="mb-7 flex items-start justify-between gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-200/20 bg-cyan-300/10 text-cyan-100"><SelectedIcon size={21} strokeWidth={1.75} /></div><span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{selected.kind}</span></div>
        <div><p className="font-display text-2xl font-semibold tracking-tight text-white">{selected.title}</p><p className="mt-3 text-sm font-medium leading-6 text-slate-300">{selected.summary}</p><p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-slate-500">Nodes provide context before a visitor follows a path or leaves this Portal.</p></div>
        <div className="mt-auto pt-7">
          {selected.targetUrl ? <a href={selected.targetUrl} target="_blank" rel="noreferrer" className="primary-button w-full">Open destination <ArrowUpRight size={15} /></a> : <div className="rounded-xl border border-white/[.08] bg-white/[.025] px-4 py-3 text-center text-xs font-bold text-slate-400">Explore the connected Nodes</div>}
        </div>
      </HolographicCard>
    </div>
  );
}
