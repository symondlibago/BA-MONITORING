<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Models\DailyUpdate;
use App\Models\Project;

class DailyUpdateController extends Controller
{
    /**
     * Display a listing of daily updates for a specific project.
     *
     * @param int $projectId
     * @return JsonResponse
     */
    public function index($projectId): JsonResponse
    {
        try {
            $project = Project::findOrFail($projectId);
            $dailyUpdates = DailyUpdate::where('project_id', $projectId)
                ->orderBy('date', 'desc')
                ->get();
            
            return response()->json($dailyUpdates, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch daily updates',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created daily update in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'project_id' => 'required|exists:projects,id',
                'date' => 'required|date',
                'weather' => 'nullable|string|max:255',
                'manpower' => 'nullable|integer|min:0',
                'activity' => 'required|string',
                'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max per image
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Handle image uploads
            $imagePaths = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('daily_updates', 'public');
                    $imagePaths[] = $path;
                }
            }

            $dailyUpdate = DailyUpdate::create([
                'project_id' => $request->project_id,
                'date' => $request->date,
                'weather' => $request->weather,
                'manpower' => $request->manpower,
                'activity' => $request->activity,
                'images' => $imagePaths,
            ]);

            return response()->json([
                'message' => 'Daily update created successfully',
                'daily_update' => $dailyUpdate
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create daily update',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified daily update.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show($id): JsonResponse
    {
        try {
            $dailyUpdate = DailyUpdate::with('project')->findOrFail($id);
            
            return response()->json($dailyUpdate, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Daily update not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified daily update in storage.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $dailyUpdate = DailyUpdate::findOrFail($id);

            // Get all request data including files
            $requestData = $request->all();
            
            // Handle the _method field for PUT requests via FormData
            if (isset($requestData['_method'])) {
                unset($requestData['_method']);
            }

            $validator = Validator::make($requestData, [
                'date' => 'required|date',
                'weather' => 'nullable|string|max:255',
                'manpower' => 'nullable|integer|min:0',
                'activity' => 'required|string',
                'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max per image
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Handle image uploads
            $imagePaths = $dailyUpdate->images ?? [];
            
            // Only process new images if they are uploaded
            if ($request->hasFile('images')) {
                // Delete old images if new ones are uploaded
                if (!empty($dailyUpdate->images)) {
                    foreach ($dailyUpdate->images as $oldImage) {
                        Storage::disk('public')->delete($oldImage);
                    }
                }
                
                $imagePaths = [];
                foreach ($request->file('images') as $image) {
                    $path = $image->store('daily_updates', 'public');
                    $imagePaths[] = $path;
                }
            }

            // Prepare update data
            $updateData = [
                'date' => $request->date,
                'activity' => $request->activity,
                'images' => $imagePaths,
            ];

            // Only include optional fields if they are provided
            if ($request->has('weather')) {
                $updateData['weather'] = $request->weather;
            }

            if ($request->has('manpower') && $request->manpower !== '') {
                $updateData['manpower'] = $request->manpower;
            }

            $dailyUpdate->update($updateData);

            return response()->json([
                'message' => 'Daily update updated successfully',
                'daily_update' => $dailyUpdate->fresh()
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update daily update',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified daily update from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        try {
            $dailyUpdate = DailyUpdate::findOrFail($id);
            
            // Delete associated images
            if (!empty($dailyUpdate->images)) {
                foreach ($dailyUpdate->images as $image) {
                    Storage::disk('public')->delete($image);
                }
            }
            
            $dailyUpdate->delete();

            return response()->json([
                'message' => 'Daily update deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete daily update',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

