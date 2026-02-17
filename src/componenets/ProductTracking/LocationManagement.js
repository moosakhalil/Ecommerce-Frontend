import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/config";
import Sidebar from "../Sidebar/sidebar";
import ModeToggle from "../Shared/ModeToggle";
import "./ProductTracking.css";

const LocationManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("zones");
  const [loading, setLoading] = useState(true);
  const [locationData, setLocationData] = useState({
    zones: [],
    locations: [],
  });

  useEffect(() => {
    fetchLocationData();
  }, []);

  const fetchLocationData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/tracking/locations/summary`,
      );
      if (response.data.success) {
        setLocationData(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching location data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getUtilizationColor = (percentage) => {
    if (percentage >= 90) return "#ef4444";
    if (percentage >= 70) return "#f59e0b";
    return "#10b981";
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
              <p>Loading locations...</p>
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
              <strong>304.</strong> 📍 Location Management
            </h1>
            <button className="refresh-btn" onClick={fetchLocationData}>
              🔄 Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="tracking-tabs">
            <button
              className={`tracking-tab ${activeTab === "zones" ? "active" : ""}`}
              onClick={() => setActiveTab("zones")}
            >
              🗺️ Warehouse Zones
            </button>
            <button
              className={`tracking-tab ${activeTab === "locations" ? "active" : ""}`}
              onClick={() => setActiveTab("locations")}
            >
              📋 All Locations
            </button>
          </div>

          {/* Zones Tab */}
          {activeTab === "zones" && (
            <div className="tracking-section">
              <h2>Warehouse Zones Overview</h2>

              {locationData.zones?.length > 0 ? (
                <div className="tracking-cards-grid">
                  {locationData.zones.map((zone, index) => {
                    // Calculate a mock utilization (in real app, would come from capacity data)
                    const mockCapacity = 500;
                    const utilization = Math.min(
                      100,
                      Math.round((zone.totalUnits / mockCapacity) * 100),
                    );

                    return (
                      <div key={index} className="tracking-card">
                        <div className="tracking-card-header">
                          <div>
                            <h3 className="tracking-card-title">
                              {zone.zone || zone._id}
                            </h3>
                            <p
                              style={{
                                color: "#6b7280",
                                margin: "4px 0 0 0",
                                fontSize: "14px",
                              }}
                            >
                              {zone.uniqueShelves} shelf locations
                            </p>
                          </div>
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              background: `conic-gradient(${getUtilizationColor(utilization)} ${utilization * 3.6}deg, #e5e7eb 0deg)`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                background: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: "600",
                              }}
                            >
                              {utilization}%
                            </div>
                          </div>
                        </div>

                        <div
                          className="tracking-card-content"
                          style={{ marginTop: "16px" }}
                        >
                          <div className="tracking-card-row">
                            <span className="tracking-card-label">
                              Total Units:
                            </span>
                            <span
                              className="tracking-card-value"
                              style={{ color: "#7c3aed", fontWeight: 600 }}
                            >
                              {zone.totalUnits}
                            </span>
                          </div>
                          <div className="tracking-card-row">
                            <span className="tracking-card-label">Status:</span>
                            <span
                              className="status-badge"
                              style={{
                                backgroundColor: `${getUtilizationColor(utilization)}20`,
                                color: getUtilizationColor(utilization),
                              }}
                            >
                              {utilization >= 90
                                ? "Near Full"
                                : utilization >= 70
                                  ? "Moderate"
                                  : "Available"}
                            </span>
                          </div>
                        </div>

                        <div style={{ marginTop: "16px" }}>
                          <div className="status-bar" style={{ height: "8px" }}>
                            <div
                              className="status-bar-fill"
                              style={{
                                width: `${utilization}%`,
                                backgroundColor:
                                  getUtilizationColor(utilization),
                              }}
                            ></div>
                          </div>
                          <p
                            style={{
                              textAlign: "center",
                              margin: "8px 0 0 0",
                              fontSize: "12px",
                              color: "#6b7280",
                            }}
                          >
                            Capacity Utilization
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="tracking-empty-state">
                  <div className="empty-icon">🗺️</div>
                  <h3 className="empty-title">No Zones Found</h3>
                  <p className="empty-text">
                    Zones will appear here when you receive products and assign
                    locations.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Locations Tab */}
          {activeTab === "locations" && (
            <div className="tracking-section">
              <h2>All Storage Locations</h2>

              {locationData.locations?.length > 0 ? (
                <div className="tracking-table-container">
                  <table className="tracking-table">
                    <thead>
                      <tr>
                        <th>Zone</th>
                        <th>Shelf Location</th>
                        <th>Units Count</th>
                        <th>Products</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locationData.locations.map((loc, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{loc._id?.zone || "Unknown"}</strong>
                          </td>
                          <td>{loc._id?.shelf || "N/A"}</td>
                          <td>
                            <span style={{ color: "#7c3aed", fontWeight: 600 }}>
                              {loc.count}
                            </span>
                          </td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "4px",
                              }}
                            >
                              {loc.products?.slice(0, 3).map((product, i) => (
                                <span
                                  key={i}
                                  style={{
                                    background: "#f3e8ff",
                                    color: "#7c3aed",
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                  }}
                                >
                                  {product}
                                </span>
                              ))}
                              {loc.products?.length > 3 && (
                                <span
                                  style={{ color: "#6b7280", fontSize: "12px" }}
                                >
                                  +{loc.products.length - 3} more
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="tracking-empty-state">
                  <div className="empty-icon">📋</div>
                  <h3 className="empty-title">No Locations Found</h3>
                  <p className="empty-text">
                    Storage locations will appear here when products are
                    assigned to shelves.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick Stats Section */}
          <div className="tracking-section">
            <h2>Location Summary</h2>
            <div className="tracking-stats-grid">
              <div
                className="tracking-stat-card"
                style={{ borderLeftColor: "#7c3aed" }}
              >
                <div
                  className="stat-icon"
                  style={{ backgroundColor: "#f3e8ff", color: "#7c3aed" }}
                >
                  🗺️
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">
                    {locationData.zones?.length || 0}
                  </h3>
                  <p className="stat-title">Active Zones</p>
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
                  📍
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">
                    {locationData.locations?.length || 0}
                  </h3>
                  <p className="stat-title">Shelf Locations</p>
                </div>
              </div>

              <div
                className="tracking-stat-card"
                style={{ borderLeftColor: "#3b82f6" }}
              >
                <div
                  className="stat-icon"
                  style={{ backgroundColor: "#dbeafe", color: "#3b82f6" }}
                >
                  📦
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">
                    {locationData.zones?.reduce(
                      (sum, z) => sum + (z.totalUnits || 0),
                      0,
                    ) || 0}
                  </h3>
                  <p className="stat-title">Total Units Stored</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationManagement;
