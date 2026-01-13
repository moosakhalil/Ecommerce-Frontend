import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/sidebar";
import {
  Phone,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Globe,
  Activity,
  MessageSquare,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { API_BASE_URL } from "../../utils/config";

function ChatbotControl() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMonitor, setNewMonitor] = useState({
    countryCode: "+92",
    phoneNumber: "",
    label: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const COUNTRY_OPTIONS = [
    { code: "+92", name: "Pakistan", flag: "🇵🇰" },
    { code: "+62", name: "Indonesia", flag: "🇮🇩" },
    { code: "+46", name: "Sweden", flag: "🇸🇪" },
  ];

  useEffect(() => {
    fetchMonitors();
    fetchStats();
  }, []);

  const fetchMonitors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/chatbot-monitor`);
      const data = await response.json();
      if (data.success) {
        setMonitors(data.monitors);
      }
    } catch (err) {
      setError("Failed to fetch monitors");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot-monitor/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleAddMonitor = async (e) => {
    e.preventDefault();
    setError("");

    if (!newMonitor.phoneNumber) {
      setError("Phone number is required");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot-monitor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMonitor),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Monitor added successfully!");
        setShowAddModal(false);
        setNewMonitor({ countryCode: "+92", phoneNumber: "", label: "" });
        fetchMonitors();
        fetchStats();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to add monitor");
      }
    } catch (err) {
      setError("Failed to add monitor");
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot-monitor/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();
      if (data.success) {
        fetchMonitors();
        fetchStats();
      }
    } catch (err) {
      setError("Failed to toggle monitor");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this monitor?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot-monitor/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setSuccess("Monitor deleted successfully");
        fetchMonitors();
        fetchStats();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError("Failed to delete monitor");
    }
  };

  const handleToggleAll = async (enable) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot-monitor/toggle-all`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: enable }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(enable ? "All monitors enabled" : "All monitors disabled");
        fetchMonitors();
        fetchStats();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError("Failed to toggle monitors");
    }
  };

  const getCountryInfo = (code) => {
    return COUNTRY_OPTIONS.find((c) => c.code === code) || { flag: "🌍", name: "Unknown" };
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:ml-80" : ""}`}>
        <div className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="text-blue-600" size={32} />
              Control Chatbot
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor all chatbot messages by receiving copies on selected phone numbers
            </p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <Check size={20} />
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={20} />
              {error}
              <button onClick={() => setError("")} className="ml-auto">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Monitors</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalMonitors || 0}</p>
                </div>
                <Phone className="text-blue-500" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Monitors</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.activeMonitors || 0}</p>
                </div>
                <Activity className="text-green-500" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Messages Copied</p>
                  <p className="text-2xl font-bold text-purple-600">{stats?.totalMessagesSent || 0}</p>
                </div>
                <MessageSquare className="text-purple-500" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Monitoring Status</p>
                  <p className={`text-lg font-bold ${stats?.isMonitoringActive ? "text-green-600" : "text-gray-400"}`}>
                    {stats?.isMonitoringActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <Globe className={stats?.isMonitoringActive ? "text-green-500" : "text-gray-400"} size={32} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Monitor Number
            </button>
            <button
              onClick={() => handleToggleAll(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ToggleRight size={20} />
              Enable All
            </button>
            <button
              onClick={() => handleToggleAll(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ToggleLeft size={20} />
              Disable All
            </button>
            <button
              onClick={() => {
                fetchMonitors();
                fetchStats();
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={20} />
              Refresh
            </button>
          </div>

          {/* Monitors Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Monitor Numbers</h2>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <RefreshCw className="animate-spin mx-auto mb-4 text-gray-400" size={32} />
                <p className="text-gray-500">Loading monitors...</p>
              </div>
            ) : monitors.length === 0 ? (
              <div className="p-12 text-center">
                <Phone className="mx-auto mb-4 text-gray-300" size={48} />
                <p className="text-gray-500">No monitor numbers added yet</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Add your first monitor number
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Messages</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {monitors.map((monitor) => {
                    const countryInfo = getCountryInfo(monitor.countryCode);
                    return (
                      <tr key={monitor._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="text-2xl mr-2">{countryInfo.flag}</span>
                          <span className="text-sm text-gray-600">{countryInfo.name}</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-900">
                          {monitor.countryCode} {monitor.phoneNumber.slice(monitor.countryCode.replace("+", "").length)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{monitor.label || "-"}</td>
                        <td className="px-6 py-4 text-gray-900">{monitor.messageCount || 0}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {monitor.lastMessageAt
                            ? new Date(monitor.lastMessageAt).toLocaleString()
                            : "Never"}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggle(monitor._id, monitor.isActive)}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              monitor.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {monitor.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete(monitor._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add Monitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add Monitor Number</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddMonitor}>
              {/* Country Code */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  value={newMonitor.countryCode}
                  onChange={(e) => setNewMonitor({ ...newMonitor, countryCode: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {COUNTRY_OPTIONS.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name} ({country.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Number */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">
                    {newMonitor.countryCode}
                  </span>
                  <input
                    type="tel"
                    value={newMonitor.phoneNumber}
                    onChange={(e) =>
                      setNewMonitor({ ...newMonitor, phoneNumber: e.target.value.replace(/\D/g, "") })
                    }
                    placeholder="3001234567"
                    className="flex-1 border border-gray-300 rounded-r-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter number without country code</p>
              </div>

              {/* Label */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Label (Optional)
                </label>
                <input
                  type="text"
                  value={newMonitor.label}
                  onChange={(e) => setNewMonitor({ ...newMonitor, label: e.target.value })}
                  placeholder="e.g., Testing Phone 1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Monitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatbotControl;
