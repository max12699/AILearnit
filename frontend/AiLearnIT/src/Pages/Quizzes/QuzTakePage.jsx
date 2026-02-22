import React, { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from "lucide-react"
import quizService from "../../services/quizService"
import Spinner from "../../components/common/Spinner"
import toast from "react-hot-toast"
import PageHeader from "../../components/common/PageHeader"
import Button from "../../components/common/Button"

const QuizTakePage = () => {
  const { quizId } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  //////////////////////////////////////////////////////
  // Fetch Quiz
  //////////////////////////////////////////////////////

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await quizService.getQuizById(quizId)
        setQuiz(res.data || res)
      } catch {
        toast.error("Failed to load quiz")
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [quizId])

  //////////////////////////////////////////////////////
  // Keyboard Navigation
  //////////////////////////////////////////////////////

  useEffect(() => {
    const handleKey = (e) => {
      if (!quiz) return

      if (e.key === "ArrowRight") nextQuestion()
      if (e.key === "ArrowLeft") prevQuestion()
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [quiz, currentIndex])

  //////////////////////////////////////////////////////
  // Handlers
  //////////////////////////////////////////////////////

  const handleOptionSelect = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }))
  }

  const nextQuestion = useCallback(() => {
    if (!quiz) return
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [quiz, currentIndex])

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

 const handleSubmit = async () => {
  if (!quiz) return

  if (Object.keys(selectedAnswers).length !== quiz.questions.length) {
    toast.error("Please answer all questions")
    return
  }

  try {
    setSubmitting(true)

    const formattedAnswers = Object.entries(selectedAnswers).map(
      ([questionId, optionIndex]) => {

        // 🔥 IMPORTANT: compare as string
        const questionIndex = quiz.questions.findIndex(
          (q) => q._id.toString() === questionId.toString()
        )

        if (questionIndex === -1) {
          throw new Error("Invalid question reference")
        }

        const question = quiz.questions[questionIndex]

        return {
          questionIndex,
          selectedAnswer: question.options[optionIndex]
        }
      }
    )

    console.log("Submitting:", formattedAnswers)

    await quizService.submitQuiz(quizId, formattedAnswers)

    navigate(`/quiz/${quizId}/results`)

  } catch (error) {
    console.error("Submit failed:", error)
    toast.error("Failed to submit quiz")
  } finally {
    setSubmitting(false)
  }
}


  //////////////////////////////////////////////////////
  // Guards
  //////////////////////////////////////////////////////

  if (loading) return <Spinner />

  if (!quiz || !quiz.questions?.length)
    return <div className="p-10">Quiz not found.</div>

  //////////////////////////////////////////////////////
  // Computed
  //////////////////////////////////////////////////////

  const currentQuestion = quiz.questions[currentIndex]
  const answeredCount = Object.keys(selectedAnswers).length
  const progress =
    ((currentIndex + 1) / quiz.questions.length) * 100

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      <PageHeader title={quiz.title || "Take Quiz"} />

      {/* Progress */}
      <div className="mb-10">

        <div className="flex justify-between text-sm text-slate-500 mb-2">
          <span>
            Question {currentIndex + 1} of {quiz.questions.length}
          </span>
          <span>{answeredCount} answered</span>
        </div>

        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

      </div>

      {/* Question Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm transition-all duration-300">

        <h3 className="text-xl font-semibold mb-8 text-slate-900">
          {currentQuestion.question}
        </h3>

        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => {
            const isSelected =
              selectedAnswers[currentQuestion._id] === index

            return (
              <button
                key={index}
                type="button"
                onClick={() =>
                  handleOptionSelect(currentQuestion._id, index)
                }
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl border transition-all duration-200 group ${isSelected
                    ? "border-emerald-500 bg-emerald-50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${isSelected
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-slate-300 group-hover:border-slate-400"
                    }`}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>

                <span
                  className={`text-sm font-medium ${isSelected
                      ? "text-emerald-700"
                      : "text-slate-700"
                    }`}
                >
                  {option}
                </span>

                {isSelected && (
                  <div className="ml-auto text-emerald-600">
                    <CheckCircle2 size={18} />
                  </div>
                )}
              </button>
            )
          })}
        </div>

      </div>

      {/* Question Navigator */}
      <div className="flex justify-center gap-2 mt-8 flex-wrap">
        {quiz.questions.map((q, index) => {
          const isAnswered =
            selectedAnswers[q._id] !== undefined

          return (
            <button
              key={q._id}
              onClick={() => setCurrentIndex(index)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition ${currentIndex === index
                  ? "bg-emerald-500 text-white"
                  : isAnswered
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
            >
              {index + 1}
            </button>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-10">

        <Button
          variant="secondary"
          onClick={prevQuestion}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={18} />
          Previous
        </Button>

        {currentIndex === quiz.questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
          >
            <CheckCircle2 size={18} />
            {submitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        ) : (
          <Button onClick={nextQuestion}>
            Next
            <ChevronRight size={18} />
          </Button>
        )}

      </div>

    </div>
  )
}

export default QuizTakePage
