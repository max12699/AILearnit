import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    questions: [
      {
        question: { type: String, required: true },

        options: {
          type: [String],
          required: true,
          validate: {
            validator: (arr) => arr.length === 4,
            message: "Each question must have exactly 4 options"
          }
        },

        correctAnswer: { type: String, required: true },

        explanation: { type: String, default: "" },

        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "medium"
        }
      }
    ],


    completed: {
      type: Boolean,
      default: false
    },

    score: {
      type: Number,
      default: 0
    },

    totalQuestions: {
      type: Number,
      required: true
    },

    userAnswers: [
      {
        questionIndex: { type: Number, required: true },
        selectedAnswer: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
        answeredAt: { type: Date, default: Date.now }
      }
    ],

    completedAt: {
      type: Date,
      default: null
    },

    passed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Faster filtering
quizSchema.index({ userId: 1, documentId: 1 });

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
