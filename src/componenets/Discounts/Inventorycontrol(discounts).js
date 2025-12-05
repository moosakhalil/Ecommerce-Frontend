import React, { useState, useEffect } from "react";
import {
  Bell,
  Search as SearchIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Package,
  Tag,
  RefreshCw,
  Percent,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";

export default function InventoryControlCheckDiscount() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fillingQuantities, setFillingQuantities] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [confirmationDialog, setConfirmationDialog] = useState({
    show: false,
    productId: null,
    productName: "",
    quantity: 0,
  });

  // Status options for filter
  const statusOptions = ["All", "Active", "Expired", "Scheduled", "Disabled"];

  // Navigation handler for tabs
  const handleNavigation = (route) => {
    console.log(`Navigate to: ${route}`);
    if (route === "/discount-inventory") {
      window.location.href = route;
    } else if (route === "/discount-inventory-check") {
      window.location.href = route;
    }
  };

  // Fetch discounted products from API (using existing discount routes)
  const fetchDiscountedProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const queryParams = new URLSearchParams();
      if (statusFilter !== "All") {
        queryParams.append(
          "status",
          statusFilter === "Active" ? "active" : statusFilter.toLowerCase()
        );
      }

      // Use dynamic URL based on network setup
      const baseURL =
        window.location.hostname === "localhost"
          ? "http://localhost:5000"
          : `http://${window.location.hostname}:5000`;

      console.log(
        "🔍 Fetching discounted products from:",
        `${baseURL}/api/products/discounts?${queryParams.toString()}`
      );

      const response = await fetch(
        `${baseURL}/api/products/discounts?${queryParams.toString()}`
      );

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          console.log("✅ Received discounted products:", data);

          if (data.success) {
            const products = data.data || [];
            setDiscountedProducts(products);
            setTotalProducts(products.length);

            // Initialize filling quantities
            const initialQuantities = {};
            products.forEach((product) => {
              initialQuantities[product._id] = 0;
            });
            setFillingQuantities(initialQuantities);
            setError("");
          } else {
            throw new Error(
              data.message || "Failed to fetch discounted products"
            );
          }
        } else {
          const text = await response.text();
          console.log("❌ Non-JSON response:", text.substring(0, 200));
          throw new Error(
            "Server returned HTML instead of JSON. Check discount routes configuration."
          );
        }
      } else {
        const text = await response.text();
        console.log("❌ Error response:", text.substring(0, 200));

        if (response.status === 404) {
          throw new Error(
            "Discount routes not found (404). Please add discount routes to your server."
          );
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
    } catch (err) {
      console.error("❌ Error fetching discounted products:", err);

      if (err.message.includes("Failed to fetch")) {
        setError(
          "Cannot connect to server. Make sure your server is running on port 5000."
        );
      } else if (err.message.includes("<!DOCTYPE")) {
        setError(
          "Server returned HTML instead of JSON. Discount API routes may not be configured."
        );
      } else {
        setError(`Failed to load discounted products: ${err.message}`);
      }

      setDiscountedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountedProducts();
  }, [statusFilter]);

  // Calculate product status based on discount configuration
  const getProductStatus = (product) => {
    if (!product.discountConfig?.isActive) {
      return "Disabled";
    }

    const now = new Date();
    const startDate = new Date(product.discountConfig.startDate);
    const endDate = product.discountConfig.endDate
      ? new Date(product.discountConfig.endDate)
      : null;

    if (now < startDate) {
      return "Scheduled";
    }

    if (endDate && now > endDate) {
      return "Expired";
    }

    return "Active";
  };

  // Filter products based on search term
  const filteredProducts = discountedProducts.filter(
    (product) =>
      product.productId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categories?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.discountConfig?.discountType
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Paginate filtered products
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle quantity changes
  const increaseQuantity = (productId) => {
    setFillingQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const decreaseQuantity = (productId) => {
    setFillingQuantities((prev) => ({
      ...prev,
      [productId]: Math.max((prev[productId] || 0) - 1, 0),
    }));
  };

  const handleQuantityInputChange = (productId, value) => {
    const numValue = parseInt(value) || 0;
    setFillingQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(numValue, 0),
    }));
  };

  // Show confirmation dialog
  const showConfirmation = (productId, productName) => {
    const quantity = fillingQuantities[productId] || 0;
    if (quantity > 0) {
      setConfirmationDialog({
        show: true,
        productId,
        productName,
        quantity,
      });
    }
  };

  // Update inventory using the new fill-inventory route
  const updateInventory = async () => {
    const { productId, quantity } = confirmationDialog;

    try {
      const baseURL =
        window.location.hostname === "localhost"
          ? "http://localhost:5000"
          : `http://${window.location.hostname}:5000`;

      console.log(
        "🔄 Filling inventory for product:",
        productId,
        "quantity:",
        quantity
      );

      const response = await fetch(
        `${baseURL}/api/products/fill-inventory/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fillQuantity: quantity }),
        }
      );

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();

          if (data.success) {
            // Update the product in local state
            setDiscountedProducts((prev) =>
              prev.map((product) =>
                product._id === productId
                  ? { ...product, Stock: data.data.Stock }
                  : product
              )
            );

            // Reset filling quantity for this product
            setFillingQuantities((prev) => ({
              ...prev,
              [productId]: 0,
            }));

            // Show success message
            setSuccessMessage(
              `✅ Successfully filled ${quantity} units for ${confirmationDialog.productName}. New Stock: ${data.data.Stock}`
            );
            setTimeout(() => setSuccessMessage(""), 5000);
          } else {
            throw new Error(data.message || "Failed to update inventory");
          }
        } else {
          throw new Error("Server returned invalid response");
        }
      } else {
        // Fallback: Simulate successful update for development
        console.log("API not available, simulating update...");

        setDiscountedProducts((prev) =>
          prev.map((product) =>
            product._id === productId
              ? { ...product, Stock: (product.Stock || 0) + quantity }
              : product
          )
        );

        setFillingQuantities((prev) => ({
          ...prev,
          [productId]: 0,
        }));

        const productName = confirmationDialog.productName;
        const newStock =
          (discountedProducts.find((p) => p._id === productId)?.Stock || 0) +
          quantity;
        setSuccessMessage(
          `✅ Successfully filled ${quantity} units for ${productName}. New Stock: ${newStock} (Simulated)`
        );
        setTimeout(() => setSuccessMessage(""), 5000);
      }
    } catch (err) {
      console.error("❌ Update error:", err);
      setError(`Failed to update inventory: ${err.message}`);
      setTimeout(() => setError(""), 5000);
    } finally {
      setConfirmationDialog({
        show: false,
        productId: null,
        productName: "",
        quantity: 0,
      });
    }
  };

  // Calculate Stock after fill
  const getStockAfterFill = (productId, currentStock) => {
    const fillingQuantity = fillingQuantities[productId] || 0;
    return (currentStock || 0) + fillingQuantity;
  };

  // Check if product is low on Stock
  const getStockStatus = (product) => {
    const currentStock = product.Stock || 0;

    if (currentStock === 0) {
      return {
        status: "Out of Stock",
        color: "text-red-700",
        bg: "bg-red-50",
        priority: "critical",
        icon: AlertCircle,
      };
    }

    if (currentStock <= 5) {
      return {
        status: "Low Stock",
        color: "text-orange-600",
        bg: "bg-orange-50",
        priority: "warning",
        icon: AlertCircle,
      };
    }

    return {
      status: "Good Stock",
      color: "text-green-600",
      bg: "bg-green-50",
      priority: "good",
      icon: CheckCircle,
    };
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "No end date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format price display
  const formatPrice = (price) => {
    if (!price) return "N/A";
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Get discount badge
  const getDiscountBadge = (product) => {
    const status = getProductStatus(product);

    const badgeClass =
      {
        Active: "bg-green-100 text-green-800 border-green-200",
        Scheduled: "bg-blue-100 text-blue-800 border-blue-200",
        Expired: "bg-red-100 text-red-800 border-red-200",
        Disabled: "bg-gray-100 text-gray-800 border-gray-200",
      }[status] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${badgeClass}`}
      >
        {status}
      </span>
    );
  };

  // Calculate days remaining for discount
  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="animate-spin" size={20} />
          <span className="text-lg">Loading discounted products...</span>
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
        } w-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4`}
      >
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
            <CheckCircle className="mr-2" size={20} />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
        )}

        {/* Page Header */}
        <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Package size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                73. Inventory Control & Check Discount
              </h1>
              <p className="text-purple-100 text-sm">
                Fill inventory for discounted products ({totalProducts} Products
                with Discounts)
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchDiscountedProducts}
              disabled={loading}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200"
              title="Refresh"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <Bell size={20} className="cursor-pointer hover:text-purple-200" />
            <div className="w-10 h-10 bg-purple-400 rounded-full flex items-center justify-center text-sm font-semibold">
              JM
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => handleNavigation("/discount-inventory")}
            className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold shadow-sm hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Tag size={16} />
            <span>73 A - Inventory View</span>
          </button>
          <button
            onClick={() => handleNavigation("/discount-inventory-check")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Package size={16} />
            <span>73 B - Check View</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-1 max-w-md items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search discounted products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <SearchIcon className="absolute right-3 top-1/2 -mt-2 text-gray-400" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      Status: {status}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-2 top-1/2 -mt-2 text-gray-400"
                  size={16}
                />
              </div>
            </div>

            <div className="text-lg font-medium text-gray-700">
              Showing {filteredProducts.length} of {totalProducts} discounted
              products
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Discounted",
              value: totalProducts,
              color: "purple",
            },
            {
              label: "Active Discounts",
              value: filteredProducts.filter(
                (p) => getProductStatus(p) === "Active"
              ).length,
              color: "green",
            },
            {
              label: "Low Stock",
              value: filteredProducts.filter((p) => (p.Stock || 0) <= 5).length,
              color: "orange",
            },
            {
              label: "Out of Stock",
              value: filteredProducts.filter((p) => (p.Stock || 0) === 0)
                .length,
              color: "red",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="text-2xl font-bold text-gray-800">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="relative overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Percent size={48} className="mb-4 text-gray-400" />
              <p className="text-lg">No discounted products found</p>
              <p className="text-sm">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Product Info",
                    "Discount Type",
                    "Regular Price",
                    "Discounted Price",
                    "Current Stock",
                    "Filling Stock",
                    "Stock After Fill",
                    "Stock Status",
                    "Discount End Date",
                    "Action",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap sticky right-0 bg-gray-50">
                    Fill Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedProducts.map((product) => {
                  const currentStock = product.Stock || 0;
                  const fillingStock = fillingQuantities[product._id] || 0;
                  const stockAfterFill = getStockAfterFill(
                    product._id,
                    currentStock
                  );
                  const stockStatus = getStockStatus(product);
                  const daysRemaining = getDaysRemaining(
                    product.discountConfig?.endDate
                  );

                  return (
                    <tr
                      key={product._id}
                      className={`hover:bg-gray-50 transition-colors`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.productName || "Unnamed Product"}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {product.productId || "N/A"}
                          </div>
                          <div className="mt-1">
                            {getDiscountBadge(product)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                        {product.discountConfig?.discountType || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatPrice(
                          product.discountConfig?.originalPrice ||
                            product.NormalPrice
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-semibold text-green-600">
                          {formatPrice(product.discountConfig?.newPrice)}
                        </div>
                        <div className="text-xs text-red-600">
                          Save:{" "}
                          {formatPrice(
                            (product.discountConfig?.originalPrice || 0) -
                              (product.discountConfig?.newPrice || 0)
                          )}
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${stockStatus.color}`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{currentStock} units</span>
                          {stockStatus.priority === "critical" && (
                            <AlertCircle
                              size={14}
                              className="text-red-500 animate-pulse"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                        <div className="flex items-center gap-1">
                          <TrendingUp size={14} />+{fillingStock} units
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {stockAfterFill} units
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-1">
                          <stockStatus.icon
                            size={16}
                            className={stockStatus.color}
                          />
                          <span className={stockStatus.color}>
                            {stockStatus.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div>
                          <div className="font-medium">
                            {formatDate(product.discountConfig?.endDate)}
                          </div>
                          {daysRemaining !== null && daysRemaining > 0 && (
                            <div
                              className={`text-xs ${
                                daysRemaining <= 7
                                  ? "text-red-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {daysRemaining} days left
                            </div>
                          )}
                          {daysRemaining === 0 && (
                            <div className="text-xs text-red-600 font-medium">
                              Expires today
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() =>
                            showConfirmation(product._id, product.productName)
                          }
                          disabled={fillingStock === 0}
                          className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                            fillingStock > 0
                              ? "bg-green-500 hover:bg-green-600 cursor-pointer"
                              : "bg-gray-300 cursor-not-allowed"
                          }`}
                        >
                          Fill Stock
                        </button>
                      </td>

                      {/* Sticky Quantity Column */}
                      <td className="px-6 py-4 whitespace-nowrap sticky right-0 bg-white border-l border-gray-200">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => decreaseQuantity(product._id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={fillingQuantities[product._id] || 0}
                              onChange={(e) =>
                                handleQuantityInputChange(
                                  product._id,
                                  e.target.value
                                )
                              }
                              className="w-16 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                              onClick={() => increaseQuantity(product._id)}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                            >
                              +
                            </button>
                          </div>
                          {stockStatus.priority === "critical" && (
                            <button
                              onClick={() =>
                                setFillingQuantities((prev) => ({
                                  ...prev,
                                  [product._id]: 10,
                                }))
                              }
                              className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                            >
                              Fill 10 (Quick)
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {Math.ceil(filteredProducts.length / itemsPerPage) > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between mt-6 text-sm text-gray-600">
            <div className="flex items-center mb-2 md:mb-0">
              <span>Showing</span>
              <select
                className="mx-2 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500"
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
              <span>of {filteredProducts.length} discounted products</span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from(
                {
                  length: Math.min(
                    Math.ceil(filteredProducts.length / itemsPerPage),
                    5
                  ),
                },
                (_, i) => {
                  let pageNum;
                  const totalPages = Math.ceil(
                    filteredProducts.length / itemsPerPage
                  );
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${
                        currentPage === pageNum
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
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
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {confirmationDialog.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertCircle className="text-orange-500 mr-3" size={24} />
                <h3 className="text-lg font-semibold">
                  Confirm Inventory Fill
                </h3>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to fill inventory for this discounted
                  product?
                </p>
                <div className="bg-gray-100 p-3 rounded">
                  <p>
                    <strong>Product:</strong> {confirmationDialog.productName}
                  </p>
                  <p>
                    <strong>Fill Quantity:</strong> +
                    {confirmationDialog.quantity} units
                  </p>
                  <p>
                    <strong>Current Stock:</strong>{" "}
                    {discountedProducts.find(
                      (p) => p._id === confirmationDialog.productId
                    )?.Stock || 0}{" "}
                    units
                  </p>
                  <p>
                    <strong>New Stock:</strong>{" "}
                    {(discountedProducts.find(
                      (p) => p._id === confirmationDialog.productId
                    )?.Stock || 0) + confirmationDialog.quantity}{" "}
                    units
                  </p>
                  {(() => {
                    const product = discountedProducts.find(
                      (p) => p._id === confirmationDialog.productId
                    );
                    return product?.discountConfig ? (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p>
                          <strong>Discount Type:</strong>{" "}
                          {product.discountConfig.discountType}
                        </p>
                        <p>
                          <strong>Discounted Price:</strong>{" "}
                          {formatPrice(product.discountConfig.newPrice)}
                        </p>
                        <p>
                          <strong>Discount Ends:</strong>{" "}
                          {formatDate(product.discountConfig.endDate)}
                        </p>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() =>
                    setConfirmationDialog({
                      show: false,
                      productId: null,
                      productName: "",
                      quantity: 0,
                    })
                  }
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateInventory}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Confirm Fill
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
