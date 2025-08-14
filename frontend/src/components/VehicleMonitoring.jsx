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
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Images
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import * as XLSX from 'xlsx'
import API_BASE_URL from './Config'

// Status options for vehicles
const statusOptions = ['All', 'Pending', 'Complete']

// Success Alert Component
function SuccessAlert({ isVisible, message, onClose }) {
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
        transition={{ duration: 0.3 }}
        className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">{message}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-shrink-0 h-6 w-6 p-0 text-green-600 hover:bg-green-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Helper function to convert image data to data URL
const getImageDataUrl = (imageData) => {
  if (!imageData) return null
  
  // If it's already a data URL, return as is
  if (typeof imageData === 'string' && imageData.startsWith('data:')) {
    return imageData
  }
  
  // If it's an object with data and mime_type, construct data URL
  if (imageData.data && imageData.mime_type) {
    return `data:${imageData.mime_type};base64,${imageData.data}`
  }
  
  return null
}

// Helper function to get image data URLs from vehicle images
const getVehicleImageUrls = (images) => {
  if (!images) return []
  
  // Handle case where images is a JSON string
  let imageArray = images
  if (typeof images === 'string') {
    try {
      imageArray = JSON.parse(images)
    } catch (e) {
      console.error('Failed to parse images JSON:', e)
      return []
    }
  }
  
  if (!Array.isArray(imageArray)) return []
  
  return imageArray.map(getImageDataUrl).filter(Boolean)
}

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

          {/* Image - Now using base64 data URLs directly */}
          <img
            src={images[currentIndex]}
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
  const [formData, setFormData] = useState({
    vehicle_name: '',
    lto_renewal_date: '',
    description: '',
    status: 'pending',
    images: []
  })

  const [selectedImages, setSelectedImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [keepExistingImages, setKeepExistingImages] = useState(true)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (initialData) {
      // Pre-fill form with existing data
      setFormData({
        vehicle_name: initialData.vehicle_name || '',
        lto_renewal_date: initialData.lto_renewal_date || '',
        description: initialData.description || '',
        status: initialData.status || 'pending',
        images: initialData.images || []
      })
      
      // Set existing images for display
      const imageUrls = getVehicleImageUrls(initialData.images)
      setExistingImages(imageUrls)
      setKeepExistingImages(true)
    } else {
      // Reset form for new vehicle
      setFormData({
        vehicle_name: '',
        lto_renewal_date: '',
        description: '',
        status: 'pending',
        images: []
      })
      setExistingImages([])
      setKeepExistingImages(true)
    }
    setSelectedImages([])
  }, [initialData, isOpen])

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
    // When new images are selected, we'll replace existing ones
    setKeepExistingImages(false)
  }

  const removeNewImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const clearNewImages = () => {
    setSelectedImages([])
    setKeepExistingImages(true)
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
    
    // Add images only if new ones are selected
    if (selectedImages.length > 0) {
      selectedImages.forEach((image, index) => {
        submitData.append(`images[${index}]`, image)
      })
    }
    // If no new images and it's an update, the backend will keep existing images
    
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
              {/* Images Section */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Images (Max 10)
                </label>
                
                {/* Existing Images Display (for edit mode) */}
                {initialData && existingImages.length > 0 && keepExistingImages && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[var(--color-foreground)]/70">
                        Current Images ({existingImages.length})
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setKeepExistingImages(false)}
                        className="text-xs"
                      >
                        Replace Images
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-[var(--color-muted)]/30 rounded-lg">
                      {existingImages.map((imageUrl, index) => (
                        <div key={index} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Upload */}
                {(!initialData || !keepExistingImages) && (
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
                      {initialData ? 'Upload New Images' : 'Upload Images'}
                    </Button>
                    
                    {selectedImages.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-[var(--color-foreground)]/70">
                            New Images ({selectedImages.length})
                          </span>
                          {initialData && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={clearNewImages}
                              className="text-xs"
                            >
                              Keep Existing
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                                onClick={() => removeNewImage(index)}
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                    placeholder="e.g., Toyota Camry 2020"
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
                  className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors"
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

// Main Vehicle Monitoring Component
export default function VehicleMonitoring() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [vehicleToDelete, setVehicleToDelete] = useState(null)
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false)
  const [galleryImages, setGalleryImages] = useState([])
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0)
  const [successAlert, setSuccessAlert] = useState({ visible: false, message: '' })

  // Fetch vehicles from API
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/vehicles`)
      if (response.ok) {
        const data = await response.json()
        setVehicles(data.data || [])
      } else {
        console.error('Failed to fetch vehicles')
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

  // Show success alert
  const showSuccessAlert = (message) => {
    setSuccessAlert({ visible: true, message })
  }

  // Hide success alert
  const hideSuccessAlert = () => {
    setSuccessAlert({ visible: false, message: '' })
  }

  // Filter and search vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch = vehicle.vehicle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'All' || vehicle.status === statusFilter.toLowerCase()
      return matchesSearch && matchesStatus
    })
  }, [vehicles, searchTerm, statusFilter])

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex)

  // Handle vehicle submission (add/edit)
  const handleVehicleSubmit = async (formData, vehicleId = null) => {
    try {
      const url = vehicleId 
        ? `${API_BASE_URL}/vehicles/${vehicleId}` 
        : `${API_BASE_URL}/vehicles`
      
      const method = vehicleId ? 'POST' : 'POST' // Laravel handles PUT via _method field
      
      const response = await fetch(url, {
        method,
        body: formData
      })

      if (response.ok) {
        await fetchVehicles()
        showSuccessAlert(vehicleId ? 'Vehicle updated successfully!' : 'Vehicle added successfully!')
        setEditingVehicle(null)
      } else {
        console.error('Failed to save vehicle')
        alert('Failed to save vehicle. Please try again.')
      }
    } catch (error) {
      console.error('Error saving vehicle:', error)
      alert('Error saving vehicle. Please try again.')
    }
  }

  // Handle vehicle deletion
  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return

    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchVehicles()
        showSuccessAlert('Vehicle deleted successfully!')
        setDeleteModalOpen(false)
        setVehicleToDelete(null)
      } else {
        console.error('Failed to delete vehicle')
        alert('Failed to delete vehicle. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      alert('Error deleting vehicle. Please try again.')
    }
  }

  // Handle image gallery
  const openImageGallery = (images, initialIndex = 0) => {
    const imageUrls = getVehicleImageUrls(images)
    if (imageUrls.length > 0) {
      setGalleryImages(imageUrls)
      setGalleryInitialIndex(initialIndex)
      setImageGalleryOpen(true)
    }
  }

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredVehicles.map(vehicle => ({
      'Vehicle Name': vehicle.vehicle_name,
      'LTO Renewal Date': vehicle.lto_renewal_date,
      'Description': vehicle.description,
      'Status': vehicle.status,
      'Created Date': new Date(vehicle.created_at).toLocaleDateString()
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicles')
    XLSX.writeFile(wb, `vehicles_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Prepare dropdown options
  const statusDropdownOptions = statusOptions.map(status => ({
    value: status,
    label: status
  }))

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-6">
      {/* Success Alert */}
      <SuccessAlert
        isVisible={successAlert.visible}
        message={successAlert.message}
        onClose={hideSuccessAlert}
      />

      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
              Vehicle Monitoring
            </h1>
            <p className="text-[var(--color-foreground)]/70 mt-2">
              Track and manage vehicle registrations and renewals
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={exportToExcel}
              variant="outline"
              className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)] transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button
              onClick={() => {
                setEditingVehicle(null)
                setIsModalOpen(true)
              }}
              className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <Card className="border-[var(--color-border)] bg-[var(--color-card)]">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-foreground)]/50" />
                  <input
                    type="text"
                    placeholder="Search vehicles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="w-full md:w-48">
                <CustomDropdown
                  options={statusDropdownOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="Filter by status"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Vehicle Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
          </div>
        ) : currentVehicles.length === 0 ? (
          <Card className="border-[var(--color-border)] bg-[var(--color-card)]">
            <CardContent className="p-12 text-center">
              <Car className="h-12 w-12 text-[var(--color-foreground)]/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
                No vehicles found
              </h3>
              <p className="text-[var(--color-foreground)]/70 mb-4">
                {searchTerm || statusFilter !== 'All' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first vehicle.'}
              </p>
              {!searchTerm && statusFilter === 'All' && (
                <Button
                  onClick={() => {
                    setEditingVehicle(null)
                    setIsModalOpen(true)
                  }}
                  className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vehicle
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentVehicles.map((vehicle, index) => {
              const imageUrls = getVehicleImageUrls(vehicle.images)
              const hasImages = imageUrls.length > 0
              
              return (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="border-[var(--color-border)] bg-[var(--color-card)] hover:shadow-lg transition-all duration-200 h-full">
                    <CardContent className="p-4">
                      {/* Image Section */}
                      <div className="relative mb-4">
                        {hasImages ? (
                          <div className="relative">
                            <img
                              src={imageUrls[0]}
                              alt={vehicle.vehicle_name}
                              className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => openImageGallery(vehicle.images, 0)}
                            />
                            {imageUrls.length > 1 && (
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                                <Images className="h-3 w-3" />
                                +{imageUrls.length - 1} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-48 bg-[var(--color-muted)] rounded-lg flex items-center justify-center">
                            <Car className="h-12 w-12 text-[var(--color-foreground)]/30" />
                          </div>
                        )}
                      </div>

                      {/* Vehicle Info */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-[var(--color-foreground)] text-lg line-clamp-1">
                            {vehicle.vehicle_name}
                          </h3>
                          {vehicle.description && (
                            <p className="text-sm text-[var(--color-foreground)]/70 line-clamp-2 mt-1">
                              {vehicle.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-[var(--color-foreground)]/50" />
                          <span className="text-[var(--color-foreground)]/70">
                            {new Date(vehicle.lto_renewal_date).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              vehicle.status === 'complete' ? 'bg-green-500' : 'bg-yellow-500'
                            }`} />
                            <span className="text-sm text-[var(--color-foreground)]/70 capitalize">
                              {vehicle.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingVehicle(vehicle)
                                setIsModalOpen(true)
                              }}
                              className="h-8 w-8 p-0 text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setVehicleToDelete(vehicle)
                                setDeleteModalOpen(true)
                              }}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex items-center justify-center gap-2"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-[var(--color-foreground)]/70 px-4">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* Modals */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingVehicle(null)
        }}
        onSubmit={handleVehicleSubmit}
        initialData={editingVehicle}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setVehicleToDelete(null)
        }}
        onConfirm={handleDeleteVehicle}
        itemName={vehicleToDelete?.vehicle_name}
      />

      <ImageGalleryModal
        isOpen={imageGalleryOpen}
        onClose={() => setImageGalleryOpen(false)}
        images={galleryImages}
        initialIndex={galleryInitialIndex}
      />
    </div>
  )
}

