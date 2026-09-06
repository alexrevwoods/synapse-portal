CREATE TABLE `comment_reactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commentId` int NOT NULL,
	`profileId` int NOT NULL,
	`commentReactionType` enum('spark','heart','insight','celebrate') NOT NULL DEFAULT 'spark',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comment_reactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `comment_reactions_unique` UNIQUE(`commentId`,`profileId`,`commentReactionType`)
);
--> statement-breakpoint
CREATE INDEX `comment_reactions_comment_idx` ON `comment_reactions` (`commentId`);--> statement-breakpoint
CREATE INDEX `comment_reactions_profile_idx` ON `comment_reactions` (`profileId`);