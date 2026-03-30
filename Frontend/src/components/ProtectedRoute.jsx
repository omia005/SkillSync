import {useState, useEffect} from 'react';
import { Navigate} from 'react-router-dom';

import { ACCESS_TOKEN } from 'src/constants';

function ProtectedRoute({children}){
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);



  const refreshToken = async () =>{

   try{
    const res = await api.post('/users/token/refresh/', {}, {withCredentials: true})
    if(res.data.access){
      localStorage.setItem(ACCESS_TOKEN, res.data.access)
      setIsAuthenticated(true);
    }
   }catch(err){
      setIsAuthenticated(false);
      console.error
   }
  }
  
  const checkAuth = async () => {

    const token = localStorage.getItem(ACCESS_TOKEN);

    if(!token){
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    
    decodedToken = jwt_decode(token);
    now = Date.now()/1000;
    if(decodedToken.exp < now){
      await refreshToken();
    }else{
      setIsAuthenticated(true);
    }
  }
  
  if (isAuthorized === null){
    return <div>Loading...</div>
  }

  return isAuthorized ? children : <Navigate to='/login' />
}