import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Car, 
  Calendar, 
  FileText, 
  Download,
  Trash2,
  Edit,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  Upload,
  ZoomIn,
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import * as XLSX from 'xlsx'
import API_BASE_URL from './Config'

// Status options for vehicles
const statusOptions = ['All', 'Pending', 'Complete']

// Image Gallery Modal Component
function ImageGalleryModal({ isOpen, onClose, images, initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex, isOpen])

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (!isOpen || !images || images.length === 0) return null

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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={prevImage}
                className="absolute left-4 z-10 text-white bg-black/50 hover:bg-white/20"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextImage}
                className="absolute right-4 z-10 text-white bg-black/50 hover:bg-white/20"
              >
                <ArrowRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Image */}
          <img
            src={`${API_BASE_URL.replace('/api', '')}/storage/${images[currentIndex]}`}
            alt={`Image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

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

// Delete Confirmation Modal Component
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, itemName }) {
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
          className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-foreground)]">
                  Delete Vehicle
                </h3>
                <p className="text-sm text-[var(--color-foreground)]/70 mt-1">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            
            <p className="text-[var(--color-foreground)]/80 mb-6">
              Are you sure you want to delete "{itemName}"? This will permanently remove the vehicle and all associated data.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                className="bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Vehicle Modal Component (for Add and Edit)
function VehicleModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState(initialData || {
    vehicle_name: '',
    lto_renewal_date: '',
    description: '',
    status: 'pending',
    images: []
  })

  const [selectedImages, setSelectedImages] = useState([])
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (initialData) {
      setFormData({
        vehicle_name: initialData.vehicle_name || '',
        lto_renewal_date: initialData.lto_renewal_date || '',
        description: initialData.description || '',
        status: initialData.status || 'pending',
        images: initialData.images || []
      })
    } else {
      setFormData({
        vehicle_name: '',
        lto_renewal_date: '',
        description: '',
        status: 'pending',
        images: []
      })
    }
    setSelectedImages([])
  }, [initialData])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + selectedImages.length > 10) {
      alert('Maximum 10 images allowed')
      return
    }
    setSelectedImages(prev => [...prev, ...files])
  }

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.vehicle_name || !formData.lto_renewal_date) {
      alert('Vehicle Name and LTO Renewal Date are required fields')
      return
    }
    
    const submitData = new FormData()
    
    // Add form data
    submitData.append('vehicle_name', formData.vehicle_name)
    submitData.append('lto_renewal_date', formData.lto_renewal_date)
    submitData.append('description', formData.description)
    submitData.append('status', formData.status)
    
    // Add images
    selectedImages.forEach((image, index) => {
      submitData.append(`images[${index}]`, image)
    })
    
    if (initialData) {
      submitData.append('_method', 'PUT')
    }
    
    onSubmit(submitData, initialData?.id)
    onClose()
  }

  // Prepare dropdown options
  const statusDropdownOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'complete', label: 'Complete' }
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
          className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                {initialData ? 'Edit Vehicle' : 'Add New Vehicle'}
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
              {/* Images Upload Section */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Images (Max 10)
                </label>
                <div className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Images
                  </Button>
                  
                  {selectedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vehicle Name */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Vehicle Name *
                  </label>
                  <input
                    type="text"
                    value={formData.vehicle_name}
                    onChange={(e) => handleInputChange('vehicle_name', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="e.g., Toyota Hilux, Honda Civic"
                    required
                  />
                </div>

                {/* LTO Renewal Date */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    LTO Renewal Date *
                  </label>
                  <input
                    type="date"
                    value={formData.lto_renewal_date}
                    onChange={(e) => handleInputChange('lto_renewal_date', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors resize-none"
                  rows={3}
                  placeholder="Additional details about the vehicle..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Status
                </label>
                <CustomDropdown
                  options={statusDropdownOptions}
                  value={formData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  placeholder="Select status"
                />
              </div>

              {/* Submit Buttons */}
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
                  className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-90 transition-opacity"
                >
                  {initialData ? 'Update Vehicle' : 'Add Vehicle'}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Success Alert Component
function SuccessAlert({ message, isVisible, onClose }) {
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
        className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
      >
        <CheckCircle className="h-5 w-5" />
        <span>{message}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-white/20 ml-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </motion.div>
    </AnimatePresence>
  )
}

// Main VehicleMonitoring Component
export default function VehicleMonitoring() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [successAlert, setSuccessAlert] = useState({ visible: false, message: '' })
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, vehicleId: null, vehicleName: '' })

  // Fetch vehicles from API
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/vehicles`)
      const data = await response.json()
      
      if (data.success) {
        setVehicles(data.data || [])
      } else {
        console.error('Failed to fetch vehicles:', data.message)
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  // Filter and search vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch = vehicle.vehicle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'All' || vehicle.status === selectedStatus.toLowerCase()
      return matchesSearch && matchesStatus
    })
  }, [vehicles, searchTerm, selectedStatus])

  // Handle vehicle submission (add/edit)
  const handleVehicleSubmit = async (formData, vehicleId = null) => {
    try {
      const url = vehicleId 
        ? `${API_BASE_URL}/vehicles/${vehicleId}` 
        : `${API_BASE_URL}/vehicles`
      
      const method = 'POST'
      
      const response = await fetch(url, {
        method,
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchVehicles()
        setSuccessAlert({
          visible: true,
          message: vehicleId ? 'Vehicle updated successfully!' : 'Vehicle added successfully!'
        })
      } else {
        alert(data.message || 'Failed to save vehicle')
      }
    } catch (error) {
      console.error('Error saving vehicle:', error)
      alert('Failed to save vehicle')
    }
  }

  // Handle vehicle deletion
  const handleDeleteVehicle = async (vehicleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchVehicles()
        setSuccessAlert({
          visible: true,
          message: 'Vehicle deleted successfully!'
        })
      } else {
        alert(data.message || 'Failed to delete vehicle')
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      alert('Failed to delete vehicle')
    }
  }

  // Handle status update
  const handleStatusUpdate = async (vehicleId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchVehicles()
        setSuccessAlert({
          visible: true,
          message: 'Vehicle status updated successfully!'
        })
      } else {
        alert(data.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredVehicles.map(vehicle => ({
      'Vehicle Name': vehicle.vehicle_name,
      'LTO Renewal Date': vehicle.lto_renewal_date,
      'Description': vehicle.description,
      'Status': vehicle.status,
      'Created At': new Date(vehicle.created_at).toLocaleDateString(),
      'Updated At': new Date(vehicle.updated_at).toLocaleDateString()
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicles')
    XLSX.writeFile(wb, `vehicles_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Open image gallery
  const openImageGallery = (images, index = 0) => {
    setSelectedImages(images)
    setSelectedImageIndex(index)
    setImageGalleryOpen(true)
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Check if LTO renewal is due soon (within 30 days)
  const isRenewalDueSoon = (renewalDate) => {
    if (!renewalDate) return false
    const today = new Date()
    const renewal = new Date(renewalDate)
    const diffTime = renewal - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays >= 0
  }

  // Check if LTO renewal is overdue
  const isRenewalOverdue = (renewalDate) => {
    if (!renewalDate) return false
    const today = new Date()
    const renewal = new Date(renewalDate)
    return renewal < today
  }

  // Open delete confirmation modal
  const openDeleteModal = (vehicleId, vehicleName) => {
    setDeleteModal({
      isOpen: true,
      vehicleId,
      vehicleName: vehicleName.length > 50 ? vehicleName.substring(0, 50) + '...' : vehicleName
    })
  }

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, vehicleId: null, vehicleName: '' })
  }

  // Confirm deletion
  const confirmDelete = () => {
    if (deleteModal.vehicleId) {
      handleDeleteVehicle(deleteModal.vehicleId)
      closeDeleteModal()
    }
  }

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      <SuccessAlert
        message={successAlert.message}
        isVisible={successAlert.visible}
        onClose={() => setSuccessAlert({ visible: false, message: '' })}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
            Vehicle Monitoring
          </h1>
          <p className="text-[var(--color-foreground)]/70 mt-1">
            Manage vehicle information and LTO renewal dates
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => {
              setEditingVehicle(null)
              setIsModalOpen(true)
            }}
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
      </motion.div>

      {/* Search and Filter Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-foreground)]/50 h-4 w-4" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {statusOptions.map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? "default" : "outline"}
              onClick={() => setSelectedStatus(status)}
              className={
                selectedStatus === status
                  ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white"
                  : "border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
              }
            >
              {status}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Vehicles Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
        >
          <AnimatePresence>
            {filteredVehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <Card className="h-full border border-[var(--color-border)] hover:shadow-lg transition-all duration-300 hover:border-[var(--color-primary)]/30 bg-[var(--color-card)]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-[var(--color-foreground)] line-clamp-1">
                          {vehicle.vehicle_name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            vehicle.status === 'complete' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {vehicle.status === 'complete' ? 'Complete' : 'Pending'}
                          </div>
                          {isRenewalOverdue(vehicle.lto_renewal_date) && (
                            <AlertCircle className="h-4 w-4 text-red-500" title="LTO Renewal Overdue" />
                          )}
                          {isRenewalDueSoon(vehicle.lto_renewal_date) && !isRenewalOverdue(vehicle.lto_renewal_date) && (
                            <Clock className="h-4 w-4 text-orange-500" title="LTO Renewal Due Soon" />
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingVehicle(vehicle)
                            setIsModalOpen(true)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(vehicle.id, vehicle.vehicle_name)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Vehicle Images */}
                    {vehicle.images && vehicle.images.length > 0 && (
                      <div className="relative">
                        <img
                          src={`${API_BASE_URL.replace('/api', '')}/storage/${vehicle.images[0]}`}
                          alt={vehicle.vehicle_name}
                          className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => openImageGallery(vehicle.images, 0)}
                        />
                        {vehicle.images.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                            +{vehicle.images.length - 1}
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openImageGallery(vehicle.images, 0)}
                          className="absolute inset-0 w-full h-full opacity-0 hover:opacity-100 bg-black/20 transition-opacity flex items-center justify-center"
                        >
                          <ZoomIn className="h-6 w-6 text-white" />
                        </Button>
                      </div>
                    )}

                    {/* LTO Renewal Date */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-[var(--color-foreground)]/50" />
                      <span className="text-[var(--color-foreground)]/70">LTO Renewal:</span>
                      <span className={`font-medium ${
                        isRenewalOverdue(vehicle.lto_renewal_date) 
                          ? 'text-red-600' 
                          : isRenewalDueSoon(vehicle.lto_renewal_date) 
                            ? 'text-orange-600' 
                            : 'text-[var(--color-foreground)]'
                      }`}>
                        {formatDate(vehicle.lto_renewal_date)}
                      </span>
                    </div>

                    {/* Description */}
                    {vehicle.description && (
                      <div className="flex items-start gap-2 text-sm">
                        <FileText className="h-4 w-4 text-[var(--color-foreground)]/50 mt-0.5 flex-shrink-0" />
                        <p className="text-[var(--color-foreground)]/70 line-clamp-2">
                          {vehicle.description}
                        </p>
                      </div>
                    )}

                    {/* Status Update Button */}
                    <Button
                      onClick={() => handleStatusUpdate(
                        vehicle.id, 
                        vehicle.status === 'pending' ? 'complete' : 'pending'
                      )}
                      variant="outline"
                      size="sm"
                      className="w-full border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
                    >
                      Mark as {vehicle.status === 'pending' ? 'Complete' : 'Pending'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && filteredVehicles.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Car className="h-16 w-16 text-[var(--color-foreground)]/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
            No vehicles found
          </h3>
          <p className="text-[var(--color-foreground)]/70 mb-4">
            {searchTerm || selectedStatus !== 'All' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Get started by adding your first vehicle.'}
          </p>
          <Button
            onClick={() => {
              setEditingVehicle(null)
              setIsModalOpen(true)
            }}
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </motion.div>
      )}

      {/* Vehicle Modal */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingVehicle(null)
        }}
        onSubmit={handleVehicleSubmit}
        initialData={editingVehicle}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        itemName={deleteModal.vehicleName}
      />

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={imageGalleryOpen}
        onClose={() => setImageGalleryOpen(false)}
        images={selectedImages}
        initialIndex={selectedImageIndex}
      />
    </div>
  )
}

