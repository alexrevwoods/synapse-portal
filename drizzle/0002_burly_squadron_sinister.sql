CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`actorProfileId` int,
	`notificationType` enum('follow','connection_request','connection_accepted','signal_reaction','signal_comment','signal_reply') NOT NULL,
	`signalId` int,
	`commentId` int,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `signal_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`signalId` int NOT NULL,
	`profileId` int NOT NULL,
	`parentCommentId` int,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `signal_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `signal_reactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`signalId` int NOT NULL,
	`profileId` int NOT NULL,
	`reactionType` enum('spark') NOT NULL DEFAULT 'spark',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `signal_reactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `signal_reactions_unique` UNIQUE(`signalId`,`profileId`,`reactionType`)
);
--> statement-breakpoint
CREATE INDEX `notifications_profile_created_idx` ON `notifications` (`profileId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `notifications_profile_read_idx` ON `notifications` (`profileId`,`readAt`);--> statement-breakpoint
CREATE INDEX `signal_comments_signal_idx` ON `signal_comments` (`signalId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `signal_comments_parent_idx` ON `signal_comments` (`parentCommentId`);--> statement-breakpoint
CREATE INDEX `signal_reactions_signal_idx` ON `signal_reactions` (`signalId`);--> statement-breakpoint
CREATE INDEX `signal_reactions_profile_idx` ON `signal_reactions` (`profileId`);