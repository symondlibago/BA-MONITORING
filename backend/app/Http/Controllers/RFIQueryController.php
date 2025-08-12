<?php

namespace App\Http\Controllers;

use App\Models\RFIQuery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class RFIQueryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $rfiQueries = RFIQuery::orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $rfiQueries
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch RFI queries',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'description' => 'required|string|max:1000',
                'date' => 'required|date',
                'status' => 'nullable|in:pending,approved,reject',
                'images' => 'nullable|array|max:10',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:10240'
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
                    $path = $image->store('rfi_queries', 'public');
                    $imagePaths[] = $path;
                }
            }
            
            $rfiQuery = RFIQuery::create([
                'description' => $request->description,
                'date' => $request->date,
                'status' => $request->status ?? 'pending', // Default to pending if not provided
                'images' => $imagePaths,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'RFI query created successfully',
                'data' => $rfiQuery
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create RFI query',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $rfiQuery = RFIQuery::find($id);
            
            if (!$rfiQuery) {
                return response()->json([
                    'success' => false,
                    'message' => 'RFI query not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $rfiQuery
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch RFI query',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'description' => 'required|string|max:1000',
                'date' => 'required|date',
                'status' => 'required|in:pending,approved,reject',
                'images' => 'nullable|array|max:10',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:10240'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $rfiQuery = RFIQuery::find($id);
            
            if (!$rfiQuery) {
                return response()->json([
                    'success' => false,
                    'message' => 'RFI query not found'
                ], 404);
            }
            
            // Handle image uploads
            $imagePaths = $rfiQuery->images ?? [];
            if ($request->hasFile('images')) {
                // Delete old images
                if ($rfiQuery->images) {
                    foreach ($rfiQuery->images as $oldPath) {
                        Storage::disk('public')->delete($oldPath);
                    }
                }
                
                // Upload new images
                $imagePaths = [];
                foreach ($request->file('images') as $image) {
                    $path = $image->store('rfi_queries', 'public');
                    $imagePaths[] = $path;
                }
            }
            
            // Update RFI query data
            $rfiQuery->update([
                'description' => $request->description,
                'date' => $request->date,
                'status' => $request->status,
                'images' => $imagePaths,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'RFI query updated successfully',
                'data' => $rfiQuery->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update RFI query',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $rfiQuery = RFIQuery::find($id);
            
            if (!$rfiQuery) {
                return response()->json([
                    'success' => false,
                    'message' => 'RFI query not found'
                ], 404);
            }
            
            // Delete associated images
            if ($rfiQuery->images) {
                foreach ($rfiQuery->images as $imagePath) {
                    Storage::disk('public')->delete($imagePath);
                }
            }
            
            // Delete the record
            $rfiQuery->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'RFI query deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete RFI query',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the status of the specified resource.
     */
    public function updateStatus(Request $request, string $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,approved,reject'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $rfiQuery = RFIQuery::find($id);
            
            if (!$rfiQuery) {
                return response()->json([
                    'success' => false,
                    'message' => 'RFI query not found'
                ], 404);
            }
            
            $rfiQuery->update([
                'status' => $request->status
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'RFI query status updated successfully',
                'data' => $rfiQuery->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update RFI query status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get RFI queries by status.
     */
    public function getByStatus(string $status)
    {
        try {
            $rfiQueries = RFIQuery::where('status', $status)
                                 ->orderBy('created_at', 'desc')
                                 ->get();
            
            return response()->json([
                'success' => true,
                'data' => $rfiQueries
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch RFI queries by status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search RFI queries.
     */
    public function search(Request $request)
    {
        try {
            $query = $request->get('q', '');
            
            if (empty($query)) {
                $rfiQueries = RFIQuery::orderBy('created_at', 'desc')->get();
            } else {
                $rfiQueries = RFIQuery::where('description', 'LIKE', '%' . $query . '%')
                                     ->orderBy('created_at', 'desc')
                                     ->get();
            }
            
            return response()->json([
                'success' => true,
                'data' => $rfiQueries
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search RFI queries',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

