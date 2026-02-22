import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { BrainCircuit, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "../../context/AuthContext"
import authService from "../../services/authService"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { token, user } = await authService.login(email, password)
      login(user, token)
      toast.success("Logged in successfully!")
      navigate("/dashboard")
    } catch (err) {
      setError(err.message || "Invalid credentials")
      toast.error("Login failed")
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "peer w-full px-10 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"

  const labelClass =
    "absolute left-10 top-3 text-slate-400 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-focus:top-[-0.4rem] peer-focus:text-xs peer-focus:text-emerald-400 bg-slate-900 px-1"

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-black via-slate-900 to-slate-800 px-4">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm sm:max-w-md bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 p-6 sm:p-8"
      >

        {/* Header */}
        <div className="text-center mb-6">
          <BrainCircuit className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 mx-auto mb-2" />
          <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-sm sm:text-base text-slate-400">
            Sign in to continue your journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              required
              className={inputClass}
            />
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 peer-focus:text-emerald-400" />
            <label className={labelClass}>Email Address</label>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              required
              className={inputClass}
            />
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 peer-focus:text-emerald-400" />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-emerald-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

            <label className={labelClass}>Password</label>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-400">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="accent-emerald-500"
              />
              Remember me
            </label>

            <Link to="/forgot-password" className="text-emerald-400 hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : <>Sign In <ArrowRight size={18} /></>}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Don’t have an account?{" "}
            <Link to="/register" className="text-emerald-400 hover:underline">
              Sign Up
            </Link>
          </p>
          <p className="text-xs text-slate-500 mt-3">
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </div>

      </motion.div>
    </div>
  )
}
