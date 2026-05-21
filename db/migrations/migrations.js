// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo
// SQL content inlined to avoid Metro bundler issues with .sql imports

import journal from "./meta/_journal.json";

const m0000 = `CREATE TABLE IF NOT EXISTS \`bag_items\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`character_id\` text NOT NULL,
	\`item_id\` text,
	\`custom_name\` text,
	\`is_custom\` integer DEFAULT 0 NOT NULL,
	\`quantity\` integer DEFAULT 1 NOT NULL,
	\`location\` text DEFAULT 'backpack' NOT NULL,
	\`notes\` text,
	\`created_at\` integer NOT NULL,
	\`updated_at\` integer NOT NULL,
	FOREIGN KEY (\`character_id\`) REFERENCES \`characters\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS \`characters\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`name\` text NOT NULL,
	\`class\` text NOT NULL,
	\`race\` text NOT NULL,
	\`level\` integer DEFAULT 1 NOT NULL,
	\`system\` text NOT NULL,
	\`avatar_emoji\` text,
	\`created_at\` integer NOT NULL,
	\`updated_at\` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS \`custom_items\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`name\` text NOT NULL,
	\`category\` text NOT NULL,
	\`weight\` real DEFAULT 0 NOT NULL,
	\`cost\` real DEFAULT 0 NOT NULL,
	\`description\` text DEFAULT '',
	\`rarity\` text DEFAULT 'common' NOT NULL,
	\`created_at\` integer NOT NULL,
	\`updated_at\` integer NOT NULL
);`;

export default {
  journal,
  migrations: {
    m0000,
  },
};
