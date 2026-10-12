CREATE TABLE `nextdns_change_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`connection_revision` text NOT NULL,
	`profile_id` text NOT NULL,
	`kind` text NOT NULL,
	`plan` text NOT NULL,
	`state` text DEFAULT 'pending' NOT NULL,
	`result` text,
	`expires_at` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `nextdns_connections` (
	`user_id` text PRIMARY KEY NOT NULL,
	`encrypted_key` text NOT NULL,
	`profile_id` text NOT NULL,
	`profile_name` text NOT NULL,
	`allow_writes` integer DEFAULT 0 NOT NULL,
	`revision` text NOT NULL,
	`updated_at` text NOT NULL
);
