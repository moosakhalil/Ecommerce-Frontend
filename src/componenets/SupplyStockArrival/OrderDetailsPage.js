import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/sidebar";
import IssueReportModal from "./IssueReportModal";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [issueCategories, setIssueCategories] = useState({});

  // Fetch order details
  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/supplier-orders/${orderId}`
      );
      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
        setAdditionalNotes(data.data.additionalNotes || "");
        setIssueCategories(data.data.issueCategories || {});
      } else {
        setError(data.message || "Failed to fetch order");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Error fetching order:", err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Verify product arrival
  const verifyProduct = async (productIndex, status, receivedQty) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/supplier-orders/${orderId}/verify-product/${productIndex}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            arrivalStatus: status,
            receivedQuantity: receivedQty,
            verifiedBy: "Admin",
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchOrder();
      } else {
        alert(data.message || "Failed to verify product");
      }
    } catch (err) {
      console.error("Error verifying product:", err);
      alert("Failed to verify product");
    }
  };

  // Update product notes
  const updateProductNotes = async (productIndex, notes) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/supplier-orders/${orderId}/verify-product/${productIndex}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notes,
            verifiedBy: "Admin",
          }),
        }
      );

      const data = await response.json();
      if (!data.success) {
        alert(data.message || "Failed to update notes");
      }
    } catch (err) {
      console.error("Error updating notes:", err);
    }
  };

  // Update overall issue categories
  const updateIssueCategories = async (categories) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/supplier-orders/${orderId}/overall-issues`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            issueCategories: categories,
            additionalNotes,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setIssueCategories(data.data.issueCategories);
      }
    } catch (err) {
      console.error("Error updating issue categories:", err);
    }
  };

  // Mark order as arrived
  const markAsArrived = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/supplier-orders/${orderId}/mark-arrived`,
        { method: "PATCH" }
      );

      const data = await response.json();
      if (data.success) {
        fetchOrder();
      } else {
        alert(data.message || "Failed to mark as arrived");
      }
    } catch (err) {
      console.error("Error marking as arrived:", err);
      alert("Failed to mark as arrived");
    }
  };

  // Complete verification
  const completeVerification = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/supplier-orders/${orderId}/complete`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verifiedBy: "Admin" }),
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchOrder();
        alert("Order verification completed!");
      } else {
        alert(data.message || "Failed to complete verification");
      }
    } catch (err) {
      console.error("Error completing verification:", err);
      alert("Failed to complete verification");
    }
  };

  // Toggle issue category
  const toggleIssueCategory = (category) => {
    const updated = { ...issueCategories, [category]: !issueCategories[category] };
    setIssueCategories(updated);
    updateIssueCategories(updated);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get status badge styles
  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: "#FEF3CD", color: "#856404", label: "Pending" },
      received: { bg: "#D4EDDA", color: "#155724", label: "Received" },
      partial: { bg: "#D1ECF1", color: "#0C5460", label: "Partial" },
      missing: { bg: "#F8D7DA", color: "#721C24", label: "Missing" },
      damaged: { bg: "#dc3545", color: "#fff", label: "Damaged" },
    };
    return styles[status] || { bg: "#E2E3E5", color: "#383D41", label: status };
  };

  // Issue category groups
  const issueCategoryGroups = [
    {
      title: "Product Condition Issues",
      color: "#dc3545",
      items: [
        { key: "productBrokenDamaged", label: "Product broken or damaged" },
        { key: "scratchedDentedCracked", label: "Scratched, dented, or cracked" },
        { key: "leaking", label: "Leaking (for liquids)" },
        { key: "expiredCloseToExpiry", label: "Expired or close to expiration" },
        { key: "defectiveNotWorking", label: "Defective / not working" },
        { key: "poorQualityManufacturingFault", label: "Poor quality or manufacturing fault" },
      ],
    },
    {
      title: "Quantity Issues",
      color: "#fd7e14",
      items: [
        { key: "missingItems", label: "Missing items" },
        { key: "wrongQuantity", label: "Wrong quantity (too many / too few)" },
        { key: "incompleteSet", label: "Incomplete set or kit" },
        { key: "extraItemsByMistake", label: "Extra items included by mistake" },
      ],
    },
    {
      title: "Product Specification Issues",
      color: "#6f42c1",
      items: [
        { key: "wrongColor", label: "Wrong color" },
        { key: "wrongSize", label: "Wrong size" },
        { key: "wrongModelVersion", label: "Wrong model or version" },
        { key: "wrongMaterial", label: "Wrong material" },
        { key: "wrongFlavorScent", label: "Wrong flavor / scent" },
      ],
    },
    {
      title: "Packaging Issues",
      color: "#17a2b8",
      items: [
        { key: "packagingDamaged", label: "Packaging damaged" },
        { key: "packagingOpenedTampered", label: "Packaging opened or tampered" },
        { key: "missingPackaging", label: "Missing packaging" },
        { key: "incorrectPackaging", label: "Incorrect packaging" },
        { key: "poorLabeling", label: "Poor labeling or unreadable label" },
      ],
    },
    {
      title: "Labeling & Documentation Issues",
      color: "#6c757d",
      items: [
        { key: "wrongBarcode", label: "Wrong barcode" },
        { key: "missingBarcode", label: "Missing barcode" },
        { key: "incorrectProductDescription", label: "Incorrect product description" },
        { key: "missingInstructionsManual", label: "Missing instructions or manual" },
        { key: "missingWarrantyDocuments", label: "Missing warranty documents" },
      ],
    },
    {
      title: "Order & Shipping Issues",
      color: "#20c997",
      items: [
        { key: "wrongProductSent", label: "Wrong product sent" },
        { key: "mixedProducts", label: "Mixed products in one order" },
        { key: "incorrectCustomerOrder", label: "Incorrect customer order" },
        { key: "deliveryDelay", label: "Delivery delay" },
        { key: "wrongLocation", label: "Product sent to wrong location" },
      ],
    },
    {
      title: "Compliance & Safety Issues",
      color: "#e83e8c",
      items: [
        { key: "notMeetingSafetyStandards", label: "Not meeting safety standards" },
        { key: "missingSafetyWarnings", label: "Missing safety warnings" },
        { key: "incorrectCertification", label: "Incorrect certification marks" },
      ],
    },
  ];

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
    backBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 16px",
      backgroundColor: "#fff",
      border: "1px solid #ddd",
      borderRadius: "8px",
      cursor: "pointer",
      marginBottom: "20px",
      fontSize: "14px",
    },
    header: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    },
    headerGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
    },
    headerItem: {
      borderLeft: "3px solid #4CAF50",
      paddingLeft: "16px",
    },
    headerLabel: {
      fontSize: "12px",
      color: "#6c757d",
      marginBottom: "4px",
      textTransform: "uppercase",
      fontWeight: "600",
    },
    headerValue: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#1a1a2e",
    },
    section: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    },
    sectionTitle: {
      fontSize: "18px",
      fontWeight: "700",
      marginBottom: "16px",
      color: "#1a1a2e",
    },
    issueGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "16px",
    },
    issueGroup: {
      border: "1px solid #eee",
      borderRadius: "8px",
      padding: "16px",
    },
    issueGroupTitle: {
      fontSize: "14px",
      fontWeight: "600",
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    checkbox: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "6px 0",
      fontSize: "13px",
      cursor: "pointer",
    },
    productCard: {
      border: "1px solid #eee",
      borderRadius: "10px",
      padding: "16px",
      marginBottom: "12px",
      display: "grid",
      gridTemplateColumns: "80px 1fr auto",
      gap: "16px",
      alignItems: "center",
    },
    productImage: {
      width: "80px",
      height: "80px",
      backgroundColor: "#f0f0f0",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "32px",
    },
    productInfo: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    productActions: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      alignItems: "flex-end",
    },
    btn: {
      padding: "8px 16px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "600",
    },
    btnPrimary: {
      backgroundColor: "#4CAF50",
      color: "white",
    },
    btnDanger: {
      backgroundColor: "#dc3545",
      color: "white",
    },
    btnSecondary: {
      backgroundColor: "#6c757d",
      color: "white",
    },
    badge: {
      padding: "4px 10px",
      borderRadius: "12px",
      fontSize: "11px",
      fontWeight: "600",
    },
    textarea: {
      width: "100%",
      padding: "12px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      fontSize: "14px",
      resize: "vertical",
      minHeight: "100px",
    },
    noteInput: {
      width: "200px",
      padding: "8px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      fontSize: "13px",
    },
    controlButtons: {
      display: "flex",
      gap: "12px",
      marginBottom: "20px",
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

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <Sidebar />
        <div style={styles.mainContent}>
          <div style={styles.loadingState}>
            <div style={styles.spinner}></div>
            <p>Loading order details...</p>
          </div>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={styles.pageContainer}>
        <Sidebar />
        <div style={styles.mainContent}>
          <button style={styles.backBtn} onClick={() => navigate("/supply-stock-arrival")}>
            ← Back to Orders
          </button>
          <div style={{ textAlign: "center", padding: "60px", color: "#dc3545" }}>
            <h3>Order Not Found</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const progress = order.verificationProgress || { verified: 0, total: 0, percentage: 0 };

  return (
    <div style={styles.pageContainer}>
      <Sidebar />
      <div style={styles.mainContent}>
        {/* Back Button */}
        <button style={styles.backBtn} onClick={() => navigate("/supply-stock-arrival")}>
          ← Back to Orders
        </button>

        {/* Control Buttons */}
        <div style={styles.controlButtons}>
          {order.status === "pending" && (
            <button
              style={{ ...styles.btn, ...styles.btnPrimary }}
              onClick={markAsArrived}
            >
              📦 Mark as Arrived
            </button>
          )}
          {["arrived", "verification_in_progress"].includes(order.status) && (
            <button
              style={{ ...styles.btn, ...styles.btnPrimary }}
              onClick={completeVerification}
            >
              ✅ Complete Verification
            </button>
          )}
        </div>

        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.headerGrid}>
            <div style={styles.headerItem}>
              <div style={styles.headerLabel}>Order Number</div>
              <div style={styles.headerValue}>{order.orderNumber}</div>
            </div>
            <div style={styles.headerItem}>
              <div style={styles.headerLabel}>When Ordered</div>
              <div style={styles.headerValue}>{formatDate(order.orderDate)}</div>
            </div>
            <div style={styles.headerItem}>
              <div style={styles.headerLabel}>Total Value</div>
              <div style={styles.headerValue}>
                Rp {(order.totalValue || 0).toLocaleString()}
              </div>
            </div>
            <div style={styles.headerItem}>
              <div style={styles.headerLabel}>Supplier</div>
              <div style={styles.headerValue}>{order.supplierName}</div>
            </div>
            <div style={styles.headerItem}>
              <div style={styles.headerLabel}>Verification Progress</div>
              <div style={styles.headerValue}>
                {progress.verified} / {progress.total} ({progress.percentage}%)
              </div>
            </div>
          </div>
        </div>

        {/* Issue Categories Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>⚠️ Quick Issue Checkboxes</h2>
          <div style={styles.issueGrid}>
            {issueCategoryGroups.map((group) => (
              <div key={group.title} style={styles.issueGroup}>
                <div style={{ ...styles.issueGroupTitle, color: group.color }}>
                  <span style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: group.color,
                    borderRadius: "50%",
                  }}></span>
                  {group.title}
                </div>
                {group.items.map((item) => (
                  <label key={item.key} style={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={issueCategories[item.key] || false}
                      onChange={() => toggleIssueCategory(item.key)}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Notes Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📝 Additional Notes</h2>
          <textarea
            style={styles.textarea}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            onBlur={() => updateIssueCategories(issueCategories)}
            placeholder="Add any additional notes about this order..."
          />
        </div>

        {/* Products Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📋 Products List</h2>
          {order.products?.map((product, index) => {
            const statusStyle = getStatusBadge(product.arrivalStatus);
            return (
              <div key={index} style={styles.productCard}>
                <div style={styles.productImage}>
                  {product.productImage ? (
                    <img
                      src={product.productImage}
                      alt={product.productName}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                    />
                  ) : (
                    "📦"
                  )}
                </div>
                <div style={styles.productInfo}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <strong style={{ fontSize: "16px" }}>
                      {product.productItemNumber || (index + 1)}. {product.productName}
                    </strong>
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                      }}
                    >
                      {statusStyle.label}
                    </span>
                  </div>
                  <div style={{ color: "#6c757d", fontSize: "13px" }}>
                    Item: {order.orderNumber}/{product.productItemNumber || (index + 1)} • ID: {product.productId}
                  </div>
                  <div style={{ fontSize: "14px" }}>
                    Quantity: <strong>{product.receivedQuantity || 0}</strong> / {product.orderedQuantity}
                    {" • "}
                    Price: <strong>Rp {(product.price || 0).toLocaleString()}</strong>
                  </div>
                  {product.details && (
                    <div style={{ color: "#6c757d", fontSize: "12px" }}>
                      {product.details.size && `Size: ${product.details.size}`}
                      {product.details.color && ` • Color: ${product.details.color}`}
                    </div>
                  )}
                  <div style={{ marginTop: "8px" }}>
                    <input
                      type="text"
                      style={styles.noteInput}
                      placeholder="Add notes..."
                      defaultValue={product.notes || ""}
                      onBlur={(e) => updateProductNotes(index, e.target.value)}
                    />
                  </div>
                  {product.issues?.length > 0 && (
                    <div style={{ marginTop: "8px", color: "#dc3545", fontSize: "12px" }}>
                      ⚠️ {product.issues.length} issue(s) reported
                    </div>
                  )}
                </div>
                <div style={styles.productActions}>
                  {product.arrivalStatus === "pending" ? (
                    <>
                      <button
                        style={{ ...styles.btn, ...styles.btnPrimary }}
                        onClick={() => verifyProduct(index, "received", product.orderedQuantity)}
                      >
                        ✅ Received
                      </button>
                      <button
                        style={{ ...styles.btn, ...styles.btnDanger }}
                        onClick={() => {
                          setSelectedProduct({ index, product });
                          setShowIssueModal(true);
                        }}
                      >
                        ⚠️ Issue
                      </button>
                    </>
                  ) : (
                    <button
                      style={{ ...styles.btn, ...styles.btnSecondary }}
                      onClick={() => {
                        setSelectedProduct({ index, product });
                        setShowIssueModal(true);
                      }}
                    >
                      📋 View/Add Issue
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Issue Report Modal */}
        {showIssueModal && selectedProduct && (
          <IssueReportModal
            orderId={orderId}
            productIndex={selectedProduct.index}
            product={selectedProduct.product}
            onClose={() => {
              setShowIssueModal(false);
              setSelectedProduct(null);
            }}
            onSuccess={() => {
              setShowIssueModal(false);
              setSelectedProduct(null);
              fetchOrder();
            }}
          />
        )}
      </div>

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OrderDetailsPage;
