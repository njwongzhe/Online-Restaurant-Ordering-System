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

        global $pdo;
        try {
            $pdo->exec("ALTER TABLE customer_profiles ADD COLUMN address_history TEXT NULL");
        } catch (\PDOException $e) {
            // Already exists or DB error, ignore
        }

        $app->get('/api/user/profile', function (Request $request, Response $response) {
            try {
                $userId = getAuthenticatedUserId();
                
                if (!$userId) {
                    return ApiResponse::json($response, ['error' => 'Unauthorized. Please log in.'], 401);
                }

                global $pdo;
                $stmt = $pdo->prepare("
                    SELECT u.user_id, u.phone_number, u.display_name, u.role, cp.default_payment_method, cp.default_address 
                    FROM users u
                    LEFT JOIN customer_profiles cp ON u.user_id = cp.user_id
                    WHERE u.user_id = :user_id AND u.is_active = 1
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
                        'role' => $user['role'],
                        'default_payment_method' => $user['default_payment_method'] ?? null,
                        'default_address' => $user['default_address'] ?? null
                    ]
                ]);

            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });

        $app->get('/api/user/payment-method', function (Request $request, Response $response) {
            try {
                $userId = getAuthenticatedUserId();
                
                if (!$userId) {
                    return ApiResponse::json($response, ['error' => 'Unauthorized. Please log in.'], 401);
                }

                global $pdo;
                $stmt = $pdo->prepare("
                    SELECT default_payment_method 
                    FROM customer_profiles 
                    WHERE user_id = :user_id
                ");
                $stmt->execute(['user_id' => $userId]);
                $profile = $stmt->fetch();

                $method = $profile ? $profile['default_payment_method'] : null;

                return ApiResponse::json($response, [
                    'success' => true,
                    'data' => [
                        'default_payment_method' => $method
                    ]
                ]);

            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });

        $app->put('/api/user/payment-method', function (Request $request, Response $response) {
            try {
                $userId = getAuthenticatedUserId();
                
                if (!$userId) {
                    return ApiResponse::json($response, ['error' => 'Unauthorized. Please log in.'], 401);
                }

                $data = (array) $request->getParsedBody();
                $method = $data['default_payment_method'] ?? null;

                if ($method !== null && !in_array($method, ['cash', 'e_wallet', 'online_banking'], true)) {
                    throw new \InvalidArgumentException('Invalid payment method.');
                }

                global $pdo;
                $stmt = $pdo->prepare("
                    INSERT INTO customer_profiles (user_id, default_payment_method) 
                    VALUES (:user_id, :method) 
                    ON DUPLICATE KEY UPDATE default_payment_method = :method
                ");
                $stmt->execute([
                    'user_id' => $userId,
                    'method' => $method
                ]);

                return ApiResponse::json($response, [
                    'success' => true,
                    'message' => 'Payment method updated successfully.'
                ]);

            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });

        $app->get('/api/user/address', function (Request $request, Response $response) {
            try {
                $userId = getAuthenticatedUserId();
                
                if (!$userId) {
                    return ApiResponse::json($response, ['error' => 'Unauthorized. Please log in.'], 401);
                }

                global $pdo;
                $stmt = $pdo->prepare("
                    SELECT default_address, address_history 
                    FROM customer_profiles 
                    WHERE user_id = :user_id
                ");
                $stmt->execute(['user_id' => $userId]);
                $profile = $stmt->fetch();

                $address = $profile ? $profile['default_address'] : null;
                $historyJson = $profile ? $profile['address_history'] : null;
                $history = $historyJson ? json_decode($historyJson, true) : [];

                return ApiResponse::json($response, [
                    'success' => true,
                    'data' => [
                        'default_address' => $address,
                        'address_history' => is_array($history) ? $history : []
                    ]
                ]);

            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });

        $app->put('/api/user/address', function (Request $request, Response $response) {
            try {
                $userId = getAuthenticatedUserId();
                
                if (!$userId) {
                    return ApiResponse::json($response, ['error' => 'Unauthorized. Please log in.'], 401);
                }

                $data = (array) $request->getParsedBody();
                $address = $data['default_address'] ?? null;

                if ($address !== null) {
                    $address = trim((string)$address);
                    if (mb_strlen($address) > 500) {
                        throw new \InvalidArgumentException('Address cannot exceed 500 characters.');
                    }
                }

                global $pdo;
                
                // Fetch current history
                $stmt = $pdo->prepare("SELECT address_history FROM customer_profiles WHERE user_id = :user_id");
                $stmt->execute(['user_id' => $userId]);
                $profile = $stmt->fetch();
                $historyJson = $profile ? $profile['address_history'] : null;
                $history = $historyJson ? json_decode($historyJson, true) : [];
                if (!is_array($history)) {
                    $history = [];
                }

                // Prepend the new address if it is not empty and not already in the history
                if (!empty($address)) {
                    $index = array_search($address, $history, true);
                    if ($index !== false) {
                        // Remove from current position so we can prepend it as most recent
                        array_splice($history, $index, 1);
                    }
                    array_unshift($history, $address);
                    
                    // Limit size of history list to 10 entries
                    if (count($history) > 10) {
                        array_pop($history);
                    }
                }

                $newHistoryJson = json_encode($history);

                $stmt = $pdo->prepare("
                    INSERT INTO customer_profiles (user_id, default_address, address_history) 
                    VALUES (:user_id, :address, :history) 
                    ON DUPLICATE KEY UPDATE default_address = :address, address_history = :history
                ");
                $stmt->execute([
                    'user_id' => $userId,
                    'address' => $address,
                    'history' => $newHistoryJson
                ]);

                return ApiResponse::json($response, [
                    'success' => true,
                    'message' => 'Delivery address updated successfully.',
                    'data' => [
                        'address_history' => $history
                    ]
                ]);

            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });

        $app->delete('/api/user/address/history', function (Request $request, Response $response) {
            try {
                $userId = getAuthenticatedUserId();
                
                if (!$userId) {
                    return ApiResponse::json($response, ['error' => 'Unauthorized. Please log in.'], 401);
                }

                $data = (array) $request->getParsedBody();
                $addressToDelete = $data['address'] ?? null;

                if (empty($addressToDelete)) {
                    throw new \InvalidArgumentException('Address to delete is required.');
                }

                global $pdo;
                $stmt = $pdo->prepare("SELECT address_history FROM customer_profiles WHERE user_id = :user_id");
                $stmt->execute(['user_id' => $userId]);
                $profile = $stmt->fetch();

                $historyJson = $profile ? $profile['address_history'] : null;
                $history = $historyJson ? json_decode($historyJson, true) : [];
                if (!is_array($history)) {
                    $history = [];
                }

                // Remove address from history
                $index = array_search(trim($addressToDelete), $history, true);
                if ($index !== false) {
                    array_splice($history, $index, 1);
                }

                $newHistoryJson = json_encode($history);

                $stmt = $pdo->prepare("
                    UPDATE customer_profiles 
                    SET address_history = :history 
                    WHERE user_id = :user_id
                ");
                $stmt->execute([
                    'user_id' => $userId,
                    'history' => $newHistoryJson
                ]);

                return ApiResponse::json($response, [
                    'success' => true,
                    'message' => 'Address removed from history successfully.',
                    'data' => [
                        'address_history' => $history
                    ]
                ]);

            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });

        $app->put('/api/user/phone-number', function (Request $request, Response $response) {
            try {
                $userId = getAuthenticatedUserId();
                
                if (!$userId) {
                    return ApiResponse::json($response, ['error' => 'Unauthorized. Please log in.'], 401);
                }

                $data = (array) $request->getParsedBody();
                $newPhone = trim((string)($data['new_phone_number'] ?? $data['new_phone'] ?? ''));
                $password = $data['password'] ?? '';

                if (empty($newPhone) || empty($password)) {
                    throw new \InvalidArgumentException('New phone number and verification password are required.');
                }

                global $pdo;

                // Verify password
                $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE user_id = :user_id AND is_active = 1");
                $stmt->execute(['user_id' => $userId]);
                $user = $stmt->fetch();

                if (!$user || !password_verify($password, $user['password_hash'])) {
                    throw new \InvalidArgumentException('Incorrect verification password.');
                }

                // Check if new phone number already exists
                $stmt = $pdo->prepare("SELECT user_id FROM users WHERE phone_number = :phone_number AND user_id != :user_id");
                $stmt->execute([
                    'phone_number' => $newPhone,
                    'user_id' => $userId
                ]);
                if ($stmt->fetch()) {
                    throw new \InvalidArgumentException('Phone number is already registered by another account.');
                }

                // Update phone number
                $stmt = $pdo->prepare("UPDATE users SET phone_number = :phone_number WHERE user_id = :user_id");
                $stmt->execute([
                    'phone_number' => $newPhone,
                    'user_id' => $userId
                ]);

                return ApiResponse::json($response, [
                    'success' => true,
                    'message' => 'Phone number updated successfully.'
                ]);

            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });

        $app->put('/api/user/password', function (Request $request, Response $response) {
            try {
                $userId = getAuthenticatedUserId();
                
                if (!$userId) {
                    return ApiResponse::json($response, ['error' => 'Unauthorized. Please log in.'], 401);
                }

                $data = (array) $request->getParsedBody();
                $newPassword = $data['new_password'] ?? '';

                if (empty($newPassword)) {
                    throw new \InvalidArgumentException('New password is required.');
                }

                if (strlen($newPassword) < 8) {
                    throw new \InvalidArgumentException('New password must be at least 8 characters long.');
                }

                global $pdo;

                // Hash new password and update directly
                $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("UPDATE users SET password_hash = :password_hash WHERE user_id = :user_id");
                $stmt->execute([
                    'password_hash' => $newHash,
                    'user_id' => $userId
                ]);

                return ApiResponse::json($response, [
                    'success' => true,
                    'message' => 'Password reset successfully.'
                ]);

            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });
    }
}