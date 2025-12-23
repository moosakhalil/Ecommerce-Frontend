import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/config";
import Sidebar from "../Sidebar/sidebar";
import "./ProductTracking.css";

const ScanTrack = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("manual");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus on input when tab changes to manual
    if (activeTab === "manual" && inputRef.current) {
      inputRef.current.focus();
    }
    // Load recent scans from localStorage
    const saved = localStorage.getItem("recentTrackingScans");
    if (saved) {
      setRecentScans(JSON.parse(saved).slice(0, 20));
    }
  }, [activeTab]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a UTI or Product ID");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResult(null);

    try {
      // Try UTI first
      let response = await axios.get(`${API_BASE_URL}/api/tracking/uti/${searchQuery.trim()}`);
      
      if (response.data.success) {
        setSearchResult(response.data.data);
        addToRecentScans(response.data.data);
      }
    } catch (err) {
      // If UTI not found, try general search
      try {
        const response = await axios.get(`${API_BASE_URL}/api/tracking`, {
          params: { search: searchQuery.trim(), limit: 1 }
        });

        if (response.data.success && response.data.data.length > 0) {
          setSearchResult(response.data.data[0]);
          addToRecentScans(response.data.data[0]);
        } else {
          setError("Product not found. Please check the ID and try again.");
        }
      } catch (searchErr) {
        setError("Product not found. Please check the ID and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const addToRecentScans = (item) => {
    const newScan = {
      uti: item.uti,
      productName: item.productName,
      status: item.currentStatus,
      location: item.currentLocation?.warehouseZone || "Unknown",
      timestamp: new Date().toISOString(),
    };

    const updated = [newScan, ...recentScans.filter(s => s.uti !== item.uti)].slice(0, 20);
    setRecentScans(updated);
    localStorage.setItem("recentTrackingScans", JSON.stringify(updated));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
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
    };
    return colors[status] || "#6b7280";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const clearResult = () => {
    setSearchResult(null);
    setSearchQuery("");
    setError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className={`transition-all duration-300 ${isSidebarOpen ? "lg:ml-80" : ""} w-full`}>
        <div className="tracking-container">
          <div className="tracking-header">
            <h1>🔍 Scan & Track Product</h1>
          </div>

      {/* Tabs */}
      <div className="tracking-tabs">
        <button
          className={`tracking-tab ${activeTab === "manual" ? "active" : ""}`}
          onClick={() => setActiveTab("manual")}
        >
          🔢 Manual Entry
        </button>
        <button
          className={`tracking-tab ${activeTab === "recent" ? "active" : ""}`}
          onClick={() => setActiveTab("recent")}
        >
          📋 Recent Scans ({recentScans.length})
        </button>
      </div>

      {/* Manual Entry Tab */}
      {activeTab === "manual" && (
        <div className="tracking-section">
          <h2>Enter UTI or Product ID</h2>
          
          <div className="tracking-search-bar">
            <div className="search-input-wrapper" style={{ flex: 2 }}>
              <span className="search-icon">🔍</span>
              <input
                ref={inputRef}
                type="text"
                className="search-input"
                placeholder="Enter UTI (e.g., P0001-B250122-U0001) or scan barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
            </div>
            <button
              className="btn-primary"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Searching..." : "🔍 Search"}
            </button>
          </div>

          {error && (
            <div className="tracking-error" style={{ minHeight: "auto", padding: "16px" }}>
              <span>⚠️ {error}</span>
            </div>
          )}

          {/* Search Result */}
          {searchResult && (
            <div className="tracking-card" style={{ marginTop: "24px" }}>
              <div className="tracking-card-header">
                <div>
                  <h3 className="tracking-card-title">{searchResult.uti}</h3>
                  <p style={{ color: "#6b7280", margin: "4px 0 0 0" }}>
                    {searchResult.productName}
                  </p>
                </div>
                <span
                  className="status-badge"
                  style={{
                    backgroundColor: `${getStatusColor(searchResult.currentStatus)}20`,
                    color: getStatusColor(searchResult.currentStatus),
                  }}
                >
                  {searchResult.currentStatus?.replace(/_/g, " ")}
                </span>
              </div>

              <div className="tracking-card-content" style={{ marginTop: "16px" }}>
                <div className="form-row">
                  <div className="tracking-card-row">
                    <span className="tracking-card-label">Product ID:</span>
                    <span className="tracking-card-value">{searchResult.productId}</span>
                  </div>
                  <div className="tracking-card-row">
                    <span className="tracking-card-label">Batch ID:</span>
                    <span className="tracking-card-value">{searchResult.batchId}</span>
                  </div>
                </div>
                <div className="form-row">
                  <div className="tracking-card-row">
                    <span className="tracking-card-label">Location:</span>
                    <span className="tracking-card-value">
                      {searchResult.currentLocation?.warehouseZone || "Unknown"} - 
                      {searchResult.currentLocation?.shelfLocation || "N/A"}
                    </span>
                  </div>
                  <div className="tracking-card-row">
                    <span className="tracking-card-label">Condition:</span>
                    <span className="tracking-card-value" style={{ textTransform: "capitalize" }}>
                      {searchResult.condition || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="form-row">
                  <div className="tracking-card-row">
                    <span className="tracking-card-label">Received:</span>
                    <span className="tracking-card-value">{formatDate(searchResult.receivedDate)}</span>
                  </div>
                  <div className="tracking-card-row">
                    <span className="tracking-card-label">Expiry:</span>
                    <span className="tracking-card-value">{formatDate(searchResult.expiryDate)}</span>
                  </div>
                </div>
                {searchResult.supplierOrderNumber && (
                  <div className="tracking-card-row">
                    <span className="tracking-card-label">Supplier Order:</span>
                    <span className="tracking-card-value">{searchResult.supplierOrderNumber}</span>
                  </div>
                )}
                {searchResult.customerOrderId && (
                  <div className="tracking-card-row">
                    <span className="tracking-card-label">Customer Order:</span>
                    <span className="tracking-card-value">{searchResult.customerOrderId}</span>
                  </div>
                )}
              </div>

              {/* Movement History */}
              {searchResult.movementHistory?.length > 0 && (
                <div style={{ marginTop: "24px" }}>
                  <h4 style={{ marginBottom: "16px" }}>Movement History</h4>
                  <div className="tracking-timeline">
                    {searchResult.movementHistory.slice().reverse().slice(0, 5).map((movement, index) => (
                      <div key={index} className="timeline-item">
                        <div
                          className="timeline-dot"
                          style={{ backgroundColor: getStatusColor(movement.status) }}
                        ></div>
                        <div className="timeline-content">
                          <div className="timeline-date">{formatDate(movement.timestamp)}</div>
                          <div className="timeline-title">{movement.status?.replace(/_/g, " ")}</div>
                          <div className="timeline-text">
                            {movement.fromLocation?.details} → {movement.toLocation?.details}
                          </div>
                          <div className="timeline-text">By: {movement.movedBy}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
                <button className="btn-secondary" onClick={clearResult}>
                  🔄 New Search
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Scans Tab */}
      {activeTab === "recent" && (
        <div className="tracking-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ margin: 0 }}>Recent Scans</h2>
            {recentScans.length > 0 && (
              <button
                className="btn-secondary"
                onClick={() => {
                  setRecentScans([]);
                  localStorage.removeItem("recentTrackingScans");
                }}
              >
                Clear History
              </button>
            )}
          </div>

          {recentScans.length > 0 ? (
            <div className="activity-list">
              {recentScans.map((scan, index) => (
                <div
                  key={index}
                  className="activity-item"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSearchQuery(scan.uti);
                    setActiveTab("manual");
                    setTimeout(handleSearch, 100);
                  }}
                >
                  <div
                    className="activity-status"
                    style={{ backgroundColor: getStatusColor(scan.status) }}
                  ></div>
                  <div className="activity-content">
                    <p className="activity-text">
                      <strong>{scan.uti}</strong> - {scan.productName}
                    </p>
                    <p className="activity-meta">
                      Status: {scan.status?.replace(/_/g, " ")} • Location: {scan.location}
                    </p>
                  </div>
                  <span className="activity-time">
                    {new Date(scan.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="tracking-empty-state">
              <div className="empty-icon">📋</div>
              <h3 className="empty-title">No Recent Scans</h3>
              <p className="empty-text">
                Scanned products will appear here for quick access.
              </p>
              <button className="btn-primary" onClick={() => setActiveTab("manual")}>
                Start Scanning
              </button>
            </div>
          )}
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default ScanTrack;
