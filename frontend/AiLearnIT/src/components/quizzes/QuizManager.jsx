import React, { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import toast from "react-hot-toast"
import { useParams, useNavigate } from "react-router-dom"

import quizService from "../../services/quizService"
import aiService from "../../services/aiService"

import QuizCard from "./QuizCard"
import Spinner from "../common/Spinner"
import Button from "../common/Button"
import Modal from "../common/Modal"
import EmptyState from "../common/EmptyState"

const QuizManager = () => {
    const { id: documentId } = useParams()
    const navigate = useNavigate()

    const [quizzes, setQuizzes] = useState([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
    const [numQuestions, setNumQuestions] = useState(5)

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [selectedQuiz, setSelectedQuiz] = useState(null)

    //////////////////////////////////////////////////////
    // Fetch Quizzes
    //////////////////////////////////////////////////////
    const fetchQuizzes = async () => {
        try {
            const data =
                await quizService.getQuizzesForDocument(documentId)
            setQuizzes(data || [])
        } catch {
            toast.error("Failed to fetch quizzes")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (documentId) fetchQuizzes()
    }, [documentId])

    //////////////////////////////////////////////////////
    // Generate Quiz
    //////////////////////////////////////////////////////
    const handleGenerateQuiz = async (e) => {
        e.preventDefault()
        setGenerating(true)

        try {
            await aiService.generateQuiz(documentId, {
                numQuestions
            })

            toast.success("Quiz generated successfully")
            setIsGenerateModalOpen(false)
            fetchQuizzes()
        } catch (error) {
            toast.error(error?.error || "Failed to generate quiz")
        } finally {
            setGenerating(false)
        }
    }

    //////////////////////////////////////////////////////
    // Start Quiz
    //////////////////////////////////////////////////////
    const handleStartQuiz = (quiz) => {
        navigate(`/quiz/${quiz._id}`)
    }

    const handleViewResults = (quiz) => {
        navigate(`/quiz/${quiz._id}/results`)
    }

    //////////////////////////////////////////////////////
    // Delete Quiz
    //////////////////////////////////////////////////////
    const handleDeleteRequest = (quiz) => {
        setSelectedQuiz(quiz)
        setIsDeleteModalOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!selectedQuiz) return

        setDeleting(true)

        try {
            await quizService.deleteQuiz(selectedQuiz._id)
            toast.success("Quiz deleted successfully")
            fetchQuizzes()
        } catch {
            toast.error("Failed to delete quiz")
        } finally {
            setDeleting(false)
            setIsDeleteModalOpen(false)
            setSelectedQuiz(null)
        }
    }

    //////////////////////////////////////////////////////
    // UI
    //////////////////////////////////////////////////////

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">

            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Quizzes
                    </h2>
                    <p className="text-sm text-slate-500">
                        Test your understanding with AI-generated quizzes.
                    </p>
                </div>

                <button
                    onClick={() => setIsGenerateModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg hover:from-emerald-600 hover:to-teal-600 transition active:scale-95"
                >
                    <Plus size={18} />
                    Generate Quiz
                </button>
            </div>

            {/* Main Container */}
            <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm min-h-87.5">

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Spinner />
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className="flex justify-center py-20">
                        <EmptyState
                            title="No Quizzes Yet"
                            description="Generate a quiz from your document to test your knowledge."
                            buttonText="Generate Quiz"
                            onActionClick={() =>
                                setIsGenerateModalOpen(true)
                            }
                        />
                    </div>
                ) : (
                    <div className="grid gap-8 
                          grid-cols-1 
                          sm:grid-cols-2 
                          lg:grid-cols-3 
                          xl:grid-cols-4">
                        {quizzes.map((quiz) => (
                            <QuizCard
                                key={quiz._id}
                                quiz={quiz}
                                onDelete={handleDeleteRequest}
                                onStart={handleStartQuiz}
                                onClose={handleViewResults}
                            />
                        ))}
                    </div>
                )}

            </div>

            {/* Generate Modal */}
            <Modal
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                title="Generate New Quiz"
            >
                <form
                    onSubmit={handleGenerateQuiz}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                            Number of Questions
                        </label>

                        <input
                            type="number"
                            value={numQuestions}
                            onChange={(e) =>
                                setNumQuestions(
                                    Math.min(
                                        20,
                                        Math.max(1, parseInt(e.target.value) || 1)
                                    )
                                )
                            }
                            min={1}
                            max={20}
                            required
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                                setIsGenerateModalOpen(false)
                            }
                            disabled={generating}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={generating}
                        >
                            {generating
                                ? "Generating..."
                                : "Generate Quiz"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Quiz"
            >
                <div className="space-y-6">
                    <p className="text-sm text-slate-600">
                        Are you sure you want to delete this quiz?
                    </p>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="secondary"
                            onClick={() =>
                                setIsDeleteModalOpen(false)
                            }
                            disabled={deleting}
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={handleConfirmDelete}
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </div>
            </Modal>

        </div>
    )
}

export default QuizManager
