import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createSignalComment,
  deleteOwnedSignalComment,
  getDiscoverablePortals,
  getDiscoveryFeed,
  getFollowSuggestions,
  getNotificationsForProfile,
  getPublicSignalFeed,
  getTimelineForProfile,
  getUnreadCommentCount,
  markNotificationsRead,
  toggleCommentReaction,
  toggleSignalReaction,
  updateOwnedSignalComment,
} from "./db";
import { INTEREST_KEYS } from "../shared/interests";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

export const socialRouter = router({
  suggestions: protectedProcedure.input(z.object({ profileId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const suggestions = await getFollowSuggestions(ctx.user.id, input.profileId);
    if (!suggestions) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    return suggestions;
  }),

  discover: publicProcedure
    .input(z.object({ query: z.string().trim().max(48).optional(), profileType: z.enum(["all", "personal", "creator", "business", "organization", "project"]).optional(), interestKey: z.enum(INTEREST_KEYS).optional(), currentProfileId: z.number().int().positive().optional() }))
    .query(({ input }) => getDiscoverablePortals(input)),

  discoverFeed: publicProcedure
    .input(z.object({ query: z.string().trim().max(48).optional(), profileType: z.enum(["all", "personal", "creator", "business", "organization", "project"]).optional(), interestKey: z.enum(INTEREST_KEYS).optional(), currentProfileId: z.number().int().positive().optional() }))
    .query(({ input }) => getDiscoveryFeed(input)),

  publicFeed: publicProcedure
    .input(z.object({ username: z.string().trim().min(2).max(48), activeProfileId: z.number().int().positive().optional() }))
    .query(({ input }) => getPublicSignalFeed(input.username.replace(/^@/, "").toLowerCase(), input.activeProfileId)),

  timeline: protectedProcedure.input(z.object({ profileId: z.number().int().positive(), relationshipFilter: z.enum(["all", "following", "connections", "mine"]).default("all") })).query(async ({ ctx, input }) => {
    const feed = await getTimelineForProfile(ctx.user.id, input.profileId, input.relationshipFilter);
    if (!feed) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    return feed;
  }),

  toggleReaction: protectedProcedure.input(z.object({ profileId: z.number().int().positive(), signalId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const result = await toggleSignalReaction(ctx.user.id, input);
    if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Signal or active Profile not found" });
    return result;
  }),

  toggleCommentReaction: protectedProcedure.input(z.object({ profileId: z.number().int().positive(), commentId: z.number().int().positive(), type: z.enum(["spark", "heart", "insight", "celebrate"]) })).mutation(async ({ ctx, input }) => {
    const result = await toggleCommentReaction(ctx.user.id, input);
    if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Comment or active Profile not found" });
    return result;
  }),

  addComment: protectedProcedure
    .input(z.object({ profileId: z.number().int().positive(), signalId: z.number().int().positive(), body: z.string().trim().min(1).max(2000), parentCommentId: z.number().int().positive().optional() }))
    .mutation(async ({ ctx, input }) => {
      const comment = await createSignalComment(ctx.user.id, input);
      if (!comment) throw new TRPCError({ code: "NOT_FOUND", message: "Signal, parent comment, or active Profile not found" });
      return comment;
    }),

  updateComment: protectedProcedure
    .input(z.object({ profileId: z.number().int().positive(), commentId: z.number().int().positive(), body: z.string().trim().min(1).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const comment = await updateOwnedSignalComment(ctx.user.id, input);
      if (!comment) throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
      return comment;
    }),

  deleteComment: protectedProcedure
    .input(z.object({ profileId: z.number().int().positive(), commentId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await deleteOwnedSignalComment(ctx.user.id, input);
      if (!deleted) throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
      return { deleted: true } as const;
    }),

  commentUnread: protectedProcedure.input(z.object({ profileId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const count = await getUnreadCommentCount(ctx.user.id, input.profileId);
    if (count === null) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    return { count };
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
