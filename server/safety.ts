import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { blockProfile, createReport, getReportsForModeration, resolveReport } from "./db";
import { normalizeUsername } from "./profile";
import { protectedProcedure, router } from "./_core/trpc";

const reportReasons = ["spam", "harassment", "impersonation", "hate", "unsafe", "other"] as const;

export const safetyRouter = router({
  block: protectedProcedure
    .input(z.object({ sourceProfileId: z.number().int().positive(), targetUsername: z.string().trim().min(2).max(48).regex(/^@?[a-zA-Z0-9_]+$/) }))
    .mutation(async ({ ctx, input }) => {
      const result = await blockProfile(ctx.user.id, { sourceProfileId: input.sourceProfileId, targetUsername: normalizeUsername(input.targetUsername) });
      if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "That Profile cannot be blocked" });
      return { blocked: true } as const;
    }),

  report: protectedProcedure
    .input(z.object({ reporterProfileId: z.number().int().positive(), targetProfileId: z.number().int().positive().optional(), signalId: z.number().int().positive().optional(), commentId: z.number().int().positive().optional(), reason: z.enum(reportReasons), details: z.string().trim().max(1000).optional() }))
    .mutation(async ({ ctx, input }) => {
      const reportId = await createReport(ctx.user.id, input);
      if (!reportId) throw new TRPCError({ code: "NOT_FOUND", message: "The report could not be filed" });
      return { reportId };
    }),
});

export const moderationRouter = router({
  listReports: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access required" });
    return getReportsForModeration();
  }),
  reviewReport: protectedProcedure
    .input(z.object({ reportId: z.number().int().positive(), status: z.enum(["reviewing", "resolved", "dismissed"]) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access required" });
      const report = await resolveReport(ctx.user.id, input.reportId, input.status);
      if (!report) throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
      return report;
    }),
});
