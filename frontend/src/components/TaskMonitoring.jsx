import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  ClipboardList, 
  Users, 
  Calendar, 
  Clock,
  MapPin,
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle,
  Play,
  Pause,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Flag
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'

// Sample data for tasks
const initialTasks = [
  {
    id: 1,
    name: 'General Cleaning for Today',
    description: 'Complete cleaning of all office areas including restrooms and common areas',
    assignedMembers: ['John Doe', 'Jane Smith'],
    date: '2024-07-24',
    startTime: '08:00',
    endTime: '12:00',
    location: 'Office Building - All Floors',
    status: 'In Progress',
    priority: 'High',
    progress: 65,
    category: 'Maintenance',
    estimatedHours: 4,
    actualHours: 2.6
  },
  {
    id: 2,
    name: 'Equipment Maintenance Check',
    description: 'Monthly inspection and maintenance of all power tools and equipment',
    assignedMembers: ['Mike Johnson', 'Sarah Wilson'],
    date: '2024-07-24',
    startTime: '13:00',
    endTime: '17:00',
    location: 'Tool Room A & B',
    status: 'Pending',
    priority: 'Medium',
    progress: 0,
    category: 'Maintenance',
    estimatedHours: 4,
    actualHours: 0
  },
  {
    id: 3,
    name: 'Safety Training Session',
    description: 'Quarterly safety training for all construction workers',
    assignedMembers: ['David Brown', 'Lisa Garcia', 'Tom Anderson'],
    date: '2024-07-25',
    startTime: '09:00',
    endTime: '11:00',
    location: 'Conference Room A',
    status: 'Scheduled',
    priority: 'High',
    progress: 0,
    category: 'Training',
    estimatedHours: 2,
    actualHours: 0
  },
  {
    id: 4,
    name: 'Inventory Count',
    description: 'Monthly inventory count of all tools and supplies',
    assignedMembers: ['Anna Martinez', 'Chris Lee'],
    date: '2024-07-23',
    startTime: '14:00',
    endTime: '18:00',
    location: 'Warehouse',
    status: 'Completed',
    priority: 'Medium',
    progress: 100,
    category: 'Inventory',
    estimatedHours: 4,
    actualHours: 3.5
  },
  {
    id: 5,
    name: 'Site Inspection',
    description: 'Weekly site inspection for safety compliance and progress review',
    assignedMembers: ['Robert Taylor', 'Emily Davis'],
    date: '2024-07-26',
    startTime: '10:00',
    endTime: '14:00',
    location: 'Construction Site A',
    status: 'Scheduled',
    priority: 'High',
    progress: 0,
    category: 'Inspection',
    estimatedHours: 4,
    actualHours: 0
  },
  {
    id: 6,
    name: 'Equipment Repair',
    description: 'Repair broken drill and replace worn parts',
    assignedMembers: ['Kevin White'],
    date: '2024-07-24',
    startTime: '15:00',
    endTime: '16:30',
    location: 'Repair Shop',
    status: 'Overdue',
    priority: 'High',
    progress: 25,
    category: 'Repair',
    estimatedHours: 1.5,
    actualHours: 0.5
  }
]

const statusOptions = ['All', 'Pending', 'In Progress', 'Completed', 'Scheduled', 'Overdue']
const priorityOptions = ['All', 'Low', 'Medium', 'High', 'Critical']
const categoryOptions = ['All', 'Maintenance', 'Training', 'Inventory', 'Inspection', 'Repair']

