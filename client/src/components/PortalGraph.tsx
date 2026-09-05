import { type CSSProperties, useState } from "react";
import { Link } from "wouter";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Camera,
  Mail,
  Music2,
  Play,
  Send,
  Sparkles,
  UsersRound,
  Video,
} from "lucide-react";
import HolographicCard from "./HolographicCard";
import InteractiveSynapseNetwork from "./InteractiveSynapseNetwork";

type NodeId = "root" | "studio" | "film" | "music" | "newsletter" | "contact";

type PortalNode = {
  id: NodeId;
  label: string;
  kind: string;
  summary: string;
  detail: string;
  action: string;
  actionNote: string;
  x: number;
  y: number;
  tone: string;
  related: NodeId[];
};

const nodes: PortalNode[] = [
  {
    id: "root",
    label: "Alex Revwoods",
    kind: "Creator · Toronto",
    summary: "A filmmaker and founder building sharper stories for growing brands.",
    detail: "Alex's Portal is a living map of current work, projects, and places to connect—not a list of links.",
    action: "View profile",
    actionNote: "2.4k followers · 148 connections",
    x: 50,
    y: 50,
    tone: "cyan",
    related: ["studio", "film", "music", "newsletter", "contact"],
  },
  {
    id: "studio",
    label: "North Star Studio",
    kind: "Business",
    summary: "Brand films and systems for companies with something real to say.",
    detail: "A Synapse business identity connected to Alex's work and current collaborations.",
    action: "Open studio",
    actionNote: "Strategy · Film · Digital",
    x: 20,
    y: 28,
    tone: "violet",
    related: ["root", "film", "contact"],
  },
  {
    id: "film",
    label: "New work",
    kind: "Film collection",
    summary: "A curated set of narrative, campaign, and documentary work.",
    detail: "Collections keep a Portal clear as it grows—one meaningful place for related work.",
    action: "Watch reel",
    actionNote: "06 selected films",
    x: 80,
    y: 29,
    tone: "cyan",
    related: ["root", "studio", "music"],
  },
  {
    id: "music",
    label: "Afterlight",
    kind: "Music project",
    summary: "Ambient sketches made between edits, released in small seasons.",
    detail: "Creative projects can be first-class identities in the network, not just outbound destinations.",
    action: "Listen now",
    actionNote: "EP · 5 tracks",
    x: 22,
    y: 72,
    tone: "violet",
    related: ["root", "film", "newsletter"],
  },
  {
    id: "newsletter",
    label: "Field Notes",
    kind: "Signal series",
    summary: "Thoughtful notes on creative direction, work, and durable digital identity.",
    detail: "Signals are native Synapse publishing: visible by choice and connected to the rest of an identity.",
    action: "Read Signals",
    actionNote: "Weekly · 1,087 readers",
    x: 50,
    y: 18,
    tone: "cyan",
    related: ["root", "music", "contact"],
  },
  {
    id: "contact",
    label: "Work together",
    kind: "Contact",
    summary: "Available for selected film, identity, and storytelling collaborations.",
    detail: "A clear conversion node gives visitors a direct route from discovery to a meaningful next step.",
    action: "Start a conversation",
    actionNote: "Replies within 2 business days",
    x: 79,
    y: 72,
    tone: "cyan",
    related: ["root", "studio", "newsletter"],
  },
];

const icons = {
  root: Sparkles,
  studio: BriefcaseBusiness,
  film: Video,
  music: Music2,
  newsletter: Send,
  contact: Mail,
};

const edges: Array<[NodeId, NodeId, boolean]> = [
  ["root", "studio", false],
  ["root", "film", false],
  ["root", "music", false],
  ["root", "newsletter", true],
  ["root", "contact", false],
  ["studio", "film", true],
  ["film", "music", true],
  ["music", "newsletter", true],
  ["newsletter", "contact", true],
];

function nodeById(id: NodeId) {
  return nodes.find((node) => node.id === id) ?? nodes[0];
}

