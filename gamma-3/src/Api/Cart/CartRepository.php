<?php

declare(strict_types=1);

namespace App\Api\Cart;

use PDO;

final class CartRepository
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getOrCreateCart(int $userId): int
    {
        $stmt = $this->pdo->prepare('SELECT cart_id FROM carts WHERE user_id = ?');
        $stmt->execute([$userId]);
        $cart = $stmt->fetch();
        if ($cart) {
            return (int)$cart['cart_id'];
        }

        $stmt = $this->pdo->prepare('INSERT INTO carts (user_id) VALUES (?)');
        $stmt->execute([$userId]);
        return (int)$this->pdo->lastInsertId();
    }

    public function addItemToCart(int $cartId, int $menuItemId, int $quantity, ?string $specialInstructions, array $addons = []): int
    {
        // Normalize the incoming addons to [addonId => quantity]
        $incomingNormalized = [];
        foreach ($addons as $addon) {
            $addonId = (int)($addon['addonId'] ?? 0);
            $addonQty = (int)($addon['quantity'] ?? 0);
            if ($addonId > 0 && $addonQty > 0) {
                $incomingNormalized[$addonId] = $addonQty;
            }
        }
        ksort($incomingNormalized);

        // Fetch all existing cart items in this cart for this menu item
        $stmt = $this->pdo->prepare('SELECT cart_item_id, special_instructions FROM cart_items WHERE cart_id = ? AND menu_item_id = ?');
        $stmt->execute([$cartId, $menuItemId]);
        $existingItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $matchedCartItemId = null;

        foreach ($existingItems as $existing) {
            // Compare special instructions (treat null and empty string as equivalent)
            $existingInstructions = trim($existing['special_instructions'] ?? '');
            $incomingInstructions = trim($specialInstructions ?? '');
            if ($existingInstructions !== $incomingInstructions) {
                continue;
            }

            // Fetch addons for this existing cart item
            $addonStmt = $this->pdo->prepare('SELECT addon_id, quantity FROM cart_item_addons WHERE cart_item_id = ?');
            $addonStmt->execute([$existing['cart_item_id']]);
            $existingAddons = $addonStmt->fetchAll(PDO::FETCH_ASSOC);

            $existingNormalized = [];
            foreach ($existingAddons as $ea) {
                $addonId = (int)$ea['addon_id'];
                $addonQty = (int)$ea['quantity'];
                if ($addonQty > 0) {
                    $existingNormalized[$addonId] = $addonQty;
                }
            }
            ksort($existingNormalized);

            // If the addons match exactly, we found the item!
            if ($incomingNormalized === $existingNormalized) {
                $matchedCartItemId = (int)$existing['cart_item_id'];
                break;
            }
        }

        if ($matchedCartItemId !== null) {
            // Increment the quantity of the existing matched item
            $stmt = $this->pdo->prepare('UPDATE cart_items SET quantity = quantity + ? WHERE cart_item_id = ?');
            $stmt->execute([$quantity, $matchedCartItemId]);
            return $matchedCartItemId;
        } else {
            // Create a new cart item
            $stmt = $this->pdo->prepare('INSERT INTO cart_items (cart_id, menu_item_id, quantity, special_instructions) VALUES (?, ?, ?, ?)');
            $stmt->execute([$cartId, $menuItemId, $quantity, $specialInstructions]);
            $newCartItemId = (int)$this->pdo->lastInsertId();

            // Insert its addons
            foreach ($incomingNormalized as $addonId => $addonQty) {
                $stmt = $this->pdo->prepare('INSERT INTO cart_item_addons (cart_item_id, addon_id, quantity) VALUES (?, ?, ?)');
                $stmt->execute([$newCartItemId, $addonId, $addonQty]);
            }

            return $newCartItemId;
        }
    }

    public function clearItemAddons(int $cartItemId): void
    {
        $stmt = $this->pdo->prepare('DELETE FROM cart_item_addons WHERE cart_item_id = ?');
        $stmt->execute([$cartItemId]);
    }

    public function addItemAddon(int $cartItemId, int $addonId, int $quantity): void
    {
        $stmt = $this->pdo->prepare('INSERT INTO cart_item_addons (cart_item_id, addon_id, quantity) VALUES (?, ?, ?)');
        $stmt->execute([$cartItemId, $addonId, $quantity]);
    }

    /**
     * Return all cart items for a given user, or an empty array if no cart exists.
     *
     * @return array<int, array{cart_item_id:int, menu_item_id:int, item_name:string, quantity:int,
     *                           unit_price:float, special_instructions:string|null, addons:array}>
     */
    public function getCart(int $userId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT ci.cart_item_id, ci.menu_item_id, m.name AS item_name,
                    ci.quantity, m.price AS unit_price, ci.special_instructions, m.image_path
             FROM carts c
             JOIN cart_items ci ON ci.cart_id = c.cart_id
             JOIN menu_items m  ON m.menu_item_id = ci.menu_item_id
             WHERE c.user_id = ?
             ORDER BY ci.cart_item_id'
        );
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll();

        $items = [];
        foreach ($rows as $row) {
            // Fetch addons for each cart item.
            $addonStmt = $this->pdo->prepare(
                'SELECT cia.addon_id, a.name AS addon_name, cia.quantity, a.price AS unit_price
                 FROM cart_item_addons cia
                 JOIN addons a ON a.addon_id = cia.addon_id
                 WHERE cia.cart_item_id = ?'
            );
            $addonStmt->execute([$row['cart_item_id']]);
            $row['addons'] = $addonStmt->fetchAll();
            $items[] = $row;
        }

        return $items;
    }

    /**
     * Fetch public settings from the restaurant_settings table, safely catching exceptions (e.g. in tests).
     *
     * @return array<string, mixed>
     */
    public function getPublicSettings(): array
    {
        try {
            $stmt = $this->pdo->prepare('SELECT setting_key, setting_value FROM restaurant_settings WHERE is_public = 1');
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        } catch (\Throwable $e) {
            return [];
        }
    }

    /**
     * Fetch the default address and payment method from the customer profile.
     *
     * @return array{default_address:string|null, default_payment_method:string|null}|null
     */
    public function getCustomerProfile(int $userId): ?array
    {
        try {
            $stmt = $this->pdo->prepare('SELECT default_address, default_payment_method FROM customer_profiles WHERE user_id = ?');
            $stmt->execute([$userId]);
            $profile = $stmt->fetch(PDO::FETCH_ASSOC);
            return $profile ?: null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    public function updateItemQuantity(int $cartItemId, int $quantity): void
    {
        if ($quantity <= 0) {
            $this->deleteItem($cartItemId);
            return;
        }
        $stmt = $this->pdo->prepare('UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?');
        $stmt->execute([$quantity, $cartItemId]);
    }

    public function deleteItem(int $cartItemId): void
    {
        $this->pdo->prepare('DELETE FROM cart_item_addons WHERE cart_item_id = ?')->execute([$cartItemId]);
        $this->pdo->prepare('DELETE FROM cart_items WHERE cart_item_id = ?')->execute([$cartItemId]);
    }

    public function checkout(
        int $userId,
        string $orderType,
        string $paymentMethod,
        ?string $tableNumber,
        ?string $deliveryAddress,
        ?string $customerNote,
        ?string $pickupAt = null
    ): string {
        $this->pdo->beginTransaction();
        try {
            // Get the cart
            $stmt = $this->pdo->prepare('SELECT cart_id FROM carts WHERE user_id = ?');
            $stmt->execute([$userId]);
            $cart = $stmt->fetch();
            if (!$cart) {
                throw new \RuntimeException('Cart is empty.');
            }
            $cartId = (int)$cart['cart_id'];

            // Get cart items
            $cartItems = $this->getCart($userId);
            if (empty($cartItems)) {
                throw new \RuntimeException('Cart is empty.');
            }

            // Calculate subtotal, addons total, and item counts
            $subtotal = 0.0;
            $addonsTotal = 0.0;
            $totalQuantity = 0;

            foreach ($cartItems as $item) {
                $subtotal += (float)$item['unit_price'] * (int)$item['quantity'];
                $totalQuantity += (int)$item['quantity'];
                foreach ($item['addons'] as $addon) {
                    $addonsTotal += (float)$addon['unit_price'] * (int)$addon['quantity'] * (int)$item['quantity'];
                }
            }

            // Fetch settings for fees
            $stmt = $this->pdo->prepare('SELECT setting_key, setting_value FROM restaurant_settings');
            $stmt->execute();
            $settingsRows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

            $serviceFeePercent = (float)($settingsRows['service_fee'] ?? $settingsRows['dine_in_service_charge'] ?? 10.0);
            $deliveryFeeFlat = (float)($settingsRows['delivery_fee'] ?? $settingsRows['delivery_fee_flat'] ?? 5.00);
            
            $packagingFeeTakeaway = (float)($settingsRows['packaging_fee_takeaway'] ?? $settingsRows['packaging_fee'] ?? $settingsRows['packaging_fee_per_item'] ?? 0.50);
            $packagingFeeDelivery = (float)($settingsRows['packaging_fee_delivery'] ?? $settingsRows['packaging_fee'] ?? $settingsRows['packaging_fee_per_item'] ?? 0.50);

            $serviceFee = $subtotal * ($serviceFeePercent / 100.0);
            $packagingFee = 0.0;
            $deliveryFee = 0.0;

            if ($orderType === 'takeaway') {
                $packagingFee = $packagingFeeTakeaway * $totalQuantity;
            } elseif ($orderType === 'delivery') {
                $packagingFee = $packagingFeeDelivery * $totalQuantity;
                $deliveryFee = $deliveryFeeFlat;
            }

            $totalAmount = $subtotal + $addonsTotal + $serviceFee + $packagingFee + $deliveryFee;

            // Generate order number
            $orderNumber = 'ORD-' . date('Ymd') . '-' . sprintf('%05d', rand(1, 99999));

            // Insert order record
            $orderStmt = $this->pdo->prepare('
                INSERT INTO orders (
                    order_number, user_id, order_type, payment_method, payment_status, order_status,
                    subtotal, packaging_fee, delivery_fee, service_fee, total_amount,
                    table_number, delivery_address, customer_note, pickup_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ');
            $orderStmt->execute([
                $orderNumber, $userId, $orderType, $paymentMethod, 'unpaid', 'pending',
                $subtotal, $packagingFee, $deliveryFee, $serviceFee, $totalAmount,
                $tableNumber, $deliveryAddress, $customerNote, $pickupAt
            ]);
            $orderId = (int)$this->pdo->lastInsertId();

            // Insert status history
            $this->pdo->prepare("INSERT INTO order_status_history (order_id, status) VALUES (?, 'pending')")->execute([$orderId]);

            // Insert order items and their addons
            foreach ($cartItems as $item) {
                $itemStmt = $this->pdo->prepare('
                    INSERT INTO order_items (
                        order_id, menu_item_id, item_name, unit_price, quantity, special_instructions, line_total
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ');
                $lineTotal = (float)$item['unit_price'] * (int)$item['quantity'];
                $itemStmt->execute([
                    $orderId, $item['menu_item_id'], $item['item_name'], $item['unit_price'],
                    $item['quantity'], $item['special_instructions'], $lineTotal
                ]);
                $orderItemId = (int)$this->pdo->lastInsertId();

                foreach ($item['addons'] as $addon) {
                    $addonStmt = $this->pdo->prepare('
                        INSERT INTO order_item_addons (
                            order_item_id, addon_id, addon_name, unit_price, quantity
                        ) VALUES (?, ?, ?, ?, ?)
                    ');
                    $addonTotalQty = (int)$addon['quantity'] * (int)$item['quantity'];
                    $addonStmt->execute([
                        $orderItemId, $addon['addon_id'], $addon['addon_name'], $addon['unit_price'], $addonTotalQty
                    ]);
                }
            }

            // Clear user's cart items
            $this->pdo->prepare('DELETE FROM cart_items WHERE cart_id = ?')->execute([$cartId]);

            $this->pdo->commit();
            return $orderNumber;
        } catch (\Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $e;
        }
    }
}
