CREATE TABLE `approval` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`job_id` bigint NOT NULL,
	`user_email` varchar(255) NOT NULL,
	`status` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `approval_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `approval` ADD CONSTRAINT `approval_job_id_failed_job_id_fk` FOREIGN KEY (`job_id`) REFERENCES `failed_job`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `approval_job_id_idx` ON `approval` (`job_id`);--> statement-breakpoint
CREATE INDEX `approval_user_email_idx` ON `approval` (`user_email`);