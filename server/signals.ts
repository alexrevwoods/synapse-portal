import crypto from "node:crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createOwnedSignal, getOwnedProfile, getOwnedSignals, updateOwnedPrivateNote } from "./db";
import { storagePut } from "./storage";
import { protectedProcedure, router } from "./_core/trpc";

const signalTypes = ["text", "link", "image", "gallery", "node", "article", "video", "audio"] as const;
const visibilityTypes = ["public", "followers", "connections", "subscribers", "private"] as const;
const imageAspects = ["wide", "square"] as const;
const imageMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
const mimeExtensions: Record<(typeof imageMimeTypes)[number], string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const mediaInput = z.object({ storageUrl: z.string().regex(/^\/manus-storage\//), altText: z.string().trim().max(280).optional(), focalX: z.number().int().min(0).max(100).optional(), focalY: z.number().int().min(0).max(100).optional() });

export const signalsRouter = router({
  listMine: protectedProcedure.input(z.object({ profileId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const results = await getOwnedSignals(ctx.user.id, input.profileId);
    if (results === null) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    return results;
  }),
  uploadImage: protectedProcedure.input(z.object({ profileId: z.number().int().positive(), mimeType: z.enum(imageMimeTypes), base64: z.string().min(20).max(11_200_000) })).mutation(async ({ ctx, input }) => {
    const profile = await getOwnedProfile(ctx.user.id, input.profileId);
    if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    const image = Buffer.from(input.base64, "base64");
    if (!image.length || image.length > 8 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Choose an image smaller than 8 MB" });
    const filename = `signals/${ctx.user.id}/${profile.id}/${crypto.randomUUID()}.${mimeExtensions[input.mimeType]}`;
    const stored = await storagePut(filename, image, input.mimeType);
    return { url: stored.url };
  }),
  create: protectedProcedure.input(z.object({ profileId: z.number().int().positive(), type: z.enum(signalTypes), body: z.string().trim().max(5000), visibility: z.enum(visibilityTypes), reminderAt: z.coerce.date().optional(), imageAspect: z.enum(imageAspects).optional(), media: z.array(mediaInput).min(1).max(10).optional() })).mutation(async ({ ctx, input }) => {
    if (input.reminderAt && input.visibility !== "private") throw new TRPCError({ code: "BAD_REQUEST", message: "Reminders can only be attached to private notes" });
    const mediaCount = input.media?.length ?? 0;
    if ((input.type === "image" || input.type === "gallery") && !mediaCount) throw new TRPCError({ code: "BAD_REQUEST", message: "Choose at least one image before publishing" });
    if (mediaCount && input.media?.some((item) => !item.altText?.trim())) throw new TRPCError({ code: "BAD_REQUEST", message: "Add a short alt description for every image" });
    if (input.type === "image" && mediaCount > 1) throw new TRPCError({ code: "BAD_REQUEST", message: "Use a gallery Signal for more than one image" });
    if (input.type === "gallery" && mediaCount < 2) throw new TRPCError({ code: "BAD_REQUEST", message: "A gallery needs at least two images" });
    if (input.type !== "image" && input.type !== "gallery" && (mediaCount || input.imageAspect)) throw new TRPCError({ code: "BAD_REQUEST", message: "Image details belong only to image Signals" });
    if (input.type !== "image" && input.type !== "gallery" && !input.body) throw new TRPCError({ code: "BAD_REQUEST", message: "Write a Signal before publishing" });
    const signal = await createOwnedSignal(ctx.user.id, { ...input, imageAspect: mediaCount ? input.imageAspect ?? "wide" : undefined });
    if (!signal) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    return signal;
  }),
  updatePrivateNote: protectedProcedure.input(z.object({ profileId: z.number().int().positive(), signalId: z.number().int().positive(), isPinned: z.boolean().optional(), reminderAt: z.coerce.date().nullable().optional() })).mutation(async ({ ctx, input }) => {
    const signal = await updateOwnedPrivateNote(ctx.user.id, input);
    if (!signal) throw new TRPCError({ code: "NOT_FOUND", message: "Private note not found" });
    return signal;
  }),
});
