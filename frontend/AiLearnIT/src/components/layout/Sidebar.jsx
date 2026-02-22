import React, { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  BrainCircuit,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Shield
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const role = user?.role || "user"

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["user", "admin"] },
    { name: "Documents", path: "/documents", icon: FileText, roles: ["user", "admin"] },
    { name: "Flashcards", path: "/flashcards", icon: BookOpen, roles: ["user", "admin"] },
    { name: "Quizzes", path: "/quizzes", icon: BrainCircuit, roles: ["user", "admin"] },
    { name: "Profile", path: "/profile", icon: User, roles: ["user", "admin"] },
    { name: "Admin Panel", path: "/admin", icon: Shield, roles: ["admin"] },
  ]

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

 return (
  <>
    {/* Mobile Overlay */}
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        />
      )}
    </AnimatePresence>

    {/* Sidebar */}
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: isSidebarOpen ? 0 : -300, width: collapsed ? 88 : 260 }}
      transition={{ duration: 0.3 }}
      className="fixed lg:static z-50 h-screen bg-white border-r border-slate-200 flex flex-col shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
        {!collapsed && (
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-semibold text-slate-800 tracking-tight"
          >
            AI Learn
          </motion.h1>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-slate-100 transition"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1.5 rounded-md hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-semibold">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">
              {user?.name}
            </p>
            <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full capitalize">
              {role}
            </span>
          </div>
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems
          .filter((item) => item.roles.includes(role))
          .map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon
                  size={20}
                  className="transition group-hover:scale-110"
                />

                {!collapsed && <span>{item.name}</span>}

                {/* Collapsed Tooltip */}
                {collapsed && (
                  <span className="absolute left-16 bg-slate-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-lg">
                    {item.name}
                  </span>
                )}
              </NavLink>
            )
          })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition"
        >
          <LogOut size={18} />
          {!collapsed && "Logout"}
        </button>
      </div>
    </motion.aside>
  </>
)
}
