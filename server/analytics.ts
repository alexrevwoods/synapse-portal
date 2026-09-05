import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getProfileAnalytics } from "./db";
import { protectedProcedure, router } from "./_core/trpc";

export const analyticsRouter = router({
  overview: protectedProcedure.input(z.object({ profileId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const analytics = await getProfileAnalytics(ctx.user.id, input.profileId);
    if (!analytics) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    return analytics;
  }),
});
