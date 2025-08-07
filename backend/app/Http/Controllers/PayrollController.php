<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PayrollController extends Controller
{
    /**
     * Get employees by status (Site or Office)
     */
    public function getEmployeesByStatus($status)
    {
        try {
            $employees = DB::table('employees')
                ->where('status', $status)
                ->select('id', 'employee_id', 'name', 'position', 'rate', 'hourly_rate')
                ->orderBy('name', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $employees
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch employees',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new payroll record
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'payroll_type' => 'required|in:Site,Office',
            'pay_period_start' => 'required|date',
            'pay_period_end' => 'required|date|after_or_equal:pay_period_start',
            'working_days' => 'required|integer|min:0|max:7',
            'overtime_hours' => 'required|numeric|min:0',
            'late_minutes' => 'required|numeric|min:0',
            'cash_advance' => 'required|numeric|min:0',
            'others_deduction' => 'required|numeric|min:0',
            'daily_attendance' => 'nullable|array',
            'daily_attendance.monday' => 'nullable|boolean',
            'daily_attendance.tuesday' => 'nullable|boolean',
            'daily_attendance.wednesday' => 'nullable|boolean',
            'daily_attendance.thursday' => 'nullable|boolean',
            'daily_attendance.friday' => 'nullable|boolean',
            'daily_attendance.saturday' => 'nullable|boolean',
            'daily_overtime' => 'nullable|array',
            'daily_overtime.monday' => 'nullable|numeric|min:0',
            'daily_overtime.tuesday' => 'nullable|numeric|min:0',
            'daily_overtime.wednesday' => 'nullable|numeric|min:0',
            'daily_overtime.thursday' => 'nullable|numeric|min:0',
            'daily_overtime.friday' => 'nullable|numeric|min:0',
            'daily_overtime.saturday' => 'nullable|numeric|min:0',
            'daily_late' => 'nullable|array',
            'daily_late.monday' => 'nullable|numeric|min:0',
            'daily_late.tuesday' => 'nullable|numeric|min:0',
            'daily_late.wednesday' => 'nullable|numeric|min:0',
            'daily_late.thursday' => 'nullable|numeric|min:0',
            'daily_late.friday' => 'nullable|numeric|min:0',
            'daily_late.saturday' => 'nullable|numeric|min:0',
            'daily_site_address' => 'nullable|array',
            'daily_site_address.monday' => 'nullable|string',
            'daily_site_address.tuesday' => 'nullable|string',
            'daily_site_address.wednesday' => 'nullable|string',
            'daily_site_address.thursday' => 'nullable|string',
            'daily_site_address.friday' => 'nullable|string',
            'daily_site_address.saturday' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Get employee details
            $employee = DB::table('employees')->where('id', $request->employee_id)->first();
            
            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }

            // Process daily attendance data
            $dailyAttendance = $this->processDailyAttendance($request->input('daily_attendance', []));
            $dailyOvertime = $this->processDailyOvertime($request->input('daily_overtime', []));
            $dailyLate = $this->processDailyLate($request->input('daily_late', []));
            $dailySiteAddress = $this->processDailySiteAddress($request->input('daily_site_address', []));

            // Calculate payroll with daily data
            $calculations = $this->calculatePayrollWithDaily($employee, $request->all(), $dailyAttendance, $dailyOvertime, $dailyLate);

            $payrollData = [
                'employee_id' => $request->employee_id,
                'employee_name' => $employee->name,
                'employee_code' => $employee->employee_id,
                'position' => $employee->position,
                'payroll_type' => $request->payroll_type,
                'pay_period_start' => $request->pay_period_start,
                'pay_period_end' => $request->pay_period_end,
                'daily_rate' => $employee->rate,
                'hourly_rate' => $employee->hourly_rate,
                'working_days' => $request->working_days,
                'overtime_hours' => $request->overtime_hours,
                'late_minutes' => $request->late_minutes,
                'daily_attendance' => json_encode($dailyAttendance),
                'daily_overtime' => json_encode($dailyOvertime),
                'daily_late' => json_encode($dailyLate),
                'daily_site_address' => json_encode($dailySiteAddress),
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

            $payrollId = DB::table('payrolls')->insertGetId($payrollData);
            $payrollData['id'] = $payrollId;

            // Decode JSON for response
            $payrollData['daily_attendance'] = $dailyAttendance;
            $payrollData['daily_overtime'] = $dailyOvertime;
            $payrollData['daily_late'] = $dailyLate;
            $payrollData['daily_site_address'] = $dailySiteAddress;

            return response()->json([
                'success' => true,
                'message' => 'Payroll processed successfully',
                'data' => $payrollData
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process payroll',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all payroll records
     */
    public function index()
    {
        try {
            $payrolls = DB::table('payrolls')
                ->orderBy('created_at', 'desc')
                ->get();

            // Decode JSON fields for each payroll
            $payrolls = $payrolls->map(function ($payroll) {
                $payroll->daily_attendance = json_decode($payroll->daily_attendance, true);
                $payroll->daily_overtime = json_decode($payroll->daily_overtime, true);
                $payroll->daily_late = json_decode($payroll->daily_late, true);
                $payroll->daily_site_address = json_decode($payroll->daily_site_address, true);
                return $payroll;
            });

            return response()->json([
                'success' => true,
                'data' => $payrolls
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payroll records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific payroll record
     */
    public function show($id)
    {
        try {
            $payroll = DB::table('payrolls')->where('id', $id)->first();

            if (!$payroll) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payroll record not found'
                ], 404);
            }

            // Decode JSON fields
            $payroll->daily_attendance = json_decode($payroll->daily_attendance, true);
            $payroll->daily_overtime = json_decode($payroll->daily_overtime, true);
            $payroll->daily_late = json_decode($payroll->daily_late, true);
            $payroll->daily_site_address = json_decode($payroll->daily_site_address, true);

            return response()->json([
                'success' => true,
                'data' => $payroll
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payroll record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get attendance details for a specific payroll record
     */
    public function getAttendanceDetails($id)
    {
        try {
            $payroll = DB::table('payrolls')->where('id', $id)->first();

            if (!$payroll) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payroll record not found'
                ], 404);
            }

            // Decode JSON fields
            $dailyAttendance = json_decode($payroll->daily_attendance, true) ?: [];
            $dailyOvertime = json_decode($payroll->daily_overtime, true) ?: [];
            $dailyLate = json_decode($payroll->daily_late, true) ?: [];

            // Format attendance data for frontend
            $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            $attendanceData = [];

            foreach ($days as $day) {
                $attendanceData[] = [
                    'day' => ucfirst($day),
                    'present' => isset($dailyAttendance[$day]) ? (bool)$dailyAttendance[$day] : false,
                    'overtime' => isset($dailyOvertime[$day]) ? (string)$dailyOvertime[$day] : '0',
                    'late' => isset($dailyLate[$day]) ? (string)$dailyLate[$day] : '0'
                ];
            }

            // Calculate summary
            $summary = [
                'days_present' => count(array_filter($dailyAttendance)),
                'total_overtime' => array_sum($dailyOvertime),
                'total_late' => array_sum($dailyLate),
                'net_pay' => $payroll->net_pay
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'employee_info' => [
                        'id' => $payroll->employee_id,
                        'name' => $payroll->employee_name,
                        'employee_id' => $payroll->employee_code,
                        'position' => $payroll->position,
                        'department' => $payroll->payroll_type, // Using payroll_type as department
                        'pay_period' => $payroll->pay_period_start . ' to ' . $payroll->pay_period_end
                    ],
                    'attendance_data' => $attendanceData,
                    'summary' => $summary
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch attendance details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update payroll status
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
            $payroll = DB::table('payrolls')->where('id', $id)->first();

            if (!$payroll) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payroll record not found'
                ], 404);
            }

            DB::table('payrolls')->where('id', $id)->update([
                'status' => $request->status,
                'updated_at' => now()
            ]);

            $updatedPayroll = DB::table('payrolls')->where('id', $id)->first();

            return response()->json([
                'success' => true,
                'message' => 'Payroll status updated successfully',
                'data' => $updatedPayroll
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payroll status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a payroll record
     */
    public function destroy($id)
    {
        try {
            $payroll = DB::table('payrolls')->where('id', $id)->first();

            if (!$payroll) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payroll record not found'
                ], 404);
            }

            DB::table('payrolls')->where('id', $id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Payroll record deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete payroll record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process daily attendance data
     */
    private function processDailyAttendance($dailyAttendance)
    {
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        $processed = [];

        foreach ($days as $day) {
            $processed[$day] = isset($dailyAttendance[$day]) ? (bool)$dailyAttendance[$day] : false;
        }

        return $processed;
    }

    /**
     * Process daily overtime data
     */
    private function processDailyOvertime($dailyOvertime)
    {
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        $processed = [];

        foreach ($days as $day) {
            $processed[$day] = isset($dailyOvertime[$day]) ? (float)$dailyOvertime[$day] : 0;
        }

        return $processed;
    }

    /**
     * Process daily late data
     */
    private function processDailyLate($dailyLate)
    {
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        $processed = [];

        foreach ($days as $day) {
            $processed[$day] = isset($dailyLate[$day]) ? (float)$dailyLate[$day] : 0;
        }

        return $processed;
    }

    /**
     * Process daily site address data
     */
    private function processDailySiteAddress($dailySiteAddress)
    {
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        $processed = [];

        foreach ($days as $day) {
            $processed[$day] = isset($dailySiteAddress[$day]) ? $dailySiteAddress[$day] : '';
        }

        return $processed;
    }

    /**
     * Calculate payroll amounts with daily data
     */
    private function calculatePayrollWithDaily($employee, $data, $dailyAttendance, $dailyOvertime, $dailyLate)
    {
        $dailyRate = floatval($employee->rate);
        $hourlyRate = floatval($employee->hourly_rate);
        $cashAdvance = floatval($data['cash_advance']);
        $othersDeduction = floatval($data['others_deduction']);

        // Calculate from daily data
        $workingDays = count(array_filter($dailyAttendance));
        $overtimeHours = array_sum($dailyOvertime);
        $lateMinutes = array_sum($dailyLate);

        // Calculate basic salary (daily rate * working days)
        $basicSalary = $dailyRate * $workingDays;

        // Calculate overtime pay (hourly rate * overtime hours)
        $overtimePay = $hourlyRate * $overtimeHours;

        // Calculate late deduction (hourly rate * (late minutes / 60))
        $lateDeduction = $hourlyRate * ($lateMinutes / 60);

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

    /**
     * Calculate payroll amounts (legacy method for backward compatibility)
     */
    private function calculatePayroll($employee, $data)
    {
        $dailyRate = floatval($employee->rate);
        $hourlyRate = floatval($employee->hourly_rate);
        $workingDays = intval($data['working_days']);
        $overtimeHours = floatval($data['overtime_hours']);
        $lateMinutes = floatval($data['late_minutes']);
        $cashAdvance = floatval($data['cash_advance']);
        $othersDeduction = floatval($data['others_deduction']);

        // Calculate basic salary (daily rate * working days)
        $basicSalary = $dailyRate * $workingDays;

        // Calculate overtime pay (hourly rate * overtime hours)
        $overtimePay = $hourlyRate * $overtimeHours;

        // Calculate late deduction (hourly rate * (late minutes / 60))
        $lateDeduction = $hourlyRate * ($lateMinutes / 60);

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

