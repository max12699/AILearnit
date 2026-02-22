import React from "react";

export default function Tabs({ tabs = [], activeTab, setActiveTab }) {
  const activeIndex = tabs.findIndex(t => t.name === activeTab);

  return (
    <div className="w-full">

      {/* Tab header */}
      <div className="relative border-b border-slate-200">

        <nav className="flex justify-between items-center relative">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`relative px-5 py-3 text-sm font-medium transition-colors duration-200
              ${
                activeTab === tab.name
                  ? "text-emerald-600"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Animated underline */}
          {activeIndex !== -1 && (
            <div
              className="absolute bottom-0 h-1.5 bg-linear-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
              style={{
                width: `${100 / tabs.length}%`,
                transform: `translateX(${activeIndex * 100}%)`
              }}
            />
          )}
        </nav>
      </div>

      {/* Content */}
      <div className="py-6">
        {tabs.map(tab =>
          tab.name === activeTab ? (
            <div key={tab.name} className="animate-fadeIn">
              {tab.content}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
