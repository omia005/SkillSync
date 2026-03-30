import {useState} from "react"
import { Navigate } from "react-router-dom"
import api from "../api/api.js"
import { ACCESS_TOKEN } from "../constants"

function Form({route, method}){
  const [email, setEmail] = useState(null)
  const [password, setPassword] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  

  const name = method === 'login' ? "Login" : "Register"

  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault()
    try{
      const res = await api.post(route, {username, password}, {withCredentials: true})
      if(res.data.access){
        localStorage.setItem(ACCESS_TOKEN = res.data.access)
        //refresh token is set in httpOnly cookie, so we don't need to do anything with it here
        Navigate('/')
      }else{
        Navigate('/login')
      }
      
    }catch(err){
       console.log(err)
       Navigate('/login')
    }finally{
      setLoading(false)
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <h2>{name}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Please wait...' : name}
      </button>
    </Form>
  )
}

export default Form;