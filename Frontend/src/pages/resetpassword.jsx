import {useState} from 'react'
import { useParams } from 'react-router-dom'
import api from "../api"
import { toast } from "react-toastify"
import {Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, Loader2} from 'lucide-react';
import {Link, useNavigate} from "react-router-dom";

const ResetPassword = () => {
  const { uidb64, token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "At least 8 characters"
    if (!/[A-Z]/.test(pwd)) return "Uppercase letter required"
    if (!/[a-z]/.test(pwd)) return "Lowercase letter required"
    if (!/[0-9]/.test(pwd)) return "Number required"
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const error = validatePassword(password)
    if (error) {
      toast.error(error)
      return
    }

    setLoading(true)
    try {
      await api.post(`/users/reset-password/${uidb64}/${token}/`, { password })
      setSuccess(true)
      toast.success("Password reset successfully.")
    } catch (error) {
      toast.error("Failed to reset password. The link may have expired.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-950 via-blue-950 to-indigo-900">
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
              <Lock className="text-white" size={28} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">SkillSync</h1>
          </div>
          <p className="text-indigo-100 text-lg leading-relaxed">
            Create a strong new password for your account.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6">
        <div className="bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl w-full max-w-md">
          {/* Back Button */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-600 mb-6 font-medium transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>

          {success ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-6">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Password Reset!
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-colors"
              >
                ← Go to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 mb-4">
                  <Lock size={28} className="text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Set New Password
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Enter your new password below
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    New Password
                  </label>
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm pr-12 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
                  >
                    {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {password && (
                  <div className="space-y-1">
                    <p className={`text-xs flex items-center gap-1 ${password.length >= 8 ? "text-green-500" : "text-gray-400"}`}>
                      <CheckCircle2 size={12} /> At least 8 characters
                    </p>
                    <p className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(password) ? "text-green-500" : "text-gray-400"}`}>
                      <CheckCircle2 size={12} /> Uppercase
                    </p>
                    <p className={`text-xs flex items-center gap-1 ${/[a-z]/.test(password) ? "text-green-500" : "text-gray-400"}`}>
                      <CheckCircle2 size={12} /> Lowercase
                    </p>
                    <p className={`text-xs flex items-center gap-1 ${/[0-9]/.test(password) ? "text-green-500" : "text-gray-400"}`}>
                      <CheckCircle2 size={12} /> Number
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200/30 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;