CREATE TABLE `file` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text(256) NOT NULL,
	`url` text(256) NOT NULL,
	`key` text(256) NOT NULL,
	`createdById` text(25) NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`upload_status` text DEFAULT 'pending',
	FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `message` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`isUserMessage` integer NOT NULL,
	`createdById` text(25) NOT NULL,
	`fileId` text(25),
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fileId`) REFERENCES `file`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`emailVerified` integer,
	`image` text,
	`stripe_customer_id` text,
	`stripe_subscription_id` text,
	`stripe_price_id` text,
	`stripe_current_period_end` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_stripe_customer_id_unique` ON `user` (`stripe_customer_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_stripe_subscription_id_unique` ON `user` (`stripe_subscription_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_stripe_price_id_unique` ON `user` (`stripe_price_id`);