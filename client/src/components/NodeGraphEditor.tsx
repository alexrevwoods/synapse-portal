import { type CSSProperties, type PointerEvent as ReactPointerEvent, useEffect, useMemo, useState } from "react";
import { Check, GitFork, Link2, MapPin, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type Node = {
  id: number;
  type: "identity" | "social" | "web" | "content" | "conversion" | "synapse";
  title: string;
  subtitle: string | null;
  description: string | null;
  targetUrl: string | null;
  positionX: number;
  positionY: number;
  accentColor: string | null;
  isPublic: boolean;
};

type Connection = { id: number; fromNodeId: number; toNodeId: number; label: string | null };

export default function NodeGraphEditor({ profileId, nodes, connections, onChange }: { profileId: number; nodes: Node[]; connections: Connection[]; onChange: () => void }) {
  const [selectedId, setSelectedId] = useState<number | null>(nodes[0]?.id ?? null);
  const [linkTargetId, setLinkTargetId] = useState("");
  const selected = useMemo(() => nodes.find((node) => node.id === selectedId) ?? null, [nodes, selectedId]);
  const [draft, setDraft] = useState({ title: "", subtitle: "", description: "", targetUrl: "", positionX: 50, positionY: 50, accentColor: "#77e6fb", isPublic: true });

  useEffect(() => {
    if (!selected) {
      setSelectedId(nodes[0]?.id ?? null);
      return;
    }
    setDraft({
      title: selected.title,
      subtitle: selected.subtitle || "",
      description: selected.description || "",
      targetUrl: selected.targetUrl || "",
      positionX: selected.positionX,
      positionY: selected.positionY,
      accentColor: selected.accentColor || "#77e6fb",
      isPublic: selected.isPublic,
    });
  }, [selectedId, selected, nodes]);

  const updateNode = trpc.nodes.update.useMutation({ onSuccess: () => { toast.success("Node saved"); onChange(); }, onError: (error) => toast.error(error.message) });
  const deleteNode = trpc.nodes.delete.useMutation({ onSuccess: () => { toast.success("Node removed"); setSelectedId(null); onChange(); }, onError: (error) => toast.error(error.message) });
  const connectNodes = trpc.nodes.connect.useMutation({ onSuccess: () => { toast.success("Relationship added to the graph"); setLinkTargetId(""); onChange(); }, onError: (error) => toast.error(error.message) });

  const save = () => {
    if (!selected) return;
    updateNode.mutate({ profileId, nodeId: selected.id, ...draft, targetUrl: draft.targetUrl || "" });
  };
  const createConnection = () => {
    if (!selected || !linkTargetId) return;
    connectNodes.mutate({ profileId, fromNodeId: selected.id, toNodeId: Number(linkTargetId) });
  };

  const dragNode = (event: ReactPointerEvent<HTMLButtonElement>, node: Node) => {
    const stage = event.currentTarget.closest(".portal-stage");
    if (!stage) return;
    event.preventDefault();
    const bounds = stage.getBoundingClientRect();
    const getPosition = (pointer: PointerEvent) => ({
      x: Math.min(95, Math.max(5, Math.round(((pointer.clientX - bounds.left) / bounds.width) * 100))),
      y: Math.min(92, Math.max(8, Math.round(((pointer.clientY - bounds.top) / bounds.height) * 100))),
    });
    const onMove = (pointer: PointerEvent) => {
      const position = getPosition(pointer);
      setSelectedId(node.id);
      setDraft((current) => ({ ...current, positionX: position.x, positionY: position.y }));
    };
    const onUp = (pointer: PointerEvent) => {
      const position = getPosition(pointer);
      updateNode.mutate({ profileId, nodeId: node.id, positionX: position.x, positionY: position.y });
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
  };

  return (
    <section className="rounded-2xl border border-white/[.09] bg-slate-950/30 p-5 sm:p-7">
      <div className="border-b border-white/[.08] pb-5"><span className="eyebrow">Graph Editor</span><h2 className="font-display mt-3 text-2xl font-semibold tracking-[-.05em] text-white">Place Nodes. Define relationships.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">The Portal view is generated from this data. Select a Node to tune its card, position it, or create a direct relationship.</p></div>
      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="portal-stage !min-h-[420px] !rounded-xl">
          <span className="absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-slate-950/50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[.14em] text-slate-400">{nodes.length} Nodes · {connections.length} relationships</span>
          <svg className="graph-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {nodes.map((node) => <line key={`root-${node.id}`} x1="50" y1="50" x2={node.positionX} y2={node.positionY} />)}
            {connections.map((connection) => {
              const from = nodes.find((node) => node.id === connection.fromNodeId);
              const to = nodes.find((node) => node.id === connection.toNodeId);
              if (!from || !to) return null;
              return <line className="muted" key={connection.id} x1={from.positionX} y1={from.positionY} x2={to.positionX} y2={to.positionY} />;
            })}
          </svg>
          <span style={{ left: "50%", top: "50%" } as CSSProperties} className="portal-node portal-node--root pointer-events-none"><span className="portal-node__icon">YOU</span><span className="portal-node__copy"><span className="portal-node__label">Profile root</span><span className="portal-node__kind">Identity</span></span></span>
          {nodes.map((node) => <button key={node.id} type="button" onClick={() => setSelectedId(node.id)} onPointerDown={(event) => dragNode(event, node)} style={{ left: `${node.positionX}%`, top: `${node.positionY}%`, borderColor: node.accentColor || undefined, boxShadow: node.accentColor ? `0 0 24px ${node.accentColor}2b` : undefined } as CSSProperties} className={`portal-node cursor-grab active:cursor-grabbing ${selectedId === node.id ? "is-active" : ""}`}><span className="portal-node__icon"><MapPin size={15} /></span><span className="portal-node__copy"><span className="portal-node__label">{node.title}</span><span className="portal-node__kind">{node.subtitle || node.type}</span></span></button>)}
          {nodes.length === 0 && <p className="absolute inset-x-6 bottom-7 text-sm font-medium leading-6 text-slate-500">Add Nodes above to start turning your identity into a navigable graph.</p>}
        </div>
        <aside className="rounded-xl border border-white/[.09] bg-white/[.02] p-4">
          {!selected ? <div className="grid h-full min-h-64 place-items-center text-center"><div><GitFork className="mx-auto text-slate-600" size={24} /><p className="mt-3 text-sm font-bold text-slate-300">Select a Node</p><p className="mt-1 text-xs leading-5 text-slate-600">Its card and position controls will appear here.</p></div></div> : <>
            <div className="flex items-center justify-between"><p className="text-xs font-extrabold uppercase tracking-[.14em] text-cyan-100">Node inspector</p><span className="rounded-full border border-white/[.08] px-2 py-1 text-[9px] font-bold uppercase tracking-[.1em] text-slate-600">{selected.type}</span></div>
            <div className="mt-4 space-y-3"><label className="block text-[10px] font-bold uppercase tracking-[.1em] text-slate-500">Title<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-slate-950/60 px-2.5 text-xs text-white outline-none focus:border-cyan-200/50" /></label><label className="block text-[10px] font-bold uppercase tracking-[.1em] text-slate-500">Subtitle<input value={draft.subtitle} onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })} className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-slate-950/60 px-2.5 text-xs text-white outline-none focus:border-cyan-200/50" /></label><label className="block text-[10px] font-bold uppercase tracking-[.1em] text-slate-500">Card context<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={3} className="mt-1.5 w-full resize-none rounded-lg border border-white/10 bg-slate-950/60 px-2.5 py-2 text-xs leading-5 text-white outline-none focus:border-cyan-200/50" /></label><label className="block text-[10px] font-bold uppercase tracking-[.1em] text-slate-500">Destination URL<input value={draft.targetUrl} onChange={(event) => setDraft({ ...draft, targetUrl: event.target.value })} placeholder="https://…" className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-slate-950/60 px-2.5 text-xs text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/50" /></label></div>
            <div className="mt-4 grid grid-cols-2 gap-3"><label className="text-[10px] font-bold uppercase tracking-[.1em] text-slate-500">X position<input type="number" min="5" max="95" value={draft.positionX} onChange={(event) => setDraft({ ...draft, positionX: Number(event.target.value) })} className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-slate-950/60 px-2.5 text-xs text-white outline-none focus:border-cyan-200/50" /></label><label className="text-[10px] font-bold uppercase tracking-[.1em] text-slate-500">Y position<input type="number" min="8" max="92" value={draft.positionY} onChange={(event) => setDraft({ ...draft, positionY: Number(event.target.value) })} className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-slate-950/60 px-2.5 text-xs text-white outline-none focus:border-cyan-200/50" /></label></div><label className="mt-4 block text-[10px] font-bold uppercase tracking-[.1em] text-slate-500">Node accent<input type="color" value={draft.accentColor} onChange={(event) => setDraft({ ...draft, accentColor: event.target.value })} className="mt-1.5 h-9 w-full cursor-pointer rounded-lg border border-white/10 bg-slate-950/60 p-1" /></label>
            <label className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-300"><input checked={draft.isPublic} onChange={(event) => setDraft({ ...draft, isPublic: event.target.checked })} type="checkbox" className="accent-cyan-300" /> Public Node</label>
            <button disabled={updateNode.isPending} onClick={save} className="secondary-button mt-4 w-full !px-3 !py-2.5 !text-xs"><Save size={14} /> {updateNode.isPending ? "Saving…" : "Save Node"}</button>
            <div className="mt-5 border-t border-white/[.08] pt-4"><p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-500">Connect this Node</p><div className="mt-2 flex gap-2"><select value={linkTargetId} onChange={(event) => setLinkTargetId(event.target.value)} className="h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/60 px-2 text-xs text-white outline-none"><option value="">Choose another Node</option>{nodes.filter((node) => node.id !== selected.id).map((node) => <option key={node.id} value={node.id}>{node.title}</option>)}</select><button disabled={!linkTargetId || connectNodes.isPending} onClick={createConnection} className="secondary-button !px-3 !py-2.5 !text-xs"><Link2 size={14} /></button></div></div>
            <button onClick={() => { if (window.confirm(`Remove “${selected.title}” and its relationships?`)) deleteNode.mutate({ profileId, nodeId: selected.id }); }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-rose-300/70 transition hover:bg-rose-400/10 hover:text-rose-200"><Trash2 size={14} /> Remove Node</button>
          </>}
        </aside>
      </div>
    </section>
  );
}
