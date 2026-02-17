import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/config";
import Sidebar from "../Sidebar/sidebar";
import ModeToggle from "../Shared/ModeToggle";
import "./ProductTracking.css";

const TrackingSettings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [newZone, setNewZone] = useState("");

  // Settings state (stored in localStorage for now)
  const [settings, setSettings] = useState({
    autoGenerateUTI: true,
    utiFormat: "productId-batchId-unit",
    enableExpiryAlerts: true,
    expiryAlertDays: 30,
    enableLowStockAlerts: true,
    lowStockThreshold: 10,
    requireQualityCheck: true,
    defaultZone: "Receiving",
  });

  useEffect(() => {
    fetchConfig();
    loadSettings();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const [zonesRes, statusesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/tracking/config/zones`),
        axios.get(`${API_BASE_URL}/api/tracking/config/statuses`),
      ]);

      if (zonesRes.data.success) setZones(zonesRes.data.data);
      if (statusesRes.data.success) setStatuses(statusesRes.data.data);
    } catch (err) {
      console.error("Error fetching config:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = () => {
    const saved = localStorage.getItem("trackingSettings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  };

  const saveSettings = () => {
    localStorage.setItem("trackingSettings", JSON.stringify(settings));
    alert("Settings saved successfully!");
  };

  const handleAddZone = () => {
    if (newZone.trim() && !zones.includes(newZone.trim())) {
      setZones([...zones, newZone.trim()]);
      setNewZone("");
      // In production, this would call an API to save the zone
      alert(
        `Zone "${newZone.trim()}" added. Note: This is saved locally. Backend persistence requires API integration.`,
      );
    }
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
              <p>Loading settings...</p>
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
              <strong>307.</strong> ⚙️ Tracking Settings
            </h1>
            <button className="btn-primary" onClick={saveSettings}>
              💾 Save Settings
            </button>
          </div>

          {/* Tabs */}
          <div className="tracking-tabs">
            <button
              className={`tracking-tab ${activeTab === "general" ? "active" : ""}`}
              onClick={() => setActiveTab("general")}
            >
              ⚙️ General
            </button>
            <button
              className={`tracking-tab ${activeTab === "zones" ? "active" : ""}`}
              onClick={() => setActiveTab("zones")}
            >
              📍 Warehouse Zones
            </button>
            <button
              className={`tracking-tab ${activeTab === "alerts" ? "active" : ""}`}
              onClick={() => setActiveTab("alerts")}
            >
              🔔 Alerts
            </button>
            <button
              className={`tracking-tab ${activeTab === "statuses" ? "active" : ""}`}
              onClick={() => setActiveTab("statuses")}
            >
              📊 Status Reference
            </button>
          </div>

          {/* General Tab */}
          {activeTab === "general" && (
            <div className="tracking-section">
              <h2>General Settings</h2>

              <div className="tracking-form">
                {/* UTI Settings */}
                <div
                  style={{
                    background: "#f9fafb",
                    padding: "20px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <h3 style={{ marginTop: 0, marginBottom: "16px" }}>
                    Unique Tracking Identifier (UTI)
                  </h3>

                  <div className="form-group">
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={settings.autoGenerateUTI}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            autoGenerateUTI: e.target.checked,
                          })
                        }
                      />
                      <span>Auto-generate UTI on product receive</span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="form-label">UTI Format</label>
                    <select
                      className="form-select"
                      value={settings.utiFormat}
                      onChange={(e) =>
                        setSettings({ ...settings, utiFormat: e.target.value })
                      }
                    >
                      <option value="productId-batchId-unit">
                        ProductID-BatchID-Unit (e.g., P0001-B250122-U0001)
                      </option>
                      <option value="batch-product-unit">
                        BatchID/ProductID/Unit (e.g., B250122/P0001/0001)
                      </option>
                      <option value="sequential">
                        Sequential Only (e.g., TRK-00000001)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Quality Control */}
                <div
                  style={{
                    background: "#f9fafb",
                    padding: "20px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <h3 style={{ marginTop: 0, marginBottom: "16px" }}>
                    Quality Control
                  </h3>

                  <div className="form-group">
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={settings.requireQualityCheck}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            requireQualityCheck: e.target.checked,
                          })
                        }
                      />
                      <span>
                        Require quality check before storage assignment
                      </span>
                    </label>
                  </div>
                </div>

                {/* Default Zone */}
                <div className="form-group">
                  <label className="form-label">Default Receiving Zone</label>
                  <select
                    className="form-select"
                    value={settings.defaultZone}
                    onChange={(e) =>
                      setSettings({ ...settings, defaultZone: e.target.value })
                    }
                  >
                    {zones.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Zones Tab */}
          {activeTab === "zones" && (
            <div className="tracking-section">
              <h2>Warehouse Zones</h2>

              <div
                style={{ display: "flex", gap: "12px", marginBottom: "24px" }}
              >
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter new zone name..."
                  value={newZone}
                  onChange={(e) => setNewZone(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button className="btn-primary" onClick={handleAddZone}>
                  + Add Zone
                </button>
              </div>

              <div className="tracking-cards-grid">
                {zones.map((zone, index) => (
                  <div key={index} className="tracking-card">
                    <div className="tracking-card-header">
                      <h3 className="tracking-card-title">{zone}</h3>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: "#d1fae5", color: "#10b981" }}
                      >
                        Active
                      </span>
                    </div>
                    <div
                      className="tracking-card-content"
                      style={{ marginTop: "12px" }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: "#6b7280",
                          fontSize: "14px",
                        }}
                      >
                        Warehouse zone for product storage
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {zones.length === 0 && (
                <div className="tracking-empty-state">
                  <div className="empty-icon">📍</div>
                  <h3 className="empty-title">No Zones Configured</h3>
                  <p className="empty-text">
                    Add warehouse zones to organize your storage.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === "alerts" && (
            <div className="tracking-section">
              <h2>Alert Settings</h2>

              <div className="tracking-form">
                {/* Expiry Alerts */}
                <div
                  style={{
                    background: "#fef3c7",
                    padding: "20px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "16px",
                    }}
                  >
                    <span style={{ fontSize: "24px" }}>⏰</span>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginTop: 0, marginBottom: "12px" }}>
                        Expiry Date Alerts
                      </h3>

                      <div
                        className="form-group"
                        style={{ marginBottom: "12px" }}
                      >
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={settings.enableExpiryAlerts}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                enableExpiryAlerts: e.target.checked,
                              })
                            }
                          />
                          <span>Enable expiry date alerts</span>
                        </label>
                      </div>

                      {settings.enableExpiryAlerts && (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">
                            Alert threshold (days before expiry)
                          </label>
                          <input
                            type="number"
                            className="form-input"
                            value={settings.expiryAlertDays}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                expiryAlertDays: parseInt(e.target.value),
                              })
                            }
                            min="1"
                            max="365"
                            style={{ maxWidth: "120px" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div
                  style={{
                    background: "#fee2e2",
                    padding: "20px",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "16px",
                    }}
                  >
                    <span style={{ fontSize: "24px" }}>📦</span>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginTop: 0, marginBottom: "12px" }}>
                        Low Stock Alerts
                      </h3>

                      <div
                        className="form-group"
                        style={{ marginBottom: "12px" }}
                      >
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={settings.enableLowStockAlerts}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                enableLowStockAlerts: e.target.checked,
                              })
                            }
                          />
                          <span>Enable low stock alerts</span>
                        </label>
                      </div>

                      {settings.enableLowStockAlerts && (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">
                            Low stock threshold (units)
                          </label>
                          <input
                            type="number"
                            className="form-input"
                            value={settings.lowStockThreshold}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                lowStockThreshold: parseInt(e.target.value),
                              })
                            }
                            min="1"
                            style={{ maxWidth: "120px" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statuses Tab */}
          {activeTab === "statuses" && (
            <div className="tracking-section">
              <h2>Status Reference</h2>
              <p style={{ color: "#6b7280", marginBottom: "24px" }}>
                These are the available product statuses in the tracking system.
              </p>

              <div className="tracking-cards-grid">
                {statuses.map((status, index) => (
                  <div
                    key={index}
                    className="tracking-card"
                    style={{
                      borderLeftColor: status.color,
                      borderLeftWidth: "4px",
                    }}
                  >
                    <div className="tracking-card-header">
                      <h3 className="tracking-card-title">{status.label}</h3>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: `${status.color}20`,
                          color: status.color,
                        }}
                      >
                        {status.value}
                      </span>
                    </div>
                    <div
                      className="tracking-card-content"
                      style={{ marginTop: "12px" }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "4px",
                          backgroundColor: status.color,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingSettings;
