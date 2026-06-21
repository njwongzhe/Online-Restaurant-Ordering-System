-- Online Restaurant Ordering System
-- Development seed data. Run database/schema.sql first.

USE `cpad_03_gamma`;
SET NAMES utf8mb4;

START TRANSACTION;

-- All sample accounts use: Password123!
INSERT INTO `users`
  (`user_id`, `phone_number`, `password_hash`, `display_name`, `role`, `is_active`)
VALUES
  (1, '0111000001', '$2y$10$W9bSIz/BM6Os6mFPHdzy1ObMs6LImppR/BrflBoC20sv/b0lwV5Du', 'Aina Rahman', 'admin', 1),
  (2, '0111000002', '$2y$10$W9bSIz/BM6Os6mFPHdzy1ObMs6LImppR/BrflBoC20sv/b0lwV5Du', 'Daniel Lee', 'admin', 1),
  (3, '0122000001', '$2y$10$W9bSIz/BM6Os6mFPHdzy1ObMs6LImppR/BrflBoC20sv/b0lwV5Du', 'Ali Ahmad', 'customer', 1),
  (4, '0122000002', '$2y$10$W9bSIz/BM6Os6mFPHdzy1ObMs6LImppR/BrflBoC20sv/b0lwV5Du', 'Siti Aminah', 'customer', 1),
  (5, '0122000003', '$2y$10$W9bSIz/BM6Os6mFPHdzy1ObMs6LImppR/BrflBoC20sv/b0lwV5Du', 'Muthu Raj', 'customer', 1),
  (6, '0122000004', '$2y$10$W9bSIz/BM6Os6mFPHdzy1ObMs6LImppR/BrflBoC20sv/b0lwV5Du', 'Nur Izzati', 'customer', 1),
  (7, '0122000005', '$2y$10$W9bSIz/BM6Os6mFPHdzy1ObMs6LImppR/BrflBoC20sv/b0lwV5Du', 'Jason Wong', 'customer', 1);

INSERT INTO `admin_profiles` (`user_id`, `position`) VALUES
  (1, 'Restaurant Manager'),
  (2, 'Kitchen Supervisor');

INSERT INTO `customer_profiles` (`user_id`, `default_address`, `default_payment_method`) VALUES
  (3, 'Kolej Tun Dr Ismail, UTM', 'cash'),
  (4, 'Kolej Datin Seri Endon, UTM', 'e_wallet'),
  (5, 'Kolej Rahman Putra, UTM', 'online_banking'),
  (6, 'Kolej Tun Fatimah, UTM', 'e_wallet'),
  (7, 'Kolej Perdana, UTM', 'cash');

INSERT INTO `restaurant_settings`
  (`setting_key`, `setting_value`, `value_type`, `description`, `is_public`, `updated_by`)
VALUES
  ('restaurant_name', 'Lanita Restaurant', 'string', 'Name shown to customers.', 1, 1),
  ('restaurant_address', 'Arked Lestari, UTM Johor Bahru', 'string', 'Pickup and delivery origin.', 1, 1),
  ('restaurant_open', 'true', 'boolean', 'Controls whether new orders are accepted.', 1, 1),
  ('service_fee', '0.00', 'number', 'Service fee per order.', 1, 1),
  ('delivery_fee', '3.00', 'number', 'Standard local delivery fee.', 1, 1),
  ('packaging_fee_delivery', '1.00', 'number', 'Packaging fee for delivery orders.', 1, 1),
  ('packaging_fee_takeaway', '0.50', 'number', 'Packaging fee for takeaway orders.', 1, 1),
  ('currency', 'MYR', 'string', 'ISO currency code.', 1, 1);

INSERT INTO `categories`
  (`category_id`, `name`, `slug`, `description`, `is_available`)
VALUES
  (1, 'Food', 'food', 'Freshly prepared main dishes.', 1),
  (2, 'Drinks', 'drinks', 'Hot and cold beverages.', 1),
  (3, 'Desserts', 'desserts', 'Sweet finishes and light treats.', 1);

INSERT INTO `menu_items`
  (`menu_item_id`, `category_id`, `name`, `slug`, `description`, `price`, `image_path`, `is_available`)
