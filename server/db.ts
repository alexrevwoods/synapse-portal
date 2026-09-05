import { and, asc, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  type InsertUser,
  nodeConnections,
  notifications,
  profileMembers,
  profileNodes,
  profileRelationships,
  profiles,
  signalComments,
  signalReactions,
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
  (["name", "email", "loginMethod"] as const).forEach((field) => {
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
  const rows = await db.select().from(profiles).where(and(eq(profiles.id, profileId), eq(profiles.ownerUserId, userId))).limit(1);
  return rows[0] ?? null;
}

export async function createProfileForUser(userId: number, input: { username: string; displayName: string; type: "personal" | "creator" | "business" | "organization" | "project"; bio?: string; location?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const result = await db.insert(profiles).values({ ownerUserId: userId, username: input.username, displayName: input.displayName, type: input.type, bio: input.bio || null, location: input.location || null });
  const profileId = Number(result[0].insertId);
  await db.insert(profileMembers).values({ profileId, userId, role: "owner" });
  return getOwnedProfile(userId, profileId);
}

export async function updateOwnedProfile(userId: number, profileId: number, input: { displayName?: string; bio?: string; location?: string; websiteUrl?: string; portalTheme?: string }) {
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
    db.select().from(signals).where(eq(signals.profileId, profileId)).orderBy(desc(signals.publishedAt)).limit(10),
  ]);
  return { profile, nodes, connections, recentSignals };
}

export async function getOwnedNode(userId: number, profileId: number, nodeId: number) {
  const db = await getDb();
  if (!db) return null;
  const profile = await getOwnedProfile(userId, profileId);
  if (!profile) return null;
  const rows = await db.select().from(profileNodes).where(and(eq(profileNodes.id, nodeId), eq(profileNodes.profileId, profileId))).limit(1);
  return rows[0] ?? null;
}

export async function createOwnedNode(userId: number, input: { profileId: number; type: "identity" | "social" | "web" | "content" | "conversion" | "synapse"; title: string; subtitle?: string; description?: string; targetUrl?: string; positionX: number; positionY: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const profile = await getOwnedProfile(userId, input.profileId);
  if (!profile) return null;
  const existingNodes = await db.select({ id: profileNodes.id }).from(profileNodes).where(eq(profileNodes.profileId, input.profileId));
  const result = await db.insert(profileNodes).values({ ...input, sortOrder: existingNodes.length });
  const node = await db.select().from(profileNodes).where(eq(profileNodes.id, Number(result[0].insertId))).limit(1);
  return node[0] ?? null;
}

export async function updateOwnedNode(userId: number, input: { profileId: number; nodeId: number; title?: string; subtitle?: string; description?: string; targetUrl?: string; positionX?: number; positionY?: number; isPublic?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const node = await getOwnedNode(userId, input.profileId, input.nodeId);
  if (!node) return null;
  const { profileId, nodeId, ...updates } = input;
  await db.update(profileNodes).set(updates).where(and(eq(profileNodes.id, nodeId), eq(profileNodes.profileId, profileId)));
  const rows = await db.select().from(profileNodes).where(eq(profileNodes.id, nodeId)).limit(1);
  return rows[0] ?? null;
}

export async function deleteOwnedNode(userId: number, profileId: number, nodeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const node = await getOwnedNode(userId, profileId, nodeId);
  if (!node) return false;
  await db.delete(nodeConnections).where(and(eq(nodeConnections.profileId, profileId), or(eq(nodeConnections.fromNodeId, nodeId), eq(nodeConnections.toNodeId, nodeId))));
  await db.delete(profileNodes).where(and(eq(profileNodes.id, nodeId), eq(profileNodes.profileId, profileId)));
  return true;
}

export async function upsertOwnedNodeConnection(userId: number, input: { profileId: number; fromNodeId: number; toNodeId: number; label?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  if (input.fromNodeId === input.toNodeId) throw new Error("A Node cannot connect to itself");
  const profile = await getOwnedProfile(userId, input.profileId);
  if (!profile) return null;
  const nodes = await db.select({ id: profileNodes.id }).from(profileNodes).where(and(eq(profileNodes.profileId, input.profileId), inArray(profileNodes.id, [input.fromNodeId, input.toNodeId])));
  if (nodes.length !== 2) return null;
  await db.insert(nodeConnections).values(input).onDuplicateKeyUpdate({ set: { label: input.label ?? null } });
  const rows = await db.select().from(nodeConnections).where(and(eq(nodeConnections.profileId, input.profileId), eq(nodeConnections.fromNodeId, input.fromNodeId), eq(nodeConnections.toNodeId, input.toNodeId))).limit(1);
  return rows[0] ?? null;
}

export async function createOwnedSignal(userId: number, input: { profileId: number; type: "text" | "link" | "image" | "gallery" | "node" | "article" | "video" | "audio"; body: string; visibility: "public" | "followers" | "connections" | "subscribers" | "private" }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const profile = await getOwnedProfile(userId, input.profileId);
  if (!profile) return null;
  const result = await db.insert(signals).values({ ...input, publishedAt: new Date() });
  const rows = await db.select().from(signals).where(eq(signals.id, Number(result[0].insertId))).limit(1);
  return rows[0] ?? null;
}

export async function getOwnedSignals(userId: number, profileId: number) {
  const db = await getDb();
  if (!db) return [];
  const profile = await getOwnedProfile(userId, profileId);
  if (!profile) return null;
  return db.select().from(signals).where(eq(signals.profileId, profileId)).orderBy(desc(signals.publishedAt));
}

export async function getPublishedProfileByUsername(username: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(profiles).where(and(eq(profiles.username, username), eq(profiles.isPublished, true))).limit(1);
  return rows[0] ?? null;
}

export async function upsertProfileRelationship(input: { sourceProfileId: number; targetProfileId: number; type: "follow" | "connection" | "collaborator" | "associated"; status: "pending" | "accepted" | "declined" | "blocked" }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.insert(profileRelationships).values(input).onDuplicateKeyUpdate({ set: { status: input.status, updatedAt: new Date() } });
  const result = await db.select().from(profileRelationships).where(and(eq(profileRelationships.sourceProfileId, input.sourceProfileId), eq(profileRelationships.targetProfileId, input.targetProfileId), eq(profileRelationships.type, input.type))).limit(1);
  return result[0] ?? null;
}

export async function acceptIncomingConnection(userId: number, input: { profileId: number; relationshipId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const profile = await getOwnedProfile(userId, input.profileId);
  if (!profile) return null;
  await db.update(profileRelationships).set({ status: "accepted" }).where(and(eq(profileRelationships.id, input.relationshipId), eq(profileRelationships.targetProfileId, input.profileId), eq(profileRelationships.type, "connection"), eq(profileRelationships.status, "pending")));
  const rows = await db.select().from(profileRelationships).where(eq(profileRelationships.id, input.relationshipId)).limit(1);
  return rows[0] ?? null;
}

export async function getNetworkForProfile(userId: number, profileId: number) {
  const db = await getDb();
  if (!db) return null;
  const profile = await getOwnedProfile(userId, profileId);
  if (!profile) return null;
  const relationships = await db.select().from(profileRelationships).where(or(eq(profileRelationships.sourceProfileId, profileId), eq(profileRelationships.targetProfileId, profileId))).orderBy(desc(profileRelationships.updatedAt));
  const relatedIds = Array.from(new Set(relationships.map((relationship) => relationship.sourceProfileId === profileId ? relationship.targetProfileId : relationship.sourceProfileId)));
  const relatedProfiles = relatedIds.length ? await db.select().from(profiles).where(inArray(profiles.id, relatedIds)) : [];
  const profileMap = new Map(relatedProfiles.map((related) => [related.id, related]));
  return relationships.map((relationship) => {
    const isIncoming = relationship.targetProfileId === profileId;
    const counterpartId = isIncoming ? relationship.sourceProfileId : relationship.targetProfileId;
    return { relationship, direction: isIncoming ? "incoming" as const : "outgoing" as const, profile: profileMap.get(counterpartId) ?? null };
  });
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
    db.select().from(signals).where(and(eq(signals.profileId, profile.id), eq(signals.visibility, "public"))).orderBy(desc(signals.publishedAt)).limit(20),
  ]);
  const publicNodeIds = new Set(nodes.map((node) => node.id));
  return { profile, nodes, connections: connections.filter((connection) => publicNodeIds.has(connection.fromNodeId) && publicNodeIds.has(connection.toNodeId)), recentSignals };
}


type FeedRow = {
  signal: typeof signals.$inferSelect;
  profile: typeof profiles.$inferSelect;
};

async function enrichSignals(rows: FeedRow[], currentProfileId?: number) {
  const db = await getDb();
  if (!db || rows.length === 0) return rows.map((row) => ({ ...row, reactionCount: 0, reactedByCurrentProfile: false, comments: [] }));
  const signalIds = rows.map((row) => row.signal.id);
  const [reactionRows, commentRows] = await Promise.all([
    db.select().from(signalReactions).where(inArray(signalReactions.signalId, signalIds)),
    db
      .select({ comment: signalComments, profile: profiles })
      .from(signalComments)
      .innerJoin(profiles, eq(signalComments.profileId, profiles.id))
      .where(inArray(signalComments.signalId, signalIds))
      .orderBy(asc(signalComments.createdAt)),
  ]);
  return rows.map((row) => ({
    ...row,
    reactionCount: reactionRows.filter((reaction) => reaction.signalId === row.signal.id).length,
    reactedByCurrentProfile: currentProfileId ? reactionRows.some((reaction) => reaction.signalId === row.signal.id && reaction.profileId === currentProfileId) : false,
    comments: commentRows.filter((entry) => entry.comment.signalId === row.signal.id),
  }));
}

export async function getPublicSignalFeed(username: string, currentProfileId?: number) {
  const db = await getDb();
  if (!db) return null;
  const profile = await getPublishedProfileByUsername(username);
  if (!profile) return null;
  const rows = await db
    .select({ signal: signals, profile: profiles })
    .from(signals)
    .innerJoin(profiles, eq(signals.profileId, profiles.id))
    .where(and(eq(signals.profileId, profile.id), eq(signals.visibility, "public")))
    .orderBy(desc(signals.publishedAt));
  return enrichSignals(rows, currentProfileId);
}

export async function getTimelineForProfile(userId: number, profileId: number) {
  const db = await getDb();
  if (!db) return null;
  const profile = await getOwnedProfile(userId, profileId);
  if (!profile) return null;
  const relationships = await db
    .select()
    .from(profileRelationships)
    .where(
      or(
        and(eq(profileRelationships.sourceProfileId, profileId), eq(profileRelationships.type, "follow"), eq(profileRelationships.status, "accepted")),
        and(eq(profileRelationships.sourceProfileId, profileId), eq(profileRelationships.type, "connection"), eq(profileRelationships.status, "accepted")),
        and(eq(profileRelationships.targetProfileId, profileId), eq(profileRelationships.type, "connection"), eq(profileRelationships.status, "accepted")),
      ),
    );
  const networkProfileIds = relationships.map((relationship) => relationship.sourceProfileId === profileId ? relationship.targetProfileId : relationship.sourceProfileId);
  const feedProfileIds = Array.from(new Set([profileId, ...networkProfileIds]));
  const rows = await db
    .select({ signal: signals, profile: profiles })
    .from(signals)
    .innerJoin(profiles, eq(signals.profileId, profiles.id))
    .where(and(inArray(signals.profileId, feedProfileIds), eq(signals.visibility, "public")))
    .orderBy(desc(signals.publishedAt));
  return enrichSignals(rows, profileId);
}

export async function toggleSignalReaction(userId: number, input: { profileId: number; signalId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const actor = await getOwnedProfile(userId, input.profileId);
  if (!actor || !actor.isPublished) return null;
  const signalRows = await db.select().from(signals).where(eq(signals.id, input.signalId)).limit(1);
  const signal = signalRows[0];
  if (!signal) return null;
  const existing = await db
    .select()
    .from(signalReactions)
    .where(and(eq(signalReactions.signalId, input.signalId), eq(signalReactions.profileId, input.profileId), eq(signalReactions.type, "spark")))
    .limit(1);
  if (existing[0]) {
    await db.delete(signalReactions).where(eq(signalReactions.id, existing[0].id));
    return { active: false };
  }
  await db.insert(signalReactions).values({ signalId: input.signalId, profileId: input.profileId, type: "spark" });
  if (signal.profileId !== input.profileId) await createNotification({ profileId: signal.profileId, actorProfileId: input.profileId, type: "signal_reaction", signalId: signal.id });
  return { active: true };
}

export async function createSignalComment(userId: number, input: { profileId: number; signalId: number; body: string; parentCommentId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const actor = await getOwnedProfile(userId, input.profileId);
  if (!actor || !actor.isPublished) return null;
  const signalRows = await db.select().from(signals).where(eq(signals.id, input.signalId)).limit(1);
  const signal = signalRows[0];
  if (!signal) return null;
  if (input.parentCommentId) {
    const parentRows = await db.select().from(signalComments).where(and(eq(signalComments.id, input.parentCommentId), eq(signalComments.signalId, input.signalId))).limit(1);
    if (!parentRows[0]) return null;
  }
  const result = await db.insert(signalComments).values({ signalId: input.signalId, profileId: input.profileId, parentCommentId: input.parentCommentId ?? null, body: input.body });
  const commentId = Number(result[0].insertId);
  const rows = await db
    .select({ comment: signalComments, profile: profiles })
    .from(signalComments)
    .innerJoin(profiles, eq(signalComments.profileId, profiles.id))
    .where(eq(signalComments.id, commentId))
    .limit(1);
  const notificationProfileId = input.parentCommentId
    ? (await db.select().from(signalComments).where(eq(signalComments.id, input.parentCommentId)).limit(1))[0]?.profileId
    : signal.profileId;
  if (notificationProfileId && notificationProfileId !== input.profileId) {
    await createNotification({ profileId: notificationProfileId, actorProfileId: input.profileId, type: input.parentCommentId ? "signal_reply" : "signal_comment", signalId: signal.id, commentId });
  }
  return rows[0] ?? null;
}

export async function createNotification(input: { profileId: number; actorProfileId?: number; type: "follow" | "connection_request" | "connection_accepted" | "signal_reaction" | "signal_comment" | "signal_reply"; signalId?: number; commentId?: number }) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(notifications).values({
    profileId: input.profileId,
    actorProfileId: input.actorProfileId ?? null,
    type: input.type,
    signalId: input.signalId ?? null,
    commentId: input.commentId ?? null,
  });
  return Number(result[0].insertId);
}

export async function getNotificationsForProfile(userId: number, profileId: number) {
  const db = await getDb();
  if (!db) return null;
  const profile = await getOwnedProfile(userId, profileId);
  if (!profile) return null;
  return db
    .select({ notification: notifications, actor: profiles })
    .from(notifications)
    .leftJoin(profiles, eq(notifications.actorProfileId, profiles.id))
    .where(eq(notifications.profileId, profileId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function markNotificationsRead(userId: number, profileId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const profile = await getOwnedProfile(userId, profileId);
  if (!profile) return false;
  await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.profileId, profileId), isNull(notifications.readAt)));
  return true;
}
