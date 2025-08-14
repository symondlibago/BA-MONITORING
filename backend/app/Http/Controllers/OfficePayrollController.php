<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OfficePayrollController extends Controller
{
    /**
     * Store a new office payroll record
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'pay_period_start' => 'required|date',
            'pay_period_end' => 'required|date|after_or_equal:pay_period_start',
            'total_working_days' => 'required|integer|min:0|max:31',
            'total_late_minutes' => 'required|numeric|min:0',
            'total_overtime_hours' => 'required|numeric|min:0',
            'cash_advance' => 'required|numeric|min:0',
            'others_deduction' => 'required|numeric|min:0',
            'emergency_cash_advance' => 'nullable|numeric|min:0',
            'emergency_deduction' => 'nullable|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Get employee details
            $employee = DB::table('employees')->where('id', $request->employee_id)->first();
            
            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }

            // Verify employee is Office type
            if ($employee->status !== 'Office') {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee must be of Office type for office payroll'
                ], 400);
            }

            // Check for existing active ECA and ED
            $existingEca = DB::table('emergency_cash_advances')
                ->where('employee_id', $request->employee_id)
                ->where('status', 'active')
                ->first();

            $existingEd = DB::table('emergency_deductions')
                ->where('employee_id', $request->employee_id)
                ->where('status', 'active')
                ->first();

            // Handle new ECA and ED creation if provided
            if ($request->emergency_cash_advance && $request->emergency_deduction) {
                if ($existingEca) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Employee already has an active emergency cash advance'
                    ], 400);
                }

                // Create new ECA
                $ecaData = [
                    'employee_id' => $request->employee_id,
                    'amount' => $request->emergency_cash_advance,
                    'remaining_balance' => $request->emergency_cash_advance,
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now()
                ];
                DB::table('emergency_cash_advances')->insert($ecaData);

                // Create new ED
                $edData = [
                    'employee_id' => $request->employee_id,
                    'amount' => $request->emergency_deduction,
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now()
                ];
                DB::table('emergency_deductions')->insert($edData);

                $existingEca = (object) $ecaData;
                $existingEd = (object) $edData;
            }

            // Process ECA deduction if exists
            if ($existingEca && $existingEd && $request->cash_advance > 0) {
                $newBalance = $existingEca->remaining_balance - $request->cash_advance;
                
                if ($newBalance <= 0) {
                    // Mark ECA and ED as completed
                    DB::table('emergency_cash_advances')
                        ->where('employee_id', $request->employee_id)
                        ->where('status', 'active')
                        ->update([
                            'status' => 'completed',
                            'remaining_balance' => 0,
                            'updated_at' => now()
                        ]);

                    DB::table('emergency_deductions')
                        ->where('employee_id', $request->employee_id)
                        ->where('status', 'active')
                        ->update([
                            'status' => 'completed',
                            'updated_at' => now()
                        ]);
                } else {
                    // Update remaining balance
                    DB::table('emergency_cash_advances')
                        ->where('employee_id', $request->employee_id)
                        ->where('status', 'active')
                        ->update([
                            'remaining_balance' => $newBalance,
                            'updated_at' => now()
                        ]);
                }
            }

            // Calculate office payroll
            $calculations = $this->calculateOfficePayroll($employee, $request->all());

            $officePayrollData = [
                'employee_id' => $request->employee_id,
                'employee_name' => $employee->name,
                'employee_group' => $employee->group,
                'employee_code' => $employee->employee_id,
                'position' => $employee->position,
                'pay_period_start' => $request->pay_period_start,
                'pay_period_end' => $request->pay_period_end,
                'daily_rate' => $employee->rate,
                'hourly_rate' => $employee->hourly_rate,
                'total_working_days' => $request->total_working_days,
                'total_late_minutes' => $request->total_late_minutes,
                'total_overtime_hours' => $request->total_overtime_hours,
                'basic_salary' => $calculations['basic_salary'],
                'overtime_pay' => $calculations['overtime_pay'],
                'late_deduction' => $calculations['late_deduction'],
                'cash_advance' => $request->cash_advance,
                'others_deduction' => $request->others_deduction,
                'gross_pay' => $calculations['gross_pay'],
                'total_deductions' => $calculations['total_deductions'],
                'net_pay' => $calculations['net_pay'],
                'status' => 'Pending',
                'created_at' => now(),
                'updated_at' => now()
            ];

            $officePayrollId = DB::table('office_payrolls')->insertGetId($officePayrollData);
            $officePayrollData['id'] = $officePayrollId;

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Office payroll processed successfully',
                'data' => $officePayrollData
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to process office payroll',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all office payroll records
     */
    public function index()
    {
        try {
            $officePayrolls = DB::table('office_payrolls')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $officePayrolls
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch office payroll records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific office payroll record
     */
    public function show($id)
    {
        try {
            $officePayroll = DB::table('office_payrolls')->where('id', $id)->first();

            if (!$officePayroll) {
                return response()->json([
                    'success' => false,
                    'message' => 'Office payroll record not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $officePayroll
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch office payroll record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an office payroll record
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'nullable|in:Pending,Processing,Paid,On Hold',
            'cash_advance' => 'nullable|numeric|min:0',
            'others_deduction' => 'nullable|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $officePayroll = DB::table('office_payrolls')->where('id', $id)->first();

            if (!$officePayroll) {
                return response()->json([
                    'success' => false,
                    'message' => 'Office payroll record not found'
                ], 404);
            }

            // Prepare update data
            $updateData = ['updated_at' => now()];
            
            if ($request->has('status')) {
                $updateData['status'] = $request->status;
            }
            
            if ($request->has('cash_advance')) {
                $updateData['cash_advance'] = $request->cash_advance;
            }
            
            if ($request->has('others_deduction')) {
                $updateData['others_deduction'] = $request->others_deduction;
            }

            // Recalculate totals if deductions changed
            if ($request->has('cash_advance') || $request->has('others_deduction')) {
                $cashAdvance = $request->has('cash_advance') ? $request->cash_advance : $officePayroll->cash_advance;
                $othersDeduction = $request->has('others_deduction') ? $request->others_deduction : $officePayroll->others_deduction;
                
                $totalDeductions = $officePayroll->late_deduction + $cashAdvance + $othersDeduction;
                $netPay = $officePayroll->gross_pay - $totalDeductions;
                
                $updateData['total_deductions'] = $totalDeductions;
                $updateData['net_pay'] = $netPay;
            }

            DB::table('office_payrolls')->where('id', $id)->update($updateData);

            $updatedOfficePayroll = DB::table('office_payrolls')->where('id', $id)->first();

            return response()->json([
                'success' => true,
                'message' => 'Office payroll record updated successfully',
                'data' => $updatedOfficePayroll
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update office payroll record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an office payroll record
     */
    public function destroy($id)
    {
        try {
            $officePayroll = DB::table('office_payrolls')->where('id', $id)->first();

            if (!$officePayroll) {
                return response()->json([
                    'success' => false,
                    'message' => 'Office payroll record not found'
                ], 404);
            }

            DB::table('office_payrolls')->where('id', $id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Office payroll record deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete office payroll record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update office payroll status
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:Pending,Processing,Paid,On Hold'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $officePayroll = DB::table('office_payrolls')->where('id', $id)->first();

            if (!$officePayroll) {
                return response()->json([
                    'success' => false,
                    'message' => 'Office payroll record not found'
                ], 404);
            }

            DB::table('office_payrolls')->where('id', $id)->update([
                'status' => $request->status,
                'updated_at' => now()
            ]);

            $updatedOfficePayroll = DB::table('office_payrolls')->where('id', $id)->first();

            return response()->json([
                'success' => true,
                'message' => 'Office payroll status updated successfully',
                'data' => $updatedOfficePayroll
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update office payroll status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate office payroll amounts
     */
    private function calculateOfficePayroll($employee, $data)
    {
        $dailyRate = $employee->rate;
        $hourlyRate = $employee->hourly_rate;
        
        $totalWorkingDays = $data['total_working_days'];
        $totalLateMinutes = $data['total_late_minutes'];
        $totalOvertimeHours = $data['total_overtime_hours'];
        $cashAdvance = $data['cash_advance'];
        $othersDeduction = $data['others_deduction'];

        // Calculate basic salary (daily rate * working days)
        $basicSalary = $dailyRate * $totalWorkingDays;

        // Calculate overtime pay (hourly rate * 1.25 * overtime hours)
        $overtimePay = $hourlyRate * 1 * $totalOvertimeHours;

        // Calculate late deduction (hourly rate / 60 * late minutes)
        $lateDeduction = ($hourlyRate / 60) * $totalLateMinutes;

        // Calculate gross pay
        $grossPay = $basicSalary + $overtimePay;

        // Calculate total deductions
        $totalDeductions = $lateDeduction + $cashAdvance + $othersDeduction;

        // Calculate net pay
        $netPay = $grossPay - $totalDeductions;

        return [
            'basic_salary' => round($basicSalary, 2),
            'overtime_pay' => round($overtimePay, 2),
            'late_deduction' => round($lateDeduction, 2),
            'gross_pay' => round($grossPay, 2),
            'total_deductions' => round($totalDeductions, 2),
            'net_pay' => round($netPay, 2)
        ];
    }
}

