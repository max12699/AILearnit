import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";

import  openrouter from '../utils/openrouter.js'
import { findRelevantChunks } from '../utils/textChunker.js'
import OpenAI from "openai/index.js";

//generate flashcard from document, POST api/ai/generate-flashcards, access(Private)
export const generateFlashcards = async (req, res, next) => {
  try {
    const { documentId, count = 10 } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "documentId is required"
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userid: req.user.id,
      status: "ready"
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready"
      });
    }

    if (!document.extractedText || document.extractedText.length < 50) {
      return res.status(400).json({
        success: false,
        error: "Document text is empty or not processed yet"
      });
    }

    await new Promise(r => setTimeout(r, 1500));

    const cards = await openrouter.generateFlashcards(
      document.extractedText,
      Number(count)
    );

    const flashcardSet = await Flashcard.create({
      userId: req.user.id,
      documentId: document._id,
      cards: cards.map(card => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        reviewCount: 0,
        isStarred: false
      }))
    });

    res.status(201).json({
      success: true,
      data: flashcardSet,
      message: "Flashcards generated successfully"
    });
  } catch (err) {
    next(err);
  }
};
export const generateQuiz = async (req, res, next) => {
  try {
    const { documentId, numQuestions = 5, title } = req.body

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "documentId is required"
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userid: req.user.id,
      status: "ready"
    });

    if (!document || !document.extractedText) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready"
      });
    }

    //Generate Quiz
    const questions = await openrouter.generateQuiz(
      document.extractedText,
      Number(numQuestions)
    )

    //Save to database 
    const quiz = await Quiz.create({
      userId: req.user.id,
      documentId: document._id,
      title: title || `${document.title} - Quiz`,
      questions: questions,
      totalQuestions: questions.length,
      userAnswsers: [],
      score: 0
    })

    res.status(201).json({
      success: true,
      data: quiz,
      message: "Quiz generated successfully"
    });

  } catch (error) {
    next(error)
  }
}

export const generateSummary = async (req, res, next) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "documentId is required"
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userid: req.user.id,
      status: "ready"
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready"
      });
    }

    const summary = await openrouter.generateSummary(document.extractedText)

    res.status(200).json({
      success: true,
      data: {
        documentId: document._id,
        title: document.title,
        summary
      },
      message: "Summary generated successfully"
    });


    // 🔥 DEBUG THIS
    console.log("TEXT LENGTH:", document.extractedText?.length);

  } catch (error) {
    next(error)
  }
};

export const chat = async (req, res, next) => {
  try {
    const { documentId, question } = req.body;

    // ===== 1. VALIDATION =====
    if (!documentId || !question?.trim()) {
      return res.status(400).json({
        success: false,
        error: "documentId and question are required"
      });
    }

    // ===== 2. FIND DOCUMENT =====
    const document = await Document.findOne({
      _id: documentId,
      userid: req.user.id,
      status: "ready"
    });


    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready"
      });
    }

    // ===== 3. CHUNKS =====
    const relevantChunks = Array.isArray(document.chunks)
      ? findRelevantChunks(document.chunks, question, 3)
      : [];

    const chunkIndexes = relevantChunks.map(c => c.chunkIndex);

    // ===== 4. CHAT HISTORY =====
    let chatHistory = await ChatHistory.findOne({
      userId: req.user.id,
      documentId: document._id
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        userId: req.user.id,
        documentId: document._id,
        messages: []
      });
    }

    // ===== 5. AI CALL =====
    const answer = await openrouter.chatWithContext(
      question,
      relevantChunks
    );

    // 6. SAVE CONVERSATION
    if (!Array.isArray(chatHistory.messages)) {
      chatHistory.messages = [];
    }

    chatHistory.messages.push(
      {
        role: "user",
        content: question,
        timestamp: new Date(),
        relevantChunks: chunkIndexes
      },
      {
        role: "assistant",
        content: answer,
        timestamp: new Date(),
        relevantChunks: chunkIndexes
      }
    );

    await chatHistory.save();


    // ===== 7. RESPONSE =====
    return res.status(200).json({
      success: true,
      data: {
        question,
        answer,
        relevantChunks: chunkIndexes,
        chatHistoryId: chatHistory._id
      },
      message: "Response generated successfully"
    });

  } catch (error) {
    next(error);
  }
};


export const explainConcept = async (req, res, next) => {
  try {

    const { documentId, concept } = req.body || {};

    if (!documentId || !concept?.trim()) {
      return res.status(400).json({
        success: false,
        error: "documentId and concept are required"
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userid: req.user.id,
      status: "ready"
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready"
      });
    }

    const relevantChunks = Array.isArray(document.chunks)
      ? findRelevantChunks(document.chunks, concept, 3)
      : [];

    const contextText = relevantChunks
      .map(c => c.content)
      .join("\n\n");

    const explanation = await openrouter.explainConcept(
      concept,
      contextText
    );

    return res.status(200).json({
      success: true,
      data: {
        concept,
        explanation,
        relevantChunks: relevantChunks.map(c => c.chunkIndex),
      },
      message: "Explanation generated successfully"
    });

  } catch (error) {
    next(error);
  }
};



export const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "documentId is required"
      });
    }

    const chatHistory = await ChatHistory.findOne({
      userId: req.user.id,
      documentId
    }).select("messages");

    if (!chatHistory) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No chat history"
      });
    }

    return res.status(200).json({
      success: true,
      data: chatHistory.messages
    });

  } catch (err) {
    next(err);
  }
};

