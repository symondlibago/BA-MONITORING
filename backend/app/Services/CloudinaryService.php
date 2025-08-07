<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Api\Admin\AdminApi;
use Exception;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    protected $cloudinary;
    protected $uploadApi;
    protected $adminApi;

    public function __construct()
    {
        // Cloudinary config from .env
        $this->cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                'api_key'    => env('CLOUDINARY_API_KEY'),
                'api_secret' => env('CLOUDINARY_API_SECRET'),
            ],
            'url' => ['secure' => true],
        ]);

        $this->uploadApi = new UploadApi();
        $this->adminApi = new AdminApi();
    }

    public function uploadImage($file, $folder = 'uploads', $options = [])
    {
        try {
            $defaultOptions = [
                'folder' => $folder,
                'resource_type' => 'image',
                'quality' => 'auto:good',
                'fetch_format' => 'auto',
                'flags' => 'progressive',
                'transformation' => [
                    'width' => 1200,
                    'height' => 1200,
                    'crop' => 'limit',
                    'quality' => 'auto:good',
                ]
            ];

            $uploadOptions = array_merge($defaultOptions, $options);
            $result = $this->uploadApi->upload($file->getPathname(), $uploadOptions);

            return [
                'success' => true,
                'public_id' => $result['public_id'],
                'secure_url' => $result['secure_url'],
                'url' => $result['url'],
                'width' => $result['width'],
                'height' => $result['height'],
                'format' => $result['format'],
                'bytes' => $result['bytes'],
            ];
        } catch (Exception $e) {
            Log::error('Cloudinary upload failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function uploadMultipleImages($files, $folder = 'uploads', $options = [])
    {
        $results = [];
        $errors = [];
        $successCount = 0;

        foreach ($files as $index => $file) {
            $customOptions = array_merge($options, [
                'public_id' => $folder . '_' . time() . '_' . $index
            ]);

            $result = $this->uploadImage($file, $folder, $customOptions);

            if ($result['success']) {
                $results[] = $result;
                $successCount++;
            } else {
                $errors[] = "File {$index}: " . $result['error'];
            }
        }

        return [
            'success' => $successCount > 0,
            'results' => $results,
            'errors' => $errors,
            'uploaded_count' => $successCount,
            'total_count' => count($files),
        ];
    }

    public function deleteImage($publicId)
    {
        try {
            $result = $this->uploadApi->destroy($publicId);

            return [
                'success' => $result['result'] === 'ok',
                'result' => $result['result'],
            ];
        } catch (Exception $e) {
            Log::error('Cloudinary delete failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function deleteMultipleImages($publicIds)
    {
        $results = [];
        $errors = [];
        $successCount = 0;

        foreach ($publicIds as $publicId) {
            $result = $this->deleteImage($publicId);

            if ($result['success']) {
                $results[] = $result;
                $successCount++;
            } else {
                $errors[] = "Failed to delete {$publicId}: " . $result['error'];
            }
        }

        return [
            'success' => $successCount > 0,
            'results' => $results,
            'errors' => $errors,
            'deleted_count' => $successCount,
            'total_count' => count($publicIds),
        ];
    }

    public function getOptimizedUrl($publicId, $transformations = [])
    {
        try {
            $finalTransformations = array_merge([
                'quality' => 'auto:good',
                'fetch_format' => 'auto',
            ], $transformations);

            return $this->cloudinary->image($publicId)
                ->addTransformation($finalTransformations)
                ->toUrl();
        } catch (Exception $e) {
            Log::error('Failed to generate optimized URL: ' . $e->getMessage());
            return null;
        }
    }

    public function getThumbnailUrl($publicId, $width = 150, $height = 150)
    {
        return $this->getOptimizedUrl($publicId, [
            'width' => $width,
            'height' => $height,
            'crop' => 'fill',
            'gravity' => 'auto',
        ]);
    }

    public function isAvailable()
    {
        try {
            $this->adminApi->ping();
            return true;
        } catch (Exception $e) {
            Log::warning('Cloudinary service unavailable: ' . $e->getMessage());
            return false;
        }
    }

    public function getUploadPreset()
    {
        return env('CLOUDINARY_UPLOAD_PRESET', 'ml_default');
    }

    public function validateImage($file)
    {
        $errors = [];

        if ($file->getSize() > 5 * 1024 * 1024) {
            $errors[] = 'File size must be less than 5MB';
        }

        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file->getMimeType(), $allowedTypes)) {
            $errors[] = 'File must be a valid image (JPEG, PNG, GIF, WebP)';
        }

        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, $allowedExtensions)) {
            $errors[] = 'File extension must be jpg, jpeg, png, gif, or webp';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }

    public function validateMultipleImages($files)
    {
        $allErrors = [];
        $validFiles = [];

        foreach ($files as $index => $file) {
            $validation = $this->validateImage($file);

            if ($validation['valid']) {
                $validFiles[] = $file;
            } else {
                foreach ($validation['errors'] as $error) {
                    $allErrors[] = "File " . ($index + 1) . ": " . $error;
                }
            }
        }

        return [
            'valid' => empty($allErrors),
            'errors' => $allErrors,
            'valid_files' => $validFiles,
            'valid_count' => count($validFiles),
            'total_count' => count($files),
        ];
    }
}
