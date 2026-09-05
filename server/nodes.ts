import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { deleteOwnedNode, updateOwnedNode, upsertOwnedNodeConnection } from "./db";
import { protectedProcedure, router } from "./_core/trpc";

const nodeUpdate = z.object({
  profileId: z.number().int().positive(),
  nodeId: z.number().int().positive(),
  title: z.string().trim().min(1).max(160).optional(),
  subtitle: z.string().trim().max(220).optional(),
  description: z.string().trim().max(1000).optional(),
  targetUrl: z.string().url().max(2048).optional().or(z.literal("")),
  positionX: z.number().int().min(5).max(95).optional(),
  positionY: z.number().int().min(8).max(92).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  isPublic: z.boolean().optional(),
});

export const nodesRouter = router({
  update: protectedProcedure.input(nodeUpdate).mutation(async ({ ctx, input }) => {
    const node = await updateOwnedNode(ctx.user.id, { ...input, targetUrl: input.targetUrl || undefined });
    if (!node) throw new TRPCError({ code: "NOT_FOUND", message: "Node not found" });
    return node;
  }),

  delete: protectedProcedure.input(z.object({ profileId: z.number().int().positive(), nodeId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const deleted = await deleteOwnedNode(ctx.user.id, input.profileId, input.nodeId);
    if (!deleted) throw new TRPCError({ code: "NOT_FOUND", message: "Node not found" });
    return { deleted: true } as const;
  }),

  connect: protectedProcedure
    .input(z.object({ profileId: z.number().int().positive(), fromNodeId: z.number().int().positive(), toNodeId: z.number().int().positive(), label: z.string().trim().max(120).optional() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const connection = await upsertOwnedNodeConnection(ctx.user.id, input);
        if (!connection) throw new TRPCError({ code: "NOT_FOUND", message: "Both Nodes must belong to this Profile" });
        return connection;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Connection could not be created" });
      }
    }),
});
