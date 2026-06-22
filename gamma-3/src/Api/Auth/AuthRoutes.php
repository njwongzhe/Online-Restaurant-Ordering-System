<?php

declare(strict_types=1);

namespace App\Api\Auth;

use App\Api\Shared\ApiResponse;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Throwable;

final class AuthRoutes
{
    public static function register(App $app): void
    {
        // Load the procedural helpers.
        require_once __DIR__ . '/JwtUtils.php';

        $app->post('/api/auth/login', function (Request $request, Response $response) {
            try {
                $data = (array) $request->getParsedBody();
                $phoneNumber = trim($data['phoneNumber'] ?? $data['phone_number'] ?? '');
                $password = $data['password'] ?? '';

                if (empty($phoneNumber) || empty($password)) {
                    throw new \InvalidArgumentException('Phone number and password are required.');
                }

                $user = verifyCredentials($phoneNumber, $password);
                
                // Create JWT token and set the cookie.
                $expiry = 3600 * 24; // 24 hours.
                $token = createJWTCookie((int)$user['user_id'], $user['phone_number'], $user['display_name'], $user['role'], $expiry, $user['position'] ?? null);

                return ApiResponse::json($response, [
                    'success' => true,
                    'token' => $token,
                    'user' => [
                        'userId' => $user['user_id'],
                        'phoneNumber' => $user['phone_number'],
                        'displayName' => $user['display_name'],
                        'role' => $user['role'],
                        'position' => $user['position'] ?? null
                    ]
                ]);
            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });

        $app->post('/api/auth/register', function (Request $request, Response $response) {
            try {
                $data = (array) $request->getParsedBody();
                $phoneNumber = trim($data['phoneNumber'] ?? $data['phone_number'] ?? '');
                $displayName = trim($data['displayName'] ?? $data['display_name'] ?? '');
                $password = $data['password'] ?? '';
                $confirmPassword = $data['confirmPassword'] ?? $data['confirm_password'] ?? '';

                if (empty($phoneNumber) || empty($displayName) || empty($password) || empty($confirmPassword)) {
                    throw new \InvalidArgumentException('All fields are required.');
                }

                if ($password !== $confirmPassword) {
                    throw new \InvalidArgumentException('Passwords do not match.');
                }

                if (strlen($password) < 8) {
                    throw new \InvalidArgumentException('Password must be at least 8 characters long.');
                }

                // Check if phone number already exists.
                global $pdo;
                $stmt = $pdo->prepare("SELECT user_id FROM users WHERE phone_number = :phone_number");
                $stmt->execute(['phone_number' => $phoneNumber]);
                if ($stmt->fetch()) {
                    throw new \InvalidArgumentException('Phone number is already registered.');
                }

                // Insert user with customer role.
                $passwordHash = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("INSERT INTO users (phone_number, password_hash, display_name, role, is_active) VALUES (:phone_number, :password_hash, :display_name, 'customer', 1)");
                $stmt->execute([
                    'phone_number' => $phoneNumber,
                    'password_hash' => $passwordHash,
                    'display_name' => $displayName
                ]);

                // Insert customer profile.
                $userId = $pdo->lastInsertId();
                $stmt = $pdo->prepare("INSERT INTO customer_profiles (user_id) VALUES (:user_id)");
                $stmt->execute(['user_id' => $userId]);

                return ApiResponse::json($response, [
                    'success' => true,
                    'message' => 'Registration successful.'
                ], 201);
            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });

        $app->post('/api/auth/logout', function (Request $request, Response $response) {
            removeJWTCookie();
            return ApiResponse::json($response, ['success' => true]);
        });
    }
}
