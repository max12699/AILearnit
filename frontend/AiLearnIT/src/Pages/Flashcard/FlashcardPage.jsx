import React, { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2
} from "lucide-react"
import toast from "react-hot-toast"

import flashcardService from "../../services/flashcardService"
import aiService from "../../services/aiService"
import PageHeader from "../../components/common/PageHeader"
import Spinner from "../../components/common/Spinner"
import EmptyState from "../../components/common/EmptyState"
import Button from "../../components/common/Button"
import Modal from "../../components/common/Modal"
import Flashcard from "../../components/flashcards/Flashcard"

const FlashcardPage = () => {
  const { id: documentId } = useParams()

  const [flashcards, setFlashcards] = useState([])
  const [setId, setSetId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  ////////////////////////////////////////////////////////
  // Fetch
  ////////////////////////////////////////////////////////

  const fetchFlashcards = async () => {
    try {
      setLoading(true)

      const res = await flashcardService.getFlashcardsForDoc(documentId)
      const set = res?.data?.[0]

      if (set) {
        setSetId(set._id)
        setFlashcards(set.cards || [])
        setCurrentIndex(0)
      } else {
        setFlashcards([])
        setSetId(null)
      }

    } catch {
      toast.error("Failed to fetch flashcards")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (documentId) fetchFlashcards()
  }, [documentId])

  ////////////////////////////////////////////////////////
  // Generate + Auto Study
  ////////////////////////////////////////////////////////

  const handleGenerate = async () => {
    try {
      setGenerating(true)

      await aiService.generateFlashcards(documentId)

      const res = await flashcardService.getFlashcardsForDoc(documentId)
      const set = res?.data?.[0]

      if (set?.cards?.length) {
        setSetId(set._id)
        setFlashcards(set.cards)
        setCurrentIndex(0)
        toast.success("Flashcards ready! 🎉")
        window.scrollTo({ top: 0, behavior: "smooth" })
      }

    } catch (err) {
      toast.error("Failed to generate flashcards")
    } finally {
      setGenerating(false)
    }
  }

  ////////////////////////////////////////////////////////
  // Navigation
  ////////////////////////////////////////////////////////

  const nextCard = useCallback(() => {
    setCurrentIndex(prev =>
      prev === flashcards.length - 1 ? 0 : prev + 1
    )
  }, [flashcards])

  const prevCard = useCallback(() => {
    setCurrentIndex(prev =>
      prev === 0 ? flashcards.length - 1 : prev - 1
    )
  }, [flashcards])

  ////////////////////////////////////////////////////////
  // Keyboard Shortcuts
  ////////////////////////////////////////////////////////

  useEffect(() => {
    const handleKey = (e) => {
      if (!flashcards.length) return

      if (e.key === "ArrowRight") nextCard()
      if (e.key === "ArrowLeft") prevCard()
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [flashcards, nextCard, prevCard])

  ////////////////////////////////////////////////////////
  // Delete
  ////////////////////////////////////////////////////////

  const handleDelete = async () => {
    if (!setId) return

    try {
      setDeleting(true)
      await flashcardService.deleteFlashcardSet(setId)
      toast.success("Flashcard set deleted")
      setFlashcards([])
      setIsDeleteOpen(false)
    } catch {
      toast.error("Failed to delete")
    } finally {
      setDeleting(false)
    }
  }

  ////////////////////////////////////////////////////////
  // Render
  ////////////////////////////////////////////////////////

  const progress =
    flashcards.length > 0
      ? Math.round(((currentIndex + 1) / flashcards.length) * 100)
      : 0

  const currentCard = flashcards[currentIndex]

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      <PageHeader
        title="Flashcards"
        backLink={`/documents/${documentId}`}
        actions={
          flashcards.length > 0 ? (
            <Button
              variant="secondary"
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash2 size={16} />
              Delete Set
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={generating}
            >
              <Plus size={16} />
              {generating ? "Generating..." : "Generate"}
            </Button>
          )
        }
      />

      <div className="bg-white border rounded-3xl p-10 shadow-sm mt-6 min-h-100 flex flex-col justify-between">

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : !flashcards.length ? (
          <EmptyState
            title="No Flashcards Yet"
            description="Generate flashcards to start studying."
            buttonText="Generate Flashcards"
            onActionClick={handleGenerate}
          />
        ) : (
          <>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Animated Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <Flashcard flashcard={currentCard} />
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-10">

              <Button onClick={prevCard} variant="secondary">
                <ChevronLeft size={18} />
                Previous
              </Button>

              <span className="text-sm font-medium text-slate-600">
                {currentIndex + 1} / {flashcards.length}
              </span>

              <Button onClick={nextCard} variant="secondary">
                Next
                <ChevronRight size={18} />
              </Button>

            </div>
          </>
        )}

      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Flashcard Set"
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this set?
          </p>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>

            <Button
              onClick={handleDelete}
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

export default FlashcardPage