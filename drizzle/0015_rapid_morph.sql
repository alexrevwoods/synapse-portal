ALTER TABLE `profiles` ADD `mapAccentColor` varchar(12) DEFAULT '#00D8FF' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `mapIcon` varchar(24) DEFAULT 'spark' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `mapPositionX` int DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `mapPositionY` int DEFAULT 50 NOT NULL;