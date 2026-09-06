import { useEffect } from "react";
import { useLocation } from "wouter";

export const SITE_NAME = "WhoAreWe";
export const DEFAULT_DESCRIPTION = "WhoAreWe is the connected identity network where people, businesses, creators, communities, and projects meet opportunity.";

const routeTitles: Record<string, string> = {
  "/": "WhoAreWe — Where Identity Meets Opportunity",
  "/discover": "Discover People, Portals & Signals · WhoAreWe",
  "/join": "Create Your Portal · WhoAreWe",
  "/access": "Sign in · WhoAreWe",
  "/feed": "Your Timeline · WhoAreWe",
  "/account": "Edit My Portals · WhoAreWe",
};

export function Head() {
  const [location] = useLocation();
  useEffect(() => {
    const normalized = location.replace(/\/+$/, "") || "/";
    const title = routeTitles[normalized];
    if (title) document.title = title;
  }, [location]);
  return null;
}

/** Synchronizes a title after client-side navigation to dynamic Signal pages. */
export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (!title?.trim()) return;
    document.title = title;
  }, [title]);
}
