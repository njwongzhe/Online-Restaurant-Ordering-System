<?php

declare(strict_types=1);

use Psr\Http\Message\ResponseInterface as Response;

const DEFAULT_MENU_IMAGE = 'assets/images/No Menu Image.png';

// Utility functions for API endpoints
function apiJson(Response $response, mixed $data, int $status = 200): Response
{
    $response->getBody()->write(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
}

// Converts various truthy/falsy values to a boolean, treating null as false
function apiBool(mixed $value): bool
{
    return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false;
}

// Generates a URL-friendly slug from a string, ensuring it is not empty, defaulting to 'entry' if it is
function apiSlug(string $value): string
{
    $slug = strtolower(trim((string) preg_replace('/[^A-Za-z0-9]+/', '-', $value), '-'));
    return $slug !== '' ? $slug : 'entry';
}

// Generates a unique slug for a given value within a specified database table and column, optionally excluding a specific ID
function apiUniqueSlug(PDO $pdo, string $table, string $column, string $value, string $idColumn, ?int $excludeId = null): string
{
    $base = apiSlug($value);
    $slug = $base;
    $suffix = 2;
    do {
        $sql = "SELECT COUNT(*) FROM {$table} WHERE {$column} = ?" . ($excludeId ? " AND {$idColumn} <> ?" : '');
        $statement = $pdo->prepare($sql);
        $parameters = [$slug];
        if ($excludeId) $parameters[] = $excludeId;
        $statement->execute($parameters);
        if ((int) $statement->fetchColumn() === 0) return $slug;
        $slug = $base . '-' . $suffix++;
    } while (true);
}

// Validates category data, ensuring the name is not empty, does not exceed 100 characters, and is unique (case-insensitive), optionally excluding a specific category ID
function apiValidateCategory(PDO $pdo, mixed $name, ?int $excludeId = null): string
{
    $name = trim((string) $name);
    if ($name === '') throw new InvalidArgumentException('Category name cannot be empty.');
    if (strlen($name) > 100) throw new InvalidArgumentException('Category name cannot exceed 100 characters.');
    $sql = 'SELECT COUNT(*) FROM categories WHERE LOWER(name) = LOWER(?)' . ($excludeId ? ' AND category_id <> ?' : '');
    $statement = $pdo->prepare($sql);
    $parameters = [$name];
    if ($excludeId) $parameters[] = $excludeId;
    $statement->execute($parameters);
    if ((int) $statement->fetchColumn() > 0) throw new InvalidArgumentException('Category name must be unique.');
    return $name;
}

function apiValidateItem(PDO $pdo, array $data, ?int $excludeId = null): array
{
    $name = trim((string) ($data['name'] ?? ''));
    $priceInput = $data['price'] ?? '';
    if ($name === '') throw new InvalidArgumentException('Item name cannot be empty.');
    if (strlen($name) > 120) throw new InvalidArgumentException('Item name cannot exceed 120 characters.');
    if ($priceInput === '' || !is_numeric($priceInput) || (float) $priceInput < 0) {
        throw new InvalidArgumentException('Price is required and cannot be negative.');
    }
    $sql = 'SELECT COUNT(*) FROM menu_items WHERE LOWER(name) = LOWER(?)' . ($excludeId ? ' AND menu_item_id <> ?' : '');
    $statement = $pdo->prepare($sql);
    $parameters = [$name];
    if ($excludeId) $parameters[] = $excludeId;
    $statement->execute($parameters);
    if ((int) $statement->fetchColumn() > 0) throw new InvalidArgumentException('Item name must be unique.');

    $addons = $data['addons'] ?? [];
    if (is_string($addons)) {
        try {
            $addons = json_decode($addons, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            throw new InvalidArgumentException('Add-ons must contain valid data.');
        }
    }
    if (!is_array($addons)) throw new InvalidArgumentException('Add-ons must be a list.');
    $names = [];
    foreach ($addons as $index => $addon) {
        $addonName = trim((string) ($addon['name'] ?? ''));
        $addonPrice = $addon['price'] ?? '';
        if ($addonName === '') throw new InvalidArgumentException('Every add-on needs a name.');
        if (strlen($addonName) > 100) throw new InvalidArgumentException('Add-on names cannot exceed 100 characters.');
        if ($addonPrice === '' || !is_numeric($addonPrice) || (float) $addonPrice < 0) {
            throw new InvalidArgumentException("Add-on #" . ($index + 1) . ' needs a non-negative price.');
        }
        $key = strtolower($addonName);
        if (isset($names[$key])) throw new InvalidArgumentException('Add-on names must be unique within an item.');
        $names[$key] = true;
        $addons[$index] = ['name' => $addonName, 'price' => round((float) $addonPrice, 2)];
    }
    return [
        'name' => $name,
        'price' => round((float) $priceInput, 2),
        'description' => trim((string) ($data['description'] ?? '')),
        'is_available' => array_key_exists('is_available', $data) ? apiBool($data['is_available']) : true,
        'addons' => $addons,
    ];
}

function apiStoreImage(array $uploadedFiles, string $publicDirectory): ?string
{
    $image = $uploadedFiles['image'] ?? null;
    if (!$image || $image->getError() === UPLOAD_ERR_NO_FILE) return null;
    if ($image->getError() !== UPLOAD_ERR_OK) throw new InvalidArgumentException('The image upload failed.');
    if ($image->getSize() > 5 * 1024 * 1024) throw new InvalidArgumentException('The image must be 5 MB or smaller.');
    $mediaType = (new finfo(FILEINFO_MIME_TYPE))->file($image->getFilePath());
    $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (!isset($extensions[$mediaType])) throw new InvalidArgumentException('Use a JPG, PNG, or WebP image.');
    $relativeDirectory = 'uploads/menu-items';
    $targetDirectory = $publicDirectory . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'menu-items';
    if (!is_dir($targetDirectory) && !mkdir($targetDirectory, 0775, true) && !is_dir($targetDirectory)) {
        throw new RuntimeException('Unable to create the image directory.');
    }
    $filename = bin2hex(random_bytes(16)) . '.' . $extensions[$mediaType];
    $image->moveTo($targetDirectory . DIRECTORY_SEPARATOR . $filename);
    return $relativeDirectory . '/' . $filename;
}

function apiDeleteUploadedImage(?string $path, string $publicDirectory): void
{
    if (!$path || !str_starts_with($path, 'uploads/menu-items/')) return;
    $fullPath = $publicDirectory . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $path);
    if (is_file($fullPath)) @unlink($fullPath);
}
