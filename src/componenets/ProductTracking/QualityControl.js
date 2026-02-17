import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/config";
import Sidebar from "../Sidebar/sidebar";
import ModeToggle from "../Shared/ModeToggle";
import "./ProductTracking.css";

const QualityControl = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [pendingData, setPendingData] = useState({
    inProgress: [],
    needsCheck: [],
    totalPending: 0,
  });
  const [history, setHistory] = useState([]);
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Quality check form
  const [checkForm, setCheckForm] = useState({
    status: "passed",
    condition: "new",
    issues: [],
    notes: "",
    checkedBy: "Quality Inspector",
  });

  const issueOptions = [
    "packaging_damaged",
    "product_broken",
    "wrong_quantity",
    "wrong_product",
    "near_expiry",
    "quality_below_standard",
    "contamination",
    "other",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/tracking/quality/pending`),
        axios.get(`${API_BASE_URL}/api/tracking/quality/history?days=7`),
      ]);

      if (pendingRes.data.success) setPendingData(pendingRes.data.data);
      if (historyRes.data.success) setHistory(historyRes.data.data);
    } catch (err) {
      console.error("Error fetching quality data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCheck = (item) => {
    setSelectedItem(item);
    setCheckForm({
      status: "passed",
      condition: "new",
      issues: [],
      notes: "",
      checkedBy: "Quality Inspector",
    });
    setShowCheckModal(true);
  };

  const handleIssueToggle = (issue) => {
    setCheckForm((prev) => ({
      ...prev,
      issues: prev.issues.includes(issue)
        ? prev.issues.filter((i) => i !== issue)
        : [...prev.issues, issue],
    }));
  };

  const handleSubmitCheck = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/tracking/${selectedItem._id}/quality-check`,
        checkForm,
      );

      if (response.data.success) {
        alert("Quality check recorded successfully!");
        setShowCheckModal(false);
        setSelectedItem(null);
        fetchData();
      }
    } catch (err) {
      console.error("Error submitting quality check:", err);
      alert(
        "Failed to submit quality check: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      passed: "#10b981",
      failed: "#ef4444",
      conditional: "#f59e0b",
    };
    return colors[status] || "#6b7280";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
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
              <p>Loading quality control data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <strong>305.</strong> ✅ Quality Control
            </h1>
            <button className="refresh-btn" onClick={fetchData}>
              🔄 Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="tracking-stats-grid" style={{ marginBottom: "24px" }}>
            <div
              className="tracking-stat-card"
              style={{ borderLeftColor: "#f59e0b" }}
            >
              <div
                className="stat-icon"
                style={{ backgroundColor: "#fef3c7", color: "#f59e0b" }}
              >
                ⏳
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{pendingData.totalPending}</h3>
                <p className="stat-title">Pending Checks</p>
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
                ✅
              </div>
              <div className="stat-content">
                <h3 className="stat-value">
                  {
                    history.filter((h) =>
                      h.qualityChecks?.some((q) => q.status === "passed"),
                    ).length
                  }
                </h3>
                <p className="stat-title">Passed (7 days)</p>
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
                ❌
              </div>
              <div className="stat-content">
                <h3 className="stat-value">
                  {
                    history.filter((h) =>
                      h.qualityChecks?.some((q) => q.status === "failed"),
                    ).length
                  }
                </h3>
                <p className="stat-title">Failed (7 days)</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tracking-tabs">
            <button
              className={`tracking-tab ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              ⏳ Pending ({pendingData.totalPending})
            </button>
            <button
              className={`tracking-tab ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              📋 History
            </button>
          </div>

          {/* Pending Tab */}
          {activeTab === "pending" && (
            <div className="tracking-section">
              {pendingData.needsCheck?.length > 0 ||
              pendingData.inProgress?.length > 0 ? (
                <>
                  {pendingData.inProgress?.length > 0 && (
                    <>
                      <h3 style={{ marginBottom: "16px" }}>In Progress</h3>
                      <div
                        className="activity-list"
                        style={{ marginBottom: "24px" }}
                      >
                        {pendingData.inProgress.map((item, index) => (
                          <div key={index} className="activity-item">
                            <div
                              className="activity-status"
                              style={{ backgroundColor: "#f59e0b" }}
                            ></div>
                            <div className="activity-content">
                              <p className="activity-text">
                                <strong>{item.uti}</strong> - {item.productName}
                              </p>
                              <p className="activity-meta">
                                Batch: {item.batchId} • Location:{" "}
                                {item.currentLocation?.warehouseZone ||
                                  "Unknown"}
                              </p>
                            </div>
                            <button
                              className="btn-primary"
                              onClick={() => handleStartCheck(item)}
                            >
                              Continue Check
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <h3 style={{ marginBottom: "16px" }}>Needs Quality Check</h3>
                  <div className="activity-list">
                    {pendingData.needsCheck?.map((item, index) => (
                      <div key={index} className="activity-item">
                        <div
                          className="activity-status"
                          style={{ backgroundColor: "#3b82f6" }}
                        ></div>
                        <div className="activity-content">
                          <p className="activity-text">
                            <strong>{item.uti}</strong> - {item.productName}
                          </p>
                          <p className="activity-meta">
                            Batch: {item.batchId} • Received:{" "}
                            {formatDate(item.receivedDate)}
                          </p>
                        </div>
                        <button
                          className="btn-primary"
                          onClick={() => handleStartCheck(item)}
                        >
                          Start Check
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="tracking-empty-state">
                  <div className="empty-icon">✅</div>
                  <h3 className="empty-title">All Caught Up!</h3>
                  <p className="empty-text">
                    No items pending quality inspection. Great job!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="tracking-section">
              <h2>Quality Check History (Last 7 Days)</h2>

              {history.length > 0 ? (
                <div className="tracking-table-container">
                  <table className="tracking-table">
                    <thead>
                      <tr>
                        <th>UTI</th>
                        <th>Product</th>
                        <th>Check Date</th>
                        <th>Result</th>
                        <th>Condition</th>
                        <th>Inspector</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item, index) => {
                        const latestCheck =
                          item.qualityChecks?.[item.qualityChecks.length - 1];
                        return (
                          <tr key={index}>
                            <td>
                              <strong>{item.uti}</strong>
                            </td>
                            <td>{item.productName}</td>
                            <td>{formatDate(latestCheck?.checkDate)}</td>
                            <td>
                              <span
                                className="status-badge"
                                style={{
                                  backgroundColor: `${getStatusColor(latestCheck?.status)}20`,
                                  color: getStatusColor(latestCheck?.status),
                                }}
                              >
                                {latestCheck?.status?.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ textTransform: "capitalize" }}>
                              {latestCheck?.condition}
                            </td>
                            <td>{latestCheck?.checkedBy}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="tracking-empty-state">
                  <div className="empty-icon">📋</div>
                  <h3 className="empty-title">No History</h3>
                  <p className="empty-text">
                    Quality check history will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quality Check Modal */}
          {showCheckModal && selectedItem && (
            <div
              className="tracking-modal-overlay"
              onClick={() => setShowCheckModal(false)}
            >
              <div
                className="tracking-modal"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "600px" }}
              >
                <div className="tracking-modal-header">
                  <h2>✅ Quality Inspection</h2>
                  <button
                    className="modal-close-btn"
                    onClick={() => setShowCheckModal(false)}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmitCheck}>
                  <div className="tracking-modal-body">
                    {/* Item Info */}
                    <div
                      style={{
                        background: "#f9fafb",
                        padding: "16px",
                        borderRadius: "8px",
                        marginBottom: "24px",
                      }}
                    >
                      <h4 style={{ margin: "0 0 8px 0" }}>
                        {selectedItem.uti}
                      </h4>
                      <p style={{ margin: 0, color: "#6b7280" }}>
                        {selectedItem.productName} • Batch:{" "}
                        {selectedItem.batchId}
                      </p>
                    </div>

                    <div className="tracking-form">
                      {/* Result */}
                      <div className="form-group">
                        <label className="form-label">
                          Inspection Result *
                        </label>
                        <div style={{ display: "flex", gap: "12px" }}>
                          {["passed", "failed", "conditional"].map((status) => (
                            <label
                              key={status}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "12px 16px",
                                border: `2px solid ${checkForm.status === status ? getStatusColor(status) : "#e5e7eb"}`,
                                borderRadius: "8px",
                                cursor: "pointer",
                                background:
                                  checkForm.status === status
                                    ? `${getStatusColor(status)}10`
                                    : "white",
                              }}
                            >
                              <input
                                type="radio"
                                name="status"
                                value={status}
                                checked={checkForm.status === status}
                                onChange={(e) =>
                                  setCheckForm({
                                    ...checkForm,
                                    status: e.target.value,
                                  })
                                }
                                style={{ display: "none" }}
                              />
                              <span
                                style={{
                                  textTransform: "capitalize",
                                  fontWeight: 500,
                                }}
                              >
                                {status}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Condition */}
                      <div className="form-group">
                        <label className="form-label">Condition *</label>
                        <select
                          className="form-select"
                          value={checkForm.condition}
                          onChange={(e) =>
                            setCheckForm({
                              ...checkForm,
                              condition: e.target.value,
                            })
                          }
                        >
                          <option value="new">New</option>
                          <option value="good">Good</option>
                          <option value="damaged">Damaged</option>
                          <option value="defective">Defective</option>
                          <option value="expired">Expired</option>
                        </select>
                      </div>

                      {/* Issues */}
                      {(checkForm.status === "failed" ||
                        checkForm.status === "conditional") && (
                        <div className="form-group">
                          <label className="form-label">Issues Found</label>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "8px",
                            }}
                          >
                            {issueOptions.map((issue) => (
                              <label
                                key={issue}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "8px 12px",
                                  border: `1px solid ${checkForm.issues.includes(issue) ? "#7c3aed" : "#e5e7eb"}`,
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  background: checkForm.issues.includes(issue)
                                    ? "#f3e8ff"
                                    : "white",
                                  fontSize: "13px",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={checkForm.issues.includes(issue)}
                                  onChange={() => handleIssueToggle(issue)}
                                  style={{ display: "none" }}
                                />
                                <span style={{ textTransform: "capitalize" }}>
                                  {issue.replace(/_/g, " ")}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea
                          className="form-textarea"
                          placeholder="Additional notes about this inspection..."
                          value={checkForm.notes}
                          onChange={(e) =>
                            setCheckForm({
                              ...checkForm,
                              notes: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* Inspector */}
                      <div className="form-group">
                        <label className="form-label">Inspector Name</label>
                        <input
                          type="text"
                          className="form-input"
                          value={checkForm.checkedBy}
                          onChange={(e) =>
                            setCheckForm({
                              ...checkForm,
                              checkedBy: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="tracking-modal-footer">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowCheckModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      ✅ Submit Inspection
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QualityControl;