export default function PortalGraph() {
  const [selectedId, setSelectedId] = useState<NodeId>("root");
  const [copied, setCopied] = useState(false);
  const selected = nodeById(selectedId);
  const SelectedIcon = icons[selected.id];

  const copyPortalLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pb-16">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="signal-dot" aria-hidden="true" />
          <span className="font-semibold uppercase tracking-[0.14em]">Public Portal · @alex</span>
        </div>
        <button onClick={copyPortalLink} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-semibold text-slate-300 transition hover:border-cyan-200/40 hover:text-cyan-100">
          {copied ? "Portal link copied" : "Share Portal"}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <InteractiveSynapseNetwork className="portal-stage">
          <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#77e6fb]" />
            Live identity map
          </div>
          <div className="absolute bottom-5 left-5 z-10 max-w-[11rem] text-[10px] font-semibold leading-relaxed text-slate-500 sm:max-w-xs sm:text-xs">
            Explore a connected identity. Select a node to reveal its context before you leave the Portal.
          </div>

          <svg className="graph-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {edges.map(([from, to, muted]) => {
              const source = nodeById(from);
              const target = nodeById(to);
              return <line key={`${from}-${to}`} x1={source.x} y1={source.y} x2={target.x} y2={target.y} className={muted ? "muted" : ""} />;
            })}
            <circle className="graph-pulse" r="0.8">
              <animateMotion dur="5s" repeatCount="indefinite" path="M50,50 L80,29" />
            </circle>
            <circle className="graph-pulse" r="0.55">
              <animateMotion dur="7s" repeatCount="indefinite" path="M20,28 L50,50 L79,72" />
            </circle>
          </svg>

          {nodes.map((node) => {
            const Icon = icons[node.id];
            const active = selectedId === node.id;
            const related = !active && selected.related.includes(node.id);
            return (
              <button
                key={node.id}
                type="button"
                aria-pressed={active}
                aria-label={`Open ${node.label}`}
                onClick={() => setSelectedId(node.id)}
                style={{ left: `${node.x}%`, top: `${node.y}%` } as CSSProperties}
                className={`portal-node ${node.id === "root" ? "portal-node--root" : ""} ${active ? "is-active" : ""} ${related ? "is-related" : ""}`}
              >
                <span className="portal-node__icon">{node.id === "root" ? "AR" : <Icon size={16} strokeWidth={1.9} />}</span>
                <span className="portal-node__copy">
                  <span className="portal-node__label">{node.label}</span>
                  <span className="portal-node__kind">{node.kind}</span>
                </span>
              </button>
            );
          })}
        </InteractiveSynapseNetwork>

        <HolographicCard className="flex min-h-[24rem] flex-col p-5 lg:min-h-full">
          <div className="mb-7 flex items-start justify-between gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
              <SelectedIcon size={21} strokeWidth={1.75} />
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{selected.kind}</span>
          </div>
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight text-white">{selected.label}</p>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-300">{selected.summary}</p>
            <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-slate-500">{selected.detail}</p>
          </div>
          <div className="mt-auto pt-7">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.13em] text-cyan-100/55">{selected.actionNote}</p>
            {selected.id === "root" ? (
              <Link href="/join" className="primary-button w-full">
                {selected.action} <ArrowUpRight size={15} />
              </Link>
            ) : (
              <button className="secondary-button w-full" onClick={() => setSelectedId("root")}>
                {selected.action} <ArrowUpRight size={15} />
              </button>
            )}
          </div>
        </HolographicCard>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.08] bg-slate-950/40 p-4">
          <UsersRound className="mb-3 text-cyan-200" size={18} />
          <p className="text-sm font-bold text-white">Discovery stays open</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Anyone can explore public Portals without an account.</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-slate-950/40 p-4">
          <Play className="mb-3 text-violet-300" size={18} />
          <p className="text-sm font-bold text-white">Context before clicks</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Node cards explain what lives behind every connection.</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-slate-950/40 p-4">
          <Camera className="mb-3 text-cyan-200" size={18} />
          <p className="text-sm font-bold text-white">Identity in motion</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">The graph is driven by real profile relationships—not decoration.</p>
        </div>
      </div>
    </div>
  );
}
