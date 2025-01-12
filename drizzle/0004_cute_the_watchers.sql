CREATE TABLE `audit_log` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`job_id` bigint NOT NULL,
	`event` varchar(255) NOT NULL,
	`performed_by` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `audit_log_job_id_idx` ON `audit_log` (`job_id`);--> statement-breakpoint
CREATE INDEX `audit_log_performed_by_idx` ON `audit_log` (`performed_by`);