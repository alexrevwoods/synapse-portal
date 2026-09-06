import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createOwnedSignal, getOwnedSignals, updateOwnedPrivateNote } from "./db";
import { protectedProcedure, router } from "./_core/trpc";

const signalTypes = ["text", "link", "image", "gallery", "node", "article", "video", "audio"] as const;
const visibilityTypes = ["public", "followers", "connections", "subscribers", "private"] as const;

export const signalsRouter = router({
  listMine: protectedProcedure.input(z.object({ profileId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const results = await getOwnedSignals(ctx.user.id, input.profileId);
    if (results === null) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    return results;
  }),
  create: protectedProcedure.input(z.object({ profileId: z.number().int().positive(), type: z.enum(signalTypes), body: z.string().trim().min(1).max(5000), visibility: z.enum(visibilityTypes), reminderAt: z.coerce.date().optional() })).mutation(async ({ ctx, input }) => {
    if (input.reminderAt && input.visibility !== "private") throw new TRPCError({ code: "BAD_REQUEST", message: "Reminders can only be attached to private notes" });
    const signal = await createOwnedSignal(ctx.user.id, input);
    if (!signal) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    return signal;
  }),
  updatePrivateNote: protectedProcedure.input(z.object({ profileId: z.number().int().positive(), signalId: z.number().int().positive(), isPinned: z.boolean().optional(), reminderAt: z.coerce.date().nullable().optional() })).mutation(async ({ ctx, input }) => {
    const signal = await updateOwnedPrivateNote(ctx.user.id, input);
    if (!signal) throw new TRPCError({ code: "NOT_FOUND", message: "Private note not found" });
    return signal;
  }),
});
