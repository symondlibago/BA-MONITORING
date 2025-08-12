<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class VehicleController extends Controller
{
    /**
     * Get all vehicles
     */
    public function index(): JsonResponse
    {
        try {
            $vehicles = Vehicle::orderBy('created_at', 'desc')->get();
            return response()->json([
                'success' => true,
                'data' => $vehicles
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch vehicles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new vehicle
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'vehicle_name' => 'required|string|max:255',
                'lto_renewal_date' => 'required|date',
                'description' => 'nullable|string',
                'status' => 'nullable|in:pending,complete',
                'images' => 'nullable|array',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Handle image uploads
            $imagePaths = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $filename = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
                    $path = $image->storeAs('vehicles', $filename, 'public');
                    $imagePaths[] = $path;
                }
            }

            $vehicle = Vehicle::create([
                'vehicle_name' => $request->vehicle_name,
                'lto_renewal_date' => $request->lto_renewal_date,
                'description' => $request->description ?? '',
                'status' => $request->status ?? 'pending',
                'images' => $imagePaths,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Vehicle created successfully',
                'data' => $vehicle
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create vehicle',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show a specific vehicle
     */
    public function show($id): JsonResponse
    {
        try {
            $vehicle = Vehicle::find($id);

            if (!$vehicle) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vehicle not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $vehicle
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch vehicle',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a vehicle
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'vehicle_name' => 'sometimes|required|string|max:255',
                'lto_renewal_date' => 'sometimes|required|date',
                'description' => 'nullable|string',
                'status' => 'sometimes|required|in:pending,complete',
                'images' => 'nullable|array',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $vehicle = Vehicle::find($id);

            if (!$vehicle) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vehicle not found'
                ], 404);
            }

            // Handle image uploads
            $imagePaths = $vehicle->images ?? [];
            if ($request->hasFile('images')) {
                // Delete old images
                if ($vehicle->images) {
                    foreach ($vehicle->images as $oldPath) {
                        Storage::disk('public')->delete($oldPath);
                    }
                }
                
                // Upload new images
                $imagePaths = [];
                foreach ($request->file('images') as $image) {
                    $filename = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
                    $path = $image->storeAs('vehicles', $filename, 'public');
                    $imagePaths[] = $path;
                }
            }

            // Update vehicle data
            $vehicle->update([
                'vehicle_name' => $request->vehicle_name ?? $vehicle->vehicle_name,
                'lto_renewal_date' => $request->lto_renewal_date ?? $vehicle->lto_renewal_date,
                'description' => $request->description ?? $vehicle->description,
                'status' => $request->status ?? $vehicle->status,
                'images' => $imagePaths,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Vehicle updated successfully',
                'data' => $vehicle->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update vehicle',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a vehicle
     */
    public function destroy($id): JsonResponse
    {
        try {
            $vehicle = Vehicle::find($id);

            if (!$vehicle) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vehicle not found'
                ], 404);
            }

            // Delete associated images
            if ($vehicle->images) {
                foreach ($vehicle->images as $imagePath) {
                    Storage::disk('public')->delete($imagePath);
                }
            }

            // Delete the vehicle record
            $vehicle->delete();

            return response()->json([
                'success' => true,
                'message' => 'Vehicle deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete vehicle',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update vehicle status
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,complete'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $vehicle = Vehicle::find($id);

            if (!$vehicle) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vehicle not found'
                ], 404);
            }

            $vehicle->update([
                'status' => $request->status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Vehicle status updated successfully',
                'data' => $vehicle->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update vehicle status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get vehicles by status
     */
    public function getByStatus($status): JsonResponse
    {
        try {
            if (!in_array($status, ['pending', 'complete'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid status. Must be pending or complete'
                ], 400);
            }

            $vehicles = Vehicle::where('status', $status)
                              ->orderBy('created_at', 'desc')
                              ->get();

            return response()->json([
                'success' => true,
                'data' => $vehicles
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch vehicles by status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search vehicles
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');

            if (empty($query)) {
                $vehicles = Vehicle::orderBy('created_at', 'desc')->get();
            } else {
                $vehicles = Vehicle::where('vehicle_name', 'LIKE', '%' . $query . '%')
                                  ->orWhere('description', 'LIKE', '%' . $query . '%')
                                  ->orWhere('status', 'LIKE', '%' . $query . '%')
                                  ->orderBy('created_at', 'desc')
                                  ->get();
            }

            return response()->json([
                'success' => true,
                'data' => $vehicles
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search vehicles',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

