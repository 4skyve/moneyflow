CREATE TABLE `password_reset_codes` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`code` varchar(6) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `password_reset_codes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `reset_codes_user_idx` ON `password_reset_codes` (`user_id`);