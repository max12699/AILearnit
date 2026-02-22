import React, { useEffect } from "react"
import { X } from "lucide-react"

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-xl"
}) => {

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose?.()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = "auto"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
      />

      {/* Modal Card */}
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-3xl shadow-2xl animate-scaleIn flex flex-col max-h-[90vh]`}
      >

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              {title}
            </h3>

            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  )
}

export default Modal
