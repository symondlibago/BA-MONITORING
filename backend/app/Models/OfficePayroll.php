<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OfficePayroll extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'office_payrolls';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'employee_id',
        'employee_name',
        'employee_group',
        'employee_code',
        'position',
        'pay_period_start',
        'pay_period_end',
        'daily_rate',
        'hourly_rate',
        'total_working_days',
        'total_late_minutes',
        'total_overtime_hours',
        'basic_salary',
        'overtime_pay',
        'late_deduction',
        'cash_advance',
        'others_deduction',
        'gross_pay',
        'total_deductions',
        'net_pay',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'pay_period_start' => 'date',
        'pay_period_end' => 'date',
        'daily_rate' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'total_working_days' => 'integer',
        'total_late_minutes' => 'decimal:2',
        'total_overtime_hours' => 'decimal:2',
        'basic_salary' => 'decimal:2',
        'overtime_pay' => 'decimal:2',
        'late_deduction' => 'decimal:2',
        'cash_advance' => 'decimal:2',
        'others_deduction' => 'decimal:2',
        'gross_pay' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'net_pay' => 'decimal:2',
    ];

    /**
     * Get the employee that owns the office payroll.
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Scope a query to only include pending office payrolls.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'Pending');
    }

    /**
     * Scope a query to only include processing office payrolls.
     */
    public function scopeProcessing($query)
    {
        return $query->where('status', 'Processing');
    }

    /**
     * Scope a query to only include paid office payrolls.
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'Paid');
    }

    /**
     * Scope a query to only include on hold office payrolls.
     */
    public function scopeOnHold($query)
    {
        return $query->where('status', 'On Hold');
    }

    /**
     * Check if the office payroll is pending.
     */
    public function isPending()
    {
        return $this->status === 'Pending';
    }

    /**
     * Check if the office payroll is processing.
     */
    public function isProcessing()
    {
        return $this->status === 'Processing';
    }

    /**
     * Check if the office payroll is paid.
     */
    public function isPaid()
    {
        return $this->status === 'Paid';
    }

    /**
     * Check if the office payroll is on hold.
     */
    public function isOnHold()
    {
        return $this->status === 'On Hold';
    }

    /**
     * Mark the office payroll as processing.
     */
    public function markAsProcessing()
    {
        $this->update(['status' => 'Processing']);
    }

    /**
     * Mark the office payroll as paid.
     */
    public function markAsPaid()
    {
        $this->update(['status' => 'Paid']);
    }

    /**
     * Mark the office payroll as on hold.
     */
    public function markAsOnHold()
    {
        $this->update(['status' => 'On Hold']);
    }
}

