import Quiz from '../models/Quiz.js'

// GET all quizzes for a document
export const getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({
      userId: req.user.id,
      documentId: req.params.documentId
    })
      .populate('documentId', 'title filename')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    })
  } catch (error) {
    next(error)
  }
}


// GET single quiz by ID
export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user.id
    })

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      })
    }

    res.status(200).json({
      success: true,
      data: quiz
    })
  } catch (error) {
    next(error)
  }
}

// SUBMIT quiz
export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user.id
    })

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found"
      })
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: "Answers must be an array"
      })
    }

    let score = 0

    const formattedAnswers = answers.map(
      ({ questionIndex, selectedAnswer }) => {

        if (
          typeof questionIndex !== "number" ||
          questionIndex < 0 ||
          questionIndex >= quiz.questions.length
        ) {
          throw new Error("Invalid question index")
        }

        const question = quiz.questions[questionIndex]

        const isCorrect =
          question.correctAnswer === selectedAnswer

        if (isCorrect) score++

        return {
          questionIndex,
          selectedAnswer,
          isCorrect
        }
      }
    )

    // 🔥 Now calculate percentage AFTER score exists
    const totalQuestions = quiz.questions.length
    const percentage = (score / totalQuestions) * 100

    quiz.userAnswers = formattedAnswers
    quiz.score = score
    quiz.totalQuestions = totalQuestions
    quiz.completed = true
    quiz.completedAt = new Date()
    quiz.passed = percentage >= 50   // optional if schema has passed field

    await quiz.save()

    return res.status(200).json({
      success: true,
      data: {
        score,
        totalQuestions,
        percentage,
        passed: percentage >= 50
      }
    })

  } catch (error) {
    console.error("Submit error:", error)

    return res.status(500).json({
      success: false,
      error: error.message || "Server error"
    })
  }
}

// GET quiz result
export const getQuizResult = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user.id
    })

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found"
      })
    }

    if (!quiz.completed) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "Quiz not completed yet"
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        score: quiz.score,
        totalQuestions: quiz.totalQuestions,
        answers: quiz.userAnswers,
        completedAt: quiz.completedAt
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error"
    })
  }
}


// DELETE quiz
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id
    })

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      })
    }

    await quiz.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

// RETAKE QUIZ
export const retakeQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user.id
    })

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found"
      })
    }

    quiz.completed = false
    quiz.score = 0
    quiz.userAnswers = []
    quiz.completedAt = null

    await quiz.save()

    return res.status(200).json({
      success: true,
      message: "Quiz reset successfully"
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error"
    })
  }
}
