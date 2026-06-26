DROP TABLE IF EXISTS `order_status_history`;

DROP TABLE IF EXISTS `order_item_addons`;

DROP TABLE IF EXISTS `order_items`;

DROP TABLE IF EXISTS `orders`;

DROP TABLE IF EXISTS `cart_item_addons`;

DROP TABLE IF EXISTS `cart_items`;

DROP TABLE IF EXISTS `carts`;

DROP TABLE IF EXISTS `menu_item_addons`;

DROP TABLE IF EXISTS `addons`;

DROP TABLE IF EXISTS `menu_items`;

DROP TABLE IF EXISTS `categories`;

DROP TABLE IF EXISTS `restaurant_settings`;

DROP TABLE IF EXISTS `admin_profiles`;

DROP TABLE IF EXISTS `customer_profiles`;

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
    `user_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `phone_number` VARCHAR(20) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `display_name` VARCHAR(100) NOT NULL,
    `role` ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `uq_users_phone_number` (`phone_number`),
    KEY `idx_users_role_active` (`role`, `is_active`)
) ENGINE = InnoDB;

CREATE TABLE `customer_profiles` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `default_address` VARCHAR(500) NULL,
    `default_payment_method` VARCHAR(50) NULL,
    `address_history` TEXT NULL,
    PRIMARY KEY (`user_id`),
    CONSTRAINT `fk_customer_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE `admin_profiles` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `position` VARCHAR(100) NULL,
    PRIMARY KEY (`user_id`),
    CONSTRAINT `fk_admin_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE `restaurant_settings` (
    `setting_key` VARCHAR(100) NOT NULL,
    `setting_value` TEXT NOT NULL,
    `value_type` ENUM(
        'string',
        'number',
        'boolean',
        'json'
    ) NOT NULL DEFAULT 'string',
    `description` VARCHAR(255) NULL,
    `is_public` TINYINT(1) NOT NULL DEFAULT 0,
    `updated_by` BIGINT UNSIGNED NULL,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`setting_key`),
    CONSTRAINT `fk_restaurant_settings_admin` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE = InnoDB;

CREATE TABLE `categories` (
    `category_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `is_available` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`category_id`),
    UNIQUE KEY `uq_categories_name` (`name`)
) ENGINE = InnoDB;

CREATE TABLE `menu_items` (
    `menu_item_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `category_id` INT UNSIGNED NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10, 2) UNSIGNED NOT NULL,
    `image_path` VARCHAR(500) NULL,
    `is_available` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`menu_item_id`),
    KEY `idx_menu_items_category_visible` (`category_id`, `is_available`),
    UNIQUE KEY `uq_menu_items_name` (`name`),
    CONSTRAINT `fk_menu_items_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE,
    CONSTRAINT `chk_menu_items_price` CHECK (`price` >= 0)
) ENGINE = InnoDB;

CREATE TABLE `addons` (
    `addon_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `price` DECIMAL(10, 2) UNSIGNED NOT NULL DEFAULT 0.00,
    `is_available` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`addon_id`),
    UNIQUE KEY `uq_addons_name` (`name`),
    CONSTRAINT `chk_addons_price` CHECK (`price` >= 0)
) ENGINE = InnoDB;

CREATE TABLE `menu_item_addons` (
    `menu_item_id` BIGINT UNSIGNED NOT NULL,
    `addon_id` INT UNSIGNED NOT NULL,
    `display_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (`menu_item_id`, `addon_id`),
    CONSTRAINT `fk_menu_item_addons_item` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`menu_item_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_menu_item_addons_addon` FOREIGN KEY (`addon_id`) REFERENCES `addons` (`addon_id`) ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE `carts` (
    `cart_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `order_type` ENUM(
        'dine_in',
        'takeaway',
        'delivery'
    ) NOT NULL DEFAULT 'takeaway',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`cart_id`),
    UNIQUE KEY `uq_carts_user` (`user_id`),
    CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE `cart_items` (
    `cart_item_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `cart_id` BIGINT UNSIGNED NOT NULL,
    `menu_item_id` BIGINT UNSIGNED NOT NULL,
    `quantity` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    `special_instructions` VARCHAR(500) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`cart_item_id`),
    KEY `idx_cart_items_cart` (`cart_id`),
    CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`cart_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cart_items_menu_item` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`menu_item_id`) ON DELETE CASCADE,
    CONSTRAINT `chk_cart_items_quantity` CHECK (`quantity` > 0)
) ENGINE = InnoDB;

