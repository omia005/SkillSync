import {useState} from "react"
import {useNavigate} from "react-router-dom"
import {ACCESS_TOKEN, USER_ROLE, FIRST_NAME, LAST_NAME, REFRESH_TOKEN} from "../constants"
import api from "../api"
import { toast } from "react-toastify"

function Form({route, method}){
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setshowPassword] = useState(false)
    const [confirmPassword, setConfirmPassword] =useState("")
    const navigate = useNavigate()
    const [shake, setShake] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")

    const name = method === "login" ? "Login" : "Register";
    

    const isEmailValid = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const validatePassword = (password) => {
      if (password.length < 8) {
       return "Password must be at least 8 characters"
      }
      if (!/[A-Z]/.test(password)) {
        return "Password must include an uppercase letter"
      }
      if (!/[a-z]/.test(password)) {
        return "Password must include a lowercase letter"
      }
      if (!/[0-9]/.test(password)) {
        return "Password must include a number"
      }
      return null
    }

    const passwordError = validatePassword(password)

    const handleSubmit = async (e) => {
      e.preventDefault()
      localStorage.clear();
      sessionStorage.clear();
      setLoading(true)  
      
      
      //Email validation
      if (!isEmailValid(email)) {
        toast.dismiss()
        toast.error("Please enter a valid email address")
        setShake(true)
        setTimeout(() => setShake(false), 300)
        setLoading(false)
        return
      }
  
      //Password validation
      if (method === "register" && passwordError) {
        toast.dismiss()
        toast.error(passwordError)
        setShake(true)
        setTimeout(() => setShake(false), 300)
        setLoading(false)
        return
      }

      //Confirm password validation
      if (method === "register" && password !== confirmPassword){
       toast.dismiss()
       toast.error("Passwords do not match")
       setShake(true)
       setTimeout(() => setShake(false), 300)
       setLoading(false)
       return
      }
      

    try{
        
        const payload = method === "register" ? {first_name: firstName, last_name: lastName, email, password}
                                              : { email, password }
        const response = await api.post(route, payload)
        const access =
         response.data.access ||
         response.data.tokens?.access
        
        const role = response.data.user?.role ||  response.data.role
        const first_name = response.data.first_name || response.data.user?.first_name
        const last_name = response.data.last_name || response.data.user?.last_name
        const refresh = response.data.refresh || response.data.tokens?.refresh

        console.log("RESPONSE:", response.data)
        
        if (!access) {
         toast.error("Authentication failed")
         return

        }
        if(rememberMe){
            localStorage.setItem(ACCESS_TOKEN, refresh)
            localStorage.setItem(REFRESH_TOKEN, access)
            localStorage.setItem(USER_ROLE, role)
            localStorage.setItem(FIRST_NAME, first_name)
            localStorage.setItem(LAST_NAME, last_name)
            localStorage.setItem("email", response.data.email)
          }else{
            sessionStorage.setItem(ACCESS_TOKEN, access)
            sessionStorage.setItem(REFRESH_TOKEN, access)
            sessionStorage.setItem(USER_ROLE, role)
            sessionStorage.setItem(FIRST_NAME, first_name)
            sessionStorage.setItem(LAST_NAME, last_name)
            sessionStorage.setItem("email", response.data.email)
          }
          console.log("ACCESS_TOKEN:", access, "USER_ROLE:", role)
          
          toast.dismiss()
          toast.success(`${method} successful 🎉`)
          setLoading(false)

          if(role === "admin"){
            return navigate("/admin-dashboard")
            
          }else
          if(role === "student"){
            if(response.data.is_first_login || response.data.user?.is_first_login){
              console.log(response.data.is_first_login)
              navigate("/setup-profile")
              return 
            }

            if(!response.data.is_profile_complete || !response.data.user?.is_profile_complete){
              console.log(response.data.is_profile_complete)
              navigate("/dashboard?incomplete=true")
              return 
            }

            navigate("/dashboard")
            return

        }
        else{
          toast.dismiss()
          toast.error("Authentication failed: You are not authorized user.")
          setShake(true)
          setTimeout(() => setShake(false), 300)
          return navigate("/login")
        }
      }catch(err){ 
        if (method === "register") {
          //Register errors
          const emailError = err.response?.data?.email?.[0]
          const generalMessage = err.response?.data?.message

          if (emailError) {
            toast.error("Email already exists. Please login instead.")
          } else if (generalMessage) {
             toast.error(generalMessage)
            } else {
               toast.error("Registration failed")
              }
        }else{
          //Login errors
          if(method === "login"){
            if(err.response?.status === 401 || err.response?.status === 403){
             toast.dismiss()
             toast.error("Invalid email or password.")
            }else{
              toast.dismiss()
              toast.error("Login Failed")
            }
          }else{
            toast.dismiss()
            toast.error(err.response?.data?.message || "Registration Failed")
          }
        }

        setShake(true)
        setTimeout(() => setShake(false), 300)
      }finally{
        setLoading(false)
      }


    }

    return (
    <div className="min-h-screen flex bg-blue-600">
      
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-blue-600 text-white items-center justify-center p-10">
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-bold">SkillSync</h1>
          <p className="text-blue-100">
            Build your skills tracker and manage your progress.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center ">
        <form
          onSubmit={handleSubmit}
          className={`bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6 ${shake ? "animate-shake" : "" }`}
        >
          <h2 className="text-2xl font-bold text-center text-gray-800">
            {name}
          </h2>
          
          {/* First name and Last name Only for registration */}
          {method === "register" && (
            <div className="space-y-4 flex flex-col md:flex-row md:space-x-4 md:space-y-0">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="E.g. John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="E.g. Smith"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                
                />
              </div>
            </div>
          )}
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm text-gray-600 mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />

            {/* Toggle */}
            <span
              onClick={() => setshowPassword(!showPassword)}
              className="absolute right-3 top-9 cursor-pointer text-gray-500"
            >
              {showPassword ? "🙈" : "👁️"}
            </span>

            {method === "register" && (
              <div className="relative">
                <label className="block text-sm text-gray-600 mb-1 mt-4">
                 Confirm Password
                </label>
               <input 
               type="password" 
               value={confirmPassword}
               onChange={(e) => setConfirmPassword(e.target.value)}
               placeholder="Confirm password" 
               className="w-full  px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
               required
               />
              
               
              </div>
            )}

          </div>
           {method === "register" && password && (
              <div className="text-sm space-y-1">
               <p className={password.length >= 8 ? "text-green-500" : "text-gray-400"}>
                  • At least 8 characters
               </p>
               <p className={/[A-Z]/.test(password) ? "text-green-500" : "text-gray-400"}>
                 • Uppercase letter
               </p>
               <p className={/[a-z]/.test(password) ? "text-green-500" : "text-gray-400"}>
                  • Lowercase letter
               </p>
               <p className={/[0-9]/.test(password) ? "text-green-500" : "text-gray-400"}>
                  • Number
               </p>
          </div>
          )}
          

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Please wait..." : name}
          </button>

          {/* Switch */}
          <p className="text-sm text-center text-gray-500">
            {method === "login"
              ? "Don't have an account?"
              : "Already have an account?"}

            <span
              onClick={() =>
                navigate(method === "login" ? "/register" : "/login")
              }
              className="ml-1 text-blue-600 cursor-pointer hover:underline"
            >
              {method === "login" ? "Register" : "Login"}
            </span>
          </p>
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                 type="checkbox"
                 checked={rememberMe}
                 onChange={(e) => setRememberMe(e.target.checked)}
              />
             <span>Remember me</span>
            </label>
            {method === "login" && (
              <p
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-blue-600 cursor-pointer hover:underline text-right"
              >
                Forgot Password?
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default Form;