<?php

declare(strict_types=1);

namespace App\Api\Shared;

use finfo;
use InvalidArgumentException;
use RuntimeException;

final class ImageStorage
{
    public const DEFAULT_IMAGE_PATH = 'assets/images/No Menu Image.png';

    public function __construct(private readonly string $publicDirectory)
    {
    }

    public function store(array $uploadedFiles): ?string
    {
        $image = $uploadedFiles['image'] ?? null;
        if (!$image || $image->getError() === UPLOAD_ERR_NO_FILE) return null;
        if ($image->getError() !== UPLOAD_ERR_OK) throw new InvalidArgumentException('The image upload failed.');
        if ($image->getSize() > 5 * 1024 * 1024) throw new InvalidArgumentException('The image must be 5 MB or smaller.');

        $mediaType = (new finfo(FILEINFO_MIME_TYPE))->file($image->getFilePath());
        $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
        if (!isset($extensions[$mediaType])) throw new InvalidArgumentException('Use a JPG, PNG, or WebP image.');

        $relativeDirectory = 'uploads/menu-items';
        $targetDirectory = $this->publicDirectory . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relativeDirectory);
        if (!is_dir($targetDirectory) && !mkdir($targetDirectory, 0775, true) && !is_dir($targetDirectory)) {
            throw new RuntimeException('Unable to create the image directory.');
        }

        $filename = bin2hex(random_bytes(16)) . '.' . $extensions[$mediaType];
        $image->moveTo($targetDirectory . DIRECTORY_SEPARATOR . $filename);
        return $relativeDirectory . '/' . $filename;
    }

    public function delete(?string $path): void
    {
        if (!$path || !str_starts_with($path, 'uploads/menu-items/')) return;
        $fullPath = $this->publicDirectory . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $path);
        if (is_file($fullPath)) @unlink($fullPath);
    }
}
