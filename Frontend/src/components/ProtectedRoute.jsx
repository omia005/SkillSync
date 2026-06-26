import {useState, useEffect, useCallback} from 'react';
import { Navigate, Outlet } from  'react-router-dom';
import {ACCESS_TOKEN, USER_ROLE} from "../constants"
import api from "../api"
import {jwtDecode} from 'jwt-decode'
import Sidebar from './sidebar';
import { SidebarItem } from './sidebar';
import {
   Settings,
   Info,
   BrainCog,
   UserCog,
   Route,
   LayoutDashboard,
   FileUser,
   ChartLine,
   Target,
   Award,
   Shield,
   Users,
} from 'lucide-react';



function ProtectedRoute({ allowedRoles, children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileComplete, setProfileComplete] = useState(true)
  const [role, setRole] = useState(null)

  const refreshToken = async () => {
    try {
      // Use axios directly to avoid circular interceptor calls
      const axios = (await import("axios")).default;
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/users/token/refresh/`,
        {},
        { withCredentials: true }
      )

      if (res.data.access && res.data.role) {
        sessionStorage.setItem(ACCESS_TOKEN, res.data.access)
        sessionStorage.setItem(USER_ROLE, res.data.role)
        setRole(res.data.role)
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    } catch (err) {
      console.error("Refresh failed:", err)
      setIsAuthenticated(false)
    }
  }

  const checkAuth = useCallback(async () => {
    const token = sessionStorage.getItem(ACCESS_TOKEN)
    const storedRole = sessionStorage.getItem(USER_ROLE)

    if (!token || !storedRole) {
      setIsAuthenticated(false)
      setLoading(false)
      return
    }

    try {
      const decodedToken = jwtDecode(token)
      const now = Date.now() / 1000

      // Validate token expiration
      if (decodedToken.exp < now) {
        await refreshToken()
      } else {
        setIsAuthenticated(true)
        setRole(storedRole)
      }
    } catch (err) {
      console.error("Token decode failed:", err)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const checkProfileComplete = useCallback(async () => {
    try {
      const res = await api.get("/users/profile/", { withCredentials: true })
      if (res.data.is_profile_complete !== undefined) {
        setProfileComplete(res.data.is_profile_complete)
      }
    } catch {
      // If we can't fetch profile, assume complete
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (isAuthenticated && role === 'student') {
      checkProfileComplete()
    }
  }, [isAuthenticated, role, checkProfileComplete])

  // Listen for changes in sessionStorage from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === ACCESS_TOKEN || e.key === USER_ROLE) {
        // Re-check auth when token or role changes in another tab
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [checkAuth])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  // Check if user has access to this route
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect admin to admin dashboard or student to dashboard
    if (role === 'admin') {
      return <Navigate to="/admin-dashboard" />
    }
    return <Navigate to="/dashboard" />
  }

  // ADMIN LAYOUT
  if (role === 'admin') {
    return (
      <div className="flex h-screen overflow-hidden">
      <Sidebar>
        <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" to="/admin-dashboard" />
        <SidebarItem icon={<Target size={20} />} text="Career Paths" to="/admin-career-paths" />
        <SidebarItem icon={<Award size={20} />} text="Skills Catalog" to="/admin-skills" />
        <SidebarItem icon={<Users size={20} />} text="Students" to="/admin-students" />
        <hr className="my-2 border-gray-200" />
        <SidebarItem icon={<Shield size={20} />} text="Admin Panel" to="/admin-dashboard" />
      </Sidebar>
        <main className="flex-1 h-full overflow-y-auto p-6">
          {children}
        </main>
      </div>
    )
  }

  // STUDENT LAYOUT (default)
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar>
        <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" to="/dashboard" />
        <SidebarItem icon={<UserCog size={20} />} text="Profile" to="/setup-profile" alert={!profileComplete} />
        <SidebarItem icon={<Route size={20} />} text="Career Path" to="/career-paths" />
        <SidebarItem icon={<BrainCog size={20} />} text="Skills" to="/skills" />
        <SidebarItem icon={<FileUser size={20} />} text="CV Generator" to="/generate-cv" />
        <SidebarItem icon={<ChartLine size={20} />} text="Skill Gap Analysis" to="/skill-gap-analysis" />
        <hr className="my-2 border-gray-200" />
      </Sidebar>
      <main className="flex-1 h-full overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}

export default ProtectedRoute;