CREATE TABLE `cart_item_addons` (
    `cart_item_id` BIGINT UNSIGNED NOT NULL,
    `addon_id` INT UNSIGNED NOT NULL,
    `quantity` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (`cart_item_id`, `addon_id`),
    CONSTRAINT `fk_cart_item_addons_cart_item` FOREIGN KEY (`cart_item_id`) REFERENCES `cart_items` (`cart_item_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cart_item_addons_addon` FOREIGN KEY (`addon_id`) REFERENCES `addons` (`addon_id`) ON DELETE RESTRICT,
    CONSTRAINT `chk_cart_item_addons_quantity` CHECK (`quantity` > 0)
) ENGINE = InnoDB;

CREATE TABLE `orders` (
    `order_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_number` VARCHAR(24) NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `order_type` ENUM(
        'dine_in',
        'takeaway',
        'delivery'
    ) NOT NULL,
    `payment_method` ENUM(
        'cash',
        'e_wallet',
        'online_banking'
    ) NOT NULL,
    `payment_status` ENUM('unpaid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid',
    `order_status` ENUM(
        'new',
        'preparing',
        'ready',
        'out_for_delivery',
        'completed',
        'cancelled'
    ) NOT NULL DEFAULT 'new',
    `subtotal` DECIMAL(10, 2) UNSIGNED NOT NULL,
    `packaging_fee` DECIMAL(10, 2) UNSIGNED NOT NULL DEFAULT 0.00,
    `delivery_fee` DECIMAL(10, 2) UNSIGNED NOT NULL DEFAULT 0.00,
    `service_fee` DECIMAL(10, 2) UNSIGNED NOT NULL DEFAULT 0.00,
    `total_amount` DECIMAL(10, 2) UNSIGNED NOT NULL,
    `table_number` VARCHAR(20) NULL,
    `pickup_at` DATETIME NULL,
    `delivery_address` VARCHAR(500) NULL,
    `customer_note` VARCHAR(500) NULL,
    `cancellation_reason` VARCHAR(500) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `completed_at` DATETIME NULL,
    PRIMARY KEY (`order_id`),
    UNIQUE KEY `uq_orders_order_number` (`order_number`),
    KEY `idx_orders_user_created` (`user_id`, `created_at`),
    KEY `idx_orders_status_created` (`order_status`, `created_at`),
    CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
    CONSTRAINT `chk_orders_amounts` CHECK (
        `subtotal` >= 0
        AND `packaging_fee` >= 0
        AND `delivery_fee` >= 0
        AND `service_fee` >= 0
        AND `total_amount` >= 0
    )
) ENGINE = InnoDB;

CREATE TABLE `order_items` (
    `order_item_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `menu_item_id` BIGINT UNSIGNED NULL,
    `item_name` VARCHAR(120) NOT NULL,
    `unit_price` DECIMAL(10, 2) UNSIGNED NOT NULL,
    `quantity` SMALLINT UNSIGNED NOT NULL,
    `special_instructions` VARCHAR(500) NULL,
    `line_total` DECIMAL(10, 2) UNSIGNED NOT NULL,
    PRIMARY KEY (`order_item_id`),
    KEY `idx_order_items_order` (`order_id`),
    CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_order_items_menu_item` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`menu_item_id`) ON DELETE SET NULL,
    CONSTRAINT `chk_order_items_values` CHECK (
        `unit_price` >= 0
        AND `quantity` > 0
        AND `line_total` >= 0
    )
) ENGINE = InnoDB;

CREATE TABLE `order_item_addons` (
    `order_item_addon_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_item_id` BIGINT UNSIGNED NOT NULL,
    `addon_id` INT UNSIGNED NULL,
    `addon_name` VARCHAR(100) NOT NULL,
    `unit_price` DECIMAL(10, 2) UNSIGNED NOT NULL,
    `quantity` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (`order_item_addon_id`),
    KEY `idx_order_item_addons_item` (`order_item_id`),
    CONSTRAINT `fk_order_item_addons_order_item` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`order_item_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_order_item_addons_addon` FOREIGN KEY (`addon_id`) REFERENCES `addons` (`addon_id`) ON DELETE SET NULL,
    CONSTRAINT `chk_order_item_addons_values` CHECK (
        `unit_price` >= 0
        AND `quantity` > 0
    )
) ENGINE = InnoDB;

CREATE TABLE `order_status_history` (
    `history_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `status` ENUM(
        'new',
        'preparing',
        'ready',
        'out_for_delivery',
        'completed',
        'cancelled'
    ) NOT NULL,
    `changed_by` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`history_id`),
    KEY `idx_order_status_history_order_created` (`order_id`, `created_at`),
    CONSTRAINT `fk_order_status_history_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_order_status_history_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE = InnoDB;

-- All sample accounts use: Password123!
-- Initial Admin Account: phone_number = '0111000000', password = 'adminPass' (Hash generated using PHP password_hash PASSWORD_DEFAULT.)
-- Other admin and customer account is for demo purposes, all demo admin account and all demo customer account has same password. (adminPass and customerPass)
INSERT INTO `users`
  (`user_id`, `phone_number`, `password_hash`, `display_name`, `role`, `is_active`)
VALUES
  (1, '0111000000', '$2y$10$t0aq7AMKak5xJBiy9LddNeEu0AJCcd5ji3AiS9CU8F/WMoqrWHyZa', 'Admin', 'admin', 1),
  (2, '0111000001', '$2y$10$t0aq7AMKak5xJBiy9LddNeEu0AJCcd5ji3AiS9CU8F/WMoqrWHyZa', 'Aina Rahman', 'admin', 1),
  (3, '0111000002', '$2y$10$t0aq7AMKak5xJBiy9LddNeEu0AJCcd5ji3AiS9CU8F/WMoqrWHyZa', 'Daniel Lee', 'admin', 1),
  (4, '0122000001', '$2y$10$eImiTXuWV51cHeDFm7a9M0cZ9Y1C8O9N4F2E7D3C1B0A9Z8Y7X6W5', 'Ali Ahmad', 'customer', 1),
  (5, '0122000002', '$2y$10$eImiTXuWV51cHeDFm7a9M0cZ9Y1C8O9N4F2E7D3C1B0A9Z8Y7X6W5', 'Siti Aminah', 'customer', 1),
  (6, '0122000003', '$2y$10$eImiTXuWV51cHeDFm7a9M0cZ9Y1C8O9N4F2E7D3C1B0A9Z8Y7X6W5', 'Muthu Raj', 'customer', 1),
  (7, '0122000004', '$2y$10$eImiTXuWV51cHeDFm7a9M0cZ9Y1C8O9N4F2E7D3C1B0A9Z8Y7X6W5', 'Nur Izzati', 'customer', 1),
  (8, '0122000005', '$2y$10$eImiTXuWV51cHeDFm7a9M0cZ9Y1C8O9N4F2E7D3C1B0A9Z8Y7X6W5', 'Jason Wong', 'customer', 1);

INSERT INTO `admin_profiles` (`user_id`, `position`) VALUES
  (1, 'Initial Admin'),
  (2, 'Restaurant Manager'),
  (3, 'Kitchen Supervisor');

INSERT INTO `customer_profiles` (`user_id`, `default_address`, `default_payment_method`) VALUES
  (4, 'Kolej Tun Dr Ismail, UTM', 'cash'),
  (5, 'Kolej Datin Seri Endon, UTM', 'e_wallet'),
  (6, 'Kolej Rahman Putra, UTM', 'online_banking'),
  (7, 'Kolej Tun Fatimah, UTM', 'e_wallet'),
  (8, 'Kolej Perdana, UTM', 'cash');

INSERT INTO `restaurant_settings`
  (`setting_key`, `setting_value`, `value_type`, `description`, `is_public`, `updated_by`)
VALUES
  ('restaurant_name', 'Lanita Restaurant', 'string', 'Name shown to customers.', 1, 1),
  ('restaurant_address', 'Arked Lestari, UTM Johor Bahru', 'string', 'Pickup and delivery origin.', 1, 1),
  ('restaurant_open', 'true', 'boolean', 'Controls whether new orders are accepted.', 1, 1),
  ('service_fee', '6', 'number', 'Service fee % per total price of the order.', 1, 1),
  ('delivery_fee', '3.00', 'number', 'Standard local delivery fee per order.', 1, 1),
  ('packaging_fee', '1.00', 'number', 'Packaging fee for all orders (per item).', 1, 1),
  ('currency', 'MYR', 'string', 'ISO currency code.', 1, 1);

INSERT INTO `categories`
  (`category_id`, `name`, `description`, `is_available`)
VALUES
  (1, 'Food', 'Freshly prepared main dishes.', 1),
  (2, 'Drinks', 'Hot and cold beverages.', 1),
  (3, 'Desserts', 'Sweet finishes and light treats.', 1);

INSERT INTO `menu_items`
  (`menu_item_id`, `category_id`, `name`, `description`, `price`, `image_path`, `is_available`)
VALUES
  (1, 1, 'Avocado Power Bowl', 'Quinoa, roasted chickpeas, avocado and citrus dressing.', 12.50, NULL, 1),
  (2, 1, 'Lanita Signature Burger', 'Beef patty, smoked cheese, caramelised onion and house sauce.', 14.00, NULL, 1),
  (3, 1, 'Truffle Mushroom Pasta', 'Fettuccine with wild mushrooms and light truffle cream.', 16.50, NULL, 1),
  (4, 1, 'Nasi Goreng Kampung', 'Traditional fried rice with chicken, anchovies and vegetables.', 12.00, NULL, 1),
  (5, 1, 'Maggi Goreng Special', 'Wok-fried noodles with vegetables, egg and sambal.', 7.50, NULL, 0),
  (6, 2, 'Artisanal Latte', 'Single-origin espresso with silky steamed milk.', 4.50, NULL, 1),
  (7, 2, 'Minty Lemonade', 'Fresh lemon, mint and sparkling water.', 3.75, NULL, 1),
  (8, 2, 'Ceremonial Matcha', 'Premium matcha whisked with oat milk.', 5.25, NULL, 1),
  (9, 2, 'Cold Brew Reserve', 'Coffee steeped slowly for 24 hours.', 4.00, NULL, 1),
  (10, 3, 'Pandan Creme Brulee', 'Silky pandan custard with caramelised sugar.', 8.00, NULL, 1);

INSERT INTO `addons` (`addon_id`, `name`, `price`, `is_available`) VALUES
  (1, 'Extra Egg', 1.00, 1),
  (2, 'Extra Chicken', 3.00, 1),
  (3, 'Oat Milk', 1.50, 1),
  (4, 'Extra Espresso Shot', 2.00, 1),
  (5, 'Less Ice', 0.00, 1);

INSERT INTO `menu_item_addons` (`menu_item_id`, `addon_id`, `display_order`) VALUES
  (4, 1, 1), (4, 2, 2), (5, 1, 1),
  (6, 3, 1), (6, 4, 2), (7, 5, 1), (8, 3, 1), (9, 3, 1), (9, 4, 2);

INSERT INTO `carts` (`cart_id`, `user_id`, `order_type`) VALUES
  (1, 4, 'takeaway');

INSERT INTO `cart_items`
  (`cart_item_id`, `cart_id`, `menu_item_id`, `quantity`, `special_instructions`)
VALUES
  (1, 1, 4, 1, 'Less spicy'),
  (2, 1, 7, 2, 'No sugar');

INSERT INTO `cart_item_addons` (`cart_item_id`, `addon_id`, `quantity`) VALUES
  (1, 1, 1),
  (2, 5, 2);

INSERT INTO `orders`
  (`order_id`, `order_number`, `user_id`, `order_type`, `payment_method`, `payment_status`, `order_status`,
   `subtotal`, `packaging_fee`, `delivery_fee`, `service_fee`, `total_amount`, `table_number`, `pickup_at`,
   `delivery_address`, `customer_note`, `created_at`, `updated_at`, `completed_at`)
VALUES
  (1, 'LNT-20260618-0001', 3, 'delivery', 'e_wallet', 'paid', 'completed',
   18.00, 1.00, 3.00, 0.00, 22.00, NULL, NULL, 'Kolej Tun Dr Ismail, UTM', 'Call on arrival.', '2026-06-18 12:10:00', '2026-06-18 13:10:00', '2026-06-18 13:10:00'),
  (2, 'LNT-20260619-0002', 5, 'takeaway', 'cash', 'unpaid', 'preparing',
   16.75, 0.50, 0.00, 0.00, 17.25, NULL, '2026-06-19 11:50:00', NULL, NULL, '2026-06-19 11:20:00', '2026-06-19 11:24:00', NULL),
  (3, 'LNT-20260619-0003', 4, 'dine_in', 'cash', 'paid', 'completed',
   12.50, 0.00, 0.00, 0.00, 12.50, 'A01', NULL, NULL, NULL, '2026-06-19 12:05:00', '2026-06-19 12:42:00', '2026-06-19 12:42:00'),
  (4, 'LNT-20260619-0004', 6, 'takeaway', 'e_wallet', 'paid', 'ready',
   14.00, 0.50, 0.00, 0.00, 14.50, NULL, '2026-06-19 13:20:00', NULL, 'No onion.', '2026-06-19 12:50:00', '2026-06-19 13:10:00', NULL),
  (5, 'LNT-20260619-0005', 7, 'delivery', 'online_banking', 'paid', 'out_for_delivery',
   16.50, 1.00, 3.00, 0.00, 20.50, NULL, NULL, 'Kolej Perdana, UTM', NULL, '2026-06-19 13:15:00', '2026-06-19 13:48:00', NULL),
  (6, 'LNT-20260619-0006', 3, 'dine_in', 'cash', 'paid', 'completed',
   12.00, 0.00, 0.00, 0.00, 12.00, 'B04', NULL, NULL, 'Less spicy.', '2026-06-19 18:10:00', '2026-06-19 18:50:00', '2026-06-19 18:50:00'),
  (7, 'LNT-20260620-0007', 5, 'takeaway', 'cash', 'unpaid', 'cancelled',
   4.50, 0.50, 0.00, 0.00, 5.00, NULL, '2026-06-20 08:30:00', NULL, NULL, '2026-06-20 08:05:00', '2026-06-20 08:12:00', '2026-06-20 08:12:00'),
  (8, 'LNT-20260620-0008', 4, 'delivery', 'e_wallet', 'paid', 'completed',
   3.75, 1.00, 3.00, 0.00, 7.75, NULL, NULL, 'Kolej Datin Seri Endon, UTM', 'Leave at reception.', '2026-06-20 09:00:00', '2026-06-20 09:45:00', '2026-06-20 09:45:00'),
  (9, 'LNT-20260620-0009', 6, 'dine_in', 'e_wallet', 'paid', 'completed',
   5.25, 0.00, 0.00, 0.00, 5.25, 'C02', NULL, NULL, NULL, '2026-06-20 10:15:00', '2026-06-20 10:40:00', '2026-06-20 10:40:00'),
  (10, 'LNT-20260620-0010', 7, 'takeaway', 'cash', 'unpaid', 'new',
   4.00, 0.50, 0.00, 0.00, 4.50, NULL, '2026-06-20 11:20:00', NULL, 'Less ice.', '2026-06-20 10:55:00', '2026-06-20 10:57:00', NULL),
  (11, 'LNT-20260620-0011', 3, 'delivery', 'online_banking', 'paid', 'completed',
   8.00, 1.00, 3.00, 0.00, 12.00, NULL, NULL, 'Kolej Tun Dr Ismail, UTM', NULL, '2026-06-20 12:30:00', '2026-06-20 13:20:00', '2026-06-20 13:20:00'),
  (12, 'LNT-20260620-0012', 5, 'dine_in', 'cash', 'paid', 'completed',
   21.50, 0.00, 0.00, 0.00, 21.50, 'A06', NULL, NULL, NULL, '2026-06-20 13:40:00', '2026-06-20 14:25:00', '2026-06-20 14:25:00'),
  (13, 'LNT-20260620-0013', 4, 'takeaway', 'e_wallet', 'paid', 'ready',
   12.50, 0.50, 0.00, 0.00, 13.00, NULL, '2026-06-20 15:15:00', NULL, NULL, '2026-06-20 14:45:00', '2026-06-20 15:05:00', NULL),
  (14, 'LNT-20260620-0014', 6, 'delivery', 'e_wallet', 'paid', 'preparing',
   16.50, 1.00, 3.00, 0.00, 20.50, NULL, NULL, 'Kolej Tun Fatimah, UTM', NULL, '2026-06-20 16:00:00', '2026-06-20 16:08:00', NULL),
  (15, 'LNT-20260620-0015', 7, 'dine_in', 'cash', 'unpaid', 'new',
   12.00, 0.00, 0.00, 0.00, 12.00, 'B08', NULL, NULL, 'Extra spicy.', '2026-06-20 17:10:00', '2026-06-20 17:10:00', NULL),
  (16, 'LNT-20260621-0016', 3, 'takeaway', 'cash', 'unpaid', 'completed',
   4.50, 0.50, 0.00, 0.00, 5.00, NULL, '2026-06-21 08:30:00', NULL, NULL, '2026-06-21 08:00:00', '2026-06-21 08:28:00', '2026-06-21 08:28:00'),
  (17, 'LNT-20260621-0017', 5, 'delivery', 'online_banking', 'paid', 'cancelled',
   3.75, 1.00, 3.00, 0.00, 7.75, NULL, NULL, 'Kolej Rahman Putra, UTM', NULL, '2026-06-21 08:20:00', '2026-06-21 08:25:00', '2026-06-21 08:25:00'),
  (18, 'LNT-20260621-0018', 4, 'dine_in', 'e_wallet', 'paid', 'preparing',
   5.25, 0.00, 0.00, 0.00, 5.25, 'C05', NULL, NULL, NULL, '2026-06-21 09:00:00', '2026-06-21 09:08:00', NULL),
  (19, 'LNT-20260621-0019', 6, 'takeaway', 'e_wallet', 'paid', 'new',
   4.00, 0.50, 0.00, 0.00, 4.50, NULL, '2026-06-21 09:45:00', NULL, 'No straw.', '2026-06-21 09:15:00', '2026-06-21 09:17:00', NULL),
  (20, 'LNT-20260621-0020', 7, 'delivery', 'cash', 'unpaid', 'new',
   8.00, 1.00, 3.00, 0.00, 12.00, NULL, NULL, 'Kolej Perdana, UTM', 'Call before arriving.', '2026-06-21 09:30:00', '2026-06-21 09:30:00', NULL);

INSERT INTO `order_items`
  (`order_item_id`, `order_id`, `menu_item_id`, `item_name`, `unit_price`, `quantity`, `special_instructions`, `line_total`)
VALUES
  (1, 1, 2, 'Lanita Signature Burger', 14.00, 1, NULL, 14.00),
  (2, 1, 9, 'Cold Brew Reserve', 4.00, 1, 'Less ice', 4.00),
  (3, 2, 4, 'Nasi Goreng Kampung', 12.00, 1, 'Less spicy', 12.00),
  (4, 2, 7, 'Minty Lemonade', 3.75, 1, NULL, 3.75),
  (5, 3, 1, 'Avocado Power Bowl', 12.50, 1, NULL, 12.50),
  (6, 4, 2, 'Lanita Signature Burger', 14.00, 1, 'No onion', 14.00),
  (7, 5, 3, 'Truffle Mushroom Pasta', 16.50, 1, NULL, 16.50),
  (8, 6, 4, 'Nasi Goreng Kampung', 12.00, 1, 'Less spicy', 12.00),
  (9, 7, 6, 'Artisanal Latte', 4.50, 1, NULL, 4.50),
  (10, 8, 7, 'Minty Lemonade', 3.75, 1, NULL, 3.75),
  (11, 9, 8, 'Ceremonial Matcha', 5.25, 1, NULL, 5.25),
  (12, 10, 9, 'Cold Brew Reserve', 4.00, 1, 'Less ice', 4.00),
  (13, 11, 10, 'Pandan Creme Brulee', 8.00, 1, NULL, 8.00),
  (14, 12, 2, 'Lanita Signature Burger', 14.00, 1, NULL, 14.00),
  (15, 12, 5, 'Maggi Goreng Special', 7.50, 1, NULL, 7.50),
  (16, 13, 1, 'Avocado Power Bowl', 12.50, 1, NULL, 12.50),
  (17, 14, 3, 'Truffle Mushroom Pasta', 16.50, 1, NULL, 16.50),
  (18, 15, 4, 'Nasi Goreng Kampung', 12.00, 1, 'Extra spicy', 12.00),
  (19, 16, 6, 'Artisanal Latte', 4.50, 1, NULL, 4.50),
  (20, 17, 7, 'Minty Lemonade', 3.75, 1, NULL, 3.75),
  (21, 18, 8, 'Ceremonial Matcha', 5.25, 1, NULL, 5.25),
  (22, 19, 9, 'Cold Brew Reserve', 4.00, 1, 'No straw', 4.00),
  (23, 20, 10, 'Pandan Creme Brulee', 8.00, 1, NULL, 8.00);

INSERT INTO `order_item_addons`
  (`order_item_addon_id`, `order_item_id`, `addon_id`, `addon_name`, `unit_price`, `quantity`)
VALUES
  (1, 2, 5, 'Less Ice', 0.00, 1),
  (2, 3, 1, 'Extra Egg', 1.00, 1);

INSERT INTO `order_status_history` (`order_id`, `status`, `changed_by`, `created_at`) VALUES
  (1, 'new', NULL, '2026-06-18 12:10:00'),
  (1, 'preparing', 2, '2026-06-18 12:16:00'),
  (1, 'out_for_delivery', 1, '2026-06-18 12:48:00'),
  (1, 'completed', 1, '2026-06-18 13:10:00'),
  (2, 'new', NULL, '2026-06-19 11:20:00'),
  (2, 'preparing', 2, '2026-06-19 11:24:00'),
  (3, 'completed', 1, '2026-06-19 12:42:00'),
  (4, 'ready', 2, '2026-06-19 13:10:00'),
  (5, 'out_for_delivery', 1, '2026-06-19 13:48:00'),
  (6, 'completed', 1, '2026-06-19 18:50:00'),
  (7, 'cancelled', 1, '2026-06-20 08:12:00'),
  (8, 'completed', 1, '2026-06-20 09:45:00'),
  (9, 'completed', 1, '2026-06-20 10:40:00'),
  (10, 'new', 2, '2026-06-20 10:57:00'),
  (11, 'completed', 1, '2026-06-20 13:20:00'),
  (12, 'completed', 1, '2026-06-20 14:25:00'),
  (13, 'ready', 2, '2026-06-20 15:05:00'),
  (14, 'preparing', 2, '2026-06-20 16:08:00'),
  (15, 'new', NULL, '2026-06-20 17:10:00'),
  (16, 'completed', 1, '2026-06-21 08:28:00'),
  (17, 'cancelled', 1, '2026-06-21 08:25:00'),
  (18, 'preparing', 2, '2026-06-21 09:08:00'),
  (19, 'new', 2, '2026-06-21 09:17:00'),
  (20, 'new', NULL, '2026-06-21 09:30:00');