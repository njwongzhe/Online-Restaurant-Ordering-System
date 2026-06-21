<?php

declare(strict_types=1);

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;

require_once __DIR__ . '/ApiSupport.php';

function saveItemAddons(PDO $pdo, int $itemId, array $addons): void
{
    $pdo->prepare('DELETE FROM menu_item_addons WHERE menu_item_id = ?')->execute([$itemId]);
    foreach ($addons as $index => $addon) {
        $find = $pdo->prepare('SELECT addon_id FROM addons WHERE LOWER(name) = LOWER(?) LIMIT 1');
        $find->execute([$addon['name']]);
        $addonId = $find->fetchColumn();
        if ($addonId) {
            $pdo->prepare('UPDATE addons SET name = ?, price = ?, is_available = 1 WHERE addon_id = ?')->execute([$addon['name'], $addon['price'], $addonId]);
        } else {
            $pdo->prepare('INSERT INTO addons (name, price) VALUES (?, ?)')->execute([$addon['name'], $addon['price']]);
            $addonId = $pdo->lastInsertId();
        }
        $pdo->prepare('INSERT INTO menu_item_addons (menu_item_id, addon_id, display_order) VALUES (?, ?, ?)')->execute([$itemId, $addonId, $index]);
    }
}

function registerApiRoutes(App $app, PDO $pdo): void
{
    $publicDirectory = dirname(__DIR__, 2) . '/public';
    $error = static function (Response $response, Throwable $exception): Response {
        $status = $exception instanceof InvalidArgumentException ? 422 : 500;
        return apiJson($response, ['error' => $exception->getMessage()], $status);
    };

    $app->get('/api/menu', function (Request $request, Response $response) use ($pdo) {
        $categories = $pdo->query('SELECT category_id, name, is_available FROM categories ORDER BY name ASC, category_id ASC')->fetchAll(PDO::FETCH_ASSOC);
        $itemStatement = $pdo->prepare('SELECT menu_item_id, name, description, price, image_path, is_available FROM menu_items WHERE category_id = ? ORDER BY name ASC, menu_item_id ASC');
        $addonStatement = $pdo->prepare('SELECT a.addon_id, a.name, a.price FROM menu_item_addons mia JOIN addons a ON a.addon_id = mia.addon_id WHERE mia.menu_item_id = ? ORDER BY mia.display_order, a.addon_id');
        foreach ($categories as &$category) {
            $itemStatement->execute([$category['category_id']]);
            $items = $itemStatement->fetchAll(PDO::FETCH_ASSOC);
            foreach ($items as &$item) {
                $addonStatement->execute([$item['menu_item_id']]);
                $item['addons'] = $addonStatement->fetchAll(PDO::FETCH_ASSOC);
            }
            $category['items'] = $items;
        }
        return apiJson($response, ['categories' => $categories]);
    });

    $app->post('/api/categories', function (Request $request, Response $response) use ($pdo, $error) {
        try {
            $data = (array) $request->getParsedBody();
            $name = apiValidateCategory($pdo, $data['name'] ?? '');
            $statement = $pdo->prepare('INSERT INTO categories (name, is_available) VALUES (?, 1)');
            $statement->execute([$name]);
            $id = (int) $pdo->lastInsertId();
            return apiJson($response, ['category' => ['category_id' => $id, 'name' => $name, 'is_available' => 1, 'items' => []]], 201);
        } catch (Throwable $exception) {
            return $error($response, $exception);
        }
    });

    $app->patch('/api/categories/{id}', function (Request $request, Response $response, array $args) use ($pdo, $error) {
        try {
            $id = (int) $args['id'];
            $data = (array) $request->getParsedBody();
            $exists = $pdo->prepare('SELECT category_id FROM categories WHERE category_id = ?');
            $exists->execute([$id]);
            if (!$exists->fetchColumn()) return apiJson($response, ['error' => 'Category not found.'], 404);
            if (array_key_exists('name', $data)) {
                $name = apiValidateCategory($pdo, $data['name'], $id);
                $pdo->prepare('UPDATE categories SET name = ? WHERE category_id = ?')->execute([$name, $id]);
            }
            if (array_key_exists('is_available', $data)) {
                $pdo->prepare('UPDATE categories SET is_available = ? WHERE category_id = ?')->execute([apiBool($data['is_available']) ? 1 : 0, $id]);
            }
            return apiJson($response, ['success' => true]);
        } catch (Throwable $exception) { return $error($response, $exception); }
    });

    $app->delete('/api/categories/{id}', function (Request $request, Response $response, array $args) use ($pdo, $publicDirectory, $error) {
        try {
            $id = (int) $args['id'];
            $images = $pdo->prepare('SELECT image_path FROM menu_items WHERE category_id = ?');
            $images->execute([$id]);
            $paths = $images->fetchAll(PDO::FETCH_COLUMN);
            $pdo->beginTransaction();
            $pdo->prepare('DELETE FROM menu_items WHERE category_id = ?')->execute([$id]);
            $deleted = $pdo->prepare('DELETE FROM categories WHERE category_id = ?');
            $deleted->execute([$id]);
            if ($deleted->rowCount() === 0) throw new InvalidArgumentException('Category not found.');
            $pdo->commit();
            foreach ($paths as $path) apiDeleteUploadedImage($path, $publicDirectory);
            return apiJson($response, ['success' => true]);
        } catch (Throwable $exception) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            return $error($response, $exception);
        }
    });

    $saveItem = function (Request $request, Response $response, array $args, bool $editing) use ($pdo, $publicDirectory, $error) {
        $newImage = null;
        try {
            $id = $editing ? (int) $args['id'] : null;
            $data = (array) $request->getParsedBody();
            $validated = apiValidateItem($pdo, $data, $id);
            $newImage = apiStoreImage($request->getUploadedFiles(), $publicDirectory);
            $oldImage = null;
            $pdo->beginTransaction();
            if ($editing) {
                $find = $pdo->prepare('SELECT image_path FROM menu_items WHERE menu_item_id = ?');
                $find->execute([$id]);
                $oldImage = $find->fetchColumn();
                if ($oldImage === false) throw new InvalidArgumentException('Menu item not found.');
                $imagePath = $newImage ?: $oldImage ?: DEFAULT_MENU_IMAGE;
                $pdo->prepare('UPDATE menu_items SET name = ?, description = ?, price = ?, image_path = ?, is_available = ? WHERE menu_item_id = ?')->execute([$validated['name'], $validated['description'], $validated['price'], $imagePath, $validated['is_available'] ? 1 : 0, $id]);
            } else {
                $categoryId = (int) $args['categoryId'];
                $category = $pdo->prepare('SELECT category_id FROM categories WHERE category_id = ?');
                $category->execute([$categoryId]);
                if (!$category->fetchColumn()) throw new InvalidArgumentException('Category not found.');
                $imagePath = $newImage ?: DEFAULT_MENU_IMAGE;
                $pdo->prepare('INSERT INTO menu_items (category_id, name, description, price, image_path, is_available) VALUES (?, ?, ?, ?, ?, ?)')->execute([$categoryId, $validated['name'], $validated['description'], $validated['price'], $imagePath, $validated['is_available'] ? 1 : 0]);
                $id = (int) $pdo->lastInsertId();
            }
            saveItemAddons($pdo, $id, $validated['addons']);
            $pdo->commit();
            if ($newImage && $oldImage) apiDeleteUploadedImage($oldImage, $publicDirectory);
            return apiJson($response, ['success' => true, 'menu_item_id' => $id], $editing ? 200 : 201);
        } catch (Throwable $exception) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            if ($newImage) apiDeleteUploadedImage($newImage, $publicDirectory);
            return $error($response, $exception);
        }
    };
    $app->post('/api/categories/{categoryId}/items', fn (Request $request, Response $response, array $args) => $saveItem($request, $response, $args, false));
    $app->post('/api/menu-items/{id}', fn (Request $request, Response $response, array $args) => $saveItem($request, $response, $args, true));

    $app->patch('/api/menu-items/{id}/availability', function (Request $request, Response $response, array $args) use ($pdo, $error) {
        try {
            $data = (array) $request->getParsedBody();
            $statement = $pdo->prepare('UPDATE menu_items SET is_available = ? WHERE menu_item_id = ?');
            $statement->execute([apiBool($data['is_available'] ?? false) ? 1 : 0, (int) $args['id']]);
            if ($statement->rowCount() === 0) {
                $check = $pdo->prepare('SELECT COUNT(*) FROM menu_items WHERE menu_item_id = ?');
                $check->execute([(int) $args['id']]);
                if (!$check->fetchColumn()) return apiJson($response, ['error' => 'Menu item not found.'], 404);
            }
            return apiJson($response, ['success' => true]);
        } catch (Throwable $exception) { return $error($response, $exception); }
    });

    $app->delete('/api/menu-items/{id}', function (Request $request, Response $response, array $args) use ($pdo, $publicDirectory, $error) {
        try {
            $find = $pdo->prepare('SELECT image_path FROM menu_items WHERE menu_item_id = ?');
            $find->execute([(int) $args['id']]);
            $path = $find->fetchColumn();
            if ($path === false) return apiJson($response, ['error' => 'Menu item not found.'], 404);
            $pdo->prepare('DELETE FROM menu_items WHERE menu_item_id = ?')->execute([(int) $args['id']]);
            apiDeleteUploadedImage($path, $publicDirectory);
            return apiJson($response, ['success' => true]);
        } catch (Throwable $exception) { return $error($response, $exception); }
    });

    $app->get('/api/orders', function (Request $request, Response $response) use ($pdo) {
        $orders = $pdo->query("SELECT o.*, u.display_name FROM orders o JOIN users u ON u.user_id = o.user_id ORDER BY o.created_at DESC, o.order_id DESC")->fetchAll(PDO::FETCH_ASSOC);
        $items = $pdo->prepare('SELECT oi.order_item_id, oi.item_name, oi.quantity, oi.unit_price, oi.line_total, oi.special_instructions, COALESCE(mi.image_path, ?) image_path FROM order_items oi LEFT JOIN menu_items mi ON mi.menu_item_id = oi.menu_item_id WHERE oi.order_id = ? ORDER BY oi.order_item_id');
        foreach ($orders as &$order) {
            $items->execute([DEFAULT_MENU_IMAGE, $order['order_id']]);
            $order['items'] = $items->fetchAll(PDO::FETCH_ASSOC);
        }
        return apiJson($response, ['orders' => $orders]);
    });

    $changeStatus = function (Request $request, Response $response, array $args, ?string $forcedStatus = null) use ($pdo, $error) {
        try {
            $data = (array) $request->getParsedBody();
            $status = $forcedStatus ?: (string) ($data['status'] ?? '');
            $allowed = ['confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
            if (!in_array($status, $allowed, true)) throw new InvalidArgumentException('Invalid order state.');
            $id = (int) $args['id'];
            $pdo->beginTransaction();
            $statement = $pdo->prepare('UPDATE orders SET order_status = ?, completed_at = CASE WHEN ? IN (\'completed\', \'cancelled\') THEN NOW() ELSE NULL END WHERE order_id = ?');
            $statement->execute([$status, $status, $id]);
            if ($statement->rowCount() === 0) {
                $check = $pdo->prepare('SELECT COUNT(*) FROM orders WHERE order_id = ?');
                $check->execute([$id]);
                if (!$check->fetchColumn()) throw new InvalidArgumentException('Order not found.');
            }
            $pdo->prepare('INSERT INTO order_status_history (order_id, status) VALUES (?, ?)')->execute([$id, $status]);
            $pdo->commit();
            return apiJson($response, ['success' => true, 'status' => $status]);
        } catch (Throwable $exception) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            return $error($response, $exception);
        }
    };
    $app->patch('/api/orders/{id}/state', fn (Request $request, Response $response, array $args) => $changeStatus($request, $response, $args));
    $app->post('/api/orders/{id}/cancel', fn (Request $request, Response $response, array $args) => $changeStatus($request, $response, $args, 'cancelled'));
}
