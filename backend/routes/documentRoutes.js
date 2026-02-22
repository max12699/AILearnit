import express from "express";
import protect  from "../middleware/auth.js";
import upload from "../config/multer.js";
import { uploadDocument, getDocument, getDocuments, deleteDocument, updateDocument } from "../controllers/documentController.js";

const router = express.Router();

router.use(protect);

router.post("/upload",protect, upload.single("file"), uploadDocument);
router.get("/", getDocuments);
router.get("/:id", getDocument);
router.delete("/:id", deleteDocument);
router.put("/:id", updateDocument);

export default router;
