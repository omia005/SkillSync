import { BrowserRouter, Route, Navigate, Routes } from 'react-router-dom'
import Skills from './pages/skills'
import Login from './pages/login'
import Dashboard from './pages/dashboard'
import Portfolio from './pages/portfolio'
import Register from './pages/register'
import Roadmap from './pages/roadmap'
import LandingPage from './pages/home'
import CareerPath from './pages/careerpath'
import NotFound from './pages/Notfound'
import ProtectedRoute from './components/ProtectedRoute'


function Logout(){
  localStorage.clear()
  return <Navigate to = {<LandingPage />}/>
}


function App() {
  return (
    <BrowserRouter>
     <Routes>
        <Route 
          path = '/' element={
            <ProtectedRoute>
              <Dashboard/>
              <CareerPath />
              <Portfolio />
              <Roadmap />
              <Skills />
            </ProtectedRoute>
          }
        />
        <Route path = '/users/login/' element = {<Login />} />
        <Route path = '/users/register/' element = {<Register />} />
        <Route path='/logout' element={<Logout />} />
        <Route path = '/landing/' element = {<LandingPage />} />
        <Route path = '*' element = {<NotFound />} />

        
      </Routes>
    </BrowserRouter>
      
    
  )
}

export default App
