CREATE TABLE `freelance_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`user_name` text NOT NULL,
	`user_role` text NOT NULL,
	`user_avatar` text NOT NULL,
	`title` text NOT NULL,
	`client` text NOT NULL,
	`budget` text NOT NULL,
	`budget_type` text NOT NULL,
	`duration` text NOT NULL,
	`primary_industry` text NOT NULL,
	`secondary_industries` text NOT NULL,
	`skills` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
