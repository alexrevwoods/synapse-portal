import { cn } from "@/lib/utils";

export default function SynapseMark({ className, label = true }: { className?: string; label?: boolean }) {
  return <span className={cn("synapse-mark", className)} aria-label="Synapse"><span className="synapse-mark__orb synapse-mark__orb--one" /><span className="synapse-mark__orb synapse-mark__orb--two" /><span className="synapse-mark__orb synapse-mark__orb--three" /><span className="synapse-mark__path synapse-mark__path--one" /><span className="synapse-mark__path synapse-mark__path--two" />{label && <span className="font-display synapse-mark__word">synapse</span>}</span>;
}
