-- Online Restaurant Ordering System
-- Complete MySQL/MariaDB schema for a clean local installation.
-- Existing legacy SQL files are intentionally kept separately.

CREATE DATABASE IF NOT EXISTS `cpad_03_gamma`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `cpad_03_gamma`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `order_status_history`;
DROP TABLE IF EXISTS `order_item_addons`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cart_item_addons`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `carts`;
DROP TABLE IF EXISTS `menu_item_addons`;
DROP TABLE IF EXISTS `addons`;
DROP TABLE IF EXISTS `menu_item_tags`;
DROP TABLE IF EXISTS `tags`;
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
) ENGINE=InnoDB;

CREATE TABLE `customer_profiles` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `default_address` VARCHAR(500) NULL,
  `default_payment_method` VARCHAR(50) NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_customer_profiles_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `admin_profiles` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `position` VARCHAR(100) NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_admin_profiles_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `restaurant_settings` (
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT NOT NULL,
  `value_type` ENUM('string', 'number', 'boolean', 'json') NOT NULL DEFAULT 'string',
  `description` VARCHAR(255) NULL,
  `is_public` TINYINT(1) NOT NULL DEFAULT 0,
  `updated_by` BIGINT UNSIGNED NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`),
  CONSTRAINT `fk_restaurant_settings_admin`
    FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE `categories` (
  `category_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL,
  `display_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `uq_categories_name` (`name`),
  UNIQUE KEY `uq_categories_slug` (`slug`),
  KEY `idx_categories_visible_order` (`is_available`, `display_order`)
) ENGINE=InnoDB;

CREATE TABLE `menu_items` (
  `menu_item_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `slug` VARCHAR(140) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(10,2) UNSIGNED NOT NULL,
  `image_path` VARCHAR(500) NULL,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `display_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`menu_item_id`),
  UNIQUE KEY `uq_menu_items_slug` (`slug`),
  KEY `idx_menu_items_category_visible` (`category_id`, `is_available`, `display_order`),
  KEY `idx_menu_items_name` (`name`),
  CONSTRAINT `fk_menu_items_category`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_menu_items_price` CHECK (`price` >= 0)
) ENGINE=InnoDB;

CREATE TABLE `tags` (
  `tag_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `slug` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`tag_id`),
  UNIQUE KEY `uq_tags_name` (`name`),
  UNIQUE KEY `uq_tags_slug` (`slug`)
) ENGINE=InnoDB;

