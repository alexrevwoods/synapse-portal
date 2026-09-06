import { and, asc, desc, eq, inArray, isNull, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  type InsertUser,
  analyticsEvents,
  blocks,
  memberships,
  nodeConnections,
  notifications,
  notificationPreferences,
  profileBadges,
  profileInterests,
  profileMembers,
  profileNodes,
  profileRelationships,
  profiles,
  reports,
  signalComments,
  signalMedia,
  signalReactions,
  signals,
  platformSettings,
  users,
} from "../drizzle/schema";
import { canUseSkin, getSkin, isKnownSkin, normalizeSkinId, type MembershipPlan } from "../shared/skins";
import { catalogBadge, extraBadgeSlots, verificationBadge } from "../shared/badges";
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

export async function getProfileInterestKeys(profileId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ interestKey: profileInterests.interestKey }).from(profileInterests).where(eq(profileInterests.profileId, profileId));
  return rows.map((row) => row.interestKey);
}

export async function saveOwnedProfileInterests(userId: number, profileId: number, interestKeys: string[]) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const profile = await getOwnedProfile(userId, profileId);
  if (!profile) return null;
  const uniqueKeys = Array.from(new Set(interestKeys));
  await db.delete(profileInterests).where(eq(profileInterests.profileId, profileId));
  if (uniqueKeys.length) await db.insert(profileInterests).values(uniqueKeys.map((interestKey) => ({ profileId, interestKey })));
  return uniqueKeys;
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

export async function updateOwnedProfile(userId: number, profileId: number, input: { displayName?: string; bio?: string; location?: string; websiteUrl?: string; portalTheme?: string; avatarUrl?: string; brandLogoUrl?: string; brandPrimaryColor?: string; brandSecondaryColor?: string; customDomain?: string }) {
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

export async function getProfileBadgeState(userId: number, profileId: number) {
  const db = await getDb();
  if (!db) return null;
  const profile = await getOwnedProfile(userId, profileId);
  if (!profile) return null;
  const [membershipRows, equipped] = await Promise.all([
    db.select().from(memberships).where(eq(memberships.userId, userId)).limit(1),
    db.select().from(profileBadges).where(and(eq(profileBadges.profileId, profileId), eq(profileBadges.isEquipped, true))),
  ]);
  const membership = membershipRows[0] ?? null;
  const slots = extraBadgeSlots(membership);
  return { verification: verificationBadge(membership), slots, equipped: equipped.map(({ badgeKey }) => badgeKey).filter((key) => catalogBadge(key)).slice(0, slots) };
}

export async function saveProfileBadges(userId: number, profileId: number, badgeKeys: string[]) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const profile = await getOwnedProfile(userId, profileId);
  if (!profile) return null;
  const membershipRows = await db.select().from(memberships).where(eq(memberships.userId, userId)).limit(1);
  const slots = extraBadgeSlots(membershipRows[0]);
  const uniqueKeys = Array.from(new Set(badgeKeys));
  if (uniqueKeys.length > slots || uniqueKeys.some((key) => !catalogBadge(key))) return null;
  await db.delete(profileBadges).where(eq(profileBadges.profileId, profileId));
  if (uniqueKeys.length) await db.insert(profileBadges).values(uniqueKeys.map((badgeKey) => {
    const badge = catalogBadge(badgeKey)!;
    return { profileId, badgeKey, label: badge.label, tone: badge.tone, isEquipped: true };
  }));
  return getProfileBadgeState(userId, profileId);
}

export async function getPublicProfileBadges(profile: typeof profiles.$inferSelect) {
  const db = await getDb();
  if (!db) return [];
  const [membershipRows, equipped] = await Promise.all([
    db.select().from(memberships).where(eq(memberships.userId, profile.ownerUserId)).limit(1),
    db.select().from(profileBadges).where(and(eq(profileBadges.profileId, profile.id), eq(profileBadges.isEquipped, true))),
  ]);
  const membership = membershipRows[0] ?? null;
  const custom = equipped.map(({ badgeKey }) => catalogBadge(badgeKey)).filter((badge): badge is NonNullable<typeof badge> => Boolean(badge)).slice(0, extraBadgeSlots(membership));
  return [verificationBadge(membership), ...custom].filter((badge): badge is NonNullable<typeof badge> => Boolean(badge));
}

