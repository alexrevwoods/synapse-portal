import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getActiveDemoProfile, getPublishedProfilesForAdmin, setActiveDemoProfile } from "./db";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";

export const platformRouter = router({
  demo: publicProcedure.query(async () => ({ profile: await getActiveDemoProfile() })),
  publishedPortals: adminProcedure.query(() => getPublishedProfilesForAdmin()),
  setDemo: adminProcedure.input(z.object({ profileId: z.number().int().positive() })).mutation(async ({ input }) => {
    const profile = await setActiveDemoProfile(input.profileId);
    if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Choose a published Portal for the platform demo" });
    return profile;
  }),
});
