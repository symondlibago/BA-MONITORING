import { useEffect, useState } from 'react'
import { isAuthenticated, getUser } from '../utils/auth'
import LoginPage from './LoginPage'

const ProtectedRoute = ({ children, onLogin }) => {
  const [isAuth, setIsAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      const userData = getUser()
      
      setIsAuth(authenticated)
      setUser(userData)
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const handleLogin = (userData) => {
    setIsAuth(true)
    setUser(userData)
    if (onLogin) {
      onLogin(userData)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuth) {
    return <LoginPage onLogin={handleLogin} />
  }

  return children
}

export default ProtectedRoute

