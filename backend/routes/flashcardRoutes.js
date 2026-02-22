import express from 'express'
import {
    getFlashcards,
    getAllFlashcardSets,
    reviewFlashcard,
    toggleStarFlashcard,
    deleteFlashcardSet,
    getFlashcardsByDocument
} from "../controllers/flashcardController.js";

import protect from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

router.get("/document/:id", protect, getFlashcardsByDocument);
router.get('/', getAllFlashcardSets)
router.get('/:documentId', getFlashcards)
router.post('/:cardId/review', reviewFlashcard)
router.put('/:cardId/star', toggleStarFlashcard)
router.delete("/:setId", deleteFlashcardSet)

export default router