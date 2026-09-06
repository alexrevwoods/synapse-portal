import { getSkin, WHOAREWE_SKINS } from "@shared/skins";

export function resolveSkin(id?: string | null, custom?: { primary?: string | null; secondary?: string | null; base?: string | null }) {
  const skin = getSkin(id);
  return {
    ...skin,
    primary: skin.id === "brand" ? custom?.primary || skin.primary : skin.primary,
    secondary: skin.id === "brand" ? custom?.secondary || skin.secondary : skin.secondary,
    base: custom?.base || skin.base,
  };
}

export function applyPlatformSkin(id?: string | null, custom?: { primary?: string | null; secondary?: string | null }) {
  if (typeof document === "undefined") return;
  const skin = resolveSkin(id, custom);
  const root = document.documentElement;
  root.classList.add("skin-runtime");
  root.style.setProperty("--skin-primary", skin.primary);
  root.style.setProperty("--skin-secondary", skin.secondary);
  root.style.setProperty("--skin-base", skin.base);
  root.style.setProperty("--skin-glow", `${skin.primary}2f`);
  root.dataset.whoareweSkin = skin.id;
}

export function getGuestSkin() {
  if (typeof window === "undefined") return "signal";
  return window.localStorage.getItem("whoarewe-guest-skin") || "signal";
}

export function setGuestSkin(id: string) {
  if (typeof window !== "undefined") window.localStorage.setItem("whoarewe-guest-skin", id);
  applyPlatformSkin(id);
}

export const HOME_PREVIEW_SKINS = WHOAREWE_SKINS.slice(0, 3);
