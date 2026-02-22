import React from "react"
//import { useNavigate } from "react-router-dom"
import { Play, Trash2, Brain, BarChart2 } from "lucide-react"
import moment from "moment"

const QuizCard = ({ quiz, onDelete, onStart, onClose }) => {


    const isCompleted = quiz.isCompleted === true



    return (
        <div className="relative bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">

            {/* Top Section */}
            <div className="flex justify-between items-start">

                <div className="flex gap-4">

                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <Brain className="text-indigo-600" size={20} />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                            {quiz.title || "Generated Quiz"}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                            {quiz.questions?.length || 0} Questions
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                            Created {moment(quiz.createdAt).format("MMM DD, YYYY")}
                        </p>
                    </div>

                </div>

                {/* Delete */}
                <button
                    onClick={() => onDelete?.(quiz)}
                    className="text-slate-400 hover:text-red-500 transition"
                >
                    <Trash2 size={18} />
                </button>

            </div>

            {/* Bottom Section */}
            <div className="mt-6">

                {isCompleted ? (
                    <button
                        onClick={() => onClose?.(quiz)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition"
                    >
                        <BarChart2 size={16} />
                        View Results
                    </button>
                ) : (
                    <button
                        onClick={() => onStart?.(quiz)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-md hover:from-emerald-600 hover:to-teal-600 transition active:scale-95"
                    >
                        <Play size={16} />
                        Start Quiz
                    </button>
                )}

            </div>

        </div>
    )
}

export default QuizCard
