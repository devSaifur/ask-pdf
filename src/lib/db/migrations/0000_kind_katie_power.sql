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