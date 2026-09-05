import { and, asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  type InsertUser,
  nodeConnections,
  profileMembers,
  profileNodes,
  profileRelationships,
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

export async function getProfilesForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(profiles).where(eq(profiles.ownerUserId, userId)).orderBy(asc(profiles.createdAt));
}

export async function getOwnedProfile(userId: number, profileId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.id, profileId), eq(profiles.ownerUserId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createProfileForUser(
  userId: number,
  input: { username: string; displayName: string; type: "personal" | "creator" | "business" | "organization" | "project"; bio?: string; location?: string },
) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const result = await db.insert(profiles).values({
    ownerUserId: userId,
    username: input.username,
    displayName: input.displayName,
    type: input.type,
    bio: input.bio || null,
    location: input.location || null,
  });
  const profileId = Number(result[0].insertId);
  await db.insert(profileMembers).values({ profileId, userId, role: "owner" });
  return getOwnedProfile(userId, profileId);
}

export async function updateOwnedProfile(
  userId: number,
  profileId: number,
  input: { displayName?: string; bio?: string; location?: string; websiteUrl?: string; portalTheme?: string },
) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.update(profiles).set(input).where(and(eq(profiles.id, profileId), eq(profiles.ownerUserId, userId)));
  return getOwnedProfile(userId, profileId);
}

export async function setProfilePublished(userId: number, profileId: number, isPublished: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.update(profiles).set({ isPublished }).where(and(eq(profiles.id, profileId), eq(profiles.ownerUserId, userId)));
  return getOwnedProfile(userId, profileId);
}

export async function getBuilderProfile(userId: number, profileId: number) {
  const db = await getDb();
  if (!db) return null;
  const profile = await getOwnedProfile(userId, profileId);
  if (!profile) return null;
  const [nodes, connections, recentSignals] = await Promise.all([
    db.select().from(profileNodes).where(eq(profileNodes.profileId, profileId)).orderBy(asc(profileNodes.sortOrder)),
    db.select().from(nodeConnections).where(eq(nodeConnections.profileId, profileId)),
    db.select().from(signals).where(eq(signals.profileId, profileId)).orderBy(desc(signals.publishedAt)).limit(6),
  ]);
  return { profile, nodes, connections, recentSignals };
}

export async function createOwnedNode(
  userId: number,
  input: {
    profileId: number;
    type: "identity" | "social" | "web" | "content" | "conversion" | "synapse";
    title: string;
    subtitle?: string;
    description?: string;
    targetUrl?: string;
    positionX: number;
    positionY: number;
  },
) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const profile = await getOwnedProfile(userId, input.profileId);
  if (!profile) return null;
  const existingNodes = await db.select({ id: profileNodes.id }).from(profileNodes).where(eq(profileNodes.profileId, input.profileId));
  const result = await db.insert(profileNodes).values({ ...input, sortOrder: existingNodes.length });
  const nodeId = Number(result[0].insertId);
  const node = await db.select().from(profileNodes).where(eq(profileNodes.id, nodeId)).limit(1);
  return node[0] ?? null;
}

export async function getPublishedProfileByUsername(username: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.username, username), eq(profiles.isPublished, true)))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertProfileRelationship(input: {
  sourceProfileId: number;
  targetProfileId: number;
  type: "follow" | "connection" | "collaborator" | "associated";
  status: "pending" | "accepted" | "declined" | "blocked";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db
    .insert(profileRelationships)
    .values(input)
    .onDuplicateKeyUpdate({ set: { status: input.status, updatedAt: new Date() } });
  const result = await db
    .select()
    .from(profileRelationships)
    .where(
      and(
        eq(profileRelationships.sourceProfileId, input.sourceProfileId),
        eq(profileRelationships.targetProfileId, input.targetProfileId),
        eq(profileRelationships.type, input.type),
      ),
    )
    .limit(1);
  return result[0] ?? null;
}

/** Returns only public identity data, keeping unpublished and private nodes private by construction. */
export async function getPublicPortalByUsername(username: string) {
  const db = await getDb();
  if (!db) return null;
  const profile = await getPublishedProfileByUsername(username);
  if (!profile) return null;

  const [nodes, connections, recentSignals] = await Promise.all([
    db.select().from(profileNodes).where(and(eq(profileNodes.profileId, profile.id), eq(profileNodes.isPublic, true))).orderBy(asc(profileNodes.sortOrder)),
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
