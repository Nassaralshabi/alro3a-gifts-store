CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(96) NOT NULL,
	`titleAr` varchar(160) NOT NULL,
	`titleEn` varchar(160) NOT NULL,
	`descriptionAr` text,
	`descriptionEn` text,
	`icon` varchar(64) NOT NULL DEFAULT 'Sparkles',
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int,
	`productTitle` varchar(180),
	`customerName` varchar(160) NOT NULL,
	`customerPhone` varchar(32) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`requestedPrice` decimal(10,2),
	`notes` text,
	`language` enum('ar','en') NOT NULL DEFAULT 'ar',
	`status` enum('new','contacted','confirmed','completed','cancelled') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int,
	`slug` varchar(128) NOT NULL,
	`titleAr` varchar(180) NOT NULL,
	`titleEn` varchar(180) NOT NULL,
	`descriptionAr` text,
	`descriptionEn` text,
	`price` decimal(10,2),
	`imageUrl` varchar(2048),
	`isFeatured` boolean NOT NULL DEFAULT false,
	`isAvailable` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `siteContent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentKey` varchar(96) NOT NULL,
	`valueAr` text,
	`valueEn` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteContent_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteContent_contentKey_unique` UNIQUE(`contentKey`)
);
