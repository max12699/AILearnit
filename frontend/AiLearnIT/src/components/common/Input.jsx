import React from "react"

const Input = ({
  label,
  icon: Icon,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className={`relative w-full ${className}`}>

      <div
        className={`
          relative flex items-center
          bg-white
          border rounded-xl
          transition-all duration-200
          ${error
            ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-100"
            : "border-slate-300 focus-within:border-indigo-500 focus-within:ring-indigo-100"}
          focus-within:ring-4
        `}
      >
        {Icon && (
          <div className="pl-4 text-slate-400">
            <Icon size={18} />
          </div>
        )}

        <input
          {...props}
          className={`
            w-full px-4 py-3 bg-transparent
            outline-none
            text-slate-800
            placeholder:text-slate-400
            ${Icon ? "pl-2" : ""}
          `}
        />
      </div>

      {label && (
        <label className="block text-sm font-medium text-slate-600 mt-2">
          {label}
        </label>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}

export default Input