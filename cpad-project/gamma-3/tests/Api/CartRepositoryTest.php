<?php

declare(strict_types=1);

namespace Tests\Api;

use App\Api\Cart\CartRepository;
use PHPUnit\Framework\TestCase;
use PDO;

class CartRepositoryTest extends TestCase
{
    private PDO $pdo;
    private CartRepository $repository;

    protected function setUp(): void
    {
        $this->pdo = new PDO('sqlite::memory:');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Create tables compatible with SQLite
        $this->pdo->exec("
            CREATE TABLE users (
                user_id INTEGER PRIMARY KEY,
                phone_number TEXT UNIQUE,
                password_hash TEXT,
                display_name TEXT,
                role TEXT,
                is_active INTEGER
            );
            
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

        $this->repository = new CartRepository($this->pdo);
    }

    public function testGetOrCreateCartCreatesNewCart(): void
    {
        $userId = 42;
        $cartId = $this->repository->getOrCreateCart($userId);
        
        $this->assertGreaterThan(0, $cartId);

        // Fetching again should return the same cart_id
        $secondCartId = $this->repository->getOrCreateCart($userId);
        $this->assertEquals($cartId, $secondCartId);
    }

    public function testAddItemToCartInsertsAndUpdates(): void
    {
        $cartId = 1;
        $menuItemId = 100;
        
        // Add new item
        $cartItemId = $this->repository->addItemToCart($cartId, $menuItemId, 2, 'No onions');
        $this->assertGreaterThan(0, $cartItemId);

        // Fetch it from DB to verify details
        $stmt = $this->pdo->prepare('SELECT * FROM cart_items WHERE cart_item_id = ?');
        $stmt->execute([$cartItemId]);
        $item = $stmt->fetch(PDO::FETCH_ASSOC);

        $this->assertEquals($cartId, $item['cart_id']);
        $this->assertEquals($menuItemId, $item['menu_item_id']);
        $this->assertEquals(2, $item['quantity']);
        $this->assertEquals('No onions', $item['special_instructions']);

        // Add same item again with same instructions (should update quantity)
        $updatedCartItemId = $this->repository->addItemToCart($cartId, $menuItemId, 3, 'No onions');
        $this->assertEquals($cartItemId, $updatedCartItemId);

        $stmt->execute([$cartItemId]);
        $updatedItem = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->assertEquals(5, $updatedItem['quantity']); // 2 + 3
        $this->assertEquals('No onions', $updatedItem['special_instructions']);

        // Add same item again with different instructions (should create a new item)
        $differentCartItemId = $this->repository->addItemToCart($cartId, $menuItemId, 1, 'Extra cheese');
        $this->assertNotEquals($cartItemId, $differentCartItemId);
    }

    public function testAddonManagement(): void
    {
        $cartItemId = 55;

        // Clear addons should execute without error on empty
        $this->repository->clearItemAddons($cartItemId);

        // Add addons
        $this->repository->addItemAddon($cartItemId, 10, 2);
        $this->repository->addItemAddon($cartItemId, 11, 1);

        // Verify database records
        $stmt = $this->pdo->prepare('SELECT * FROM cart_item_addons WHERE cart_item_id = ? ORDER BY addon_id');
        $stmt->execute([$cartItemId]);
        $addons = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $this->assertCount(2, $addons);
        $this->assertEquals(10, $addons[0]['addon_id']);
        $this->assertEquals(2, $addons[0]['quantity']);
        $this->assertEquals(11, $addons[1]['addon_id']);
        $this->assertEquals(1, $addons[1]['quantity']);

        // Clear addons and verify empty
        $this->repository->clearItemAddons($cartItemId);
        $stmt->execute([$cartItemId]);
        $this->assertEmpty($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
}
