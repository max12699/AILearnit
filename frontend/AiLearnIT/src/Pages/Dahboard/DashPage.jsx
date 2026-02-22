import React, { useEffect, useState } from "react";
import progressService from "../../services/progressService";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";

import {
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Clock,
  Activity,
  Award,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function DashPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setError(null);
      const data = await progressService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard API Error:", err);
      setError(err?.message || "Failed to load dashboard");
      toast.error(err?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  /* ================= STATES ================= */

  if (loading) return <Spinner />;

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-slate-400 text-center">
        <div className="space-y-3">
          <TrendingUp className="w-12 h-12 mx-auto text-emerald-400" />
          <p>{error || "Dashboard data unavailable"}</p>
          <button
            onClick={loadDashboard}
            className="text-emerald-400 underline text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ================= SAFE DESTRUCTURE ================= */

  const overview = dashboardData.overview ?? {};
  const recentActivity = dashboardData.recentActivity ?? {
    documents: [],
    quizzes: [],
  };
  const progress =
    dashboardData.progress ??
    [
      { name: "Mon", value: 0 },
      { name: "Tue", value: 0 },
      { name: "Wed", value: 0 },
      { name: "Thu", value: 0 },
      { name: "Fri", value: 0 },
      { name: "Sat", value: 0 },
      { name: "Sun", value: 0 },
    ];

  /* ================= STATS ================= */

  const stats = [
    {
      label: "Documents",
      value: overview.totalDocuments ?? 0,
      icon: FileText,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      label: "Flashcards",
      value: overview.totalFlashcards ?? 0,
      icon: BookOpen,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      label: "Reviewed",
      value: overview.reviewedFlashcards ?? 0,
      icon: Activity,
      gradient: "from-indigo-500 to-violet-500",
    },
    {
      label: "Quizzes",
      value: overview.totalQuizzes ?? 0,
      icon: BrainCircuit,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      label: "Avg Score",
      value: `${overview.averageScore ?? 0}%`,
      icon: Award,
      gradient: "from-yellow-400 to-amber-500",
    },
  ];

  /* ================= UI ================= */

 return (
  <div className="min-h-screen bg-slate-50 p-6 lg:p-10 space-y-10">

    {/* Header */}
    <div>
      <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">
        Dashboard
      </h1>
      <p className="text-slate-500 mt-1">
        AI Learning Assistant Overview
      </p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {stats.map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-300"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-500 text-sm">{item.label}</p>
                <h2 className="text-2xl font-bold text-slate-800 mt-1">
                  {item.value}
                </h2>
              </div>

              <div
                className={`p-3 rounded-xl bg-linear-to-br ${item.gradient} shadow-md`}
              >
                <Icon className="text-white w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {/* Chart */}
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
        <TrendingUp className="text-emerald-500" />
        Weekly Progress
      </h2>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={progress}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff"
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", r: 5 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Recent Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Documents */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="font-semibold text-slate-700 mb-4 flex gap-2 items-center">
          <Clock className="text-blue-500" />
          Recent Documents
        </h2>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {recentActivity.documents.length === 0 ? (
            <p className="text-slate-400 text-sm">
              No recent documents
            </p>
          ) : (
            recentActivity.documents.map(doc => (
              <div
                key={doc._id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition"
              >
                <p className="text-slate-800 font-medium">
                  {doc.title}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quizzes */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="font-semibold text-slate-700 mb-4 flex gap-2 items-center">
          <Activity className="text-purple-500" />
          Recent Quizzes
        </h2>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {recentActivity.quizzes.length === 0 ? (
            <p className="text-slate-400 text-sm">
              No recent quizzes
            </p>
          ) : (
            recentActivity.quizzes.map(quiz => (
              <div
                key={quiz._id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition"
              >
                <p className="text-slate-800 font-medium">
                  {quiz.title}
                </p>
                <span className="inline-block mt-1 text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full">
                  Score: {quiz.score}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  </div>
);
}
