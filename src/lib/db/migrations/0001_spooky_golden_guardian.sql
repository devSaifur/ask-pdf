CREATE TABLE `file` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256) NOT NULL,
	`url` text(256) NOT NULL,
	`createdById` text(255) NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIME),
	`upload_status` text DEFAULT 'pending',
	FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
