import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/config";
import Sidebar from "../Sidebar/sidebar";
import ModeToggle from "../Shared/ModeToggle";
import "./ProductTracking.css";

const TrackingDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/tracking/dashboard/summary`,
      );
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="tracking-stat-card" style={{ borderLeftColor: color }}>
      <div
        className="stat-icon"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{value || 0}</h3>
        <p className="stat-title">{title}</p>
        {subtitle && <span className="stat-subtitle">{subtitle}</span>}
      </div>
    </div>
  );

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    const colors = {
      received: "#3b82f6",
      in_storage: "#10b981",
      reserved: "#f59e0b",
      allocated: "#8b5cf6",
      packed: "#06b6d4",
      loaded: "#6366f1",
      in_transit: "#ec4899",
      delivered: "#22c55e",
      returned: "#f97316",
      damaged: "#ef4444",
      lost: "#dc2626",
      disposed: "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div
          className={`transition-all duration-300 ${isSidebarOpen ? "lg:ml-80" : ""} w-full`}
        >
          <div className="tracking-container">
            <div className="tracking-loading">
              <div className="loading-spinner"></div>
              <p>Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div
          className={`transition-all duration-300 ${isSidebarOpen ? "lg:ml-80" : ""} w-full`}
        >
          <div className="tracking-container">
            <div className="tracking-error">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <button onClick={fetchDashboardData} className="retry-btn">
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const summary = dashboardData?.summary || {};

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div
        className={`transition-all duration-300 ${isSidebarOpen ? "lg:ml-80" : ""} w-full`}
      >
        <div className="tracking-container">
          <div className="tracking-header">
            <h1>
              <strong>301.</strong> 📦 Product Tracking Dashboard
            </h1>
            <button onClick={fetchDashboardData} className="refresh-btn">
              🔄 Refresh
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="tracking-stats-grid">
            <StatCard
              title="Total Units Tracked"
              value={summary.total}
              icon="📦"
              color="#7c3aed"
            />
            <StatCard
              title="In Warehouse"
              value={summary.in_storage}
              icon="🏭"
              color="#10b981"
            />
            <StatCard
              title="In Transit"
              value={summary.in_transit}
              icon="🚚"
              color="#3b82f6"
            />
            <StatCard
              title="Delivered Today"
              value={dashboardData?.deliveredToday}
              icon="✅"
              color="#22c55e"
            />
            <StatCard
              title="Expiring Soon"
              value={dashboardData?.expiringSoon}
              icon="⚠️"
              color="#f59e0b"
              subtitle="Next 30 days"
            />
            <StatCard
              title="Damaged Units"
              value={summary.damaged}
              icon="🔴"
              color="#ef4444"
            />
          </div>

          {/* Quick Actions */}
          <div className="tracking-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions-grid">
              <a href="/tracking/scan" className="quick-action-btn">
                <span className="action-icon">🔍</span>
                <span>Track Product</span>
              </a>
              <a href="/tracking/batches" className="quick-action-btn">
                <span className="action-icon">📦</span>
                <span>Receive Shipment</span>
              </a>
              <a href="/tracking/reports" className="quick-action-btn">
                <span className="action-icon">📊</span>
                <span>View Reports</span>
              </a>
              <a href="/tracking/quality" className="quick-action-btn">
                <span className="action-icon">✅</span>
                <span>Quality Control</span>
              </a>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="tracking-section">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {dashboardData?.recentActivity?.length > 0 ? (
                dashboardData.recentActivity.map((item, index) => (
                  <div key={index} className="activity-item">
                    <div
                      className="activity-status"
                      style={{
                        backgroundColor: getStatusColor(item.currentStatus),
                      }}
                    ></div>
                    <div className="activity-content">
                      <p className="activity-text">
                        <strong>{item.uti}</strong> - {item.productName}
                      </p>
                      <p className="activity-meta">
                        Status: {item.currentStatus?.replace(/_/g, " ")} •
                        Location:{" "}
                        {item.currentLocation?.warehouseZone || "Unknown"}
                      </p>
                    </div>
                    <span className="activity-time">
                      {formatTimeAgo(item.updatedAt)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="no-activity">
                  <p>No recent activity. Start by receiving a shipment!</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="tracking-section">
            <h2>Status Distribution</h2>
            <div className="status-distribution">
              {Object.entries(summary)
                .filter(([key, value]) => key !== "total" && value > 0)
                .map(([status, count]) => {
                  const percentage =
                    summary.total > 0
                      ? ((count / summary.total) * 100).toFixed(1)
                      : 0;
                  return (
                    <div key={status} className="status-bar-item">
                      <div className="status-label">
                        <span>{status.replace(/_/g, " ")}</span>
                        <span>
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="status-bar">
                        <div
                          className="status-bar-fill"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getStatusColor(status),
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingDashboard;
