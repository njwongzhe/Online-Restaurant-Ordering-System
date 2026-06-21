<?php

declare(strict_types=1);

namespace App\Api\Shared;

use InvalidArgumentException;
use Psr\Http\Message\ResponseInterface as Response;
use Throwable;

final class ApiResponse
{
    public static function json(Response $response, mixed $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    public static function error(Response $response, Throwable $exception): Response
    {
        $status = $exception instanceof InvalidArgumentException ? 422 : 500;
        return self::json($response, ['error' => $exception->getMessage()], $status);
    }
}
