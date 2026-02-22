import React from "react";
import { useNavigate } from "react-router-dom";
import {
    FileText,
    Trash2,
    BookOpen,
    BrainCircuit,
    Clock,
    Eye
} from "lucide-react";
import moment from "moment";

/* Format file size */
const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const sizes = ["B", "KB", "MB", "GB"];
    let i = 0;
    while (bytes >= 1024 && i < sizes.length - 1) {
        bytes /= 1024;
        i++;
    }
    return `${bytes.toFixed(1)} ${sizes[i]}`;
};

export default function DocumentCard({ document, onDelete }) {
    const navigate = useNavigate();

    const openDocument = () => {
        navigate(`/documents/${document._id}`);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(document);
    };

    return (
        <div
            onClick={openDocument}
            className="group cursor-pointer bg-slate-900 border border-slate-800 rounded-2xl p-5 
      hover:border-emerald-500/40 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
        >
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                        <FileText size={22} />
                    </div>

                    <div>
                        <h3 className="text-white font-semibold line-clamp-1">
                            {document?.title}
                        </h3>
                        <p className="text-xs text-slate-400">
                            {formatFileSize(document.fileSize)}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleDelete}
                    className="opacity-70 hover:opacity-100 text-red-400 hover:text-red-500 transition"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Stats */}
            <div className="mt-4 flex items-center gap-5 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                    <BookOpen size={16} />
                    {document?.flashcardCount || 0}
                </div>

                <div className="flex items-center gap-1">
                    <BrainCircuit size={16} />
                    {document?.quizCount || 0}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {moment(document.createdAt).fromNow()}
                </div>

                <span className={`px-2 py-1 rounded-full text-xs capitalize
                         ${document.status === "uploading"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-emerald-500/10 text-emerald-400"}
                        `}>
                    {document.status || "ready"}
                </span>
            </div>

        </div>
    );
}
