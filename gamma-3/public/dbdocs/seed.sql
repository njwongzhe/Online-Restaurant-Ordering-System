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
  (5, '0122000003', '$2y$10$W9bSIz/BM6Os6mFPHdzy1ObMs6LImppR/BrflBoC20sv/b0lwV5Du', 'Muthu Raj', 'customer', 1);

INSERT INTO `admin_profiles` (`user_id`, `position`) VALUES
  (1, 'Restaurant Manager'),
  (2, 'Kitchen Supervisor');

INSERT INTO `customer_profiles` (`user_id`, `default_address`, `default_payment_method`) VALUES
  (3, 'Kolej Tun Dr Ismail, UTM', 'cash'),
  (4, 'Kolej Datin Seri Endon, UTM', 'e_wallet'),
  (5, 'Kolej Rahman Putra, UTM', 'online_banking');

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
  (`menu_item_id`, `category_id`, `name`, `slug`, `description`, `price`, `image_path`, `is_available`, `is_featured`, `display_order`)
VALUES
  (1, 1, 'Avocado Power Bowl', 'avocado-power-bowl', 'Quinoa, roasted chickpeas, avocado and citrus dressing.', 12.50, NULL, 1, 1, 1),
  (2, 1, 'Lanita Signature Burger', 'lanita-signature-burger', 'Beef patty, smoked cheese, caramelised onion and house sauce.', 14.00, NULL, 1, 1, 2),
  (3, 1, 'Truffle Mushroom Pasta', 'truffle-mushroom-pasta', 'Fettuccine with wild mushrooms and light truffle cream.', 16.50, NULL, 1, 0, 3),
  (4, 1, 'Nasi Goreng Kampung', 'nasi-goreng-kampung', 'Traditional fried rice with chicken, anchovies and vegetables.', 12.00, NULL, 1, 0, 4),
  (5, 1, 'Maggi Goreng Special', 'maggi-goreng-special', 'Wok-fried noodles with vegetables, egg and sambal.', 7.50, NULL, 0, 0, 5),
  (6, 2, 'Artisanal Latte', 'artisanal-latte', 'Single-origin espresso with silky steamed milk.', 4.50, NULL, 1, 1, 1),
  (7, 2, 'Minty Lemonade', 'minty-lemonade', 'Fresh lemon, mint and sparkling water.', 3.75, NULL, 1, 0, 2),
  (8, 2, 'Ceremonial Matcha', 'ceremonial-matcha', 'Premium matcha whisked with oat milk.', 5.25, NULL, 1, 0, 3),
  (9, 2, 'Cold Brew Reserve', 'cold-brew-reserve', 'Coffee steeped slowly for 24 hours.', 4.00, NULL, 1, 0, 4),
  (10, 3, 'Pandan Crème Brûlée', 'pandan-creme-brulee', 'Silky pandan custard with caramelised sugar.', 8.00, NULL, 1, 1, 1);

INSERT INTO `tags` (`tag_id`, `name`, `slug`) VALUES
  (1, 'Vegan', 'vegan'),
  (2, 'Vegetarian', 'vegetarian'),
  (3, 'Spicy', 'spicy'),
  (4, 'Popular', 'popular');

INSERT INTO `menu_item_tags` (`menu_item_id`, `tag_id`) VALUES
  (1, 1), (1, 4), (2, 4), (3, 2), (4, 3), (7, 1), (8, 1), (10, 2);

INSERT INTO `addons` (`addon_id`, `name`, `description`, `price`, `is_available`) VALUES
  (1, 'Extra Egg', 'Add a fried egg.', 1.00, 1),
  (2, 'Extra Chicken', 'Add a portion of chicken.', 3.00, 1),
  (3, 'Oat Milk', 'Replace dairy milk with oat milk.', 1.50, 1),
  (4, 'Extra Espresso Shot', 'Add one espresso shot.', 2.00, 1),
  (5, 'Less Ice', 'Prepare the drink with less ice.', 0.00, 1);

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
   `subtotal`, `packaging_fee`, `delivery_fee`, `service_fee`, `total_amount`, `delivery_address`, `customer_note`, `completed_at`)
VALUES
  (1, 'LNT-20260618-0001', 3, 'delivery', 'e_wallet', 'paid', 'completed',
   18.00, 1.00, 3.00, 0.00, 22.00, 'Kolej Tun Dr Ismail, UTM', 'Call on arrival.', '2026-06-18 13:10:00'),
  (2, 'LNT-20260619-0002', 5, 'takeaway', 'cash', 'unpaid', 'preparing',
   16.75, 0.50, 0.00, 0.00, 17.25, NULL, NULL, NULL);

INSERT INTO `order_items`
  (`order_item_id`, `order_id`, `menu_item_id`, `item_name`, `unit_price`, `quantity`, `special_instructions`, `line_total`)
VALUES
  (1, 1, 2, 'Lanita Signature Burger', 14.00, 1, NULL, 14.00),
  (2, 1, 9, 'Cold Brew Reserve', 4.00, 1, 'Less ice', 4.00),
  (3, 2, 4, 'Nasi Goreng Kampung', 12.00, 1, 'Less spicy', 12.00),
  (4, 2, 7, 'Minty Lemonade', 3.75, 1, NULL, 3.75);

INSERT INTO `order_item_addons`
  (`order_item_addon_id`, `order_item_id`, `addon_id`, `addon_name`, `unit_price`, `quantity`)
VALUES
  (1, 2, 5, 'Less Ice', 0.00, 1),
  (2, 3, 1, 'Extra Egg', 1.00, 1);

INSERT INTO `order_status_history` (`order_id`, `status`, `note`, `changed_by`, `created_at`) VALUES
  (1, 'pending', 'Order received.', NULL, '2026-06-18 12:10:00'),
  (1, 'preparing', 'Kitchen started the order.', 2, '2026-06-18 12:16:00'),
  (1, 'out_for_delivery', 'Order left the restaurant.', 1, '2026-06-18 12:48:00'),
  (1, 'completed', 'Delivered to customer.', 1, '2026-06-18 13:10:00'),
  (2, 'pending', 'Order received.', NULL, '2026-06-19 11:20:00'),
  (2, 'preparing', 'Kitchen started the order.', 2, '2026-06-19 11:24:00');

COMMIT;
