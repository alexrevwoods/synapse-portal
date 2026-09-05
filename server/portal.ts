import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getPublicPortalByUsername, getPublishedProfileByUsername, recordAnalyticsEvent } from "./db";
import { publicProcedure, router } from "./_core/trpc";

export function normalizePortalUsername(value: string) {
  return value.trim().replace(/^@/, "").toLowerCase();
}

export const portalRouter = router({
  getPublic: publicProcedure
    .input(z.object({ username: z.string().trim().min(2).max(48).regex(/^@?[a-zA-Z0-9_]+$/, "Use letters, numbers, and underscores only") }))
    .query(({ input }) => getPublicPortalByUsername(normalizePortalUsername(input.username))),

  track: publicProcedure
    .input(z.object({ username: z.string().trim().min(2).max(48), eventType: z.enum(["portal_view", "node_open", "signal_view"]), nodeId: z.number().int().positive().optional(), signalId: z.number().int().positive().optional(), visitorId: z.string().trim().max(96).optional(), sessionId: z.string().trim().max(96).optional() }))
    .mutation(async ({ input }) => {
      const profile = await getPublishedProfileByUsername(normalizePortalUsername(input.username));
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Public Profile not found" });
      await recordAnalyticsEvent({ profileId: profile.id, eventType: input.eventType, nodeId: input.nodeId, signalId: input.signalId, visitorId: input.visitorId, sessionId: input.sessionId });
      return { tracked: true } as const;
    }),
});
