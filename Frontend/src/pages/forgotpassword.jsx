import {useState} from "react"
import api from "../api"
import {toast} from "react-toastify"


function forgotPassword() {

  const [forgotEmail, setForgotEmail] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    try{
      console.log(forgotEmail)
       await api.post("/users/forgot-password/", {email: forgotEmail})
       toast.success("Password reset link sent to your email.")
    } catch (error) {
      toast.error("Failed to send password reset link.")
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
    >
      <h2>Forgot Password</h2>
      <input
        type="email"
        placeholder="Enter your email"
        value={forgotEmail}
        onChange={(e) => setForgotEmail(e.target.value)}
        required
      />
      <button type="submit">Send Reset Link</button>
    </form>
  )
}

export default forgotPassword