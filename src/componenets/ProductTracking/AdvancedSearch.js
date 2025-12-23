import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/config";
import Sidebar from "../Sidebar/sidebar";
import "./ProductTracking.css";

const AdvancedSearch = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("search");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  
  // Search filters
  const [filters, setFilters] = useState({
    query: "",
    status: "",
    productId: "",
    batchId: "",
    zone: "",
    condition: "",
    supplierName: "",
    dateFrom: "",
    dateTo: "",
  });

  // Config data
  const [statuses, setStatuses] = useState([]);
  const [zones, setZones] = useState([]);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const [statusRes, zoneRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/tracking/config/statuses`),
        axios.get(`${API_BASE_URL}/api/tracking/config/zones`),
      ]);
      
      if (statusRes.data.success) setStatuses(statusRes.data.data);
      if (zoneRes.data.success) setZones(zoneRes.data.data);
    } catch (err) {
      console.error("Error fetching config:", err);
    }
  };

  const handleSearch = async (page = 1) => {
    setLoading(true);
    try {
      const searchParams = {
        query: filters.query,
        filters: {},
        dateRange: {},
        page,
        limit: 20,
      };

      if (filters.status) searchParams.filters.status = filters.status;
      if (filters.productId) searchParams.filters.productId = filters.productId;
      if (filters.batchId) searchParams.filters.batchId = filters.batchId;
      if (filters.zone) searchParams.filters.zone = filters.zone;
      if (filters.condition) searchParams.filters.condition = filters.condition;
      if (filters.supplierName) searchParams.filters.supplierName = filters.supplierName;
      if (filters.dateFrom) searchParams.dateRange.from = filters.dateFrom;
      if (filters.dateTo) searchParams.dateRange.to = filters.dateTo;

      const response = await axios.post(`${API_BASE_URL}/api/tracking/search`, searchParams);
      
      if (response.data.success) {
        setResults(response.data.data);
        setPagination(response.data.pagination);
        setActiveTab("results");
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      query: "",
      status: "",
      productId: "",
      batchId: "",
      zone: "",
      condition: "",
      supplierName: "",
      dateFrom: "",
      dateTo: "",
    });
    setResults([]);
  };

  const getStatusColor = (status) => {
    const statusItem = statuses.find(s => s.value === status);
    return statusItem?.color || "#6b7280";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className={`transition-all duration-300 ${isSidebarOpen ? "lg:ml-80" : ""} w-full`}>
        <div className="tracking-container">
          <div className="tracking-header">
            <h1>🔎 Advanced Search</h1>
          </div>

      {/* Tabs */}
      <div className="tracking-tabs">
        <button
          className={`tracking-tab ${activeTab === "search" ? "active" : ""}`}
          onClick={() => setActiveTab("search")}
        >
          🔍 Search
        </button>
        <button
          className={`tracking-tab ${activeTab === "results" ? "active" : ""}`}
          onClick={() => setActiveTab("results")}
        >
          📊 Results ({pagination.total})
        </button>
      </div>

      {/* Search Tab */}
      {activeTab === "search" && (
        <div className="tracking-section">
          <h2>Search Filters</h2>
          
          <div className="tracking-form">
            {/* Quick Search */}
            <div className="form-group">
              <label className="form-label">Quick Search</label>
              <input
                type="text"
                className="form-input"
                placeholder="Search by UTI, Product ID, Batch, or Serial Number..."
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              />
            </div>

            {/* Status & Zone */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">All Statuses</option>
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Warehouse Zone</label>
                <select
                  className="form-select"
                  value={filters.zone}
                  onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
                >
                  <option value="">All Zones</option>
                  {zones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product ID & Batch ID */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Product ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., P0001"
                  value={filters.productId}
                  onChange={(e) => setFilters({ ...filters, productId: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Batch ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., B250122"
                  value={filters.batchId}
                  onChange={(e) => setFilters({ ...filters, batchId: e.target.value })}
                />
              </div>
            </div>

            {/* Condition & Supplier */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Condition</label>
                <select
                  className="form-select"
                  value={filters.condition}
                  onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                >
                  <option value="">All Conditions</option>
                  <option value="new">New</option>
                  <option value="good">Good</option>
                  <option value="damaged">Damaged</option>
                  <option value="defective">Defective</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Supplier Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by supplier..."
                  value={filters.supplierName}
                  onChange={(e) => setFilters({ ...filters, supplierName: e.target.value })}
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">From Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">To Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button
                className="btn-primary"
                onClick={() => handleSearch(1)}
                disabled={loading}
              >
                {loading ? "Searching..." : "🔍 Search"}
              </button>
              <button className="btn-secondary" onClick={handleReset}>
                🔄 Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Tab */}
      {activeTab === "results" && (
        <div className="tracking-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ margin: 0 }}>Search Results ({pagination.total})</h2>
            <button className="btn-secondary" onClick={() => setActiveTab("search")}>
              ← Back to Search
            </button>
          </div>

          {results.length > 0 ? (
            <>
              <div className="tracking-table-container">
                <table className="tracking-table">
                  <thead>
                    <tr>
                      <th>UTI</th>
                      <th>Product</th>
                      <th>Batch</th>
                      <th>Status</th>
                      <th>Location</th>
                      <th>Condition</th>
                      <th>Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <a
                            href={`/tracking/scan?uti=${item.uti}`}
                            style={{ color: "#7c3aed", textDecoration: "none", fontWeight: 500 }}
                          >
                            {item.uti}
                          </a>
                        </td>
                        <td>
                          <div>
                            <strong>{item.productName}</strong>
                            <br />
                            <span style={{ color: "#6b7280", fontSize: "12px" }}>{item.productId}</span>
                          </div>
                        </td>
                        <td>{item.batchId}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: `${getStatusColor(item.currentStatus)}20`,
                              color: getStatusColor(item.currentStatus),
                            }}
                          >
                            {item.currentStatus?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td>
                          {item.currentLocation?.warehouseZone || "N/A"}
                          {item.currentLocation?.shelfLocation && (
                            <span style={{ color: "#6b7280" }}> - {item.currentLocation.shelfLocation}</span>
                          )}
                        </td>
                        <td style={{ textTransform: "capitalize" }}>{item.condition}</td>
                        <td>{formatDate(item.receivedDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="tracking-pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => handleSearch(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        className={`pagination-btn ${pagination.page === pageNum ? "active" : ""}`}
                        onClick={() => handleSearch(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    className="pagination-btn"
                    onClick={() => handleSearch(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="tracking-empty-state">
              <div className="empty-icon">🔍</div>
              <h3 className="empty-title">No Results Found</h3>
              <p className="empty-text">
                Try adjusting your search filters or search terms.
              </p>
              <button className="btn-primary" onClick={() => setActiveTab("search")}>
                Modify Search
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

export default AdvancedSearch;
