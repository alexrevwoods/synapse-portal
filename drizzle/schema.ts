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

/** The Account identity for authentication and billing. Social actions belong to Profiles. */
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

/** Subscription is owned by the Account; Profiles consume the account allowance. */
export const memberships = mysqlTable(
  "memberships",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    plan: mysqlEnum("membershipPlan", ["core", "pulse", "nexus"]).default("nexus").notNull(),
    status: mysqlEnum("membershipStatus", ["free", "trialing", "active", "canceled"]).default("free").notNull(),
    trialEndsAt: timestamp("trialEndsAt"),
    currentPeriodEndsAt: timestamp("currentPeriodEndsAt"),
    cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false).notNull(),
    platformSkin: varchar("platformSkin", { length: 48 }).default("signal").notNull(),
    skinPrimary: varchar("skinPrimary", { length: 12 }).default("#77e6fb").notNull(),
    skinSecondary: varchar("skinSecondary", { length: 12 }).default("#7467ff").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({ userUnique: uniqueIndex("memberships_user_unique").on(table.userId) }),
);

export const profileType = mysqlEnum("profileType", ["personal", "creator", "business", "organization", "project"]);
export const nodeType = mysqlEnum("nodeType", ["identity", "social", "web", "content", "conversion", "synapse", "event", "product", "booking", "team"]);
export const signalVisibility = mysqlEnum("signalVisibility", ["public", "followers", "connections", "subscribers", "private"]);
export const relationshipType = mysqlEnum("relationshipType", ["follow", "connection", "collaborator", "associated"]);
export const relationshipStatus = mysqlEnum("relationshipStatus", ["pending", "accepted", "declined", "blocked"]);
export const reactionType = mysqlEnum("reactionType", ["spark"]);
export const notificationType = mysqlEnum("notificationType", ["follow", "connection_request", "connection_accepted", "signal_reaction", "signal_comment", "signal_reply"]);

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
    brandLogoUrl: varchar("brandLogoUrl", { length: 2048 }),
    brandPrimaryColor: varchar("brandPrimaryColor", { length: 12 }),
    brandSecondaryColor: varchar("brandSecondaryColor", { length: 12 }),
    customDomain: varchar("customDomain", { length: 255 }),
    portalTheme: varchar("portalTheme", { length: 48 }).default("atlas").notNull(),
    isPublished: boolean("isPublished").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({ usernameUnique: uniqueIndex("profiles_username_unique").on(table.username), ownerIndex: index("profiles_owner_user_idx").on(table.ownerUserId) }),
);

/** Delivery is opt-in by Profile; in-app notifications remain available independently. */
export const notificationPreferences = mysqlTable(
  "notification_preferences",
  {
    id: int("id").autoincrement().primaryKey(),
    profileId: int("profileId").notNull(),
    inAppEnabled: boolean("inAppEnabled").default(true).notNull(),
    emailEnabled: boolean("emailEnabled").default(false).notNull(),
    emailFollows: boolean("emailFollows").default(true).notNull(),
    emailConnections: boolean("emailConnections").default(true).notNull(),
    emailConversations: boolean("emailConversations").default(true).notNull(),
    digestFrequency: mysqlEnum("digestFrequency", ["off", "daily", "weekly"]).default("weekly").notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({ profileUnique: uniqueIndex("notification_preferences_profile_unique").on(table.profileId) }),
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
  (table) => ({ profileIndex: index("node_connections_profile_idx").on(table.profileId), nodePairUnique: uniqueIndex("node_connections_pair_unique").on(table.fromNodeId, table.toNodeId) }),
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
    isPinned: boolean("isPinned").default(false).notNull(),
    reminderAt: timestamp("reminderAt"),
    publishedAt: timestamp("publishedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({ profilePublishedIndex: index("signals_profile_published_idx").on(table.profileId, table.publishedAt) }),
);

export const signalReactions = mysqlTable(
  "signal_reactions",
  {
    id: int("id").autoincrement().primaryKey(),
    signalId: int("signalId").notNull(),
    profileId: int("profileId").notNull(),
    type: reactionType.default("spark").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    signalIndex: index("signal_reactions_signal_idx").on(table.signalId),
    profileIndex: index("signal_reactions_profile_idx").on(table.profileId),
    uniqueReaction: uniqueIndex("signal_reactions_unique").on(table.signalId, table.profileId, table.type),
  }),
);

export const signalComments = mysqlTable(
  "signal_comments",
  {
    id: int("id").autoincrement().primaryKey(),
    signalId: int("signalId").notNull(),
    profileId: int("profileId").notNull(),
    parentCommentId: int("parentCommentId"),
    body: text("body").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({ signalIndex: index("signal_comments_signal_idx").on(table.signalId, table.createdAt), parentIndex: index("signal_comments_parent_idx").on(table.parentCommentId) }),
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
  (table) => ({ sourceIndex: index("profile_relationships_source_idx").on(table.sourceProfileId), targetIndex: index("profile_relationships_target_idx").on(table.targetProfileId), relationshipUnique: uniqueIndex("profile_relationships_unique").on(table.sourceProfileId, table.targetProfileId, table.type) }),
);

/** Blocks are Profile-to-Profile safety boundaries and immediately exclude social participation. */
export const blocks = mysqlTable(
  "blocks",
  {
    id: int("id").autoincrement().primaryKey(),
    sourceProfileId: int("sourceProfileId").notNull(),
    targetProfileId: int("targetProfileId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    sourceIndex: index("blocks_source_idx").on(table.sourceProfileId),
    targetIndex: index("blocks_target_idx").on(table.targetProfileId),
    blockUnique: uniqueIndex("blocks_unique").on(table.sourceProfileId, table.targetProfileId),
  }),
);

/** Reports form a reviewable record for Profile, Signal, and comment safety concerns. */
export const reports = mysqlTable(
  "reports",
  {
    id: int("id").autoincrement().primaryKey(),
    reporterProfileId: int("reporterProfileId").notNull(),
    targetProfileId: int("targetProfileId"),
    signalId: int("signalId"),
    commentId: int("commentId"),
    reason: mysqlEnum("reportReason", ["spam", "harassment", "impersonation", "hate", "unsafe", "other"]).notNull(),
    details: text("details"),
    status: mysqlEnum("reportStatus", ["open", "reviewing", "resolved", "dismissed"]).default("open").notNull(),
    reviewedByUserId: int("reviewedByUserId"),
    reviewedAt: timestamp("reviewedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    reporterIndex: index("reports_reporter_idx").on(table.reporterProfileId),
    targetIndex: index("reports_target_idx").on(table.targetProfileId),
    statusCreatedIndex: index("reports_status_created_idx").on(table.status, table.createdAt),
  }),
);

export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    profileId: int("profileId").notNull(),
    actorProfileId: int("actorProfileId"),
    type: notificationType.notNull(),
    signalId: int("signalId"),
    commentId: int("commentId"),
    readAt: timestamp("readAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({ profileCreatedIndex: index("notifications_profile_created_idx").on(table.profileId, table.createdAt), profileReadIndex: index("notifications_profile_read_idx").on(table.profileId, table.readAt) }),
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
