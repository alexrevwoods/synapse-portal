import { type HTMLAttributes, useRef } from "react";
import { cn } from "@/lib/utils";

type HolographicCardProps = HTMLAttributes<HTMLDivElement>;

export default function HolographicCard({ className, children, ...props }: HolographicCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const resetTilt = () => {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty("--rx", "0deg");
    element.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={ref}
      className={cn("holographic-card", className)}
      onPointerMove={(event) => {
        if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const element = ref.current;
        if (!element) return;
        const bounds = element.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        element.style.setProperty("--mouse-x", `${x}px`);
        element.style.setProperty("--mouse-y", `${y}px`);
        element.style.setProperty("--rx", `${((y - bounds.height / 2) / -26).toFixed(2)}deg`);
        element.style.setProperty("--ry", `${((x - bounds.width / 2) / 26).toFixed(2)}deg`);
      }}
      onPointerLeave={resetTilt}
      {...props}
    >
      {children}
    </div>
  );
}
