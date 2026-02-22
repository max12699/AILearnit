import mongoose from "mongoose";
import Flashcard from '../models/Flashcard.js'
import fs from "fs/promises";
import Document from "../models/Document.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import Quiz from "../models/Quiz.js";
import path from 'path'
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload Document (PDF or single page image)
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file attached to request" });
    }

    const { title } = req.body;
    if (!title) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ success: false, error: "Document title is required" });
    }

    const isPDF = req.file.mimetype === "application/pdf";
    const fileUrl = `uploads/documents/${req.file.filename}`;

    const docRecord = await Document.create({
      userid: req.user.id,
      title,
      filename: req.file.originalname,
      filePath: fileUrl,
      fileSize: req.file.size,
      fileType: isPDF ? "pdf" : "image",
      status: isPDF ? "processing" : "ready"
    });

    // Trigger PDF text extraction without blocking API response
    if (isPDF) {
      extractPDFText(docRecord._id, req.file.path);
    }

    return res.status(201).json({
      success: true,
      message: isPDF ? "PDF uploaded, extraction in progress" : "Image uploaded successfully",
      data: docRecord
    });

  } catch (err) {
    console.error("Upload Error:", err); // prints real error in terminal
    return res.status(500).json({
      success: false,
      error: err.message || "Upload failed on server"
    });
  }

};

// Background PDF text extraction (no callback, no response blocking)
const extractPDFText = async (docId, filePath) => {
  try {
    const { text } = await extractTextFromPDF(filePath);
    await Document.findByIdAndUpdate(docId, { extractedText: text, status: "ready" });
  } catch {
    await Document.findByIdAndUpdate(docId, { status: "failed" });
  }
};

// Get all documents for logged-in user
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ userid: req.user.id }).lean();

    return res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });

  } catch (err) {
    next(err);
  }
};


// Get a single document by ID
export const getDocument = async (req, res, next) => {
  try {
    // Fetch document
    const document = await Document.findById(req.params.id).select("-extractedText -chunks");
    if (!document) {
      return res.status(404).json({ success: false, error: "Document not found" });
    }

    // Count related records
    const flashcardCount = await Flashcard.countDocuments({
      documentId: document._id,
      userid: req.user.id
    });

    const quizCount = await Quiz.countDocuments({
      documentId: document._id,
      userid: req.user.id
    });

    // Update last accessed timestamp
    document.lastAccessed = Date.now();
    await document.save();

    // Prepare final object
    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;

    return res.status(200).json({
      success: true,
      data: documentData
    });

  } catch (err) {
    next(err);
  }
};


/// Delete document
export const deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: "Document not found" });
    }

    const uploadDir = path.join(__dirname, "../uploads/documents"); // folder path

    // Remove file from storage safely
    const fileName = doc.filePath.replace("uploads/documents/", "");
    const filePath = path.join(uploadDir, fileName);

    await fs.unlink(filePath).catch(() => {
      console.warn("File not found in storage, skipping delete");
    });

    // Delete DB record
    await doc.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully"
    });

  } catch (err) {
    next(err);
  }
};


// Update document title
export const updateDocument = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ success: false, error: "New title is required" });

    const updated = await Document.findByIdAndUpdate(req.params.id, { title }, { new: true }).lean();
    if (!updated) return res.status(404).json({ success: false, error: "Document not found" });

    return res.json({ success: true, data: updated, message: "Title updated" });
  } catch (err) {
    next(err);
  }
};
