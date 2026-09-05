CREATE TABLE `memberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`membershipPlan` enum('core','pulse','nexus') NOT NULL DEFAULT 'nexus',
	`membershipStatus` enum('trialing','active','canceled') NOT NULL DEFAULT 'trialing',
	`trialEndsAt` timestamp,
	`currentPeriodEndsAt` timestamp,
	`cancelAtPeriodEnd` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memberships_id` PRIMARY KEY(`id`),
	CONSTRAINT `memberships_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`inAppEnabled` boolean NOT NULL DEFAULT true,
	`emailEnabled` boolean NOT NULL DEFAULT false,
	`emailFollows` boolean NOT NULL DEFAULT true,
	`emailConnections` boolean NOT NULL DEFAULT true,
	`emailConversations` boolean NOT NULL DEFAULT true,
	`digestFrequency` enum('off','daily','weekly') NOT NULL DEFAULT 'weekly',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_profile_unique` UNIQUE(`profileId`)
);
