import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Users, 
  UserCheck, 
  Clock, 
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Phone,
  MapPin,
  Calendar,
  Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'

const Employee = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [positionFilter, setPositionFilter] = useState('All')
  const [departmentFilter, setDepartmentFilter] = useState('All')

  // Sample employee data
  const employees = [
    {
      id: 'EMP001',
      name: 'John Doe',
      age: 32,
      phone: '+1 (555) 123-4567',
      address: '123 Main St, New York, NY 10001',
      position: 'Construction Worker',
      department: 'Construction',
      yearStarted: 2020,
      status: 'Regular',
      avatar: 'JD'
    },
    {
      id: 'EMP002',
      name: 'Jane Smith',
      age: 28,
      phone: '+1 (555) 234-5678',
      address: '456 Oak Ave, Los Angeles, CA 90210',
      position: 'Site Supervisor',
      department: 'Management',
      yearStarted: 2019,
      status: 'Regular',
      avatar: 'JS'
    },
    {
      id: 'EMP003',
      name: 'Mike Johnson',
      age: 35,
      phone: '+1 (555) 345-6789',
      address: '789 Pine Rd, Chicago, IL 60601',
      position: 'Equipment Operator',
      department: 'Operations',
      yearStarted: 2021,
      status: 'Regular',
      avatar: 'MJ'
    },
    {
      id: 'EMP004',
      name: 'Sarah Wilson',
      age: 29,
      phone: '+1 (555) 456-7890',
      address: '321 Elm St, Houston, TX 77001',
      position: 'Safety Inspector',
      department: 'Safety',
      yearStarted: 2022,
      status: 'Regular',
      avatar: 'SW'
    },
    {
      id: 'EMP005',
      name: 'David Brown',
      age: 26,
      phone: '+1 (555) 567-8901',
      address: '654 Maple Dr, Phoenix, AZ 85001',
      position: 'Maintenance Worker',
      department: 'Maintenance',
      yearStarted: 2023,
      status: 'Under Probation',
      avatar: 'DB'
    },
    {
      id: 'EMP006',
      name: 'Lisa Garcia',
      age: 31,
      phone: '+1 (555) 678-9012',
      address: '987 Cedar Ln, Philadelphia, PA 19101',
      position: 'Administrative Assistant',
      department: 'Administration',
      yearStarted: 2018,
      status: 'Regular',
      avatar: 'LG'
    },
    {
      id: 'EMP007',
      name: 'Tom Anderson',
      age: 24,
      phone: '+1 (555) 789-0123',
      address: '147 Birch St, San Antonio, TX 78201',
      position: 'Junior Engineer',
      department: 'Engineering',
      yearStarted: 2024,
      status: 'Under Probation',
      avatar: 'TA'
    },
    {
      id: 'EMP008',
      name: 'Emily Davis',
      age: 33,
      phone: '+1 (555) 890-1234',
      address: '258 Spruce Ave, San Diego, CA 92101',
      position: 'Project Manager',
      department: 'Management',
      yearStarted: 2017,
      status: 'Regular',
      avatar: 'ED'
    }
  ]

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'All' || employee.status === statusFilter
    const matchesPosition = positionFilter === 'All' || employee.position === positionFilter
    const matchesDepartment = departmentFilter === 'All' || employee.department === departmentFilter
    
    return matchesSearch && matchesStatus && matchesPosition && matchesDepartment
  })

  // Calculate statistics
  const totalEmployees = employees.length
  const regularEmployees = employees.filter(emp => emp.status === 'Regular').length
  const probationEmployees = employees.filter(emp => emp.status === 'Under Probation').length

  // Get unique values for filters
  const positions = [...new Set(employees.map(emp => emp.position))]
  const departments = [...new Set(employees.map(emp => emp.department))]

  const getStatusColor = (status) => {
    return status === 'Regular' ? 'text-[var(--color-primary)]' : 'text-[var(--color-secondary)]'
  }

  const getStatusBadge = (status) => {
    return status === 'Regular' 
      ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border-[var(--color-primary)]/30' 
      : 'bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] border-[var(--color-secondary)]/30'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
            Employee Management
          </h1>
          <p className="text-[var(--color-foreground)]/70 mt-1">Manage and track all employee information</p>
        </div>
        <Button className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-secondary)] hover:to-[var(--color-primary)] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="bg-white border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground)]/70">Total Employees</p>
                <p className="text-3xl font-bold text-[var(--color-foreground)]">{totalEmployees}</p>
                <p className="text-sm text-[var(--color-primary)] mt-1">Active workforce</p>
              </div>
              <div className="p-3 bg-[var(--color-primary)]/20 rounded-lg">
                <Users className="h-8 w-8 text-[var(--color-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground)]/70">Regular Employees</p>
                <p className="text-3xl font-bold text-[var(--color-foreground)]">{regularEmployees}</p>
                <p className="text-sm text-[var(--color-primary)] mt-1">Permanent staff</p>
              </div>
              <div className="p-3 bg-[var(--color-primary)]/20 rounded-lg">
                <UserCheck className="h-8 w-8 text-[var(--color-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground)]/70">Under Probation</p>
                <p className="text-3xl font-bold text-[var(--color-foreground)]">{probationEmployees}</p>
                <p className="text-sm text-[var(--color-secondary)] mt-1">Probationary period</p>
              </div>
              <div className="p-3 bg-[var(--color-secondary)]/20 rounded-lg">
                <Clock className="h-8 w-8 text-[var(--color-secondary)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border-[var(--color-border)] rounded-lg p-6 shadow-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-foreground)]/70 h-4 w-4" />
              <Input
                placeholder="Search employees, positions, or departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[var(--color-input)] border-[var(--color-border)] text-[var(--color-foreground)] placeholder-[var(--color-foreground)]/50"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
          >
            <option value="All">All Status</option>
            <option value="Regular">Regular</option>
            <option value="Under Probation">Under Probation</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
          >
            <option value="All">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <Button variant="outline" className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-card)]">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Employee Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredEmployees.map((employee, index) => (
          <motion.div
            key={employee.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 + 0.4 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="bg-white border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-300 shadow-md">
              <CardContent className="p-6">
                {/* Employee Header */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-bold">
                    {employee.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--color-foreground)]">{employee.name}</h3>
                    <p className="text-sm text-[var(--color-foreground)]/70">{employee.id}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs border ${getStatusBadge(employee.status)}`}>
                    {employee.status}
                  </div>
                </div>

                {/* Employee Details */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Briefcase className="h-4 w-4 text-[var(--color-primary)]" />
                    <span className="text-[var(--color-foreground)]/70">{employee.position}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
                    <span className="text-[var(--color-foreground)]/70">Age: {employee.age} • Started: {employee.yearStarted}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-[var(--color-primary)]" />
                    <span className="text-[var(--color-foreground)]/70">{employee.phone}</span>
                  </div>
                  
                  <div className="flex items-start space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-[var(--color-primary)] mt-0.5" />
                    <span className="text-[var(--color-foreground)]/70 line-clamp-2">{employee.address}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 mt-4 pt-4 border-t border-[var(--color-border)]">
                  <Button size="sm" variant="outline" className="flex-1 border-[var(--color-primary)]/30 text-[var(--color-primary)] hover:bg-[#0e1048] hover:text-white">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-[var(--color-secondary)]/30 text-[var(--color-secondary)] hover:bg-[#0e1048] hover:text-white">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="border-[var(--color-destructive)]/30 text-[var(--color-destructive)] hover:bg-[#0e1048] hover:text-white">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* No Results */}
      {filteredEmployees.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="h-16 w-16 text-[var(--color-foreground)]/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[var(--color-foreground)]/70 mb-2">No employees found</h3>
          <p className="text-[var(--color-foreground)]/50">Try adjusting your search criteria or filters</p>
        </motion.div>
      )}
    </div>
  )
}

export default Employee




