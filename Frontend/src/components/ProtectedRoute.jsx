import {useState, useEffect} from 'react';
import { Navigate, Outlet } from  'react-router-dom';
import {ACCESS_TOKEN, USER_ROLE} from "../constants"
import api from "../api"
import {jwtDecode} from 'jwt-decode'
import Sidebar from './sidebar';
import { SidebarItem } from './sidebar';
import { Settings, Info, BrainCog, UserCog, Route, LayoutDashboard, FileUser, ChartLine} from 'lucide-react';



function ProtectedRoute({ allowedRoles, children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshToken = async () => {
    try {
      const res = await api.post(
        "/users/token/refresh/",
        {},
        { withCredentials: true }
      )

      if (res.data.access) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access)
        localStorage.setItem(USER_ROLE, res.data.role)
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    } catch (err) {
      console.error("Refresh failed:", err)
      setIsAuthenticated(false)
    }
  }

  const checkAuth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN) || sessionStorage.getItem(ACCESS_TOKEN)
    const role = localStorage.getItem(USER_ROLE) || sessionStorage.getItem(USER_ROLE)

    if (!token) {
      setIsAuthenticated(false)
      setLoading(false)
      return
    }

    if (isAuthenticated && allowedRoles && !allowedRoles.includes(role)) {
      setIsAuthenticated(false)
      setLoading(false)
      return
    }

    try {
      const decodedToken = jwtDecode(token)
      const now = Date.now() / 1000

      if (decodedToken.exp < now) {
        await refreshToken()
      } else {
        setIsAuthenticated(true)
      }
    } catch (err) {
      console.error("Token decode failed:", err)
      setIsAuthenticated(false)
    } finally {
      setLoading(false) //VERY IMPORTANT
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return (

    <div className="flex h-screen overflow-hidden">
      
      <Sidebar>
        <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" to="/dashboard" />
        <SidebarItem icon={<UserCog size={20} />} text="Profile" to="/setup-profile" />
        <SidebarItem icon={<Route size={20} />} text="Career Path" to="/career-paths" />
        <SidebarItem icon={<BrainCog size={20} />} text="Skills" to="/skills" alert/>
        <SidebarItem icon={<FileUser size={20} />} text="CV Generator" to="/cv-builder" />
        <SidebarItem icon={<ChartLine size={20} />} text="Skill Gap Analysis" to="/skill-gap-analysis" />
        <hr className="my-2 border-gray-200" />
        <SidebarItem icon={<Info size={20} />} text="Info" to="/info" />
        <SidebarItem icon={<Settings size={20} />} text="Settings" to="/settings" />
      </Sidebar>
      
      
      <main className="flex-1  h-full overflow-y-auto p-6">
        {children}
      </main>
    </div>

  );
}

export default ProtectedRoute;