import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  type InsertUser,
  nodeConnections,
  profileNodes,
  profiles,
  signals,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

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
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

/** Returns only public identity data, keeping unpublished and private nodes private by construction. */
export async function getPublicPortalByUsername(username: string) {
  const db = await getDb();
  if (!db) return null;

  const profileRows = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.username, username), eq(profiles.isPublished, true)))
    .limit(1);
  const profile = profileRows[0];
  if (!profile) return null;

  const [nodes, connections, recentSignals] = await Promise.all([
    db.select().from(profileNodes).where(and(eq(profileNodes.profileId, profile.id), eq(profileNodes.isPublic, true))),
    db.select().from(nodeConnections).where(eq(nodeConnections.profileId, profile.id)),
    db
      .select()
      .from(signals)
      .where(and(eq(signals.profileId, profile.id), eq(signals.visibility, "public")))
      .orderBy(desc(signals.publishedAt))
      .limit(6),
  ]);

  const publicNodeIds = new Set(nodes.map((node) => node.id));
  return {
    profile,
    nodes,
    connections: connections.filter((connection) => publicNodeIds.has(connection.fromNodeId) && publicNodeIds.has(connection.toNodeId)),
    recentSignals,
  };
}
