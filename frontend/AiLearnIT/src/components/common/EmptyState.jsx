import React from "react"
import { FileText, Plus } from "lucide-react"

const EmptyState = (props) => {
  const {
    icon,
    title,
    description,
    buttonText,
    onActionClick
  } = props

  const Icon = icon || FileText

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">

      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-6 shadow-md">
        <Icon
          className="w-8 h-8 text-emerald-600"
          strokeWidth={2}
        />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-6">
        {description}
      </p>

      {/* Button */}
      {buttonText && onActionClick && (
        <button
          onClick={onActionClick}
          className="group inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:from-emerald-600 hover:to-teal-600 active:scale-95"
        >
          <Plus
            className="w-4 h-4 transition-transform group-hover:rotate-90"
            strokeWidth={2.5}
          />
          <span className="font-medium">
            {buttonText}
          </span>
        </button>
      )}
    </div>
  )
}

export default EmptyState
