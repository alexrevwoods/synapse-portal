import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { BADGE_CATALOG } from "../shared/badges";
import { getProfileBadgeState, saveProfileBadges } from "./db";
import { protectedProcedure, router } from "./_core/trpc";

const badgeKeys = BADGE_CATALOG.map((badge) => badge.badgeKey) as [string, ...string[]];

export const badgesRouter = router({
  mine: protectedProcedure.input(z.object({ profileId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const state = await getProfileBadgeState(ctx.user.id, input.profileId);
    if (!state) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    return { ...state, catalog: BADGE_CATALOG };
  }),
  save: protectedProcedure.input(z.object({ profileId: z.number().int().positive(), badgeKeys: z.array(z.enum(badgeKeys)).max(2) })).mutation(async ({ ctx, input }) => {
    const state = await saveProfileBadges(ctx.user.id, input.profileId, input.badgeKeys);
    if (!state) throw new TRPCError({ code: "FORBIDDEN", message: "Those badges are not available with this membership" });
    return state;
  }),
});
