<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ExpenseController extends Controller
{
    public function __construct()
    {
        // Add CORS headers to all responses

    }

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $expenses = Expense::orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $expenses
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch expenses: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch expenses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            Log::info('Expense store request received', $request->all());

            $validatedData = $request->validate([
                'date' => 'nullable|date',
                'or_si_no' => 'nullable|string|max:255',
                'description' => 'required|string',
                'location' => 'nullable|string|max:255',
                'store' => 'nullable|string|max:255',
                'quantity' => 'nullable|string|max:255', // Changed to string
                'size_dimension' => 'nullable|string|max:255',
                'unit_price' => 'nullable|numeric|min:0',
                'total_price' => 'nullable|numeric|min:0',
                'mop' => 'nullable|string|in:PDC,PO,CARD', // Mode of payment validation
                'mop_description' => 'nullable|string|max:500', // MOP description
                'category' => 'nullable|string|max:255',
                'images' => 'nullable|array|max:10', // Maximum 10 images
                'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048' // Each image validation
            ]);

            // Handle image uploads
            $imagePaths = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('expenses', 'public');
                    $imagePaths[] = $path;
                }
            }
            
            $validatedData['images'] = $imagePaths;

            $expense = Expense::create($validatedData);

            Log::info('Expense created successfully', ['id' => $expense->id]);

            return response()->json([
                'success' => true,
                'message' => 'Expense created successfully',
                'data' => $expense
            ], 201);

        } catch (ValidationException $e) {
            Log::error('Validation failed for expense creation', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to create expense: ' . $e->getMessage());
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
            $expense = Expense::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $expense
            ]);
        } catch (\Exception $e) {
            Log::error('Expense not found: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Expense not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            Log::info('Expense update request received', ['id' => $id, 'data' => $request->all()]);

            $expense = Expense::findOrFail($id);
            
            $validatedData = $request->validate([
                'date' => 'nullable|date',
                'or_si_no' => 'nullable|string|max:255',
                'description' => 'required|string',
                'location' => 'nullable|string|max:255',
                'store' => 'nullable|string|max:255',
                'quantity' => 'nullable|string|max:255', // Changed to string
                'size_dimension' => 'nullable|string|max:255',
                'unit_price' => 'nullable|numeric|min:0',
                'total_price' => 'required|numeric|min:0',
                'mop' => 'nullable|string|in:PDC,PO,CARD', // Mode of payment validation
                'mop_description' => 'nullable|string|max:500', // MOP description
                'category' => 'nullable|string|max:255',
                'images' => 'nullable|array|max:10', // Maximum 10 images
                'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048' // Each image validation
            ]);

            // Handle image uploads
            if ($request->hasFile('images')) {
                // Delete old images if they exist
                if ($expense->images) {
                    foreach ($expense->images as $oldImage) {
                        Storage::disk('public')->delete($oldImage);
                    }
                }
                
                // Upload new images
                $imagePaths = [];
                foreach ($request->file('images') as $image) {
                    $path = $image->store('expenses', 'public');
                    $imagePaths[] = $path;
                }
                $validatedData['images'] = $imagePaths;
            }

            $expense->update($validatedData);

            Log::info('Expense updated successfully', ['id' => $expense->id]);

            return response()->json([
                'success' => true,
                'message' => 'Expense updated successfully',
                'data' => $expense
            ]);

        } catch (ValidationException $e) {
            Log::error('Validation failed for expense update', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to update expense: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update expense',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            Log::info('Expense delete request received', ['id' => $id]);

            $expense = Expense::findOrFail($id);
            
            // Delete associated images
            if ($expense->images) {
                foreach ($expense->images as $image) {
                    Storage::disk('public')->delete($image);
                }
            }
            
            $expense->delete();

            Log::info('Expense deleted successfully', ['id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'Expense deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete expense: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete expense',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

