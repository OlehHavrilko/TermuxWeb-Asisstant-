import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  scripts, InsertScript, Script,
  scriptExecutions, InsertScriptExecution,
  projectTemplates, InsertProjectTemplate,
  userProjects, InsertUserProject,
  localServices, InsertLocalService,
  terminalSessions, InsertTerminalSession,
  gitRepositories, InsertGitRepository
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Script queries
export async function createScript(userId: number, script: Omit<InsertScript, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(scripts).values({ ...script, userId });
  return result;
}

export async function getUserScripts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scripts).where(eq(scripts.userId, userId));
}

export async function getScript(scriptId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(scripts).where(and(eq(scripts.id, scriptId), eq(scripts.userId, userId))).limit(1);
  return result[0] || null;
}

export async function updateScript(scriptId: number, userId: number, updates: Partial<Script>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(scripts).set(updates).where(and(eq(scripts.id, scriptId), eq(scripts.userId, userId)));
}

export async function deleteScript(scriptId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(scripts).where(and(eq(scripts.id, scriptId), eq(scripts.userId, userId)));
}

// Script execution queries
export async function createScriptExecution(execution: InsertScriptExecution) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(scriptExecutions).values(execution);
}

export async function getScriptExecutions(scriptId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scriptExecutions).where(eq(scriptExecutions.scriptId, scriptId)).orderBy(desc(scriptExecutions.createdAt)).limit(limit);
}

// Project template queries
export async function getProjectTemplates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projectTemplates);
}

export async function getProjectTemplate(templateId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(projectTemplates).where(eq(projectTemplates.id, templateId)).limit(1);
  return result[0] || null;
}

// User project queries
export async function createUserProject(userId: number, project: Omit<InsertUserProject, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(userProjects).values({ ...project, userId });
}

export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userProjects).where(eq(userProjects.userId, userId));
}

// Local service queries
export async function createLocalService(userId: number, service: Omit<InsertLocalService, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(localServices).values({ ...service, userId });
}

export async function getUserLocalServices(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(localServices).where(eq(localServices.userId, userId));
}

export async function updateLocalService(serviceId: number, userId: number, updates: Partial<typeof localServices.$inferSelect>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(localServices).set(updates).where(and(eq(localServices.id, serviceId), eq(localServices.userId, userId)));
}

// Terminal session queries
export async function createTerminalSession(userId: number, session: Omit<InsertTerminalSession, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(terminalSessions).values({ ...session, userId });
}

export async function getUserTerminalSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(terminalSessions).where(eq(terminalSessions.userId, userId));
}

export async function updateTerminalSession(sessionId: string, updates: Partial<typeof terminalSessions.$inferSelect>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(terminalSessions).set(updates).where(eq(terminalSessions.sessionId, sessionId));
}

// Git repository queries
export async function createGitRepository(userId: number, repo: Omit<InsertGitRepository, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(gitRepositories).values({ ...repo, userId });
}

export async function getUserGitRepositories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gitRepositories).where(eq(gitRepositories.userId, userId));
}

export async function updateGitRepository(repoId: number, userId: number, updates: Partial<typeof gitRepositories.$inferSelect>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(gitRepositories).set(updates).where(and(eq(gitRepositories.id, repoId), eq(gitRepositories.userId, userId)));
}
