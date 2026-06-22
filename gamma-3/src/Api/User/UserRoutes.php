<?php

declare(strict_types=1);

namespace App\Api\User;

use App\Api\Shared\ApiResponse;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Throwable;

final class UserRoutes
{
    public static function register(App $app): void
    {
        require_once __DIR__ . '/../Auth/JwtUtils.php';

        $app->get('/api/user/profile', function (Request $request, Response $response) {
            try {
                $userId = getAuthenticatedUserId();
                
                if (!$userId) {
                    return ApiResponse::json($response, ['error' => 'Unauthorized. Please log in.'], 401);
                }

                global $pdo;
                $stmt = $pdo->prepare("
                    SELECT user_id, phone_number, display_name, role 
                    FROM users 
                    WHERE user_id = :user_id AND is_active = 1
                ");
                $stmt->execute(['user_id' => $userId]);
                $user = $stmt->fetch();

                if (!$user) {
                    return ApiResponse::json($response, ['error' => 'User not found or inactive.'], 404);
                }

                return ApiResponse::json($response, [
                    'success' => true,
                    'data' => [
                        'user_id' => $user['user_id'],
                        'phone_number' => $user['phone_number'],
                        'display_name' => $user['display_name'],
                        'role' => $user['role']
                    ]
                ]);

            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });
    }
}