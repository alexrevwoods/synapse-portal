ALTER TABLE `profile_nodes` ADD `portalRelationshipType` enum('related','brand','team','project','community','location');--> statement-breakpoint
ALTER TABLE `profile_nodes` ADD `portalRelationshipLabel` varchar(72);--> statement-breakpoint
ALTER TABLE `signal_comments` ADD `deletedAt` timestamp;