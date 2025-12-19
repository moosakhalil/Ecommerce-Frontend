import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/sidebar";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SupplierOrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(
        `${API_BASE_URL}/api/supplier-orders?${params.toString()}`
      );
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
      } else {
        setError(data.message || "Failed to fetch orders");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, searchTerm]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge styles
  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: { bg: "#FEF3CD", color: "#856404", label: "Pending" },
      in_transit: { bg: "#D1ECF1", color: "#0C5460", label: "In Transit" },
      arrived: { bg: "#CCE5FF", color: "#004085", label: "Arrived" },
      verification_in_progress: {
        bg: "#E2E3E5",
        color: "#383D41",
        label: "Verification In Progress",
      },
      issues_reported: {
        bg: "#F8D7DA",
        color: "#721C24",
        label: "Issues Reported",
      },
      completed: { bg: "#D4EDDA", color: "#155724", label: "Completed" },
    };
    return statusStyles[status] || { bg: "#E2E3E5", color: "#383D41", label: status };
  };

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
      display: "flex",
      gap: "12px",
      marginBottom: "20px",
      flexWrap: "wrap",
    },
    searchInput: {
      flex: 1,
      minWidth: "200px",
      padding: "12px 16px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
    },
    select: {
      padding: "12px 16px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
      minWidth: "180px",
      backgroundColor: "#fff",
    },
    refreshBtn: {
      padding: "12px 24px",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
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
      padding: "16px",
      textAlign: "left",
      backgroundColor: "#f8f9fa",
      fontWeight: "600",
      color: "#495057",
      borderBottom: "2px solid #dee2e6",
      fontSize: "14px",
    },
    td: {
      padding: "16px",
      borderBottom: "1px solid #eee",
      fontSize: "14px",
      verticalAlign: "middle",
    },
    tr: {
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    badge: {
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-block",
    },
    progressBar: {
      width: "100%",
      height: "8px",
      backgroundColor: "#e9ecef",
      borderRadius: "4px",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: "#4CAF50",
      borderRadius: "4px",
      transition: "width 0.3s ease",
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#6c757d",
    },
    loadingState: {
      textAlign: "center",
      padding: "60px 20px",
    },
    spinner: {
      width: "40px",
      height: "40px",
      border: "4px solid #f3f3f3",
      borderTop: "4px solid #4CAF50",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "0 auto",
    },
  };

  return (
    <div style={styles.pageContainer}>
      <Sidebar />
      <div style={styles.mainContent}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>📦 Supply/Stock Arrival from Supplier</h1>
          <p style={styles.subtitle}>
            Track and verify product arrivals from suppliers
          </p>
        </div>

        {/* Search and Filters */}
        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder="Search by order number or supplier..."
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            style={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_transit">In Transit</option>
            <option value="arrived">Arrived</option>
            <option value="verification_in_progress">Verification In Progress</option>
            <option value="issues_reported">Issues Reported</option>
            <option value="completed">Completed</option>
          </select>
          <button style={styles.refreshBtn} onClick={fetchOrders}>
            🔄 Refresh
          </button>
        </div>

        {/* Table */}
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loadingState}>
              <div style={styles.spinner}></div>
              <p>Loading orders...</p>
            </div>
          ) : error ? (
            <div style={styles.emptyState}>
              <p style={{ color: "#dc3545" }}>❌ {error}</p>
              <button
                style={{ ...styles.refreshBtn, margin: "16px auto" }}
                onClick={fetchOrders}
              >
                Retry
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: "48px", marginBottom: "16px" }}>📋</p>
              <h3>No Supplier Orders Found</h3>
              <p>Orders from suppliers will appear here when available</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Order # (Items)</th>
                  <th style={styles.th}>Supplier Name</th>
                  <th style={styles.th}>Order Date</th>
                  <th style={styles.th}>Est. Arrival</th>
                  <th style={styles.th}>Product Lines</th>
                  <th style={styles.th}>Total Value</th>
                  <th style={styles.th}>Verification</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const statusStyle = getStatusBadge(order.status);
                  const progress = order.verificationProgress || { percentage: 0 };
                  return (
                    <tr
                      key={order._id}
                      style={styles.tr}
                      onClick={() => navigate(`/supply-stock-arrival/${order._id}`)}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                    >
                      <td style={{ ...styles.td, fontWeight: "600" }}>
                        {order.orderNumber}
                        {order.products && order.products.length > 0 && (
                          <span style={{ color: "#6c757d", fontWeight: "400", marginLeft: "4px" }}>
                            /({order.products.map((p, i) => p.productItemNumber || (i + 1)).join(",")})
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>{order.supplierName}</td>
                      <td style={styles.td}>{formatDate(order.orderDate)}</td>
                      <td style={styles.td}>{formatDate(order.estimatedArrival)}</td>
                      <td style={styles.td}>
                        <span style={{
                          backgroundColor: "#e9ecef",
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontWeight: "600",
                        }}>
                          {order.productLineCount || order.products?.length || 0}
                        </span>
                      </td>
                      <td style={styles.td}>
                        Rp {(order.totalValue || 0).toLocaleString()}
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={styles.progressBar}>
                            <div style={{ ...styles.progressFill, width: `${progress.percentage}%` }}></div>
                          </div>
                          <span style={{ fontSize: "12px", fontWeight: "600" }}>
                            {progress.percentage}%
                          </span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                        }}>
                          {statusStyle.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
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

export default SupplierOrderList;
