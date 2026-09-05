import { z } from "zod";
import { getPublicPortalByUsername } from "./db";
import { publicProcedure, router } from "./_core/trpc";

export function normalizePortalUsername(value: string) {
  return value.trim().replace(/^@/, "").toLowerCase();
}

export const portalRouter = router({
  getPublic: publicProcedure
    .input(
      z.object({
        username: z.string().trim().min(2).max(48).regex(/^@?[a-zA-Z0-9_]+$/, "Use letters, numbers, and underscores only"),
      }),
    )
    .query(({ input }) => getPublicPortalByUsername(normalizePortalUsername(input.username))),
});
