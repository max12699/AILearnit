import React, { useState, useEffect, useRef } from "react"
import { Send, MessageSquare, Sparkles } from "lucide-react"
import { useParams } from "react-router-dom"

import aiService from "../../services/aiService"
import { useAuth } from "../../context/AuthContext"
import Spinner from "../common/Spinner"
import MarkdownRenderer from "../common/MarkdownRenderer"

const ChatInterface = () => {
  const { id: documentId } = useParams()
  const { user } = useAuth()

  const [history, setHistory] = useState([])
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const messageEndRef = useRef(null)

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setInitialLoading(true)
        const response = await aiService.getChatHistory(documentId)
        setHistory(response.data || [])
      } catch (error) {
        console.error("Failed to fetch chat history:", error)
      } finally {
        setInitialLoading(false)
      }
    }

    if (documentId) fetchChatHistory()
  }, [documentId])

  useEffect(() => {
    scrollToBottom()
  }, [history])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || loading) return

    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date()
    }

    setHistory((prev) => [...prev, userMessage])
    setMessage("")
    setLoading(true)

    try {
      const response = await aiService.chat(documentId, userMessage.content)

      const assistantMessage = {
        role: "assistant",
        content: response.data.answer,
        timestamp: new Date(),
        relevantChunks: response.data.relevantChunks
      }

      setHistory((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)

      setHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const renderMessage = (msg, index) => {
  const isUser = msg.role === "user"
  const prevMsg = history[index - 1]
  const showAvatar = !prevMsg || prevMsg.role !== msg.role

  const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content)
  }

  return (
    <div
      key={msg.id || index}
      className={`group flex items-start gap-3 mb-2 transition-all duration-300 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Assistant Avatar */}
      {!isUser && showAvatar && (
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-md">
          <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
      )}

      {!isUser && !showAvatar && <div className="w-9" />}

      {/* Message Bubble */}
      <div className="flex flex-col max-w-xl">

        <div
          className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm wrap-break-word transition-all duration-200
            ${
              isUser
                ? "bg-linear-to-br from-emerald-500 to-teal-500 text-white rounded-br-md"
                : "bg-white border border-slate-200 text-slate-800 rounded-bl-md"
            }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <MarkdownRenderer content={msg.content} />
          )}

          {/* Copy Button (Assistant Only) */}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md"
            >
              Copy
            </button>
          )}
        </div>

        {/* Timestamp */}
        <span
          className={`text-[11px] mt-1 text-slate-400 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {formattedTime}
        </span>
      </div>

      {/* User Avatar */}
      {isUser && showAvatar && (
        <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center shrink-0 font-semibold text-slate-700">
          {user?.username?.charAt(0).toUpperCase() || "U"}
        </div>
      )}

      {isUser && !showAvatar && <div className="w-9" />}
    </div>
  )
}


  if (initialLoading) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center bg-white rounded-2xl shadow-xl">
        <MessageSquare className="w-8 h-8 text-emerald-600 mb-4" />
        <Spinner />
        <p className="text-sm text-slate-500 mt-3">
          Loading chat history...
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[70vh] bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-10 h-10 text-emerald-500 mb-4" />
            <h3 className="font-semibold text-slate-800">
              Start a conversation
            </h3>
            <p className="text-sm text-slate-500">
              Ask me anything about the document
            </p>
          </div>
        ) : (
          history.map(renderMessage)
        )}

        {/* AI typing indicator */}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="px-4 py-3 bg-white border rounded-2xl rounded-bl-md shadow">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      {/* Input */}
      <div className="p-5 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a follow-up question..."
            disabled={loading}
            className="flex-1 h-12 px-4 border rounded-xl text-sm focus:outline-none focus:border-emerald-500"
          />

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="w-12 h-12 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl flex items-center justify-center disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatInterface
