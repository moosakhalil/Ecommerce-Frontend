import React, { useState, useEffect } from "react";
import {
  Bell,
  Home,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Package,
  Tag,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";

const statusStyles = {
  Expired: "bg-red-100 text-red-800 border-red-200",
  Active: "bg-green-100 text-green-800 border-green-200",
  Ongoing: "bg-green-100 text-green-800 border-green-200", // Alias for Active
  Scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  Disabled: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function DiscountedProductsInvA() {
  // State management
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Navigation handler (you can customize this based on your routing setup)
  const handleNavigation = (route) => {
    console.log(`Navigate to: ${route}`);
    // Replace with your actual navigation logic
    if (route === "/discount-inventory-check") {
      // Navigate to 73B component
      window.location.href = route;
    } else if (route === "/discount-inventory") {
      // Navigate to 73A component (current page, so just reload or stay)
      window.location.href = route;
    }
    // For React Router users, replace above with:
    // navigate(route);
  };

  // Status options for filter
  const statusOptions = ["All", "Active", "Expired", "Scheduled", "Disabled"];

  // Fetch discounted products from API
  const fetchDiscountedProducts = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
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

      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          console.log("✅ Received discounted products:", data);

          if (data.success) {
            setDiscountedProducts(data.data || []);
          } else {
            throw new Error(
              data.message || "Failed to fetch discounted products"
            );
          }
        } else {
          const text = await response.text();
          console.log("❌ Non-JSON response:", text.substring(0, 200));
          throw new Error(
            "Server returned HTML instead of JSON. Check if discount routes are properly configured."
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
    } catch (error) {
      console.error("❌ Error fetching discounted products:", error);

      if (error.message.includes("Failed to fetch")) {
        setErrorMessage(
          "Cannot connect to server. Make sure your server is running on port 5000."
        );
      } else if (error.message.includes("<!DOCTYPE")) {
        setErrorMessage(
          "Server returned HTML instead of JSON. Discount API routes may not be configured."
        );
      } else {
        setErrorMessage(`Failed to load discounted products: ${error.message}`);
      }

      setDiscountedProducts([]);
    } finally {
      setLoading(false);
    }
  };

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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "No end date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  // Format price display
  const formatPrice = (price) => {
    if (!price) return "N/A";
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Get discount code (using discount ID or generating one)
  const getDiscountCode = (product) => {
    if (product.discountConfig?.discountId) {
      return product.discountConfig.discountId;
    }
    return `DISC-${product.productId}`;
  };

  // Filter products based on search and status
  const getFilteredProducts = () => {
    return discountedProducts.filter((product) => {
      // Search filter
      const searchString = [
        product.productId,
        product.productName,
        getDiscountCode(product),
        product.discountConfig?.discountType,
        product.discountConfig?.discountTitle,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchString.includes(searchTerm.toLowerCase());

      // Status filter
      const productStatus = getProductStatus(product);
      const matchesStatus =
        statusFilter === "All" || productStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  // Paginate filtered results
  const getPaginatedProducts = () => {
    const filtered = getFilteredProducts();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      data: filtered.slice(startIndex, endIndex),
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    };
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  // Load products on component mount
  useEffect(() => {
    fetchDiscountedProducts();
  }, [statusFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const {
    data: paginatedProducts,
    total: totalProducts,
    totalPages,
  } = getPaginatedProducts();

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
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Package size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                73. Discounted Products Inventory A
              </h1>
              <p className="text-purple-100 text-sm">
                View and manage products with active discounts
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

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => handleNavigation("/discount-inventory")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Tag size={16} />
            <span>73 A - Inventory View</span>
          </button>
          <button
            onClick={() => handleNavigation("/discount-inventory-check")}
            className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold shadow-sm hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Package size={16} />
            <span>73 B - Check View</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="flex flex-1 max-w-md items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search products, codes, types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Search
                  className="absolute right-3 top-1/2 -mt-2 text-gray-400"
                  size={16}
                />
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

            {/* Filter Actions */}
            <div className="flex items-center gap-3">
              <button className="flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <span>Filter by date range</span>
                <ChevronDown className="ml-2" size={16} />
              </button>

              <button
                onClick={resetFilters}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Products", value: totalProducts, color: "purple" },
            {
              label: "Active",
              value: getFilteredProducts().filter(
                (p) => getProductStatus(p) === "Active"
              ).length,
              color: "green",
            },
            {
              label: "Expired",
              value: getFilteredProducts().filter(
                (p) => getProductStatus(p) === "Expired"
              ).length,
              color: "red",
            },
            {
              label: "Scheduled",
              value: getFilteredProducts().filter(
                (p) => getProductStatus(p) === "Scheduled"
              ).length,
              color: "blue",
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
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="animate-spin mr-2" size={20} />
              <span>Loading discounted products...</span>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <AlertCircle size={48} className="mb-4 text-gray-400" />
              <p className="text-lg">No discounted products found</p>
              <p className="text-sm">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Product ID",
                      "Product Name",
                      "Discount Code",
                      "Type",
                      "Quantity",
                      "New Price",
                      "Original Price",
                      "Savings",
                      "Status",
                      "End Date",
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedProducts.map((product, idx) => {
                    const status = getProductStatus(product);
                    const discountDetails = product.discountDetails || {};

                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-gray-50 transition-colors ${
                          idx % 2 ? "bg-gray-25" : "bg-white"
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {product.productId}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.productName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.categories || "No category"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-blue-600">
                          {getDiscountCode(product)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                          {product.discountConfig?.discountType || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {product.Stock || 0}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">
                          {formatPrice(product.discountConfig?.newPrice)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatPrice(product.discountConfig?.originalPrice)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-red-600">
                            -{discountDetails.discountPercentage || 0}%
                          </div>
                          <div className="text-xs text-gray-500">
                            ${discountDetails.discountAmount || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                              statusStyles[status] || statusStyles.Disabled
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatDate(product.discountConfig?.endDate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalProducts)} of{" "}
              {totalProducts} products
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
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
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
