import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Receipt, 
  Calendar, 
  DollarSign, 
  Filter,
  Download,
  Eye,
  Trash2,
  Edit,
  X,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import * as XLSX from 'xlsx'
import API_BASE_URL from './Config'
// Custom Dropdown Component
function CustomDropdown({ options, value, onChange, placeholder, className = "", disabled = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (option) => {
    onChange(option.value)
    setIsOpen(false)
  }

  const selectedOption = options.find(option => option.value === value)

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] 
          rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] 
          focus:outline-none transition-all duration-200 flex items-center justify-between
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[var(--color-primary)]/50 cursor-pointer'}
          ${isOpen ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20' : ''}
        `}
      >
        <span className={selectedOption ? 'text-[var(--color-foreground)]' : 'text-[var(--color-foreground)]/50'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-[var(--color-foreground)]/50" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <ul className="py-1">
              {options.map((option, index) => (
                <motion.li
                  key={option.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15, delay: index * 0.02 }}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full text-left px-4 py-2 text-sm transition-colors duration-150
                      hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]
                      ${value === option.value ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--color-foreground)]'}
                    `}
                  >
                    {option.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Expense Modal Component (for Add and Edit)
function ExpenseModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState(initialData || {
    orSiNo: '',
    description: '',
    quantity: '',
    unit: 'pc',
    customUnit: '',
    sizeDimension: '',
    unitPrice: '',
    category: 'Plumbing',
    customCategory: '',
    location: '',
    store: ''
  })

  useEffect(() => {
    setFormData(initialData || {
      orSiNo: '',
      description: '',
      quantity: '',
      unit: 'pc',
      customUnit: '',
      sizeDimension: '',
      unitPrice: '',
      category: 'Plumbing',
      customCategory: '',
      location: '',
      store: ''
    })
  }, [initialData])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const totalPrice = parseFloat(formData.quantity) * parseFloat(formData.unitPrice)
    
    const finalData = {
      id: initialData ? initialData.id : null,
      or_si_no: formData.orSiNo,
      description: formData.description,
      quantity: parseInt(formData.quantity),
      unit: formData.unit === 'others' ? formData.customUnit : formData.unit,
      size_dimension: formData.sizeDimension,
      unit_price: parseFloat(formData.unitPrice),
      total_price: totalPrice,
      category: formData.category === 'Others' ? formData.customCategory : formData.category,
      location: formData.location,
      store: formData.store
    }
    
    onSubmit(finalData)
    onClose()
  }

  // Prepare dropdown options
  const unitOptions = units.filter(unit => unit !== 'All').map(unit => ({
    value: unit,
    label: unit === 'others' ? 'Others (Please specify)' : unit
  }))

  const categoryOptions = categories.filter(cat => cat !== 'All').map(category => ({
    value: category,
    label: category === 'Others' ? 'Others (Please specify)' : category
  }))

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                {initialData ? 'Edit Expense' : 'Add New Expense'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* OR/SI No. */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    OR/SI No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.orSiNo}
                    onChange={(e) => handleInputChange('orSiNo', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="e.g., OR-001, SI-002"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Description *
                  </label>
                  <input
                    required
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="Detailed description of the expense"
                    rows="3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="1"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Unit *
                  </label>
                  <CustomDropdown
                    options={unitOptions}
                    value={formData.unit}
                    onChange={(value) => handleInputChange('unit', value)}
                    placeholder="Select unit"
                  />
                  {formData.unit === 'others' && (
                    <input
                      type="text"
                      required
                      value={formData.customUnit}
                      onChange={(e) => handleInputChange('customUnit', e.target.value)}
                      className="w-full px-3 py-2 mt-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                      placeholder="Specify unit"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="e.g., Warehouse A, Site B"
                  />
                </div>

                {/* Store */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Store *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.store}
                    onChange={(e) => handleInputChange('store', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="e.g., Main Store, Online Shop"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Unit Price */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Unit Price (₱) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="0.00"
                  />
                </div>

                {/* Total Price (calculated) */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Total Price (₱)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formData.quantity && formData.unitPrice ? 
                      `₱${(parseFloat(formData.quantity) * parseFloat(formData.unitPrice)).toFixed(2)}` : 
                      '₱0.00'
                    }
                    className="w-full px-3 py-2 bg-gray-300 border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)]/70 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Size/Dimension */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Size/Dimension *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sizeDimension}
                    onChange={(e) => handleInputChange('sizeDimension', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="e.g., Standard, 50kg, Medium"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Category *
                  </label>
                  <CustomDropdown
                    options={categoryOptions}
                    value={formData.category}
                    onChange={(value) => handleInputChange('category', value)}
                    placeholder="Select category"
                  />
                  {formData.category === 'Others' && (
                    <input
                      type="text"
                      required
                      value={formData.customCategory}
                      onChange={(e) => handleInputChange('customCategory', e.target.value)}
                      className="w-full px-3 py-2 mt-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                      placeholder="Specify category"
                    />
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-secondary)] hover:to-[var(--color-primary)] text-white"
                >
                  {initialData ? 'Update Expense' : 'Add Expense'}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const DeleteConfirmationModal = React.memo(({ isOpen, onClose, onConfirm, isDeleting, expense }) => {
  if (!isOpen || !expense) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => !isDeleting && onClose()}
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
              <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
              <Button variant="ghost" size="sm" onClick={onClose} disabled={isDeleting}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to delete this expense? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-1 truncate" title={expense.description}>{expense.description}</h3>
                <p className="text-sm text-gray-600">OR/SI No: {expense.or_si_no}</p>
                <p className="text-sm text-gray-600">Total: ₱{parseFloat(expense.total_price).toFixed(2)}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" className="flex-1" onClick={onClose} disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={onConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Expense
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

// Pagination Component
function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 10
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {getPageNumbers().map((page, index) => (
        <Button
          key={index}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={
            page === currentPage
              ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white"
              : "border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
          }
        >
          {page}
        </Button>
      ))}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

const categories = ['All', 'Plumbing', 'Electrical', 'Safety', 'Structural/Painting', 'Architectural', 'Sanitary', 'Painting', 'Others']
const units = ['pc', 'pcs', 'set', 'kg', 'length', 'pack', 'box', 'gal', 'roll', 'bags', 'can', 'liter', 'others']

// API base URL - adjust this to match your Laravel backend URL

function ExpensesReceipts( ) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [modals, setModals] = useState({
    delete: { isOpen: false, isDeleting: false, expense: null }
  })

  // Alert function from EquipmentInventory
  const showAlert = useCallback((message, type = 'info') => {
    const alertDiv = document.createElement('div')
    alertDiv.className = `fixed top-4 right-4 z-[9999] px-6 py-4 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full`
    
    switch (type) {
      case 'success': alertDiv.className += ' bg-green-500'; break
      case 'error': alertDiv.className += ' bg-red-500'; break
      case 'warning': alertDiv.className += ' bg-yellow-500'; break
      default: alertDiv.className += ' bg-blue-500'
    }
    
    alertDiv.textContent = message
    document.body.appendChild(alertDiv)
    
    setTimeout(() => alertDiv.classList.remove('translate-x-full'), 100)
    setTimeout(() => {
      alertDiv.classList.add('translate-x-full')
      setTimeout(() => document.body.removeChild(alertDiv), 300)
    }, 3000)
  }, [])

  // Fetch expenses from backend
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/expenses`)
      const data = await response.json()
      
      if (data.success) {
        setExpenses(data.data)
      } else {
        showAlert('Failed to fetch expenses: ' + data.message, 'error')
      }
    } catch (err) {
      showAlert('Error connecting to server: ' + err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [showAlert])

  // Add or Update expense
  const handleSaveExpense = useCallback(async (expenseData) => {
    try {
      let response
      const url = expenseData.id ? `${API_BASE_URL}/expenses/${expenseData.id}` : `${API_BASE_URL}/expenses`
      const method = expenseData.id ? 'PUT' : 'POST'

      response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchExpenses()
        const message = expenseData.id ? 'Expense updated successfully!' : 'Expense added successfully!'
        showAlert(message, 'success')
      } else {
        const errorMsg = data.errors ? Object.values(data.errors).flat().join(', ') : data.message
        showAlert('Error: ' + errorMsg, 'error')
      }
    } catch (err) {
      showAlert(`Failed to ${expenseData.id ? 'update' : 'add'} expense: ` + err.message, 'error')
    }
  }, [fetchExpenses, showAlert])

  // Handle edit button click
  const handleEditClick = useCallback((expense) => {
    setEditingExpense({
      id: expense.id,
      orSiNo: expense.or_si_no,
      description: expense.description,
      quantity: expense.quantity,
      unit: expense.unit,
      customUnit: units.includes(expense.unit) ? '' : expense.unit,
      sizeDimension: expense.size_dimension,
      unitPrice: expense.unit_price,
      category: expense.category,
      customCategory: categories.includes(expense.category) ? '' : expense.category,
      location: expense.location,
      store: expense.store
    })
    setShowExpenseModal(true)
  }, [])

  // Delete modal handlers
  const openDeleteModal = useCallback((expense) => {
    setModals(prev => ({ ...prev, delete: { isOpen: true, isDeleting: false, expense } }))
  }, [])

  const closeDeleteModal = useCallback(() => {
    setModals(prev => ({ ...prev, delete: { isOpen: false, isDeleting: false, expense: null } }))
  }, [])

  // Confirm delete action
  const confirmDelete = useCallback(async () => {
    const expenseId = modals.delete.expense?.id
    if (!expenseId) return

    setModals(prev => ({ ...prev, delete: { ...prev.delete, isDeleting: true } }))

    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        showAlert('Expense deleted successfully!', 'success')
        closeDeleteModal()
        fetchExpenses()
      } else {
        showAlert('Error: ' + data.message, 'error')
      }
    } catch (err) {
      showAlert('Failed to delete expense: ' + err.message, 'error')
    } finally {
      setModals(prev => ({ ...prev, delete: { ...prev.delete, isDeleting: false } }))
    }
  }, [showAlert, closeDeleteModal, fetchExpenses, modals.delete.expense])

  // Load expenses on component mount
  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // Filter and search logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.or_si_no.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [expenses, searchTerm, selectedCategory])

  // Pagination logic
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage)
  const startIndex = (currentPage- 1) * itemsPerPage
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory])

  // Calculate totals
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.total_price), 0)
  const totalItems = filteredExpenses.reduce((sum, expense) => sum + expense.quantity, 0)

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredExpenses.map(expense => ({
      'OR/SI No.': expense.or_si_no,
      'Description': expense.description,
      'Quantity': expense.quantity,
      'Unit': expense.unit,
      'Size/Dimension': expense.size_dimension,
      'Unit Price': expense.unit_price,
      'Total Price': expense.total_price,
      'Category': expense.category,
      'Location': expense.location,
      'Store': expense.store,
      'Date Created': new Date(expense.created_at).toLocaleDateString()
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses')
    XLSX.writeFile(wb, `expenses_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Prepare category options for filter dropdown
  const categoryFilterOptions = categories.map(category => ({
    value: category,
    label: category === 'All' ? 'All Categories' : category
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
            Expenses & Receipts
          </h1>
          <p className="text-[var(--color-foreground)]/70 mt-1">
            Track and manage your expenses and receipts
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => { setEditingExpense(null); setShowExpenseModal(true); }}
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-secondary)] hover:to-[var(--color-primary)] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatePresence>
          <motion.div
            key="total-expenses-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-[var(--color-card)] border-[var(--color-border)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--color-foreground)]/70">
                  Total Expenses
                </CardTitle>
                <Receipt className="h-4 w-4 text-[var(--color-primary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--color-foreground)]">
                  {filteredExpenses.length}
                </div>
                <p className="text-xs text-[var(--color-foreground)]/70">
                  {filteredExpenses.length !== expenses.length && `of ${expenses.length} total`}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          <motion.div
            key="total-amount-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-[var(--color-card)] border-[var(--color-border)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--color-foreground)]/70">
                  Total Amount
                </CardTitle>
                <DollarSign className="h-4 w-4 text-[var(--color-primary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--color-foreground)]">
                  ₱{totalAmount.toFixed(2)}
                </div>
                <p className="text-xs text-[var(--color-foreground)]/70">
                  Filtered results
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          <motion.div
            key="total-items-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-[var(--color-card)] border-[var(--color-border)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--color-foreground)]/70">
                  Total Items
                </CardTitle>
                <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--color-foreground)]">
                  {totalItems}
                </div>
                <p className="text-xs text-[var(--color-foreground)]/70">
                  Items purchased
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-foreground)]/50 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by description, OR/SI number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <CustomDropdown
            options={categoryFilterOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="All Categories"
            className="w-48"
          />
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Expenses Table */}
      <Card className="bg-[var(--color-card)] border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--color-foreground)]">
            Expenses List ({filteredExpenses.length} items)
          </CardTitle>
          <p className="text-sm text-[var(--color-foreground)]/70">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} results
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">OR/SI No.</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Unit</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Size</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Unit Price</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Store</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginatedExpenses.map((expense) => (
                    <motion.tr
                      key={expense.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-[var(--color-border)] hover:bg-gray-200 transition-colors"
                    >
                      <td className="py-3 px-4 text-[var(--color-foreground)]">{expense.or_si_no}</td>
                      <td className="py-3 px-4 text-[var(--color-foreground)] max-w-xs">
                        <div className="truncate" title={expense.description}>
                          {expense.description}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[var(--color-foreground)]">{expense.quantity}</td>
                      <td className="py-3 px-4 text-[var(--color-foreground)]">{expense.unit}</td>
                      <td className="py-3 px-4 text-[var(--color-foreground)]">{expense.size_dimension}</td>
                      <td className="py-3 px-4 text-[var(--color-foreground)]">₱{parseFloat(expense.unit_price).toFixed(2)}</td>
                      <td className="py-3 px-4 text-[var(--color-foreground)] font-medium">₱{parseFloat(expense.total_price).toFixed(2)}</td>
                      <td className="py-3 px-4 text-[var(--color-foreground)]">
                        <span className="px-2 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full text-xs">
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--color-foreground)]">{expense.location}</td>
                      <td className="py-3 px-4 text-[var(--color-foreground)]">{expense.store}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditClick(expense)}
                            className="text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDeleteModal(expense)}
                            className="text-red-500 hover:bg-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            
            {paginatedExpenses.length === 0 && (
              <div className="text-center py-8 text-[var(--color-foreground)]/70">
                No expenses found matching your criteria.
              </div>
            )}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Expense Modal (Add/Edit) */}
      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSubmit={handleSaveExpense}
        initialData={editingExpense}
      />

      {/* Confirmation Modal (Delete) */}
      <DeleteConfirmationModal
        isOpen={modals.delete.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        isDeleting={modals.delete.isDeleting}
        expense={modals.delete.expense}
      />
    </div>
  )
}

export default ExpensesReceipts

