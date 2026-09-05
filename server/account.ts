import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getAccountMembership, getNotificationPreferences, getProfilesForUser, updateAccountMembership, updateNotificationPreferences } from "./db";
import { protectedProcedure, router } from "./_core/trpc";
import { canUseSkin, getSkin, isKnownSkin, normalizeSkinId, skinsForPlan } from "../shared/skins";

const plans = ["core", "pulse", "nexus"] as const;
const digestFrequencies = ["off", "daily", "weekly"] as const;

export const accountRouter = router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const [membership, profiles] = await Promise.all([getAccountMembership(ctx.user.id), getProfilesForUser(ctx.user.id)]);
    if (!membership) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Account membership is unavailable" });
    const platformSkin = normalizeSkinId(membership.platformSkin);
    return { membership: { ...membership, platformSkin: canUseSkin(membership.plan, platformSkin) ? platformSkin : "signal" }, profiles, availableSkins: skinsForPlan(membership.plan) };
  }),

  setMembership: protectedProcedure
    .input(z.object({ plan: z.enum(plans).optional(), cancelAtPeriodEnd: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const membership = await updateAccountMembership(ctx.user.id, input);
      if (!membership) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Membership could not be updated" });
      return membership;
    }),

  setPlatformSkin: protectedProcedure
    .input(z.object({ skinId: z.string().trim().min(2).max(48), skinPrimary: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(), skinSecondary: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional() }))
    .mutation(async ({ ctx, input }) => {
      const membership = await getAccountMembership(ctx.user.id);
      if (!membership) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Membership is unavailable" });
      const skinId = normalizeSkinId(input.skinId);
      if (!isKnownSkin(skinId)) throw new TRPCError({ code: "BAD_REQUEST", message: "That platform Skin does not exist" });
      if (!canUseSkin(membership.plan, skinId)) throw new TRPCError({ code: "FORBIDDEN", message: "That Skin is not included in the current membership" });
      if (skinId === "brand" && membership.plan !== "nexus") throw new TRPCError({ code: "FORBIDDEN", message: "Brand Studio is available with Nexus" });
      const skin = getSkin(skinId);
      const updated = await updateAccountMembership(ctx.user.id, { platformSkin: skinId, skinPrimary: skinId === "brand" ? input.skinPrimary || membership.skinPrimary : skin.primary, skinSecondary: skinId === "brand" ? input.skinSecondary || membership.skinSecondary : skin.secondary });
      if (!updated) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Skin could not be updated" });
      return updated;
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
