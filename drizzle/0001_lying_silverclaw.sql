CREATE TABLE `cartItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`customizationSize` varchar(50),
	`customizationColor` varchar(50),
	`customizationNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cartItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`customizationSize` varchar(50),
	`customizationColor` varchar(50),
	`customizationNotes` text,
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userEmail` varchar(320),
	`totalPrice` decimal(10,2) NOT NULL,
	`status` enum('pending','confirmed','shipped','completed','cancelled') NOT NULL DEFAULT 'pending',
	`paymentMethod` enum('mpesa','card','bank_transfer') NOT NULL DEFAULT 'mpesa',
	`paymentStatus` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`mpesaReceiptNumber` varchar(100),
	`checkoutRequestId` varchar(255),
	`shippingCost` decimal(10,2) NOT NULL DEFAULT '0',
	`discount` decimal(10,2) NOT NULL DEFAULT '0',
	`notes` text,
	`shippingAddressStreet` varchar(255),
	`shippingAddressCity` varchar(100),
	`shippingAddressPostalCode` varchar(20),
	`shippingAddressCountry` varchar(100),
	`shippingAddressPhone` varchar(20),
	`billingAddressStreet` varchar(255),
	`billingAddressCity` varchar(100),
	`billingAddressPostalCode` varchar(20),
	`billingAddressCountry` varchar(100),
	`billingAddressPhone` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`category` varchar(100) NOT NULL DEFAULT 'Apparel',
	`image` text,
	`tag` varchar(50),
	`stock` int NOT NULL DEFAULT 0,
	`featured` enum('true','false') NOT NULL DEFAULT 'false',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
