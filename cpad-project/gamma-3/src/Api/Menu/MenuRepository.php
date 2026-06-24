<?php

declare(strict_types=1);

namespace App\Api\Menu;

use PDO;

final class MenuRepository
{
    public function __construct(private readonly PDO $pdo)
    {
    }

    public function fetchMenu(): array
    {
        $categories = $this->pdo->query('SELECT category_id, name, is_available FROM categories ORDER BY name ASC, category_id ASC')->fetchAll();
        $items = $this->pdo->prepare('SELECT menu_item_id, name, description, price, image_path, is_available FROM menu_items WHERE category_id = ? ORDER BY name ASC, menu_item_id ASC');
        $addons = $this->pdo->prepare('SELECT a.addon_id, a.name, a.price FROM menu_item_addons mia JOIN addons a ON a.addon_id = mia.addon_id WHERE mia.menu_item_id = ? ORDER BY mia.display_order, a.addon_id');
        foreach ($categories as &$category) {
            $items->execute([$category['category_id']]);
            $categoryItems = $items->fetchAll();
            foreach ($categoryItems as &$item) {
                $addons->execute([$item['menu_item_id']]);
                $item['addons'] = $addons->fetchAll();
            }
            $category['items'] = $categoryItems;
        }
        return $categories;
    }

    public function categoryExists(int $id): bool
    {
        $statement = $this->pdo->prepare('SELECT COUNT(*) FROM categories WHERE category_id = ?');
        $statement->execute([$id]);
        return (int) $statement->fetchColumn() > 0;
    }

    public function categoryNameExists(string $name, ?int $excludeId = null): bool
    {
        $sql = 'SELECT COUNT(*) FROM categories WHERE LOWER(name) = LOWER(?)' . ($excludeId ? ' AND category_id <> ?' : '');
        $statement = $this->pdo->prepare($sql);
        $parameters = [$name];
        if ($excludeId) $parameters[] = $excludeId;
        $statement->execute($parameters);
        return (int) $statement->fetchColumn() > 0;
    }

    public function createCategory(string $name): int
    {
        $statement = $this->pdo->prepare('INSERT INTO categories (name, is_available) VALUES (?, 1)');
        $statement->execute([$name]);
        return (int) $this->pdo->lastInsertId();
    }

    public function updateCategory(int $id, array $changes): void
    {
        if (array_key_exists('name', $changes)) {
            $this->pdo->prepare('UPDATE categories SET name = ? WHERE category_id = ?')->execute([$changes['name'], $id]);
        }
        if (array_key_exists('is_available', $changes)) {
            $this->pdo->prepare('UPDATE categories SET is_available = ? WHERE category_id = ?')->execute([$changes['is_available'] ? 1 : 0, $id]);
        }
    }

    public function deleteCategory(int $id): array
    {
        $images = $this->pdo->prepare('SELECT image_path FROM menu_items WHERE category_id = ?');
        $images->execute([$id]);
        $paths = $images->fetchAll(PDO::FETCH_COLUMN);
        $this->pdo->beginTransaction();
        try {
            $this->pdo->prepare('DELETE FROM menu_items WHERE category_id = ?')->execute([$id]);
            $deleted = $this->pdo->prepare('DELETE FROM categories WHERE category_id = ?');
            $deleted->execute([$id]);
            if ($deleted->rowCount() === 0) throw new \InvalidArgumentException('Category not found.');
            $this->pdo->commit();
            return $paths;
        } catch (\Throwable $exception) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $exception;
        }
    }

    public function itemNameExists(string $name, ?int $excludeId = null): bool
    {
        $sql = 'SELECT COUNT(*) FROM menu_items WHERE LOWER(name) = LOWER(?)' . ($excludeId ? ' AND menu_item_id <> ?' : '');
        $statement = $this->pdo->prepare($sql);
        $parameters = [$name];
        if ($excludeId) $parameters[] = $excludeId;
        $statement->execute($parameters);
        return (int) $statement->fetchColumn() > 0;
    }

    public function imagePath(int $itemId): string|null|false
    {
        $statement = $this->pdo->prepare('SELECT image_path FROM menu_items WHERE menu_item_id = ?');
        $statement->execute([$itemId]);
        return $statement->fetchColumn();
    }

    public function saveItem(?int $itemId, ?int $categoryId, array $item, string $imagePath): int
    {
        $this->pdo->beginTransaction();
        try {
            if ($itemId !== null) {
                $this->pdo->prepare('UPDATE menu_items SET name = ?, description = ?, price = ?, image_path = ?, is_available = ? WHERE menu_item_id = ?')
                    ->execute([$item['name'], $item['description'], $item['price'], $imagePath, $item['is_available'] ? 1 : 0, $itemId]);
            } else {
                $this->pdo->prepare('INSERT INTO menu_items (category_id, name, description, price, image_path, is_available) VALUES (?, ?, ?, ?, ?, ?)')
                    ->execute([$categoryId, $item['name'], $item['description'], $item['price'], $imagePath, $item['is_available'] ? 1 : 0]);
                $itemId = (int) $this->pdo->lastInsertId();
            }
            $this->saveItemAddons($itemId, $item['addons']);
            $this->pdo->commit();
            return $itemId;
        } catch (\Throwable $exception) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $exception;
        }
    }

    private function saveItemAddons(int $itemId, array $addons): void
    {
        $this->pdo->prepare('DELETE FROM menu_item_addons WHERE menu_item_id = ?')->execute([$itemId]);
        foreach ($addons as $index => $addon) {
            $find = $this->pdo->prepare('SELECT addon_id FROM addons WHERE LOWER(name) = LOWER(?) LIMIT 1');
            $find->execute([$addon['name']]);
            $addonId = $find->fetchColumn();
            if ($addonId) {
                $this->pdo->prepare('UPDATE addons SET name = ?, price = ?, is_available = 1 WHERE addon_id = ?')->execute([$addon['name'], $addon['price'], $addonId]);
            } else {
                $this->pdo->prepare('INSERT INTO addons (name, price) VALUES (?, ?)')->execute([$addon['name'], $addon['price']]);
                $addonId = $this->pdo->lastInsertId();
            }
            $this->pdo->prepare('INSERT INTO menu_item_addons (menu_item_id, addon_id, display_order) VALUES (?, ?, ?)')->execute([$itemId, $addonId, $index]);
        }
    }

    public function setItemAvailability(int $id, bool $available): bool
    {
        $statement = $this->pdo->prepare('UPDATE menu_items SET is_available = ? WHERE menu_item_id = ?');
        $statement->execute([$available ? 1 : 0, $id]);
        return $statement->rowCount() > 0 || $this->itemExists($id);
    }

    public function itemExists(int $id): bool
    {
        $statement = $this->pdo->prepare('SELECT COUNT(*) FROM menu_items WHERE menu_item_id = ?');
        $statement->execute([$id]);
        return (int) $statement->fetchColumn() > 0;
    }

    public function deleteItem(int $id): string|null|false
    {
        $path = $this->imagePath($id);
        if ($path === false) return false;
        $this->pdo->prepare('DELETE FROM menu_items WHERE menu_item_id = ?')->execute([$id]);
        return $path;
    }
}
