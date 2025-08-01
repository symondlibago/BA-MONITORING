<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ExpenseController extends Controller
{
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
            $validatedData = $request->validate([
                'or_si_no' => 'required|string|max:255',
                'description' => 'required|string',
                'location' => 'required|string|max:255',
                'store' => 'required|string|max:255',
                'quantity' => 'required|integer|min:1',
                'unit' => 'required|string|max:255',
                'size_dimension' => 'required|string|max:255',
                'unit_price' => 'required|numeric|min:0',
                'total_price' => 'required|numeric|min:0',
                'category' => 'required|string|max:255'
            ]);

            $expense = Expense::create($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Expense created successfully',
                'data' => $expense
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
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
            $expense = Expense::findOrFail($id);
            
            $validatedData = $request->validate([
                'or_si_no' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'location' => 'sometimes|required|string|max:255',
                'store' => 'sometimes|required|string|max:255',
                'quantity' => 'sometimes|required|integer|min:1',
                'unit' => 'sometimes|required|string|max:255',
                'size_dimension' => 'sometimes|required|string|max:255',
                'unit_price' => 'sometimes|required|numeric|min:0',
                'total_price' => 'sometimes|required|numeric|min:0',
                'category' => 'sometimes|required|string|max:255'
            ]);

            $expense->update($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Expense updated successfully',
                'data' => $expense
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
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
            $expense = Expense::findOrFail($id);
            $expense->delete();

            return response()->json([
                'success' => true,
                'message' => 'Expense deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete expense',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}