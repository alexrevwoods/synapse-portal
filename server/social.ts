import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createSignalComment,
  getDiscoverablePortals,
  getDiscoveryFeed,
  getFollowSuggestions,
  getNotificationsForProfile,
  getPublicSignalFeed,
  getTimelineForProfile,
  markNotificationsRead,
  toggleSignalReaction,
} from "./db";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

export const socialRouter = router({
  suggestions: protectedProcedure.input(z.object({ profileId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const suggestions = await getFollowSuggestions(ctx.user.id, input.profileId);
    if (!suggestions) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    return suggestions;
  }),

  discover: publicProcedure
    .input(z.object({ query: z.string().trim().max(48).optional(), profileType: z.enum(["all", "personal", "creator", "business", "organization", "project"]).optional(), currentProfileId: z.number().int().positive().optional() }))
    .query(({ input }) => getDiscoverablePortals(input)),

  discoverFeed: publicProcedure
    .input(z.object({ query: z.string().trim().max(48).optional(), profileType: z.enum(["all", "personal", "creator", "business", "organization", "project"]).optional(), currentProfileId: z.number().int().positive().optional() }))
    .query(({ input }) => getDiscoveryFeed(input)),

  publicFeed: publicProcedure
    .input(z.object({ username: z.string().trim().min(2).max(48), activeProfileId: z.number().int().positive().optional() }))
    .query(({ input }) => getPublicSignalFeed(input.username.replace(/^@/, "").toLowerCase(), input.activeProfileId)),

  timeline: protectedProcedure.input(z.object({ profileId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const feed = await getTimelineForProfile(ctx.user.id, input.profileId);
    if (!feed) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    return feed;
  }),

  toggleReaction: protectedProcedure.input(z.object({ profileId: z.number().int().positive(), signalId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const result = await toggleSignalReaction(ctx.user.id, input);
    if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Signal or active Profile not found" });
    return result;
  }),

  addComment: protectedProcedure
    .input(z.object({ profileId: z.number().int().positive(), signalId: z.number().int().positive(), body: z.string().trim().min(1).max(2000), parentCommentId: z.number().int().positive().optional() }))
    .mutation(async ({ ctx, input }) => {
      const comment = await createSignalComment(ctx.user.id, input);
      if (!comment) throw new TRPCError({ code: "NOT_FOUND", message: "Signal, parent comment, or active Profile not found" });
      return comment;
    }),

  notifications: protectedProcedure.input(z.object({ profileId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const results = await getNotificationsForProfile(ctx.user.id, input.profileId);
    if (!results) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    return results;
  }),

  markNotificationsRead: protectedProcedure.input(z.object({ profileId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const updated = await markNotificationsRead(ctx.user.id, input.profileId);
    if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    return { updated: true } as const;
  }),
});