export async function getBuilderProfile(userId: number, profileId: number) {
  const db = await getDb();
  if (!db) return null;
  const profile = await getOwnedProfile(userId, profileId);
  if (!profile) return null;
  const [nodes, connections, recentSignals, badgeState] = await Promise.all([
    db.select().from(profileNodes).where(eq(profileNodes.profileId, profileId)).orderBy(asc(profileNodes.sortOrder)),
    db.select().from(nodeConnections).where(eq(nodeConnections.profileId, profileId)),
    db.select().from(signals).where(eq(signals.profileId, profileId)).orderBy(desc(signals.publishedAt)).limit(10),
    getProfileBadgeState(userId, profileId),
  ]);
  return { profile, nodes, connections, recentSignals, badgeState };
}

export async function getOwnedNode(userId: number, profileId: number, nodeId: number) {
  const db = await getDb();
  if (!db) return null;
  const profile = await getOwnedProfile(userId, profileId);
  if (!profile) return null;
  const rows = await db.select().from(profileNodes).where(and(eq(profileNodes.id, nodeId), eq(profileNodes.profileId, profileId))).limit(1);
  return rows[0] ?? null;
}

export async function createOwnedNode(userId: number, input: { profileId: number; type: "identity" | "social" | "web" | "content" | "conversion" | "synapse" | "event" | "product" | "booking" | "team"; title: string; subtitle?: string; description?: string; targetUrl?: string; positionX: number; positionY: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const profile = await getOwnedProfile(userId, input.profileId);
  if (!profile) return null;
  const existingNodes = await db.select({ id: profileNodes.id }).from(profileNodes).where(eq(profileNodes.profileId, input.profileId));
  const result = await db.insert(profileNodes).values({ ...input, sortOrder: existingNodes.length });
  const node = await db.select().from(profileNodes).where(eq(profileNodes.id, Number(result[0].insertId))).limit(1);
  return node[0] ?? null;
}

export async function updateOwnedNode(userId: number, input: { profileId: number; nodeId: number; title?: string; subtitle?: string; description?: string; targetUrl?: string; positionX?: number; positionY?: number; isPublic?: boolean; accentColor?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const node = await getOwnedNode(userId, input.profileId, input.nodeId);
  if (!node) return null;
  const { profileId, nodeId, ...updates } = input;
  await db.update(profileNodes).set(updates).where(and(eq(profileNodes.id, nodeId), eq(profileNodes.profileId, profileId)));
  const rows = await db.select().from(profileNodes).where(eq(profileNodes.id, nodeId)).limit(1);
  return rows[0] ?? null;
}

export async function arrangeOwnedNodes(userId: number, input: { profileId: number; positions: Array<{ nodeId: number; positionX: number; positionY: number }> }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const profile = await getOwnedProfile(userId, input.profileId);
  if (!profile) return null;
  const ids = Array.from(new Set(input.positions.map((position) => position.nodeId)));
  if (ids.length !== input.positions.length) return null;
  const owned = await db.select({ id: profileNodes.id }).from(profileNodes).where(and(eq(profileNodes.profileId, input.profileId), inArray(profileNodes.id, ids)));
  if (owned.length !== ids.length) return null;
  await Promise.all(input.positions.map((position) => db.update(profileNodes).set({ positionX: position.positionX, positionY: position.positionY }).where(and(eq(profileNodes.id, position.nodeId), eq(profileNodes.profileId, input.profileId)))));
  return input.positions;
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

type MediaInput = { storageUrl: string; altText?: string; focalX?: number; focalY?: number };

async function getMediaForSignals(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, signalIds: number[]) {
  if (!signalIds.length) return new Map<number, Array<typeof signalMedia.$inferSelect>>();
  const rows = await db.select().from(signalMedia).where(inArray(signalMedia.signalId, signalIds)).orderBy(asc(signalMedia.sortOrder));
  return rows.reduce((map, media) => {
    const current = map.get(media.signalId) ?? [];
    current.push(media);
    map.set(media.signalId, current);
    return map;
  }, new Map<number, Array<typeof signalMedia.$inferSelect>>());
}

export async function createOwnedSignal(userId: number, input: { profileId: number; type: "text" | "link" | "image" | "gallery" | "node" | "article" | "video" | "audio"; body: string; visibility: "public" | "followers" | "connections" | "subscribers" | "private"; isPinned?: boolean; reminderAt?: Date; imageAspect?: "wide" | "square"; media?: MediaInput[] }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const profile = await getOwnedProfile(userId, input.profileId);
  if (!profile) return null;
  const { media, ...signalInput } = input;
  const result = await db.insert(signals).values({ ...signalInput, imageUrl: media?.[0]?.storageUrl ?? null, publishedAt: new Date() });
  const signalId = Number(result[0].insertId);
  if (media?.length) await db.insert(signalMedia).values(media.map((item, sortOrder) => ({ signalId, storageUrl: item.storageUrl, altText: item.altText || null, focalX: item.focalX ?? 50, focalY: item.focalY ?? 50, sortOrder })));
  const rows = await db.select().from(signals).where(eq(signals.id, signalId)).limit(1);
  return rows[0] ? { ...rows[0], media: media ?? [] } : null;
}

export async function getOwnedSignals(userId: number, profileId: number) {
  const db = await getDb();
  if (!db) return [];
  const profile = await getOwnedProfile(userId, profileId);
  if (!profile) return null;
  const ownedSignals = await db.select().from(signals).where(eq(signals.profileId, profileId)).orderBy(desc(signals.isPinned), desc(signals.publishedAt));
  const media = await getMediaForSignals(db, ownedSignals.map((signal) => signal.id));
  return ownedSignals.map((signal) => ({ ...signal, media: media.get(signal.id) ?? [] }));
}

export async function getActiveDemoProfile() {
  const db = await getDb();
  if (!db) return null;
  const settings = await db.select().from(platformSettings).where(eq(platformSettings.id, "global")).limit(1);
  if (settings[0]?.activeDemoProfileId) {
    const chosen = await db.select().from(profiles).where(and(eq(profiles.id, settings[0].activeDemoProfileId), eq(profiles.isPublished, true))).limit(1);
    if (chosen[0]) return chosen[0];
  }
  const fallback = await db.select().from(profiles).where(and(eq(profiles.username, "mediarevolution"), eq(profiles.isPublished, true))).limit(1);
  return fallback[0] ?? null;
}

export async function getPublishedProfilesForAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(profiles).where(eq(profiles.isPublished, true)).orderBy(asc(profiles.displayName));
}

export async function setActiveDemoProfile(profileId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const profile = await db.select().from(profiles).where(and(eq(profiles.id, profileId), eq(profiles.isPublished, true))).limit(1);
  if (!profile[0]) return null;
  await db.insert(platformSettings).values({ id: "global", activeDemoProfileId: profileId }).onDuplicateKeyUpdate({ set: { activeDemoProfileId: profileId, updatedAt: new Date() } });
  return profile[0];
}

export async function updateOwnedPrivateNote(userId: number, input: { profileId: number; signalId: number; isPinned?: boolean; reminderAt?: Date | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const profile = await getOwnedProfile(userId, input.profileId);
  if (!profile) return null;
  const rows = await db.select().from(signals).where(and(eq(signals.id, input.signalId), eq(signals.profileId, input.profileId), eq(signals.visibility, "private"))).limit(1);
  if (!rows[0]) return null;
  const updates: { isPinned?: boolean; reminderAt?: Date | null } = {};
  if (input.isPinned !== undefined) updates.isPinned = input.isPinned;
  if (input.reminderAt !== undefined) updates.reminderAt = input.reminderAt;
  await db.update(signals).set(updates).where(eq(signals.id, input.signalId));
  const updated = await db.select().from(signals).where(eq(signals.id, input.signalId)).limit(1);
  return updated[0] ?? null;
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
  const membershipRows = await db.select().from(memberships).where(eq(memberships.userId, profile.ownerUserId)).limit(1);
  const plan = (membershipRows[0]?.plan || "core") as MembershipPlan;
  const selectedSkin = normalizeSkinId(profile.portalTheme);
  const resolvedSkin = canUseSkin(plan, selectedSkin) ? selectedSkin : "signal";
  const [nodes, connections, recentSignals, badges] = await Promise.all([
    db.select().from(profileNodes).where(and(eq(profileNodes.profileId, profile.id), eq(profileNodes.isPublic, true))).orderBy(asc(profileNodes.sortOrder)),
    db.select().from(nodeConnections).where(eq(nodeConnections.profileId, profile.id)),
    db.select().from(signals).where(and(eq(signals.profileId, profile.id), eq(signals.visibility, "public"))).orderBy(desc(signals.publishedAt)).limit(20),
    getPublicProfileBadges(profile),
  ]);
  const publicNodeIds = new Set(nodes.map((node) => node.id));
  return { profile: { ...profile, portalTheme: resolvedSkin }, nodes, connections: connections.filter((connection) => publicNodeIds.has(connection.fromNodeId) && publicNodeIds.has(connection.toNodeId)), recentSignals, badges };
}


type FeedRow = {
  signal: typeof signals.$inferSelect;
  profile: typeof profiles.$inferSelect;
};

async function enrichSignals(rows: FeedRow[], currentProfileId?: number) {
  const db = await getDb();
  if (!db || rows.length === 0) return rows.map((row) => ({ ...row, reactionCount: 0, reactedByCurrentProfile: false, comments: [] }));
  const signalIds = rows.map((row) => row.signal.id);
  const [reactionRows, commentRows, media] = await Promise.all([
    db.select().from(signalReactions).where(inArray(signalReactions.signalId, signalIds)),
    db
      .select({ comment: signalComments, profile: profiles })
      .from(signalComments)
      .innerJoin(profiles, eq(signalComments.profileId, profiles.id))
      .where(inArray(signalComments.signalId, signalIds))
      .orderBy(asc(signalComments.createdAt)),
    getMediaForSignals(db, signalIds),
  ]);
  return rows.map((row) => ({
    ...row,
    reactionCount: reactionRows.filter((reaction) => reaction.signalId === row.signal.id).length,
    reactedByCurrentProfile: currentProfileId ? reactionRows.some((reaction) => reaction.signalId === row.signal.id && reaction.profileId === currentProfileId) : false,
    comments: commentRows.filter((entry) => entry.comment.signalId === row.signal.id),
    media: media.get(row.signal.id) ?? [],
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

type DiscoveryType = "all" | "personal" | "creator" | "business" | "organization" | "project";

export async function getDiscoverablePortals(input: { query?: string; profileType?: DiscoveryType }) {
  const db = await getDb();
  if (!db) return [];
  const query = input.query?.trim().toLowerCase();
  const conditions = [eq(profiles.isPublished, true)];
  if (input.profileType && input.profileType !== "all") conditions.push(eq(profiles.type, input.profileType));
  if (query) conditions.push(or(like(profiles.username, `%${query}%`), like(profiles.displayName, `%${query}%`), like(profiles.location, `%${query}%`))!);
  const rows = await db.select().from(profiles).where(and(...conditions)).orderBy(desc(profiles.updatedAt)).limit(60);
  return Promise.all(rows.map(async (profile) => ({
    id: profile.id,
    username: profile.username,
    displayName: profile.displayName,
    type: profile.type,
    bio: profile.bio,
    location: profile.location,
    avatarUrl: profile.avatarUrl,
    portalTheme: profile.portalTheme,
    badges: await getPublicProfileBadges(profile),
  })));
}

export async function getDiscoveryFeed(input: { query?: string; profileType?: DiscoveryType; currentProfileId?: number }) {
  const db = await getDb();
  if (!db) return [];
  const query = input.query?.trim().toLowerCase();
  const conditions = [eq(signals.visibility, "public"), eq(profiles.isPublished, true)];
  if (input.profileType && input.profileType !== "all") conditions.push(eq(profiles.type, input.profileType));
  if (query) conditions.push(or(like(profiles.username, `%${query}%`), like(profiles.displayName, `%${query}%`), like(signals.body, `%${query}%`))!);
  const rows = await db.select({ signal: signals, profile: profiles }).from(signals).innerJoin(profiles, eq(signals.profileId, profiles.id)).where(and(...conditions)).orderBy(desc(signals.publishedAt)).limit(60);
  if (!input.currentProfileId) return enrichSignals(rows);
  const blockRows = await db.select().from(blocks).where(or(eq(blocks.sourceProfileId, input.currentProfileId), eq(blocks.targetProfileId, input.currentProfileId)));
  const blockedProfileIds = new Set(blockRows.map((block) => block.sourceProfileId === input.currentProfileId ? block.targetProfileId : block.sourceProfileId));
  return enrichSignals(rows.filter((row) => !blockedProfileIds.has(row.profile.id)), input.currentProfileId);
}

export async function getFollowSuggestions(userId: number, profileId: number) {
  const db = await getDb();
  if (!db) return null;
  const [activeProfile, userProfiles] = await Promise.all([getOwnedProfile(userId, profileId), getProfilesForUser(userId)]);
  if (!activeProfile) return null;
  const ownProfileIds = new Set(userProfiles.map((profile) => profile.id));
  const [interestRows, relationshipRows, blockRows, candidates] = await Promise.all([
    db.select({ interestKey: profileInterests.interestKey }).from(profileInterests).where(eq(profileInterests.profileId, profileId)),
    db.select().from(profileRelationships).where(or(eq(profileRelationships.sourceProfileId, profileId), eq(profileRelationships.targetProfileId, profileId))),
    db.select().from(blocks).where(or(eq(blocks.sourceProfileId, profileId), eq(blocks.targetProfileId, profileId))),
    db.select().from(profiles).where(eq(profiles.isPublished, true)).orderBy(desc(profiles.updatedAt)).limit(80),
  ]);
  const selectedInterests = new Set(interestRows.map((row) => row.interestKey));
  const alreadyRelated = new Set(relationshipRows.filter((relationship) => relationship.status !== "declined").map((relationship) => relationship.sourceProfileId === profileId ? relationship.targetProfileId : relationship.sourceProfileId));
  const blockedProfileIds = new Set(blockRows.map((block) => block.sourceProfileId === profileId ? block.targetProfileId : block.sourceProfileId));
  const directConnectionIds = relationshipRows.filter((relationship) => relationship.type === "connection" && relationship.status === "accepted").map((relationship) => relationship.sourceProfileId === profileId ? relationship.targetProfileId : relationship.sourceProfileId);
  const available = candidates.filter((candidate) => !ownProfileIds.has(candidate.id) && !alreadyRelated.has(candidate.id) && !blockedProfileIds.has(candidate.id));
  if (!available.length) return [];
  const candidateIds = available.map((candidate) => candidate.id);
  const [candidateInterests, mutualRows] = await Promise.all([
    db.select().from(profileInterests).where(inArray(profileInterests.profileId, candidateIds)),
    directConnectionIds.length ? db.select().from(profileRelationships).where(and(eq(profileRelationships.type, "connection"), eq(profileRelationships.status, "accepted"), or(inArray(profileRelationships.sourceProfileId, directConnectionIds), inArray(profileRelationships.targetProfileId, directConnectionIds)))) : Promise.resolve([]),
  ]);
  const interestMap = new Map<number, string[]>();
  candidateInterests.forEach((row) => interestMap.set(row.profileId, [...(interestMap.get(row.profileId) || []), row.interestKey]));
  const mutualCount = new Map<number, number>();
  mutualRows.forEach((relationship) => {
    const candidateId = directConnectionIds.includes(relationship.sourceProfileId) ? relationship.targetProfileId : relationship.sourceProfileId;
    if (candidateIds.includes(candidateId) && candidateId !== profileId) mutualCount.set(candidateId, (mutualCount.get(candidateId) || 0) + 1);
  });
  const scored = available.map((candidate) => {
    const sharedInterestKeys = (interestMap.get(candidate.id) || []).filter((key) => selectedInterests.has(key));
    const sharedConnections = mutualCount.get(candidate.id) || 0;
    const sameType = candidate.type === activeProfile.type;
    const score = sharedInterestKeys.length * 12 + sharedConnections * 5 + (sameType ? 2 : 0);
    return { profile: candidate, sharedInterestKeys, sharedConnections, score };
  });
  const ranked = scored.filter((item) => item.score > 0).sort((first, second) => second.score - first.score || second.profile.updatedAt.getTime() - first.profile.updatedAt.getTime()).slice(0, 8);
  const visibleSuggestions = ranked.length ? ranked : scored.sort((first, second) => second.profile.updatedAt.getTime() - first.profile.updatedAt.getTime()).slice(0, 4);
  return Promise.all(visibleSuggestions.map(async (item) => ({
    profile: item.profile,
    badges: await getPublicProfileBadges(item.profile),
    sharedInterestKeys: item.sharedInterestKeys,
    sharedConnections: item.sharedConnections,
    reason: item.sharedInterestKeys.length ? `Shared interests: ${item.sharedInterestKeys.slice(0, 2).join(", ")}` : item.sharedConnections ? `${item.sharedConnections} shared Connection${item.sharedConnections === 1 ? "" : "s"}` : item.profile.type === activeProfile.type ? `Also a ${item.profile.type}` : "Recently active public Portal",
  })));
}

export async function getTimelineForProfile(userId: number, profileId: number) {
  const db = await getDb();
  if (!db) return null;
  const profile = await getOwnedProfile(userId, profileId);
  if (!profile) return null;
  const [relationships, blockRows] = await Promise.all([
    db
      .select()
      .from(profileRelationships)
      .where(
        or(
          and(eq(profileRelationships.sourceProfileId, profileId), eq(profileRelationships.type, "follow"), eq(profileRelationships.status, "accepted")),
          and(eq(profileRelationships.sourceProfileId, profileId), eq(profileRelationships.type, "connection"), eq(profileRelationships.status, "accepted")),
          and(eq(profileRelationships.targetProfileId, profileId), eq(profileRelationships.type, "connection"), eq(profileRelationships.status, "accepted")),
        ),
      ),
    db.select().from(blocks).where(or(eq(blocks.sourceProfileId, profileId), eq(blocks.targetProfileId, profileId))),
  ]);
  const blockedProfileIds = new Set(blockRows.map((block) => block.sourceProfileId === profileId ? block.targetProfileId : block.sourceProfileId));
  const networkProfileIds = relationships.map((relationship) => relationship.sourceProfileId === profileId ? relationship.targetProfileId : relationship.sourceProfileId).filter((id) => !blockedProfileIds.has(id));
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
  if (await isBlockedBetweenProfiles(actor.id, signal.profileId)) return null;
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
  if (await isBlockedBetweenProfiles(actor.id, signal.profileId)) return null;
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
  const preferenceRows = await db.select({ inAppEnabled: notificationPreferences.inAppEnabled }).from(notificationPreferences).where(eq(notificationPreferences.profileId, input.profileId)).limit(1);
  if (preferenceRows[0] && !preferenceRows[0].inAppEnabled) return null;
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


export async function isBlockedBetweenProfiles(firstProfileId: number, secondProfileId: number) {
  const db = await getDb();
  if (!db) return false;
  const rows = await db
    .select({ id: blocks.id })
    .from(blocks)
    .where(
      or(
        and(eq(blocks.sourceProfileId, firstProfileId), eq(blocks.targetProfileId, secondProfileId)),
        and(eq(blocks.sourceProfileId, secondProfileId), eq(blocks.targetProfileId, firstProfileId)),
      ),
    )
    .limit(1);
  return Boolean(rows[0]);
}

export async function blockProfile(userId: number, input: { sourceProfileId: number; targetUsername: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const source = await getOwnedProfile(userId, input.sourceProfileId);
  const target = await getPublishedProfileByUsername(input.targetUsername);
  if (!source || !target || source.id === target.id) return null;
  await db.insert(blocks).values({ sourceProfileId: source.id, targetProfileId: target.id }).onDuplicateKeyUpdate({ set: { createdAt: new Date() } });
  await db
    .update(profileRelationships)
    .set({ status: "blocked" })
    .where(
      or(
        and(eq(profileRelationships.sourceProfileId, source.id), eq(profileRelationships.targetProfileId, target.id)),
        and(eq(profileRelationships.sourceProfileId, target.id), eq(profileRelationships.targetProfileId, source.id)),
      ),
    );
  return { source, target };
}

export async function createReport(userId: number, input: { reporterProfileId: number; targetProfileId?: number; signalId?: number; commentId?: number; reason: "spam" | "harassment" | "impersonation" | "hate" | "unsafe" | "other"; details?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const reporter = await getOwnedProfile(userId, input.reporterProfileId);
  if (!reporter) return null;
  if (!input.targetProfileId && !input.signalId && !input.commentId) return null;
  const result = await db.insert(reports).values({
    reporterProfileId: reporter.id,
    targetProfileId: input.targetProfileId ?? null,
    signalId: input.signalId ?? null,
    commentId: input.commentId ?? null,
    reason: input.reason,
    details: input.details || null,
  });
  return Number(result[0].insertId);
}

export async function getReportsForModeration() {
  const db = await getDb();
  if (!db) return [];
  const reportRows = await db
    .select()
    .from(reports)
    .orderBy(asc(reports.status), desc(reports.createdAt))
    .limit(100);
  const profileIds = Array.from(new Set(reportRows.flatMap((report) => [report.reporterProfileId, report.targetProfileId].filter((id): id is number => id !== null))));
  const relatedProfiles = profileIds.length ? await db.select().from(profiles).where(inArray(profiles.id, profileIds)) : [];
  const profileMap = new Map(relatedProfiles.map((profile) => [profile.id, profile]));
  return reportRows.map((report) => ({ report, reporter: profileMap.get(report.reporterProfileId) ?? null, target: report.targetProfileId ? profileMap.get(report.targetProfileId) ?? null : null }));
}

export async function resolveReport(userId: number, reportId: number, status: "reviewing" | "resolved" | "dismissed") {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.update(reports).set({ status, reviewedByUserId: userId, reviewedAt: status === "reviewing" ? null : new Date() }).where(eq(reports.id, reportId));
  const rows = await db.select().from(reports).where(eq(reports.id, reportId)).limit(1);
  return rows[0] ?? null;
}

export async function recordAnalyticsEvent(input: { profileId: number; nodeId?: number; signalId?: number; eventType: "portal_view" | "node_open" | "signal_view"; visitorId?: string; sessionId?: string }) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(analyticsEvents).values({
    profileId: input.profileId,
    nodeId: input.nodeId ?? null,
    signalId: input.signalId ?? null,
    eventType: input.eventType,
    visitorId: input.visitorId ?? null,
    sessionId: input.sessionId ?? null,
  });
  return Number(result[0].insertId);
}

export async function getProfileAnalytics(userId: number, profileId: number) {
  const db = await getDb();
  if (!db) return null;
  const profile = await getOwnedProfile(userId, profileId);
  if (!profile) return null;
  const [eventRows, profileSignals, relationships, nodeRows] = await Promise.all([
    db.select().from(analyticsEvents).where(eq(analyticsEvents.profileId, profileId)).orderBy(desc(analyticsEvents.occurredAt)),
    db.select().from(signals).where(eq(signals.profileId, profileId)),
    db.select().from(profileRelationships).where(or(eq(profileRelationships.sourceProfileId, profileId), eq(profileRelationships.targetProfileId, profileId))),
    db.select().from(profileNodes).where(eq(profileNodes.profileId, profileId)),
  ]);
  const signalIds = profileSignals.map((signal) => signal.id);
  const [reactionRows, commentRows] = signalIds.length
    ? await Promise.all([
        db.select().from(signalReactions).where(inArray(signalReactions.signalId, signalIds)),
        db.select().from(signalComments).where(inArray(signalComments.signalId, signalIds)),
      ])
    : [[], []];
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const activity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(dayStart);
    date.setDate(dayStart.getDate() - (6 - index));
    const next = new Date(date);
    next.setDate(date.getDate() + 1);
    const events = eventRows.filter((event) => event.occurredAt >= date && event.occurredAt < next);
    return {
      label: new Intl.DateTimeFormat("en", { weekday: "short" }).format(date),
      date: date.toISOString().slice(0, 10),
      views: events.filter((event) => event.eventType === "portal_view").length,
      nodeOpens: events.filter((event) => event.eventType === "node_open").length,
      signalViews: events.filter((event) => event.eventType === "signal_view").length,
    };
  });
  const nodeOpens = nodeRows.map((node) => ({
    id: node.id,
    title: node.title,
    opens: eventRows.filter((event) => event.nodeId === node.id && event.eventType === "node_open").length,
  })).sort((first, second) => second.opens - first.opens);
  return {
    profile,
    overview: {
      portalViews: eventRows.filter((event) => event.eventType === "portal_view").length,
      nodeOpens: eventRows.filter((event) => event.eventType === "node_open").length,
      signalViews: eventRows.filter((event) => event.eventType === "signal_view").length,
      signals: profileSignals.length,
      reactions: reactionRows.length,
      comments: commentRows.length,
      followers: relationships.filter((relationship) => relationship.type === "follow" && relationship.targetProfileId === profileId && relationship.status === "accepted").length,
      connections: relationships.filter((relationship) => relationship.type === "connection" && relationship.status === "accepted").length,
    },
    activity,
    nodeOpens,
  };
}


export async function getAccountMembership(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(memberships).where(eq(memberships.userId, userId)).limit(1);
  if (existing[0]) return existing[0];
  const result = await db.insert(memberships).values({ userId, plan: "core", status: "free", trialEndsAt: null });
  const rows = await db.select().from(memberships).where(eq(memberships.id, Number(result[0].insertId))).limit(1);
  return rows[0] ?? null;
}

export async function updateAccountMembership(userId: number, input: { plan?: "core" | "pulse" | "nexus"; cancelAtPeriodEnd?: boolean; platformSkin?: string; skinPrimary?: string; skinSecondary?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const membership = await getAccountMembership(userId);
  if (!membership) return null;
  const activePlan = (input.plan || membership.plan) as MembershipPlan;
  const profileRows = input.plan ? await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.ownerUserId, userId)) : [];
  const profileAllowance = activePlan === "core" ? 1 : activePlan === "pulse" ? 3 : 5;
  if (input.plan && profileRows.length > profileAllowance) throw new Error(`Move or remove Profiles before selecting ${activePlan}`);
  if (input.platformSkin && !isKnownSkin(input.platformSkin)) throw new Error("That Skin does not exist");
  if (input.platformSkin && !canUseSkin(activePlan, input.platformSkin)) throw new Error("That Skin is not available on the selected membership");
  if (input.platformSkin === "brand" && activePlan !== "nexus") throw new Error("Brand Studio is available with Nexus");
  await db.update(memberships).set(input).where(eq(memberships.userId, userId));
  return getAccountMembership(userId);
}

export async function getNotificationPreferences(userId: number, profileId: number) {
  const db = await getDb();
  if (!db) return null;
  const profile = await getOwnedProfile(userId, profileId);
  if (!profile) return null;
  const existing = await db.select().from(notificationPreferences).where(eq(notificationPreferences.profileId, profileId)).limit(1);
  if (existing[0]) return existing[0];
  const result = await db.insert(notificationPreferences).values({ profileId });
  const rows = await db.select().from(notificationPreferences).where(eq(notificationPreferences.id, Number(result[0].insertId))).limit(1);
  return rows[0] ?? null;
}

export async function updateNotificationPreferences(userId: number, profileId: number, input: { inAppEnabled?: boolean; emailEnabled?: boolean; emailFollows?: boolean; emailConnections?: boolean; emailConversations?: boolean; digestFrequency?: "off" | "daily" | "weekly" }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const existing = await getNotificationPreferences(userId, profileId);
  if (!existing) return null;
  await db.update(notificationPreferences).set(input).where(eq(notificationPreferences.profileId, profileId));
  const rows = await db.select().from(notificationPreferences).where(eq(notificationPreferences.profileId, profileId)).limit(1);
  return rows[0] ?? null;
}
