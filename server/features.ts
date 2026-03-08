import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

// Script management router
export const scriptRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserScripts(ctx.user.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        language: z.enum(["bash", "python", "node", "sh"]),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return db.createScript(ctx.user.id, input);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return db.getScript(input.id, ctx.user.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        content: z.string().optional(),
        isScheduled: z.boolean().optional(),
        cronExpression: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      return db.updateScript(id, ctx.user.id, updates);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return db.deleteScript(input.id, ctx.user.id);
    }),

  execute: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const script = await db.getScript(input.id, ctx.user.id);
      if (!script) throw new Error("Script not found");

      const startTime = Date.now();
      try {
        // TODO: Execute the script using child_process or similar
        // This is a placeholder for actual execution logic
        const execution = await db.createScriptExecution({
          scriptId: input.id,
          userId: ctx.user.id,
          status: "success",
          output: "Script executed successfully",
          executionTime: Date.now() - startTime,
        });
        return execution;
      } catch (error) {
        await db.createScriptExecution({
          scriptId: input.id,
          userId: ctx.user.id,
          status: "failed",
          error: String(error),
          executionTime: Date.now() - startTime,
        });
        throw error;
      }
    }),

  executions: protectedProcedure
    .input(z.object({ scriptId: z.number(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      return db.getScriptExecutions(input.scriptId, input.limit);
    }),
});

// Project templates router
export const templateRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getProjectTemplates();
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getProjectTemplate(input.id);
    }),
});

// User projects router
export const projectRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserProjects(ctx.user.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        name: z.string().min(1),
        path: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return db.createUserProject(ctx.user.id, {
        templateId: input.templateId,
        name: input.name,
        path: input.path,
        status: "created",
      });
    }),
});

// Local services router
export const serviceRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserLocalServices(ctx.user.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: z.enum(["web", "database", "custom"]),
        port: z.number().optional(),
        command: z.string().min(1),
        autoStart: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return db.createLocalService(ctx.user.id, input);
    }),

  start: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return db.updateLocalService(input.id, ctx.user.id, { isRunning: true });
    }),

  stop: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return db.updateLocalService(input.id, ctx.user.id, { isRunning: false });
    }),
});

// Terminal sessions router
export const terminalRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserTerminalSessions(ctx.user.id);
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return db.createTerminalSession(ctx.user.id, {
        sessionId,
        name: input.name || "Terminal",
        history: [],
      });
    }),

  updateHistory: protectedProcedure
    .input(z.object({ sessionId: z.string(), history: z.array(z.any()) }))
    .mutation(async ({ input }) => {
      return db.updateTerminalSession(input.sessionId, { history: input.history });
    }),
});

// Git repositories router
export const gitRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserGitRepositories(ctx.user.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        url: z.string().url(),
        localPath: z.string().min(1),
        branch: z.string().default("main"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return db.createGitRepository(ctx.user.id, input);
    }),

  updateSync: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return db.updateGitRepository(input.id, ctx.user.id, { lastSync: new Date() });
    }),
});

// Package management router (placeholder for Termux pkg commands)
export const packageRouter = router({
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      // TODO: Implement package search using Termux pkg API
      return [];
    }),

  list: protectedProcedure.query(async () => {
    // TODO: List installed packages
    return [];
  }),

  install: protectedProcedure
    .input(z.object({ packageName: z.string() }))
    .mutation(async ({ input }) => {
      // TODO: Execute pkg install command
      return { success: true };
    }),

  remove: protectedProcedure
    .input(z.object({ packageName: z.string() }))
    .mutation(async ({ input }) => {
      // TODO: Execute pkg remove command
      return { success: true };
    }),

  update: protectedProcedure.mutation(async () => {
    // TODO: Execute pkg update command
    return { success: true };
  }),
});

// System monitoring router (placeholder)
export const systemMonitorRouter = router({
  getMetrics: protectedProcedure.query(async () => {
    // TODO: Gather system metrics (CPU, RAM, battery, network)
    return {
      cpu: 0,
      ram: 0,
      battery: 0,
      network: 0,
    };
  }),
});

// Termux API router (placeholder)
export const termuxApiRouter = router({
  getSms: protectedProcedure.query(async () => {
    // TODO: Get SMS messages using Termux:API
    return [];
  }),

  sendSms: protectedProcedure
    .input(z.object({ number: z.string(), message: z.string() }))
    .mutation(async ({ input }) => {
      // TODO: Send SMS using Termux:API
      return { success: true };
    }),

  getLocation: protectedProcedure.query(async () => {
    // TODO: Get GPS location using Termux:API
    return { latitude: 0, longitude: 0 };
  }),
});

// File manager router (placeholder)
export const fileManagerRouter = router({
  list: protectedProcedure
    .input(z.object({ path: z.string() }))
    .query(async ({ input }) => {
      // TODO: List files in directory
      return [];
    }),

  read: protectedProcedure
    .input(z.object({ path: z.string() }))
    .query(async ({ input }) => {
      // TODO: Read file content
      return "";
    }),

  write: protectedProcedure
    .input(z.object({ path: z.string(), content: z.string() }))
    .mutation(async ({ input }) => {
      // TODO: Write file content
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ path: z.string() }))
    .mutation(async ({ input }) => {
      // TODO: Delete file or directory
      return { success: true };
    }),
});
