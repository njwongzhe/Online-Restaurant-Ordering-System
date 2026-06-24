<?php

declare(strict_types=1);

namespace App\Api\Shared;

use InvalidArgumentException;
use JsonException;

final class Validation
{
    public static function boolean(mixed $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false;
    }

    public static function requiredString(mixed $value, string $label, int $maximumLength): string
    {
        $value = trim((string) $value);
        if ($value === '') throw new InvalidArgumentException("{$label} cannot be empty.");
        if (strlen($value) > $maximumLength) {
            throw new InvalidArgumentException("{$label} cannot exceed {$maximumLength} characters.");
        }
        return $value;
    }

    public static function nonNegativeMoney(mixed $value, string $label): float
    {
        if ($value === '' || !is_numeric($value) || (float) $value < 0) {
            throw new InvalidArgumentException("{$label} is required and cannot be negative.");
        }
        return round((float) $value, 2);
    }

    public static function list(mixed $value, string $label): array
    {
        if (is_string($value)) {
            try {
                $value = json_decode($value, true, 512, JSON_THROW_ON_ERROR);
            } catch (JsonException) {
                throw new InvalidArgumentException("{$label} must contain valid data.");
            }
        }
        if (!is_array($value)) throw new InvalidArgumentException("{$label} must be a list.");
        return $value;
    }
}
