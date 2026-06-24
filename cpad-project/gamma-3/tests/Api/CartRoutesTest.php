<?php

declare(strict_types=1);

namespace Tests\Api;

use App\Api\Cart\CartRepository;
use App\Api\Cart\CartRoutes;
use Firebase\JWT\JWT;
use Slim\Factory\AppFactory;
use Slim\Psr7\Factory\StreamFactory;
use Slim\Psr7\Headers;
use Slim\Psr7\Request;
use PHPUnit\Framework\TestCase;
use PDO;

class CartRoutesTest extends TestCase
{
    private PDO $pdo;
    private CartRepository $repository;
    private $app;

    protected function setUp(): void
    {
        $this->pdo = new PDO('sqlite::memory:');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Setup tables
        $this->pdo->exec("
            CREATE TABLE carts (
                cart_id INTEGER PRIMARY KEY,
                user_id INTEGER UNIQUE,
                order_type TEXT DEFAULT 'takeaway',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE cart_items (
                cart_item_id INTEGER PRIMARY KEY,
                cart_id INTEGER,
                menu_item_id INTEGER,
                quantity INTEGER DEFAULT 1,
                special_instructions TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE cart_item_addons (
                cart_item_id INTEGER,
                addon_id INTEGER,
                quantity INTEGER DEFAULT 1,
                PRIMARY KEY (cart_item_id, addon_id)
            );
        ");

        $GLOBALS['pdo'] = $this->pdo;
        $this->repository = new CartRepository($this->pdo);

        $this->app = AppFactory::create();
        $this->app->addBodyParsingMiddleware();

        CartRoutes::register($this->app, $this->repository);
    }

    protected function tearDown(): void
    {
        unset($GLOBALS['pdo']);
        unset($_COOKIE['jwt']);
    }

    public function testPostCartItemsUnauthorized(): void
    {
        // No JWT cookie
        $request = $this->createJsonRequest('POST', '/api/cart/items', []);
        $response = $this->app->handle($request);

        $this->assertEquals(401, $response->getStatusCode());
        $body = json_decode((string)$response->getBody(), true);
        $this->assertEquals('Unauthorized.', $body['error']);
    }

    public function testPostCartItemsSuccess(): void
    {
        // Generate JWT cookie mock
        require_once __DIR__ . '/../../src/Api/Auth/JwtUtils.php';
        $payload = [
            "userId" => 123,
            "phoneNumber" => "12345678",
            "displayName" => "John Doe",
            "role" => "customer",
            "exp" => time() + 3600
        ];
        $_COOKIE['jwt'] = JWT::encode($payload, JWT_KEY, ALGORITHM);

        $data = [
            'menuItemId' => 10,
            'quantity' => 2,
            'specialInstructions' => 'Less spicy',
            'addons' => [
                ['addonId' => 1, 'quantity' => 1],
                ['addonId' => 2, 'quantity' => 3]
            ]
        ];

        $request = $this->createJsonRequest('POST', '/api/cart/items', $data);
        $response = $this->app->handle($request);

        $this->assertEquals(201, $response->getStatusCode());
        $body = json_decode((string)$response->getBody(), true);
        $this->assertTrue($body['success']);
        $this->assertNotEmpty($body['cart_item_id']);

        // Verify cart items in DB
        $stmt = $this->pdo->prepare('SELECT * FROM cart_items WHERE cart_item_id = ?');
        $stmt->execute([$body['cart_item_id']]);
        $item = $stmt->fetch(PDO::FETCH_ASSOC);

        $this->assertNotEmpty($item);
        $this->assertEquals(10, $item['menu_item_id']);
        $this->assertEquals(2, $item['quantity']);
        $this->assertEquals('Less spicy', $item['special_instructions']);

        // Verify addons
        $stmt = $this->pdo->prepare('SELECT * FROM cart_item_addons WHERE cart_item_id = ? ORDER BY addon_id');
        $stmt->execute([$body['cart_item_id']]);
        $addons = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $this->assertCount(2, $addons);
        $this->assertEquals(1, $addons[0]['addon_id']);
        $this->assertEquals(1, $addons[0]['quantity']);
        $this->assertEquals(2, $addons[1]['addon_id']);
        $this->assertEquals(3, $addons[1]['quantity']);
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