function TaskMonitoring() {
  const [tasks, setTasks] = useState(initialTasks)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedPriority, setSelectedPriority] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showAddForm, setShowAddForm] = useState(false)

  // Filter tasks based on search term, status, priority, and category
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.assignedMembers.some(member => member.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           task.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'All' || task.status === selectedStatus
      const matchesPriority = selectedPriority === 'All' || task.priority === selectedPriority
      const matchesCategory = selectedCategory === 'All' || task.category === selectedCategory
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory
    })
  }, [tasks, searchTerm, selectedStatus, selectedPriority, selectedCategory])

  // Calculate statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === 'Completed').length
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length
  const overdueTasks = tasks.filter(task => task.status === 'Overdue').length

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border-[var(--color-primary)]/30'
      case 'In Progress': return 'bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] border-[var(--color-secondary)]/30'
      case 'Pending': return 'bg-[var(--color-muted)]/20 text-[var(--color-muted)] border-[var(--color-muted)]/30'
      case 'Scheduled': return 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border-[var(--color-accent)]/30'
      case 'Overdue': return 'bg-[var(--color-destructive)]/20 text-[var(--color-destructive)] border-[var(--color-destructive)]/30'
      default: return 'bg-[var(--color-muted)]/20 text-[var(--color-muted)] border-[var(--color-muted)]/30'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-[var(--color-destructive)]'
      case 'High': return 'text-[var(--color-primary)]'
      case 'Medium': return 'text-[var(--color-secondary)]'
      case 'Low': return 'text-[var(--color-muted)]'
      default: return 'text-[var(--color-foreground)]/70'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return CheckCircle
      case 'In Progress': return Play
      case 'Pending': return Pause
      case 'Scheduled': return Calendar
      case 'Overdue': return AlertCircle
      default: return ClipboardList
    }
  }

  const TaskCard = ({ task, index }) => {
    const StatusIcon = getStatusIcon(task.status)
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ scale: 1.01 }}
        className="group"
      >
        <Card className="bg-white border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-300 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">{task.name}</h3>
                <p className="text-sm text-[var(--color-foreground)]/70 mb-3">{task.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Flag className={`h-4 w-4 ${getPriorityColor(task.priority)}`} />
                <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
                  <span className="text-[var(--color-foreground)]/70">{task.date}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-[var(--color-primary)]" />
                  <span className="text-[var(--color-foreground)]/70">{task.startTime} - {task.endTime}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                  <span className="text-[var(--color-foreground)]/70">{task.location}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4 text-[var(--color-primary)]" />
                  <span className="text-[var(--color-foreground)]/70">{task.assignedMembers.length} members</span>
                </div>
                <div className="text-sm">
                  <span className="text-[var(--color-foreground)]/70">Category: </span>
                  <span className="text-[var(--color-foreground)]">{task.category}</span>
                </div>
                <div className="text-sm">
                  <span className="text-[var(--color-foreground)]/70">Priority: </span>
                  <span className={getPriorityColor(task.priority)}>{task.priority}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[var(--color-foreground)]/70">Progress</span>
                <span className="text-[var(--color-foreground)]">{task.progress}%</span>
              </div>
              <div className="w-full bg-[var(--color-muted)] rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={`h-2 rounded-full ${
                    task.progress === 100 ? 'bg-[var(--color-primary)]' :
                    task.progress > 50 ? 'bg-[var(--color-secondary)]' :
                    task.progress > 0 ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-muted)]'
                  }`}
                />
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-[var(--color-foreground)] mb-2">Assigned Members:</h4>
              <div className="flex flex-wrap gap-2">
                {task.assignedMembers.map((member, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-[var(--color-muted)] text-[var(--color-muted-foreground)] rounded-full text-xs"
                  >
                    {member}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-xs text-[var(--color-foreground)]/70">
                <span>Est: {task.estimatedHours}h</span>
                {task.actualHours > 0 && (
                  <span className="ml-2">Actual: {task.actualHours}h</span>
                )}
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="ghost" className="text-[var(--color-primary)] hover:bg-[#0e1048] hover:text-white">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-[var(--color-secondary)] hover:bg-[#0e1048] hover:text-white">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-[var(--color-destructive)] hover:bg-[#0e1048] hover:text-white">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
            Task Monitoring
          </h1>
          <p className="text-[var(--color-foreground)]/70 mt-2">Track and manage all tasks and assignments</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-secondary)] hover:to-[var(--color-primary)] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </motion.div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Tasks', count: totalTasks, color: 'from-[var(--color-primary)] to-[var(--color-secondary)]', icon: ClipboardList },
          { title: 'Completed', count: completedTasks, color: 'from-[var(--color-primary)] to-[var(--color-secondary)]', icon: CheckCircle },
          { title: 'In Progress', count: inProgressTasks, color: 'from-[var(--color-primary)] to-[var(--color-secondary)]', icon: Play },
          { title: 'Overdue', count: overdueTasks, color: 'from-[var(--color-primary)] to-[var(--color-secondary)]', icon: AlertCircle }
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
              <Card className="bg-white border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--color-foreground)]/70">{stat.title}</p>
                      <p className="text-2xl font-bold text-[var(--color-foreground)]">{stat.count}</p>
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
        <Card className="bg-white border-[var(--color-border)] shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-foreground)]/70" />
                <input
                  type="text"
                  placeholder="Search tasks, members, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] placeholder-[var(--color-foreground)]/50 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none appearance-none cursor-pointer"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>

                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none appearance-none cursor-pointer"
                >
                  {priorityOptions.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none appearance-none cursor-pointer"
                >
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tasks Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {filteredTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <ClipboardList className="h-16 w-16 text-[var(--color-foreground)]/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[var(--color-foreground)]/70 mb-2">No tasks found</h3>
          <p className="text-[var(--color-foreground)]/50">Try adjusting your search criteria or create a new task.</p>
        </motion.div>
      )}
    </div>
  )
}

export default TaskMonitoring




