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
        $app->get('/api/orders', fn (Request $request, Response $response) =>
            ApiResponse::json($response, ['orders' => $repository->fetchAll()]));

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
