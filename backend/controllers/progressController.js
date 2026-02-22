import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [
      totalDocuments,
      totalFlashcardSets,
      totalQuizzes,
      completedQuizzes,
      flashcardSets,
      completedQuizDocs,
      recentDocuments,
      recentQuizzes,
    ] = await Promise.all([
      Document.countDocuments({ userid: userId }),
      Flashcard.countDocuments({ userId }),
      Quiz.countDocuments({ userId }),
      Quiz.countDocuments({ userId, completedAt: { $ne: null } }),
      Flashcard.find({ userId }).select("cards"),
      Quiz.find({ userId, completedAt: { $ne: null } }).select("score"),
      Document.find({ userid: userId }).sort({ lastAccessed: -1 }).limit(5),
      Quiz.find({ userId }).sort({ createdAt: -1 }).limit(5),
    ]);

    let totalFlashcards = 0;
    let reviewedFlashcards = 0;
    let starredFlashcards = 0;

    flashcardSets.forEach(set => {
      totalFlashcards += set.cards.length;
      reviewedFlashcards += set.cards.filter(c => c.reviewCount > 0).length;
      starredFlashcards += set.cards.filter(c => c.isStarred).length;
    });


    const completedQuizDocsForAvg = await Quiz.find({
      userId,
      completedAt: { $ne: null }
    }).select("score");

    const averageScore =
      completedQuizDocsForAvg.length > 0
        ? Math.round(
            completedQuizDocsForAvg.reduce((sum, q) => sum + q.score, 0) /
              completedQuizDocsForAvg.length
          )
        : 0;

    // 🔥 Weekly progress aggregation
    const weeklyProgressRaw = await Quiz.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          value: { $sum: 1 },
        },
      },
    ]);

    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const progress = days.map((day, i) => {
      const found = weeklyProgressRaw.find(d => d._id === i + 1);
      return { name: day, value: found ? found.value : 0 };
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalDocuments,
          totalFlashcardSets,
          totalFlashcards,
          reviewedFlashcards,
          starredFlashcards,
          totalQuizzes,
          completedQuizzes,
          averageScore,
          studyStreak: Math.floor(Math.random() * 7) + 1,
        },
        recentActivity: {
          documents: recentDocuments,
          quizzes: recentQuizzes,
        },
        progress,
      },
    });
  } catch (error) {
    next(error);
  }
};
