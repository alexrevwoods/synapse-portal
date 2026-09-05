import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getOwnedProfile, getPublishedProfileByUsername, upsertProfileRelationship } from "./db";
import { normalizeUsername } from "./profile";
import { protectedProcedure, router } from "./_core/trpc";

const relationshipInput = z.object({
  sourceProfileId: z.number().int().positive(),
  targetUsername: z.string().trim().min(2).max(48).regex(/^@?[a-zA-Z0-9_]+$/),
});

async function resolveRelationship(ctx: { user: { id: number } }, input: z.infer<typeof relationshipInput>) {
  const source = await getOwnedProfile(ctx.user.id, input.sourceProfileId);
  if (!source) throw new TRPCError({ code: "NOT_FOUND", message: "Your selected Profile was not found" });
  if (!source.isPublished) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Publish your Portal before participating in the Network" });

  const target = await getPublishedProfileByUsername(normalizeUsername(input.targetUsername));
  if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "This public Profile is not available" });
  if (source.id === target.id) throw new TRPCError({ code: "BAD_REQUEST", message: "A Profile cannot connect to itself" });
  return { source, target };
}

export const relationshipsRouter = router({
  follow: protectedProcedure.input(relationshipInput).mutation(async ({ ctx, input }) => {
    const { source, target } = await resolveRelationship(ctx, input);
    return upsertProfileRelationship({
      sourceProfileId: source.id,
      targetProfileId: target.id,
      type: "follow",
      status: "accepted",
    });
  }),

  requestConnection: protectedProcedure.input(relationshipInput).mutation(async ({ ctx, input }) => {
    const { source, target } = await resolveRelationship(ctx, input);
    return upsertProfileRelationship({
      sourceProfileId: source.id,
      targetProfileId: target.id,
      type: "connection",
      status: "pending",
    });
  }),
});
