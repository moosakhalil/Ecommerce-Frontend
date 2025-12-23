import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/config";
import Sidebar from "../Sidebar/sidebar";
import "./ProductTracking.css";

const BatchManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [expiringBatches, setExpiringBatches] = useState([]);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [products, setProducts] = useState([]);

  // Receive form
  const [receiveForm, setReceiveForm] = useState({
    productId: "",
    productName: "",
    quantity: 1,
    supplierOrderNumber: "",
    supplierName: "",
    batchNumber: "",
    manufacturingDate: "",
    expiryDate: "",
    initialZone: "Receiving",
    initialShelf: "Dock",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [batchesRes, expiringRes, productsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/tracking/batches/list`),
        axios.get(`${API_BASE_URL}/api/tracking/batches/expiring?days=30`),
        axios.get(`${API_BASE_URL}/api/products`),
      ]);

      if (batchesRes.data.success) setBatches(batchesRes.data.data);
      if (expiringRes.data.success) setExpiringBatches(expiringRes.data.data);
      
      // Handle different possible response formats for products
      const productsData = productsRes.data;
      if (Array.isArray(productsData)) {
        setProducts(productsData);
      } else if (productsData?.data && Array.isArray(productsData.data)) {
        setProducts(productsData.data);
      } else if (productsData?.products && Array.isArray(productsData.products)) {
        setProducts(productsData.products);
      } else {
        setProducts([]);
        console.warn("Products API response format not recognized:", productsData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setProducts([]); // Ensure products is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/tracking/receive`, {
        productId: receiveForm.productId,
        productName: receiveForm.productName,
        quantity: parseInt(receiveForm.quantity),
        supplierOrderNumber: receiveForm.supplierOrderNumber,
        supplierName: receiveForm.supplierName,
        batchNumber: receiveForm.batchNumber,
        manufacturingDate: receiveForm.manufacturingDate || null,
        expiryDate: receiveForm.expiryDate || null,
        initialLocation: {
          zone: receiveForm.initialZone,
          shelf: receiveForm.initialShelf,
        },
        receivedBy: "Admin",
      });

      if (response.data.success) {
        alert(`Successfully created ${response.data.data.items.length} tracking items!\nBatch ID: ${response.data.data.batchId}`);
        setShowReceiveModal(false);
        resetReceiveForm();
        fetchData();
      }
    } catch (err) {
      console.error("Error receiving items:", err);
      alert("Failed to receive items: " + (err.response?.data?.message || err.message));
    }
  };

  const resetReceiveForm = () => {
    setReceiveForm({
      productId: "",
      productName: "",
      quantity: 1,
      supplierOrderNumber: "",
      supplierName: "",
      batchNumber: "",
      manufacturingDate: "",
      expiryDate: "",
      initialZone: "Receiving",
      initialShelf: "Dock",
    });
  };

  const handleProductSelect = (productId) => {
    const product = products.find(p => p.productId === productId);
    if (product) {
      setReceiveForm({
        ...receiveForm,
        productId: product.productId,
        productName: product.productName,
      });
    }
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const diffMs = new Date(expiryDate) - new Date();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const getExpiryColor = (days) => {
    if (days <= 7) return "#ef4444";
    if (days <= 15) return "#f59e0b";
    return "#10b981";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className={`transition-all duration-300 ${isSidebarOpen ? "lg:ml-80" : ""} w-full`}>
          <div className="tracking-container">
            <div className="tracking-loading">
              <div className="loading-spinner"></div>
              <p>Loading batches...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className={`transition-all duration-300 ${isSidebarOpen ? "lg:ml-80" : ""} w-full`}>
        <div className="tracking-container">
          <div className="tracking-header">
            <h1>📦 Batch Management</h1>
            <button className="btn-primary" onClick={() => setShowReceiveModal(true)}>
              + Receive Shipment
            </button>
          </div>

      {/* Tabs */}
      <div className="tracking-tabs">
        <button
          className={`tracking-tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          📦 All Batches ({batches.length})
        </button>
        <button
          className={`tracking-tab ${activeTab === "expiring" ? "active" : ""}`}
          onClick={() => setActiveTab("expiring")}
        >
          ⚠️ Expiring Soon ({expiringBatches.length})
        </button>
      </div>

      {/* All Batches Tab */}
      {activeTab === "all" && (
        <div className="tracking-section">
          {batches.length > 0 ? (
            <div className="tracking-table-container">
              <table className="tracking-table">
                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Product</th>
                    <th>Supplier</th>
                    <th>Received</th>
                    <th>Expiry</th>
                    <th>Total</th>
                    <th>In Storage</th>
                    <th>Delivered</th>
                    <th>Damaged</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch, index) => {
                    const daysLeft = getDaysUntilExpiry(batch.expiryDate);
                    return (
                      <tr key={index}>
                        <td>
                          <strong>{batch.batchId || batch._id?.batchId}</strong>
                        </td>
                        <td>
                          <div>
                            <strong>{batch.productName}</strong>
                            <br />
                            <span style={{ color: "#6b7280", fontSize: "12px" }}>
                              {batch._id?.productId || batch.productId}
                            </span>
                          </div>
                        </td>
                        <td>{batch.supplierName || "N/A"}</td>
                        <td>{batch.receivedDate ? new Date(batch.receivedDate).toLocaleDateString() : "N/A"}</td>
                        <td>
                          {batch.expiryDate ? (
                            <span style={{ color: daysLeft ? getExpiryColor(daysLeft) : "#6b7280" }}>
                              {new Date(batch.expiryDate).toLocaleDateString()}
                              {daysLeft !== null && (
                                <span style={{ display: "block", fontSize: "12px" }}>
                                  ({daysLeft} days left)
                                </span>
                              )}
                            </span>
                          ) : "N/A"}
                        </td>
                        <td>{batch.totalUnits}</td>
                        <td style={{ color: "#10b981" }}>{batch.inStorage}</td>
                        <td style={{ color: "#3b82f6" }}>{batch.delivered}</td>
                        <td style={{ color: batch.damaged > 0 ? "#ef4444" : "#6b7280" }}>{batch.damaged}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="tracking-empty-state">
              <div className="empty-icon">📦</div>
              <h3 className="empty-title">No Batches Found</h3>
              <p className="empty-text">Start by receiving a shipment from a supplier.</p>
              <button className="btn-primary" onClick={() => setShowReceiveModal(true)}>
                + Receive Shipment
              </button>
            </div>
          )}
        </div>
      )}

      {/* Expiring Soon Tab */}
      {activeTab === "expiring" && (
        <div className="tracking-section">
          {expiringBatches.length > 0 ? (
            <div className="tracking-cards-grid">
              {expiringBatches.map((batch, index) => {
                const daysLeft = Math.floor(batch.daysUntilExpiry);
                return (
                  <div key={index} className="tracking-card" style={{ borderLeftColor: getExpiryColor(daysLeft) }}>
                    <div className="tracking-card-header">
                      <h3 className="tracking-card-title">{batch._id?.batchId}</h3>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: `${getExpiryColor(daysLeft)}20`,
                          color: getExpiryColor(daysLeft),
                        }}
                      >
                        {daysLeft} days left
                      </span>
                    </div>
                    <div className="tracking-card-content">
                      <div className="tracking-card-row">
                        <span className="tracking-card-label">Product:</span>
                        <span className="tracking-card-value">{batch.productName}</span>
                      </div>
                      <div className="tracking-card-row">
                        <span className="tracking-card-label">Expiry Date:</span>
                        <span className="tracking-card-value">
                          {new Date(batch.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="tracking-card-row">
                        <span className="tracking-card-label">Units at Risk:</span>
                        <span className="tracking-card-value" style={{ color: "#ef4444", fontWeight: 600 }}>
                          {batch.unitsAtRisk}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="tracking-empty-state">
              <div className="empty-icon">✅</div>
              <h3 className="empty-title">No Expiring Batches</h3>
              <p className="empty-text">All batches are within safe expiry dates.</p>
            </div>
          )}
        </div>
      )}

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="tracking-modal-overlay" onClick={() => setShowReceiveModal(false)}>
          <div className="tracking-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px" }}>
            <div className="tracking-modal-header">
              <h2>📦 Receive Shipment</h2>
              <button className="modal-close-btn" onClick={() => setShowReceiveModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleReceiveSubmit}>
              <div className="tracking-modal-body">
                <div className="tracking-form">
                  {/* Product Selection */}
                  <div className="form-group">
                    <label className="form-label">Product *</label>
                    <select
                      className="form-select"
                      value={receiveForm.productId}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      required
                    >
                      <option value="">Select a product...</option>
                      {products.map(product => (
                        <option key={product._id} value={product.productId}>
                          {product.productId} - {product.productName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Quantity *</label>
                      <input
                        type="number"
                        className="form-input"
                        min="1"
                        value={receiveForm.quantity}
                        onChange={(e) => setReceiveForm({ ...receiveForm, quantity: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Supplier Batch Number</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Supplier's batch number"
                        value={receiveForm.batchNumber}
                        onChange={(e) => setReceiveForm({ ...receiveForm, batchNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Supplier Info */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Supplier Order Number</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., SO2512170001"
                        value={receiveForm.supplierOrderNumber}
                        onChange={(e) => setReceiveForm({ ...receiveForm, supplierOrderNumber: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Supplier Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Supplier name"
                        value={receiveForm.supplierName}
                        onChange={(e) => setReceiveForm({ ...receiveForm, supplierName: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Manufacturing Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={receiveForm.manufacturingDate}
                        onChange={(e) => setReceiveForm({ ...receiveForm, manufacturingDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Expiry Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={receiveForm.expiryDate}
                        onChange={(e) => setReceiveForm({ ...receiveForm, expiryDate: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Initial Location */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Initial Zone</label>
                      <input
                        type="text"
                        className="form-input"
                        value={receiveForm.initialZone}
                        onChange={(e) => setReceiveForm({ ...receiveForm, initialZone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Initial Shelf/Location</label>
                      <input
                        type="text"
                        className="form-input"
                        value={receiveForm.initialShelf}
                        onChange={(e) => setReceiveForm({ ...receiveForm, initialShelf: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="tracking-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowReceiveModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  📦 Receive Items
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

export default BatchManagement;
