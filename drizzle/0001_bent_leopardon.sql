CREATE TABLE `gitRepositories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` varchar(512) NOT NULL,
	`localPath` varchar(512) NOT NULL,
	`branch` varchar(255) DEFAULT 'main',
	`lastSync` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gitRepositories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `localServices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('web','database','custom') NOT NULL,
	`port` int,
	`command` text NOT NULL,
	`isRunning` boolean NOT NULL DEFAULT false,
	`autoStart` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `localServices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`language` enum('python','node','go') NOT NULL,
	`description` text,
	`initScript` text NOT NULL,
	`dependencies` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projectTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scriptExecutions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scriptId` int NOT NULL,
	`userId` int NOT NULL,
	`status` enum('running','success','failed') NOT NULL,
	`output` text,
	`error` text,
	`executionTime` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scriptExecutions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scripts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`language` enum('bash','python','node','sh') NOT NULL DEFAULT 'bash',
	`content` text NOT NULL,
	`isScheduled` boolean NOT NULL DEFAULT false,
	`cronExpression` varchar(255),
	`lastRun` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scripts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `terminalSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`name` varchar(255) DEFAULT 'Terminal',
	`history` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `terminalSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `terminalSessions_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `userProjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`templateId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`path` varchar(512) NOT NULL,
	`status` enum('created','initialized','failed') NOT NULL DEFAULT 'created',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userProjects_id` PRIMARY KEY(`id`)
);
