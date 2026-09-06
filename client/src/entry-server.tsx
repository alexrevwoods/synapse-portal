import { QueryClient, QueryClientProvider, dehydrate } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { renderToString } from "react-dom/server";
import App from "./App";
import { trpc } from "./lib/trpc";
import { getDiscoverablePortals, getDiscoveryFeed, getPublicPortalByUsername, getPublicSignalByUsernameAndId } from "../../server/db";
import { getInterestLabel, INTEREST_KEYS } from "../../shared/interests";
import { WHOAREWE_ASSETS, WHOAREWE_BRAND } from "../../shared/brand";
import type { SignalEntry } from "./components/SocialSignalCard";

export type PublicPageHead = {
  title: string;
  description: string;
  image: string;
  canonicalPath: string;
  type: "website" | "article";
  robots: string;
  jsonLd?: Record<string, unknown>;
};

const DEFAULT_HEAD: PublicPageHead = {
  title: "WhoAreWe — Where Identity Meets Opportunity",
  description: "WhoAreWe is the connected identity network where people, businesses, creators, communities, and projects meet opportunity.",
  image: WHOAREWE_ASSETS.openGraph,
  canonicalPath: "/",
  type: "website",
  robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "WhoAreWe",
    description: "A connected identity network where identity meets opportunity.",
  },
};

const INTERNAL_TOP_LEVEL_PATHS = new Set([
  "account", "access", "brand", "builder", "feed", "insights", "join", "moderation",
  "network", "notifications", "onboarding", "signals", "skins", "timeline",
]);

const ssrTrpcClient = trpc.createClient({
  // Public query data is seeded below. The inert endpoint only satisfies the
  // tRPC provider during static rendering; private requests never run server-side.
  links: [httpBatchLink({ url: "http://127.0.0.1/api/trpc", transformer: superjson })],
});

function truncate(value: string, length: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > length ? `${normalized.slice(0, length - 1).trimEnd()}…` : normalized;
}

function signalTitle(body: string, fallback: string) {
  return truncate(body, 70) || `${fallback} Signal`;
}

function portalHead(portal: NonNullable<Awaited<ReturnType<typeof getPublicPortalByUsername>>>): PublicPageHead {
  const profile = portal.profile;
  const title = `${profile.displayName} (@${profile.username}) · WhoAreWe`;
  const description = truncate(profile.bio || `Explore ${profile.displayName}'s Portal, Signals, links, and network on WhoAreWe.`, 160);
  return {
    title,
    description,
    image: profile.avatarUrl || WHOAREWE_ASSETS.openGraph,
    canonicalPath: `/${profile.username}`,
    type: "website",
    robots: DEFAULT_HEAD.robots,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": profile.type === "business" || profile.type === "organization" ? "Organization" : "Person",
      name: profile.displayName,
      url: `/${profile.username}`,
      description,
      sameAs: profile.websiteUrl ? [profile.websiteUrl] : undefined,
    },
  };
}

