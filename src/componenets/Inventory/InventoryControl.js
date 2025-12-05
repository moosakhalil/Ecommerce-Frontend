import React, { useState, useEffect } from "react";
import {
  Bell,
  Search as SearchIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit3,
  Save,
  RefreshCw,
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  Info,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";

export default function InventoryControlCheck() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [corrections, setCorrections] = useState({});
  const [checkStatus, setCheckStatus] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [successMessage, setSuccessMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingRow, setEditingRow] = useState(null);

  // Stock Correction Dialog State
  const [stockCorrectionDialog, setStockCorrectionDialog] = useState({
    show: false,
    productId: null,
    productName: "",
    originalStock: 0,
    correctedStock: 0,
    difference: 0,
    isIncrease: false,
    reason: "",
    customReason: "",
  });

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
        setError("API not available - Please check your connection");
        return;
      }

      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
        initializeStates(data.data);
        setError("");
      } else {
        setError(data.message || "Failed to fetch products");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Error fetching products: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Initialize correction values and status
  const initializeStates = (productData) => {
    const initialCorrections = {};
    const initialStatus = {};

    productData.forEach((product) => {
      initialCorrections[product._id] = product.Stock || 0;
      initialStatus[product._id] = "pending";
    });

    setCorrections(initialCorrections);
    setCheckStatus(initialStatus);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Get reorder threshold for a product
  const getReorderThreshold = (product) => {
    // Use AmountStockmintoReorder if available and useAmountStockmintoReorder is true
    if (product.useAmountStockmintoReorder && product.AmountStockmintoReorder) {
      return product.AmountStockmintoReorder;
    }
    // Fallback to AmountStockmintoReorder if available
    if (product.AmountStockmintoReorder) {
      return product.AmountStockmintoReorder;
    }
    // Default fallback
    return 5;
  };

  // Check if stock is low based on threshold
  const isLowStock = (product) => {
    const threshold = getReorderThreshold(product);
    return (product.Stock || 0) <= threshold;
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.productId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categories?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || checkStatus[product._id] === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Paginate products
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle correction input change
  const handleCorrectionChange = (productId, value) => {
    const numValue = parseInt(value) || 0;
    setCorrections((prev) => ({
      ...prev,
      [productId]: Math.max(numValue, 0),
    }));
  };

  // Mark as correct (no changes needed)
  const markAsCorrect = (productId) => {
    setCheckStatus((prev) => ({
      ...prev,
      [productId]: "correct",
    }));

    const product = products.find((p) => p._id === productId);
    setSuccessMessage(
      `✅ ${product?.productName} marked as correct - no changes needed`
    );
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Handle stock correction with reason dialog
  const handleStockCorrection = (productId) => {
    const product = products.find((p) => p._id === productId);
    const originalStock = product?.Stock || 0;
    const correctedStock = corrections[productId] || 0;
    const difference = correctedStock - originalStock;
    const isIncrease = difference > 0;

    setStockCorrectionDialog({
      show: true,
      productId,
      productName: product?.productName || "",
      originalStock,
      correctedStock,
      difference: Math.abs(difference),
      isIncrease,
      reason: "",
      customReason: "",
    });
  };

  // Apply stock correction with reason
  const applyStockCorrection = async () => {
    const { productId, correctedStock, reason, customReason, isIncrease } =
      stockCorrectionDialog;

    if (!reason) {
      alert("Please select a reason for the stock correction.");
      return;
    }

    if (reason === "Other" && !customReason.trim()) {
      alert("Please specify the custom reason.");
      return;
    }

    try {
      const possibleEndpoints = [
        `/api/products/correct-stock-with-reason/${productId}`,
        `/api/product/correct-stock-with-reason/${productId}`,
        `http://localhost:5000/api/products/correct-stock-with-reason/${productId}`,
        `http://localhost:3001/api/products/correct-stock-with-reason/${productId}`,
        `http://localhost:8000/api/products/correct-stock-with-reason/${productId}`,
      ];

      let response;
      let workingEndpoint = null;

      for (const endpoint of possibleEndpoints) {
        try {
          response = await fetch(endpoint, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Stock: correctedStock,
              reason: reason,
              customReason: reason === "Other" ? customReason : undefined,
              notes: `Stock corrected via inventory control check - Admin review on ${new Date().toLocaleDateString()}`,
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
                    Stock: correctedStock,
                    lostStock: data.data.totalLostStock || p.lostStock,
                  }
                : p
            )
          );

          setCheckStatus((prev) => ({
            ...prev,
            [productId]: "corrected",
          }));

          setSuccessMessage(data.message);
        } else {
          throw new Error(data.message || "Failed to update stock");
        }
      } else {
        // Simulate update for development
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId
              ? {
                  ...p,
                  Stock: correctedStock,
                }
              : p
          )
        );

        setCheckStatus((prev) => ({
          ...prev,
          [productId]: "corrected",
        }));

        const product = products.find((p) => p._id === productId);
        const difference = correctedStock - (product.Stock || 0);
        const diffText = difference > 0 ? `+${difference}` : `${difference}`;

        setSuccessMessage(
          `✅ Stock corrected for ${product.productName}: ${
            product.Stock || 0
          } → ${correctedStock} units (${diffText}) [Simulated - API not connected]`
        );
      }

      setEditingRow(null);
      closeStockCorrectionDialog();
      setTimeout(() => setSuccessMessage(""), 6000);
    } catch (err) {
      setError(`❌ Error updating stock: ${err.message}`);
      setTimeout(() => setError(""), 5000);
    }
  };

  // Close stock correction dialog
  const closeStockCorrectionDialog = () => {
    setStockCorrectionDialog({
      show: false,
      productId: null,
      productName: "",
      originalStock: 0,
      correctedStock: 0,
      difference: 0,
      isIncrease: false,
      reason: "",
      customReason: "",
    });
  };

  // Reset status to pending
  const resetStatus = (productId) => {
    setCheckStatus((prev) => ({
      ...prev,
      [productId]: "pending",
    }));

    const product = products.find((p) => p._id === productId);
    if (product) {
      setCorrections((prev) => ({
        ...prev,
        [productId]: product.Stock || 0,
      }));
    }

    setSuccessMessage(
      `🔄 ${product?.productName} status reset to pending review`
    );
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Get status badge
  const getStatusBadge = (productId) => {
    const status = checkStatus[productId];
    const originalStock = products.find((p) => p._id === productId)?.Stock || 0;
    const correctedStock = corrections[productId] || 0;
    const hasChange = originalStock !== correctedStock;

    switch (status) {
      case "correct":
        return (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-1">
              <CheckCircle size={16} />
              Verified Correct
            </span>
            <button
              onClick={() => resetStatus(productId)}
              className="text-gray-500 hover:text-gray-700"
              title="Reset to pending"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        );
      case "corrected":
        return (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-1">
              <Edit3 size={16} />
              Stock Corrected
            </span>
            <button
              onClick={() => resetStatus(productId)}
              className="text-gray-500 hover:text-gray-700"
              title="Reset to pending"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full flex items-center gap-1">
              <AlertCircle size={16} />
              Pending Review
            </span>
            {hasChange && (
              <span className="text-xs text-orange-600 font-medium">
                (Change: {originalStock} → {correctedStock})
              </span>
            )}
          </div>
        );
    }
  };

  // Get action buttons
  const getActionButtons = (productId) => {
    const status = checkStatus[productId];
    const originalStock = products.find((p) => p._id === productId)?.Stock || 0;
    const correctedStock = corrections[productId] || 0;
    const hasChange = originalStock !== correctedStock;
    const isIncrease = correctedStock > originalStock;

    if (status === "correct" || status === "corrected") {
      return (
        <button
          onClick={() => setEditingRow(productId)}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <Edit3 size={16} />
          Edit Again
        </button>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => markAsCorrect(productId)}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1 text-sm"
        >
          <CheckCircle size={14} />
          Mark Correct
        </button>
        {hasChange && (
          <button
            onClick={() => handleStockCorrection(productId)}
            className={`px-3 py-1 text-white rounded flex items-center gap-1 text-sm ${
              isIncrease
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {isIncrease ? (
              <TrendingUp size={14} />
            ) : (
              <AlertTriangle size={14} />
            )}
            {isIncrease ? "Apply Increase" : "Handle Reduction"}
          </button>
        )}
      </div>
    );
  };

  // Get increase/decrease reasons
  const getStockReasons = (isIncrease) => {
    if (isIncrease) {
      return [
        "New inventory received",
        "Supplier delivery",
        "Return from customer",
        "Manufacturing completion",
        "Transfer from other location",
        "Inventory adjustment",
        "Found missing items",
        "Quality control passed",
        "Other",
      ];
    } else {
      return [
        "Damaged goods",
        "Expired products",
        "Theft/Shrinkage",
        "Quality control rejection",
        "Inventory counting error",
        "Breakage during handling",
        "Weather/Environmental damage",
        "Customer returns",
        "Manufacturing defect",
        "Transfer to other location",
        "Other",
      ];
    }
  };

  // Calculate summary stats
  const totalProducts = filteredProducts.length;
  const pendingCount = Object.values(checkStatus).filter(
    (s) => s === "pending"
  ).length;
  const correctCount = Object.values(checkStatus).filter(
    (s) => s === "correct"
  ).length;
  const correctedCount = Object.values(checkStatus).filter(
    (s) => s === "corrected"
  ).length;
  const totalLostStock = products.reduce(
    (total, product) => total + (product.lostStock || 0),
    0
  );
  const lowStockCount = products.filter(isLowStock).length;

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
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-80" : ""
        } w-full bg-gray-50 p-4`}
      >
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

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">
              Inventory Control Check{" "}
              <span className="text-red-500 font-normal text-sm">
                (Admin Review & Stock Correction with Reason Tracking)
              </span>
            </h2>
            <div className="flex gap-4 mt-2 text-sm flex-wrap">
              <span className="text-yellow-600 font-medium">
                ⏳ Pending: {pendingCount}
              </span>
              <span className="text-green-600 font-medium">
                ✅ Correct: {correctCount}
              </span>
              <span className="text-blue-600 font-medium">
                📝 Corrected: {correctedCount}
              </span>
              <span className="text-red-600 font-medium">
                📉 Total Lost Stock: {totalLostStock} units
              </span>
              <span className="text-orange-600 font-medium">
                ⚠️ Low Stock: {lowStockCount} products
              </span>
              <span className="text-gray-600">
                Total Products: {products.length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="cursor-pointer" size={20} />
            <div className="w-8 h-8 bg-purple-500 rounded-full" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
          <div className="flex flex-1 max-w-md items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by ID, name, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <SearchIcon className="absolute right-3 top-1/2 -mt-2 text-gray-400" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="correct">Verified Correct</option>
              <option value="corrected">Stock Corrected</option>
            </select>
          </div>

          <div className="text-lg font-medium">
            Showing {totalProducts} products
          </div>

          <button
            onClick={fetchProducts}
            className="flex items-center px-3 py-2 border rounded bg-white hover:bg-gray-50"
          >
            <RefreshCw className="mr-2" size={16} />
            Refresh Data
          </button>
        </div>

        {/* Table */}
        <div className="relative overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Product ID",
                  "Product Name",
                  "Category",
                  "Price/Unit",
                  "Current Stock",
                  "Threshold",
                  "Lost Stock",
                  "Stock Correction",
                  "Action",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider whitespace-nowrap sticky right-0 bg-gray-50">
                  Review Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {paginatedProducts.map((product) => {
                const threshold = getReorderThreshold(product);
                const isProductLowStock = isLowStock(product);
                const originalStock = product.Stock || 0;
                const correctedStock = corrections[product._id] || 0;
                const hasChange = originalStock !== correctedStock;
                const isIncrease = correctedStock > originalStock;
                const lostStock = product.lostStock || 0;

                return (
                  <tr
                    key={product._id}
                    className={isProductLowStock ? "bg-red-50" : ""}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                      {product.productId || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {product.productName || "Unnamed Product"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {product.categories || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ${product.NormalPrice || "0.00"}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        isProductLowStock ? "text-red-600" : "text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {originalStock} units
                        {isProductLowStock && (
                          <AlertCircle
                            size={16}
                            className="text-red-500"
                            title="Low Stock Alert"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-600">
                          {threshold} units
                        </span>
                        <Info
                          size={14}
                          className="text-gray-400"
                          title={`Threshold source: ${
                            product.useAmountStockmintoReorder &&
                            product.AmountStockmintoReorder
                              ? "AmountStockmintoReorder"
                              : product.AmountStockmintoReorder
                              ? "AmountStockmintoReorder"
                              : "default"
                          }`}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            lostStock > 0 ? "text-red-600" : "text-gray-500"
                          }`}
                        >
                          {lostStock} units
                        </span>
                        {lostStock > 0 && (
                          <TrendingDown
                            size={16}
                            className="text-red-500"
                            title="Lost Stock"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={correctedStock}
                          onChange={(e) =>
                            handleCorrectionChange(product._id, e.target.value)
                          }
                          className={`w-20 text-center border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            hasChange
                              ? isIncrease
                                ? "border-blue-400 bg-blue-50"
                                : "border-red-400 bg-red-50"
                              : "border-gray-300"
                          }`}
                        />
                        <span className="text-xs text-gray-500">units</span>
                        {hasChange && (
                          <div className="flex items-center gap-1">
                            {isIncrease ? (
                              <TrendingUp
                                size={16}
                                className="text-blue-500"
                                title="Stock Increase Detected"
                              />
                            ) : (
                              <AlertTriangle
                                size={16}
                                className="text-orange-500"
                                title="Stock Reduction Detected"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getActionButtons(product._id)}
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4 whitespace-nowrap sticky right-0 bg-white">
                      {getStatusBadge(product._id)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-4 text-sm text-gray-600">
          <div className="flex items-center mb-2 md:mb-0">
            <span>Showing</span>
            <select
              className="mx-2 border rounded px-2 py-1"
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
            <span>of {filteredProducts.length} products</span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <ChevronLeft size={20} />
            </button>

            {[...Array(Math.ceil(filteredProducts.length / itemsPerPage))].map(
              (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded ${
                    currentPage === i + 1
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              )
            )}

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(
                    prev + 1,
                    Math.ceil(filteredProducts.length / itemsPerPage)
                  )
                )
              }
              disabled={
                currentPage ===
                Math.ceil(filteredProducts.length / itemsPerPage)
              }
              className="p-1 rounded hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Stock Correction Dialog */}
        {stockCorrectionDialog.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                {stockCorrectionDialog.isIncrease ? (
                  <TrendingUp className="text-blue-500 mr-3" size={28} />
                ) : (
                  <AlertTriangle className="text-orange-500 mr-3" size={28} />
                )}
                <h3 className="text-lg font-semibold">
                  Stock{" "}
                  {stockCorrectionDialog.isIncrease ? "Increase" : "Reduction"}{" "}
                  Detected
                </h3>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  You're{" "}
                  {stockCorrectionDialog.isIncrease ? "increasing" : "reducing"}{" "}
                  stock for <strong>{stockCorrectionDialog.productName}</strong>
                  :
                </p>
                <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Original Stock:</span>
                    <span className="font-medium">
                      {stockCorrectionDialog.originalStock} units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Corrected Stock:</span>
                    <span className="font-medium">
                      {stockCorrectionDialog.correctedStock} units
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span
                      className={`font-medium ${
                        stockCorrectionDialog.isIncrease
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {stockCorrectionDialog.isIncrease
                        ? "Stock Increase:"
                        : "Stock Reduction:"}
                    </span>
                    <span
                      className={`font-bold ${
                        stockCorrectionDialog.isIncrease
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {stockCorrectionDialog.difference} units
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Stock{" "}
                    {stockCorrectionDialog.isIncrease
                      ? "Increase"
                      : "Reduction"}{" "}
                    <span className="text-red-500">*</span>:
                  </label>
                  <select
                    value={stockCorrectionDialog.reason}
                    onChange={(e) =>
                      setStockCorrectionDialog((prev) => ({
                        ...prev,
                        reason: e.target.value,
                        customReason:
                          e.target.value !== "Other" ? "" : prev.customReason,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select reason...</option>
                    {getStockReasons(stockCorrectionDialog.isIncrease).map(
                      (reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {stockCorrectionDialog.reason === "Other" && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Specify other reason..."
                      value={stockCorrectionDialog.customReason}
                      onChange={(e) =>
                        setStockCorrectionDialog((prev) => ({
                          ...prev,
                          customReason: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeStockCorrectionDialog}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={applyStockCorrection}
                  className={`px-4 py-2 text-white rounded flex items-center gap-2 ${
                    stockCorrectionDialog.isIncrease
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-orange-500 hover:bg-orange-600"
                  }`}
                >
                  {stockCorrectionDialog.isIncrease ? (
                    <TrendingUp size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                  Confirm & Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
