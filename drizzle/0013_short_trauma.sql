-- Keep the migration reversible at the data level: first allow both enum values,
-- translate existing legacy rows, then remove the obsolete value from the schema.
ALTER TABLE `profile_nodes` MODIFY COLUMN `nodeType` enum('identity','social','web','content','conversion','synapse','portal','event','product','booking','team') NOT NULL;
UPDATE `profile_nodes` SET `nodeType` = 'portal' WHERE `nodeType` = 'synapse';
ALTER TABLE `profile_nodes` MODIFY COLUMN `nodeType` enum('identity','social','web','content','conversion','portal','event','product','booking','team') NOT NULL;
