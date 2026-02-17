import React, { useState } from "react";
import { X } from "lucide-react";

/**
 * ModeToggle Component
 * Provides Advanced and AI mode switching with full-screen modal
 */
const ModeToggle = ({ componentName, onClose }) => {
  const [activeMode, setActiveMode] = useState("normal");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {componentName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Enhanced functionality with Advanced and AI features
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6">
          <button
            onClick={() => setActiveMode("normal")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeMode === "normal"
                ? "border-b-4 border-gray-800 text-gray-800"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📊 Normal Mode
          </button>
          <button
            onClick={() => setActiveMode("advanced")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeMode === "advanced"
                ? "border-b-4 border-purple-600 text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            🚀 Advanced Mode
          </button>
          <button
            onClick={() => setActiveMode("ai")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeMode === "ai"
                ? "border-b-4 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            🤖 AI Mode
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeMode === "normal" && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  📊 Normal Mode (Current View)
                </h3>
                <p className="text-gray-600 mb-4">
                  This is your standard view with all the regular features
                  you're familiar with. Switch to Advanced or AI mode for
                  enhanced capabilities.
                </p>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 italic">
                    Close this modal to return to the normal interface.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeMode === "advanced" && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 border-2 border-purple-200">
                <h3 className="text-2xl font-bold text-purple-900 mb-4">
                  🚀 Advanced Mode Features
                </h3>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-6 border-l-4 border-purple-600 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                      <span className="text-2xl mr-3">📈</span>
                      Advanced Analytics & Reporting
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Deep insights with customizable charts, export
                      capabilities (PDF, Excel, CSV), and advanced filtering
                      options with 10+ criteria.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 border-l-4 border-indigo-600 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                      <span className="text-2xl mr-3">⚡</span>
                      Bulk Operations
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Multi-select and batch edit capabilities, mass updates,
                      and CSV import/export for efficient data management.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 border-l-4 border-purple-400 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                      <span className="text-2xl mr-3">🔧</span>
                      Customization & Automation
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Create custom workflows, set up automated rules, and
                      configure advanced settings tailored to your business
                      needs.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 border-l-4 border-indigo-400 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                      <span className="text-2xl mr-3">📊</span>
                      Real-time Monitoring
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Live updates, performance metrics, and system health
                      monitoring with customizable dashboards and alerts.
                    </p>
                  </div>
                </div>

                <div className="mt-6 bg-purple-100 border border-purple-300 rounded-lg p-4">
                  <p className="text-sm text-purple-900 font-medium">
                    💡 <strong>Pro Tip:</strong> Advanced mode features are
                    being rolled out progressively. Full functionality will be
                    available in upcoming updates!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeMode === "ai" && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 border-2 border-blue-200">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">
                  🤖 AI-Powered Features
                </h3>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-6 border-l-4 border-blue-600 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                      <span className="text-2xl mr-3">💬</span>
                      Natural Language Commands
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Interact with your data using plain English. Ask questions
                      and get instant answers.
                    </p>
                    <div className="bg-blue-50 rounded p-3 text-sm text-blue-800 font-mono">
                      "Show me all orders above 100,000 from last week"
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border-l-4 border-cyan-600 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                      <span className="text-2xl mr-3">🔮</span>
                      Predictive Analytics
                    </h4>
                    <p className="text-gray-600 text-sm">
                      AI predicts trends, forecasts demand, identifies risks,
                      and provides actionable recommendations based on
                      historical data patterns.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 border-l-4 border-blue-400 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                      <span className="text-2xl mr-3">🎯</span>
                      Smart Automation
                    </h4>
                    <p className="text-gray-600 text-sm">
                      AI automatically handles routine tasks, sends intelligent
                      notifications, and optimizes workflows without manual
                      intervention.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 border-l-4 border-cyan-400 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                      <span className="text-2xl mr-3">🧠</span>
                      Intelligent Insights
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Discover hidden patterns, detect anomalies, and receive
                      personalized recommendations to improve business
                      operations.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 border-l-4 border-blue-300 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                      <span className="text-2xl mr-3">🎤</span>
                      Voice Commands (Coming Soon)
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Control the system with voice commands for hands-free
                      operation. Perfect for busy work environments.
                    </p>
                  </div>
                </div>

                <div className="mt-6 bg-blue-100 border border-blue-300 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium">
                    🚀 <strong>Coming Soon:</strong> AI features are powered by
                    advanced machine learning. Full AI capabilities will be
                    activated in the next release!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Current Mode:</span>{" "}
              <span
                className={`font-bold ${
                  activeMode === "normal"
                    ? "text-gray-800"
                    : activeMode === "advanced"
                      ? "text-purple-600"
                      : "text-blue-600"
                }`}
              >
                {activeMode === "normal"
                  ? "📊 Normal"
                  : activeMode === "advanced"
                    ? "🚀 Advanced"
                    : "🤖 AI"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
            >
              Close & Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeToggle;
