import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'
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
  List,
  Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import * as XLSX from 'xlsx'
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

// Enhanced Update Payroll Modal - Now matches ProcessPayrollModal structure
const UpdatePayrollModal = React.memo(({ isOpen, onClose, record, onUpdate, isUpdating }) => {
  const [formData, setFormData] = useState({
    status: '',
    payPeriodStart: '',
    payPeriodEnd: '',
    // Site payroll fields
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
    // Office payroll fields
    totalWorkingDays: '',
    totalLateMinutes: '',
    totalOvertimeHours: '',
    // Common fields
    cashAdvance: '',
    othersDeduction: ''
  })

  useEffect(() => {
    if (isOpen && record) {
      // Determine if this is a site or office payroll based on available fields
      const isSitePayroll = record.daily_attendance !== undefined
      
      // Parse daily attendance, overtime, late, and site address if available
      let dailyAttendance = {}
      let dailyOvertime = {}
      let dailyLate = {}
      let dailySiteAddress = {}
      
      if (isSitePayroll) {
        try {
          dailyAttendance = typeof record.daily_attendance === 'string' 
            ? JSON.parse(record.daily_attendance) 
            : record.daily_attendance || {}
          dailyOvertime = typeof record.daily_overtime === 'string' 
            ? JSON.parse(record.daily_overtime) 
            : record.daily_overtime || {}
          dailyLate = typeof record.daily_late === 'string' 
            ? JSON.parse(record.daily_late) 
            : record.daily_late || {}
          dailySiteAddress = typeof record.daily_site_address === 'string' 
            ? JSON.parse(record.daily_site_address) 
            : record.daily_site_address || {}
        } catch (e) {
          console.error('Error parsing daily data:', e)
        }
      }

      setFormData({
        status: record.status || 'Pending',
        payPeriodStart: record.pay_period_start || '',
        payPeriodEnd: record.pay_period_end || '',
        // Site payroll fields
        workingDays: {
          monday: dailyAttendance.monday || false,
          tuesday: dailyAttendance.tuesday || false,
          wednesday: dailyAttendance.wednesday || false,
          thursday: dailyAttendance.thursday || false,
          friday: dailyAttendance.friday || false,
          saturday: dailyAttendance.saturday || false
        },
        overtime: {
          monday: dailyOvertime.monday || '',
          tuesday: dailyOvertime.tuesday || '',
          wednesday: dailyOvertime.wednesday || '',
          thursday: dailyOvertime.thursday || '',
          friday: dailyOvertime.friday || '',
          saturday: dailyOvertime.saturday || ''
        },
        late: {
          monday: dailyLate.monday || '',
          tuesday: dailyLate.tuesday || '',
          wednesday: dailyLate.wednesday || '',
          thursday: dailyLate.thursday || '',
          friday: dailyLate.friday || '',
          saturday: dailyLate.saturday || ''
        },
        siteAddress: {
          monday: dailySiteAddress.monday || '',
          tuesday: dailySiteAddress.tuesday || '',
          wednesday: dailySiteAddress.wednesday || '',
          thursday: dailySiteAddress.thursday || '',
          friday: dailySiteAddress.friday || '',
          saturday: dailySiteAddress.saturday || ''
        },
        // Office payroll fields
        totalWorkingDays: record.total_working_days || record.working_days || '',
        totalLateMinutes: record.total_late_minutes || record.late_minutes || '',
        totalOvertimeHours: record.total_overtime_hours || record.overtime_hours || '',
        // Common fields
        cashAdvance: record.cash_advance || '',
        othersDeduction: record.others_deduction || ''
      })
    }
  }, [isOpen, record])

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

  const handleCheckboxChange = useCallback((day) => {
    setFormData(prev => ({
      ...prev,
      workingDays: {
        ...prev.workingDays,
        [day]: !prev.workingDays[day]
      }
    }))
  }, [])

  // Calculate totals for site payroll
  const calculations = useMemo(() => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const workingDaysCount = days.filter(day => formData.workingDays[day]).length
    const totalOT = days.reduce((sum, day) => sum + (parseFloat(formData.overtime[day]) || 0), 0)
    const totalLate = days.reduce((sum, day) => sum + (parseFloat(formData.late[day]) || 0), 0)
    
    return {
      workingDaysCount,
      totalOT: totalOT.toFixed(1),
      totalLate: totalLate.toFixed(0)
    }
  }, [formData])

  const handleSubmit = useCallback(() => {
    // Determine if this is a site or office payroll
    const isSitePayroll = record.daily_attendance !== undefined
    
    let updateData = {
      status: formData.status,
      pay_period_start: formData.payPeriodStart,
      pay_period_end: formData.payPeriodEnd,
      cash_advance: parseFloat(formData.cashAdvance) || 0,
      others_deduction: parseFloat(formData.othersDeduction) || 0
    }

    if (isSitePayroll) {
      // Site payroll update data
      updateData = {
        ...updateData,
        working_days: calculations.workingDaysCount,
        overtime_hours: parseFloat(calculations.totalOT),
        late_minutes: parseFloat(calculations.totalLate),
        daily_attendance: formData.workingDays,
        daily_overtime: formData.overtime,
        daily_late: formData.late,
        daily_site_address: formData.siteAddress
      }
    } else {
      // Office payroll update data
      updateData = {
        ...updateData,
        total_working_days: parseInt(formData.totalWorkingDays) || 0,
        total_late_minutes: parseFloat(formData.totalLateMinutes) || 0,
        total_overtime_hours: parseFloat(formData.totalOvertimeHours) || 0
      }
    }

    onUpdate(record.id, updateData)
  }, [record, formData, calculations, onUpdate])

  if (!isOpen || !record) return null

  // Determine if this is a site or office payroll
  const isSitePayroll = record.daily_attendance !== undefined
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

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
                Update {isSitePayroll ? 'Site' : 'Office'} Payroll Record
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Employee Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Employee Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Employee Name</p>
                    <p className="font-medium">{record.employee_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Employee Code</p>
                    <p className="font-medium">{record.employee_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Position</p>
                    <p className="font-medium">{record.position}</p>
                  </div>
                </div>
              </div>

              {/* Status and Pay Period */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      Pay Period Start
                    </label>
                    <input
                      type="date"
                      value={formData.payPeriodStart}
                      onChange={(e) => handleInputChange('payPeriodStart', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                      disabled={isUpdating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pay Period End
                    </label>
                    <input
                      type="date"
                      value={formData.payPeriodEnd}
                      onChange={(e) => handleInputChange('payPeriodEnd', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              </div>

              {/* Attendance Section - Different for Site vs Office */}
              {isSitePayroll ? (
                // Site Payroll - Daily Attendance Grid
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
                                disabled={isUpdating}
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
                                disabled={isUpdating || !formData.workingDays[day]}
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
                                disabled={isUpdating || !formData.workingDays[day]}
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={formData.siteAddress[day]}
                                onChange={(e) => handleInputChange(`siteAddress.${day}`, e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                                placeholder="Site address"
                                disabled={isUpdating || !formData.workingDays[day]}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Row */}
                  <div className="mt-4 bg-blue-50 rounded-lg p-3">
                    <div className="grid grid-cols-3 gap-4 text-center">
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
                    </div>
                  </div>
                </div>
              ) : (
                // Office Payroll - Total Input Fields
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Office Attendance Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Working Days
                      </label>
                      <input
                        type="number"
                        value={formData.totalWorkingDays}
                        onChange={(e) => handleInputChange('totalWorkingDays', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                        placeholder="0"
                        min="0"
                        max="31"
                        disabled={isUpdating}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Late (minutes)
                      </label>
                      <input
                        type="number"
                        value={formData.totalLateMinutes}
                        onChange={(e) => handleInputChange('totalLateMinutes', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                        placeholder="0"
                        min="0"
                        step="0.01"
                        disabled={isUpdating}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Overtime (hours)
                      </label>
                      <input
                        type="number"
                        value={formData.totalOvertimeHours}
                        onChange={(e) => handleInputChange('totalOvertimeHours', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                        placeholder="0"
                        min="0"
                        step="0.01"
                        disabled={isUpdating}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Deductions Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Deductions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      disabled={isUpdating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Others Deduction
                    </label>
                    <input
                      type="number"
                      value={formData.othersDeduction}
                      onChange={(e) => handleInputChange('othersDeduction', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      disabled={isUpdating}
                    />
                  </div>
                </div>
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
    // Site payroll fields
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
    // Office payroll fields
    totalWorkingDays: '',
    totalLateMinutes: '',
    totalOvertimeHours: '',
    // Common fields
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
        totalWorkingDays: '',
        totalLateMinutes: '',
        totalOvertimeHours: '',
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
      
      const response = await fetch(`${API_BASE_URL}/employees/status/${status}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setEmployees(data.data || [])
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

  // Fetch ECA/ED data for selected employee
  const fetchEcaEdData = useCallback(async (employeeId) => {
    try {
      setLoadingEcaEd(true)
      setEcaEdError('')
      
      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/eca-ed`)
      const data = await response.json()
      
      if (data.success) {
        setEcaEdData(data.data)
        
        // Auto-fill cash advance if there's an active ED
        if (data.data.has_active_ed && data.data.ed) {
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
    fetchEmployeesByStatus(type)
    setStep(2)
  }, [fetchEmployeesByStatus])

  // Handle employee selection
  const handleEmployeeSelect = useCallback((employeeId) => {
    setSelectedEmployee(employeeId)
    if (employeeId) {
      fetchEcaEdData(employeeId)
    } else {
      setEcaEdData(null)
    }
  }, [fetchEcaEdData])

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

  // Handle checkbox changes for site payroll
  const handleCheckboxChange = useCallback((day) => {
    setFormData(prev => ({
      ...prev,
      workingDays: {
        ...prev.workingDays,
        [day]: !prev.workingDays[day]
      }
    }))
  }, [])

  // Calculate totals for site payroll
  const calculations = useMemo(() => {
    if (payrollType !== 'Site') return { workingDaysCount: 0, totalOT: 0, totalLate: 0, basicSalary: '0.00' }
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const workingDaysCount = days.filter(day => formData.workingDays[day]).length
    const totalOT = days.reduce((sum, day) => sum + (parseFloat(formData.overtime[day]) || 0), 0)
    const totalLate = days.reduce((sum, day) => sum + (parseFloat(formData.late[day]) || 0), 0)
    
    const selectedEmp = employees.find(emp => emp.id.toString() === selectedEmployee)
    const dailyRate = selectedEmp ? parseFloat(selectedEmp.rate) : 0
    const basicSalary = (dailyRate * workingDaysCount).toFixed(2)
    
    return {
      workingDaysCount,
      totalOT: totalOT.toFixed(1),
      totalLate: totalLate.toFixed(0),
      basicSalary
    }
  }, [formData, selectedEmployee, employees, payrollType])

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    try {
      const selectedEmp = employees.find(emp => emp.id.toString() === selectedEmployee)
      if (!selectedEmp) return

      let submitData
      
      if (payrollType === 'Site') {
        // Site payroll submission
        submitData = {
          employee_id: selectedEmployee,
          payroll_type: payrollType,
          pay_period_start: formData.payPeriodStart,
          pay_period_end: formData.payPeriodEnd,
          working_days: calculations.workingDaysCount,
          overtime_hours: parseFloat(calculations.totalOT),
          late_minutes: parseFloat(calculations.totalLate),
          cash_advance: parseFloat(formData.cashAdvance) || 0,
          others_deduction: parseFloat(formData.othersDeduction) || 0,
          emergency_cash_advance: parseFloat(formData.emergencyCashAdvance) || 0,
          emergency_deduction: parseFloat(formData.emergencyDeduction) || 0,
          daily_attendance: formData.workingDays,
          daily_overtime: formData.overtime,
          daily_late: formData.late,
          daily_site_address: formData.siteAddress
        }
        
        await onSubmit(submitData, 'payrolls')
      } else {
        // Office payroll submission
        submitData = {
          employee_id: selectedEmployee,
          pay_period_start: formData.payPeriodStart,
          pay_period_end: formData.payPeriodEnd,
          total_working_days: parseInt(formData.totalWorkingDays) || 0,
          total_late_minutes: parseFloat(formData.totalLateMinutes) || 0,
          total_overtime_hours: parseFloat(formData.totalOvertimeHours) || 0,
          cash_advance: parseFloat(formData.cashAdvance) || 0,
          others_deduction: parseFloat(formData.othersDeduction) || 0,
          emergency_cash_advance: parseFloat(formData.emergencyCashAdvance) || 0,
          emergency_deduction: parseFloat(formData.emergencyDeduction) || 0
        }
        
        await onSubmit(submitData, 'office-payrolls')
      }
    } catch (error) {
      console.error('Error submitting payroll:', error)
    }
  }, [formData, selectedEmployee, employees, payrollType, calculations, onSubmit])

  const isEcaEdReadonly = ecaEdData?.is_readonly || false
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  if (!isOpen) return null

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
                {step === 1 ? 'Select Payroll Type' : `Process ${payrollType} Payroll`}
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {step === 1 && (
              <div className="space-y-6">
                <p className="text-gray-600">Choose the type of payroll you want to process:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePayrollTypeSelect('Site')}
                    className="p-6 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-orange-100 rounded-lg mr-4">
                        <HardHat className="h-8 w-8 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Site Payroll</h3>
                        <p className="text-gray-600">For site employees with daily attendance</p>
                      </div>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Daily attendance tracking (Monday-Saturday)</li>
                      <li>• Overtime and late tracking per day</li>
                      <li>• Site address recording</li>
                      <li>• Checkbox-based attendance</li>
                    </ul>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePayrollTypeSelect('Office')}
                    className="p-6 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg mr-4">
                        <Building className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Office Payroll</h3>
                        <p className="text-gray-600">For office employees with total inputs</p>
                      </div>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Total working days input</li>
                      <li>• Total late minutes input</li>
                      <li>• Total overtime hours input</li>
                      <li>• Simplified input fields</li>
                    </ul>
                  </motion.div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* Employee Selection */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Selection</h3>
                  
                  {loadingEmployees && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                      <span className="text-gray-600">Loading {payrollType} employees...</span>
                    </div>
                  )}

                  {employeeError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                        <p className="text-red-800">{employeeError}</p>
                      </div>
                    </div>
                  )}

                  {!loadingEmployees && !employeeError && employees.length > 0 && (
                    <CustomDropdown
                      label="Select Employee"
                      required
                      value={selectedEmployee}
                      onChange={handleEmployeeSelect}
                      options={employees.map(emp => ({
                        value: emp.id.toString(),
                        label: `${emp.name} (${emp.employee_id}) - ${emp.position}`
                      }))}
                      placeholder="Choose an employee"
                      disabled={isSubmitting}
                    />
                  )}
                </div>

                {selectedEmployee && (
                  <>
                    {/* Pay Period */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pay Period</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    {/* Attendance Section - Different for Site vs Office */}
                    {payrollType === 'Site' ? (
                      // Site Payroll - Daily Attendance Grid
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
                    ) : (
                      // Office Payroll - Total Input Fields
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Office Attendance Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Total Working Days <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={formData.totalWorkingDays}
                              onChange={(e) => handleInputChange('totalWorkingDays', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                              placeholder="0"
                              min="0"
                              max="31"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Total Late (minutes) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={formData.totalLateMinutes}
                              onChange={(e) => handleInputChange('totalLateMinutes', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                              placeholder="0"
                              min="0"
                              step="0.01"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Total Overtime (hours) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={formData.totalOvertimeHours}
                              onChange={(e) => handleInputChange('totalOvertimeHours', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                              placeholder="0"
                              min="0"
                              step="0.01"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      </div>
                    )}

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
                            Others Deduction
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
                              Readonly - Employee has active ECA
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.payPeriodStart || !formData.payPeriodEnd}
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
export default function WorkersPayroll() {
  // State management
  const [payrollRecords, setPayrollRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [groupFilter, setGroupFilter] = useState('all')
  const [viewMode, setViewMode] = useState('card')
  const [isExporting, setIsExporting] = useState(false)
  
  // Modal states
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  
  // Success alert
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const selectAllRef = useRef(null)

  // Fetch payroll records
  const fetchPayrollRecords = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch both site and office payrolls
      const [siteResponse, officeResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/payrolls`),
        fetch(`${API_BASE_URL}/office-payrolls`)
      ])
      
      const siteData = await siteResponse.json()
      const officeData = await officeResponse.json()
      
      let allRecords = []
      
      if (siteData.success) {
        const siteRecords = siteData.data.map(record => ({
          ...record,
          payroll_type: 'Site'
        }))
        allRecords = [...allRecords, ...siteRecords]
      }
      
      if (officeData.success) {
        const officeRecords = officeData.data.map(record => ({
          ...record,
          payroll_type: 'Office'
        }))
        allRecords = [...allRecords, ...officeRecords]
      }
      
      // Sort by created_at descending
      allRecords.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      
      setPayrollRecords(allRecords)
    } catch (error) {
      console.error('Error fetching payroll records:', error)
      setError('Failed to fetch payroll records')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPayrollRecords()
  }, [fetchPayrollRecords])


  // Individual export
  const handleIndividualExport = useCallback(async (record) => {
    try {
      const wb = XLSX.utils.book_new()
      const exportData = []
  
      if (record.payroll_type === 'Site') {
        // SITE EMPLOYEE EXPORT
        exportData.push([`Payroll Details - ${record.employee_name}`])
        exportData.push([])
  
        // Headers
        exportData.push([
          'Name',
          'Group',
          'Rate',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Working Days',
          'OT Pay',
          'Late',
          'CA',
          'Total Salary'
        ])
  
        // Parse daily attendance
        let dailyAttendance = {}
        try {
          dailyAttendance = typeof record.daily_attendance === 'string'
            ? JSON.parse(record.daily_attendance)
            : record.daily_attendance || {}
        } catch (e) {
          console.error('Error parsing daily attendance:', e)
        }
  
        exportData.push([
          record.employee_name || '',
          record.employee_group || '',
          parseFloat(record.daily_rate || 0).toFixed(2),
          dailyAttendance.monday ? 'Present' : 'Absent',
          dailyAttendance.tuesday ? 'Present' : 'Absent',
          dailyAttendance.wednesday ? 'Present' : 'Absent',
          dailyAttendance.thursday ? 'Present' : 'Absent',
          dailyAttendance.friday ? 'Present' : 'Absent',
          dailyAttendance.saturday ? 'Present' : 'Absent',
          record.working_days || 0,
          parseFloat(record.overtime_pay || 0).toFixed(2),
          parseFloat(record.late_deduction || 0).toFixed(2),
          parseFloat(record.cash_advance || 0).toFixed(2),
          parseFloat(record.net_pay || 0).toFixed(2)
        ])
      } else {
        // OFFICE EMPLOYEE EXPORT
        exportData.push([`Payroll Details - ${record.employee_name}`])
        exportData.push([])
  
        exportData.push([
          'Name',
          'Group',
          'Position',
          'Working Days',
          'OT Hours',
          'Late (mins)',
          'Basic Pay',
          'OT Pay',
          'Gross Pay',
          'Late Deduction',
          'Cash Advance',
          'Other Deductions',
          'Total Deductions',
          'Net Pay'
        ])
  
        exportData.push([
          record.employee_name || '',
          record.employee_group || '',
          record.position || '',
          record.total_working_days || 0,
          parseFloat(record.total_overtime_hours || 0).toFixed(1),
          parseFloat(record.total_late_minutes || 0).toFixed(0),
          parseFloat(record.basic_pay || 0).toFixed(2),
          parseFloat(record.overtime_pay || 0).toFixed(2),
          parseFloat(record.gross_pay || 0).toFixed(2),
          parseFloat(record.late_deduction || 0).toFixed(2),
          parseFloat(record.cash_advance || 0).toFixed(2),
          parseFloat(record.others_deduction || 0).toFixed(2),
          parseFloat(record.total_deductions || 0).toFixed(2),
          parseFloat(record.net_pay || 0).toFixed(2)
        ])
      }
  
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(exportData)
  
      // Auto column width
      ws['!cols'] = Array(exportData[0].length).fill({ width: 15 })
  
      // Add to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Payroll Details')
  
      // File name
      const currentDate = new Date().toISOString().split('T')[0]
      const employeeName = record.employee_name.replace(/[^a-zA-Z0-9]/g, '_')
      const filename = `${employeeName}_Payroll_${currentDate}.xlsx`
  
      XLSX.writeFile(wb, filename)
  
      setSuccessMessage(`Payroll data for ${record.employee_name} exported successfully!`)
      setShowSuccessAlert(true)
    } catch (error) {
      console.error('Error exporting individual payroll:', error)
      setError('Failed to export individual payroll data')
    }
  }, [])
  

  // Excel Export Function
  const handleExportToExcel = useCallback(async () => {
    try {
      setIsExporting(true)
      
      // Filter only site employees for export
      const siteRecords = payrollRecords.filter(record => record.payroll_type === 'Site')
      
      if (siteRecords.length === 0) {
        setError('No site payroll records found to export')
        return
      }
      
      // Group records by employee group
      const groupedRecords = siteRecords.reduce((groups, record) => {
        const group = record.employee_group || 'No Group'
        if (!groups[group]) {
          groups[group] = []
        }
        groups[group].push(record)
        return groups
      }, {})
      
      // Create workbook
      const wb = XLSX.utils.book_new()
      
      // Process each group
      Object.keys(groupedRecords).forEach(groupName => {
        const groupRecords = groupedRecords[groupName]
        
        // Prepare data for this group
        const exportData = []
        
        // Add group header
        exportData.push([`GROUP: ${groupName}`])
        exportData.push([]) // Empty row
        
        // Add column headers
        exportData.push([
          'Name',
          'Group',
          'Rate',
          'Monday',
          'Tuesday', 
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Working Days',
          'OT Pay',
          'Late',
          'CA',
          'Total Salary'
        ])
        
        let groupTotalSalary = 0
        
        // Add employee data
        groupRecords.forEach(record => {
          // Parse daily attendance data
          let dailyAttendance = {}
          try {
            dailyAttendance = typeof record.daily_attendance === 'string' 
              ? JSON.parse(record.daily_attendance) 
              : record.daily_attendance || {}
          } catch (e) {
            console.error('Error parsing daily attendance:', e)
          }
          
          const totalSalary = parseFloat(record.net_pay || 0)
          groupTotalSalary += totalSalary
          
          exportData.push([
            record.employee_name || '',
            record.employee_group || '',
            parseFloat(record.daily_rate || 0).toFixed(2),
            dailyAttendance.monday ? 'Present' : 'Absent',
            dailyAttendance.tuesday ? 'Present' : 'Absent',
            dailyAttendance.wednesday ? 'Present' : 'Absent',
            dailyAttendance.thursday ? 'Present' : 'Absent',
            dailyAttendance.friday ? 'Present' : 'Absent',
            dailyAttendance.saturday ? 'Present' : 'Absent',
            record.working_days || 0,
            parseFloat(record.overtime_pay || 0).toFixed(2),
            parseFloat(record.late_deduction || 0).toFixed(2),
            parseFloat(record.cash_advance || 0).toFixed(2),
            totalSalary.toFixed(2)
          ])
        })
        
        // Add group total
        exportData.push([]) // Empty row
        exportData.push([
          'GROUP TOTAL',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          groupTotalSalary.toFixed(2)
        ])
        exportData.push([]) // Empty row for separation
        
        // Create worksheet for this group
        const ws = XLSX.utils.aoa_to_sheet(exportData)
        
        // Set column widths
        ws['!cols'] = [
          { width: 20 }, // Name
          { width: 15 }, // Group
          { width: 10 }, // Rate
          { width: 12 }, // Monday
          { width: 12 }, // Tuesday
          { width: 12 }, // Wednesday
          { width: 12 }, // Thursday
          { width: 12 }, // Friday
          { width: 12 }, // Saturday
          { width: 12 }, // Working Days
          { width: 10 }, // OT Pay
          { width: 10 }, // Late
          { width: 10 }, // CA
          { width: 12 }  // Total Salary
        ]
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, groupName.substring(0, 31)) // Excel sheet name limit
      })
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0]
      const filename = `Site_Payroll_Export_${currentDate}.xlsx`
      
      // Save file
      XLSX.writeFile(wb, filename)
      
      setSuccessMessage('Payroll data exported successfully!')
      setShowSuccessAlert(true)
      
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      setError('Failed to export payroll data')
    } finally {
      setIsExporting(false)
    }
  }, [payrollRecords])

  // Handle payroll submission
  const handlePayrollSubmit = useCallback(async (data, endpoint) => {
    try {
      setIsSubmitting(true)
      
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setShowProcessModal(false)
        setSuccessMessage('Payroll processed successfully!')
        setShowSuccessAlert(true)
        fetchPayrollRecords()
      } else {
        setError(result.message || 'Failed to process payroll')
      }
    } catch (error) {
      console.error('Error processing payroll:', error)
      setError('Failed to process payroll')
    } finally {
      setIsSubmitting(false)
    }
  }, [fetchPayrollRecords])

  // Handle record update
  const handleUpdateRecord = useCallback(async (id, data) => {
    try {
      setIsUpdating(true)
      
      const record = payrollRecords.find(r => r.id === id)
      const endpoint = record.payroll_type === 'Site' ? 'payrolls' : 'office-payrolls'
      
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setShowUpdateModal(false)
        setSuccessMessage('Payroll record updated successfully!')
        setShowSuccessAlert(true)
        fetchPayrollRecords()
      } else {
        setError(result.message || 'Failed to update payroll record')
      }
    } catch (error) {
      console.error('Error updating payroll record:', error)
      setError('Failed to update payroll record')
    } finally {
      setIsUpdating(false)
    }
  }, [payrollRecords, fetchPayrollRecords])

  // Handle record deletion
  const handleDeleteRecord = useCallback(async () => {
    if (!selectedRecord) return
    
    try {
      setIsDeleting(true)
      
      const endpoint = selectedRecord.payroll_type === 'Site' ? 'payrolls' : 'office-payrolls'
      
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${selectedRecord.id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        setShowDeleteModal(false)
        setSuccessMessage('Payroll record deleted successfully!')
        setShowSuccessAlert(true)
        fetchPayrollRecords()
      } else {
        setError(result.message || 'Failed to delete payroll record')
      }
    } catch (error) {
      console.error('Error deleting payroll record:', error)
      setError('Failed to delete payroll record')
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
      
      const matchesDepartment = departmentFilter === 'all' || record.payroll_type === departmentFilter;
      const matchesGroup = groupFilter === 'all' || record.employee_group === groupFilter;
      
      return matchesSearch && matchesDepartment && matchesGroup;
    });
  }, [payrollRecords, searchTerm, departmentFilter, groupFilter]);

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

  const isAllVisibleSelected = useMemo(() => {
    if (!filteredRecords.length) return false
    const visibleIds = new Set(filteredRecords.map(r => r.id))
    for (const id of visibleIds) {
      if (!selectedIds.has(id)) return false
    }
    return true
  }, [filteredRecords, selectedIds])

  const isIndeterminate = useMemo(() => {
    if (!filteredRecords.length) return false
    const visibleIds = new Set(filteredRecords.map(r => r.id))
    let selectedCount = 0
    for (const id of visibleIds) {
      if (selectedIds.has(id)) selectedCount++
    }
    return selectedCount > 0 && selectedCount < visibleIds.size
  }, [filteredRecords, selectedIds])

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate
    }
  }, [isIndeterminate])

  const toggleSelectAllVisible = useCallback(() => {
    const visibleIds = filteredRecords.map(r => r.id)
    setSelectedIds(prev => {
      const next = new Set(prev)
      const allSelected = visibleIds.every(id => next.has(id))
      if (allSelected) {
        visibleIds.forEach(id => next.delete(id))
      } else {
        visibleIds.forEach(id => next.add(id))
      }
      return next
    })
  }, [filteredRecords])

  const toggleSelectOne = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return
    try {
      setIsBulkDeleting(true)
      const idsToDelete = Array.from(selectedIds)
      // Prepare deletions per record type
      const recordsById = new Map(payrollRecords.map(r => [r.id, r]))
      const deletePromises = idsToDelete.map(id => {
        const rec = recordsById.get(id)
        if (!rec) return Promise.resolve()
        const endpoint = rec.payroll_type === 'Site' ? 'payrolls' : 'office-payrolls'
        return fetch(`${API_BASE_URL}/${endpoint}/${id}`, { method: 'DELETE' })
          .then(r => r.json())
      })
      const results = await Promise.allSettled(deletePromises)
      const anyFailure = results.some(r => r.status === 'fulfilled' ? (r.value && r.value.success === false) : r.status === 'rejected')
      if (anyFailure) {
        setError('Some records could not be deleted')
      }
      setSuccessMessage('Selected payroll records deleted successfully!')
      setShowSuccessAlert(true)
      clearSelection()
      await fetchPayrollRecords()
    } catch (e) {
      console.error('Bulk delete failed:', e)
      setError('Failed to delete selected records')
    } finally {
      setIsBulkDeleting(false)
    }
  }, [selectedIds, payrollRecords, fetchPayrollRecords, clearSelection])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payroll records...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchPayrollRecords}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
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
            {/* View Toggle Buttons */}
            <div className="flex items-center relative bg-white border border-gray-200 rounded-lg p-1 overflow-hidden">
              <motion.div
                className="absolute top-1 left-1 bottom-1 rounded-md bg-gray-800"
                initial={false}
                animate={{
                  x: viewMode === 'card' ? 0 : 40,
                  width: 38,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              />

              <motion.button
                onClick={() => setViewMode('card')}
                className={`relative z-10 px-3 py-2 rounded-md transition-all duration-300 ${
                  viewMode === 'card'
                    ? 'text-white'
                    : 'text-gray-800 hover:text-gray-800'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Grid3X3 className="h-4 w-4" />
              </motion.button>

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
                className="bg-gray-800 hover:bg-gray-700 text-white transition-all duration-300"
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
            { title: 'Total Records', amount: summaryStats.totalRecords, color: 'bg-gray-800', icon: Users, isDays: false, isCount: true },
            { title: 'Total Gross Pay', amount: summaryStats.totalGrossPay, color: 'bg-gray-800', icon: DollarSign },
            { title: 'Total Deductions', amount: summaryStats.totalDeductions, color: 'bg-gray-800', icon: Calculator },
            { title: 'Total Net Pay', amount: summaryStats.totalNetPay, color: 'bg-gray-800', icon: CreditCard }
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
  className="bg-white rounded-lg shadow-md p-6"
>
  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
    {/* Search bar (takes 3 columns on md+) */}
    <div className="relative md:col-span-3">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <input
        type="text"
        placeholder="Search employees..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
      />
    </div>

    {/* Department filter (1 column) */}
    <div className="md:col-span-1">
      <CustomDropdown
        value={departmentFilter}
        onChange={setDepartmentFilter}
        options={departmentOptions}
        placeholder="Filter by department"
      />
    </div>

    {/* Group filter (1 column) */}
    <div className="md:col-span-1">
      <CustomDropdown
        value={groupFilter}
        onChange={setGroupFilter}
        options={groupOptions}
        placeholder="Filter by group"
      />
    </div>

    {/* Export button (1 column, same as filters) */}
    <div className="md:col-span-1">
      <Button
        onClick={handleExportToExcel}
        disabled={isExporting}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </>
        )}
      </Button>
    </div>
  </div>
</motion.div>


        {/* Records Display */}
        {viewMode === 'card' ? (
          // Card View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-white border-gray-200 hover:border-blue-500 transition-colors shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${record.payroll_type === 'Site' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                          {record.payroll_type === 'Site' ? (
                            <HardHat className={`h-5 w-5 ${record.payroll_type === 'Site' ? 'text-orange-600' : 'text-blue-600'}`} />
                          ) : (
                            <Building className={`h-5 w-5 ${record.payroll_type === 'Site' ? 'text-orange-600' : 'text-blue-600'}`} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{record.employee_name}</h3>
                          <p className="text-sm text-gray-600">{record.employee_code} • {record.position}</p>
                        </div>
                      </div>
                      <StatusBadge status={record.status} />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Department:</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                          record.payroll_type === 'Site' 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {record.payroll_type}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pay Period:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {record.pay_period_start} to {record.pay_period_end}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Working Days:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {record.payroll_type === 'Site' ? record.working_days : record.total_working_days}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Overtime Pay:</span>
                        <span className="text-sm font-medium text-green-600">
                          + ₱{parseFloat(record.overtime_pay).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Late Deduction:</span>
                        <span className="text-sm font-medium text-red-600">
                          - ₱{parseFloat(record.late_deduction).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Cash Adavance:</span>
                        <span className="text-sm font-medium text-red-600">
                          - ₱{parseFloat(record.cash_advance).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Other Deduction:</span>
                        <span className="text-sm font-medium text-red-600">
                          - ₱{parseFloat(record.others_deduction).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Gross Pay:</span>
                        <span className="text-sm font-medium text-green-600">
                          ₱{parseFloat(record.gross_pay).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Net Pay:</span>
                        <span className="text-sm font-bold text-blue-600">
                          ₱{parseFloat(record.net_pay).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleIndividualExport(record)}
                        className="flex-1 text-green-600 hover:text-white hover:bg-green-600"
                      >
                        <Download className="h-4 w-4 mr-1" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRecord(record)
                          setShowUpdateModal(true)
                        }}
                        className="flex-1 text-blue-600 hover:text-white hover:bg-blue-600"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRecord(record)
                          setShowDeleteModal(true)
                        }}
                        className="text-red-600 hover:text-white hover:bg-red-600 "
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          // Table View
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {selectedIds.size > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-b bg-blue-50">
                <div className="text-sm text-blue-800">
                  {isAllVisibleSelected ? `All ${filteredRecords.length} records on this page selected` : `${selectedIds.size} selected`}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={clearSelection}
                    className="border-blue-200 text-blue-700 hover:text-blue-800 hover:border-blue-300"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleBulkDelete}
                    disabled={isBulkDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isBulkDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isAllVisibleSelected ? 'Delete All Records' : 'Delete Selected'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        checked={isAllVisibleSelected}
                        onChange={toggleSelectAllVisible}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record, index) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`hover:bg-gray-50 ${selectedIds.has(record.id) ? 'bg-blue-50/50' : ''}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(record.id)}
                          onChange={() => toggleSelectOne(record.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg mr-3 ${record.payroll_type === 'Site' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                            {record.payroll_type === 'Site' ? (
                              <HardHat className={`h-4 w-4 ${record.payroll_type === 'Site' ? 'text-orange-600' : 'text-blue-600'}`} />
                            ) : (
                              <Building className={`h-4 w-4 ${record.payroll_type === 'Site' ? 'text-orange-600' : 'text-blue-600'}`} />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{record.employee_name}</div>
                            <div className="text-sm text-gray-500">{record.employee_code} • {record.position}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.payroll_type === 'Site' 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {record.payroll_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.pay_period_start} to {record.pay_period_end}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.payroll_type === 'Site' ? record.working_days : record.total_working_days}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ₱{parseFloat(record.gross_pay).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        ₱{parseFloat(record.net_pay).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleIndividualExport(record)}
                            className="text-green-600 hover:text-green-700 hover:border-green-300"
                          >
                            <Download className="h-4 w-4" />
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
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {filteredRecords.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payroll records found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || departmentFilter !== 'all' || groupFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by processing your first payroll'}
            </p>
            <Button
              onClick={() => setShowProcessModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Process Payroll
            </Button>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <ProcessPayrollModal
        isOpen={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        onSubmit={handlePayrollSubmit}
        isSubmitting={isSubmitting}
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

