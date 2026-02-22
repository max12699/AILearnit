import React, { useState } from "react"
import { RotateCcw, Star } from "lucide-react"

const Flashcard = ({
  card,
  onToggleStar,
}) => {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    setIsFlipped((prev) => !prev)
  }

  const handleStarClick = (e) => {
    e.stopPropagation()
    onToggleStar?.(card._id)
  }

  return (
    <div
      className="w-full max-w-2xl mx-auto"
      style={{ perspective: "1200px" }}
    >
      <div
        onClick={handleFlip}
        className={`relative w-full min-h-75 transition-transform duration-500 transform-gpu cursor-pointer`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped
            ? "rotateY(180deg)"
            : "rotateY(0deg)"
        }}
      >
        {/* ================= FRONT ================= */}
        <div
          className="absolute inset-0 bg-white rounded-3xl shadow-xl border border-slate-200 p-8 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden"
          }}
        >
          {/* Top Row */}
          <div className="flex justify-between items-center mb-4">
            <span className="bg-slate-100 text-xs text-slate-600 px-3 py-1 rounded-full uppercase tracking-wide">
              {card?.difficulty || "medium"}
            </span>

            <button
              onClick={handleStarClick}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                card?.isStarred
                  ? "bg-amber-400 text-white shadow-lg shadow-amber-400/30"
                  : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-amber-500"
              }`}
            >
              <Star
                size={18}
                fill={card?.isStarred ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* Question */}
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-lg font-medium text-slate-800 leading-relaxed">
              {card?.question}
            </p>
          </div>

          {/* Flip Hint */}
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mt-4">
            <RotateCcw size={16} />
            <span>Click to reveal answer</span>
          </div>
        </div>

        {/* ================= BACK ================= */}
        <div
          className="absolute inset-0 bg-linear-to-br from-emerald-500 to-teal-500 text-white rounded-3xl shadow-xl p-8 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs uppercase tracking-wide opacity-80">
              Answer
            </span>

            <button
              onClick={handleStarClick}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition"
            >
              <Star
                size={18}
                fill={card?.isStarred ? "white" : "none"}
              />
            </button>
          </div>

          {/* Answer */}
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-lg font-medium leading-relaxed">
              {card?.answer}
            </p>
          </div>

          {/* Flip Back Hint */}
          <div className="flex items-center justify-center gap-2 text-sm opacity-80 mt-4">
            <RotateCcw size={16} />
            <span>Click to flip back</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Flashcard
