<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class VehicleController extends Controller
{
    /**
     * Validation rules for vehicles.
     */
    private function validationRules(bool $isUpdate = false): array
    {
        return [
            'vehicle_name' => ($isUpdate ? 'sometimes|' : '') . 'required|string|max:255',
            'lto_renewal_date' => ($isUpdate ? 'sometimes|' : '') . 'required|date',
            'description' => 'nullable|string',
            'status' => ($isUpdate ? 'sometimes|' : '') . 'nullable|in:pending,complete',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif', // No size limit
        ];
    }

    /**
     * Handle image uploads and return structured data.
     */
    private function processImages($images): array
    {
        $data = [];
        foreach ($images as $image) {
            $content = file_get_contents($image->getRealPath());
            $data[] = [
                'data'          => base64_encode($content),
                'mime_type'     => $image->getMimeType(),
                'original_name' => $image->getClientOriginalName(),
                'size'          => strlen($content)
            ];
        }
        return $data;
    }

    /**
     * Return a JSON error response.
     */
    private function errorResponse(string $message, \Throwable $e, int $status = 500)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error'   => $e->getMessage()
        ], $status);
    }

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
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch vehicles', $e);
        }
    }

    /**
     * Store a new vehicle
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), $this->validationRules());
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $imageData = $request->hasFile('images') 
                ? $this->processImages($request->file('images'))
                : [];

            $vehicle = Vehicle::create([
                'vehicle_name' => $request->vehicle_name,
                'lto_renewal_date' => $request->lto_renewal_date,
                'description' => $request->description ?? '',
                'status' => $request->status ?? 'pending',
                'images' => json_encode($imageData),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Vehicle created successfully',
                'data' => $vehicle
            ], 201);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to create vehicle', $e);
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

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch vehicle', $e);
        }
    }

    /**
     * Update a vehicle
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), $this->validationRules(true));
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
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

            // Handle images - only update if new images are uploaded
            $imageData = null;
            if ($request->hasFile('images')) {
                // New images uploaded, replace existing ones
                $imageData = $this->processImages($request->file('images'));
            } else {
                // No new images, keep existing ones
                $imageData = is_string($vehicle->images) ? json_decode($vehicle->images, true) : $vehicle->images;
            }

            // Prepare update data - only include fields that are provided
            $updateData = [];
            
            if ($request->has('vehicle_name')) {
                $updateData['vehicle_name'] = $request->vehicle_name;
            }
            
            if ($request->has('lto_renewal_date')) {
                $updateData['lto_renewal_date'] = $request->lto_renewal_date;
            }
            
            if ($request->has('description')) {
                $updateData['description'] = $request->description;
            }
            
            if ($request->has('status')) {
                $updateData['status'] = $request->status;
            }
            
            // Always update images (either new ones or existing ones)
            $updateData['images'] = json_encode($imageData);

            $vehicle->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Vehicle updated successfully',
                'data' => $vehicle->fresh()
            ]);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to update vehicle', $e);
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

            // No need to delete files from storage since images are stored in database
            $vehicle->delete();

            return response()->json([
                'success' => true,
                'message' => 'Vehicle deleted successfully'
            ]);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to delete vehicle', $e);
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

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to update vehicle status', $e);
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

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch vehicles by status', $e);
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

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to search vehicles', $e);
        }
    }
}

