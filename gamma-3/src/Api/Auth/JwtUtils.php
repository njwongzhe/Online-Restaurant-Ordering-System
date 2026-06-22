<?php
    // Include vendor files for JWT library.
    require_once __DIR__ . '/../../../vendor/autoload.php';

    // Use classes from vendor that are used in this project.
    use Firebase\JWT\JWT; // Import the JWT class.
    use Firebase\JWT\Key;

    // Define the secret key and algorithm for JWT signing and verification.
    const JWT_KEY = "myVeryLongSecretKeyForCPAD25262JWTAuthentication2026";
    const ALGORITHM = 'HS256';

    // Helper function to create and set a JWT cookie.
    function createJWTCookie(int $userId, string $phoneNumber, string $displayName, string $role, int $expirySeconds, ?string $position = null) : string {
        // Create payload array containing user data and expiration time.
        $payload = [
            "userId" => $userId,
            "phoneNumber" => $phoneNumber,
            "displayName" => $displayName,
            "role" => $role,
            "exp" => time() + $expirySeconds
        ];

        if ($role === 'admin' && $position !== null) {
            $payload['position'] = $position;
        }

        // Encode the JWT payload using the secret key and algorithm.
        $jwt = JWT::encode($payload, JWT_KEY, ALGORITHM);
        
        // Set cookie named "jwt" accessible across the site.
        setcookie("jwt", $jwt, time() + $expirySeconds, "/");

        return $jwt;
    }

    // Helper function to delete the JWT cookie.
    function removeJWTCookie() : void {
        setcookie("jwt", "", time() - 3600, "/");
    }

    // Helper function to verify user credentials and return the user record if successful.
    function verifyCredentials(string $phoneNumber, string $password) : array {
        global $pdo;
        
        $stmt = $pdo->prepare("
            SELECT u.user_id, u.phone_number, u.password_hash, u.display_name, u.role, u.is_active, ap.position 
            FROM users u
            LEFT JOIN admin_profiles ap ON u.user_id = ap.user_id
            WHERE u.phone_number = :phone_number
        ");
        $stmt->execute(['phone_number' => $phoneNumber]);
        $user = $stmt->fetch();
        
        if (!$user) {
            throw new \InvalidArgumentException("Incorrect phone number or password.");
        }
        
        if (!$user['is_active']) {
            throw new \InvalidArgumentException("Your account is inactive. Please contact support.");
        }
        
        if (!password_verify($password, $user['password_hash'])) {
            throw new \InvalidArgumentException("Incorrect phone number or password.");
        }
        
        return [
            'user_id' => (int)$user['user_id'],
            'phone_number' => $user['phone_number'],
            'display_name' => $user['display_name'],
            'role' => $user['role'],
            'position' => $user['position'] ?? null
        ];
    }

    // Helper function to get the current authenticated user's ID from JWT cookie or Authorization header.
    function getAuthenticatedUserId(): ?int {
        $jwt = null;
        if (isset($_COOKIE['jwt'])) {
            $jwt = $_COOKIE['jwt'];
        } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $jwt = $matches[1];
            }
        } elseif (function_exists('getallheaders')) {
            $headers = getallheaders();
            if (isset($headers['Authorization'])) {
                if (preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
                    $jwt = $matches[1];
                }
            }
        }

        if (!$jwt) {
            return null;
        }

        try {
            $decoded = JWT::decode($jwt, new Key(JWT_KEY, ALGORITHM));
            $userId = $decoded->userId ?? $decoded->user_id ?? null;
            if ($userId !== null) {
                return (int)$userId;
            }
            $phoneNumber = $decoded->phoneNumber ?? null;
            if (!$phoneNumber) {
                return null;
            }
            global $pdo;
            $stmt = $pdo->prepare("SELECT user_id FROM users WHERE phone_number = :phone_number");
            $stmt->execute(['phone_number' => $phoneNumber]);
            $user = $stmt->fetch();
            return $user ? (int)$user['user_id'] : null;
        } catch (\Throwable $e) {
            return null;
        }
    }
?>
