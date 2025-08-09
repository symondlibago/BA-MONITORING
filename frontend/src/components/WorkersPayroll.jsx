import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  DollarSign, 
  Users, 
  Clock,
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

// Delete Confirmation Modal
const DeleteConfirmationModal = React.memo(({ isOpen, onClose, onConfirm, record, isDeleting }) => {
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
          className="bg-white rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 rounded-full mr-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Payroll Record</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete the payroll record for{' '}
                <span className="font-semibold">{record.employee_name}</span>?
              </p>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Pay Period: {record.pay_period_start} to {record.pay_period_end}
                </p>
                <p className="text-sm text-gray-600">
                  Net Pay: ₱{parseFloat(record.net_pay || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

// Update Payroll Modal
const UpdatePayrollModal = React.memo(({ isOpen, onClose, record, onUpdate, isUpdating }) => {
  const [formData, setFormData] = useState({
    status: '',
    cash_advance: '',
    others_deduction: ''
  })

  useEffect(() => {
    if (isOpen && record) {
      setFormData({
        status: record.status || 'Pending',
        cash_advance: record.cash_advance || '',
        others_deduction: record.others_deduction || ''
      })
    }
  }, [isOpen, record])

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleSubmit = useCallback(() => {
    onUpdate(record.id, formData)
  }, [record, formData, onUpdate])

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
          className="bg-white rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Update Payroll Record
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Employee</p>
                <p className="font-medium">{record.employee_name}</p>
                <p className="text-xs text-gray-500">{record.employee_code} • {record.position}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                  disabled={isUpdating}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Paid">Paid</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cash Advance
                </label>
                <input
                  type="number"
                  value={formData.cash_advance}
                  onChange={(e) => handleInputChange('cash_advance', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Others Deduction
                </label>
                <input
                  type="number"
                  value={formData.others_deduction}
                  onChange={(e) => handleInputChange('others_deduction', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={isUpdating}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

// Attendance Detail Modal
const AttendanceDetailModal = React.memo(({ isOpen, onClose, record }) => {
  const [attendanceData, setAttendanceData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Attendance Details - {record.employee_name}
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
                              {day.present && day.site_address ? day.site_address : '-'}
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
  
  // ECA/ED state
  const [ecaEdData, setEcaEdData] = useState(null)
  const [loadingEcaEd, setLoadingEcaEd] = useState(false)
  const [ecaEdError, setEcaEdError] = useState('')
  
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
    emergencyCashAdvance: '',
    emergencyDeduction: '',
    othersDeduction: ''
  })

  // Reset modal when opened/closed
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setPayrollType('')
      setSelectedEmployee('')
      setEmployees([])
      setEmployeeError('')
      setEcaEdData(null)
      setEcaEdError('')
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
        emergencyCashAdvance: '',
        emergencyDeduction: '',
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
        setEmployeeError(data.message || `Failed to fetch ${status} employees`)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployeeError(`Failed to fetch ${status} employees. Please check your connection.`)
    } finally {
      setLoadingEmployees(false)
    }
  }, [])

  // Fetch employee ECA/ED data
  const fetchEmployeeEcaEd = useCallback(async (employeeId) => {
    try {
      setLoadingEcaEd(true)
      setEcaEdError('')
      
      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/eca-ed`)
      const data = await response.json()
      
      if (data.success) {
        setEcaEdData(data.data)
        
        // Auto-fill cash advance if ED exists
        if (data.data.ed && data.data.ed.amount) {
          setFormData(prev => ({
            ...prev,
            cashAdvance: data.data.ed.amount.toString()
          }))
        }
      } else {
        setEcaEdError(data.message || 'Failed to fetch ECA/ED data')
      }
    } catch (error) {
      console.error('Error fetching ECA/ED data:', error)
      setEcaEdError('Failed to fetch ECA/ED data')
    } finally {
      setLoadingEcaEd(false)
    }
  }, [])

  // Handle payroll type selection
  const handlePayrollTypeSelect = useCallback((type) => {
    setPayrollType(type)
    setStep(2)
    fetchEmployeesByStatus(type)
  }, [fetchEmployeesByStatus])

  // Handle employee selection
  const handleEmployeeSelect = useCallback((employeeId) => {
    setSelectedEmployee(employeeId)
    if (employeeId) {
      fetchEmployeeEcaEd(employeeId)
    } else {
      setEcaEdData(null)
      setFormData(prev => ({
        ...prev,
        cashAdvance: ''
      }))
    }
  }, [fetchEmployeeEcaEd])

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
        netPay: 0,
        deductionBreakdown: {
          lateDeduction: 0,
          cashAdvance: 0,
          emergencyCashAdvance: 0,
          emergencyDeduction: 0,
          othersDeduction: 0
        }
      }
    }

    const workingDaysCount = Object.values(formData.workingDays).filter(Boolean).length
    const totalOT = Object.values(formData.overtime).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
    const totalLate = Object.values(formData.late).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
    
    const dailyRate = parseFloat(selectedEmp.rate) || 0
    const hourlyRate = parseFloat(selectedEmp.hourly_rate) || 0
    const cashAdvance = parseFloat(formData.cashAdvance) || 0
    const emergencyCashAdvance = parseFloat(formData.emergencyCashAdvance) || 0
    const emergencyDeduction = parseFloat(formData.emergencyDeduction) || 0
    const othersDeduction = parseFloat(formData.othersDeduction) || 0

    // Basic salary calculation
    const basicSalary = workingDaysCount * dailyRate
    const overtimePay = totalOT * hourlyRate
    const lateDeduction = (totalLate / 60) * hourlyRate
    const grossPay = basicSalary + overtimePay
    // Deduction breakdown
    const deductionBreakdown = {
      lateDeduction: lateDeduction,
      cashAdvance: cashAdvance,
      emergencyCashAdvance: emergencyCashAdvance,
      emergencyDeduction: emergencyDeduction,
      othersDeduction: othersDeduction
    }

    // Total deductions
    const totalDeductions = lateDeduction + cashAdvance + emergencyCashAdvance + emergencyDeduction + othersDeduction

    // Net pay
    const netPay = grossPay - totalDeductions

    return {
      workingDaysCount,
      totalOT: totalOT.toFixed(1),
      totalLate: totalLate.toFixed(0),
      basicSalary: basicSalary.toFixed(2),
      overtimePay: overtimePay.toFixed(2),
      lateDeduction: lateDeduction.toFixed(2),
      grossPay: grossPay.toFixed(2),
      totalDeductions: totalDeductions.toFixed(2),
      netPay: netPay.toFixed(2),
      deductionBreakdown: {
        lateDeduction: lateDeduction.toFixed(2),
        cashAdvance: cashAdvance.toFixed(2),
        emergencyCashAdvance: emergencyCashAdvance.toFixed(2),
        emergencyDeduction: emergencyDeduction.toFixed(2),
        othersDeduction: othersDeduction.toFixed(2)
      }
    }
  }, [selectedEmployee, employees, formData])

  // Handle input changes
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
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }, [])

  // Handle checkbox changes for working days
  const handleCheckboxChange = useCallback((day) => {
    setFormData(prev => ({
      ...prev,
      workingDays: {
        ...prev.workingDays,
        [day]: !prev.workingDays[day]
      }
    }))
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
      emergency_cash_advance: parseFloat(formData.emergencyCashAdvance) || 0,
      emergency_deduction: parseFloat(formData.emergencyDeduction) || 0,
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

  // Check if ECA/ED fields should be readonly
  const isEcaEdReadonly = ecaEdData?.is_readonly || false

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
          className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
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
                      onChange={handleEmployeeSelect}
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

                {/* ECA/ED Information Display */}
                {selectedEmployee && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Cash Advance & Deduction Status</h3>
                    
                    {loadingEcaEd && (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
                        <span className="text-gray-600">Loading ECA/ED data...</span>
                      </div>
                    )}

                    {ecaEdError && (
                      <div className="text-red-600 text-sm">{ecaEdError}</div>
                    )}

                    {ecaEdData && !loadingEcaEd && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ecaEdData.has_active_eca ? (
                          <div className="bg-white rounded-lg p-3 border">
                            <h4 className="font-medium text-gray-900 mb-2">Active Emergency Cash Advance</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-gray-600">Original Amount:</span> ₱{parseFloat(ecaEdData.eca.amount).toFixed(2)}</p>
                              <p><span className="text-gray-600">Remaining Balance:</span> ₱{parseFloat(ecaEdData.eca.remaining_balance).toFixed(2)}</p>
                              <p><span className="text-gray-600">Status:</span> 
                                <span className="ml-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                                  {ecaEdData.eca.status}
                                </span>
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white rounded-lg p-3 border">
                            <h4 className="font-medium text-gray-900 mb-2">Emergency Cash Advance</h4>
                            <p className="text-sm text-gray-600">No active ECA found</p>
                          </div>
                        )}

                        {ecaEdData.has_active_ed ? (
                          <div className="bg-white rounded-lg p-3 border">
                            <h4 className="font-medium text-gray-900 mb-2">Active Emergency Deduction</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-gray-600">Deduction Amount:</span> ₱{parseFloat(ecaEdData.ed.amount).toFixed(2)}</p>
                              <p><span className="text-gray-600">Status:</span> 
                                <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  {ecaEdData.ed.status}
                                </span>
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white rounded-lg p-3 border">
                            <h4 className="font-medium text-gray-900 mb-2">Emergency Deduction</h4>
                            <p className="text-sm text-gray-600">No active ED found</p>
                          </div>
                        )}
                      </div>
                    )}

                    {isEcaEdReadonly && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800">
                          <AlertCircle className="h-4 w-4 inline mr-1" />
                          ECA/ED fields are readonly until the emergency cash advance is fully paid.
                        </p>
                      </div>
                    )}
                  </div>
                )}

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
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    disabled={isSubmitting}
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="number"
                                    value={formData.overtime[day]}
                                    onChange={(e) => handleInputChange(`overtime.${day}`, e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
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
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
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
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                                    placeholder="Site address"
                                    disabled={isSubmitting || !formData.workingDays[day]}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Summary Row */}
                      <div className="mt-4 bg-blue-50 rounded-lg p-3">
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-xs text-gray-600">Working Days</p>
                            <p className="text-lg font-semibold text-blue-600">{calculations.workingDaysCount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Total OT</p>
                            <p className="text-lg font-semibold text-green-600">{calculations.totalOT}h</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Total Late</p>
                            <p className="text-lg font-semibold text-red-600">{calculations.totalLate} mins</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Basic Salary</p>
                            <p className="text-lg font-semibold text-purple-600">₱{calculations.basicSalary}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Deductions Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Deductions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cash Advance
                          </label>
                          <input
                            type="number"
                            value={formData.cashAdvance}
                            onChange={(e) => handleInputChange('cashAdvance', e.target.value)}
                            className={`w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none ${
                              isEcaEdReadonly ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            disabled={isSubmitting || isEcaEdReadonly}
                          />
                          {isEcaEdReadonly && (
                            <p className="text-xs text-gray-500 mt-1">
                              Readonly - Employee has active ECA
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Emergency Cash Advance
                          </label>
                          <input
                            type="number"
                            value={formData.emergencyCashAdvance}
                            onChange={(e) => handleInputChange('emergencyCashAdvance', e.target.value)}
                            className={`w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none ${
                              isEcaEdReadonly ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            disabled={isSubmitting || isEcaEdReadonly}
                          />
                          {isEcaEdReadonly && (
                            <p className="text-xs text-gray-500 mt-1">
                              Readonly - Employee has active ECA
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Emergency Deduction
                          </label>
                          <input
                            type="number"
                            value={formData.emergencyDeduction}
                            onChange={(e) => handleInputChange('emergencyDeduction', e.target.value)}
                            className={`w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none ${
                              isEcaEdReadonly ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            disabled={isSubmitting || isEcaEdReadonly}
                          />
                          {isEcaEdReadonly && (
                            <p className="text-xs text-gray-500 mt-1">
                              Readonly - Employee has active ED
                            </p>
                          )}
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

                      {/* Detailed Deduction Breakdown */}
                      <div className="mt-4 bg-white rounded-lg p-4 border">
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Detailed Deduction Breakdown</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                          <div className="bg-red-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Late Deduction</p>
                            <p className="text-sm font-semibold text-red-600">₱{calculations.deductionBreakdown.lateDeduction}</p>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Cash Advance</p>
                            <p className="text-sm font-semibold text-orange-600">₱{calculations.deductionBreakdown.cashAdvance}</p>
                          </div>
                          <div className="bg-yellow-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Emergency CA</p>
                            <p className="text-sm font-semibold text-yellow-600">₱{calculations.deductionBreakdown.emergencyCashAdvance}</p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Emergency Ded.</p>
                            <p className="text-sm font-semibold text-purple-600">₱{calculations.deductionBreakdown.emergencyDeduction}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Others</p>
                            <p className="text-sm font-semibold text-gray-600">₱{calculations.deductionBreakdown.othersDeduction}</p>
                          </div>
                        </div>
                      </div>

                      {/* Final Summary */}
                      <div className="bg-green-50 rounded-lg p-4 mt-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Summary</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Basic Salary:</span>
                            <span className="font-medium">₱{calculations.basicSalary}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Overtime Pay:</span>
                            <span className="font-medium text-green-600">₱{calculations.overtimePay}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Gross Pay:</span>
                            <span className="font-medium">₱{calculations.grossPay}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Deductions:</span>
                            <span className="font-medium text-red-600">₱{calculations.totalDeductions}</span>
                          </div>
                          <div className="border-t pt-2">
                            <div className="flex justify-between text-xl font-bold">
                              <span>Net Pay:</span>
                              <span className="text-green-600">₱{calculations.netPay}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-6 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        disabled={isSubmitting}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedEmployee || !formData.payPeriodStart || !formData.payPeriodEnd}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Calculator className="h-4 w-4 mr-2" />
                            Process Payroll
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

// Main WorkersPayroll Component
const WorkersPayroll = () => {
  const [payrollRecords, setPayrollRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [groupFilter, setGroupFilter] = useState('All')
  const [viewMode, setViewMode] = useState('card')
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  // Fetch payroll records
  const fetchPayrollRecords = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`${API_BASE_URL}/payrolls`)
      const data = await response.json()
      
      if (data.success) {
        setPayrollRecords(data.data || [])
      } else {
        setError(data.message || 'Failed to fetch payroll records')
      }
    } catch (error) {
      console.error('Error fetching payroll records:', error)
      setError('Failed to fetch payroll records. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load data on component mount
  useEffect(() => {
    fetchPayrollRecords()
  }, [fetchPayrollRecords])

  // Handle payroll submission
  const handlePayrollSubmit = useCallback(async (payrollData) => {
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
      console.log('Response:', data)
      
      if (data.success) {
        setSuccessMessage('Payroll processed successfully!')
        setShowSuccessAlert(true)
        setShowProcessModal(false)
        fetchPayrollRecords() // Refresh the list
      } else {
        setError(data.message || 'Failed to process payroll')
      }
    } catch (error) {
      console.error('Error processing payroll:', error)
      setError('Failed to process payroll. Please check your connection.')
    } finally {
      setIsSubmitting(false)
    }
  }, [fetchPayrollRecords])

  // Handle record update
  const handleUpdateRecord = useCallback(async (recordId, updateData) => {
    try {
      setIsUpdating(true)
      
      const response = await fetch(`${API_BASE_URL}/payrolls/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage('Payroll record updated successfully!')
        setShowSuccessAlert(true)
        setShowUpdateModal(false)
        fetchPayrollRecords() // Refresh the list
      } else {
        setError(data.message || 'Failed to update record')
      }
    } catch (error) {
      console.error('Error updating record:', error)
      setError('Failed to update record. Please check your connection.')
    } finally {
      setIsUpdating(false)
    }
  }, [fetchPayrollRecords])

  // Handle record deletion
  const handleDeleteRecord = useCallback(async () => {
    if (!selectedRecord) return

    try {
      setIsDeleting(true)
      
      const response = await fetch(`${API_BASE_URL}/payrolls/${selectedRecord.id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage('Payroll record deleted successfully!')
        setShowSuccessAlert(true)
        setShowDeleteModal(false)
        setSelectedRecord(null)
        fetchPayrollRecords() // Refresh the list
      } else {
        setError(data.message || 'Failed to delete record')
      }
    } catch (error) {
      console.error('Error deleting record:', error)
      setError('Failed to delete record. Please check your connection.')
    } finally {
      setIsDeleting(false)
    }
  }, [selectedRecord, fetchPayrollRecords])

  const filteredRecords = useMemo(() => {
  const lowercasedSearchTerm = searchTerm.toLowerCase();

  return payrollRecords.filter(record => {
    const matchesSearch = searchTerm.trim() === '' ? true : (
         (record.employee_name || '').toLowerCase().includes(lowercasedSearchTerm) ||
         (record.employee_code || '').toLowerCase().includes(lowercasedSearchTerm) ||
         (record.position || '').toLowerCase().includes(lowercasedSearchTerm) ||
         (record.pay_period_start || '').toLowerCase().includes(lowercasedSearchTerm) ||
         (record.pay_period_end || '').toLowerCase().includes(lowercasedSearchTerm)
    );
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || record.payroll_type === departmentFilter;
    const matchesGroup = groupFilter === 'all' || record.employee_group === groupFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesGroup;
  });
}, [payrollRecords, searchTerm, statusFilter, departmentFilter, groupFilter]);

  const summaryStats = useMemo(() => {
    const totalRecords = filteredRecords.length;
    const totalGrossPay = filteredRecords.reduce((sum, record) => sum + parseFloat(record.gross_pay || 0), 0); 
    const totalDeductions = filteredRecords.reduce((sum, record) => sum + parseFloat(record.total_deductions || 0), 0); 
    const totalNetPay = filteredRecords.reduce((sum, record) => sum + parseFloat(record.net_pay || 0), 0); 
    
    return {
      totalRecords,
      totalGrossPay,
      totalDeductions,
      totalNetPay
    }
  }, [filteredRecords]);

  const groups = [...new Set(payrollRecords.map(record => record.employee_group).filter(Boolean))]


  // Status options for dropdown
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Paid', label: 'Paid' },
    { value: 'On Hold', label: 'On Hold' }
  ]

  // Department options for dropdown
  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'Site', label: 'Site' },
    { value: 'Office', label: 'Office' }
  ]
  const groupOptions = [
    { value: 'all', label: 'All Groups' },
    ...groups.map(group => ({ value: group, label: group }))
  ]

  // Status badge component
  const StatusBadge = React.memo(({ status }) => {
    const statusConfig = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      'Processing': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Loader2 },
      'Paid': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'On Hold': { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle }
    }
    
    const config = statusConfig[status] || statusConfig['Pending']
    const IconComponent = config.icon
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {status}
      </span>
    )
  })

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
            <h1 className="text-4xl font-bold text-gray-900">
              Workers' Payroll
            </h1>
            <p className="text-gray-600 mt-2">Monitor payroll records and payments</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            {/* View Toggle Buttons with Smooth Transitions */}
            <div className="flex items-center relative bg-white border border-gray-200 rounded-lg p-1 overflow-hidden">
              {/* Animated Background */}
              <motion.div
                className="absolute top-1 left-1 bottom-1 rounded-md bg-blue-600"
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
                onClick={() => setShowProcessModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
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
            { title: 'Total Records', amount: summaryStats.totalRecords, color: 'bg-blue-600', icon: Users, isDays: false, isCount: true },
            { title: 'Total Gross Pay', amount: summaryStats.totalGrossPay, color: 'bg-blue-600', icon: DollarSign },
            { title: 'Total Deductions', amount: summaryStats.totalDeductions, color: 'bg-blue-600', icon: Calculator },
            { title: 'Total Net Pay', amount: summaryStats.totalNetPay, color: 'bg-blue-600', icon: CreditCard }
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
                      <div className={`p-3 rounded-lg ${stat.color}`}>
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
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 h-4 w-4" />
          <input
            type="text"
            placeholder="Search payroll records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="w-[160px]">
          <CustomDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="All Status"
          />
        </div>

        {/* Department Filter (now fixed width) */}
        <div className="w-[190px]">
          <CustomDropdown
            value={departmentFilter}
            onChange={setDepartmentFilter}
            options={departmentOptions}
            placeholder="All Departments"
          />
        </div>

        {/* Group Filter */}
        <div className="w-[160px]">
        <CustomDropdown
                    value={groupFilter}
                    onChange={setGroupFilter}
                    options={groupOptions}
                    placeholder="All Groups"
                  />
        </div>
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
                      <motion.div
                        key={record.id}
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
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{record.employee_name}</h3>
                                <p className="text-sm text-gray-700 mb-1">{record.position}</p>
                                <p className="text-xs text-gray-500">{record.employee_code} • {record.payroll_type}</p>
                              </div>
                              <StatusBadge status={record.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <div className="text-sm">
                                  <span className="text-gray-600">Pay Period:</span>
                                  <p className="text-gray-900 text-xs">{record.pay_period_start} to {record.pay_period_end}</p>
                                </div>
                                <div className="text-sm">
                                  <span className="text-gray-600">Working Days:</span>
                                  <p className="text-gray-900">{record.working_days}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm">
                                  <span className="text-gray-600">Overtime:</span>
                                  <p className="text-gray-900">{record.overtime_hours}h</p>
                                </div>
                                <div className="text-sm">
                                  <span className="text-gray-600">Late:</span>
                                  <p className="text-gray-900">{record.late_minutes} mins</p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Gross Pay</p>
                                  <p className="text-lg font-semibold text-blue-600">₱{(parseFloat(record.gross_pay) || 0).toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Deductions</p>
                                  <p className="text-lg font-semibold text-red-600">-₱{(parseFloat(record.total_deductions) || 0).toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Net Pay</p>
                                  <p className="text-lg font-semibold text-green-600">₱{(parseFloat(record.net_pay) || 0).toFixed(2)}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRecord(record)
                                    setShowAttendanceModal(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRecord(record)
                                    setShowUpdateModal(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRecord(record)
                                    setShowDeleteModal(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
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
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Group</th>
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
                                <p className="text-sm font-medium text-gray-900">{record.employee_group}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{record.employee_name}</p>
                                <p className="text-xs text-gray-500">{record.employee_code} • {record.position}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                record.payroll_type === 'Site' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {record.payroll_type}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">{record.pay_period_start} to {record.pay_period_end}</td>
                            <td className="py-3 px-4 text-sm text-gray-900 text-right">₱{(parseFloat(record.gross_pay) || 0).toFixed(2)}</td>
                            <td className="py-3 px-4 text-sm text-red-600 text-right">
                              ₱{(parseFloat(record.total_deductions) || 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-green-600 text-right">₱{(parseFloat(record.net_pay) || 0).toFixed(2)}</td>
                            <td className="py-3 px-4 text-center">
                              <StatusBadge status={record.status} />
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRecord(record)
                                    setShowAttendanceModal(true)
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRecord(record)
                                    setShowUpdateModal(true)
                                  }}
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRecord(record)
                                    setShowDeleteModal(true)
                                  }}
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
        isOpen={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        onSubmit={handlePayrollSubmit}
        isSubmitting={isSubmitting}
      />

      <AttendanceDetailModal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        record={selectedRecord}
      />

      <UpdatePayrollModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        record={selectedRecord}
        onUpdate={handleUpdateRecord}
        isUpdating={isUpdating}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteRecord}
        record={selectedRecord}
        isDeleting={isDeleting}
      />

      {/* Success Alert */}
      <SuccessAlert
        message={successMessage}
        isVisible={showSuccessAlert}
        onClose={() => setShowSuccessAlert(false)}
      />
    </div>
  )
}

export default WorkersPayroll

