import React from "react";
import clsx from "clsx";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary:
      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:brightness-110",
    secondary:
      "bg-slate-800 text-slate-200 hover:bg-slate-700",
    danger:
      "bg-red-600 text-white hover:bg-red-700",
    outline:
      "border border-slate-700 text-slate-300 hover:bg-slate-800",
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading ? (
        <span className="h-4 w-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