VALUES
  (1, 1, 'Avocado Power Bowl', 'avocado-power-bowl', 'Quinoa, roasted chickpeas, avocado and citrus dressing.', 12.50, NULL, 1),
  (2, 1, 'Lanita Signature Burger', 'lanita-signature-burger', 'Beef patty, smoked cheese, caramelised onion and house sauce.', 14.00, NULL, 1),
  (3, 1, 'Truffle Mushroom Pasta', 'truffle-mushroom-pasta', 'Fettuccine with wild mushrooms and light truffle cream.', 16.50, NULL, 1),
  (4, 1, 'Nasi Goreng Kampung', 'nasi-goreng-kampung', 'Traditional fried rice with chicken, anchovies and vegetables.', 12.00, NULL, 1),
  (5, 1, 'Maggi Goreng Special', 'maggi-goreng-special', 'Wok-fried noodles with vegetables, egg and sambal.', 7.50, NULL, 0),
  (6, 2, 'Artisanal Latte', 'artisanal-latte', 'Single-origin espresso with silky steamed milk.', 4.50, NULL, 1),
  (7, 2, 'Minty Lemonade', 'minty-lemonade', 'Fresh lemon, mint and sparkling water.', 3.75, NULL, 1),
  (8, 2, 'Ceremonial Matcha', 'ceremonial-matcha', 'Premium matcha whisked with oat milk.', 5.25, NULL, 1),
  (9, 2, 'Cold Brew Reserve', 'cold-brew-reserve', 'Coffee steeped slowly for 24 hours.', 4.00, NULL, 1),
  (10, 3, 'Pandan Crème Brûlée', 'pandan-creme-brulee', 'Silky pandan custard with caramelised sugar.', 8.00, NULL, 1);

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
  (10, 'LNT-20260620-0010', 7, 'takeaway', 'cash', 'unpaid', 'confirmed',
   4.00, 0.50, 0.00, 0.00, 4.50, NULL, '2026-06-20 11:20:00', NULL, 'Less ice.', '2026-06-20 10:55:00', '2026-06-20 10:57:00', NULL),
  (11, 'LNT-20260620-0011', 3, 'delivery', 'online_banking', 'paid', 'completed',
   8.00, 1.00, 3.00, 0.00, 12.00, NULL, NULL, 'Kolej Tun Dr Ismail, UTM', NULL, '2026-06-20 12:30:00', '2026-06-20 13:20:00', '2026-06-20 13:20:00'),
  (12, 'LNT-20260620-0012', 5, 'dine_in', 'cash', 'paid', 'completed',
   21.50, 0.00, 0.00, 0.00, 21.50, 'A06', NULL, NULL, NULL, '2026-06-20 13:40:00', '2026-06-20 14:25:00', '2026-06-20 14:25:00'),
  (13, 'LNT-20260620-0013', 4, 'takeaway', 'e_wallet', 'paid', 'ready',
   12.50, 0.50, 0.00, 0.00, 13.00, NULL, '2026-06-20 15:15:00', NULL, NULL, '2026-06-20 14:45:00', '2026-06-20 15:05:00', NULL),
  (14, 'LNT-20260620-0014', 6, 'delivery', 'e_wallet', 'paid', 'preparing',
   16.50, 1.00, 3.00, 0.00, 20.50, NULL, NULL, 'Kolej Tun Fatimah, UTM', NULL, '2026-06-20 16:00:00', '2026-06-20 16:08:00', NULL),
  (15, 'LNT-20260620-0015', 7, 'dine_in', 'cash', 'unpaid', 'pending',
   12.00, 0.00, 0.00, 0.00, 12.00, 'B08', NULL, NULL, 'Extra spicy.', '2026-06-20 17:10:00', '2026-06-20 17:10:00', NULL),
  (16, 'LNT-20260621-0016', 3, 'takeaway', 'cash', 'unpaid', 'completed',
   4.50, 0.50, 0.00, 0.00, 5.00, NULL, '2026-06-21 08:30:00', NULL, NULL, '2026-06-21 08:00:00', '2026-06-21 08:28:00', '2026-06-21 08:28:00'),
  (17, 'LNT-20260621-0017', 5, 'delivery', 'online_banking', 'paid', 'cancelled',
   3.75, 1.00, 3.00, 0.00, 7.75, NULL, NULL, 'Kolej Rahman Putra, UTM', NULL, '2026-06-21 08:20:00', '2026-06-21 08:25:00', '2026-06-21 08:25:00'),
  (18, 'LNT-20260621-0018', 4, 'dine_in', 'e_wallet', 'paid', 'preparing',
   5.25, 0.00, 0.00, 0.00, 5.25, 'C05', NULL, NULL, NULL, '2026-06-21 09:00:00', '2026-06-21 09:08:00', NULL),
  (19, 'LNT-20260621-0019', 6, 'takeaway', 'e_wallet', 'paid', 'confirmed',
   4.00, 0.50, 0.00, 0.00, 4.50, NULL, '2026-06-21 09:45:00', NULL, 'No straw.', '2026-06-21 09:15:00', '2026-06-21 09:17:00', NULL),
  (20, 'LNT-20260621-0020', 7, 'delivery', 'cash', 'unpaid', 'pending',
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
  (13, 11, 10, 'Pandan Crème Brûlée', 8.00, 1, NULL, 8.00),
  (14, 12, 2, 'Lanita Signature Burger', 14.00, 1, NULL, 14.00),
  (15, 12, 5, 'Maggi Goreng Special', 7.50, 1, NULL, 7.50),
  (16, 13, 1, 'Avocado Power Bowl', 12.50, 1, NULL, 12.50),
  (17, 14, 3, 'Truffle Mushroom Pasta', 16.50, 1, NULL, 16.50),
  (18, 15, 4, 'Nasi Goreng Kampung', 12.00, 1, 'Extra spicy', 12.00),
  (19, 16, 6, 'Artisanal Latte', 4.50, 1, NULL, 4.50),
  (20, 17, 7, 'Minty Lemonade', 3.75, 1, NULL, 3.75),
  (21, 18, 8, 'Ceremonial Matcha', 5.25, 1, NULL, 5.25),
  (22, 19, 9, 'Cold Brew Reserve', 4.00, 1, 'No straw', 4.00),
  (23, 20, 10, 'Pandan Crème Brûlée', 8.00, 1, NULL, 8.00);

INSERT INTO `order_item_addons`
  (`order_item_addon_id`, `order_item_id`, `addon_id`, `addon_name`, `unit_price`, `quantity`)
VALUES
  (1, 2, 5, 'Less Ice', 0.00, 1),
  (2, 3, 1, 'Extra Egg', 1.00, 1);

INSERT INTO `order_status_history` (`order_id`, `status`, `changed_by`, `created_at`) VALUES
  (1, 'pending', NULL, '2026-06-18 12:10:00'),
  (1, 'preparing', 2, '2026-06-18 12:16:00'),
  (1, 'out_for_delivery', 1, '2026-06-18 12:48:00'),
  (1, 'completed', 1, '2026-06-18 13:10:00'),
  (2, 'pending', NULL, '2026-06-19 11:20:00'),
  (2, 'preparing', 2, '2026-06-19 11:24:00'),
  (3, 'completed', 1, '2026-06-19 12:42:00'),
  (4, 'ready', 2, '2026-06-19 13:10:00'),
  (5, 'out_for_delivery', 1, '2026-06-19 13:48:00'),
  (6, 'completed', 1, '2026-06-19 18:50:00'),
  (7, 'cancelled', 1, '2026-06-20 08:12:00'),
  (8, 'completed', 1, '2026-06-20 09:45:00'),
  (9, 'completed', 1, '2026-06-20 10:40:00'),
  (10, 'confirmed', 2, '2026-06-20 10:57:00'),
  (11, 'completed', 1, '2026-06-20 13:20:00'),
  (12, 'completed', 1, '2026-06-20 14:25:00'),
  (13, 'ready', 2, '2026-06-20 15:05:00'),
  (14, 'preparing', 2, '2026-06-20 16:08:00'),
  (15, 'pending', NULL, '2026-06-20 17:10:00'),
  (16, 'completed', 1, '2026-06-21 08:28:00'),
  (17, 'cancelled', 1, '2026-06-21 08:25:00'),
  (18, 'preparing', 2, '2026-06-21 09:08:00'),
  (19, 'confirmed', 2, '2026-06-21 09:17:00'),
  (20, 'pending', NULL, '2026-06-21 09:30:00');

COMMIT;
