CREATE TABLE `profile_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`badgeKey` varchar(48) NOT NULL,
	`label` varchar(72) NOT NULL,
	`profileBadgeTone` enum('cyan','violet','lime','amber','rose') NOT NULL DEFAULT 'cyan',
	`isEquipped` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profile_badges_id` PRIMARY KEY(`id`),
	CONSTRAINT `profile_badges_profile_badge_unique` UNIQUE(`profileId`,`badgeKey`)
);
--> statement-breakpoint
CREATE INDEX `profile_badges_profile_idx` ON `profile_badges` (`profileId`);