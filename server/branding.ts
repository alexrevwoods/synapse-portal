import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getAccountMembership, updateOwnedProfile } from "./db";
import { protectedProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex color");
const domain = z.string().trim().toLowerCase().regex(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i, "Enter a valid domain, such as portal.example.com");

function decodeImage(dataUrl: string, mimeType: string) {
  const match = dataUrl.match(/^data:([a-zA-Z0-9/+.-]+);base64,([a-zA-Z0-9+/=]+)$/);
  if (!match || match[1] !== mimeType) throw new TRPCError({ code: "BAD_REQUEST", message: "Upload data is invalid" });
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > 2_500_000) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Images must be smaller than 2.5 MB" });
  return bytes;
}

export const brandingRouter = router({
  uploadImage: protectedProcedure
    .input(z.object({ profileId: z.number().int().positive(), asset: z.enum(["avatar", "logo"]), fileName: z.string().trim().min(1).max(120), mimeType: z.enum(["image/png", "image/jpeg", "image/webp"]), dataUrl: z.string().min(30).max(3_500_000) }))
    .mutation(async ({ ctx, input }) => {
      const bytes = decodeImage(input.dataUrl, input.mimeType);
      const extension = input.mimeType === "image/png" ? "png" : input.mimeType === "image/jpeg" ? "jpg" : "webp";
      const stored = await storagePut(`whoarewe/${ctx.user.id}/${input.profileId}/${input.asset}-${Date.now()}.${extension}`, bytes, input.mimeType);
      const profile = await updateOwnedProfile(ctx.user.id, input.profileId, input.asset === "avatar" ? { avatarUrl: stored.url } : { brandLogoUrl: stored.url });
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      return { url: stored.url, profile };
    }),

  update: protectedProcedure
    .input(z.object({ profileId: z.number().int().positive(), brandPrimaryColor: color.optional(), brandSecondaryColor: color.optional(), customDomain: domain.optional().or(z.literal("")) }))
    .mutation(async ({ ctx, input }) => {
      const membership = await getAccountMembership(ctx.user.id);
      if (!membership || membership.plan !== "nexus") throw new TRPCError({ code: "FORBIDDEN", message: "Brand Studio and custom domains are available with Nexus" });
      const { profileId, customDomain, ...updates } = input;
      const profile = await updateOwnedProfile(ctx.user.id, profileId, { ...updates, customDomain: customDomain || undefined });
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      return profile;
    }),
});
