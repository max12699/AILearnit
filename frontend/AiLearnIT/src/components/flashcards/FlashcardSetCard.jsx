import React, { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { BookOpen, Sparkles, TrendingUp } from "lucide-react"
import moment from "moment"

const FlashcardSetCard = ({ flashcardSet }) => {
  const navigate = useNavigate()

  const documentId = flashcardSet?.documentId?._id
  const title = flashcardSet?.documentId?.title || "Untitled Document"
  const createdAt = flashcardSet?.createdAt

  const { totalCards, reviewedCount, progressPercentage } = useMemo(() => {
    const cards = flashcardSet?.cards || []
    const total = cards.length
    const reviewed = cards.filter(card => card.lastReviewed).length
    const percentage =
      total > 0 ? Math.round((reviewed / total) * 100) : 0

    return {
      totalCards: total,
      reviewedCount: reviewed,
      progressPercentage: percentage
    }
  }, [flashcardSet])

  const handleStudyNow = () => {
    if (!documentId) return
    navigate(`/documents/${documentId}/flashcards`)
  }

  return (
    <div
      onClick={handleStudyNow}
      className="group cursor-pointer bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
    >

      {/* Top Section */}
      <div className="flex items-start gap-4">

        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center shadow-sm">
          <BookOpen className="text-emerald-600" size={20} />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-base font-semibold text-slate-900 truncate"
            title={title}
          >
            {title}
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Created {createdAt ? moment(createdAt).fromNow() : "-"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center mt-6 text-sm">

        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-medium">
          {totalCards} {totalCards === 1 ? "Card" : "Cards"}
        </span>

        {reviewedCount > 0 && (
          <div className="flex items-center gap-1 text-emerald-600 font-semibold">
            <TrendingUp size={16} />
            {progressPercentage}%
          </div>
        )}
      </div>

      {/* Progress */}
      {totalCards > 0 && (
        <div className="mt-5">

          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Progress</span>
            <span>{reviewedCount}/{totalCards}</span>
          </div>

          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Study Button */}
      <div className="mt-6">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleStudyNow()
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-md hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 active:scale-95"
        >
          <Sparkles size={18} />
          Study Now
        </button>
      </div>

    </div>
  )
}

export default FlashcardSetCard
