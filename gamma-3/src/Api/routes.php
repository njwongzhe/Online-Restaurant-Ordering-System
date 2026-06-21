<?php

declare(strict_types=1);

use App\Api\Auth\AuthRoutes;
use App\Api\Menu\MenuRepository;
use App\Api\Menu\MenuRoutes;
use App\Api\Menu\MenuValidator;
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
    OrderRoutes::register($app, new OrderRepository($pdo));
}
