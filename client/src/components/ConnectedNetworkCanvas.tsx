import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type ConnectedNetworkCanvasProps = { children?: ReactNode; className?: string; nodeCount?: number };
type Particle = { x: number; y: number; vx: number; vy: number; radius: number; hue: "cyan" | "purple" | "green" };

export default function ConnectedNetworkCanvas({ children, className, nodeCount = 36 }: ConnectedNetworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const palette = ["cyan", "purple", "green"] as const;
    const particles: Particle[] = Array.from({ length: nodeCount }, (_, index) => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.00019, vy: (Math.random() - 0.5) * 0.00019, radius: Math.random() * 1.15 + 0.5, hue: palette[index % palette.length] }));
    let frame = 0; let width = 1; let height = 1; let pixelRatio = 1; let lastFrameTime = 0;
    const resize = () => { const bounds = host.getBoundingClientRect(); width = Math.max(1, bounds.width); height = Math.max(1, bounds.height); pixelRatio = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.floor(width * pixelRatio); canvas.height = Math.floor(height * pixelRatio); context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0); };
    const render = (timestamp = 0) => { if (!reducedMotion && timestamp - lastFrameTime < 40) { frame = window.requestAnimationFrame(render); return; } lastFrameTime = timestamp; context.clearRect(0, 0, width, height); for (let index = 0; index < particles.length; index += 1) { const current = particles[index]; if (!reducedMotion) { current.x += current.vx; current.y += current.vy; if (current.x < 0 || current.x > 1) current.vx *= -1; if (current.y < 0 || current.y > 1) current.vy *= -1; } for (let next = index + 1; next < particles.length; next += 1) { const neighbor = particles[next]; const distance = Math.hypot((current.x - neighbor.x) * width, (current.y - neighbor.y) * height); if (distance < Math.min(width, height) * 0.2) { context.beginPath(); context.moveTo(current.x * width, current.y * height); context.lineTo(neighbor.x * width, neighbor.y * height); context.strokeStyle = `rgba(108, 213, 255, ${Math.max(0.018, 0.09 - distance / 2600)})`; context.lineWidth = 0.65; context.stroke(); } } context.beginPath(); context.arc(current.x * width, current.y * height, current.radius, 0, Math.PI * 2); context.fillStyle = current.hue === "green" ? "rgba(124,255,56,.46)" : current.hue === "purple" ? "rgba(155,77,255,.45)" : "rgba(0,216,255,.5)"; context.fill(); } if (!reducedMotion) frame = window.requestAnimationFrame(render); };
    const observer = new ResizeObserver(resize); observer.observe(host); resize(); render(); return () => { observer.disconnect(); if (frame) window.cancelAnimationFrame(frame); };
  }, [nodeCount]);
  return <div ref={hostRef} className={cn("relative isolate overflow-hidden", className)}><canvas ref={canvasRef} aria-hidden="true" className="ambient-canvas" /><div className="absolute inset-0 z-10">{children}</div></div>;
}
