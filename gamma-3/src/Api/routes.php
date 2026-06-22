<?php

declare(strict_types=1);

use App\Api\Auth\AuthRoutes;
use App\Api\Menu\MenuRepository;
use App\Api\Menu\MenuRoutes;
use App\Api\Menu\MenuValidator;
use App\Api\Cart\CartRepository;
use App\Api\Cart\CartRoutes;
use App\Api\Orders\OrderRepository;
use App\Api\Orders\OrderRoutes;
use App\Api\Shared\ImageStorage;
use Slim\App;

function registerApiRoutes(App $app, PDO $pdo): void
{
    $imageStorage = new ImageStorage(dirname(__DIR__, 2) . '/public');
    $menuRepository = new MenuRepository($pdo);

    AuthRoutes::register($app);
    MenuRoutes::register($app, $menuRepository, new MenuValidator($menuRepository), $imageStorage);
    CartRoutes::register($app, new CartRepository($pdo));
    OrderRoutes::register($app, new OrderRepository($pdo));
}
