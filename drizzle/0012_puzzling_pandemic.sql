CREATE TABLE `profile_interests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`interestKey` varchar(48) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profile_interests_id` PRIMARY KEY(`id`),
	CONSTRAINT `profile_interests_profile_interest_unique` UNIQUE(`profileId`,`interestKey`)
);
--> statement-breakpoint
CREATE INDEX `profile_interests_profile_idx` ON `profile_interests` (`profileId`);--> statement-breakpoint
CREATE INDEX `profile_interests_interest_idx` ON `profile_interests` (`interestKey`);