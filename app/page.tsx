"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Loader2,
  Send,
  Download,
  Clock,
  ChevronLeft,
  ChevronRight,
  Copy,
  RotateCcw,
  Sparkles,
  Lightbulb,
  Search,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
} from "lucide-react";
import jsPDF from "jspdf";

interface HistoryItem {
  id: string;
  topic: string;
  output: string;
  timestamp: number;
  grade?: string;
  subject?: string;
  contentType?: string;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

const CBC_GRADES = [
  { display: "PP1", value: "pp1" },
  { display: "PP2", value: "pp2" },
  { display: "Grade 1", value: "grade1" },
  { display: "Grade 2", value: "grade2" },
  { display: "Grade 3", value: "grade3" },
  { display: "Grade 4", value: "grade4" },
  { display: "Grade 5", value: "grade5" },
  { display: "Grade 6", value: "grade6" },
  { display: "Grade 7", value: "grade7" },
  { display: "Grade 8", value: "grade8" },
  { display: "Grade 9", value: "grade9" },
  { display: "Grade 10", value: "grade10" },
  { display: "Grade 11", value: "grade11" },
  { display: "Grade 12", value: "grade12" },
];

const CBC_SUBJECTS: Record<string, string[]> = {
  pp1: ["Literacy", "Numeracy", "Environmental Activities"],
  pp2: ["Literacy", "Numeracy", "Environmental Activities"],
  grade1: [
    "English",
    "Mathematics",
    "Environmental Activities",
    "Creative Activities",
  ],
  grade2: [
    "English",
    "Mathematics",
    "Environmental Activities",
    "Creative Activities",
  ],
  grade3: ["English", "Mathematics", "Science", "Social Studies"],
  grade4: [
    "English",
    "Mathematics",
    "Science",
    "Social Studies",
    "Creative Activities",
  ],
  grade5: [
    "English",
    "Mathematics",
    "Science",
    "Social Studies",
    "Christian Religious Education",
    "Islamic Religious Education",
  ],
  grade6: [
    "English",
    "Mathematics",
    "Science",
    "Social Studies",
    "Christian Religious Education",
    "Islamic Religious Education",
  ],
  grade7: [
    "English",
    "Mathematics",
    "Science",
    "Social Studies",
    "Christian Religious Education",
    "Islamic Religious Education",
    "Physical Education",
  ],
  grade8: [
    "English",
    "Mathematics",
    "Science",
    "Social Studies",
    "Christian Religious Education",
    "Islamic Religious Education",
    "Physical Education",
  ],
  grade9: [
    "English",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Social Studies",
    "Geography",
    "History",
  ],
  grade10: [
    "English",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Social Studies",
  ],
  grade11: [
    "English",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
  ],
  grade12: [
    "English",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
  ],
};

const CONTENT_TYPES = [
  { value: "lesson-summary", label: "Lesson Summary", icon: "📚" },
  { value: "quiz", label: "Multiple-choice Quiz", icon: "❓" },
  { value: "activity", label: "Real-life Activity", icon: "🎯" },
];

const USER_ROLES = [
  { value: "student", label: "Student", icon: "👨‍🎓" },
  { value: "teacher", label: "Teacher", icon: "👨‍🏫" },
];

export default function Home() {
  const [topic, setTopic] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedGrade, setSelectedGrade] = useState("grade6");
  const [selectedSubject, setSelectedSubject] = useState("Science");
  const [selectedContentType, setSelectedContentType] =
    useState("lesson-summary");
  const [userRole, setUserRole] = useState("student");
  const [language, setLanguage] = useState("english");

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    setMounted(true);
    const savedHistory = localStorage.getItem("studyHistory");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted && history.length > 0) {
      localStorage.setItem("studyHistory", JSON.stringify(history));
    }
  }, [history, mounted]);

  const suggestedTopics = [
    "Photosynthesis",
    "Water Cycle",
    "Human Digestive System",
    "Ecosystems and Biodiversity",
    "Weather and Climate",
    "Soil Formation",
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showToast("Please enter a topic to learn about", "error");
      return;
    }
    setLoading(true);
    setOutput("");
    setRelatedTopics([]);

    try {
      const res = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          grade: selectedGrade,
          subject: selectedSubject,
          contentType: selectedContentType,
          userRole,
          language: language === "english" ? "English" : "Kiswahili",
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setOutput(data.data.content);
        const relatedTopicsArray = [
          `${topic} - Advanced Concepts`,
          `${topic} - Real-world Applications`,
          `${topic} - Historical Context`,
        ];
        setRelatedTopics(relatedTopicsArray);

        const newItem: HistoryItem = {
          id: Date.now().toString(),
          topic,
          output: data.data.content,
          timestamp: Date.now(),
          grade: selectedGrade,
          subject: selectedSubject,
          contentType: selectedContentType,
        };
        setHistory([newItem, ...history.slice(0, 49)]);
        showToast(`Generated ${selectedContentType} for ${topic}`, "success");
      } else {
        setOutput("Error: " + (data.error || "No response"));
        showToast(data.error || "Failed to generate content", "error");
      }
    } catch (err) {
      setOutput("Network error. Check if backend is running.");
      showToast("Network error - make sure backend is running", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      showToast("Copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const handleSuggestedTopic = (t: string) => {
    setTopic(t);
  };

  const handleDownloadPdf = () => {
    if (!output) {
      showToast("No content to download yet", "error");
      return;
    }

    setDownloadingPdf(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const textWidth = pageWidth - 2 * margin;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("CBC Smart Study Assistant", margin, 20);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 102, 204);
      doc.text(`Topic: ${topic}`, margin, 30);
      doc.text(
        `Grade: ${selectedGrade} | Subject: ${selectedSubject}`,
        margin,
        38
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      const splitText = doc.splitTextToSize(output, textWidth);
      let yPosition = 48;

      splitText.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 5;
      });

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated on ${new Date().toLocaleDateString("en-KE")}`,
        margin,
        pageHeight - 10
      );

      doc.save(`${topic.replace(/\s+/g, "_")}_${selectedGrade}.pdf`);
      showToast("PDF downloaded successfully!", "success");
    } catch (error) {
      console.error("PDF generation error:", error);
      showToast("Failed to generate PDF", "error");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleLoadHistory = (item: HistoryItem) => {
    setTopic(item.topic);
    setOutput(item.output);
    if (item.grade) setSelectedGrade(item.grade);
    if (item.subject) setSelectedSubject(item.subject);
    if (item.contentType) setSelectedContentType(item.contentType);
    setShowHistory(false);
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(history.filter((item) => item.id !== id));
    showToast("Item deleted from history", "info");
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem("studyHistory");
    showToast("All history cleared", "info");
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const filteredHistory = history.filter((item) =>
    item.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableSubjects = CBC_SUBJECTS[selectedGrade] || [];

  if (!mounted) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-72 md:flex md:flex-col md:bg-white md:border-r md:border-gray-200 md:z-40 md:overflow-y-auto">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-2 sticky top-0 bg-white">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-sm text-gray-900">Study History</h3>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* History Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">
                {history.length === 0 ? "No history yet" : "No results found"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Your lessons will appear here
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <button
                key={item.id}
                onClick={() => handleLoadHistory(item)}
                className="w-full text-left p-3 rounded-lg hover:bg-blue-50 group transition-all duration-200 hover:shadow-sm"
              >
                <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600 transition">
                  {item.topic}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    {formatDate(item.timestamp)}
                  </p>
                  {item.grade && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {item.grade}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Clear History */}
        {history.length > 0 && (
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={handleClearAllHistory}
              className="w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3 h-3" />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Mobile Sidebar Drawer */}
      {showHistory && (
        <>
          <div
            className="fixed inset-0 bg-black/30 md:hidden z-30 transition-opacity"
            onClick={() => setShowHistory(false)}
          />
          <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-40 md:hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-sm text-gray-900">History</h3>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {filteredHistory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleLoadHistory(item)}
                  className="w-full text-left p-3 rounded-lg hover:bg-blue-50 group transition-all duration-200"
                >
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.topic}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(item.timestamp)}
                  </p>
                </button>
              ))}
            </div>

            {history.length > 0 && (
              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={handleClearAllHistory}
                  className="w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-72">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50 backdrop-blur-sm bg-white/95">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
              <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  CBC Smart Study
                </h1>
                <p className="text-xs text-gray-500">
                  AI-powered learning for Kenyan curriculum
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="max-w-5xl w-full mx-auto px-4 py-6 flex flex-col flex-1 overflow-y-auto">
            {output ? (
              <div className="space-y-6">
                {/* User Message */}
                <div className="flex justify-end animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-blue-600 rounded-3xl rounded-tr-sm px-5 py-3 max-w-2xl shadow-md">
                    <p className="text-sm text-white font-medium">{topic}</p>
                    <p className="text-xs text-blue-100 mt-1">
                      {selectedGrade} • {selectedSubject}
                    </p>
                  </div>
                </div>

                {/* Assistant Message */}
                <div className="flex justify-start">
                  <div className="bg-white rounded-3xl rounded-tl-sm px-6 py-4 max-w-3xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {output}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  {/* Content Type Options */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Generate different content:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {CONTENT_TYPES.map((ct) => (
                        <button
                          key={ct.value}
                          onClick={() => {
                            setSelectedContentType(ct.value);
                            setTimeout(() => handleGenerate(), 100);
                          }}
                          disabled={loading}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 flex items-center gap-1 ${
                            selectedContentType === ct.value
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {ct.icon} {ct.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleCopyToClipboard}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 text-sm font-medium"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleGenerate()}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4" />
                          Regenerate
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleDownloadPdf}
                      disabled={downloadingPdf}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium shadow-md hover:shadow-lg"
                    >
                      {downloadingPdf ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Download PDF
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setOutput("");
                        setTopic("");
                        setRelatedTopics([]);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 text-sm font-medium"
                    >
                      New Topic
                    </button>
                  </div>

                  {relatedTopics.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        Explore related topics:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {relatedTopics.map((relatedTopic) => (
                          <button
                            key={relatedTopic}
                            onClick={() => {
                              setTopic(relatedTopic);
                              setTimeout(() => handleGenerate(), 100);
                            }}
                            className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-700 hover:border-blue-400 rounded-lg transition-all duration-200 font-medium hover:shadow-sm"
                          >
                            {relatedTopic}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="mb-8 animate-in fade-in duration-500">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <BookOpen className="w-12 h-12 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Start Learning
                  </h2>
                  <p className="text-gray-600 max-w-md text-sm">
                    Select your grade and subject, then enter a topic to get
                    instant lessons, quizzes, and activities
                  </p>
                </div>

                <div className="w-full">
                  <p className="text-sm font-semibold text-gray-600 mb-3">
                    Popular CBC topics:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                    {suggestedTopics.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTopic(t);
                          setTimeout(() => handleGenerate(), 100);
                        }}
                        className="px-4 py-3 bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg text-sm text-gray-700 hover:text-blue-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Section */}
        <div className="border-t border-gray-200 bg-white sticky bottom-0 backdrop-blur-sm bg-white/95">
          <div className="max-w-5xl w-full mx-auto px-4 py-4">
            {/* CBC Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {/* Grade Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">
                  Grade Level
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => {
                    setSelectedGrade(e.target.value);
                    setSelectedSubject(CBC_SUBJECTS[e.target.value]?.[0] || "");
                  }}
                  className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {CBC_GRADES.map((grade) => (
                    <option key={grade.value} value={grade.value}>
                      {grade.display}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {availableSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content Type Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">
                  Content Type
                </label>
                <select
                  value={selectedContentType}
                  onChange={(e) => setSelectedContentType(e.target.value)}
                  className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {CONTENT_TYPES.map((ct) => (
                    <option key={ct.value} value={ct.value}>
                      {ct.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="english">English</option>
                  <option value="swahili">Kiswahili</option>
                </select>
              </div>
            </div>

            {/* Input Bar */}
            <div className="flex gap-3">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !loading && handleGenerate()
                }
                placeholder="Enter topic (e.g., 'Photosynthesis', 'Water Cycle')..."
                disabled={loading}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:bg-gray-100"
              />
              <button
                onClick={() => handleGenerate()}
                disabled={loading || !topic.trim()}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  Generating {selectedContentType}...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-right-2 duration-300 pointer-events-auto ${
              toast.type === "success"
                ? "bg-green-500/90 text-white"
                : toast.type === "error"
                ? "bg-red-500/90 text-white"
                : "bg-blue-500/90 text-white"
            }`}
          >
            {toast.type === "success" && (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            )}
            {toast.type === "error" && (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            {toast.type === "info" && (
              <Sparkles className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 p-0.5 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
