CREATE TABLE `platform_settings` (
	`id` varchar(32) NOT NULL,
	`activeDemoProfileId` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `signal_media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`signalId` int NOT NULL,
	`storageUrl` text NOT NULL,
	`altText` varchar(280),
	`focalX` int NOT NULL DEFAULT 50,
	`focalY` int NOT NULL DEFAULT 50,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `signal_media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `signal_media_signal_idx` ON `signal_media` (`signalId`,`sortOrder`);