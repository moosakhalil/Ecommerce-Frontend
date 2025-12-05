import React, { useState, useEffect } from "react";
import {
  Search,
  Home,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Eye,
  Filter,
  TrendingDown,
  Package,
  Settings,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";

export default function InventoryCheck() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const possibleEndpoints = [
        "/api/products",
        "/api/product",
        "http://localhost:5000/api/products",
        "http://localhost:3001/api/products",
        "http://localhost:8000/api/products",
      ];

      let response;
      let workingEndpoint = null;

      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          response = await fetch(endpoint);

          if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              workingEndpoint = endpoint;
              break;
            }
          }
        } catch (endpointError) {
          console.log(`Failed to reach ${endpoint}:`, endpointError.message);
          continue;
        }
      }

      if (!workingEndpoint) {
        setError("API not connected - Please check your server connection");
        setProducts([]);
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Transform data to include threshold calculations
        const transformedProducts = data.data.map((product) => {
          // Calculate the effective reorder threshold for this product
          let reorderThreshold = 5; // Default fallback
          let thresholdSource = "default";

          if (
            product.useAmountStockmintoReorder &&
            product.AmountStockmintoReorder
          ) {
            reorderThreshold = product.AmountStockmintoReorder;
            thresholdSource = "custom";
          } else if (product.AmountStockmintoReorder) {
            reorderThreshold = product.AmountStockmintoReorder;
            thresholdSource = "minimum";
          }

          return {
            ...product,
            sold: product.sold || 0,
            correctedStock: product.correctedStock || product.Stock || 0,
            reorderThreshold,
            thresholdSource,
          };
        });

        setProducts(transformedProducts);
        setError("");
      } else {
        setError(data.message || "Failed to fetch products");
        setProducts([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Error fetching products: ${err.message}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search, status, and stock using reorderThreshold
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchTerm === "" ||
      product.productId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categories?.toLowerCase().includes(searchTerm.toLowerCase());

    const currentStock = product.Stock || 0;
    const reorderThreshold = product.reorderThreshold || 5;

    const matchesStatus = (() => {
      if (statusFilter === "All") return true;
      if (statusFilter === "In Stock") return currentStock > reorderThreshold;
      if (statusFilter === "Out of Stock") return currentStock === 0;
      if (statusFilter === "Low Stock")
        return currentStock > 0 && currentStock <= reorderThreshold;
      if (statusFilter === "Critical")
        return currentStock <= Math.ceil(reorderThreshold * 0.5);
      return true;
    })();

    const matchesStockFilter = (() => {
      if (stockFilter === "All") return true;
      if (stockFilter === "0-10")
        return currentStock >= 0 && currentStock <= 10;
      if (stockFilter === "11-25")
        return currentStock >= 11 && currentStock <= 25;
      if (stockFilter === "26-50")
        return currentStock >= 26 && currentStock <= 50;
      if (stockFilter === "51+") return currentStock > 50;
      return true;
    })();

    return matchesSearch && matchesStatus && matchesStockFilter;
  });

  // Paginate filtered products
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Get stock status with reorderThreshold
  const getStockStatus = (product) => {
    const currentStock = product.Stock || 0;
    const reorderThreshold = product.reorderThreshold || 5;
    const criticalThreshold = Math.ceil(reorderThreshold * 0.5);

    if (currentStock === 0) {
      return {
        status: "Out of Stock",
        color: "text-red-700",
        bg: "bg-red-100",
        priority: "critical",
      };
    }

    if (currentStock <= criticalThreshold) {
      return {
        status: "Critical Low",
        color: "text-red-600",
        bg: "bg-red-50",
        priority: "critical",
      };
    }

    if (currentStock <= reorderThreshold) {
      return {
        status: "Low Stock",
        color: "text-orange-600",
        bg: "bg-orange-50",
        priority: "warning",
      };
    }

    return {
      status: "In Stock",
      color: "text-green-600",
      bg: "bg-green-50",
      priority: "good",
    };
  };

  // Get reorder alert with reorderThreshold
  const getOutOfStockAlert = (product) => {
    const currentStock = product.Stock || 0;
    const reorderThreshold = product.reorderThreshold || 5;
    const idealStock = reorderThreshold * 2;

    if (currentStock === 0) {
      return {
        message: `${idealStock} units needed`,
        urgency: "critical",
        color: "text-red-700 font-bold",
      };
    }

    if (currentStock < reorderThreshold) {
      const needed = idealStock - currentStock;
      return {
        message: `${needed} units recommended`,
        urgency: "warning",
        color: "text-orange-600 font-medium",
      };
    }

    return {
      message: "Stock OK",
      urgency: "good",
      color: "text-green-600",
    };
  };

  // Calculate summary statistics using reorderThreshold
  const totalProducts = products.length;
  const inStockCount = products.filter((p) => {
    const stock = p.Stock || 0;
    const threshold = p.reorderThreshold || 5;
    return stock > threshold;
  }).length;

  const lowStockCount = products.filter((p) => {
    const stock = p.Stock || 0;
    const threshold = p.reorderThreshold || 5;
    return stock > 0 && stock <= threshold;
  }).length;

  const outOfStockCount = products.filter((p) => (p.Stock || 0) === 0).length;
  const criticalCount = products.filter((p) => {
    const stock = p.Stock || 0;
    const threshold = p.reorderThreshold || 5;
    const critical = Math.ceil(threshold * 0.5);
    return stock <= critical;
  }).length;

  // Handle view details
  const handleViewDetails = (product) => {
    const stockStatus = getStockStatus(product);
    const alert = getOutOfStockAlert(product);
    const thresholdInfo =
      product.thresholdSource === "custom"
        ? `Custom threshold: ${product.reorderThreshold}`
        : `Threshold: ${product.reorderThreshold}`;

    setSuccessMessage(
      `📋 Viewing ${product.productName} - Status: ${stockStatus.status} | ${alert.message} | ${thresholdInfo}`
    );
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="animate-spin" size={24} />
          <span className="text-lg">Loading inventory data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-80" : ""
        } w-full bg-gray-100`}
      >
        {/* Header */}
        <header className="bg-gray-700 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Home size={20} />
            <span className="font-bold text-lg">Inventory Check</span>
            <span className="text-sm text-gray-300">
              ({filteredProducts.length} items)
            </span>
            {criticalCount > 0 && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                {criticalCount} Critical
              </span>
            )}
            <span className="text-xs text-blue-300 bg-blue-800 px-2 py-1 rounded-full">
              Smart Thresholds
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {outOfStockCount}
                </span>
              </div>
              <span className="absolute -bottom-6 -left-2 text-xs text-gray-300">
                Out of Stock
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-xs font-medium">JM</span>
              </div>
              <div>
                <p className="text-sm font-medium">Jack Miller</p>
                <p className="text-xs text-gray-300">Inventory Manager</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
              <CheckCircle className="mr-2 flex-shrink-0" size={20} />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
              <AlertCircle className="mr-2 flex-shrink-0" size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-lg font-medium text-gray-800 mb-2">
            Inventory Check with Smart Reorder Thresholds
          </h1>
          <p className="text-sm text-blue-600 mb-6">
            <Settings className="inline mr-1" size={16} />
            Using <strong>AmountStockmintoReorder</strong> for product-specific
            thresholds
            <span className="text-red-500 ml-2">
              (Staff verification and real-time inventory confirmation)
            </span>
          </p>

          {/* Enhanced Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {totalProducts}
                  </div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
                <Package className="text-blue-500" size={24} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {inStockCount}
                  </div>
                  <div className="text-sm text-gray-600">In Stock</div>
                </div>
                <CheckCircle className="text-green-500" size={24} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {lowStockCount}
                  </div>
                  <div className="text-sm text-gray-600">Low Stock</div>
                </div>
                <TrendingDown className="text-orange-500" size={24} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {outOfStockCount}
                  </div>
                  <div className="text-sm text-gray-600">Out of Stock</div>
                </div>
                <AlertCircle className="text-red-500" size={24} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {criticalCount}
                  </div>
                  <div className="text-sm text-gray-600">Critical Alert</div>
                </div>
                <AlertCircle className="text-purple-500" size={24} />
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Search */}
            <div className="relative w-full sm:w-1/3 md:w-1/4">
              <input
                type="text"
                placeholder="Search by ID, name, category..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                className="absolute left-3 top-3.5 text-gray-400"
                size={18}
              />
            </div>

            {/* Status Filter */}
            <div className="relative w-full sm:w-1/3 md:w-1/4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="All">
                  Status: All ({filteredProducts.length})
                </option>
                <option value="In Stock">✅ In Stock ({inStockCount})</option>
                <option value="Low Stock">
                  ⚠️ Low Stock ({lowStockCount})
                </option>
                <option value="Out of Stock">
                  ❌ Out of Stock ({outOfStockCount})
                </option>
                <option value="Critical">🚨 Critical ({criticalCount})</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
                size={18}
              />
            </div>

            {/* Stock Quantity Filter */}
            <div className="relative w-full sm:w-1/3 md:w-1/4">
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="All">Stock Range: All</option>
                <option value="0-10">0-10 units</option>
                <option value="11-25">11-25 units</option>
                <option value="26-50">26-50 units</option>
                <option value="51+">51+ units</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
                size={18}
              />
            </div>

            {/* Refresh Button */}
            <div className="relative w-full sm:w-1/3 md:w-1/4 ml-auto">
              <button
                onClick={fetchProducts}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white border rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md"
              >
                <RefreshCw className="mr-2" size={16} />
                Refresh Data
              </button>
            </div>
          </div>

          {/* Enhanced Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    {[
                      "Product ID",
                      "Product Name",
                      "Category",
                      "Price/Unit",
                      "Current Stock",
                      "Reorder Threshold",
                      "Units Sold",
                      "Stock Alert",
                      "Action",
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedProducts.map((product) => {
                    const stockStatus = getStockStatus(product);
                    const stockAlert = getOutOfStockAlert(product);
                    const currentStock = product.Stock || 0;
                    const reorderThreshold = product.reorderThreshold || 5;

                    return (
                      <tr
                        key={product._id}
                        className={`hover:bg-gray-50 transition-colors duration-150 ${stockStatus.bg}`}
                      >
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                          <div className="flex items-center gap-2">
                            {product.productId || "N/A"}
                            {stockStatus.priority === "critical" && (
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                            {product.thresholdSource === "custom" && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded">
                                Custom
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                          {product.productName || "Unnamed Product"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                            {product.categories || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                          ${(product.NormalPrice || 0).toLocaleString()}
                        </td>
                        <td
                          className={`px-6 py-4 text-sm font-bold ${stockStatus.color}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{currentStock}</span>
                            <span className="text-xs text-gray-500">units</span>
                            {stockStatus.priority === "critical" && (
                              <AlertCircle
                                size={16}
                                className="text-red-500 animate-pulse"
                              />
                            )}
                            {stockStatus.priority === "warning" && (
                              <AlertCircle
                                size={16}
                                className="text-orange-500"
                              />
                            )}
                          </div>
                          <div className="text-xs mt-1">
                            <span
                              className={`px-2 py-1 rounded-full ${stockStatus.bg} ${stockStatus.color}`}
                            >
                              {stockStatus.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-purple-600 font-medium">
                          <div className="flex items-center gap-2">
                            <Settings size={14} className="text-purple-500" />
                            <div>
                              <div className="font-bold text-lg">
                                {reorderThreshold}
                              </div>
                              <div className="text-xs text-gray-500">
                                {product.thresholdSource === "custom"
                                  ? "Custom"
                                  : "Default"}{" "}
                                threshold
                              </div>
                            </div>
                          </div>
                          {currentStock <= reorderThreshold && (
                            <div className="text-xs text-red-600 mt-1 font-medium">
                              ⚠️ Below threshold
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {product.sold || 0}
                            </span>
                            <span className="text-xs text-gray-500">units</span>
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 text-sm font-medium ${stockAlert.color}`}
                        >
                          <div className="flex items-center gap-2">
                            {stockAlert.urgency === "critical" && (
                              <AlertCircle
                                size={16}
                                className="animate-pulse"
                              />
                            )}
                            {stockAlert.urgency === "warning" && (
                              <TrendingDown size={16} />
                            )}
                            {stockAlert.urgency === "good" && (
                              <CheckCircle size={16} />
                            )}
                            <div>
                              <div>{stockAlert.message}</div>
                              {currentStock < reorderThreshold && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Target: {reorderThreshold * 2} units
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleViewDetails(product)}
                            className="flex items-center gap-2 text-blue-500 hover:text-blue-700 font-medium transition-colors duration-150"
                          >
                            <Eye size={16} />
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!paginatedProducts.length && (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-6 py-12 text-center text-sm text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <Filter size={48} className="text-gray-300 mb-4" />
                          <p className="text-lg font-medium text-gray-600 mb-2">
                            No items found
                          </p>
                          <p className="text-gray-400">
                            Try adjusting your search or filter criteria to find
                            more products.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Enhanced Pagination */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-3 sm:mb-0">
                <span className="text-sm text-gray-700 mr-2">Showing</span>
                <div className="relative">
                  <select
                    className="bg-white border border-gray-300 px-3 py-2 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    {[10, 20, 30, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-2 top-2.5 text-gray-400 pointer-events-none"
                    size={16}
                  />
                </div>
                <span className="text-sm text-gray-700 ml-2">
                  of {filteredProducts.length} items ({totalProducts} total)
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 border rounded-lg hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150"
                >
                  <ChevronLeft size={18} />
                </button>

                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-colors duration-150 ${
                        pageNum === currentPage
                          ? "bg-blue-500 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && (
                  <span className="text-gray-400 px-2">...</span>
                )}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 border rounded-lg hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
