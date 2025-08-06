import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Receipt,
  Wrench,
  ClipboardList,
  DollarSign,
  Menu,
  X,
  Home,
  ChevronLeft,
  ChevronRight,
  Users,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import './App.css'

// Import components
import Dashboard from './components/Dashboard'
import ExpensesReceipts from './components/ExpensesReceipts'
import EquipmentInventory from './components/EquipmentInventory'
import TaskMonitoring from './components/TaskMonitoring'
import WorkersPayroll from './components/WorkersPayroll'
import Employee from './components/Employee'
import ProtectedRoute from './components/ProtectedRoute'
import { logout, isAuthenticated, getUser } from './utils/auth'

const navigationItems = [
  { path: '/', icon: Home, label: 'Dashboard', color: 'text-white' },
  { path: '/expenses', icon: Receipt, label: 'Expenses & Receipts', color: 'text-white' },
  { path: '/inventory', icon: Wrench, label: 'Equipment Inventory', color: 'text-white' },
  { path: '/tasks', icon: ClipboardList, label: 'Task Monitoring', color: 'text-white' },
  { path: '/payroll', icon: DollarSign, label: 'Workers Payroll', color: 'text-white' },
  { path: '/employees', icon: Users, label: 'Employee Management', color: 'text-white' },
]

function Sidebar({ isCollapsed, toggleSidebar, onLogout, isMobile, closeMobileSidebar }) {
  const location = useLocation()

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed && !isMobile ? 80 : isMobile && !isCollapsed ? '100%' : 280, x: isMobile && isCollapsed ? '-100%' : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-full bg-[var(--color-sidebar)] border-r border-[var(--color-sidebar-border)] z-50 flex flex-col"
    >
      {/* Header with toggle button */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-sidebar-border)] h-16">
        <AnimatePresence mode="wait">
          {(!isCollapsed || isMobile) && (
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="text-lg font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-white"
            >
              Monitoring Systems
            </motion.h1>
          )}
        </AnimatePresence>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="text-[var(--color-sidebar-foreground)] hover:bg-[var(--color-sidebar-accent)] ml-auto"
        >
          {isCollapsed && !isMobile ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-2 space-y-1">
        {navigationItems.map((item, index) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 0.1 }}
            >
              <Link to={item.path} onClick={isMobile ? closeMobileSidebar : undefined}>
              <motion.div
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-white text-[#0e1048] border border-[#0e1048]'
                    : 'hover:bg-[var(--color-sidebar-accent)]/50 text-white'
                }`}

                >

                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-[#0e1048]' : item.color}`} />



                  <AnimatePresence mode="wait">
                    {(!isCollapsed || isMobile) && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`font-medium whitespace-nowrap ${isActive ? 'text-[#0e1048]' : 'text-[var(--color-sidebar-foreground)]'}`}


                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Active indicator */}
                  {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className={`absolute right-2 w-2 h-2 rounded-full bg-[#0e1048]`}
                  />
                )}



                  {/* Tooltip for collapsed state */}
                  {isCollapsed && !isMobile && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--color-sidebar-accent)] text-[var(--color-sidebar-accent-foreground)] text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Logout Button */}
<div className="p-2 border-t border-[var(--color-sidebar-border)]">
  <motion.button
    whileHover={{ scale: 1.02, x: 2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onLogout}
    className="relative flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group w-full hover:bg-[var(--color-destructive)]/20 text-white"
  >
    <LogOut className="h-5 w-5 flex-shrink-0 text-white" />

    {/* Animated Logout Text (only if expanded) */}
    <AnimatePresence mode="wait">
      {(!isCollapsed || isMobile) && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="font-medium whitespace-nowrap"
        >
          Logout
        </motion.span>
      )}
    </AnimatePresence>

    {/* Tooltip for collapsed state */}
    {isCollapsed && !isMobile && (
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-[var(--color-sidebar-accent)] text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
        Logout
      </div>
    )}
  </motion.button>
</div>


      {/* Footer status indicator */}
      <div className="p-4 border-t border-[var(--color-sidebar-border)]">
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
    className={`${isCollapsed && !isMobile ? 'flex justify-center' : ''}`}
  >
    {isCollapsed && !isMobile ? (
      <div className="flex flex-col space-y-1">
        <div className="w-2 h-2 bg-[var(--color-chart-1)] rounded-full animate-pulse"></div>
        <div
          className="w-2 h-2 bg-[var(--color-chart-2)] rounded-full animate-pulse"
          style={{ animationDelay: '0.2s' }}
        ></div>
        <div
          className="w-2 h-2 bg-[var(--color-chart-3)] rounded-full animate-pulse"
          style={{ animationDelay: '0.4s' }}
        ></div>
      </div>
    ) : (
      <div className="p-3 bg-[var(--color-sidebar-accent)]/10 rounded-lg border border-[var(--color-sidebar-border)] text-sm text-white text-center">
        <p>
          Made with <span className="text-red-500">❤</span><span className="font-semibold"></span>
        </p>
      </div>
    )}
  </motion.div>
</div>

    </motion.div>
  )
}

function MainContent({ sidebarCollapsed, onLogout, isMobile }) {
  const location = useLocation()

  return (
    <motion.main
      initial={false}
      animate={{
        marginLeft: isMobile ? 0 : (sidebarCollapsed ? 80 : 280),
        width: isMobile ? '100%' : (sidebarCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 280px)')
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen"
    >
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="p-6"
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/expenses" element={<ExpensesReceipts />} />
          <Route path="/inventory" element={<EquipmentInventory />} />
          <Route path="/tasks" element={<TaskMonitoring />} />
          <Route path="/payroll" element={<WorkersPayroll />} />
          <Route path="/employees" element={<Employee />} />
        </Routes>
      </motion.div>
    </motion.main>
  )
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [user, setUser] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    // Check if user is already authenticated on app load
    if (isAuthenticated()) {
      setIsLoggedIn(true)
      setUser(getUser())
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true) // Collapse sidebar by default on mobile
    } else {
      setSidebarCollapsed(false) // Expand sidebar by default on desktop
    }
  }, [isMobile])

  const handleLogin = (userData) => {
    setIsLoggedIn(true)
    setUser(userData)
  }

  const handleLogout = async () => {
    await logout()
    setIsLoggedIn(false)
    setUser(null)
    setSidebarCollapsed(false)
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const closeMobileSidebar = () => {
    if (isMobile) {
      setSidebarCollapsed(true)
    }
  }

  return (
    <Router>
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
        {isLoggedIn && isMobile && (
          <div className="mobile-menu-button-container">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mobile-menu-button"
            >
              {sidebarCollapsed ? <Menu className="h-6 w-6" /> : <X className="h-6 w-6" />}
            </Button>
          </div>
        )}
        <ProtectedRoute onLogin={handleLogin}>
          <Sidebar
            isCollapsed={sidebarCollapsed}
            toggleSidebar={toggleSidebar}
            onLogout={handleLogout}
            isMobile={isMobile}
            closeMobileSidebar={closeMobileSidebar}
          />
          <MainContent
            sidebarCollapsed={sidebarCollapsed}
            onLogout={handleLogout}
            isMobile={isMobile}
          />
        </ProtectedRoute>
      </div>
    </Router>
  )
}

export default App


