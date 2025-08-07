<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Exception;

class ExpenseController extends Controller
{
    protected $cloudinaryService;

    public function __construct(CloudinaryService $cloudinaryService)
    {
        $this->cloudinaryService = $cloudinaryService;
    }

    /**
     * Display a listing of the resource with caching
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Create cache key based on request parameters
            $cacheKey = 'expenses_' . md5(serialize($request->all()));
            
            // Try to get from cache first (cache for 5 minutes)
            $expenses = Cache::remember($cacheKey, 300, function () use ($request) {
                $query = Expense::query();

                // Filter by MOP type if provided
                if ($request->has('mop_type') && $request->mop_type !== 'all') {
                    $query->where('mop_type', $request->mop_type);
                }

                // Filter by date range if provided
                if ($request->has('date_from') && $request->date_from) {
                    $query->where('expense_date', '>=', $request->date_from);
                }

                if ($request->has('date_to') && $request->date_to) {
                    $query->where('expense_date', '<=', $request->date_to);
                }

                // Search functionality
                if ($request->has('search') && $request->search) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        $q->where('or_si_no', 'like', "%{$search}%")
                          ->orWhere('description', 'like', "%{$search}%")
                          ->orWhere('store', 'like', "%{$search}%")
                          ->orWhere('location', 'like', "%{$search}%");
                    });
                }

                return $query->orderBy('created_at', 'desc')->get();
            });
            
            return response()->json([
                'success' => true,
                'data' => $expenses
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch expenses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage with optimizations
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Validate the request
            $validatedData = $request->validate([
                'expense_date' => 'nullable|date',
                'or_si_no' => 'required|string|max:255',
                'description' => 'required|string',
                'location' => 'nullable|string|max:255',
                'store' => 'nullable|string|max:255',
                'quantity' => 'nullable|integer|min:0',
                'size_dimension' => 'nullable|string|max:255',
                'unit_price' => 'nullable|numeric|min:0',
                'total_price' => 'required|numeric|min:0',
                'category' => 'required|string|max:255',
                'mop_type' => 'nullable|in:PDC,PO,CARD',
                'mop_details' => 'nullable|string|max:255',
                'images' => 'nullable|array|max:10', // Allow up to 10 images
                'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120' // 5MB max per image, added webp
            ]);

            DB::beginTransaction();

            // Handle image uploads if present with validation
            $imageData = [];
            if ($request->hasFile('images')) {
                try {
                    // Validate images first
                    $validation = $this->cloudinaryService->validateMultipleImages($request->file('images'));
                    
                    if (!$validation['valid']) {
                        throw new ValidationException(validator([], []), [
                            'images' => $validation['errors']
                        ]);
                    }

                    // Check if Cloudinary is available
                    if (!$this->cloudinaryService->isAvailable()) {
                        \Log::warning('Cloudinary service unavailable, proceeding without images');
                        $imageData = [];
                    } else {
                        // Upload only valid files
                        $uploadResult = $this->cloudinaryService->uploadMultipleImages(
                            $validation['valid_files'],
                            'expenses'
                        );

                        if (!$uploadResult['success']) {
                            // Log errors but don't fail the entire operation
                            \Log::warning('Some images failed to upload: ' . json_encode($uploadResult['errors']));
                        }

                        $imageData = $uploadResult['results'] ?? [];
                    }
                } catch (ValidationException $e) {
                    // Re-throw validation exceptions
                    throw $e;
                } catch (Exception $e) {
                    // Log the error but don't fail the entire operation
                    \Log::warning('Image upload failed, proceeding without images: ' . $e->getMessage());
                    $imageData = [];
                }
            }

            // Calculate total price if unit price and quantity are provided
            if (!empty($validatedData['unit_price']) && !empty($validatedData['quantity'])) {
                $validatedData['total_price'] = $validatedData['unit_price'] * $validatedData['quantity'];
            }

            // Add image data to validated data
            $validatedData['images'] = $imageData;

            $expense = Expense::create($validatedData);

            DB::commit();

            // Clear cache
            $this->clearExpensesCache();

            return response()->json([
                'success' => true,
                'message' => 'Expense created successfully',
                'data' => $expense
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create expense',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            // Cache individual expense for 10 minutes
            $expense = Cache::remember("expense_{$id}", 600, function () use ($id) {
                return Expense::findOrFail($id);
            });
            
            return response()->json([
                'success' => true,
                'data' => $expense
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Expense not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage with optimizations
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $expense = Expense::findOrFail($id);
            
            $validatedData = $request->validate([
                'expense_date' => 'nullable|date',
                'or_si_no' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'location' => 'nullable|string|max:255',
                'store' => 'nullable|string|max:255',
                'quantity' => 'nullable|integer|min:0',
                'size_dimension' => 'nullable|string|max:255',
                'unit_price' => 'nullable|numeric|min:0',
                'total_price' => 'sometimes|required|numeric|min:0',
                'category' => 'sometimes|required|string|max:255',
                'mop_type' => 'nullable|in:PDC,PO,CARD',
                'mop_details' => 'nullable|string|max:255',
                'images' => 'nullable|array|max:10',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                'remove_images' => 'nullable|array', // Array of public_ids to remove
                'remove_images.*' => 'string'
            ]);

            DB::beginTransaction();

            // Handle image removal if requested
            if ($request->has('remove_images') && !empty($request->remove_images)) {
                $currentImages = $expense->images ?? [];
                $removeIds = $request->remove_images;
                
                // Remove images from Cloudinary in batch
                if (!empty($removeIds) && $this->cloudinaryService->isAvailable()) {
                    try {
                        $deleteResult = $this->cloudinaryService->deleteMultipleImages($removeIds);
                        if (!$deleteResult['success']) {
                            \Log::warning('Some images failed to delete: ' . json_encode($deleteResult['errors']));
                        }
                    } catch (Exception $e) {
                        \Log::warning("Failed to delete images from Cloudinary: " . $e->getMessage());
                    }
                }
                
                // Remove from current images array
                $currentImages = array_filter($currentImages, function ($image) use ($removeIds) {
                    return !in_array($image['public_id'], $removeIds);
                });
                
                $validatedData['images'] = array_values($currentImages); // Re-index array
            }

            // Handle new image uploads if present
            if ($request->hasFile('images')) {
                try {
                    // Validate images first
                    $validation = $this->cloudinaryService->validateMultipleImages($request->file('images'));
                    
                    if (!$validation['valid']) {
                        throw new ValidationException(validator([], []), [
                            'images' => $validation['errors']
                        ]);
                    }

                    if ($this->cloudinaryService->isAvailable()) {
                        $uploadResult = $this->cloudinaryService->uploadMultipleImages(
                            $validation['valid_files'],
                            'expenses'
                        );

                        if (!$uploadResult['success']) {
                            \Log::warning('Some images failed to upload during update: ' . json_encode($uploadResult['errors']));
                        }

                        // Merge with existing images
                        $existingImages = $validatedData['images'] ?? $expense->images ?? [];
                        $validatedData['images'] = array_merge($existingImages, $uploadResult['results'] ?? []);
                    }
                } catch (ValidationException $e) {
                    throw $e;
                } catch (Exception $e) {
                    \Log::warning('Image upload failed during update: ' . $e->getMessage());
                }
            }

            // Calculate total price if unit price and quantity are provided
            if (isset($validatedData['unit_price']) && isset($validatedData['quantity'])) {
                if (!empty($validatedData['unit_price']) && !empty($validatedData['quantity'])) {
                    $validatedData['total_price'] = $validatedData['unit_price'] * $validatedData['quantity'];
                }
            }

            $expense->update($validatedData);

            DB::commit();

            // Clear cache
            $this->clearExpensesCache();
            Cache::forget("expense_{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Expense updated successfully',
                'data' => $expense->fresh()
            ]);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update expense',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage with optimizations
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $expense = Expense::findOrFail($id);
            
            DB::beginTransaction();

            // Delete associated images from Cloudinary in batch
            if ($expense->images && !empty($expense->images) && $this->cloudinaryService->isAvailable()) {
                try {
                    $publicIds = array_column($expense->images, 'public_id');
                    $deleteResult = $this->cloudinaryService->deleteMultipleImages($publicIds);
                    
                    if (!$deleteResult['success']) {
                        \Log::warning('Some images failed to delete during expense deletion: ' . json_encode($deleteResult['errors']));
                    }
                } catch (Exception $e) {
                    \Log::warning("Failed to delete images from Cloudinary during expense deletion: " . $e->getMessage());
                }
            }

            $expense->delete();

            DB::commit();

            // Clear cache
            $this->clearExpensesCache();
            Cache::forget("expense_{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Expense deleted successfully'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete expense',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get MOP statistics with caching
     */
    public function getMopStats(): JsonResponse
    {
        try {
            $stats = Cache::remember('mop_stats', 600, function () {
                return Expense::selectRaw('mop_type, COUNT(*) as count, SUM(total_price) as total_amount')
                    ->whereNotNull('mop_type')
                    ->groupBy('mop_type')
                    ->get();
            });

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch MOP statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear expenses cache
     */
    private function clearExpensesCache()
    {
        // Clear all expenses cache keys
        $cacheKeys = Cache::get('expenses_cache_keys', []);
        foreach ($cacheKeys as $key) {
            Cache::forget($key);
        }
        Cache::forget('expenses_cache_keys');
        Cache::forget('mop_stats');
    }

    /**
     * Bulk operations for better performance
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'ids' => 'required|array|min:1',
                'ids.*' => 'integer|exists:expenses,id'
            ]);

            $expenses = Expense::whereIn('id', $request->ids)->get();
            
            DB::beginTransaction();

            // Collect all image public IDs for batch deletion
            $allPublicIds = [];
            foreach ($expenses as $expense) {
                if ($expense->images && !empty($expense->images)) {
                    $publicIds = array_column($expense->images, 'public_id');
                    $allPublicIds = array_merge($allPublicIds, $publicIds);
                }
            }

            // Delete all images in batch
            if (!empty($allPublicIds) && $this->cloudinaryService->isAvailable()) {
                try {
                    $deleteResult = $this->cloudinaryService->deleteMultipleImages($allPublicIds);
                    if (!$deleteResult['success']) {
                        \Log::warning('Some images failed to delete during bulk deletion: ' . json_encode($deleteResult['errors']));
                    }
                } catch (Exception $e) {
                    \Log::warning("Failed to delete images during bulk deletion: " . $e->getMessage());
                }
            }

            // Delete all expenses
            Expense::whereIn('id', $request->ids)->delete();

            DB::commit();

            // Clear cache
            $this->clearExpensesCache();

            return response()->json([
                'success' => true,
                'message' => 'Expenses deleted successfully',
                'deleted_count' => count($request->ids)
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete expenses',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

