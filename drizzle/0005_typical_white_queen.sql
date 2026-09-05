ALTER TABLE `memberships` ADD `platformSkin` varchar(48) DEFAULT 'signal' NOT NULL;--> statement-breakpoint
ALTER TABLE `memberships` ADD `skinPrimary` varchar(12) DEFAULT '#77e6fb' NOT NULL;--> statement-breakpoint
ALTER TABLE `memberships` ADD `skinSecondary` varchar(12) DEFAULT '#7467ff' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `brandLogoUrl` varchar(2048);--> statement-breakpoint
ALTER TABLE `profiles` ADD `brandPrimaryColor` varchar(12);--> statement-breakpoint
ALTER TABLE `profiles` ADD `brandSecondaryColor` varchar(12);--> statement-breakpoint
ALTER TABLE `profiles` ADD `customDomain` varchar(255);