<?php

declare(strict_types=1);

namespace App\Api\Menu;

use App\Api\Shared\Validation;
use InvalidArgumentException;

final class MenuValidator
{
    public function __construct(private readonly MenuRepository $repository)
    {
    }

    public function categoryName(mixed $value, ?int $excludeId = null): string
    {
        $name = Validation::requiredString($value, 'Category name', 100);
        if ($this->repository->categoryNameExists($name, $excludeId)) {
            throw new InvalidArgumentException('Category name must be unique.');
        }
        return $name;
    }

    public function item(array $data, ?int $excludeId = null): array
    {
        $name = Validation::requiredString($data['name'] ?? '', 'Item name', 120);
        if ($this->repository->itemNameExists($name, $excludeId)) {
            throw new InvalidArgumentException('Item name must be unique.');
        }

        $addons = Validation::list($data['addons'] ?? [], 'Add-ons');
        $names = [];
        foreach ($addons as $index => $addon) {
            $addonName = Validation::requiredString($addon['name'] ?? '', 'Add-on name', 100);
            $key = strtolower($addonName);
            if (isset($names[$key])) throw new InvalidArgumentException('Add-on names must be unique within an item.');
            $names[$key] = true;
            $addons[$index] = [
                'name' => $addonName,
                'price' => Validation::nonNegativeMoney($addon['price'] ?? '', 'Add-on price'),
            ];
        }

        return [
            'name' => $name,
            'price' => Validation::nonNegativeMoney($data['price'] ?? '', 'Price'),
            'description' => trim((string) ($data['description'] ?? '')),
            'is_available' => array_key_exists('is_available', $data) ? Validation::boolean($data['is_available']) : true,
            'addons' => $addons,
        ];
    }
}
