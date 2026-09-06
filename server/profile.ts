import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createOwnedNode,
  createProfileForUser,
  getAccountPortalNetwork,
  getAccountMembership,
  getBuilderProfile,
  getOwnedProfile,
  getProfileInterestKeys,
  getProfilesForUser,
  linkOwnedPortal,
  saveOwnedProfileInterests,
  setProfilePublished,
  updateOwnedPortalLayout,
  updateOwnedProfile,
} from "./db";
import { canUseSkin, isKnownSkin, normalizeSkinId } from "../shared/skins";
import { INTEREST_KEYS } from "../shared/interests";
import { protectedProcedure, router } from "./_core/trpc";

const profileTypes = ["personal", "creator", "business", "organization", "project"] as const;
export const nodeTypes = ["identity", "social", "web", "content", "conversion", "portal", "event", "product", "booking", "team"] as const;
const portalRelationshipTypes = ["related", "brand", "team", "project", "community", "location"] as const;
const mapIcons = ["spark", "orbit", "bolt", "gem", "leaf"] as const;

export function normalizeUsername(value: string) {
  return value.trim().replace(/^@/, "").toLowerCase();
}

/** During free early access, an Account can build a small connected Portal network. */
export function portalAllowance(membership?: { plan: "core" | "pulse" | "nexus"; status: "free" | "trialing" | "active" | "canceled" } | null) {
  if (!membership || membership.status === "free") return 3;
  return membership.plan === "core" ? 3 : membership.plan === "pulse" ? 6 : 12;
}

const createProfileInput = z.object({
  username: z.string().trim().min(2).max(48).regex(/^[a-zA-Z0-9_]+$/, "Use letters, numbers, and underscores only").transform(normalizeUsername),
  displayName: z.string().trim().min(2).max(120),
  type: z.enum(profileTypes),
  bio: z.string().trim().max(420).optional(),
  location: z.string().trim().max(160).optional(),
  interests: z.array(z.enum(INTEREST_KEYS)).max(6).optional().default([]),
});

export const profileRouter = router({
  my: protectedProcedure.query(({ ctx }) => getProfilesForUser(ctx.user.id)),

  networkOverview: protectedProcedure.query(({ ctx }) => getAccountPortalNetwork(ctx.user.id)),

  capacity: protectedProcedure.query(async ({ ctx }) => {
    const [membership, existingProfiles] = await Promise.all([getAccountMembership(ctx.user.id), getProfilesForUser(ctx.user.id)]);
    const allowance = portalAllowance(membership);
    return { used: existingProfiles.length, allowance, canCreate: existingProfiles.length < allowance, status: membership?.status || "free" };
  }),

  interests: protectedProcedure.input(z.object({ profileId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const profile = await getOwnedProfile(ctx.user.id, input.profileId);
    if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    return getProfileInterestKeys(input.profileId);
  }),

  saveInterests: protectedProcedure.input(z.object({ profileId: z.number().int().positive(), interests: z.array(z.enum(INTEREST_KEYS)).max(6) })).mutation(async ({ ctx, input }) => {
    const interests = await saveOwnedProfileInterests(ctx.user.id, input.profileId, input.interests);
    if (!interests) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    return interests;
  }),

  builder: protectedProcedure.input(z.object({ profileId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const builder = await getBuilderProfile(ctx.user.id, input.profileId);
    if (!builder) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    return builder;
  }),

  create: protectedProcedure.input(createProfileInput).mutation(async ({ ctx, input }) => {
    try {
      const [membership, existingProfiles] = await Promise.all([getAccountMembership(ctx.user.id), getProfilesForUser(ctx.user.id)]);
      const allowance = portalAllowance(membership);
      if (existingProfiles.length >= allowance) {
        throw new TRPCError({ code: "FORBIDDEN", message: `Your account currently includes up to ${allowance} Portals.` });
      }
      const { interests, ...profileInput } = input;
      const profile = await createProfileForUser(ctx.user.id, profileInput);
      if (!profile) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Profile could not be created" });
      await saveOwnedProfileInterests(ctx.user.id, profile.id, interests);
      return profile;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({ code: "CONFLICT", message: "That WhoAreWe handle is already taken" });
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
        mapAccentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
        mapIcon: z.enum(mapIcons).optional(),
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

  saveNetworkLayout: protectedProcedure
    .input(z.object({ positions: z.array(z.object({ profileId: z.number().int().positive(), mapPositionX: z.number().int().min(8).max(92), mapPositionY: z.number().int().min(10).max(90) })).min(1).max(12) }))
    .mutation(async ({ ctx, input }) => {
      const network = await updateOwnedPortalLayout(ctx.user.id, input.positions);
      if (!network) throw new TRPCError({ code: "NOT_FOUND", message: "Every Portal must belong to your account" });
      return network;
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

  linkPortal: protectedProcedure
    .input(z.object({ profileId: z.number().int().positive(), targetProfileId: z.number().int().positive(), positionX: z.number().int().min(5).max(95).default(82), positionY: z.number().int().min(8).max(92).default(28), relationshipType: z.enum(portalRelationshipTypes).default("related"), relationshipLabel: z.string().trim().max(72).optional() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const node = await linkOwnedPortal(ctx.user.id, input);
        if (!node) throw new TRPCError({ code: "NOT_FOUND", message: "Both Portals must belong to your account" });
        return node;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "The Portal link could not be created" });
      }
    }),
});
