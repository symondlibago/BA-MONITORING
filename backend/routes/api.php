<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\EmergencyCashAdvanceController;
use App\Http\Controllers\EmergencyDeductionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post("/register", [AuthController::class, "register"]);
Route::post("/login", [AuthController::class, "login"]);

// Expense routes (public for now, can be protected later)
Route::apiResource("expenses", ExpenseController::class);

// Protected routes
Route::middleware("auth:sanctum")->group(function () {
    Route::get("/user", [AuthController::class, "user"]);
    Route::post("/logout", [AuthController::class, "logout"]);
});

Route::middleware("api")->group(function () {
    Route::apiResource("equipment", EquipmentController::class);
    Route::patch("equipment/{id}/borrow", [EquipmentController::class, "borrow"]);
    Route::patch("equipment/{id}/return", [EquipmentController::class, "returnEquipment"]);
    
    // Employee routes
    Route::apiResource("employees", EmployeeController::class);
    
    // Payroll routes
    Route::apiResource("payrolls", PayrollController::class);
    Route::get("employees/status/{status}", [PayrollController::class, "getEmployeesByStatus"]);
    Route::patch("payrolls/{id}/status", [PayrollController::class, "updateStatus"]);
    
    // New route for attendance details
    Route::get("payrolls/{id}/attendance", [PayrollController::class, "getAttendanceDetails"]);
    
    // New route for getting employee ECA/ED data
    Route::get("employees/{employeeId}/eca-ed", [PayrollController::class, "getEmployeeEcaEd"]);
    
    // Emergency Cash Advance routes
    Route::apiResource("emergency-cash-advances", EmergencyCashAdvanceController::class);
    Route::get("employees/{employeeId}/eca-ed-details", [EmergencyCashAdvanceController::class, "getByEmployee"]);
    
    // Emergency Deduction routes
    Route::apiResource("emergency-deductions", EmergencyDeductionController::class);
    
});

