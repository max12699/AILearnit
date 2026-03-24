import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import { BrainCircuit, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "../../context/AuthContext"
import authService from "../../services/authService"

// ─── Floating orb background decoration ───────────────────────
function Orb({ className }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`}
    />
  )
}

// ─── Reusable animated input field ────────────────────────────
// eslint-disable-next-line no-unused-vars
function FloatingInput({ type, value, onChange, placeholder, icon: Icon, rightSlot }) {
  const [focused, setFocused] = useState(false)
  const lifted = focused || value.length > 0

  return (
    <div className="relative group">
      {/* left icon */}
      <div
        className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
          focused ? "text-emerald-400" : "text-slate-500"
        }`}
      >
        <Icon size={17} />
      </div>

      {/* floating label */}
      <label
        className={`absolute left-10 transition-all duration-200 pointer-events-none font-medium
          ${lifted
            ? "top-1.5 text-[10px] text-emerald-400"
            : "top-1/2 -translate-y-1/2 text-sm text-slate-500"
          }`}
      >
        {placeholder}
      </label>

      {/* input */}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
        className={`
          w-full pl-10 pr-10 pt-5 pb-2 rounded-xl text-sm text-white
          bg-slate-900/80 border transition-all duration-200 outline-none
          ${focused
            ? "border-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.12)]"
            : "border-slate-700/80 hover:border-slate-600"
          }
        `}
      />

      {/* right slot (eye toggle etc.) */}
      {rightSlot && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {rightSlot}
        </div>
      )}
    </div>
  )
}

// ─── Main Login Page ───────────────────────────────────────────
export default function LoginPage() {
  const [email, setEmail]               = useState("")
  const [password, setPassword]         = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember]         = useState(false)
  const [error, setError]               = useState("")
  const [loading, setLoading]           = useState(false)

  const navigate    = useNavigate()
  const { login }   = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { token, user } = await authService.login(email, password)
      login(user, token)
      toast.success("Welcome back!")
      navigate("/dashboard")
    } catch (err) {
      setError(err.message || "Invalid email or password")
      toast.error("Login failed")
    } finally {
      setLoading(false)
    }
  }

  // stagger animation for form children
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
  }
  const item = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#060910] px-4 overflow-hidden">

      {/* ── background orbs ── */}
      <Orb className="w-96 h-96 bg-emerald-500 -top-24 -left-24" />
      <Orb className="w-80 h-80 bg-teal-400 bottom-0 right-0" />
      <Orb className="w-56 h-56 bg-emerald-700 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* ── subtle grid pattern ── */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── card ── */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md z-10"
      >
        {/* glassy card border glow */}
        <div className="absolute -inset-px rounded-2xl bg-linear-to-br from-emerald-500/30 via-transparent to-teal-500/20 pointer-events-none" />

        <div className="relative bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-slate-800/80 p-8 shadow-2xl shadow-black/60">

          {/* ── header ── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center mb-8"
          >
            {/* animated logo ring */}
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="absolute w-16 h-16 rounded-full bg-emerald-500/10 animate-ping" />
              <div className="relative w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <BrainCircuit className="w-7 h-7 text-emerald-400" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Sign in to continue your journey
            </p>
          </motion.div>

          {/* ── form ── */}
          <motion.form
            variants={container}
            initial="hidden"
            animate="show"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* email */}
            <motion.div variants={item}>
              <FloatingInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                icon={Mail}
              />
            </motion.div>

            {/* password */}
            <motion.div variants={item}>
              <FloatingInput
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                icon={Lock}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-500 hover:text-emerald-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            </motion.div>

            {/* remember + forgot */}
            <motion.div variants={item} className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div
                  onClick={() => setRemember(!remember)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
                    remember
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-slate-600 hover:border-slate-400"
                  }`}
                >
                  {remember && (
                    <svg className="w-2.5 h-2.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                  Remember me
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors hover:underline underline-offset-2"
              >
                Forgot password?
              </Link>
            </motion.div>

            {/* error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-start gap-2 bg-red-500/8 border border-red-500/25 text-red-400 px-3 py-2.5 rounded-lg text-xs leading-relaxed"
              >
                <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </motion.div>
            )}

            {/* submit button */}
            <motion.div variants={item}>
              <button
                type="submit"
                disabled={loading}
                className={`
                  relative w-full flex items-center justify-center gap-2
                  py-3 rounded-xl font-semibold text-sm transition-all duration-200
                  overflow-hidden group
                  ${loading
                    ? "bg-emerald-600/50 text-emerald-200/50 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 active:scale-[0.98]"
                  }
                `}
              >
                {/* shimmer effect on hover */}
                {!loading && (
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/10 to-transparent" />
                )}

                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </motion.div>
          </motion.form>

          {/* ── divider ── */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-600">or</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* ── social login buttons ── */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Google",
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                ),
              },
              {
                label: "GitHub",
                icon: (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                ),
              },
            ].map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700/80 hover:border-slate-600 bg-slate-900/50 hover:bg-slate-800/80 text-slate-300 text-sm font-medium transition-all duration-200 active:scale-[0.98]"
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* ── footer ── */}
          <div className="mt-7 text-center space-y-2">
            <p className="text-slate-500 text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors hover:underline underline-offset-2"
              >
                Sign Up
              </Link>
            </p>
            <p className="text-xs text-slate-700">
              By continuing, you agree to our{" "}
              <Link to="/terms" className="hover:text-slate-500 transition-colors underline underline-offset-2">
                Terms
              </Link>{" "}
              &{" "}
              <Link to="/privacy" className="hover:text-slate-500 transition-colors underline underline-offset-2">
                Privacy Policy
              </Link>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
