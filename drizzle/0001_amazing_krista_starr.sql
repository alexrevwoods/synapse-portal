CREATE TABLE `analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`nodeId` int,
	`signalId` int,
	`eventType` varchar(64) NOT NULL,
	`visitorId` varchar(96),
	`sessionId` varchar(96),
	`metadata` json,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `node_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`fromNodeId` int NOT NULL,
	`toNodeId` int NOT NULL,
	`label` varchar(120),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `node_connections_id` PRIMARY KEY(`id`),
	CONSTRAINT `node_connections_pair_unique` UNIQUE(`fromNodeId`,`toNodeId`)
);
--> statement-breakpoint
CREATE TABLE `profile_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`userId` int NOT NULL,
	`profileMemberRole` enum('owner','editor','analyst') NOT NULL DEFAULT 'owner',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profile_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `profile_members_profile_user_unique` UNIQUE(`profileId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `profile_nodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`nodeType` enum('identity','social','web','content','conversion','synapse') NOT NULL,
	`title` varchar(160) NOT NULL,
	`subtitle` varchar(220),
	`description` text,
	`targetUrl` varchar(2048),
	`internalProfileId` int,
	`icon` varchar(64),
	`accentColor` varchar(24),
	`positionX` int NOT NULL DEFAULT 50,
	`positionY` int NOT NULL DEFAULT 50,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isPublic` boolean NOT NULL DEFAULT true,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profile_nodes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profile_relationships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceProfileId` int NOT NULL,
	`targetProfileId` int NOT NULL,
	`relationshipType` enum('follow','connection','collaborator','associated') NOT NULL,
	`relationshipStatus` enum('pending','accepted','declined','blocked') NOT NULL DEFAULT 'pending',
	`privateLabel` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profile_relationships_id` PRIMARY KEY(`id`),
	CONSTRAINT `profile_relationships_unique` UNIQUE(`sourceProfileId`,`targetProfileId`,`relationshipType`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`username` varchar(48) NOT NULL,
	`displayName` varchar(120) NOT NULL,
	`profileType` enum('personal','creator','business','organization','project') NOT NULL,
	`bio` text,
	`location` varchar(160),
	`websiteUrl` varchar(2048),
	`avatarUrl` varchar(2048),
	`portalTheme` varchar(48) NOT NULL DEFAULT 'atlas',
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `profiles_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`signalType` enum('text','link','image','gallery','node','article','video','audio') NOT NULL DEFAULT 'text',
	`body` text NOT NULL,
	`signalVisibility` enum('public','followers','connections','subscribers','private') NOT NULL DEFAULT 'public',
	`attachedNodeId` int,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `signals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `analytics_events_profile_event_idx` ON `analytics_events` (`profileId`,`eventType`,`occurredAt`);--> statement-breakpoint
CREATE INDEX `node_connections_profile_idx` ON `node_connections` (`profileId`);--> statement-breakpoint
CREATE INDEX `profile_nodes_profile_idx` ON `profile_nodes` (`profileId`);--> statement-breakpoint
CREATE INDEX `profile_relationships_source_idx` ON `profile_relationships` (`sourceProfileId`);--> statement-breakpoint
CREATE INDEX `profile_relationships_target_idx` ON `profile_relationships` (`targetProfileId`);--> statement-breakpoint
CREATE INDEX `profiles_owner_user_idx` ON `profiles` (`ownerUserId`);--> statement-breakpoint
CREATE INDEX `signals_profile_published_idx` ON `signals` (`profileId`,`publishedAt`);