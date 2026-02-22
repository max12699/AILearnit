import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import quizService from "../../services/quizService"
import Spinner from "../../components/common/Spinner"
import toast from "react-hot-toast"
import Button from "../../components/common/Button"
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer
} from "recharts"
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft
} from "lucide-react"

const QuizResultPage = () => {
  const { quizId } = useParams()
  const navigate = useNavigate()

  const [result, setResult] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)

  //////////////////////////////////////////////////////
  // Fetch Results + Quiz
  //////////////////////////////////////////////////////

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await quizService.getQuizResults(quizId)

        if (!res?.data) {
          setResult(null)
        } else {
          setResult(res.data)
        }

        const quizData = await quizService.getQuizById(quizId)
        setQuiz(quizData.data || quizData)

      } catch {
        toast.error("Failed to load results")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [quizId])

  //////////////////////////////////////////////////////
  // Loading
  //////////////////////////////////////////////////////

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner />
      </div>
    )
  }

  //////////////////////////////////////////////////////
  // Not Completed
  //////////////////////////////////////////////////////

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center">
        <h2 className="text-2xl font-semibold text-slate-800">
          Quiz Not Completed
        </h2>
        <p className="text-slate-500 mt-2">
          Complete the quiz to view your results.
        </p>

        <div className="mt-6">
          <Button onClick={() => navigate(`/quiz/${quizId}`)}>
            Take Quiz
          </Button>
        </div>
      </div>
    )
  }

  //////////////////////////////////////////////////////
  // Calculations
  //////////////////////////////////////////////////////

  const percentage = Math.round(
    (result.score / result.total) * 100
  )

  const passed = percentage >= 50

  const performanceLevel =
    percentage >= 80
      ? "Excellent"
      : percentage >= 50
      ? "Good"
      : "Needs Improvement"

  const feedback =
    percentage >= 80
      ? "Outstanding performance! You’ve mastered this topic."
      : percentage >= 50
      ? "Good job! A little revision will make it perfect."
      : "Review the material and try again to improve."

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-slate-900">
          Quiz Results
        </h2>
        <p className="text-slate-500 mt-2">
          Completed on {new Date(result.completedAt).toLocaleString()}
        </p>
      </div>

      {/* Score Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm">

        {/* Chart */}
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              data={[{ name: "Score", value: percentage }]}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={20}
                fill={passed ? "#10b981" : "#ef4444"}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Percentage */}
        <div className="text-center -mt-48">
          <p className={`text-5xl font-bold ${passed ? "text-emerald-600" : "text-red-500"}`}>
            {percentage}%
          </p>
          <p className="text-lg font-semibold mt-2">
            Score: {result.score} / {result.total}
          </p>

          <div className={`inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-full text-sm font-medium ${
            passed
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-600"
          }`}>
            {passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {passed ? "Passed" : "Failed"}
          </div>

          <p className="mt-4 text-slate-600 font-medium">
            {performanceLevel}
          </p>

          <p className="text-sm text-slate-500 mt-1">
            {feedback}
          </p>
        </div>

      </div>

      {/* Answer Breakdown */}
      {quiz && (
        <div className="mt-12 space-y-6">
          <h3 className="text-xl font-semibold">
            Answer Breakdown
          </h3>

          {result.answers.map((answer, i) => {
            const question = quiz.questions[answer.questionIndex]

            return (
              <div
                key={i}
                className="border rounded-2xl p-6 bg-white shadow-sm"
              >
                <p className="font-medium text-slate-800">
                  {question.question}
                </p>

                <p className={`mt-3 text-sm ${
                  answer.isCorrect
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}>
                  Your Answer: {answer.selectedAnswer}
                </p>

                {!answer.isCorrect && (
                  <p className="text-sm text-slate-600 mt-1">
                    Correct Answer: {question.correctAnswer}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4 mt-12">
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </Button>

        <Button
          onClick={() => navigate(`/quiz/${quizId}`)}
        >
          <RotateCcw size={18} />
          Retake Quiz
        </Button>
      </div>

    </div>
  )
}

export default QuizResultPage
