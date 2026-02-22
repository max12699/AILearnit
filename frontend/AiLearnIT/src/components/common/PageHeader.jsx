import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PageHeader({
  title,
  subtitle,
  backLink,
  actions,
  showDivider = false
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        {/* Left Section */}
        <div className="flex items-start sm:items-center gap-3">

          {backLink && (
            <Link
              to={backLink}
              aria-label="Go Back"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-slate-900" />
            </Link>
          )}

          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-black truncate">
              {title}
            </h1>

            {subtitle && (
              <p className="text-sm text-slate-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Actions */}
        {actions && (
          <div className="flex items-center gap-3 flex-wrap">
            {actions}
          </div>
        )}
      </div>

      {showDivider && (
        <div className="border-b border-slate-800" />
      )}
    </div>
  );
}
