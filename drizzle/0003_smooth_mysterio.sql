CREATE TABLE `company_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`tagline` text NOT NULL,
	`about` text NOT NULL,
	`industry` text NOT NULL,
	`company_size` text NOT NULL,
	`founded` text,
	`headquarters` text,
	`website` text,
	`linkedin_url` text,
	`twitter_url` text,
	`logo_url` text,
	`banner_url` text,
	`specialties_json` text DEFAULT '[]' NOT NULL,
	`stage` text DEFAULT 'Startup' NOT NULL,
	`is_verified` integer DEFAULT false,
	`followers_count` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `company_pages_slug_idx` ON `company_pages` (`slug`);--> statement-breakpoint
CREATE INDEX `company_pages_owner_idx` ON `company_pages` (`owner_id`);--> statement-breakpoint
CREATE INDEX `company_pages_industry_idx` ON `company_pages` (`industry`);--> statement-breakpoint
CREATE TABLE `job_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`applicant_user_id` text NOT NULL,
	`resume_url` text NOT NULL,
	`phone` text NOT NULL,
	`cover_note` text,
	`status` text DEFAULT 'Applied' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `job_applications_unique_idx` ON `job_applications` (`job_id`,`applicant_user_id`);--> statement-breakpoint
CREATE INDEX `job_applications_job_idx` ON `job_applications` (`job_id`);--> statement-breakpoint
CREATE INDEX `job_applications_applicant_idx` ON `job_applications` (`applicant_user_id`);--> statement-breakpoint
CREATE INDEX `job_applications_status_idx` ON `job_applications` (`status`);--> statement-breakpoint
CREATE TABLE `job_postings` (
	`id` text PRIMARY KEY NOT NULL,
	`company_page_id` text,
	`posted_by_user_id` text NOT NULL,
	`company_name` text NOT NULL,
	`company_logo` text,
	`company_slug` text,
	`title` text NOT NULL,
	`department` text,
	`employment_type` text NOT NULL,
	`location_type` text NOT NULL,
	`location` text NOT NULL,
	`salary_min` integer,
	`salary_max` integer,
	`salary_currency` text DEFAULT 'PKR' NOT NULL,
	`salary_period` text DEFAULT 'Monthly' NOT NULL,
	`experience_level` text NOT NULL,
	`industry` text NOT NULL,
	`skills_json` text DEFAULT '[]' NOT NULL,
	`description` text NOT NULL,
	`requirements_json` text DEFAULT '[]' NOT NULL,
	`benefits_json` text DEFAULT '[]' NOT NULL,
	`application_deadline` text,
	`is_open` integer DEFAULT true NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`views_count` integer DEFAULT 0 NOT NULL,
	`applications_count` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `job_postings_company_idx` ON `job_postings` (`company_page_id`);--> statement-breakpoint
CREATE INDEX `job_postings_poster_idx` ON `job_postings` (`posted_by_user_id`);--> statement-breakpoint
CREATE INDEX `job_postings_industry_idx` ON `job_postings` (`industry`);--> statement-breakpoint
CREATE INDEX `job_postings_open_idx` ON `job_postings` (`is_open`);--> statement-breakpoint
CREATE INDEX `job_postings_type_idx` ON `job_postings` (`employment_type`);