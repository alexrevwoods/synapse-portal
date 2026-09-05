import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getAccountMembership, getNotificationPreferences, getProfilesForUser, updateAccountMembership, updateNotificationPreferences } from "./db";
import { protectedProcedure, router } from "./_core/trpc";

const plans = ["core", "pulse", "nexus"] as const;
const digestFrequencies = ["off", "daily", "weekly"] as const;

export const accountRouter = router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const [membership, profiles] = await Promise.all([getAccountMembership(ctx.user.id), getProfilesForUser(ctx.user.id)]);
    if (!membership) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Account membership is unavailable" });
    return { membership, profiles };
  }),

  setMembership: protectedProcedure
    .input(z.object({ plan: z.enum(plans).optional(), cancelAtPeriodEnd: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const membership = await updateAccountMembership(ctx.user.id, input);
      if (!membership) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Membership could not be updated" });
      return membership;
    }),

  preferences: protectedProcedure.input(z.object({ profileId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const preferences = await getNotificationPreferences(ctx.user.id, input.profileId);
    if (!preferences) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    return preferences;
  }),

  updatePreferences: protectedProcedure
    .input(z.object({ profileId: z.number().int().positive(), inAppEnabled: z.boolean().optional(), emailEnabled: z.boolean().optional(), emailFollows: z.boolean().optional(), emailConnections: z.boolean().optional(), emailConversations: z.boolean().optional(), digestFrequency: z.enum(digestFrequencies).optional() }))
    .mutation(async ({ ctx, input }) => {
      const { profileId, ...updates } = input;
      const preferences = await updateNotificationPreferences(ctx.user.id, profileId, updates);
      if (!preferences) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      return preferences;
    }),
});
