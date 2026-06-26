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
        const is_profile_complete = response.data.is_profile_complete || response.data.user?.is_profile_complete || false

        console.log("RESPONSE:", response.data)
        
        if (!access) {
         toast.error("Authentication failed")
         return

        }
if(rememberMe || !rememberMe){
             sessionStorage.setItem(ACCESS_TOKEN, access)
             sessionStorage.setItem(REFRESH_TOKEN, refresh)
             sessionStorage.setItem(USER_ROLE, role)
             sessionStorage.setItem(FIRST_NAME, first_name)
             sessionStorage.setItem(LAST_NAME, last_name)
             sessionStorage.setItem("email", response.data.email)
             sessionStorage.setItem("is_profile_complete", is_profile_complete)
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
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      
      {/* LEFT SIDE — Brand Panel */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative rings */}
        <div className="absolute top-16 left-16 w-72 h-72 rounded-full bg-white/5 border border-white/10" />
        <div className="absolute bottom-12 right-8 w-96 h-96 rounded-full bg-white/[0.04] border border-white/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10 max-w-md space-y-6 animate-fade-in-up">
          {/* Logo mark */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <span className="text-2xl font-black tracking-tight">SkillSync</span>
          </div>

          {/* Montly stat badges */}
          <div className="flex flex-wrap gap-2">
            {["🚀 Skill Tracking", "📊 Career Insights", "📄 CV Builder", "🔐 Verified Credentials"].map((badge) => (
              <span key={badge} className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium border border-white/10">
                {badge}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
            Your skills.<br />
            <span className="text-indigo-200">Your future.</span>
          </h1>
          <p className="text-indigo-100/80 text-base leading-relaxed">
            Track every milestone, discover your ideal career path, and build a CV that stands out — all in one place.
          </p>

          {/* Feature list */}
          <div className="space-y-3 pt-2">
            {[
              "Personalized career path recommendations",
              "Real-time skill gap analytics",
              "AI-powered CV generation",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5 text-sm text-indigo-100/90">
                <div className="w-5 h-5 rounded-full bg-emerald-400/80 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE — Auth Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-4 md:p-0">
        <form
          onSubmit={handleSubmit}
          className={`w-full max-w-md animate-fade-in-up ${shake ? "animate-shake" : ""}`}
        >
          {/* Mobile logo */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-8 animate-fade-in">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <span className="text-xl font-black text-white">SkillSync</span>
          </div>

          {/* Card */}
          <div className="bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl shadow-black/15 ring-1 ring-black/5 space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{name}</h2>
              <p className="text-sm text-gray-400">
                {method === "login"
                  ? "Welcome back — sign in to continue"
                  : "Create your account to get started"}
              </p>
            </div>
          
          {/* First name and Last name Only for registration */}
          {method === "register" && (
            <div className="space-y-4 flex flex-col md:flex-row md:space-x-4 md:space-y-0">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="E.g. John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all duration-200"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="E.g. Smith"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all duration-200"
                />
              </div>
            </div>
          )}
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Password
            </label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mb-1 pl-10 pr-11 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all duration-200"
                required
              />

              {/* Toggle visibility */}
              <span
                onClick={() => setshowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors select-none"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </span>
            </div>

            {method === "register" && (
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>
            )}
          </div>
           {method === "register" && password && (
              <div className="space-y-1 pt-1">
                {[
                  { label: "At least 8 characters", test: password.length >= 8 },
                  { label: "One uppercase letter", test: /[A-Z]/.test(password) },
                  { label: "One lowercase letter", test: /[a-z]/.test(password) },
                  { label: "At least one number", test: /[0-9]/.test(password) },
                ].map(({ label, test }) => (
                  <div key={label} className={`flex items-center gap-2 text-xs transition-colors duration-200 ${test ? "text-emerald-600" : "text-gray-400"}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      {test
                        ? <circle cx="6" cy="6" r="5.5" fill="currentColor" stroke="currentColor" strokeWidth="1"/>
                        : <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>}
                    </svg>
                    {label}
                  </div>
                ))}
              </div>
            )}
            

            {/* Primary CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm tracking-wide hover:bg-indigo-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5"/>
                    <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 0 1 16 0"/>
                  </svg>
                  Please wait…
                </span>
              ) : (
                name
              )}
            </button>

          {/* Secondary actions row */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer accent-indigo-600"
              />
              <span>Remember me</span>
            </label>
            {method === "login" && (
              <span
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-indigo-600 cursor-pointer hover:text-indigo-800 hover:underline transition-colors"
              >
                Forgot Password?
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex items-center py-1">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-3 text-xs text-gray-400 select-none">
              {method === "login" ? "New to SkillSync?" : "Already registered?"}
            </span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* Switch to register / login */}
          <div className="text-center">
            <span
              onClick={() =>
                navigate(method === "login" ? "/register" : "/login")
              }
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 cursor-pointer hover:text-indigo-800 hover:underline transition-colors"
            >
              {method === "login" ? "Create an account" : "Sign in instead"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </span>
          </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Form;