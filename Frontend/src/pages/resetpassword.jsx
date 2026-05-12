import {useState} from 'react'
import { useParams } from 'react-router-dom'
import api from "../api"
import { toast } from "react-toastify"

const resetpassword = () => {

  const { token } = useParams()
  const [password, setPassword] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/users/reset-password/${uidb64}/${token}/`, { password })
      toast.success("Password reset successfully.")
    } catch (error) {
      toast.error("Failed to reset password.")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Reset Password</h2>
      <input
        type="password"
        placeholder="Enter your new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Reset Password</button>
    </form>
  )
}

export default resetpassword