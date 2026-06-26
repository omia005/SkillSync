import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/login.jsx'
import Register from './pages/register.jsx'
import Skills from "./pages/userskills.jsx"
import Dashboard from "./pages/dashboard.jsx"
import SetupProfile from './pages/setup-profile.jsx'
import AdminDashboard from "./pages/admin-dashboard.jsx";
import AdminCareerPaths from "./pages/admin-careerpaths.jsx";
import AdminSkills from "./pages/admin-skills.jsx";
import AdminStudents from "./pages/admin-students.jsx";
import ForgotPassword from "./pages/forgotpassword.jsx"
import ResetPassword from "./pages/resetpassword.jsx"
import NotFound from "./pages/notfound.jsx"
import CareerPathPage from './pages/careerpathpage.jsx'
import CareerDetailPage from './pages/careerdetail.jsx'
import CVBuilder from './pages/cvbuilder.jsx'
import SkillGapAnalysis from './pages/skillgapanalysis.jsx'
import { ACCESS_TOKEN, USER_ROLE } from './constants'
import {ToastContainer} from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';



function Logout(){
   sessionStorage.clear();
   return <Navigate to="/login" />
  }


function App() {

  return (

    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />

        {/* Student Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/setup-profile"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <SetupProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/skills"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Skills />
            </ProtectedRoute>
          }
        />
        <Route
          path="/career-paths/"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <CareerPathPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/career-paths/:slug"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <CareerDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generate-cv"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <CVBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/skill-gap-analysis"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <SkillGapAnalysis />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-career-paths"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCareerPaths />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-skills"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSkills />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-students"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminStudents />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound/>} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
      <ToastContainer  position="top-right"
                      autoClose={3000}
                      hideProgressBar={false}
                      newestOnTop
                      closeOnClick
                      pauseOnHover
                      theme="colored"/>
    </BrowserRouter>
  )
}

export default App