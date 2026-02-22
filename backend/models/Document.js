import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    filename: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    extractedText: {
      type: String,
      default: ""
    },
    chunks: [
      {
        content: { type: String, required: true },
        pageNumber: { type: Number, default: 0 },
        chunkIndex: { type: Number, required: true }
      }
    ],
    lastAccessed: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing"
    }
  },
  { timestamps: true }
);

documentSchema.index({ userid: 1, createdAt: -1 });

const Document = mongoose.model("Document", documentSchema);
export default Document;
