import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/sidebar";
import {
  MessageSquare,
  Search,
  Copy,
  Check,
  RefreshCw,
  FileCode,
  ChevronRight,
  Filter,
  Hash,
  Folder,
  AlertCircle,
} from "lucide-react";
import { API_BASE_URL } from "../../utils/config";

function ChatbotMessagesViewer() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);
  const [stats, setStats] = useState(null);
  const [expandedMessage, setExpandedMessage] = useState(null);

  // Category icons and colors
  const categoryConfig = {
    welcome: { color: "bg-emerald-500", lightColor: "bg-emerald-50", textColor: "text-emerald-700", icon: "👋" },
    menu: { color: "bg-blue-500", lightColor: "bg-blue-50", textColor: "text-blue-700", icon: "📋" },
    referral: { color: "bg-purple-500", lightColor: "bg-purple-50", textColor: "text-purple-700", icon: "🎁" },
    support: { color: "bg-orange-500", lightColor: "bg-orange-50", textColor: "text-orange-700", icon: "📞" },
    profile: { color: "bg-indigo-500", lightColor: "bg-indigo-50", textColor: "text-indigo-700", icon: "👤" },
    cart: { color: "bg-yellow-500", lightColor: "bg-yellow-50", textColor: "text-yellow-700", icon: "🛒" },
    pickup: { color: "bg-teal-500", lightColor: "bg-teal-50", textColor: "text-teal-700", icon: "📦" },
    reminder: { color: "bg-pink-500", lightColor: "bg-pink-50", textColor: "text-pink-700", icon: "⏰" },
    order: { color: "bg-green-500", lightColor: "bg-green-50", textColor: "text-green-700", icon: "🎉" },
    delivery: { color: "bg-cyan-500", lightColor: "bg-cyan-50", textColor: "text-cyan-700", icon: "🚚" },
    error: { color: "bg-red-500", lightColor: "bg-red-50", textColor: "text-red-700", icon: "❌" },
    discount: { color: "bg-amber-500", lightColor: "bg-amber-50", textColor: "text-amber-700", icon: "💰" },
    shopping: { color: "bg-lime-500", lightColor: "bg-lime-50", textColor: "text-lime-700", icon: "🛍️" },
    checkout: { color: "bg-violet-500", lightColor: "bg-violet-50", textColor: "text-violet-700", icon: "💳" },
  };

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [selectedCategory, searchTerm]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`${API_BASE_URL}/api/chatbot-message-viewer?${params}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot-message-viewer/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getCategoryStyle = (category) => {
    return categoryConfig[category] || { 
      color: "bg-gray-500", 
      lightColor: "bg-gray-50", 
      textColor: "text-gray-700", 
      icon: "📝" 
    };
  };

  const formatContent = (content) => {
    // Preserve formatting but limit display length
    if (content.length > 200 && expandedMessage === null) {
      return content.substring(0, 200) + "...";
    }
    return content;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:ml-80" : ""}`}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <MessageSquare className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Chatbot Messages Viewer
                </h1>
                <p className="text-gray-500 text-sm">
                  View all chatbot messages with their code locations
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total Messages</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalMessages || 0}</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <MessageSquare className="text-indigo-500" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Categories</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalCategories || 0}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Folder className="text-purple-500" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Source File</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">chatbot-router.js</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <FileCode className="text-green-500" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Showing</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{messages.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Filter className="text-blue-500" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Category Tabs & Search */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search messages by name, content, or key..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                
                {/* Refresh Button */}
                <button
                  onClick={() => {
                    fetchMessages();
                    fetchStats();
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <RefreshCw size={18} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="p-4 bg-gray-50 overflow-x-auto">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === "all"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  All ({stats?.totalMessages || 0})
                </button>
                {categories.map((cat) => {
                  const style = getCategoryStyle(cat);
                  const count = stats?.categoryBreakdown?.[cat] || 0;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                        selectedCategory === cat
                          ? `${style.color} text-white shadow-md`
                          : `bg-white text-gray-600 hover:bg-gray-100 border border-gray-200`
                      }`}
                    >
                      <span>{style.icon}</span>
                      <span className="capitalize">{cat}</span>
                      <span className={`text-xs ${selectedCategory === cat ? "text-white/80" : "text-gray-400"}`}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <RefreshCw className="animate-spin mx-auto mb-4 text-indigo-400" size={40} />
                <p className="text-gray-500">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <AlertCircle className="mx-auto mb-4 text-gray-300" size={48} />
                <p className="text-gray-500">No messages found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your search or category filter</p>
              </div>
            ) : (
              messages.map((msg) => {
                const style = getCategoryStyle(msg.category);
                const isExpanded = expandedMessage === msg.key;
                
                return (
                  <div
                    key={msg.key}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${style.lightColor} ${style.textColor}`}>
                          {style.icon} {msg.category}
                        </span>
                        <h3 className="font-semibold text-gray-900">{msg.displayName}</h3>
                      </div>
                    </div>

                    {/* Code Location */}
                    <div className="px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 flex items-center gap-3">
                      <FileCode className="text-slate-400" size={16} />
                      <code className="text-sm text-emerald-400 font-mono">
                        {msg.filePath}
                      </code>
                      <ChevronRight className="text-slate-500" size={14} />
                      <span className="flex items-center gap-1.5 text-blue-400">
                        <Hash size={14} />
                        <span className="font-mono font-semibold">Line {msg.lineNumber}</span>
                      </span>
                    </div>

                    {/* Message Content */}
                    <div className="p-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 font-medium">Message Content</p>
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                          {isExpanded ? msg.content : formatContent(msg.content)}
                        </pre>
                        {msg.content.length > 200 && (
                          <button
                            onClick={() => setExpandedMessage(isExpanded ? null : msg.key)}
                            className="mt-2 text-indigo-500 text-sm font-medium hover:text-indigo-600"
                          >
                            {isExpanded ? "Show less" : "Show more"}
                          </button>
                        )}
                      </div>
                      
                      {/* Key Badge */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-gray-400">Key:</span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">
                          {msg.key}
                        </code>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Note */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-500 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-medium text-blue-800">How to edit messages</p>
                <p className="text-sm text-blue-600 mt-1">
                  To modify a message, open the file <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-700">backend/routes/chatbot-router.js</code> and navigate to the specified line number. After making changes, restart the backend server.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatbotMessagesViewer;
