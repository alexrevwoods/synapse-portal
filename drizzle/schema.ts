import {
  boolean,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * The Account identity for authentication and billing. An Account can control
 * more than one Profile; social relationships always belong to Profiles.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const profileType = mysqlEnum("profileType", ["personal", "creator", "business", "organization", "project"]);
export const nodeType = mysqlEnum("nodeType", ["identity", "social", "web", "content", "conversion", "synapse"]);
export const signalVisibility = mysqlEnum("signalVisibility", ["public", "followers", "connections", "subscribers", "private"]);
export const relationshipType = mysqlEnum("relationshipType", ["follow", "connection", "collaborator", "associated"]);
export const relationshipStatus = mysqlEnum("relationshipStatus", ["pending", "accepted", "declined", "blocked"]);

export const profiles = mysqlTable(
  "profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerUserId: int("ownerUserId").notNull(),
    username: varchar("username", { length: 48 }).notNull(),
    displayName: varchar("displayName", { length: 120 }).notNull(),
    type: profileType.notNull(),
    bio: text("bio"),
    location: varchar("location", { length: 160 }),
    websiteUrl: varchar("websiteUrl", { length: 2048 }),
    avatarUrl: varchar("avatarUrl", { length: 2048 }),
    portalTheme: varchar("portalTheme", { length: 48 }).default("atlas").notNull(),
    isPublished: boolean("isPublished").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    usernameUnique: uniqueIndex("profiles_username_unique").on(table.username),
    ownerIndex: index("profiles_owner_user_idx").on(table.ownerUserId),
  }),
);

export const profileMembers = mysqlTable(
  "profile_members",
  {
    id: int("id").autoincrement().primaryKey(),
    profileId: int("profileId").notNull(),
    userId: int("userId").notNull(),
    role: mysqlEnum("profileMemberRole", ["owner", "editor", "analyst"]).default("owner").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({ profileUserUnique: uniqueIndex("profile_members_profile_user_unique").on(table.profileId, table.userId) }),
);

/** A presentation-independent object that can render in Graph, Bento, or Classic Portal views. */
export const profileNodes = mysqlTable(
  "profile_nodes",
  {
    id: int("id").autoincrement().primaryKey(),
    profileId: int("profileId").notNull(),
    type: nodeType.notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    subtitle: varchar("subtitle", { length: 220 }),
    description: text("description"),
    targetUrl: varchar("targetUrl", { length: 2048 }),
    internalProfileId: int("internalProfileId"),
    icon: varchar("icon", { length: 64 }),
    accentColor: varchar("accentColor", { length: 24 }),
    positionX: int("positionX").default(50).notNull(),
    positionY: int("positionY").default(50).notNull(),
    sortOrder: int("sortOrder").default(0).notNull(),
    isPublic: boolean("isPublic").default(true).notNull(),
    metadata: json("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({ profileIndex: index("profile_nodes_profile_idx").on(table.profileId) }),
);

export const nodeConnections = mysqlTable(
  "node_connections",
  {
    id: int("id").autoincrement().primaryKey(),
    profileId: int("profileId").notNull(),
    fromNodeId: int("fromNodeId").notNull(),
    toNodeId: int("toNodeId").notNull(),
    label: varchar("label", { length: 120 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    profileIndex: index("node_connections_profile_idx").on(table.profileId),
    nodePairUnique: uniqueIndex("node_connections_pair_unique").on(table.fromNodeId, table.toNodeId),
  }),
);

export const signals = mysqlTable(
  "signals",
  {
    id: int("id").autoincrement().primaryKey(),
    profileId: int("profileId").notNull(),
    type: mysqlEnum("signalType", ["text", "link", "image", "gallery", "node", "article", "video", "audio"]).default("text").notNull(),
    body: text("body").notNull(),
    visibility: signalVisibility.default("public").notNull(),
    attachedNodeId: int("attachedNodeId"),
    publishedAt: timestamp("publishedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({ profilePublishedIndex: index("signals_profile_published_idx").on(table.profileId, table.publishedAt) }),
);

export const profileRelationships = mysqlTable(
  "profile_relationships",
  {
    id: int("id").autoincrement().primaryKey(),
    sourceProfileId: int("sourceProfileId").notNull(),
    targetProfileId: int("targetProfileId").notNull(),
    type: relationshipType.notNull(),
    status: relationshipStatus.default("pending").notNull(),
    privateLabel: varchar("privateLabel", { length: 64 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    sourceIndex: index("profile_relationships_source_idx").on(table.sourceProfileId),
    targetIndex: index("profile_relationships_target_idx").on(table.targetProfileId),
    relationshipUnique: uniqueIndex("profile_relationships_unique").on(table.sourceProfileId, table.targetProfileId, table.type),
  }),
);

/** Normalized interaction events preserve a path-analytics foundation from day one. */
export const analyticsEvents = mysqlTable(
  "analytics_events",
  {
    id: int("id").autoincrement().primaryKey(),
    profileId: int("profileId").notNull(),
    nodeId: int("nodeId"),
    signalId: int("signalId"),
    eventType: varchar("eventType", { length: 64 }).notNull(),
    visitorId: varchar("visitorId", { length: 96 }),
    sessionId: varchar("sessionId", { length: 96 }),
    metadata: json("metadata").$type<Record<string, unknown>>(),
    occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  },
  (table) => ({ profileEventIndex: index("analytics_events_profile_event_idx").on(table.profileId, table.eventType, table.occurredAt) }),
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type ProfileNode = typeof profileNodes.$inferSelect;
export type Signal = typeof signals.$inferSelect;
