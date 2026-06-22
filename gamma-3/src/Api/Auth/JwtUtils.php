<?php
    // Include vendor files for JWT library.
    require_once __DIR__ . '/../../../vendor/autoload.php';

    // Use classes from vendor that are used in this project.
    use Firebase\JWT\JWT; // Import the JWT class.

    // Define the secret key and algorithm for JWT signing and verification.
    const JWT_KEY = "myVeryLongSecretKeyForCPAD25262JWTAuthentication2026";
    const ALGORITHM = 'HS256';

    // Helper function to create and set a JWT cookie.
    function createJWTCookie(string $phoneNumber, string $displayName, string $role, int $expirySeconds, ?string $position = null) : string {
        // Create payload array containing user data and expiration time.
        $payload = [
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
        setcookie("jwt", $jwt, time() + $expirySeconds);

        return $jwt;
    }

    // Helper function to delete the JWT cookie.
    function removeJWTCookie() : void {
        setcookie("jwt", "", time() - 3600);
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
?>
