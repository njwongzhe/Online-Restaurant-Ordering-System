<?php

declare(strict_types=1);

namespace App\Api\Cart;

use App\Api\Shared\ApiResponse;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Throwable;

final class CartRoutes
{
    public static function register(App $app, CartRepository $repository): void
    {
        require_once __DIR__ . '/../Auth/JwtUtils.php';

        // GET /api/cart — return the current user's cart with all items and addons.
        $app->get('/api/cart', function (Request $request, Response $response) use ($repository) {
            try {
                $userId = getAuthenticatedUserId();
                if (!$userId) {
                    return ApiResponse::json($response, ['error' => 'Unauthorized.'], 401);
                }

                $items = $repository->getCart($userId);

                // Compute total quantity across all items for the badge count.
                $totalQuantity = array_sum(array_column($items, 'quantity'));

                // Fetch public settings for fees formatting and calculation
                $settings = $repository->getPublicSettings();

                // Fetch customer profile defaults
                $profile = $repository->getCustomerProfile($userId);

                return ApiResponse::json($response, [
                    'success' => true,
                    'items'   => $items,
                    'total_quantity' => $totalQuantity,
                    'settings' => $settings,
                    'profile' => $profile,
                ]);
            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });

        $app->post('/api/cart/items', function (Request $request, Response $response) use ($repository) {
            try {
                $userId = getAuthenticatedUserId();
                if (!$userId) {
                    return ApiResponse::json($response, ['error' => 'Unauthorized.'], 401);
                }

                $data = (array)$request->getParsedBody();
                $menuItemId = (int)($data['menuItemId'] ?? 0);
                $quantity = (int)($data['quantity'] ?? 1);
                $specialInstructions = $data['specialInstructions'] ?? null;
                $addons = $data['addons'] ?? [];

                if ($menuItemId <= 0 || $quantity <= 0) {
                    throw new \InvalidArgumentException('Invalid menu item or quantity.');
                }

                $cartId = $repository->getOrCreateCart($userId);
                $cartItemId = $repository->addItemToCart($cartId, $menuItemId, $quantity, $specialInstructions, $addons);

                return ApiResponse::json($response, [
                    'success' => true,
                    'message' => 'Item added to cart.',
                    'cart_item_id' => $cartItemId
                ], 201);
            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });

        $app->patch('/api/cart/items/{id}', function (Request $request, Response $response, array $args) use ($repository) {
            try {
                $userId = getAuthenticatedUserId();
                if (!$userId) {
                    return ApiResponse::json($response, ['error' => 'Unauthorized.'], 401);
                }
                $data = (array)$request->getParsedBody();
                $quantity = (int)($data['quantity'] ?? 0);
                $repository->updateItemQuantity((int)$args['id'], $quantity);
                return ApiResponse::json($response, ['success' => true]);
            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });

        $app->delete('/api/cart/items/{id}', function (Request $request, Response $response, array $args) use ($repository) {
            try {
                $userId = getAuthenticatedUserId();
                if (!$userId) {
                    return ApiResponse::json($response, ['error' => 'Unauthorized.'], 401);
                }
                $repository->deleteItem((int)$args['id']);
                return ApiResponse::json($response, ['success' => true]);
            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });

        $app->post('/api/cart/checkout', function (Request $request, Response $response) use ($repository) {
            try {
                $userId = getAuthenticatedUserId();
                if (!$userId) {
                    return ApiResponse::json($response, ['error' => 'Unauthorized.'], 401);
                }
                $data = (array)$request->getParsedBody();
                $orderType = trim((string)($data['order_type'] ?? 'takeaway'));
                $paymentMethod = trim((string)($data['payment_method'] ?? 'cash'));
                $tableNumber = isset($data['table_number']) && trim((string)$data['table_number']) !== '' ? trim((string)$data['table_number']) : null;
                $deliveryAddress = isset($data['delivery_address']) && trim((string)$data['delivery_address']) !== '' ? trim((string)$data['delivery_address']) : null;
                $customerNote = isset($data['customer_note']) && trim((string)$data['customer_note']) !== '' ? trim((string)$data['customer_note']) : null;
                $pickupAt = isset($data['pickup_at']) && trim((string)$data['pickup_at']) !== '' ? trim((string)$data['pickup_at']) : null;

                $orderNumber = $repository->checkout(
                    $userId, $orderType, $paymentMethod, $tableNumber, $deliveryAddress, $customerNote, $pickupAt
                );

                return ApiResponse::json($response, [
                    'success' => true,
                    'order_number' => $orderNumber
                ], 201);
            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });
    }
}
