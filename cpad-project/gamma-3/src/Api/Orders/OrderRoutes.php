<?php

declare(strict_types=1);

namespace App\Api\Orders;

use App\Api\Shared\ApiResponse;
use InvalidArgumentException;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Throwable;

final class OrderRoutes
{
    private const ALLOWED_STATUSES = ['new', 'preparing', 'ready', 'completed', 'cancelled'];

    public static function register(App $app, OrderRepository $repository): void
    {
        $app->get('/api/orders', function (Request $request, Response $response) use ($repository) {
            try {
                require_once __DIR__ . '/../Auth/JwtUtils.php';
                $user = getAuthenticatedUser();
                if (!$user) {
                    return ApiResponse::json($response, ['error' => 'Unauthorized.'], 401);
                }

                $userId = (int)($user['userId'] ?? $user['user_id'] ?? 0);
                $role = $user['role'] ?? 'customer';

                if ($role === 'admin') {
                    $orders = $repository->fetchAll();
                } else {
                    $orders = $repository->fetchByUserId($userId);
                }

                return ApiResponse::json($response, ['orders' => $orders]);
            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });

        $changeStatus = function (Request $request, Response $response, array $args, ?string $forcedStatus = null) use ($repository) {
            try {
                $status = $forcedStatus ?: (string) (((array) $request->getParsedBody())['status'] ?? '');
                if (!in_array($status, self::ALLOWED_STATUSES, true)) {
                    throw new InvalidArgumentException('Invalid order state.');
                }
                $reason = null;
                if ($status === 'cancelled') {
                    $reason = trim((string) (((array) $request->getParsedBody())['reason'] ?? ''));
                    if (strlen($reason) > 500) throw new InvalidArgumentException('Cancellation reason cannot exceed 500 characters.');
                    $reason = $reason !== '' ? $reason : null;
                }
                $repository->changeStatus((int) $args['id'], $status, $reason);
                return ApiResponse::json($response, ['success' => true, 'status' => $status]);
            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        };

        $app->patch('/api/orders/{id}/state', fn (Request $request, Response $response, array $args) => $changeStatus($request, $response, $args));
        $app->post('/api/orders/{id}/cancel', fn (Request $request, Response $response, array $args) => $changeStatus($request, $response, $args, 'cancelled'));
    }
}
