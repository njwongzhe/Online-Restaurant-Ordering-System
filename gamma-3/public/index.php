<?php
// Assignment 2, SCSM2223-25262 (index.php)
// Group Name: GAMMA

if (PHP_SAPI === 'cli-server') {
    $requestPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $staticFile = __DIR__ . $requestPath;
    if ($requestPath !== '/' && is_file($staticFile)) return false;
}

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/libs/db_connect_PDO_SLIM.php';
require __DIR__ . '/../src/Api/routes.php';

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

$app = AppFactory::create();

// Explicitly set the base path to match your Apache Alias exactly
if (PHP_SAPI !== 'cli-server') {
    $app->setBasePath('/cpad-project/gamma-3/public');
}

// Add routing middleware
$app->addRoutingMiddleware();
$app->addBodyParsingMiddleware();

// Add error middleware LAST
$app->addErrorMiddleware(true, true, true); 

$app->get('/', function (Request $request, Response $response, $args) use ($app) {
    return $response
        ->withHeader('Location', $app->getBasePath() . '/mobile/')
        ->withStatus(302);
});

registerApiRoutes($app, $pdo);

$app->run();
