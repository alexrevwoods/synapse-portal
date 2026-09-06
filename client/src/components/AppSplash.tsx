import { type ReactNode, useEffect, useState } from "react";
import { WHOAREWE_ASSETS, WHOAREWE_BRAND } from "@shared/brand";

export default function AppSplash({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<"visible" | "leaving" | "done">("visible");

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const visibleFor = reduced ? 0 : 420;
    const exit = window.setTimeout(() => setPhase("leaving"), visibleFor);
    const done = window.setTimeout(() => setPhase("done"), visibleFor + (reduced ? 0 : 180));
    return () => { window.clearTimeout(exit); window.clearTimeout(done); };
  }, []);

  return (
    <>
      {children}
      {phase !== "done" && (
        <div className={`app-splash ${phase === "leaving" ? "is-leaving" : ""}`} role="status" aria-live="polite" aria-label={`Loading ${WHOAREWE_BRAND.name}`}>
          <div className="app-splash__content">
            <img src={WHOAREWE_ASSETS.pwaIcon192} alt="" className="app-splash__icon" />
            <p className="app-splash__wordmark">{WHOAREWE_BRAND.name}</p>
            <span className="app-splash__line" aria-hidden="true" />
            <p className="app-splash__tagline">{WHOAREWE_BRAND.tagline}</p>
          </div>
        </div>
      )}
    </>
  );
}
