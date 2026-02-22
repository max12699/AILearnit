import React, { useEffect, useState } from "react"
import flashcardService from "../../services/flashcardService"
import PageHeader from "../../components/common/PageHeader"
import Spinner from "../../components/common/Spinner"
import EmptyState from "../../components/common/EmptyState"
import toast from "react-hot-toast"
import FlashcardSetCard from "../../components/flashcards/FlashcardSetCard"

const FlashListPage = () => {
  const [flashcardSets, setFlashcardSets] = useState([])
  const [loading, setLoading] = useState(true)

  //////////////////////////////////////////////////////
  // Fetch All Flashcard Sets
  //////////////////////////////////////////////////////
  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        const response = await flashcardService.getAllFlashcardSets()

        console.log("Flashcard sets response:", response)

        // 🔥 Handle common backend response structures safely
        const sets =
          response?.data?.data || response?.data || []

        setFlashcardSets(sets)

      } catch (error) {
        toast.error("Failed to fetch flashcard sets")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchFlashcardSets() // ✅ YOU FORGOT THIS ()
  }, [])

  //////////////////////////////////////////////////////
  // Render Content
  //////////////////////////////////////////////////////
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (!flashcardSets.length) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <PageHeader title="All Flashcard Sets" />
        <div className="mt-10">
          <EmptyState
            title="No Flashcard Sets Found"
            description="You haven't generated any flashcards yet. Go to a document to create your first set."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <PageHeader title="All Flashcard Sets" />

      <div className="grid gap-6 mt-8 
                      grid-cols-1 
                      sm:grid-cols-2 
                      lg:grid-cols-3">

        {flashcardSets.map((set) => (
          <FlashcardSetCard
            key={set._id}
            flashcardSet={set}  // ✅ FIXED PROP NAME
          />
        ))}

      </div>
    </div>
  )
}

export default FlashListPage