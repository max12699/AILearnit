import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import { ArrowLeft, ExternalLink } from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import Tabs from "../../components/common/Tab";
import ChatInterface from "../../components/Chat/ChatInterface";
import AIAction from "../../components/ai/AIAction";
import FlashcardManager from "../../components/flashcards/FlashcardManager";
import QuizManager from "../../components/quizzes/QuizManager";

export default function DocDetailPage() {
  const { id } = useParams();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("content");

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const doc = await documentService.getDocumentById(id);
        setDocument(doc);
      } catch (error) {
        toast.error("Failed to load document");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  /* ================= PDF URL ================= */
  const pdfUrl = useMemo(() => {
    if (!document?.filePath) return null;

    const baseUrl =
      import.meta.env.VITE_API_URL || "http://localhost:8000";

    return `${baseUrl}/${document.filePath}`;
  }, [document]);

  /* ================= CONTENT TAB ================= */
  const renderContent = () => {
    if (!pdfUrl)
      return (
        <div className="p-10 text-center text-slate-400">
          Document not available
        </div>
      );

    return (
      <div className="relative bg-linear-to-b from-slate-900 to-slate-950 
                    border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <span className="text-sm font-medium text-slate-300">
            Document Viewer
          </span>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-emerald-400 
                     hover:text-emerald-300 transition font-medium"
          >
            <ExternalLink size={16} />
            Open in new tab
          </a>
        </div>

        {/* Viewer */}
        <div className="relative w-full h-[78vh] bg-black">
          <iframe
            src={`${pdfUrl}#toolbar=1`}
            title="PDF Viewer"
            className="w-full h-full"
          />
        </div>
      </div>
    );
  };


  const renderChat = () =>{return <ChatInterface/> } 
  const renderAiActions = () => {return <AIAction/>};
  const renderFlashcardsTab = () => {return <FlashcardManager documentId={id} />};
  const renderQuizzesTab = () => {return <QuizManager documentId={id} />}

  /* ================= TABS ================= */
  const tabs = [
    { name: "content", label: "Content", content: renderContent() },
    { name: "chat", label: "Chat", content: renderChat() },
    { name: "ai", label: "AI Actions", content: renderAiActions() },
    { name: "flashcards", label: "Flashcards", content: renderFlashcardsTab() },
    { name: "quizzes", label: "Quizzes", content: renderQuizzesTab() }
  ];

  /* ================= STATES ================= */
  if (loading) return <Spinner />;

  if (!document)
    return (
      <div className="p-10 text-center text-slate-400">
        Document not found
      </div>
    );

  /* ================= UI ================= */
  return (
    <div className="min-h-screen p-6 lg:p-10 text-black space-y-6">

      {/* Back */}
      <Link
        to="/documents"
        className="inline-flex items-center gap-2 text-sm text-slate-900 hover:text-white transition"
      >
        <ArrowLeft size={16} />
        Back to Documents
      </Link>

      {/* Header */}
      <PageHeader
        title={document.title}
        subtitle="AI learning workspace"
      />

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
