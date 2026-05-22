ALTER TABLE `bag_items` ADD `description` text;--> statement-breakpoint
ALTER TABLE `bag_items` ADD `rarity` text;--> statement-breakpoint
ALTER TABLE `bag_items` ADD `magic_bonus` integer NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `bag_items` ADD `system_meta` text;