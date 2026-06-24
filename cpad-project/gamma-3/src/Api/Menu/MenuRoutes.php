<?php

declare(strict_types=1);

namespace App\Api\Menu;

use App\Api\Shared\ApiResponse;
use App\Api\Shared\ImageStorage;
use App\Api\Shared\Validation;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Throwable;

final class MenuRoutes
{
    public static function register(App $app, MenuRepository $repository, MenuValidator $validator, ImageStorage $images): void
    {
        $app->get('/api/menu', fn (Request $request, Response $response) =>
            ApiResponse::json($response, ['categories' => $repository->fetchMenu()]));

        $app->post('/api/categories', function (Request $request, Response $response) use ($repository, $validator) {
            try {
                $name = $validator->categoryName(((array) $request->getParsedBody())['name'] ?? '');
                $id = $repository->createCategory($name);
                return ApiResponse::json($response, ['category' => [
                    'category_id' => $id,
                    'name' => $name,
                    'is_available' => 1,
                    'items' => [],
                ]], 201);
            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });

        $app->patch('/api/categories/{id}', function (Request $request, Response $response, array $args) use ($repository, $validator) {
            try {
                $id = (int) $args['id'];
                if (!$repository->categoryExists($id)) return ApiResponse::json($response, ['error' => 'Category not found.'], 404);
                $data = (array) $request->getParsedBody();
                $changes = [];
                if (array_key_exists('name', $data)) $changes['name'] = $validator->categoryName($data['name'], $id);
                if (array_key_exists('is_available', $data)) $changes['is_available'] = Validation::boolean($data['is_available']);
                $repository->updateCategory($id, $changes);
                return ApiResponse::json($response, ['success' => true]);
            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });

        $app->delete('/api/categories/{id}', function (Request $request, Response $response, array $args) use ($repository, $images) {
            try {
                foreach ($repository->deleteCategory((int) $args['id']) as $path) $images->delete($path);
                return ApiResponse::json($response, ['success' => true]);
            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });

        $saveItem = function (Request $request, Response $response, array $args, bool $editing) use ($repository, $validator, $images) {
            $newImage = null;
            try {
                $itemId = $editing ? (int) $args['id'] : null;
                $categoryId = $editing ? null : (int) $args['categoryId'];
                if (!$editing && !$repository->categoryExists($categoryId)) {
                    return ApiResponse::json($response, ['error' => 'Category not found.'], 404);
                }
                $oldImage = $editing ? $repository->imagePath($itemId) : null;
                if ($editing && $oldImage === false) return ApiResponse::json($response, ['error' => 'Menu item not found.'], 404);

                $item = $validator->item((array) $request->getParsedBody(), $itemId);
                $newImage = $images->store($request->getUploadedFiles());
                $imagePath = $newImage ?: $oldImage ?: ImageStorage::DEFAULT_IMAGE_PATH;
                $savedId = $repository->saveItem($itemId, $categoryId, $item, $imagePath);
                if ($newImage && $oldImage) $images->delete($oldImage);
                return ApiResponse::json($response, ['success' => true, 'menu_item_id' => $savedId], $editing ? 200 : 201);
            } catch (Throwable $exception) {
                if ($newImage) $images->delete($newImage);
                return ApiResponse::error($response, $exception);
            }
        };

        $app->post('/api/categories/{categoryId}/items', fn (Request $request, Response $response, array $args) => $saveItem($request, $response, $args, false));
        $app->post('/api/menu-items/{id}', fn (Request $request, Response $response, array $args) => $saveItem($request, $response, $args, true));

        $app->patch('/api/menu-items/{id}/availability', function (Request $request, Response $response, array $args) use ($repository) {
            try {
                $available = Validation::boolean(((array) $request->getParsedBody())['is_available'] ?? false);
                if (!$repository->setItemAvailability((int) $args['id'], $available)) {
                    return ApiResponse::json($response, ['error' => 'Menu item not found.'], 404);
                }
                return ApiResponse::json($response, ['success' => true]);
            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });

        $app->delete('/api/menu-items/{id}', function (Request $request, Response $response, array $args) use ($repository, $images) {
            try {
                $path = $repository->deleteItem((int) $args['id']);
                if ($path === false) return ApiResponse::json($response, ['error' => 'Menu item not found.'], 404);
                $images->delete($path);
                return ApiResponse::json($response, ['success' => true]);
            } catch (Throwable $exception) {
                return ApiResponse::error($response, $exception);
            }
        });
    }
}
