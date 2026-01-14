import React, { useState, useEffect } from "react";
import { Trash2, Edit } from "lucide-react";
import Sidebar from "../Sidebar/sidebar";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DeliveryFees = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ scooterPrice: 0, truckPrice: 0 });
  const [saving, setSaving] = useState(false);

  // Fetch all areas with hierarchy
  const fetchAreas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/area-management/full-hierarchy`);
      const data = await response.json();
      setAreas(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching areas:", err);
      setError("Failed to fetch areas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  // Start editing
  const handleEdit = (area) => {
    setEditingId(area._id);
    setEditValues({
      scooterPrice: area.scooterPrice || 0,
      truckPrice: area.truckPrice || 0,
    });
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setEditValues({ scooterPrice: 0, truckPrice: 0 });
  };

  // Save fees
  const handleSave = async (areaId) => {
    try {
      setSaving(true);
      const response = await fetch(
        `${API_BASE_URL}/api/area-management/areas/${areaId}/fees`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editValues),
        }
      );

      if (response.ok) {
        const updatedArea = await response.json();
        setAreas((prev) =>
          prev.map((a) => (a._id === areaId ? updatedArea : a))
        );
        setEditingId(null);
      } else {
        alert("Failed to update fees");
      }
    } catch (err) {
      console.error("Error saving fees:", err);
      alert("Error saving fees");
    } finally {
      setSaving(false);
    }
  };

  // Delete area
  const handleDelete = async (areaId) => {
    if (!window.confirm("Are you sure you want to delete this area?")) return;

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/area-management/areas/${areaId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAreas((prev) => prev.filter((a) => a._id !== areaId));
      } else {
        alert("Failed to delete area");
      }
    } catch (err) {
      console.error("Error deleting area:", err);
      alert("Error deleting area");
    } finally {
      setSaving(false);
    }
  };

  // Filter areas by search
  const filteredAreas = areas.filter((area) => {
    const searchLower = searchTerm.toLowerCase();
    const regencyName = area.regencyId?.name || "";
    const stateName = area.regencyId?.largerStateId?.name || "";
    const islandName = area.regencyId?.largerStateId?.islandId?.name || "";
    
    return (
      area.name.toLowerCase().includes(searchLower) ||
      (area.displayName || "").toLowerCase().includes(searchLower) ||
      regencyName.toLowerCase().includes(searchLower) ||
      stateName.toLowerCase().includes(searchLower) ||
      islandName.toLowerCase().includes(searchLower)
    );
  });

  // Group areas by regency
  const groupedByRegency = filteredAreas.reduce((acc, area) => {
    const regencyName = area.regencyId?.name || "Unknown";
    const regencyId = area.regencyId?._id || "unknown";
    
    if (!acc[regencyId]) {
      acc[regencyId] = {
        regencyName,
        regencyId,
        areas: []
      };
    }
    acc[regencyId].areas.push(area);
    return acc;
  }, {});

  // Convert to array and sort
  const regencyGroups = Object.values(groupedByRegency).sort((a, b) => 
    a.regencyName.localeCompare(b.regencyName)
  );

  // Styles
  const styles = {
    pageContainer: {
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
    },
    mainContent: {
      flex: 1,
      marginLeft: "320px",
      padding: "24px",
    },
    header: {
      marginBottom: "24px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#1a1a2e",
      margin: 0,
    },
    subtitle: {
      fontSize: "14px",
      color: "#6c757d",
      marginTop: "4px",
    },
    searchBar: {
      marginBottom: "20px",
    },
    searchInput: {
      width: "100%",
      maxWidth: "400px",
      padding: "12px 16px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
    },
    tableContainer: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      overflow: "hidden",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: {
      padding: "14px 16px",
      textAlign: "left",
      backgroundColor: "#f8f9fa",
      fontWeight: "600",
      color: "#495057",
      borderBottom: "2px solid #dee2e6",
      fontSize: "13px",
    },
    td: {
      padding: "12px 16px",
      borderBottom: "1px solid #eee",
      fontSize: "14px",
      verticalAlign: "middle",
    },
    regencyCell: {
      padding: "12px 16px",
      borderBottom: "1px solid #eee",
      fontSize: "14px",
      verticalAlign: "top",
      fontWeight: "600",
      backgroundColor: "#f8f9fa",
      borderRight: "1px solid #eee",
    },
    feeInput: {
      width: "90px",
      padding: "6px 8px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      fontSize: "14px",
      textAlign: "right",
    },
    feeDisplay: {
      fontWeight: "600",
      color: "#28a745",
    },
    actionBtn: {
      padding: "5px 10px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
      marginRight: "4px",
    },
    editBtn: {
      backgroundColor: "#007bff",
      color: "white",
    },
    saveBtn: {
      backgroundColor: "#28a745",
      color: "white",
    },
    cancelBtn: {
      backgroundColor: "#6c757d",
      color: "white",
    },
    deleteBtn: {
      backgroundColor: "#dc3545",
      color: "white",
    },
    loadingState: {
      textAlign: "center",
      padding: "60px 20px",
    },
    spinner: {
      width: "40px",
      height: "40px",
      border: "4px solid #f3f3f3",
      borderTop: "4px solid #007bff",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "0 auto",
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#6c757d",
    },
    statsRow: {
      display: "flex",
      gap: "16px",
      marginBottom: "20px",
    },
    statCard: {
      backgroundColor: "white",
      padding: "16px 20px",
      borderRadius: "10px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
      minWidth: "150px",
    },
    statLabel: {
      fontSize: "12px",
      color: "#6c757d",
      marginBottom: "4px",
    },
    statValue: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#1a1a2e",
    },
  };

  return (
    <div style={styles.pageContainer}>
      <Sidebar />
      <div style={styles.mainContent}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🚚 Delivery Fees</h1>
            <p style={styles.subtitle}>
              Manage scooter and truck delivery fees for each area
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Areas</div>
            <div style={styles.statValue}>{areas.length}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Regencies</div>
            <div style={styles.statValue}>{regencyGroups.length}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>With Scooter Fees</div>
            <div style={styles.statValue}>
              {areas.filter((a) => a.scooterPrice > 0).length}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>With Truck Fees</div>

            <div style={styles.statValue}>
              {areas.filter((a) => a.truckPrice > 0).length}
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder="Search by area, regency, or state..."
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loadingState}>
              <div style={styles.spinner}></div>
              <p>Loading areas...</p>
            </div>
          ) : error ? (
            <div style={styles.emptyState}>
              <p style={{ color: "#dc3545" }}>❌ {error}</p>
            </div>
          ) : regencyGroups.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: "48px", marginBottom: "16px" }}>📍</p>
              <h3>No Areas Found</h3>
              <p>Add areas in Area Management B first</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Regency</th>
                  <th style={styles.th}>Area</th>
                  <th style={styles.th}>Area Name</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>🛵 Scooter Price</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>🚛 Truck</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {regencyGroups.map((group, groupIdx) => (
                  <React.Fragment key={group.regencyId}>
                    {/* Add spacing before each regency group (except the first one) */}
                    {groupIdx > 0 && (
                      <tr>
                        <td colSpan="6" style={{ height: "20px", backgroundColor: "#ffe5cc", borderBottom: "2px solid #dee2e6" }}></td>
                      </tr>
                    )}
                    {group.areas.map((area, idx) => {
                      const isEditing = editingId === area._id;
                      const isFirstInGroup = idx === 0;
                    
                    return (
                      <tr key={area._id}>
                        {isFirstInGroup && (
                          <td 
                            style={styles.regencyCell} 
                            rowSpan={group.areas.length}
                          >
                            {group.regencyName}
                          </td>
                        )}
                        <td style={styles.td}>{area.name}</td>
                        <td style={styles.td}>{area.displayName || "-"}</td>
                        <td style={{ ...styles.td, textAlign: "right" }}>
                          {isEditing ? (
                            <input
                              type="number"
                              style={styles.feeInput}
                              value={editValues.scooterPrice}
                              onChange={(e) =>
                                setEditValues((prev) => ({
                                  ...prev,
                                  scooterPrice: e.target.value,
                                }))
                              }
                              min="0"
                            />
                          ) : (
                            <span style={styles.feeDisplay}>
                              {(area.scooterPrice || 0).toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td style={{ ...styles.td, textAlign: "right" }}>
                          {isEditing ? (
                            <input
                              type="number"
                              style={styles.feeInput}
                              value={editValues.truckPrice}
                              onChange={(e) =>
                                setEditValues((prev) => ({
                                  ...prev,
                                  truckPrice: e.target.value,
                                }))
                              }
                              min="0"
                            />
                          ) : (
                            <span style={styles.feeDisplay}>
                              {(area.truckPrice || 0).toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {isEditing ? (
                            <>
                              <button
                                style={{ ...styles.actionBtn, ...styles.saveBtn }}
                                onClick={() => handleSave(area._id)}
                                disabled={saving}
                              >
                                {saving ? "..." : "Save"}
                              </button>
                              <button
                                style={{ ...styles.actionBtn, ...styles.cancelBtn }}
                                onClick={handleCancel}
                                disabled={saving}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                style={{ ...styles.actionBtn, ...styles.editBtn }}
                                onClick={() => handleEdit(area)}
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                                onClick={() => handleDelete(area._id)}
                                disabled={saving}
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Spinner animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default DeliveryFees;
