import React, { useState, useEffect, useRef } from "react"
import { User, LogOut, LogIn, Settings, ChevronDown } from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import authService from "../../services/authService"
import { useAuth } from "../../context/AuthContext"

export default function Header() {
  const [open, setOpen] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)

  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const { user, isAuthenticated, logout, setUser } = useAuth()

  /*  FETCH PROFILE  */

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true)
        const data = await authService.getProfile()
        setUser(data.user || data)
      } catch (error) {
        console.error("Profile fetch failed", error)
      } finally {
        setLoadingProfile(false)
      }
    }

    if (isAuthenticated && !user) {
      fetchProfile()
    }
  }, [isAuthenticated, user, setUser])

  /*  CLOSE ON OUTSIDE CLICK  */

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    const handleEsc = (e) => {
      if (e.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEsc)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [])

  /*  CLOSE ON ROUTE CHANGE  */

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  /*  LOGOUT  */

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  /*  UI  */

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm">

      {/* Logo / Title */}
      <h1 className="text-lg font-semibold text-slate-800 tracking-tight">
        AI Learning Assistant
      </h1>

      {/* Right Section */}
      <div className="relative" ref={dropdownRef}>
        {!isAuthenticated ? (
          <Link
            to="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-sm"
          >
            <LogIn size={18} />
            Login
          </Link>
        ) : (
          <>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition"
            >
              {/* Avatar */}
              <div className="relative">
                <img
                  src={
                    user?.avatar ||
                    `https://ui-avatars.com/api/?name=${user?.username || "User"}`
                  }
                  alt="profile"
                  className="w-9 h-9 rounded-full object-cover border border-slate-300"
                />
              </div>

              {/* Username */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-slate-800">
                  {user?.username || "User"}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  {user?.role}
                </p>
              </div>

              <ChevronDown size={16} className="text-slate-500" />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50"
                >
                  {/* Profile Info */}
                  <div className="px-4 py-4 border-b border-slate-200">
                    <p className="text-sm font-semibold text-slate-800">
                      {user?.username}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user?.email}
                    </p>
                  </div>

                  {/* Menu Links */}
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 text-sm transition"
                  >
                    <User size={16} />
                    Profile
                  </Link>

                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 text-sm transition"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-sm text-red-600 transition border-t border-slate-200"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </header>
  )
}