import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  MessageSquare,
  RefreshCw,
  Download,
  Search,
  Calendar,
} from "lucide-react";

const CustomerChatView = () => {
  const [customer, setCustomer] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch customer details and chat history
  const fetchCustomerAndChat = async () => {
    try {
      setLoading(true);

      // Fetch customer basic info
      const customerResponse = await fetch(
        `http://localhost:5000/api/customers/${id}`
      );
      if (!customerResponse.ok)
        throw new Error("Failed to fetch customer details");
      const customerData = await customerResponse.json();
      setCustomer(customerData);

      // Fetch chat history
      const chatResponse = await fetch(
        `http://localhost:5000/api/customers/${id}/chat`
      );
      if (!chatResponse.ok) throw new Error("Failed to fetch chat history");
      const chatData = await chatResponse.json();
      setChatHistory(chatData.chatHistory || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCustomerAndChat();
    }
  }, [id]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const exportChat = () => {
    const chatText = chatHistory
      .map(
        (chat) =>
          `[${formatDateTime(chat.timestamp)}] ${chat.sender.toUpperCase()}: ${
            chat.message
          }`
      )
      .join("\n");

    const blob = new Blob([chatText], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${customer?.name || "customer"}-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Filter chat history based on search and date
  const filteredChat = chatHistory.filter((chat) => {
    const matchesSearch =
      !searchTerm ||
      chat.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate =
      !dateFilter ||
      new Date(chat.timestamp).toISOString().split("T")[0] === dateFilter;

    return matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin h-8 w-8 text-purple-600" />
          <span className="ml-2 text-lg">Loading chat history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <h3 className="font-medium">Error Loading Chat</h3>
            <p>{error}</p>
            <button
              onClick={() => navigate(`/customers/${id}`)}
              className="mt-2 text-sm underline"
            >
              Back to Customer Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/customers/${id}`)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Chat History</h1>
              <p className="text-gray-600">
                {customer?.name || "Unknown Customer"} -{" "}
                {customer?.phoneNumber?.[0] || "No Phone"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchCustomerAndChat}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              title="Refresh chat"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            {chatHistory.length > 0 && (
              <button
                onClick={exportChat}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download size={16} className="mr-2" />
                Export Chat
              </button>
            )}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  4
                </div>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-600"></div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-400" />
            <input
              type="date"
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {(searchTerm || dateFilter) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setDateFilter("");
              }}
              className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          )}

          <div className="text-sm text-gray-500">
            Total Messages: {filteredChat.length}
          </div>
        </div>

        {/* Chat History */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-800 flex items-center">
              <MessageSquare size={20} className="mr-2" />
              Complete Conversation History
            </h2>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {filteredChat.length > 0 ? (
              <div className="space-y-1">
                {filteredChat.map((chat, idx) => (
                  <div
                    key={idx}
                    className={`p-4 border-b border-gray-50 hover:bg-gray-25 ${
                      chat.sender === "customer" ? "bg-blue-25" : "bg-gray-25"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                          chat.sender === "customer"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        {chat.sender === "customer" ? "C" : "A"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-sm font-medium ${
                              chat.sender === "customer"
                                ? "text-blue-700"
                                : "text-gray-700"
                            }`}
                          >
                            {chat.sender === "customer"
                              ? "Customer"
                              : "Admin/Bot"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(chat.timestamp)}
                          </span>
                        </div>

                        <div className="text-gray-800 text-sm leading-relaxed">
                          {chat.message}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare
                  size={48}
                  className="mx-auto text-gray-300 mb-4"
                />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  {chatHistory.length === 0
                    ? "No Conversation History"
                    : "No Messages Found"}
                </h3>
                <p className="text-gray-500">
                  {chatHistory.length === 0
                    ? "This customer hasn't had any conversations yet."
                    : "Try adjusting your search filters to find messages."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Summary */}
        {chatHistory.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">
                Customer Messages
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {
                  chatHistory.filter((chat) => chat.sender === "customer")
                    .length
                }
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">
                Admin/Bot Messages
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {chatHistory.filter((chat) => chat.sender === "bot").length}
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-800 mb-2">
                Total Messages
              </h3>
              <p className="text-2xl font-bold text-purple-600">
                {chatHistory.length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerChatView;
