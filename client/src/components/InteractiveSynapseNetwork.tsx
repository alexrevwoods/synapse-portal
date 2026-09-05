import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type InteractiveSynapseNetworkProps = {
  children?: ReactNode;
  className?: string;
  nodeCount?: number;
};

type Particle = { x: number; y: number; vx: number; vy: number; radius: number };

export default function InteractiveSynapseNetwork({
  children,
  className,
  nodeCount = 42,
}: InteractiveSynapseNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const particles: Particle[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00026,
      vy: (Math.random() - 0.5) * 0.00026,
      radius: Math.random() * 1.35 + 0.55,
    }));
    let frame = 0;
    let width = 1;
    let height = 1;
    let pixelRatio = 1;

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const render = () => {
      context.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i += 1) {
        const current = particles[i];
        if (!reducedMotion) {
          current.x += current.vx;
          current.y += current.vy;
          if (current.x < 0 || current.x > 1) current.vx *= -1;
          if (current.y < 0 || current.y > 1) current.vy *= -1;
        }
        for (let j = i + 1; j < particles.length; j += 1) {
          const neighbor = particles[j];
          const dx = (current.x - neighbor.x) * width;
          const dy = (current.y - neighbor.y) * height;
          const distance = Math.hypot(dx, dy);
          if (distance < Math.min(width, height) * 0.22) {
            context.beginPath();
            context.moveTo(current.x * width, current.y * height);
            context.lineTo(neighbor.x * width, neighbor.y * height);
            context.strokeStyle = `rgba(115, 216, 255, ${Math.max(0.025, 0.12 - distance / 2200)})`;
            context.lineWidth = 0.7;
            context.stroke();
          }
        }
        context.beginPath();
        context.arc(current.x * width, current.y * height, current.radius, 0, Math.PI * 2);
        context.fillStyle = "rgba(137, 227, 255, 0.48)";
        context.fill();
      }
      if (!reducedMotion) frame = window.requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    render();
    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [nodeCount]);

  return (
    <div ref={hostRef} className={cn("relative isolate overflow-hidden", className)}>
      <canvas ref={canvasRef} aria-hidden="true" className="ambient-canvas" />
      <div className="absolute inset-0 z-10">{children}</div>
    </div>
  );
}
