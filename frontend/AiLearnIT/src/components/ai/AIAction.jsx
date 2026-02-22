import React, { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import {
  Sparkles,
  BookOpen,
  Lightbulb,
  X,
  Copy,
  RefreshCcw
} from "lucide-react"
import aiService from "../../services/aiService"
import toast from "react-hot-toast"
import MarkdownRenderer from "../common/MarkdownRenderer"

const AIAction = () => {
  const { id: documentId } = useParams()

  const [loadingAction, setLoadingActions] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState("")
  const [modalTitle, setModalTitle] = useState("")
  const [concept, setConcept] = useState("")
  const [lastAction, setLastAction] = useState(null)

  const inputRef = useRef(null)

  /////////////////////////////////////////////////////
  // ESC Close
  /////////////////////////////////////////////////////

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsModalOpen(false)
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  /////////////////////////////////////////////////////
  // Auto Focus Concept
  /////////////////////////////////////////////////////

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  /////////////////////////////////////////////////////
  // Generate Summary
  /////////////////////////////////////////////////////

  const handleGenerateSummary = async () => {
    if (!documentId) {
      toast.error("Invalid document")
      return
    }

    setLoadingActions("summary")

    try {
      const response = await aiService.generateSummary(documentId)

      const summary =
        response?.data?.summary || response?.summary

      setModalTitle("Generated Summary")
      setModalContent(summary)
      setLastAction("summary")
      setIsModalOpen(true)
    } catch (error) {
      console.error(error)
      toast.error(error?.error || "Failed to generate summary")
    } finally {
      setLoadingActions(null)
    }
  }

  /////////////////////////////////////////////////////
  // Explain Concept
  /////////////////////////////////////////////////////

  const handleExplainConcept = async (e) => {
    e.preventDefault()

    if (!concept.trim()) {
      toast.error("Please enter a concept")
      return
    }

    if (concept.length > 80) {
      toast.error("Concept too long (max 80 characters)")
      return
    }

    setLoadingActions("explain")

    try {
      const response = await aiService.explainConcept(
        documentId,
        concept
      )

      const explanation =
        response?.data?.explanation || response?.explanation

      setModalTitle(`Explanation of "${concept}"`)
      setModalContent(explanation)
      setLastAction("explain")
      setIsModalOpen(true)
      setConcept("")
    } catch (error) {
      console.error(error)
      toast.error(error?.error || "Failed to explain concept")
    } finally {
      setLoadingActions(null)
    }
  }

  /////////////////////////////////////////////////////
  // Copy Response
  /////////////////////////////////////////////////////

  const handleCopy = () => {
    navigator.clipboard.writeText(modalContent)
    toast.success("Copied to clipboard")
  }

  /////////////////////////////////////////////////////
  // Regenerate
  /////////////////////////////////////////////////////

  const handleRegenerate = () => {
    if (lastAction === "summary") {
      handleGenerateSummary()
    }
  }

  /////////////////////////////////////////////////////
  // UI
  /////////////////////////////////////////////////////

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl relative">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-linear-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Sparkles className="text-white w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            AI Assistant
          </h3>
          <p className="text-sm text-slate-500">
            Smart tools to enhance your learning
          </p>
        </div>
      </div>

      <div className="space-y-6">

        {/* Summary */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 transition hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h4 className="font-medium text-slate-800">
              Generate Summary
            </h4>
          </div>

          <button
            onClick={handleGenerateSummary}
            disabled={loadingAction === "summary"}
            className="w-full py-3 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl transition disabled:opacity-50 active:scale-95"
          >
            {loadingAction === "summary"
              ? "Generating..."
              : "Generate Summary"}
          </button>
        </div>

        {/* Explain */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 transition hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h4 className="font-medium text-slate-800">
              Explain a Concept
            </h4>
          </div>

          <form onSubmit={handleExplainConcept} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Enter a concept..."
              className="flex-1 px-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-emerald-500"
              maxLength={80}
            />

            <button
              type="submit"
              disabled={loadingAction === "explain"}
              className="px-5 py-3 bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-xl disabled:opacity-50 active:scale-95"
            >
              {loadingAction === "explain"
                ? "Explaining..."
                : "Explain"}
            </button>
          </form>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white max-w-3xl w-full max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

            <div className="flex justify-between items-center p-5 border-b bg-slate-50">
              <h3 className="font-semibold text-slate-800">
                {modalTitle}
              </h3>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopy}
                  className="text-slate-500 hover:text-slate-800"
                >
                  <Copy size={18} />
                </button>

                {lastAction === "summary" && (
                  <button
                    onClick={handleRegenerate}
                    className="text-slate-500 hover:text-slate-800"
                  >
                    <RefreshCcw size={18} />
                  </button>
                )}

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-500 hover:text-slate-800"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              <MarkdownRenderer content={modalContent} />
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default AIAction
