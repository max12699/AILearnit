import React, { useEffect, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Sparkles,
  Brain
} from "lucide-react"
import toast from "react-hot-toast"
import moment from "moment"

import flashcardService from "../../services/flashcardService"
import aiService from "../../services/aiService"
import Spinner from "../common/Spinner"
import Modal from "../common/Modal"
import Flashcard from "./Flashcard"

const FlashcardManager = ({ documentId }) => {
  const [flashcardSets, setFlashcardSets] = useState([])
  const [selectedSet, setSelectedSet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [setToDelete, setSetToDelete] = useState(null)

  /////////////////////////////////////////////////////
  // Fetch Sets
  /////////////////////////////////////////////////////

  const fetchFlashCardSets = async () => {
    setLoading(true)
    try {
      const response =
        await flashcardService.getFlashcardsForDoc(documentId)

      setFlashcardSets(response.data || response)
    } catch (error) {
      toast.error("Failed to fetch flashcard sets")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (documentId) fetchFlashCardSets()
  }, [documentId])

  /////////////////////////////////////////////////////
  // Generate
  /////////////////////////////////////////////////////

  const handleGenerateFlashcards = async () => {
    setGenerating(true)
    try {
      await aiService.generateFlashcards(documentId)
      toast.success("Flashcards generated successfully")
      fetchFlashCardSets()
    } catch (error) {
      toast.error(error?.error || "Failed to generate flashcards")
    } finally {
      setGenerating(false)
    }
  }

  /////////////////////////////////////////////////////
  // Navigation
  /////////////////////////////////////////////////////

  const handleNextCard = () => {
    if (!selectedSet) return
    setCurrentCardIndex(
      (prev) => (prev + 1) % selectedSet.cards.length
    )
  }

  const handlePrevCard = () => {
    if (!selectedSet) return
    setCurrentCardIndex(
      (prev) =>
        (prev - 1 + selectedSet.cards.length) %
        selectedSet.cards.length
    )
  }

  /////////////////////////////////////////////////////
  // Star Toggle
  /////////////////////////////////////////////////////

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId)
      fetchFlashCardSets()
    } catch {
      toast.error("Failed to update star")
    }
  }

  /////////////////////////////////////////////////////
  // Delete
  /////////////////////////////////////////////////////

  const handleDeleteRequest = (e, set) => {
    e.stopPropagation()
    setSetToDelete(set)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!setToDelete) return
    setDeleting(true)

    try {
      await flashcardService.deleteFlashcardSet(
        setToDelete._id
      )
      toast.success("Flashcard set deleted")
      setSelectedSet(null)
      fetchFlashCardSets()
    } catch {
      toast.error("Failed to delete flashcard set")
    } finally {
      setDeleting(false)
      setIsDeleteModalOpen(false)
    }
  }

  /////////////////////////////////////////////////////
  // Viewer
  /////////////////////////////////////////////////////

  const renderFlashcardViewer = () => {
    const currentCard =
      selectedSet.cards[currentCardIndex]

    return (
      <div className="space-y-6">

        {/* Back */}
        <button
          onClick={() => setSelectedSet(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={16} />
          Back to sets
        </button>

        {/* Progress */}
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all"
            style={{
              width: `${
                ((currentCardIndex + 1) /
                  selectedSet.cards.length) *
                100
              }%`
            }}
          />
        </div>

        {/* Card */}
        <Flashcard
          card={currentCard}
          onToggleStar={handleToggleStar}
        />

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevCard}
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl"
          >
            <ChevronLeft />
          </button>

          <span className="text-sm text-slate-500">
            {currentCardIndex + 1} /{" "}
            {selectedSet.cards.length}
          </span>

          <button
            onClick={handleNextCard}
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    )
  }

  /////////////////////////////////////////////////////
  // List
  /////////////////////////////////////////////////////

  const renderSetList = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      )
    }

    if (!flashcardSets.length) {
      return (
        <div className="text-center space-y-4 py-10">
          <Brain className="mx-auto text-slate-400" size={40} />
          <h3 className="font-semibold text-slate-800">
            No Flashcards Yet
          </h3>
          <p className="text-sm text-slate-500">
            Generate flashcards to start learning.
          </p>

          <button
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg disabled:opacity-50"
          >
            <Sparkles size={16} />
            {generating
              ? "Generating..."
              : "Generate Flashcards"}
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {flashcardSets.map((set) => (
          <div
            key={set._id}
            onClick={() => {
              setSelectedSet(set)
              setCurrentCardIndex(0)
            }}
            className="p-5 border rounded-2xl hover:shadow-lg transition cursor-pointer flex justify-between items-center bg-white"
          >
            <div>
              <h4 className="font-medium text-slate-800">
                {set.title || "Flashcard Set"}
              </h4>
              <p className="text-xs text-slate-500">
                {set.cards.length} cards •{" "}
                {moment(set.createdAt).fromNow()}
              </p>
            </div>

            <button
              onClick={(e) =>
                handleDeleteRequest(e, set)
              }
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    )
  }

  /////////////////////////////////////////////////////
  // Render
  /////////////////////////////////////////////////////

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
      {selectedSet
        ? renderFlashcardViewer()
        : renderSetList()}

      {isDeleteModalOpen && (
        <Modal
          title="Delete Flashcard Set"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          loading={deleting}
        >
          Are you sure you want to delete this set?
        </Modal>
      )}
    </div>
  )
}

export default FlashcardManager
