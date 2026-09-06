import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createOwnedNode,
  createProfileForUser,
  getAccountMembership,
  getBuilderProfile,
  getProfilesForUser,
  setProfilePublished,
  updateOwnedProfile,
} from "./db";
import { canUseSkin, isKnownSkin, normalizeSkinId } from "../shared/skins";
import { protectedProcedure, router } from "./_core/trpc";

const profileTypes = ["personal", "creator", "business", "organization", "project"] as const;
export const nodeTypes = ["identity", "social", "web", "content", "conversion", "synapse", "event", "product", "booking", "team"] as const;

export function normalizeUsername(value: string) {
  return value.trim().replace(/^@/, "").toLowerCase();
}

const createProfileInput = z.object({
  username: z.string().trim().min(2).max(48).regex(/^[a-zA-Z0-9_]+$/, "Use letters, numbers, and underscores only").transform(normalizeUsername),
  displayName: z.string().trim().min(2).max(120),
  type: z.enum(profileTypes),
  bio: z.string().trim().max(420).optional(),
  location: z.string().trim().max(160).optional(),
});

export const profileRouter = router({
  my: protectedProcedure.query(({ ctx }) => getProfilesForUser(ctx.user.id)),

  builder: protectedProcedure.input(z.object({ profileId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const builder = await getBuilderProfile(ctx.user.id, input.profileId);
    if (!builder) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    return builder;
  }),

  create: protectedProcedure.input(createProfileInput).mutation(async ({ ctx, input }) => {
    try {
      const [membership, existingProfiles] = await Promise.all([getAccountMembership(ctx.user.id), getProfilesForUser(ctx.user.id)]);
      const profileAllowance = membership?.plan === "core" ? 1 : membership?.plan === "pulse" ? 3 : 5;
      if (existingProfiles.length >= profileAllowance) {
        throw new TRPCError({ code: "FORBIDDEN", message: `Your ${membership?.plan || "current"} membership includes up to ${profileAllowance} ${profileAllowance === 1 ? "Profile" : "Profiles"}.` });
      }
      const profile = await createProfileForUser(ctx.user.id, input);
      if (!profile) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Profile could not be created" });
      return profile;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({ code: "CONFLICT", message: "That Synapse handle is already taken" });
    }
  }),

  update: protectedProcedure
    .input(
      z.object({
        profileId: z.number().int().positive(),
        displayName: z.string().trim().min(2).max(120).optional(),
        bio: z.string().trim().max(420).optional(),
        location: z.string().trim().max(160).optional(),
        websiteUrl: z.string().url().max(2048).optional().or(z.literal("")),
        portalTheme: z.string().trim().min(2).max(48).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { profileId, ...updates } = input;
      const membership = await getAccountMembership(ctx.user.id);
      const requestedTheme = normalizeSkinId(updates.portalTheme);
      if (updates.portalTheme && !isKnownSkin(requestedTheme)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "That Portal Skin does not exist" });
      }
      if (updates.portalTheme && (!membership || !canUseSkin(membership.plan, requestedTheme))) {
        throw new TRPCError({ code: "FORBIDDEN", message: "That Portal Skin is not available on the current membership" });
      }
      const profile = await updateOwnedProfile(ctx.user.id, profileId, { ...updates, portalTheme: updates.portalTheme ? requestedTheme : undefined, websiteUrl: updates.websiteUrl || undefined });
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      return profile;
    }),

  setPublished: protectedProcedure
    .input(z.object({ profileId: z.number().int().positive(), isPublished: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await setProfilePublished(ctx.user.id, input.profileId, input.isPublished);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      return profile;
    }),

  createNode: protectedProcedure
    .input(
      z.object({
        profileId: z.number().int().positive(),
        type: z.enum(nodeTypes),
        title: z.string().trim().min(1).max(160),
        subtitle: z.string().trim().max(220).optional(),
        description: z.string().trim().max(1000).optional(),
        targetUrl: z.string().url().max(2048).optional().or(z.literal("")),
        positionX: z.number().int().min(5).max(95),
        positionY: z.number().int().min(8).max(92),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const node = await createOwnedNode(ctx.user.id, { ...input, targetUrl: input.targetUrl || undefined });
      if (!node) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      return node;
    }),
});
