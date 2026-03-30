import {Navigate} from "react-router-dom"
import {jwtDecode} from "jwt-decode"
import {ACCESS_TOKEN, REFRESH_TOKEN} from "../constants.js"
import { useEffect, useState } from "react"
import api from "../api/api.js"


function ProtectedRoute({children}){
  const [isAuthorized, setIsAuthorized] = useState(null)

  useEffect(() =>{
     auth().catch(() => setIsAuthorized(false))
  }, [])

  const refreshToken = async() =>{
    const refresh = localStorage.getItem(REFRESH_TOKEN)
    
    try{
      const response = await api.post("/api/token/refresh/", {
      refresh : refresh }, {withCredentials: true})

     if(response.status === 200){
       localStorage.setItem(ACCESS_TOKEN = response.data.access)
       setIsAuthorized(True)
     }
     else{
      setIsAuthorized(false)
     }
    }catch(error){
      console.log(error)
      setIsAuthorized(false)
    }
    

  }
  
  const auth = async() =>{
    const token = localStorage.getItem(ACCESS_TOKEN)

    if(!token){
      setIsAuthorized(false)
      return
    }

    const decode = jwtDecode(token)
    const tokenExp = decode.exp
    const now = Date.now()/1000

    if (tokenExp > now){
      await refreshToken()
    }
    else{
      setIsAuthorized(True)
    }
  }

  if(isAuthorized === null){
    return <div>Loading...</div>
  }
  return isAuthorized ? children : <Navigate to="/users/login"/>
}

export default ProtectedRoute;