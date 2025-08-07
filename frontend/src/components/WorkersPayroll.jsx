import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  DollarSign, 
  Users, 
  Calendar, 
  Clock,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calculator,
  CreditCard,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
  ChevronDown,
  Building,
  HardHat,
  Grid3X3,
  List
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import API_BASE_URL from './Config'

// Custom Dropdown Component
const CustomDropdown = React.memo(({ label, required = false, value, onChange, options, placeholder, disabled = false, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)

  useEffect(() => {
    const option = options.find(opt => opt.value === value)
    setSelectedOption(option || null)
  }, [value, options])

  const handleSelect = useCallback((option) => {
    setSelectedOption(option)
    onChange(option.value)
    setIsOpen(false)
  }, [onChange])

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none text-left flex items-center justify-between ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'
        }`}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
          >
            <ul className="py-1 text-sm text-gray-700 max-h-60 overflow-y-auto">
              {options.map((option, index) => (
                <motion.li
                  key={option.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(option)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150"
                  >
                    {option.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
})

// Success Alert Component
const SuccessAlert = React.memo(({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.95 }}
        className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-md"
      >
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
          <p className="text-green-800 font-medium">{message}</p>
          <button
            onClick={onClose}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
})

// Attendance Detail Modal
const AttendanceDetailModal = React.memo(({ isOpen, onClose, record }) => {
  const [attendanceData, setAttendanceData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // API base URL

  // Fetch attendance data when modal opens
  useEffect(() => {
    if (isOpen && record) {
      fetchAttendanceData()
    }
  }, [isOpen, record])

  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`${API_BASE_URL}/payrolls/${record.id}/attendance`)
      const data = await response.json()
      
      if (data.success) {
        setAttendanceData(data.data)
      } else {
        setError(data.message || 'Failed to fetch attendance data')
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error)
      setError('Failed to fetch attendance data')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !record) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Attendance Details - {record.name}
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading attendance data...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {attendanceData && (
              <div className="space-y-6">
                {/* Employee Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Employee ID</p>
                      <p className="font-medium">{attendanceData.employee_info.employee_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Position</p>
                      <p className="font-medium">{attendanceData.employee_info.position}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-medium">{attendanceData.employee_info.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pay Period</p>
                      <p className="font-medium">{attendanceData.employee_info.pay_period}</p>
                    </div>
                  </div>
                </div>

                {/* Daily Attendance */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Attendance Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 border-b">Day</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 border-b">Status</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 border-b">Overtime (hrs)</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 border-b">Late (mins)</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 border-b">Site Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceData.attendance_data.map((day, index) => (
                          <tr key={day.day} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="py-3 px-4 text-sm font-medium text-gray-900 border-b">
                              {day.day}
                            </td>
                            <td className="py-3 px-4 text-center border-b">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                day.present 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {day.present ? 'Present' : 'Absent'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center text-sm text-gray-900 border-b">
                              {day.present ? `${day.overtime}h` : '-'}
                            </td>
                            <td className="py-3 px-4 text-center text-sm text-gray-900 border-b">
                              {day.present && day.late !== '0' ? `${day.late} mins` : '-'}
                            </td>
                            <td className="py-3 px-4 text-center text-sm text-gray-900 border-b">
                              {day.present ? `${day.site_address}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Days Present</p>
                      <p className="text-xl font-bold text-blue-600">
                        {attendanceData.summary.days_present}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total OT</p>
                      <p className="text-xl font-bold text-green-600">
                        {attendanceData.summary.total_overtime}h
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Late</p>
                      <p className="text-xl font-bold text-red-600">
                        {attendanceData.summary.total_late} mins
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Net Pay</p>
                      <p className="text-xl font-bold text-purple-600">
                        ₱{parseFloat(attendanceData.summary.net_pay).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

// Process Payroll Modal
const ProcessPayrollModal = React.memo(({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [step, setStep] = useState(1) // 1: Select Type, 2: Process Payroll
  const [payrollType, setPayrollType] = useState('')
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [employeeError, setEmployeeError] = useState('')
  
  // Payroll form data
  const [formData, setFormData] = useState({
    payPeriodStart: '',
    payPeriodEnd: '',
    workingDays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false
    },
    overtime: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: ''
    },
    late: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: ''
    },
    siteAddress: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: ''
    },
    cashAdvance: '',
    cashAdvanceBalance: '',
    othersDeduction: ''
  })

  // API base URL

  // Reset modal when opened/closed
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setPayrollType('')
      setSelectedEmployee('')
      setEmployees([])
      setEmployeeError('')
      setFormData({
        payPeriodStart: '',
        payPeriodEnd: '',
        workingDays: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false
        },
        overtime: {
          monday: '',
          tuesday: '',
          wednesday: '',
          thursday: '',
          friday: '',
          saturday: ''
        },
        late: {
          monday: '',
          tuesday: '',
          wednesday: '',
          thursday: '',
          friday: '',
          saturday: ''
        },
        siteAddress: {
          monday: '',
          tuesday: '',
          wednesday: '',
          thursday: '',
          friday: '',
          saturday: ''
        },
        cashAdvance: '',
        cashAdvanceBalance: '',
        othersDeduction: ''
      })
    }
  }, [isOpen])

  // Fetch employees by status
  const fetchEmployeesByStatus = useCallback(async (status) => {
    try {
      setLoadingEmployees(true)
      setEmployeeError('')
      console.log(`Fetching employees with status: ${status}`)
      console.log(`API URL: ${API_BASE_URL}/employees/status/${status}`)
      
      const response = await fetch(`${API_BASE_URL}/employees/status/${status}`)
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.success) {
        setEmployees(data.data || [])
        console.log('Employees loaded:', data.data?.length || 0)
        if (!data.data || data.data.length === 0) {
          setEmployeeError(`No ${status} employees found. Please add employees first.`)
        }
      } else {
        console.error('Failed to fetch employees:', data.message)
        setEmployeeError(data.message || 'Failed to fetch employees')
        setEmployees([])
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployeeError(`Error: ${error.message}. Please check if the backend is running and accessible.`)
      setEmployees([])
    } finally {
      setLoadingEmployees(false)
    }
  }, [])

  // Handle payroll type selection
  const handlePayrollTypeSelect = useCallback((type) => {
    setPayrollType(type)
    setStep(2)
    fetchEmployeesByStatus(type)
  }, [fetchEmployeesByStatus])

  // Calculate totals
  const calculations = useMemo(() => {
    const selectedEmp = employees.find(emp => emp.id == selectedEmployee)
    if (!selectedEmp) {
      return {
        workingDaysCount: 0,
        totalOT: 0,
        totalLate: 0,
        basicSalary: 0,
        overtimePay: 0,
        lateDeduction: 0,
        grossPay: 0,
        totalDeductions: 0,
        netPay: 0
      }
    }

    const dailyRate = parseFloat(selectedEmp.rate) || 0
    const hourlyRate = parseFloat(selectedEmp.hourly_rate) || 0

    // Count working days
    const workingDaysCount = Object.values(formData.workingDays).filter(Boolean).length

    // Calculate total OT hours
    const totalOT = Object.values(formData.overtime).reduce((sum, ot) => {
      return sum + (parseFloat(ot) || 0)
    }, 0)

    // Calculate total late minutes
    const totalLate = Object.values(formData.late).reduce((sum, late) => {
      return sum + (parseFloat(late) || 0)
    }, 0)

    // Calculate basic salary
    const basicSalary = dailyRate * workingDaysCount

    // Calculate overtime pay
    const overtimePay = hourlyRate * totalOT

    // Calculate late deduction (hourly rate * (late minutes / 60))
    const lateDeduction = hourlyRate * (totalLate / 60)

    // Calculate gross pay
    const grossPay = basicSalary + overtimePay

    // Calculate total deductions
    const cashAdvance = parseFloat(formData.cashAdvance) || 0
    const othersDeduction = parseFloat(formData.othersDeduction) || 0
    const totalDeductions = lateDeduction + cashAdvance + othersDeduction

    // Calculate net pay
    const netPay = grossPay - totalDeductions

    return {
      workingDaysCount,
      totalOT: totalOT.toFixed(2),
      totalLate: totalLate.toFixed(2),
      basicSalary: basicSalary.toFixed(2),
      overtimePay: overtimePay.toFixed(2),
      lateDeduction: lateDeduction.toFixed(2),
      grossPay: grossPay.toFixed(2),
      totalDeductions: totalDeductions.toFixed(2),
      netPay: netPay.toFixed(2)
    }
  }, [selectedEmployee, employees, formData])

  // Handle form input changes
  const handleInputChange = useCallback((field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }, [])

  // Handle checkbox changes
  const handleCheckboxChange = useCallback((day) => {
    setFormData(prev => {
      const newWorkingDays = {
        ...prev.workingDays,
        [day]: !prev.workingDays[day]
      }
      
      // If unchecking a day, clear its OT and Late values
      const newOvertime = { ...prev.overtime }
      const newLate = { ...prev.late }
      
      if (!newWorkingDays[day]) {
        newOvertime[day] = ''
        newLate[day] = ''
      }
      
      return {
        ...prev,
        workingDays: newWorkingDays,
        overtime: newOvertime,
        late: newLate
      }
    })
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(() => {
    const selectedEmp = employees.find(emp => emp.id == selectedEmployee)
    if (!selectedEmp) return

    const payrollData = {
      employee_id: selectedEmployee,
      payroll_type: payrollType,
      pay_period_start: formData.payPeriodStart,
      pay_period_end: formData.payPeriodEnd,
      working_days: calculations.workingDaysCount,
      overtime_hours: parseFloat(calculations.totalOT),
      late_minutes: parseFloat(calculations.totalLate),
      cash_advance: parseFloat(formData.cashAdvance) || 0,
      others_deduction: parseFloat(formData.othersDeduction) || 0,
      // Add daily attendance data
      daily_attendance: formData.workingDays,
      daily_overtime: formData.overtime,
      daily_late: formData.late,
      daily_site_address: formData.siteAddress
    }

    onSubmit(payrollData)
  }, [selectedEmployee, employees, payrollType, formData, calculations, onSubmit])

  // Employee options for dropdown
  const employeeOptions = employees.map(emp => ({
    value: emp.id,
    label: `${emp.name} (${emp.employee_id}) - ${emp.position}`
  }))

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => !isSubmitting && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {step === 1 ? 'Process Payroll' : `Process ${payrollType} Payroll`}
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {step === 1 && (
              <div className="space-y-6">
                <p className="text-gray-600 text-center">Select payroll type to process</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePayrollTypeSelect('Site')}
                    className="p-8 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                        <HardHat className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Site Payroll</h3>
                      <p className="text-gray-600 text-center">Process weekly payroll for site workers</p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePayrollTypeSelect('Office')}
                    className="p-8 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-4 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                        <Building className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Office Payroll</h3>
                      <p className="text-gray-600 text-center">Process monthly payroll for office staff</p>
                    </div>
                  </motion.button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* Employee Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <CustomDropdown
                      label="Select Employee"
                      required={true}
                      value={selectedEmployee}
                      onChange={setSelectedEmployee}
                      options={employeeOptions}
                      placeholder={loadingEmployees ? "Loading employees..." : employeeError || "Select an employee"}
                      disabled={loadingEmployees || isSubmitting || employees.length === 0}
                    />
                    {employeeError && (
                      <p className="text-sm text-red-600 mt-1">{employeeError}</p>
                    )}
                    {!loadingEmployees && !employeeError && employees.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">No employees found for {payrollType} status</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pay Period Start <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.payPeriodStart}
                        onChange={(e) => handleInputChange('payPeriodStart', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pay Period End <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.payPeriodEnd}
                        onChange={(e) => handleInputChange('payPeriodEnd', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {selectedEmployee && (
                  <>
                    {/* Daily Attendance Grid */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Attendance</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Day</th>
                              <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Present</th>
                              <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">OT (hrs)</th>
                              <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Late (mins)</th>
                              <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Site Address</th>
                            </tr>
                          </thead>
                          <tbody>
                            {days.map((day, index) => (
                              <tr key={day} className="border-b border-gray-100">
                                <td className="py-2 px-3 text-sm font-medium text-gray-900">
                                  {dayLabels[index]}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={formData.workingDays[day]}
                                    onChange={() => handleCheckboxChange(day)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    disabled={isSubmitting}
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="number"
                                    value={formData.overtime[day]}
                                    onChange={(e) => handleInputChange(`overtime.${day}`, e.target.value)}
                                    className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none ${
                                      !formData.workingDays[day] ? 'bg-gray-100 cursor-not-allowed' : ''
                                    }`}
                                    placeholder="0"
                                    min="0"
                                    step="0.5"
                                    disabled={isSubmitting || !formData.workingDays[day]}
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="number"
                                    value={formData.late[day]}
                                    onChange={(e) => handleInputChange(`late.${day}`, e.target.value)}
                                    className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none ${
                                      !formData.workingDays[day] ? 'bg-gray-100 cursor-not-allowed' : ''
                                    }`}
                                    placeholder="0"
                                    min="0"
                                    disabled={isSubmitting || !formData.workingDays[day]}
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={formData.siteAddress[day]}
                                    onChange={(e) => handleInputChange(`siteAddress.${day}`, e.target.value)}
                                    className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none ${
                                      !formData.workingDays[day] ? 'bg-gray-100 cursor-not-allowed' : ''
                                    }`}
                                    placeholder="Enter site address"
                                    disabled={isSubmitting || !formData.workingDays[day]}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Calculations Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Automated Calculations */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Automated Calculations</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Working Days:</span>
                            <span className="text-sm font-medium">{calculations.workingDaysCount} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total OT:</span>
                            <span className="text-sm font-medium">{calculations.totalOT} hrs</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Late:</span>
                            <span className="text-sm font-medium">{calculations.totalLate} mins</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Basic Salary:</span>
                            <span className="text-sm font-medium">₱{calculations.basicSalary}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Overtime Pay:</span>
                            <span className="text-sm font-medium text-green-600">+₱{calculations.overtimePay}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Late Deduction:</span>
                            <span className="text-sm font-medium text-red-600">-₱{calculations.lateDeduction}</span>
                          </div>
                        </div>
                      </div>

                      {/* Manual Deductions */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Deduction Breakdown</h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cash Advance
                          </label>
                          <input
                            type="number"
                            value={formData.cashAdvance}
                            onChange={(e) => handleInputChange('cashAdvance', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Others
                          </label>
                          <input
                            type="number"
                            value={formData.othersDeduction}
                            onChange={(e) => handleInputChange('othersDeduction', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Final Summary */}
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payroll Summary</h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Gross Pay</p>
                          <p className="text-2xl font-bold text-green-600">₱{calculations.grossPay}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Total Deductions</p>
                          <p className="text-2xl font-bold text-red-600">₱{calculations.totalDeductions}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Net Pay</p>
                          <p className="text-2xl font-bold text-blue-600">₱{calculations.netPay}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-6 border-t">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setStep(1)} 
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={handleSubmit}
                    disabled={!selectedEmployee || !formData.payPeriodStart || !formData.payPeriodEnd || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Process Payroll'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

// Filter options
const statusOptions = [
  { value: 'All', label: 'All Status' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Pending', label: 'Pending' },
  { value: 'On Hold', label: 'On Hold' }
]

const departmentOptions = [
  { value: 'All', label: 'All Departments' },
  { value: 'Site', label: 'Site' },
  { value: 'Office', label: 'Office' }
]

const paymentMethodOptions = [
  { value: 'All', label: 'All Methods' },
  { value: 'Direct Deposit', label: 'Direct Deposit' },
  { value: 'Check', label: 'Check' },
  { value: 'Cash', label: 'Cash' }
]

function WorkersPayroll() {
  const [payrollRecords, setPayrollRecords] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedDepartment, setSelectedDepartment] = useState('All')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('All')
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false)
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successAlert, setSuccessAlert] = useState({ isVisible: false, message: '' })
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('card') // 'table' or 'card'

  // API base URL

  // Fetch payroll records from backend
  const fetchPayrollRecords = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/payrolls`)
      const data = await response.json()
      
      if (data.success) {
        // Transform backend data to match frontend format
        const transformedRecords = data.data.map(record => ({
          id: record.id,
          employeeId: record.employee_code,
          name: record.employee_name,
          position: record.position,
          department: record.payroll_type,
          payPeriod: `${record.pay_period_start} to ${record.pay_period_end}`,
          hoursWorked: parseFloat(record.working_days) * 8, // Assuming 8 hours per day, ensure numeric
          overtimeHours: parseFloat(record.overtime_hours) || 0,
          hourlyRate: parseFloat(record.hourly_rate) || 0,
          overtimeRate: parseFloat(record.hourly_rate) || 0,
          grossPay: parseFloat(record.gross_pay) || 0,
          deductions: {
            late: parseFloat(record.late_deduction) || 0,
            cashAdvance: parseFloat(record.cash_advance) || 0,
            others: parseFloat(record.others_deduction) || 0
          },
          netPay: parseFloat(record.net_pay) || 0,
          paymentDate: record.created_at ? record.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
          paymentMethod: "Pending",
          status: record.status,
          // Add daily attendance data
          dailyAttendance: record.daily_attendance || {},
          dailyOvertime: record.daily_overtime || {},
          dailyLate: record.daily_late || {}
        }))
        setPayrollRecords(transformedRecords)
      } else {
        console.error('Failed to fetch payroll records:', data.message)
        setPayrollRecords([])
      }
    } catch (error) {
      console.error('Error fetching payroll records:', error)
      setPayrollRecords([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Load payroll records on component mount
  useEffect(() => {
    fetchPayrollRecords()
  }, [fetchPayrollRecords])

  // Process payroll submission
  const handleProcessPayroll = useCallback(async (payrollData) => {
    try {
      setIsSubmitting(true)
      console.log('Submitting payroll data:', payrollData)
      
      const response = await fetch(`${API_BASE_URL}/payrolls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payrollData)
      })
      
      const data = await response.json()
      console.log('Payroll response:', data)
      
      if (data.success) {
        // Add new payroll record to the list
        const newRecord = {
          id: data.data.id,
          employeeId: data.data.employee_code,
          name: data.data.employee_name,
          position: data.data.position,
          department: data.data.payroll_type,
          payPeriod: `${data.data.pay_period_start} to ${data.data.pay_period_end}`,
          hoursWorked: parseFloat(data.data.working_days) * 8, // Assuming 8 hours per day, ensure numeric
          overtimeHours: parseFloat(data.data.overtime_hours) || 0,
          hourlyRate: parseFloat(data.data.hourly_rate) || 0,
          overtimeRate: parseFloat(data.data.hourly_rate) || 0,
          grossPay: parseFloat(data.data.gross_pay) || 0,
          deductions: {
            late: parseFloat(data.data.late_deduction) || 0,
            cashAdvance: parseFloat(data.data.cash_advance) || 0,
            others: parseFloat(data.data.others_deduction) || 0
          },
          netPay: parseFloat(data.data.net_pay) || 0,
          paymentDate: new Date().toISOString().split("T")[0],
          paymentMethod: "Pending",
          status: data.data.status,
          // Add daily attendance data
          dailyAttendance: data.data.daily_attendance || {},
          dailyOvertime: data.data.daily_overtime || {},
          dailyLate: data.data.daily_late || {}
        }

        setPayrollRecords(prev => [newRecord, ...prev])
        setIsProcessModalOpen(false)
        setSuccessAlert({
          isVisible: true,
          message: 'Payroll processed successfully!'
        })
      } else {
        console.error('Failed to process payroll:', data.message)
        alert(`Failed to process payroll: ${data.message}`)
      }
    } catch (error) {
      console.error('Error processing payroll:', error)
      alert(`Error processing payroll: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  // Handle view attendance
  const handleViewAttendance = useCallback((record) => {
    setSelectedRecord(record)
    setIsAttendanceModalOpen(true)
  }, [])

  // Filter records based on search and filters
  const filteredRecords = useMemo(() => {
    return payrollRecords.filter(record => {
      const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.position.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = selectedStatus === 'All' || record.status === selectedStatus
      const matchesDepartment = selectedDepartment === 'All' || record.department === selectedDepartment
      const matchesPaymentMethod = selectedPaymentMethod === 'All' || record.paymentMethod === selectedPaymentMethod
      
      return matchesSearch && matchesStatus && matchesDepartment && matchesPaymentMethod
    })
  }, [payrollRecords, searchTerm, selectedStatus, selectedDepartment, selectedPaymentMethod])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalRecords = filteredRecords.length
    const totalGrossPay = filteredRecords.reduce((sum, record) => sum + record.grossPay, 0)
    const totalNetPay = filteredRecords.reduce((sum, record) => sum + record.netPay, 0)
    const totalDeductions = filteredRecords.reduce((sum, record) => 
      sum + record.deductions.late + record.deductions.cashAdvance + record.deductions.others, 0)

    return {
      totalRecords,
      totalGrossPay,
      totalNetPay,
      totalDeductions
    }
  }, [filteredRecords])

  // Helper functions for original card styling
  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800 border-green-300'
      case 'Processing': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Pending': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'On Hold': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid': return CheckCircle
      case 'Processing': return Clock
      case 'Pending': return AlertCircle
      case 'On Hold': return AlertCircle
      default: return Clock
    }
  }

  // Original PayrollCard Component (preserved exactly as user wanted)
  const PayrollCard = ({ record, index }) => {
    const StatusIcon = getStatusIcon(record.status)
    const totalDeductions = (parseFloat(record.deductions.late) || 0) + (parseFloat(record.deductions.cashAdvance) || 0) + (parseFloat(record.deductions.others) || 0)
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ scale: 1.01 }}
        className="group"
      >
        <Card className="bg-white border-gray-200 hover:border-blue-500 transition-all duration-300 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{record.name}</h3>
                <p className="text-sm text-gray-700 mb-1">{record.position}</p>
                <p className="text-xs text-gray-500">{record.employeeId} • {record.department}</p>
              </div>
              <div className="flex items-center space-x-2">
                <StatusIcon className="h-4 w-4 text-blue-600" />
                <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(record.status)}`}>
                  {record.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-600">Pay Period:</span>
                  <p className="text-gray-900 text-xs">{record.payPeriod}</p>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Hours Worked:</span>
                  <p className="text-gray-900">{record.hoursWorked}h + {record.overtimeHours}h OT</p>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Hourly Rate:</span>
                  <p className="text-gray-900">₱{record.hourlyRate}/hr</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-600">Payment Date:</span>
                  <p className="text-gray-900">{record.paymentDate}</p>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Payment Method:</span>
                  <p className="text-gray-900">{record.paymentMethod}</p>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Overtime Rate:</span>
                  <p className="text-gray-900">₱{record.overtimeRate}/hr</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200 shadow-sm">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Gross Pay</p>
                  <p className="text-lg font-semibold text-blue-600">₱{(parseFloat(record.grossPay) || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Deductions</p>
                  <p className="text-lg font-semibold text-red-600">-₱{totalDeductions.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Net Pay</p>
                  <p className="text-lg font-semibold text-blue-600">₱{(parseFloat(record.netPay) || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Deduction Breakdown:</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white rounded p-2 text-center border border-gray-200 shadow-sm">
                  <p className="text-gray-600">Late</p>
                  <p className="text-red-600">₱{(parseFloat(record.deductions.late) || 0).toFixed(2)}</p>
                </div>
                <div className="bg-white rounded p-2 text-center border border-gray-200 shadow-sm">
                  <p className="text-gray-600">Cash Advance</p>
                  <p className="text-red-600">₱{(parseFloat(record.deductions.cashAdvance) || 0).toFixed(2)}</p>
                </div>
                <div className="bg-white rounded p-2 text-center border border-gray-200 shadow-sm">
                  <p className="text-gray-600">Others</p>
                  <p className="text-red-600">₱{(parseFloat(record.deductions.others) || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-600">
                <span>Total Days: {Math.round((parseFloat(record.hoursWorked) || 0) / 8)}</span>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                  onClick={() => handleViewAttendance(record)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-gray-600 hover:bg-gray-50 hover:text-gray-800">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50 hover:text-blue-800">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-primary">
              Workers' Payroll
            </h1>
            <p className="text-gray-600 mt-2">Monitor payroll records and payments</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
  {/* View Toggle Buttons with Smooth Transitions */}
  <div className="flex items-center relative bg-white border border-gray-200 rounded-lg p-1 overflow-hidden">
    {/* Animated Background */}
    <motion.div
      className="absolute top-1 left-1 bottom-1 rounded-md bg-primary"
      initial={false}
      animate={{
        x: viewMode === 'card' ? 0 : 40, // adjust to match button width + spacing
        width: 38, // match button width including padding (px-3)
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    />

    {/* Toggle Button - Card View */}
    <motion.button
      onClick={() => setViewMode('card')}
      className={`relative z-10 px-3 py-2 rounded-md transition-all duration-300 ${
        viewMode === 'card'
          ? 'text-white'
          : 'text-gray-600 hover:text-blue-600'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Grid3X3 className="h-4 w-4" />
    </motion.button>

    {/* Toggle Button - Table View */}
    <motion.button
      onClick={() => setViewMode('table')}
      className={`relative z-10 px-3 py-2 rounded-md transition-all duration-300 ${
        viewMode === 'table'
          ? 'text-white'
          : 'text-gray-600 hover:text-blue-600'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <List className="h-4 w-4" />
    </motion.button>
  </div>

  {/* Process Payroll Button */}
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <Button
      onClick={() => setIsProcessModalOpen(true)}
      className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300"
    >
      <Plus className="h-4 w-4 mr-2" />
      Process Payroll
    </Button>
  </motion.div>
</div>

        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'Total Records', amount: summaryStats.totalRecords, color: 'bg-primary', icon: Users, isDays: false, isCount: true },
            { title: 'Total Gross Pay', amount: summaryStats.totalGrossPay, color: 'bg-primary', icon: DollarSign },
            { title: 'Total Deductions', amount: summaryStats.totalDeductions, color: 'bg-primary', icon: Calculator },
            { title: 'Total Net Pay', amount: summaryStats.totalNetPay, color: 'bg-primary', icon: CreditCard }
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-white border-gray-200 hover:border-blue-500 transition-colors shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stat.isCount ? `${Number(stat.amount) || 0}` : `₱${(Number(stat.amount) || 0).toFixed(2)}`}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-white border-gray-200 shadow-md">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search payroll records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <CustomDropdown
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={statusOptions}
                  placeholder="Select Status"
                />

                <CustomDropdown
                  value={selectedDepartment}
                  onChange={setSelectedDepartment}
                  options={departmentOptions}
                  placeholder="Select Department"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payroll Records with Smooth View Transitions */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading payroll records...</span>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payroll records found</h3>
                <p className="text-gray-600">Start by processing your first payroll record.</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {viewMode === 'card' ? (
                  <motion.div
                    key="card-view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {filteredRecords.map((record, index) => (
                      <PayrollCard
                        key={record.id}
                        record={record}
                        index={index}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="table-view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-x-auto"
                  >
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Employee</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Department</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Pay Period</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Gross Pay</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Deductions</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Net Pay</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((record, index) => (
                          <motion.tr
                            key={record.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-3 px-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{record.name}</p>
                                <p className="text-xs text-gray-500">{record.employeeId} • {record.position}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                record.department === 'Site' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {record.department}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">{record.payPeriod}</td>
                            <td className="py-3 px-4 text-sm text-gray-900 text-right">₱{record.grossPay.toFixed(2)}</td>
                            <td className="py-3 px-4 text-sm text-red-600 text-right">
                              ₱{(record.deductions.late + record.deductions.cashAdvance + record.deductions.others).toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-green-600 text-right">₱{record.netPay.toFixed(2)}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                {record.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewAttendance(record)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ProcessPayrollModal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        onSubmit={handleProcessPayroll}
        isSubmitting={isSubmitting}
      />

      <AttendanceDetailModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        record={selectedRecord}
      />

      {/* Success Alert */}
      <SuccessAlert
        message={successAlert.message}
        isVisible={successAlert.isVisible}
        onClose={() => setSuccessAlert({ isVisible: false, message: '' })}
      />
    </div>
  )
}

export default WorkersPayroll

