import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { nodesRouter } from "./nodes";
import { portalRouter } from "./portal";
import { profileRouter } from "./profile";
import { relationshipsRouter } from "./relationships";
import { signalsRouter } from "./signals";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  profile: profileRouter,
  portal: portalRouter,
  nodes: nodesRouter,
  signals: signalsRouter,
  relationships: relationshipsRouter,
});

export type AppRouter = typeof appRouter;
