ALTER TABLE `signals` ADD `isPinned` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `signals` ADD `reminderAt` timestamp;