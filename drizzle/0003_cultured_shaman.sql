CREATE TABLE `blocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceProfileId` int NOT NULL,
	`targetProfileId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `blocks_id` PRIMARY KEY(`id`),
	CONSTRAINT `blocks_unique` UNIQUE(`sourceProfileId`,`targetProfileId`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterProfileId` int NOT NULL,
	`targetProfileId` int,
	`signalId` int,
	`commentId` int,
	`reportReason` enum('spam','harassment','impersonation','hate','unsafe','other') NOT NULL,
	`details` text,
	`reportStatus` enum('open','reviewing','resolved','dismissed') NOT NULL DEFAULT 'open',
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `blocks_source_idx` ON `blocks` (`sourceProfileId`);--> statement-breakpoint
CREATE INDEX `blocks_target_idx` ON `blocks` (`targetProfileId`);--> statement-breakpoint
CREATE INDEX `reports_reporter_idx` ON `reports` (`reporterProfileId`);--> statement-breakpoint
CREATE INDEX `reports_target_idx` ON `reports` (`targetProfileId`);--> statement-breakpoint
CREATE INDEX `reports_status_created_idx` ON `reports` (`reportStatus`,`createdAt`);