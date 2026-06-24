<?php

declare(strict_types=1);

namespace App\Api\Orders;

use App\Api\Shared\ImageStorage;
use InvalidArgumentException;
use PDO;

final class OrderRepository
{
    public function __construct(private readonly PDO $pdo)
    {
    }

    public function fetchAll(): array
    {
        $orders = $this->pdo->query('SELECT o.*, u.display_name FROM orders o JOIN users u ON u.user_id = o.user_id ORDER BY o.created_at DESC, o.order_id DESC')->fetchAll();
        $items = $this->pdo->prepare('SELECT oi.order_item_id, oi.item_name, oi.quantity, oi.unit_price, oi.line_total, oi.special_instructions, COALESCE(mi.image_path, ?) image_path FROM order_items oi LEFT JOIN menu_items mi ON mi.menu_item_id = oi.menu_item_id WHERE oi.order_id = ? ORDER BY oi.order_item_id');
        $addons = $this->pdo->prepare('SELECT order_item_addon_id, addon_id, addon_name, unit_price, quantity FROM order_item_addons WHERE order_item_id = ? ORDER BY order_item_addon_id');
        foreach ($orders as &$order) {
            $items->execute([ImageStorage::DEFAULT_IMAGE_PATH, $order['order_id']]);
            $orderItems = $items->fetchAll();
            foreach ($orderItems as &$item) {
                $addons->execute([$item['order_item_id']]);
                $item['addons'] = $addons->fetchAll();
            }
            $order['items'] = $orderItems;
        }
        return $orders;
    }

    public function fetchByUserId(int $userId): array
    {
        $stmt = $this->pdo->prepare('SELECT o.*, u.display_name FROM orders o JOIN users u ON u.user_id = o.user_id WHERE o.user_id = ? ORDER BY o.created_at DESC, o.order_id DESC');
        $stmt->execute([$userId]);
        $orders = $stmt->fetchAll();

        $items = $this->pdo->prepare('SELECT oi.order_item_id, oi.item_name, oi.quantity, oi.unit_price, oi.line_total, oi.special_instructions, COALESCE(mi.image_path, ?) image_path FROM order_items oi LEFT JOIN menu_items mi ON mi.menu_item_id = oi.menu_item_id WHERE oi.order_id = ? ORDER BY oi.order_item_id');
        $addons = $this->pdo->prepare('SELECT order_item_addon_id, addon_id, addon_name, unit_price, quantity FROM order_item_addons WHERE order_item_id = ? ORDER BY order_item_addon_id');
        foreach ($orders as &$order) {
            $items->execute([ImageStorage::DEFAULT_IMAGE_PATH, $order['order_id']]);
            $orderItems = $items->fetchAll();
            foreach ($orderItems as &$item) {
                $addons->execute([$item['order_item_id']]);
                $item['addons'] = $addons->fetchAll();
            }
            $order['items'] = $orderItems;
        }
        return $orders;
    }

    public function changeStatus(int $id, string $status, ?string $cancellationReason = null): void
    {
        $this->pdo->beginTransaction();
        try {
            $statement = $this->pdo->prepare("UPDATE orders SET order_status = ?, completed_at = CASE WHEN ? IN ('completed', 'cancelled') THEN NOW() ELSE NULL END, cancellation_reason = CASE WHEN ? = 'cancelled' THEN ? ELSE NULL END WHERE order_id = ?");
            $statement->execute([$status, $status, $status, $cancellationReason, $id]);
            if ($statement->rowCount() === 0 && !$this->exists($id)) {
                throw new InvalidArgumentException('Order not found.');
            }
            $this->pdo->prepare('INSERT INTO order_status_history (order_id, status) VALUES (?, ?)')->execute([$id, $status]);
            $this->pdo->commit();
        } catch (\Throwable $exception) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $exception;
        }
    }

    private function exists(int $id): bool
    {
        $statement = $this->pdo->prepare('SELECT COUNT(*) FROM orders WHERE order_id = ?');
        $statement->execute([$id]);
        return (int) $statement->fetchColumn() > 0;
    }
}
