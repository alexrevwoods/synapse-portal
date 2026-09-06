import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { acceptIncomingConnection, createNotification, getNetworkForProfile, getOwnedProfile, getPublishedProfileByUsername, getViewerRelationshipState, isBlockedBetweenProfiles, removeProfileRelationship, upsertProfileRelationship } from "./db";
import { normalizeUsername } from "./profile";
import { protectedProcedure, router } from "./_core/trpc";

const relationshipInput = z.object({ sourceProfileId: z.number().int().positive(), targetUsername: z.string().trim().min(2).max(48).regex(/^@?[a-zA-Z0-9_]+$/) });

async function resolveRelationship(ctx: { user: { id: number } }, input: z.infer<typeof relationshipInput>) {
  const source = await getOwnedProfile(ctx.user.id, input.sourceProfileId);
  if (!source) throw new TRPCError({ code: "NOT_FOUND", message: "Your selected Profile was not found" });
  if (!source.isPublished) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Publish your Portal before participating in the Network" });
  const target = await getPublishedProfileByUsername(normalizeUsername(input.targetUsername));
  if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "This public Profile is not available" });
  if (source.id === target.id) throw new TRPCError({ code: "BAD_REQUEST", message: "A Profile cannot connect to itself" });
  if (await isBlockedBetweenProfiles(source.id, target.id)) throw new TRPCError({ code: "FORBIDDEN", message: "This Profile is unavailable for social participation" });
  return { source, target };
}

export const relationshipsRouter = router({
  state: protectedProcedure.input(relationshipInput).query(async ({ ctx, input }) => {
    const relationshipState = await getViewerRelationshipState(ctx.user.id, { sourceProfileId: input.sourceProfileId, targetUsername: normalizeUsername(input.targetUsername) });
    if (!relationshipState) throw new TRPCError({ code: "NOT_FOUND", message: "Relationship context is unavailable" });
    return relationshipState;
  }),

  network: protectedProcedure.input(z.object({ profileId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const network = await getNetworkForProfile(ctx.user.id, input.profileId);
    if (!network) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    return network;
  }),

  follow: protectedProcedure.input(relationshipInput).mutation(async ({ ctx, input }) => {
    const { source, target } = await resolveRelationship(ctx, input);
    const relationship = await upsertProfileRelationship({ sourceProfileId: source.id, targetProfileId: target.id, type: "follow", status: "accepted" });
    await createNotification({ profileId: target.id, actorProfileId: source.id, type: "follow" });
    return relationship;
  }),

  remove: protectedProcedure.input(relationshipInput.extend({ type: z.enum(["follow", "connection"]) })).mutation(async ({ ctx, input }) => {
    const removed = await removeProfileRelationship(ctx.user.id, input);
    if (!removed) throw new TRPCError({ code: "NOT_FOUND", message: "Relationship not found" });
    return { removed: true } as const;
  }),

  requestConnection: protectedProcedure.input(relationshipInput).mutation(async ({ ctx, input }) => {
    const { source, target } = await resolveRelationship(ctx, input);
    const existing = await getViewerRelationshipState(ctx.user.id, { sourceProfileId: source.id, targetUsername: target.username });
    if (existing?.connection?.status === "accepted") return existing.connection;
    if (existing?.connection?.status === "pending" && existing.connectionDirection === "incoming") {
      throw new TRPCError({ code: "CONFLICT", message: "This Portal has already asked to Connect with you. Accept it in your Network." });
    }
    const relationship = await upsertProfileRelationship({ sourceProfileId: source.id, targetProfileId: target.id, type: "connection", status: "pending" });
    await createNotification({ profileId: target.id, actorProfileId: source.id, type: "connection_request" });
    return relationship;
  }),

  acceptConnection: protectedProcedure.input(z.object({ profileId: z.number().int().positive(), relationshipId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const connection = await acceptIncomingConnection(ctx.user.id, input);
    if (!connection || connection.status !== "accepted") throw new TRPCError({ code: "NOT_FOUND", message: "Pending Connection request not found" });
    await createNotification({ profileId: connection.sourceProfileId, actorProfileId: input.profileId, type: "connection_accepted" });
    return connection;
  }),
});
