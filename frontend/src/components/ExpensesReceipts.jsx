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
  Loader2,
  Upload,
  Image as ImageIcon,
  ZoomIn,
  Camera
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
      document.removeEventListener('mousedown', handleClickOutside, false)
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

// Image Modal Component for viewing/zooming images
function ImageModal({ isOpen, onClose, images, currentIndex, onNavigate }) {
  if (!isOpen || !images || images.length === 0) return null

  const currentImage = images[currentIndex] || images[0]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('prev')}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('next')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Image */}
          <img
            src={currentImage.secure_url || currentImage.url}
            alt="Expense receipt"
            className="max-w-full max-h-full object-contain rounded-lg"
            onError={(e) => {
              console.error('Image failed to load:', currentImage)
              e.target.style.display = 'none'
            }}
          />

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} of {images.length}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Expense Modal Component (for Add and Edit)
function ExpenseModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState(initialData || {
    expenseDate: '',
    orSiNo: '',
    description: '',
    quantity: '',
    sizeDimension: '',
    unitPrice: '',
    totalPrice: '',
    category: 'Plumbing',
    customCategory: '',
    location: '',
    store: '',
    mopType: '',
    mopDetails: '',
    images: []
  })

  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreview, setImagePreview] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setFormData(initialData || {
      expenseDate: '',
      orSiNo: '',
      description: '',
      quantity: '',
      sizeDimension: '',
      unitPrice: '',
      totalPrice: '',
      category: 'Plumbing',
      customCategory: '',
      location: '',
      store: '',
      mopType: '',
      mopDetails: '',
      images: []
    })
    
    // Reset image states when modal opens/closes
    if (!isOpen) {
      setSelectedImages([])
      setImagePreview([])
      setIsSubmitting(false)
    } else if (initialData && initialData.images) {
      setImagePreview(initialData.images)
    }
  }, [initialData, isOpen])

  // Auto-calculate total price when unit price changes
  useEffect(() => {
    if (formData.unitPrice !== '') {
      const unitPrice = parseFloat(formData.unitPrice)
      // Quantity can be a string, so we don't use it for auto-calculation here
      // If quantity is not a number, assume 1 for calculation if unitPrice is present
      const quantityVal = parseFloat(formData.quantity) || 1;
      const total = unitPrice * quantityVal;
      setFormData(prev => ({ ...prev, totalPrice: total.toFixed(2) }))
    } else if (formData.unitPrice === '') {
      // If unit price is cleared, clear total price
      setFormData(prev => ({ ...prev, totalPrice: '' }));
    }
  }, [formData.unitPrice])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Limit to 10 images total
    const totalImages = selectedImages.length + files.length
    if (totalImages > 10) {
      alert('Maximum 10 images allowed')
      return
    }

    setSelectedImages(prev => [...prev, ...files])

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, {
          url: e.target.result,
          file: file,
          isNew: true
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    const imageToRemove = imagePreview[index]
    
    if (imageToRemove.isNew) {
      // Remove from selected images
      const fileIndex = selectedImages.findIndex(file => file.name === imageToRemove.file.name)
      if (fileIndex > -1) {
        setSelectedImages(prev => prev.filter((_, i) => i !== fileIndex))
      }
    }
    
    setImagePreview(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (isSubmitting) return
    setIsSubmitting(true)
    
    try {
      const finalData = {
        id: initialData ? initialData.id : null,
        expense_date: formData.expenseDate || null,
        or_si_no: formData.orSiNo,
        description: formData.description,
        quantity: formData.quantity || null, // Quantity can be string
        size_dimension: formData.sizeDimension || null,
        unit_price: formData.unitPrice ? parseFloat(formData.unitPrice) : null,
        total_price: formData.totalPrice ? parseFloat(formData.totalPrice) : null, // Total price can be null if not set
        category: formData.category === 'Others' ? formData.customCategory : formData.category,
        location: formData.location || null,
        store: formData.store || null,
        mop_type: formData.mopType || null,
        mop_details: formData.mopDetails || null,
        images: selectedImages
      }
      
      await onSubmit(finalData)
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Prepare dropdown options
  const categoryOptions = [
    { value: 'Plumbing', label: 'Plumbing' },
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Safety', label: 'Safety' },
    { value: 'Structural/Painting', label: 'Structural/Painting' },
    { value: 'Architectural', label: 'Architectural' },
    { value: 'Sanitary', label: 'Sanitary' },
    { value: 'Painting', label: 'Painting' },
    { value: 'Others', label: 'Others (Please specify)' }
  ]

  const mopOptions = [
    { value: '', label: 'Select MOP (Optional)' },
    { value: 'PDC', label: 'PDC' },
    { value: 'PO', label: 'PO' },
    { value: 'CARD', label: 'CARD' }
  ]

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
          className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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
                disabled={isSubmitting}
                className="text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload Section */}
              <div className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-6">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-[var(--color-foreground)]/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[var(--color-foreground)] mb-2">Upload Receipt Images</h3>
                  <p className="text-sm text-[var(--color-foreground)]/70 mb-4">
                    Upload up to 10 images. First image will be displayed as primary.
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-4"
                    disabled={isSubmitting}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Images
                  </Button>
                </div>

                {/* Image Preview */}
                {imagePreview.length > 0 && (
                  <div className="mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagePreview.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url || image.secure_url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-[var(--color-border)]"
                            onError={(e) => {
                              console.error('Preview image failed to load:', image)
                              e.target.style.display = 'none'
                            }}
                          />
                          {index === 0 && (
                            <div className="absolute top-1 left-1 bg-[var(--color-primary)] text-white text-xs px-2 py-1 rounded">
                              Primary
                            </div>
                          )}
                          {index > 0 && imagePreview.length > 1 && (
                            <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                              +{imagePreview.length - 1}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            disabled={isSubmitting}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) => handleInputChange('expenseDate', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                  />
                </div>

                {/* DR/SI No. */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    DR/SI No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.orSiNo}
                    onChange={(e) => handleInputChange('orSiNo', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="e.g., DR-001, SI-002"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                  placeholder="Detailed description of the expense"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Quantity
                  </label>
                  <input
                    type="text" // Changed to text
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="e.g., 1 gallon, 2 pcs"
                  />
                </div>

                {/* Unit Price */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Unit Price (₱)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="0.00"
                  />
                </div>

                {/* Total Price */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Total Price (₱) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.totalPrice}
                    onChange={(e) => handleInputChange('totalPrice', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Size/Dimension */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Size/Dimension
                  </label>
                  <input
                    type="text"
                    value={formData.sizeDimension}
                    onChange={(e) => handleInputChange('sizeDimension', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="e.g., Standard, 50kg, Medium"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="e.g., Warehouse A, Site B"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Store */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Store
                  </label>
                  <input
                    type="text"
                    value={formData.store}
                    onChange={(e) => handleInputChange('store', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="e.g., Main Store, Online Shop"
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
                    disabled={isSubmitting}
                  />
                  {formData.category === 'Others' && (
                    <input
                      type="text"
                      required
                      value={formData.customCategory}
                      onChange={(e) => handleInputChange('customCategory', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 mt-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                      placeholder="Specify category"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* MOP Type */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    MOP
                  </label>
                  <CustomDropdown
                    options={mopOptions}
                    value={formData.mopType}
                    onChange={(value) => handleInputChange('mopType', value)}
                    placeholder="Select MOP (Optional)"
                    disabled={isSubmitting}
                  />
                </div>

                {/* MOP Details */}
                {formData.mopType && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                      {formData.mopType} Details
                    </label>
                    <input
                      type="text"
                      value={formData.mopDetails}
                      onChange={(e) => handleInputChange('mopDetails', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                      placeholder={`Enter ${formData.mopType} details`}
                    />
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-secondary)] hover:to-[var(--color-primary)] text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {initialData ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    initialData ? 'Update Expense' : 'Add Expense'
                  )}
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
                <p className="text-sm text-gray-600">DR/SI No: {expense.or_si_no}</p>
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
const mopTypes = ['All', 'PDC', 'PO', 'CARD']

function ExpensesReceipts() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedMop, setSelectedMop] = useState('All')
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const itemsPerPage = 10

  // Image modal states
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [viewingImages, setViewingImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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

  // Handle add expense
  const handleAddExpense = async (formData) => {
    try {
      const submitData = new FormData()
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'images') {
          formData.images.forEach((image, index) => {
            submitData.append(`images[${index}]`, image)
          })
        } else if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key])
        }
      })

      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        body: submitData
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchExpenses()
        setShowExpenseModal(false)
        showAlert('Expense added successfully!', 'success')
      } else {
        console.error('Failed to add expense:', data.message)
        showAlert('Failed to add expense: ' + (data.message || 'Unknown error'), 'error')
      }
    } catch (error) {
      console.error('Error adding expense:', error)
      showAlert('Error adding expense: ' + error.message, 'error')
    }
  }

  // Handle edit expense
  const handleEditExpense = async (formData) => {
    try {
      const submitData = new FormData()
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'images') {
          formData.images.forEach((image, index) => {
            submitData.append(`images[${index}]`, image)
          })
        } else if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key])
        }
      })

      const response = await fetch(`${API_BASE_URL}/expenses/${formData.id}`, {
        method: 'POST', // Laravel expects POST with _method=PUT for file uploads
        body: submitData
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchExpenses()
        setShowExpenseModal(false)
        setEditingExpense(null)
        showAlert('Expense updated successfully!', 'success')
      } else {
        console.error('Failed to update expense:', data.message)
        showAlert('Failed to update expense: ' + (data.message || 'Unknown error'), 'error')
      }
    } catch (error) {
      console.error('Error updating expense:', error)
      showAlert('Error updating expense: ' + error.message, 'error')
    }
  }

  // Handle edit button click
  const handleEditClick = useCallback((expense) => {
    setEditingExpense({
      id: expense.id,
      expenseDate: expense.expense_date || '',
      orSiNo: expense.or_si_no,
      description: expense.description,
      quantity: expense.quantity || '',
      sizeDimension: expense.size_dimension || '',
      unitPrice: expense.unit_price || '',
      totalPrice: expense.total_price,
      category: expense.category,
      customCategory: categories.includes(expense.category) ? '' : expense.category,
      location: expense.location || '',
      store: expense.store || '',
      mopType: expense.mop_type || '',
      mopDetails: expense.mop_details || '',
      images: expense.images || []
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

  // Toggle row expansion
  const toggleRowExpansion = useCallback((expenseId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(expenseId)) {
        newSet.delete(expenseId)
      } else {
        newSet.add(expenseId)
      }
      return newSet
    })
  }, [])

  // Handle image viewing
  const handleViewImages = (images, startIndex = 0) => {
    if (!images || images.length === 0) return
    setViewingImages(images)
    setCurrentImageIndex(startIndex)
    setIsImageModalOpen(true)
  }

  const handleImageNavigation = (direction) => {
    if (direction === 'next') {
      setCurrentImageIndex(prev => (prev + 1) % viewingImages.length)
    } else {
      setCurrentImageIndex(prev => (prev - 1 + viewingImages.length) % viewingImages.length)
    }
  }

  // Load expenses on component mount
  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // Filter and search logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.or_si_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (expense.store && expense.store.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (expense.location && expense.location.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory
      const matchesMop = selectedMop === 'All' || expense.mop_type === selectedMop
      
      return matchesSearch && matchesCategory && matchesMop
    })
  }, [expenses, searchTerm, selectedCategory, selectedMop])

  // Pagination logic
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedMop])

  // Calculate totals
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.total_price), 0)
  const totalItems = filteredExpenses.reduce((sum, expense) => sum + (expense.quantity ? (parseFloat(expense.quantity) || 0) : 0), 0)

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredExpenses.map(expense => ({
      'Date': expense.expense_date ? new Date(expense.expense_date).toLocaleDateString() : 'N/A',
      'DR/SI No.': expense.or_si_no.replace(/^(OR|or)/i, 'DR').replace(/^(SI|si)/i, 'SI'),
      'Description': expense.description,
      'Quantity': expense.quantity || 'N/A',
      'Unit Price': expense.unit_price ? `₱${parseFloat(expense.unit_price).toFixed(2)}` : 'N/A',
      'Total Price': `₱${parseFloat(expense.total_price).toFixed(2)}`,
      'MOP': expense.mop_type ? `${expense.mop_type}${expense.mop_details ? ` - ${expense.mop_details}` : ''}` : 'N/A',
      'Category': expense.category,
      'Location': expense.location || 'N/A',
      'Store': expense.store || 'N/A',
      'Size/Dimension': expense.size_dimension || 'N/A',
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

  const mopFilterOptions = mopTypes.map(mop => ({
    value: mop,
    label: mop === 'All' ? 'All MOP' : mop
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
            placeholder="Search by description, DR/SI number..."
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
          <CustomDropdown
            options={mopFilterOptions}
            value={selectedMop}
            onChange={setSelectedMop}
            placeholder="All MOP"
            className="w-32"
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
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Image</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">DR/SI No.</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Unit Price</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Total Price</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">MOP</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginatedExpenses.map((expense) => (
                    <React.Fragment key={expense.id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-[var(--color-border)] hover:bg-gray-200 transition-colors cursor-pointer"
                        onClick={() => toggleRowExpansion(expense.id)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <motion.div
                              animate={{ rotate: expandedRows.has(expense.id) ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="h-4 w-4 text-[var(--color-foreground)]/70" />
                            </motion.div>
                            {expense.images && expense.images.length > 0 ? (
                              <div className="relative">
                                <img
                                  src={expense.images[0].secure_url || expense.images[0].url}
                                  alt="Receipt"
                                  className="w-12 h-12 object-cover rounded-lg border border-[var(--color-border)] cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewImages(expense.images, 0)
                                  }}
                                  onError={(e) => {
                                    console.error('Image failed to load:', expense.images[0])
                                    e.target.style.display = 'none'
                                  }}
                                />
                                {expense.images.length > 1 && (
                                  <div className="absolute -top-1 -right-1 bg-[var(--color-primary)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    +{expense.images.length - 1}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-[var(--color-muted)] rounded-lg border border-[var(--color-border)] flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-[var(--color-foreground)]/50" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[var(--color-foreground)]">
                          {expense.expense_date ? new Date(expense.expense_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-foreground)]">
                          {expense.or_si_no.replace(/^(OR|or)/i, 'DR').replace(/^(SI|si)/i, 'SI')}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-foreground)] max-w-xs">
                          <div className="truncate" title={expense.description}>
                            {expense.description}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[var(--color-foreground)]">
                          {expense.quantity || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-foreground)]">
                          {expense.unit_price ? `₱${parseFloat(expense.unit_price).toFixed(2)}` : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-foreground)] font-medium">
                          ₱{parseFloat(expense.total_price).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-foreground)]">
                          {expense.mop_type ? `${expense.mop_type}${expense.mop_details ? ` - ${expense.mop_details}` : ''}` : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-foreground)]">
                          {expense.category || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
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
                              className="text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>

                      {/* Expanded Row Content - Only Size, Location, Store */}
                      <AnimatePresence>
                        {expandedRows.has(expense.id) && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <td colSpan="10" className="px-6 py-4 bg-[var(--color-muted)]/30">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-[var(--color-foreground)]/70">Size/Dimension:</span>
                                  <p className="text-[var(--color-foreground)]">{expense.size_dimension || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-[var(--color-foreground)]/70">Location:</span>
                                  <p className="text-[var(--color-foreground)]">{expense.location || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-[var(--color-foreground)]/70">Store:</span>
                                  <p className="text-[var(--color-foreground)]">{expense.store || 'N/A'}</p>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {filteredExpenses.length === 0 && !loading && (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-[var(--color-foreground)]/50 mx-auto mb-4" />
                <p className="text-[var(--color-foreground)]/70">No expenses found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Modals */}
      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => {
          setShowExpenseModal(false)
          setEditingExpense(null)
        }}
        onSubmit={editingExpense ? handleEditExpense : handleAddExpense}
        initialData={editingExpense}
      />

      <DeleteConfirmationModal
        isOpen={modals.delete.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        isDeleting={modals.delete.isDeleting}
        expense={modals.delete.expense}
      />

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        images={viewingImages}
        currentIndex={currentImageIndex}
        onNavigate={handleImageNavigation}
      />
    </div>
  )
}

export default ExpensesReceipts

