<?php

declare(strict_types=1);

namespace Tests\Api;

use App\Api\User\UserRoutes;
use Firebase\JWT\JWT;
use Slim\Factory\AppFactory;
use Slim\Psr7\Factory\StreamFactory;
use Slim\Psr7\Headers;
use Slim\Psr7\Request;
use PHPUnit\Framework\TestCase;
use PDO;

class UserRoutesTest extends TestCase
{
    private PDO $pdo;
    private $app;

    protected function setUp(): void
    {
        $this->pdo = new PDO('sqlite::memory:');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Setup tables
        $this->pdo->exec("
            CREATE TABLE users (
                user_id INTEGER PRIMARY KEY,
                phone_number TEXT UNIQUE,
                display_name TEXT,
                role TEXT,
                password_hash TEXT,
                is_active INTEGER DEFAULT 1
            );
            CREATE TABLE customer_profiles (
                user_id INTEGER PRIMARY KEY,
                default_payment_method TEXT,
                default_address TEXT,
                address_history TEXT
            );
        ");

        $GLOBALS['pdo'] = $this->pdo;

        $this->app = AppFactory::create();
        $this->app->addBodyParsingMiddleware();

        UserRoutes::register($this->app);
    }

    protected function tearDown(): void
    {
        unset($GLOBALS['pdo']);
        unset($_COOKIE['jwt']);
    }

    public function testGetProfileSuccess(): void
    {
        // Insert a user
        $passwordHash = password_hash('password123', PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare("
            INSERT INTO users (user_id, phone_number, display_name, role, password_hash, is_active)
            VALUES (1, '0123456789', 'John Doe', 'customer', :hash, 1)
        ");
        $stmt->execute(['hash' => $passwordHash]);

        // Mock JWT
        require_once __DIR__ . '/../../src/Api/Auth/JwtUtils.php';
        $payload = [
            "userId" => 1,
            "phoneNumber" => "0123456789",
            "displayName" => "John Doe",
            "role" => "customer",
            "exp" => time() + 3600
        ];
        $_COOKIE['jwt'] = JWT::encode($payload, JWT_KEY, ALGORITHM);

        $request = $this->createJsonRequest('GET', '/api/user/profile', []);
        $response = $this->app->handle($request);

        $this->assertEquals(200, $response->getStatusCode());
        $body = json_decode((string)$response->getBody(), true);
        $this->assertTrue($body['success']);
        $this->assertEquals('0123456789', $body['data']['phone_number']);
    }

    public function testPutPhoneNumberSuccess(): void
    {
        // Insert a user
        $passwordHash = password_hash('password123', PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare("
            INSERT INTO users (user_id, phone_number, display_name, role, password_hash, is_active)
            VALUES (1, '0123456789', 'John Doe', 'customer', :hash, 1)
        ");
        $stmt->execute(['hash' => $passwordHash]);

        // Mock JWT
        require_once __DIR__ . '/../../src/Api/Auth/JwtUtils.php';
        $payload = [
            "userId" => 1,
            "phoneNumber" => "0123456789",
            "displayName" => "John Doe",
            "role" => "customer",
            "exp" => time() + 3600
        ];
        $_COOKIE['jwt'] = JWT::encode($payload, JWT_KEY, ALGORITHM);

        $request = $this->createJsonRequest('PUT', '/api/user/phone-number', [
            'new_phone_number' => '0987654321',
            'password' => 'password123'
        ]);
        $response = $this->app->handle($request);

        $this->assertEquals(200, $response->getStatusCode());
        $body = json_decode((string)$response->getBody(), true);
        $this->assertTrue($body['success']);

        // Verify in DB
        $stmt = $this->pdo->prepare("SELECT phone_number FROM users WHERE user_id = 1");
        $stmt->execute();
        $user = $stmt->fetch();
        $this->assertEquals('0987654321', $user['phone_number']);
    }

    public function testPutPhoneNumberIncorrectPassword(): void
    {
        // Insert a user
        $passwordHash = password_hash('password123', PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare("
            INSERT INTO users (user_id, phone_number, display_name, role, password_hash, is_active)
            VALUES (1, '0123456789', 'John Doe', 'customer', :hash, 1)
        ");
        $stmt->execute(['hash' => $passwordHash]);

        // Mock JWT
        require_once __DIR__ . '/../../src/Api/Auth/JwtUtils.php';
        $payload = [
            "userId" => 1,
            "phoneNumber" => "0123456789",
            "displayName" => "John Doe",
            "role" => "customer",
            "exp" => time() + 3600
        ];
        $_COOKIE['jwt'] = JWT::encode($payload, JWT_KEY, ALGORITHM);

        $request = $this->createJsonRequest('PUT', '/api/user/phone-number', [
            'new_phone_number' => '0987654321',
            'password' => 'wrongpassword'
        ]);
        $response = $this->app->handle($request);

        $this->assertEquals(422, $response->getStatusCode());
        $body = json_decode((string)$response->getBody(), true);
        $this->assertEquals('Incorrect verification password.', $body['error']);
    }

    public function testPutPhoneNumberDuplicate(): void
    {
        // Insert two users
        $passwordHash = password_hash('password123', PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare("
            INSERT INTO users (user_id, phone_number, display_name, role, password_hash, is_active)
            VALUES (1, '0123456789', 'John Doe', 'customer', :hash, 1)
        ");
        $stmt->execute(['hash' => $passwordHash]);

        $stmt = $this->pdo->prepare("
            INSERT INTO users (user_id, phone_number, display_name, role, password_hash, is_active)
            VALUES (2, '0987654321', 'Jane Doe', 'customer', :hash, 1)
        ");
        $stmt->execute(['hash' => $passwordHash]);

        // Mock JWT
        require_once __DIR__ . '/../../src/Api/Auth/JwtUtils.php';
        $payload = [
            "userId" => 1,
            "phoneNumber" => "0123456789",
            "displayName" => "John Doe",
            "role" => "customer",
            "exp" => time() + 3600
        ];
        $_COOKIE['jwt'] = JWT::encode($payload, JWT_KEY, ALGORITHM);

        // Try to set user 1's phone to user 2's phone
        $request = $this->createJsonRequest('PUT', '/api/user/phone-number', [
            'new_phone_number' => '0987654321',
            'password' => 'password123'
        ]);
        $response = $this->app->handle($request);

        $this->assertEquals(422, $response->getStatusCode());
        $body = json_decode((string)$response->getBody(), true);
        $this->assertEquals('Phone number is already registered by another account.', $body['error']);
    }

    public function testPutPasswordSuccess(): void
    {
        // Insert a user
        $passwordHash = password_hash('password123', PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare("
            INSERT INTO users (user_id, phone_number, display_name, role, password_hash, is_active)
            VALUES (1, '0123456789', 'John Doe', 'customer', :hash, 1)
        ");
        $stmt->execute(['hash' => $passwordHash]);

        // Mock JWT
        require_once __DIR__ . '/../../src/Api/Auth/JwtUtils.php';
        $payload = [
            "userId" => 1,
            "phoneNumber" => "0123456789",
            "displayName" => "John Doe",
            "role" => "customer",
            "exp" => time() + 3600
        ];
        $_COOKIE['jwt'] = JWT::encode($payload, JWT_KEY, ALGORITHM);

        $request = $this->createJsonRequest('PUT', '/api/user/password', [
            'new_password' => 'newpassword456'
        ]);
        $response = $this->app->handle($request);

        $this->assertEquals(200, $response->getStatusCode());
        $body = json_decode((string)$response->getBody(), true);
        $this->assertTrue($body['success']);

        // Verify in DB
        $stmt = $this->pdo->prepare("SELECT password_hash FROM users WHERE user_id = 1");
        $stmt->execute();
        $user = $stmt->fetch();
        $this->assertTrue(password_verify('newpassword456', $user['password_hash']));
    }

    public function testPutPasswordShort(): void
    {
        // Insert a user
        $passwordHash = password_hash('password123', PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare("
            INSERT INTO users (user_id, phone_number, display_name, role, password_hash, is_active)
            VALUES (1, '0123456789', 'John Doe', 'customer', :hash, 1)
        ");
        $stmt->execute(['hash' => $passwordHash]);

        // Mock JWT
        require_once __DIR__ . '/../../src/Api/Auth/JwtUtils.php';
        $payload = [
            "userId" => 1,
            "phoneNumber" => "0123456789",
            "displayName" => "John Doe",
            "role" => "customer",
            "exp" => time() + 3600
        ];
        $_COOKIE['jwt'] = JWT::encode($payload, JWT_KEY, ALGORITHM);

        $request = $this->createJsonRequest('PUT', '/api/user/password', [
            'new_password' => 'short'
        ]);
        $response = $this->app->handle($request);

        $this->assertEquals(422, $response->getStatusCode());
        $body = json_decode((string)$response->getBody(), true);
        $this->assertEquals('New password must be at least 8 characters long.', $body['error']);
    }

    public function testPutProfileNameSuccess(): void
    {
        // Insert a user
        $passwordHash = password_hash('password123', PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare("
            INSERT INTO users (user_id, phone_number, display_name, role, password_hash, is_active)
            VALUES (1, '0123456789', 'John Doe', 'customer', :hash, 1)
        ");
        $stmt->execute(['hash' => $passwordHash]);

        // Mock JWT
        require_once __DIR__ . '/../../src/Api/Auth/JwtUtils.php';
        $payload = [
            "userId" => 1,
            "phoneNumber" => "0123456789",
            "displayName" => "John Doe",
            "role" => "customer",
            "exp" => time() + 3600
        ];
        $_COOKIE['jwt'] = JWT::encode($payload, JWT_KEY, ALGORITHM);

        $request = $this->createJsonRequest('PUT', '/api/user/profile/name', [
            'displayName' => 'Jane Smith'
        ]);
        $response = $this->app->handle($request);

        $this->assertEquals(200, $response->getStatusCode());
        $body = json_decode((string)$response->getBody(), true);
        $this->assertTrue($body['success']);
        $this->assertEquals('Jane Smith', $body['data']['display_name']);

        // Verify in DB
        $stmt = $this->pdo->prepare("SELECT display_name FROM users WHERE user_id = 1");
        $stmt->execute();
        $user = $stmt->fetch();
        $this->assertEquals('Jane Smith', $user['display_name']);
    }

    public function testPutProfileNameEmpty(): void
    {
        // Insert a user
        $passwordHash = password_hash('password123', PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare("
            INSERT INTO users (user_id, phone_number, display_name, role, password_hash, is_active)
            VALUES (1, '0123456789', 'John Doe', 'customer', :hash, 1)
        ");
        $stmt->execute(['hash' => $passwordHash]);

        // Mock JWT
        require_once __DIR__ . '/../../src/Api/Auth/JwtUtils.php';
        $payload = [
            "userId" => 1,
            "phoneNumber" => "0123456789",
            "displayName" => "John Doe",
            "role" => "customer",
            "exp" => time() + 3600
        ];
        $_COOKIE['jwt'] = JWT::encode($payload, JWT_KEY, ALGORITHM);

        $request = $this->createJsonRequest('PUT', '/api/user/profile/name', [
            'displayName' => ''
        ]);
        $response = $this->app->handle($request);

        $this->assertEquals(422, $response->getStatusCode());
        $body = json_decode((string)$response->getBody(), true);
        $this->assertEquals('Name cannot be empty.', $body['error']);
    }

    private function createJsonRequest(string $method, string $path, array $data): Request
    {
        $uri = new \Slim\Psr7\Uri('', '', 80, $path);
        $handle = fopen('php://temp', 'w+');
        $stream = (new StreamFactory())->createStreamFromResource($handle);
        $stream->write(json_encode($data));

        $headers = new Headers();
        $headers->addHeader('Content-Type', 'application/json');
        $headers->addHeader('Accept', 'application/json');

        return new Request($method, $uri, $headers, $_COOKIE, [], $stream);
    }
}
