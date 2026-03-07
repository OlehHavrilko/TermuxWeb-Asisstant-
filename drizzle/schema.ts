import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Scripts table for storing user-created scripts
export const scripts = mysqlTable("scripts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  language: mysqlEnum("language", ["bash", "python", "node", "sh"]).default("bash").notNull(),
  content: text("content").notNull(),
  isScheduled: boolean("isScheduled").default(false).notNull(),
  cronExpression: varchar("cronExpression", { length: 255 }),
  lastRun: timestamp("lastRun"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Script = typeof scripts.$inferSelect;
export type InsertScript = typeof scripts.$inferInsert;

// Script execution history
export const scriptExecutions = mysqlTable("scriptExecutions", {
  id: int("id").autoincrement().primaryKey(),
  scriptId: int("scriptId").notNull(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["running", "success", "failed"]).notNull(),
  output: text("output"),
  error: text("error"),
  executionTime: int("executionTime"), // milliseconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScriptExecution = typeof scriptExecutions.$inferSelect;
export type InsertScriptExecution = typeof scriptExecutions.$inferInsert;

// Project templates
export const projectTemplates = mysqlTable("projectTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  language: mysqlEnum("language", ["python", "node", "go"]).notNull(),
  description: text("description"),
  initScript: text("initScript").notNull(),
  dependencies: json("dependencies"), // JSON array of dependencies
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectTemplate = typeof projectTemplates.$inferSelect;
export type InsertProjectTemplate = typeof projectTemplates.$inferInsert;

// User projects created from templates
export const userProjects = mysqlTable("userProjects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  templateId: int("templateId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  path: varchar("path", { length: 512 }).notNull(),
  status: mysqlEnum("status", ["created", "initialized", "failed"]).default("created").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProject = typeof userProjects.$inferSelect;
export type InsertUserProject = typeof userProjects.$inferInsert;

// Local servers and services
export const localServices = mysqlTable("localServices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["web", "database", "custom"]).notNull(),
  port: int("port"),
  command: text("command").notNull(),
  isRunning: boolean("isRunning").default(false).notNull(),
  autoStart: boolean("autoStart").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LocalService = typeof localServices.$inferSelect;
export type InsertLocalService = typeof localServices.$inferInsert;

// Terminal sessions
export const terminalSessions = mysqlTable("terminalSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).default("Terminal"),
  history: json("history"), // JSON array of commands
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TerminalSession = typeof terminalSessions.$inferSelect;
export type InsertTerminalSession = typeof terminalSessions.$inferInsert;

// Git repositories
export const gitRepositories = mysqlTable("gitRepositories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  localPath: varchar("localPath", { length: 512 }).notNull(),
  branch: varchar("branch", { length: 255 }).default("main"),
  lastSync: timestamp("lastSync"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GitRepository = typeof gitRepositories.$inferSelect;
export type InsertGitRepository = typeof gitRepositories.$inferInsert;