CREATE TABLE `menu_item_tags` (
  `menu_item_id` BIGINT UNSIGNED NOT NULL,
  `tag_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`menu_item_id`, `tag_id`),
  CONSTRAINT `fk_menu_item_tags_item`
    FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`menu_item_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_menu_item_tags_tag`
    FOREIGN KEY (`tag_id`) REFERENCES `tags` (`tag_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `addons` (
  `addon_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL,
  `price` DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`addon_id`),
  UNIQUE KEY `uq_addons_name` (`name`),
  CONSTRAINT `chk_addons_price` CHECK (`price` >= 0)
) ENGINE=InnoDB;

CREATE TABLE `menu_item_addons` (
  `menu_item_id` BIGINT UNSIGNED NOT NULL,
  `addon_id` INT UNSIGNED NOT NULL,
  `display_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`menu_item_id`, `addon_id`),
  CONSTRAINT `fk_menu_item_addons_item`
    FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`menu_item_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_menu_item_addons_addon`
    FOREIGN KEY (`addon_id`) REFERENCES `addons` (`addon_id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE `carts` (
  `cart_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `order_type` ENUM('dine_in', 'takeaway', 'delivery') NOT NULL DEFAULT 'takeaway',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_id`),
  UNIQUE KEY `uq_carts_user` (`user_id`),
  CONSTRAINT `fk_carts_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

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
  CONSTRAINT `fk_cart_items_cart`
    FOREIGN KEY (`cart_id`) REFERENCES `carts` (`cart_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_menu_item`
    FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`menu_item_id`) ON DELETE CASCADE,
  CONSTRAINT `chk_cart_items_quantity` CHECK (`quantity` > 0)
) ENGINE=InnoDB;

CREATE TABLE `cart_item_addons` (
  `cart_item_id` BIGINT UNSIGNED NOT NULL,
  `addon_id` INT UNSIGNED NOT NULL,
  `quantity` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`cart_item_id`, `addon_id`),
  CONSTRAINT `fk_cart_item_addons_cart_item`
    FOREIGN KEY (`cart_item_id`) REFERENCES `cart_items` (`cart_item_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_item_addons_addon`
    FOREIGN KEY (`addon_id`) REFERENCES `addons` (`addon_id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_cart_item_addons_quantity` CHECK (`quantity` > 0)
) ENGINE=InnoDB;

CREATE TABLE `orders` (
  `order_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_number` VARCHAR(24) NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `order_type` ENUM('dine_in', 'takeaway', 'delivery') NOT NULL,
  `payment_method` ENUM('cash', 'e_wallet', 'online_banking') NOT NULL,
  `payment_status` ENUM('unpaid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid',
  `order_status` ENUM('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `subtotal` DECIMAL(10,2) UNSIGNED NOT NULL,
  `packaging_fee` DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `delivery_fee` DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `service_fee` DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(10,2) UNSIGNED NOT NULL,
  `table_number` VARCHAR(20) NULL,
  `pickup_at` DATETIME NULL,
  `delivery_address` VARCHAR(500) NULL,
  `customer_note` VARCHAR(500) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `completed_at` DATETIME NULL,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `uq_orders_order_number` (`order_number`),
  KEY `idx_orders_user_created` (`user_id`, `created_at`),
  KEY `idx_orders_status_created` (`order_status`, `created_at`),
  CONSTRAINT `fk_orders_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_orders_amounts` CHECK (
    `subtotal` >= 0 AND `packaging_fee` >= 0 AND `delivery_fee` >= 0
    AND `service_fee` >= 0 AND `total_amount` >= 0
  )
) ENGINE=InnoDB;

CREATE TABLE `order_items` (
  `order_item_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `menu_item_id` BIGINT UNSIGNED NULL,
  `item_name` VARCHAR(120) NOT NULL,
  `unit_price` DECIMAL(10,2) UNSIGNED NOT NULL,
  `quantity` SMALLINT UNSIGNED NOT NULL,
  `special_instructions` VARCHAR(500) NULL,
  `line_total` DECIMAL(10,2) UNSIGNED NOT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `idx_order_items_order` (`order_id`),
  CONSTRAINT `fk_order_items_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_menu_item`
    FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`menu_item_id`) ON DELETE SET NULL,
  CONSTRAINT `chk_order_items_values` CHECK (`unit_price` >= 0 AND `quantity` > 0 AND `line_total` >= 0)
) ENGINE=InnoDB;

CREATE TABLE `order_item_addons` (
  `order_item_addon_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_item_id` BIGINT UNSIGNED NOT NULL,
  `addon_id` INT UNSIGNED NULL,
  `addon_name` VARCHAR(100) NOT NULL,
  `unit_price` DECIMAL(10,2) UNSIGNED NOT NULL,
  `quantity` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`order_item_addon_id`),
  KEY `idx_order_item_addons_item` (`order_item_id`),
  CONSTRAINT `fk_order_item_addons_order_item`
    FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`order_item_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_item_addons_addon`
    FOREIGN KEY (`addon_id`) REFERENCES `addons` (`addon_id`) ON DELETE SET NULL,
  CONSTRAINT `chk_order_item_addons_values` CHECK (`unit_price` >= 0 AND `quantity` > 0)
) ENGINE=InnoDB;

CREATE TABLE `order_status_history` (
  `history_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `status` ENUM('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled') NOT NULL,
  `note` VARCHAR(255) NULL,
  `changed_by` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `idx_order_status_history_order_created` (`order_id`, `created_at`),
  CONSTRAINT `fk_order_status_history_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_status_history_user`
    FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
