CREATE TABLE `failed_job` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`job_id` varchar(255) NOT NULL,
	`s3_key` varchar(255) NOT NULL,
	`download_approved` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `failed_job_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `post`;--> statement-breakpoint
CREATE INDEX `job_id_idx` ON `failed_job` (`job_id`);