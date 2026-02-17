import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/config";
import Sidebar from "../Sidebar/sidebar";
import ModeToggle from "../Shared/ModeToggle";
import "./ProductTracking.css";

const ReportsAnalytics = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("inventory");
  const [loading, setLoading] = useState(true);
  const [inventoryReport, setInventoryReport] = useState([]);
  const [movementReport, setMovementReport] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [dateRange, setDateRange] = useState(7);

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [inventoryRes, movementRes, dashboardRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/tracking/reports/inventory`),
        axios.get(
          `${API_BASE_URL}/api/tracking/reports/movements?days=${dateRange}`,
        ),
        axios.get(`${API_BASE_URL}/api/tracking/dashboard/summary`),
      ]);

      if (inventoryRes.data.success) setInventoryReport(inventoryRes.data.data);
      if (movementRes.data.success) setMovementReport(movementRes.data.data);
      if (dashboardRes.data.success) setDashboardData(dashboardRes.data.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const getReasonColor = (reason) => {
    const colors = {
      receiving: "#10b981",
      storage: "#3b82f6",
      picking: "#8b5cf6",
      packing: "#06b6d4",
      loading: "#6366f1",
      delivery: "#22c55e",
      return: "#f97316",
      quality_check: "#a855f7",
    };
    return colors[reason] || "#6b7280";
  };

  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((val) => (typeof val === "object" ? JSON.stringify(val) : val))
        .join(","),
    );
    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
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
              <p>Loading reports...</p>
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
              <strong>306.</strong> 📊 Reports & Analytics
            </h1>
            <div style={{ display: "flex", gap: "12px" }}>
              <select
                className="filter-select"
                value={dateRange}
                onChange={(e) => setDateRange(parseInt(e.target.value))}
              >
                <option value={7}>Last 7 Days</option>
                <option value={14}>Last 14 Days</option>
                <option value={30}>Last 30 Days</option>
                <option value={90}>Last 90 Days</option>
              </select>
              <button className="refresh-btn" onClick={fetchReports}>
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="tracking-stats-grid" style={{ marginBottom: "24px" }}>
            <div
              className="tracking-stat-card"
              style={{ borderLeftColor: "#7c3aed" }}
            >
              <div
                className="stat-icon"
                style={{ backgroundColor: "#f3e8ff", color: "#7c3aed" }}
              >
                📦
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{summary.total || 0}</h3>
                <p className="stat-title">Total Units</p>
              </div>
            </div>
            <div
              className="tracking-stat-card"
              style={{ borderLeftColor: "#10b981" }}
            >
              <div
                className="stat-icon"
                style={{ backgroundColor: "#d1fae5", color: "#10b981" }}
              >
                🏭
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{summary.in_storage || 0}</h3>
                <p className="stat-title">In Storage</p>
              </div>
            </div>
            <div
              className="tracking-stat-card"
              style={{ borderLeftColor: "#22c55e" }}
            >
              <div
                className="stat-icon"
                style={{ backgroundColor: "#dcfce7", color: "#22c55e" }}
              >
                ✅
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{summary.delivered || 0}</h3>
                <p className="stat-title">Delivered</p>
              </div>
            </div>
            <div
              className="tracking-stat-card"
              style={{ borderLeftColor: "#ef4444" }}
            >
              <div
                className="stat-icon"
                style={{ backgroundColor: "#fee2e2", color: "#ef4444" }}
              >
                ⚠️
              </div>
              <div className="stat-content">
                <h3 className="stat-value">
                  {(summary.damaged || 0) + (summary.lost || 0)}
                </h3>
                <p className="stat-title">Issues</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tracking-tabs">
            <button
              className={`tracking-tab ${activeTab === "inventory" ? "active" : ""}`}
              onClick={() => setActiveTab("inventory")}
            >
              📦 Inventory Report
            </button>
            <button
              className={`tracking-tab ${activeTab === "movements" ? "active" : ""}`}
              onClick={() => setActiveTab("movements")}
            >
              🔄 Movement Report
            </button>
            <button
              className={`tracking-tab ${activeTab === "status" ? "active" : ""}`}
              onClick={() => setActiveTab("status")}
            >
              📈 Status Overview
            </button>
          </div>

          {/* Inventory Report Tab */}
          {activeTab === "inventory" && (
            <div className="tracking-section">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h2 style={{ margin: 0 }}>Inventory by Product</h2>
                <button
                  className="btn-secondary"
                  onClick={() => exportCSV(inventoryReport, "inventory_report")}
                >
                  📥 Export CSV
                </button>
              </div>

              {inventoryReport.length > 0 ? (
                <div className="tracking-table-container">
                  <table className="tracking-table">
                    <thead>
                      <tr>
                        <th>Product ID</th>
                        <th>Product Name</th>
                        <th>Total</th>
                        <th>In Storage</th>
                        <th>Reserved</th>
                        <th>In Transit</th>
                        <th>Delivered</th>
                        <th>Damaged</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryReport.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{item._id}</strong>
                          </td>
                          <td>{item.productName}</td>
                          <td style={{ fontWeight: 600 }}>{item.totalUnits}</td>
                          <td style={{ color: "#10b981" }}>{item.inStorage}</td>
                          <td style={{ color: "#f59e0b" }}>{item.reserved}</td>
                          <td style={{ color: "#3b82f6" }}>{item.inTransit}</td>
                          <td style={{ color: "#22c55e" }}>{item.delivered}</td>
                          <td
                            style={{
                              color: item.damaged > 0 ? "#ef4444" : "#6b7280",
                            }}
                          >
                            {item.damaged}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: "#f9fafb", fontWeight: 600 }}>
                        <td colSpan={2}>TOTALS</td>
                        <td>
                          {inventoryReport.reduce(
                            (sum, i) => sum + i.totalUnits,
                            0,
                          )}
                        </td>
                        <td>
                          {inventoryReport.reduce(
                            (sum, i) => sum + i.inStorage,
                            0,
                          )}
                        </td>
                        <td>
                          {inventoryReport.reduce(
                            (sum, i) => sum + i.reserved,
                            0,
                          )}
                        </td>
                        <td>
                          {inventoryReport.reduce(
                            (sum, i) => sum + i.inTransit,
                            0,
                          )}
                        </td>
                        <td>
                          {inventoryReport.reduce(
                            (sum, i) => sum + i.delivered,
                            0,
                          )}
                        </td>
                        <td>
                          {inventoryReport.reduce(
                            (sum, i) => sum + i.damaged,
                            0,
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="tracking-empty-state">
                  <div className="empty-icon">📦</div>
                  <h3 className="empty-title">No Inventory Data</h3>
                  <p className="empty-text">
                    Start tracking products to see inventory reports.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Movements Report Tab */}
          {activeTab === "movements" && (
            <div className="tracking-section">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h2 style={{ margin: 0 }}>
                  Movement Activity (Last {dateRange} Days)
                </h2>
                <button
                  className="btn-secondary"
                  onClick={() =>
                    exportCSV(
                      movementReport.map((m) => ({
                        date: m._id?.date,
                        reason: m._id?.reason,
                        count: m.count,
                      })),
                      "movement_report",
                    )
                  }
                >
                  📥 Export CSV
                </button>
              </div>

              {movementReport.length > 0 ? (
                <>
                  {/* Movement Summary by Reason */}
                  <div
                    className="tracking-cards-grid"
                    style={{ marginBottom: "24px" }}
                  >
                    {Object.entries(
                      movementReport.reduce((acc, m) => {
                        const reason = m._id?.reason || "other";
                        acc[reason] = (acc[reason] || 0) + m.count;
                        return acc;
                      }, {}),
                    ).map(([reason, count]) => (
                      <div
                        key={reason}
                        className="tracking-stat-card"
                        style={{ borderLeftColor: getReasonColor(reason) }}
                      >
                        <div
                          className="stat-icon"
                          style={{
                            backgroundColor: `${getReasonColor(reason)}20`,
                            color: getReasonColor(reason),
                          }}
                        >
                          📦
                        </div>
                        <div className="stat-content">
                          <h3 className="stat-value">{count}</h3>
                          <p
                            className="stat-title"
                            style={{ textTransform: "capitalize" }}
                          >
                            {reason.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Daily Breakdown */}
                  <div className="tracking-table-container">
                    <table className="tracking-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Reason</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movementReport.map((item, index) => (
                          <tr key={index}>
                            <td>{item._id?.date}</td>
                            <td>
                              <span
                                className="status-badge"
                                style={{
                                  backgroundColor: `${getReasonColor(item._id?.reason)}20`,
                                  color: getReasonColor(item._id?.reason),
                                }}
                              >
                                {item._id?.reason?.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td style={{ fontWeight: 600 }}>{item.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="tracking-empty-state">
                  <div className="empty-icon">🔄</div>
                  <h3 className="empty-title">No Movement Data</h3>
                  <p className="empty-text">
                    Product movements will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Status Overview Tab */}
          {activeTab === "status" && (
            <div className="tracking-section">
              <h2>Status Distribution</h2>

              {Object.entries(summary).filter(([key]) => key !== "total")
                .length > 0 ? (
                <div
                  className="status-distribution"
                  style={{ maxWidth: "600px" }}
                >
                  {Object.entries(summary)
                    .filter(([key, value]) => key !== "total" && value > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([status, count]) => {
                      const percentage =
                        summary.total > 0
                          ? ((count / summary.total) * 100).toFixed(1)
                          : 0;
                      return (
                        <div key={status} className="status-bar-item">
                          <div className="status-label">
                            <span style={{ textTransform: "capitalize" }}>
                              {status.replace(/_/g, " ")}
                            </span>
                            <span>
                              <strong>{count}</strong> ({percentage}%)
                            </span>
                          </div>
                          <div
                            className="status-bar"
                            style={{ height: "12px" }}
                          >
                            <div
                              className="status-bar-fill"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: "#7c3aed",
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="tracking-empty-state">
                  <div className="empty-icon">📈</div>
                  <h3 className="empty-title">No Status Data</h3>
                  <p className="empty-text">
                    Start tracking products to see status distribution.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