export async function loadPublicPage(url: string): Promise<{ html: string; state: unknown; head: PublicPageHead }> {
  const pathname = new URL(url, "http://whoarewe.local").pathname.replace(/\/+$/, "") || "/";
  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: false } } });
  queryClient.setQueryData(getQueryKey(trpc.auth.me, undefined, "query"), null);
  let head = { ...DEFAULT_HEAD };

  if (pathname === "/discover") {
    const input = { query: undefined, profileType: "all" as const, currentProfileId: undefined };
    const portals = await getDiscoverablePortals(input);
    queryClient.setQueryData(getQueryKey(trpc.social.discover, input, "query"), portals);
    head = { ...DEFAULT_HEAD, title: "Discover People, Portals & Signals · WhoAreWe", description: "Discover published Portals and public Signals from people, businesses, creators, communities, and projects on WhoAreWe.", canonicalPath: "/discover" };
  } else if (pathname.startsWith("/discover/")) {
    const interestKey = pathname.split("/")[2];
    if (interestKey && INTEREST_KEYS.includes(interestKey as (typeof INTEREST_KEYS)[number])) {
      const input = { interestKey: interestKey as (typeof INTEREST_KEYS)[number], profileType: "all" as const };
      const [portals, signals] = await Promise.all([getDiscoverablePortals(input), getDiscoveryFeed(input)]);
      queryClient.setQueryData(getQueryKey(trpc.social.discover, input, "query"), portals);
      queryClient.setQueryData(getQueryKey(trpc.social.discoverFeed, input, "query"), signals);
      const topic = getInterestLabel(interestKey as (typeof INTEREST_KEYS)[number]);
      head = { ...DEFAULT_HEAD, title: `${topic} People, Portals & Signals · WhoAreWe`, description: `Explore public ${topic.toLowerCase()} Portals and Signals on WhoAreWe.`, canonicalPath: pathname };
    }
  } else {
    const signalMatch = pathname.match(/^\/([a-z0-9][a-z0-9-]{1,47})\/signals\/(\d+)$/i);
    const portalMatch = pathname.match(/^\/([a-z0-9][a-z0-9-]{1,47})$/i);
    if (signalMatch) {
      const username = signalMatch[1].toLowerCase();
      const signalId = Number(signalMatch[2]);
      const signal = await getPublicSignalByUsernameAndId(username, signalId) as SignalEntry | null;
      queryClient.setQueryData(getQueryKey(trpc.social.publicSignal, { username, signalId }, "query"), signal);
      if (signal) {
        const title = signal.signal.seoTitle || signalTitle(signal.signal.body, signal.profile.displayName);
        const description = signal.signal.seoDescription || truncate(signal.signal.body || `Public Signal by ${signal.profile.displayName} on WhoAreWe.`, 160);
        const image = signal.signal.seoImageUrl || signal.media?.[0]?.storageUrl || WHOAREWE_ASSETS.openGraph;
        head = { title: `${title} · WhoAreWe`, description, image, canonicalPath: pathname, type: "article", robots: DEFAULT_HEAD.robots, jsonLd: { "@context": "https://schema.org", "@type": "SocialMediaPosting", headline: title, description, datePublished: signal.signal.publishedAt ? new Date(signal.signal.publishedAt).toISOString() : undefined, author: { "@type": "Person", name: signal.profile.displayName, url: `/${signal.profile.username}` }, image } };
      }
    } else if (portalMatch) {
      const username = portalMatch[1].toLowerCase();
      const portal = await getPublicPortalByUsername(username);
      queryClient.setQueryData(getQueryKey(trpc.portal.getPublic, { username }, "query"), portal);
      if (portal) head = portalHead(portal);
    }
  }

  const genericPublicPath = /^\/([a-z0-9][a-z0-9-]{1,47})(?:\/signals\/\d+)?$/i.exec(pathname);
  const isReservedInternalPath = genericPublicPath ? INTERNAL_TOP_LEVEL_PATHS.has(genericPublicPath[1].toLowerCase()) : false;
  const isPublicRoute = pathname === "/" || pathname === "/join" || pathname === "/discover" || pathname.startsWith("/discover/") || Boolean(genericPublicPath && !isReservedInternalPath);
  if (!isPublicRoute) {
    return { html: "", state: {}, head: { ...DEFAULT_HEAD, title: "WhoAreWe", canonicalPath: pathname, robots: "noindex,nofollow" } };
  }

  const state = dehydrate(queryClient);
  const html = renderToString(<trpc.Provider client={ssrTrpcClient} queryClient={queryClient}><QueryClientProvider client={queryClient}><App ssrPath={pathname} /></QueryClientProvider></trpc.Provider>);
  return { html, state, head };
}

export function renderHead(head: PublicPageHead, origin: string) {
  const absolute = (value: string) => value.startsWith("http") ? value : `${origin}${value}`;
  const escape = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
  const canonical = absolute(head.canonicalPath);
  const image = absolute(head.image);
  const jsonLd = head.jsonLd ? JSON.stringify({ ...head.jsonLd, url: canonical }).replace(/</g, "\\u003c") : "";
  return `<title>${escape(head.title)}</title><meta name="description" content="${escape(head.description)}"/><meta name="robots" content="${escape(head.robots)}"/><link rel="canonical" href="${escape(canonical)}"/><meta property="og:site_name" content="${WHOAREWE_BRAND.name}"/><meta property="og:type" content="${head.type}"/><meta property="og:title" content="${escape(head.title)}"/><meta property="og:description" content="${escape(head.description)}"/><meta property="og:url" content="${escape(canonical)}"/><meta property="og:image" content="${escape(image)}"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${escape(head.title)}"/><meta name="twitter:description" content="${escape(head.description)}"/><meta name="twitter:image" content="${escape(image)}"/>${jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : ""}`;
}
