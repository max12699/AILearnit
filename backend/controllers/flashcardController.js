import Flashcard from "../models/Flashcard.js";

export const getFlashcardsByDocument = async (req,res)=>{
  const flashcards = await Flashcard.find({
    documentId: req.params.id,
    userId: req.user.id
  });

  res.json({
    success:true,
    data:flashcards
  });
};


/**
 * Get flashcards for a specific document
 * GET /api/flashcards/document/:documentId
 */
export const getFlashcards = async (req, res, next) => {
  try {
    const flashcards = await Flashcard.find({
      userId: req.user.id,
      documentId: req.params.documentId
    })
      .populate("documentId", "title filename")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all flashcard sets for logged-in user
 * GET /api/flashcards
 */
export const getAllFlashcardSets = async (req, res, next) => {
  try {
    const flashcardSets = await Flashcard.find({
      userId: req.user.id
    })
      .populate("documentId", "title")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: flashcardSets.length,
      data: flashcardSets
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark a flashcard as reviewed
 * POST /api/flashcards/:cardId/review
 */
export const reviewFlashcard = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      "cards._id": req.params.cardId,
      userId: req.user.id
    });

    if (!flashcardSet) {
      return res.status(404).json({ success: false, error: "Flashcard not found" });
    }

    const card = flashcardSet.cards.find(
      c => c._id.toString() === req.params.cardId
    );

    if (!card) {
      return res.status(404).json({ success: false, error: "Card not found in set" });
    }

    card.lastReviewed = new Date();
    card.reviewCount += 1;

    await flashcardSet.save();

    res.status(200).json({
      success: true,
      data: card,
      message: "Flashcard reviewed successfully"
    });
  } catch (err) {
    next(err);
  }
};


/**
 * Toggle star on a flashcard
 * PUT /api/flashcards/:cardId/star
 */
export const toggleStarFlashcard = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      "cards._id": req.params.cardId,
      userId: req.user.id
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard not found"
      });
    }

    const card = flashcardSet.cards.find(
      c => c._id.toString() === req.params.cardId
    );

    if (!card) {
      return res.status(404).json({
        success: false,
        error: "Card not found in set"
      });
    }

    card.isStarred = !card.isStarred;
    await flashcardSet.save();

    return res.status(200).json({
      success: true,
      data: card,
      message: card.isStarred ? "Flashcard starred" : "Flashcard unstarred"
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a flashcard set
 * DELETE /api/flashcards/:setId
 */
export const deleteFlashcardSet = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      _id: req.params.setId,
      userid: req.user.id
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard set not found"
      });
    }

    await flashcardSet.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Flashcard set deleted successfully"
    });
  } catch (err) {
    next(err);
  }
};
