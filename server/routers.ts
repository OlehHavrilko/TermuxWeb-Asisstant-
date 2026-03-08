import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  scriptRouter,
  templateRouter,
  projectRouter,
  serviceRouter,
  terminalRouter,
  gitRouter,
  packageRouter,
  systemMonitorRouter,
  termuxApiRouter,
  fileManagerRouter,
} from "./features";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Feature routers
  scripts: scriptRouter,
  templates: templateRouter,
  projects: projectRouter,
  services: serviceRouter,
  terminal: terminalRouter,
  git: gitRouter,
  packages: packageRouter,
  monitor: systemMonitorRouter,
  api: termuxApiRouter,
  files: fileManagerRouter,
});

export type AppRouter = typeof appRouter;
