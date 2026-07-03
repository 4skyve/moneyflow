CREATE TABLE `balance_adjustments` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`wallet_id` varchar(36) NOT NULL,
	`amount` decimal(14,2) NOT NULL,
	`reason` varchar(255),
	`occurred_at` timestamp NOT NULL,
	CONSTRAINT `balance_adjustments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('income','expense') NOT NULL,
	`icon` varchar(20) NOT NULL DEFAULT 'tag',
	`color` varchar(20) NOT NULL DEFAULT '#B8E0D2',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_notes` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`content` text NOT NULL,
	`occurred_at` timestamp NOT NULL,
	CONSTRAINT `daily_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favorite_transactions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`emoji` varchar(10) NOT NULL DEFAULT '⭐',
	`title` varchar(150) NOT NULL,
	`amount` decimal(14,2) NOT NULL,
	`category_id` varchar(36),
	`wallet_id` varchar(36),
	CONSTRAINT `favorite_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recurring_expenses` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`amount` decimal(14,2) NOT NULL,
	`day_of_month` int NOT NULL,
	`category_id` varchar(36),
	`icon` varchar(20) NOT NULL DEFAULT 'repeat',
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recurring_expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savings_accounts` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`icon` varchar(20) NOT NULL DEFAULT 'piggy-bank',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `savings_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savings_deposits` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`savings_account_id` varchar(36) NOT NULL,
	`wallet_id` varchar(36) NOT NULL,
	`amount` decimal(14,2) NOT NULL,
	`direction` enum('in','out') NOT NULL DEFAULT 'in',
	`note` text,
	`occurred_at` timestamp NOT NULL,
	CONSTRAINT `savings_deposits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savings_details` (
	`id` varchar(36) NOT NULL,
	`savings_account_id` varchar(36) NOT NULL,
	`label` varchar(100) NOT NULL,
	`amount` decimal(14,2) NOT NULL,
	CONSTRAINT `savings_details_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savings_goal_contributions` (
	`id` varchar(36) NOT NULL,
	`goal_id` varchar(36) NOT NULL,
	`wallet_id` varchar(36) NOT NULL,
	`amount` decimal(14,2) NOT NULL,
	`occurred_at` timestamp NOT NULL,
	CONSTRAINT `savings_goal_contributions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savings_goals` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`target_amount` decimal(14,2) NOT NULL,
	`current_amount` decimal(14,2) NOT NULL DEFAULT '0',
	`frequency` enum('weekly','monthly','custom') NOT NULL DEFAULT 'monthly',
	`deadline` date,
	`icon` varchar(20) NOT NULL DEFAULT 'target',
	`achieved` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `savings_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savings_loan_returns` (
	`id` varchar(36) NOT NULL,
	`loan_id` varchar(36) NOT NULL,
	`wallet_id` varchar(36) NOT NULL,
	`amount` decimal(14,2) NOT NULL,
	`occurred_at` timestamp NOT NULL,
	CONSTRAINT `savings_loan_returns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savings_loans` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`savings_account_id` varchar(36) NOT NULL,
	`wallet_id` varchar(36) NOT NULL,
	`amount` decimal(14,2) NOT NULL,
	`amount_returned` decimal(14,2) NOT NULL DEFAULT '0',
	`note` text,
	`occurred_at` timestamp NOT NULL,
	CONSTRAINT `savings_loans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` varchar(50) NOT NULL,
	CONSTRAINT `tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`wallet_id` varchar(36) NOT NULL,
	`category_id` varchar(36),
	`title` varchar(150) NOT NULL,
	`amount` decimal(14,2) NOT NULL,
	`type` enum('income','expense') NOT NULL,
	`occurred_at` timestamp NOT NULL,
	`note` text,
	`photo_url` varchar(500),
	`tags_csv` varchar(255) NOT NULL DEFAULT '',
	`is_draft` boolean NOT NULL DEFAULT false,
	`is_favorite` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transfers` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`from_wallet_id` varchar(36) NOT NULL,
	`to_wallet_id` varchar(36) NOT NULL,
	`amount` decimal(14,2) NOT NULL,
	`note` text,
	`occurred_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transfers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`theme` varchar(30) NOT NULL DEFAULT 'sakura-pink',
	`mode` enum('light','dark') NOT NULL DEFAULT 'light',
	`currency` varchar(10) NOT NULL DEFAULT 'IDR',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`icon` varchar(20) NOT NULL DEFAULT 'wallet',
	`color` varchar(20) NOT NULL DEFAULT '#F5A9B8',
	`starting_balance` decimal(14,2) NOT NULL DEFAULT '0',
	`archived` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wishlist_items` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` varchar(150) NOT NULL,
	`target_price` decimal(14,2) NOT NULL,
	`current_amount` decimal(14,2) NOT NULL DEFAULT '0',
	`status` enum('wishing','saving','bought','cancelled') NOT NULL DEFAULT 'wishing',
	`photo_url` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlist_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `adjust_user_idx` ON `balance_adjustments` (`user_id`);--> statement-breakpoint
CREATE INDEX `categories_user_idx` ON `categories` (`user_id`);--> statement-breakpoint
CREATE INDEX `notes_user_idx` ON `daily_notes` (`user_id`);--> statement-breakpoint
CREATE INDEX `favtx_user_idx` ON `favorite_transactions` (`user_id`);--> statement-breakpoint
CREATE INDEX `recurring_user_idx` ON `recurring_expenses` (`user_id`);--> statement-breakpoint
CREATE INDEX `savings_user_idx` ON `savings_accounts` (`user_id`);--> statement-breakpoint
CREATE INDEX `deposits_user_idx` ON `savings_deposits` (`user_id`);--> statement-breakpoint
CREATE INDEX `details_savings_idx` ON `savings_details` (`savings_account_id`);--> statement-breakpoint
CREATE INDEX `goals_user_idx` ON `savings_goals` (`user_id`);--> statement-breakpoint
CREATE INDEX `loans_user_idx` ON `savings_loans` (`user_id`);--> statement-breakpoint
CREATE INDEX `tags_user_idx` ON `tags` (`user_id`);--> statement-breakpoint
CREATE INDEX `transactions_user_idx` ON `transactions` (`user_id`);--> statement-breakpoint
CREATE INDEX `transactions_wallet_idx` ON `transactions` (`wallet_id`);--> statement-breakpoint
CREATE INDEX `transactions_date_idx` ON `transactions` (`occurred_at`);--> statement-breakpoint
CREATE INDEX `transfers_user_idx` ON `transfers` (`user_id`);--> statement-breakpoint
CREATE INDEX `wallets_user_idx` ON `wallets` (`user_id`);--> statement-breakpoint
CREATE INDEX `wishlist_user_idx` ON `wishlist_items` (`user_id`);