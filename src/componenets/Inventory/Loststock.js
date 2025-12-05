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
  TrendingDown,
  Package,
  Edit3,
  Save,
  Plus,
  Minus,
  Eye,
  Calendar,
  DollarSign,
  AlertTriangle,
  Info,
  X,
  Filter,
  BarChart3,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";

export default function LostStockManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, has-loss, no-loss
  const [sortBy, setSortBy] = useState("lostStock"); // lostStock, name, value
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Simplified Lost Stock Dialog State
  const [lostStockDialog, setLostStockDialog] = useState({
    show: false,
    productId: null,
    productName: "",
    currentLostStock: 0,
    addLostStock: 0,
    reason: "",
    customReason: "",
  });

  // Product Details Modal State
  const [detailsModal, setDetailsModal] = useState({
    show: false,
    product: null,
  });

  // Get threshold value for display only
  const getThresholdDisplay = (product) => {
    if (product.AmountStockmintoReorder) {
      return product.AmountStockmintoReorder;
    }
    if (product.minimumOrder) {
      return `${product.minimumOrder} (min)`;
    }
    return "Not Set";
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const possibleEndpoints = [
        "http://localhost:5000/api/products", // Try regular products endpoint first - should definitely have AmountStockmintoReorder
        "http://localhost:5000/api/products/lost-stock/summary", // Then try lost-stock summary
        "/api/products", // Relative path backups
        "/api/products/lost-stock/summary",
        "/api/product/lost-stock/summary",
        "/api/product",
      ];

      let response;
      let workingEndpoint = null;

      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`);
          response = await fetch(endpoint);

          if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              workingEndpoint = endpoint;
              console.log(`✅ Connected to: ${endpoint}`);
              break;
            }
          }
        } catch (endpointError) {
          console.log(`❌ Failed to reach ${endpoint}:`, endpointError.message);
          continue;
        }
      }

      if (!workingEndpoint) {
        setError(
          "API not available - Please check if your server is running on port 5000"
        );
        return;
      }

      const data = await response.json();
      console.log("🔍 Raw API Response:", data);

      if (data.success) {
        // Handle both lost-stock/summary response and regular products response
        let productsData = [];

        if (data.data && data.data.products) {
          // Lost stock summary response
          productsData = data.data.products;
          console.log("📊 Using lost-stock/summary endpoint");
        } else if (data.data && Array.isArray(data.data)) {
          // Regular products response - calculate lost stock values
          productsData = data.data.map((product) => ({
            ...product,
            totalLostStock: product.lostStock || 0,
            estimatedValue:
              (product.lostStock || 0) * (product.NormalPrice || 0),
          }));
          console.log("📦 Using regular products endpoint");
        } else {
          throw new Error("Unexpected API response format");
        }

        setProducts(productsData);
        setError("");

        // Enhanced debug logging to check AmountStockmintoReorder field
        console.log(`✅ Products loaded: ${productsData.length}`);

        // Check all products for AmountStockmintoReorder values
        const productsWithThreshold = productsData.filter(
          (p) => p.AmountStockmintoReorder
        );
        console.log(
          `🎯 Products with AmountStockmintoReorder: ${productsWithThreshold.length}/${productsData.length}`
        );

        if (productsWithThreshold.length > 0) {
          console.log(
            "🔍 Products with thresholds:",
            productsWithThreshold.map((p) => ({
              name: p.productName,
              AmountStockmintoReorder: p.AmountStockmintoReorder,
              useAmountStockmintoReorder: p.useAmountStockmintoReorder,
            }))
          );
        }

        // Show sample of first few products with all relevant fields
        console.log(
          "🔍 First 3 products with all fields:",
          productsData.slice(0, 3).map((p) => ({
            name: p.productName,
            AmountStockmintoReorder: p.AmountStockmintoReorder,
            useAmountStockmintoReorder: p.useAmountStockmintoReorder,
            minimumOrder: p.minimumOrder,
            Stock: p.Stock,
            lostStock: p.lostStock,
          }))
        );
      } else {
        setError(data.message || "Failed to fetch lost stock data");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Error fetching lost stock data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter((product) => {
      const matchesSearch =
        searchTerm === "" ||
        product.productId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categories?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = (() => {
        if (statusFilter === "all") return true;
        if (statusFilter === "has-loss")
          return (product.totalLostStock || 0) > 0;
        if (statusFilter === "no-loss")
          return (product.totalLostStock || 0) === 0;
        if (statusFilter === "high-value")
          return (product.estimatedValue || 0) > 5000;
        return true;
      })();

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "lostStock":
          return (b.totalLostStock || 0) - (a.totalLostStock || 0);
        case "value":
          return (b.estimatedValue || 0) - (a.estimatedValue || 0);
        case "name":
          return (a.productName || "").localeCompare(b.productName || "");
        default:
          return 0;
      }
    });

  // Paginate products
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

  // Handle lost stock update
  const handleLostStockUpdate = (product) => {
    const currentLost = product.totalLostStock || product.lostStock || 0;
    setLostStockDialog({
      show: true,
      productId: product._id,
      productName: product.productName,
      currentLostStock: currentLost,
      addLostStock: 0,
      reason: "",
      customReason: "",
    });
  };

  // Apply lost stock update
  const applyLostStockUpdate = async () => {
    const { productId, addLostStock, reason, customReason } = lostStockDialog;

    if (addLostStock <= 0) {
      alert("Please enter a valid amount of lost stock to add.");
      return;
    }

    if (!reason) {
      alert("Please select a reason for the lost stock.");
      return;
    }

    if (reason === "Other" && !customReason.trim()) {
      alert("Please specify the custom reason.");
      return;
    }

    try {
      const possibleEndpoints = [
        `http://localhost:5000/api/products/update-lost-stock/${productId}`, // Primary port 5000
        `/api/products/update-lost-stock/${productId}`, // Relative path backup
        `/api/product/update-lost-stock/${productId}`,
      ];

      let response;
      let workingEndpoint = null;

      const newTotalLostStock = lostStockDialog.currentLostStock + addLostStock;

      for (const endpoint of possibleEndpoints) {
        try {
          response = await fetch(endpoint, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lostStock: newTotalLostStock,
              reason: reason === "Other" ? customReason : reason,
              customReason: reason === "Other" ? customReason : undefined,
              notes: `Lost stock increased via Lost Stock Management - Added ${addLostStock} units. Reason: ${
                reason === "Other" ? customReason : reason
              }`,
            }),
          });

          if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              workingEndpoint = endpoint;
              break;
            }
          }
        } catch (endpointError) {
          continue;
        }
      }

      if (workingEndpoint) {
        const data = await response.json();
        if (data.success) {
          // Update local state with API response
          setProducts((prev) =>
            prev.map((p) =>
              p._id === productId
                ? {
                    ...p,
                    totalLostStock: data.data.newLostStock,
                    lostStock: data.data.newLostStock,
                    Stock: data.data.newStock,
                    estimatedValue:
                      data.data.newLostStock * (p.NormalPrice || 0),
                  }
                : p
            )
          );

          setSuccessMessage(
            `✅ Added ${addLostStock} units to lost stock for ${lostStockDialog.productName}. Total lost stock: ${lostStockDialog.currentLostStock} → ${newTotalLostStock} units. Current stock adjusted to ${data.data.newStock} units.`
          );
        } else {
          throw new Error(data.message || "Failed to update lost stock");
        }
      } else {
        // Simulate update for development
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId
              ? {
                  ...p,
                  totalLostStock: newTotalLostStock,
                  lostStock: newTotalLostStock,
                  Stock: Math.max(0, (p.Stock || 0) - addLostStock),
                  estimatedValue: newTotalLostStock * (p.NormalPrice || 0),
                }
              : p
          )
        );

        setSuccessMessage(
          `✅ Added ${addLostStock} units to lost stock for ${lostStockDialog.productName}. Total lost stock: ${lostStockDialog.currentLostStock} → ${newTotalLostStock} units [Simulated - API not connected]`
        );
      }

      closeLostStockDialog();
      setTimeout(() => setSuccessMessage(""), 6000);
    } catch (err) {
      setError(`❌ Error updating lost stock: ${err.message}`);
      setTimeout(() => setError(""), 5000);
    }
  };

  // Close lost stock dialog
  const closeLostStockDialog = () => {
    setLostStockDialog({
      show: false,
      productId: null,
      productName: "",
      currentLostStock: 0,
      addLostStock: 0,
      reason: "",
      customReason: "",
    });
  };

  // View product details
  const viewProductDetails = (product) => {
    setDetailsModal({
      show: true,
      product,
    });
  };

  // Calculate summary statistics
  const totalProducts = products.length;
  const productsWithLoss = products.filter(
    (p) => (p.totalLostStock || p.lostStock || 0) > 0
  ).length;
  const totalUnitsLost = products.reduce(
    (sum, p) => sum + (p.totalLostStock || p.lostStock || 0),
    0
  );
  const totalValueLost = products.reduce(
    (sum, p) =>
      sum +
      (p.estimatedValue ||
        (p.totalLostStock || p.lostStock || 0) * (p.NormalPrice || 0)),
    0
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="animate-spin" size={24} />
          <span className="text-lg">Loading lost stock data...</span>
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
        <header className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <TrendingDown size={24} />
            <div>
              <h1 className="font-bold text-xl">Lost Stock Management</h1>
              <p className="text-red-100 text-sm">
                Track, manage, and analyze inventory losses
              </p>
            </div>
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {productsWithLoss} Items with Loss
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-lg font-bold">
                ${totalValueLost.toLocaleString()}
              </div>
              <div className="text-xs text-red-100">Total Value Lost</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-red-300 flex items-center justify-center">
                <span className="text-xs font-medium text-red-800">JM</span>
              </div>
              <div>
                <p className="text-sm font-medium">Jack Miller</p>
                <p className="text-xs text-red-100">Loss Manager</p>
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    {totalProducts}
                  </div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
                <Package className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-red-600">
                    {productsWithLoss}
                  </div>
                  <div className="text-sm text-gray-600">Items with Loss</div>
                </div>
                <AlertTriangle className="text-red-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-orange-600">
                    {totalUnitsLost}
                  </div>
                  <div className="text-sm text-gray-600">Units Lost</div>
                </div>
                <TrendingDown className="text-orange-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    ${totalValueLost.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Value Lost</div>
                </div>
                <DollarSign className="text-green-500" size={32} />
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Search */}
            <div className="relative w-full sm:w-1/3 md:w-1/4">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                className="w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
              >
                <option value="all">
                  All Products ({filteredAndSortedProducts.length})
                </option>
                <option value="has-loss">
                  Has Lost Stock (
                  {
                    products.filter(
                      (p) => (p.totalLostStock || p.lostStock || 0) > 0
                    ).length
                  }
                  )
                </option>
                <option value="no-loss">
                  No Lost Stock (
                  {
                    products.filter(
                      (p) => (p.totalLostStock || p.lostStock || 0) === 0
                    ).length
                  }
                  )
                </option>
                <option value="high-value">High Value Loss ($5000+)</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
                size={18}
              />
            </div>

            {/* Sort */}
            <div className="relative w-full sm:w-1/3 md:w-1/4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
              >
                <option value="lostStock">Sort by Lost Stock</option>
                <option value="value">Sort by Lost Value</option>
                <option value="name">Sort by Name</option>
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
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white border rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md"
              >
                <RefreshCw className="mr-2" size={16} />
                Refresh Data
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    {[
                      "Product Info",
                      "Category",
                      "Current Stock",
                      "Threshold",
                      "Lost Stock",
                      "Est. Value Lost",
                      "Last Loss Date",
                      "Actions",
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
                    const lostStock =
                      product.totalLostStock || product.lostStock || 0;
                    const lostValue =
                      product.estimatedValue ||
                      lostStock * (product.NormalPrice || 0);
                    const hasLoss = lostStock > 0;
                    const threshold = getThresholdDisplay(product);
                    const lastLoss =
                      product.lostStockHistory?.length > 0
                        ? new Date(
                            Math.max(
                              ...product.lostStockHistory.map(
                                (h) => new Date(h.date)
                              )
                            )
                          )
                        : null;

                    return (
                      <tr
                        key={product._id}
                        className={`hover:bg-gray-50 transition-colors duration-150 ${
                          hasLoss ? "bg-red-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                hasLoss ? "bg-red-500" : "bg-green-500"
                              }`}
                            ></div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.productName || "Unnamed Product"}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {product.productId || "N/A"} | $
                                {(product.NormalPrice || 0).toLocaleString()}
                                /unit
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium capitalize">
                            {product.categories || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <Package size={16} className="text-gray-400" />
                            <span className="font-medium">
                              {product.Stock || 0} units
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-blue-600">
                              {threshold}
                            </span>
                            <span className="text-xs text-gray-500">units</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <TrendingDown
                              size={16}
                              className={
                                hasLoss ? "text-red-500" : "text-gray-400"
                              }
                            />
                            <span
                              className={`font-bold text-lg ${
                                hasLoss ? "text-red-600" : "text-gray-500"
                              }`}
                            >
                              {lostStock} units
                            </span>
                          </div>
                          {hasLoss && (
                            <div className="text-xs text-red-500 mt-1">
                              {product.lostStockHistory?.length || 0} loss
                              events
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <DollarSign
                              size={16}
                              className={
                                lostValue > 0 ? "text-red-500" : "text-gray-400"
                              }
                            />
                            <span
                              className={`font-bold ${
                                lostValue > 0 ? "text-red-600" : "text-gray-500"
                              }`}
                            >
                              ${lostValue.toLocaleString()}
                            </span>
                          </div>
                          {lostValue > 5000 && (
                            <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                              High Value Loss
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {lastLoss ? (
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-gray-400" />
                              <span>{lastLoss.toLocaleDateString()}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">No losses</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleLostStockUpdate(product)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-800 font-medium transition-colors duration-150"
                            >
                              <Edit3 size={16} />
                              Add Loss
                            </button>
                            <button
                              onClick={() => viewProductDetails(product)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150"
                            >
                              <Eye size={16} />
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!paginatedProducts.length && (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-12 text-center text-sm text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <Filter size={48} className="text-gray-300 mb-4" />
                          <p className="text-lg font-medium text-gray-600 mb-2">
                            No products found
                          </p>
                          <p className="text-gray-400">
                            Try adjusting your search or filter criteria.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-3 sm:mb-0">
                <span className="text-sm text-gray-700 mr-2">Showing</span>
                <div className="relative">
                  <select
                    className="bg-white border border-gray-300 px-3 py-2 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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
                  of {filteredAndSortedProducts.length} products (
                  {totalProducts} total)
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
                          ? "bg-red-500 text-white shadow-md"
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

          {/* Simplified Lost Stock Dialog */}
          {lostStockDialog.show && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <TrendingDown className="text-red-500 mr-3" size={28} />
                    <h3 className="text-lg font-semibold">Add Lost Stock</h3>
                  </div>
                  <button
                    onClick={closeLostStockDialog}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    Adding lost stock for{" "}
                    <strong>{lostStockDialog.productName}</strong>
                  </p>

                  <div className="space-y-4">
                    {/* Current Lost Stock Info */}
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Current Lost Stock:
                        </span>
                        <span className="font-medium text-red-600">
                          {lostStockDialog.currentLostStock} units
                        </span>
                      </div>
                    </div>

                    {/* Add Lost Stock Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Lost Stock <span className="text-red-500">*</span>:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={lostStockDialog.addLostStock}
                          onChange={(e) =>
                            setLostStockDialog((prev) => ({
                              ...prev,
                              addLostStock: Math.max(
                                0,
                                parseInt(e.target.value) || 0
                              ),
                            }))
                          }
                          className="flex-1 text-center border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Enter units to add"
                        />
                        <span className="text-sm text-gray-500">units</span>
                      </div>
                    </div>

                    {/* Reason Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Loss <span className="text-red-500">*</span>:
                      </label>
                      <select
                        value={lostStockDialog.reason}
                        onChange={(e) =>
                          setLostStockDialog((prev) => ({
                            ...prev,
                            reason: e.target.value,
                            customReason:
                              e.target.value !== "Other"
                                ? ""
                                : prev.customReason,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Select reason...</option>
                        <option value="Damaged goods">Damaged goods</option>
                        <option value="Expired products">
                          Expired products
                        </option>
                        <option value="Theft/Shrinkage">Theft/Shrinkage</option>
                        <option value="Quality control rejection">
                          Quality control rejection
                        </option>
                        <option value="Inventory counting error">
                          Inventory counting error
                        </option>
                        <option value="Breakage during handling">
                          Breakage during handling
                        </option>
                        <option value="Weather/Environmental damage">
                          Weather/Environmental damage
                        </option>
                        <option value="Manufacturing defect">
                          Manufacturing defect
                        </option>
                        <option value="Returned/Refunded items">
                          Returned/Refunded items
                        </option>
                        <option value="Customer returns">
                          Customer returns
                        </option>
                        <option value="Other">Other (Specify)</option>
                      </select>
                    </div>

                    {/* Custom Reason Input */}
                    {lostStockDialog.reason === "Other" && (
                      <div>
                        <input
                          type="text"
                          placeholder="Specify the reason for lost stock..."
                          value={lostStockDialog.customReason}
                          onChange={(e) =>
                            setLostStockDialog((prev) => ({
                              ...prev,
                              customReason: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    )}

                    {/* Preview New Total */}
                    {lostStockDialog.addLostStock > 0 && (
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <div className="flex justify-between">
                          <span className="text-sm text-red-700">
                            New Total Lost Stock:
                          </span>
                          <span className="font-bold text-red-600">
                            {lostStockDialog.currentLostStock +
                              lostStockDialog.addLostStock}{" "}
                            units
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeLostStockDialog}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyLostStockUpdate}
                    disabled={
                      !lostStockDialog.addLostStock || !lostStockDialog.reason
                    }
                    className={`px-4 py-2 text-white rounded flex items-center gap-2 transition-colors duration-150 ${
                      !lostStockDialog.addLostStock || !lostStockDialog.reason
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    <Save size={16} />
                    Add {lostStockDialog.addLostStock || 0} Lost Units
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product Details Modal */}
          {detailsModal.show && detailsModal.product && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Package className="text-blue-500 mr-3" size={28} />
                    <h3 className="text-lg font-semibold">
                      Product Details & Loss History
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      setDetailsModal({ show: false, product: null })
                    }
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Product Information */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold mb-3 flex items-center">
                    <Info className="mr-2" size={20} />
                    Product Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Product ID:
                      </span>
                      <p className="font-medium">
                        {detailsModal.product.productId || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Product Name:
                      </span>
                      <p className="font-medium">
                        {detailsModal.product.productName || "Unnamed"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Category:
                      </span>
                      <p className="font-medium capitalize">
                        {detailsModal.product.categories || "Uncategorized"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Price per Unit:
                      </span>
                      <p className="font-medium">
                        ${detailsModal.product.NormalPrice || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Current Stock:
                      </span>
                      <p className="font-medium">
                        {detailsModal.product.Stock || 0} units
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Reorder Threshold:
                      </span>
                      <p className="font-medium text-blue-600">
                        {getThresholdDisplay(detailsModal.product)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Total Lost Stock:
                      </span>
                      <p className="font-medium text-red-600">
                        {detailsModal.product.totalLostStock ||
                          detailsModal.product.lostStock ||
                          0}{" "}
                        units
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Stock Status:
                      </span>
                      <p className="font-medium text-gray-600">
                        {detailsModal.product.Stock || 0} units available
                      </p>
                    </div>
                  </div>
                </div>

                {/* Loss Summary */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold mb-3 flex items-center">
                    <BarChart3 className="mr-2" size={20} />
                    Loss Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <div className="text-2xl font-bold text-red-600">
                        {detailsModal.product.totalLostStock ||
                          detailsModal.product.lostStock ||
                          0}
                      </div>
                      <div className="text-sm text-red-700">
                        Total Units Lost
                      </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="text-2xl font-bold text-orange-600">
                        $
                        {(
                          detailsModal.product.estimatedValue ||
                          (detailsModal.product.totalLostStock ||
                            detailsModal.product.lostStock ||
                            0) * (detailsModal.product.NormalPrice || 0)
                        ).toLocaleString()}
                      </div>
                      <div className="text-sm text-orange-700">
                        Estimated Value Lost
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600">
                        {detailsModal.product.lostStockHistory?.length || 0}
                      </div>
                      <div className="text-sm text-purple-700">Loss Events</div>
                    </div>
                  </div>
                </div>

                {/* Loss History */}
                <div className="mb-4">
                  <h4 className="text-md font-semibold mb-3 flex items-center">
                    <Calendar className="mr-2" size={20} />
                    Loss History
                  </h4>
                  {detailsModal.product.lostStockHistory &&
                  detailsModal.product.lostStockHistory.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {detailsModal.product.lostStockHistory
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((entry, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <TrendingDown
                                  className="text-red-500"
                                  size={16}
                                />
                                <span className="font-medium text-red-600">
                                  {entry.amount} units lost
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(entry.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-sm space-y-1">
                              <div>
                                <strong>Reason:</strong> {entry.reason}
                              </div>
                              {entry.customReason && (
                                <div>
                                  <strong>Details:</strong> {entry.customReason}
                                </div>
                              )}
                              {entry.notes && (
                                <div>
                                  <strong>Notes:</strong> {entry.notes}
                                </div>
                              )}
                              <div>
                                <strong>Recorded by:</strong>{" "}
                                {entry.correctedBy || "System"}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <TrendingDown
                        size={48}
                        className="mx-auto mb-3 text-gray-300"
                      />
                      <p>No loss history recorded for this product</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() =>
                      setDetailsModal({ show: false, product: null })
                    }
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
