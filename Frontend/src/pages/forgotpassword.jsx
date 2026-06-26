import {useState} from "react"
import api from "../api"
import {toast} from "react-toastify"
import {Mail, CheckCircle2, AlertCircle, Loader2, Lock, ArrowLeft} from 'lucide-react';
import {Link, useNavigate} from "react-router-dom";

function ForgotPassword() {
  const [forgotEmail, setForgotEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try{
      await api.post("/users/forgot-password/", {email: forgotEmail})
      setSent(true)
      toast.success("Password reset link sent to your email.")
    } catch (error) {
      toast.error("Failed to send password reset link.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-950 via-blue-950 to-indigo-900">
      {/* LEFT SIDE - Decorative */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
              <Mail className="text-white" size={28} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">SkillSync</h1>
          </div>
          <p className="text-indigo-100 text-lg leading-relaxed">
            Reset your password in just a few steps.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6">
        <div className="bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-600 mb-6 font-medium transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>

          {sent ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-6">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Email Sent!
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                We've sent a password reset link to<br />
                <span className="font-medium text-gray-700">{forgotEmail}</span>
              </p>
              <p className="text-sm text-gray-400">
                Didn't receive the email?{" "}
                <button
                  onClick={() => setSent(false)}
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Try again
                </button>
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-colors"
              >
                ← Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 mb-4">
                  <Lock size={28} className="text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Forgot Password
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200/30 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />}
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;