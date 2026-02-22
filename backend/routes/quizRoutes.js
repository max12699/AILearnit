import express from 'express'
import {
    getQuizzes,
    getQuizById,
    submitQuiz,
    getQuizResult,
    deleteQuiz,
    retakeQuiz
} from '../controllers/quizController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

router.get('/document/:documentId', getQuizzes)
router.get('/quiz/:id', getQuizById)
router.post('/:id/submit', submitQuiz)
router.get('/:id/results', getQuizResult)
router.delete('/:id', deleteQuiz)
router.post('/:id/retake', retakeQuiz)

export default router
