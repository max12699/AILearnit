import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Home, ArrowLeft, Bot } from "lucide-react"

export default function NotFoundPage() {
  const navigate = useNavigate()

  // Random funny messages
  const messageList = [
    "This page escaped into the metaverse 🌌",
    "Our AI searched everywhere… still nothing 🤖",
    "404: Brain not found 🧠",
    "The page is playing hide & seek 🙈",
    "Looks like you found a secret void 🕳️"
  ]
  const [messages] = useState(() => messageList[Math.floor(Math.random() * messageList.length)])

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden relative px-6">

      {/* Floating Ghost */}
      <div className="absolute top-20 left-10 animate-bounce opacity-20">
        👻
      </div>

      <div className="absolute bottom-20 right-10 animate-pulse opacity-20">
        👻
      </div>

      <div className="text-center max-w-2xl relative z-10">

        {/* Glitch 404 */}
        <h1 className="text-8xl sm:text-9xl font-extrabold relative glitch text-emerald-400">
          404
        </h1>

        <h2 className="text-3xl font-bold mt-6">
          Oops! Page Not Found
        </h2>

        <p className="text-slate-400 mt-4 text-lg">
          {messages}
        </p>

        {/* AI Robot Card */}
        <div className="mt-10 bg-slate-900/60 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-2xl">

          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl bg-emerald-500/20">
              <Bot className="w-8 h-8 text-emerald-400" />
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">
            I scanned your learning universe and couldn't find this page.
            Maybe it's under maintenance… or it rage quit.
          </p>

        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-10 flex-wrap">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all duration-300"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-all duration-300 active:scale-95"
          >
            <Home size={18} />
            Take Me Home
          </button>

        </div>

      </div>

      {/* Glitch CSS */}
      <style>{`
        .glitch {
          position: relative;
          animation: glitch 1s infinite;
        }

        @keyframes glitch {
          0% { text-shadow: 2px 2px #00ff99, -2px -2px #ff0055; }
          25% { text-shadow: -2px 2px #00ff99, 2px -2px #ff0055; }
          50% { text-shadow: 2px -2px #00ff99, -2px 2px #ff0055; }
          75% { text-shadow: -2px -2px #00ff99, 2px 2px #ff0055; }
          100% { text-shadow: 2px 2px #00ff99, -2px -2px #ff0055; }
        }
      `}</style>

    </div>
  )
}
