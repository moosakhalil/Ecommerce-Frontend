import React, { useState, useEffect } from "react";
import {
  Bell,
  Home,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";

export default function AllDiscounts() {
  // State management

  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
    showDateFilter: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Status options for filter
  const statusOptions = ["All", "Active", "Expired", "Scheduled", "Disabled"];

  // Discount type options for filter
  const typeOptions = [
    "All",
    "clearance",
    "new product",
    "general discount",
    "discount specific amount",
    "above amount (discount)",
    "above amount (for free delivery)",
  ];

  // Fetch discounts from API
  const fetchDiscounts = async () => {
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
      if (typeFilter !== "All") {
        queryParams.append("discountType", typeFilter);
      }

      // Use dynamic URL based on your network setup
      const baseURL =
        window.location.hostname === "localhost"
          ? "http://localhost:5000"
          : `http://${window.location.hostname}:5000`;

      console.log(
        "🔍 Fetching discounts from:",
        `${baseURL}/api/products/discounts?${queryParams.toString()}`
      );

      const response = await fetch(
        `${baseURL}/api/products/discounts?${queryParams.toString()}`
      );

      console.log("📡 Response status:", response.status);
      console.log("📡 Response headers:", response.headers.get("content-type"));

      if (response.ok) {
        const contentType = response.headers.get("content-type");

        // Check if response is actually JSON
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          console.log("✅ Received data:", data);

          if (data.success) {
            setDiscounts(data.data || []);
          } else {
            throw new Error(data.message || "Failed to fetch discounts");
          }
        } else {
          // If not JSON, get the text to see what's being returned
          const text = await response.text();
          console.log("❌ Non-JSON response:", text.substring(0, 200));
          throw new Error(
            "Server returned HTML instead of JSON. Check if the discount routes are properly added."
          );
        }
      } else {
        // Handle different error status codes
        const text = await response.text();
        console.log("❌ Error response:", text.substring(0, 200));

        if (response.status === 404) {
          throw new Error(
            "Discount routes not found (404). Please add discount routes to your server."
          );
        } else if (response.status === 500) {
          throw new Error("Server error (500). Check server logs for details.");
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching discounts:", error);

      // Provide specific error messages
      if (error.message.includes("Failed to fetch")) {
        setErrorMessage(
          "Cannot connect to server. Make sure your server is running on port 5000 and CORS is enabled."
        );
      } else if (error.message.includes("<!DOCTYPE")) {
        setErrorMessage(
          "Server returned HTML instead of JSON. The discount API routes may not be properly configured."
        );
      } else {
        setErrorMessage(`Failed to load discounts: ${error.message}`);
      }

      // Set empty discounts array
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate discount status based on dates and active flag
  const getDiscountStatus = (discount) => {
    if (!discount.discountConfig?.isActive) {
      return "Disabled";
    }

    const now = new Date();
    const startDate = new Date(discount.discountConfig.startDate);
    const endDate = discount.discountConfig.endDate
      ? new Date(discount.discountConfig.endDate)
      : null;

    if (now < startDate) {
      return "Scheduled";
    }

    if (endDate && now > endDate) {
      return "Expired";
    }

    return "Active";
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-600 bg-green-50 border-green-200";
      case "Expired":
        return "text-red-600 bg-red-50 border-red-200";
      case "Scheduled":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "Disabled":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "No end date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format price display
  const formatPrice = (price, discountType) => {
    if (!price) return "N/A";

    if (discountType?.includes("percentage") || discountType?.includes("%")) {
      return `${price}%`;
    }

    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Filter discounts based on search and filters
  const getFilteredDiscounts = () => {
    return discounts.filter((discount) => {
      // Search filter
      const searchString = [
        discount.productId,
        discount.productName,
        discount.discountConfig?.discountType,
        discount.discountConfig?.forWho,
        discount.discountConfig?.discountTitle,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchString.includes(searchTerm.toLowerCase());

      // Status filter
      const discountStatus = getDiscountStatus(discount);
      const matchesStatus =
        statusFilter === "All" || discountStatus === statusFilter;

      // Type filter
      const matchesType =
        typeFilter === "All" ||
        discount.discountConfig?.discountType === typeFilter;

      // Date range filter
      let matchesDateRange = true;
      if (dateFilter.startDate || dateFilter.endDate) {
        const discountStartDate = new Date(discount.discountConfig?.startDate);
        const discountEndDate = discount.discountConfig?.endDate
          ? new Date(discount.discountConfig.endDate)
          : null;

        if (dateFilter.startDate) {
          const filterStartDate = new Date(dateFilter.startDate);
          matchesDateRange =
            matchesDateRange && discountStartDate >= filterStartDate;
        }

        if (dateFilter.endDate) {
          const filterEndDate = new Date(dateFilter.endDate);
          matchesDateRange =
            matchesDateRange &&
            (!discountEndDate || discountEndDate <= filterEndDate);
        }
      }

      return matchesSearch && matchesStatus && matchesType && matchesDateRange;
    });
  };

  // Paginate filtered results
  const getPaginatedDiscounts = () => {
    const filtered = getFilteredDiscounts();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      data: filtered.slice(startIndex, endIndex),
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    };
  };

  // Handle status update
  const handleStatusUpdate = async (productId, newStatus) => {
    try {
      const baseURL =
        window.location.hostname === "localhost"
          ? "http://localhost:5000"
          : `http://${window.location.hostname}:5000`;

      console.log(
        "🔄 Updating status for product:",
        productId,
        "to:",
        newStatus
      );

      const response = await fetch(
        `${baseURL}/api/products/${productId}/discount/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();

          if (data.success) {
            setSuccessMessage(
              `Discount ${newStatus.toLowerCase()} successfully`
            );
            fetchDiscounts(); // Refresh the list
          } else {
            throw new Error(data.message || "Failed to update status");
          }
        } else {
          const text = await response.text();
          console.log(
            "❌ Non-JSON response for status update:",
            text.substring(0, 200)
          );
          throw new Error("Server returned invalid response for status update");
        }
      } else {
        const text = await response.text();
        console.log("❌ Error updating status:", text.substring(0, 200));
        throw new Error(`Failed to update status: HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error updating status:", error);
      setErrorMessage(`Failed to update status: ${error.message}`);
    }

    setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 3000);
  };

  // Handle discount deletion
  const handleDeleteDiscount = async (productId, productName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the discount for "${productName}"?`
      )
    ) {
      return;
    }

    try {
      const baseURL =
        window.location.hostname === "localhost"
          ? "http://localhost:5000"
          : `http://${window.location.hostname}:5000`;

      console.log("🗑️ Deleting discount for product:", productId);

      const response = await fetch(
        `${baseURL}/api/products/${productId}/discount`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();

          if (data.success) {
            setSuccessMessage("Discount deleted successfully");
            fetchDiscounts(); // Refresh the list
          } else {
            throw new Error(data.message || "Failed to delete discount");
          }
        } else {
          const text = await response.text();
          console.log(
            "❌ Non-JSON response for delete:",
            text.substring(0, 200)
          );
          throw new Error(
            "Server returned invalid response for delete operation"
          );
        }
      } else {
        const text = await response.text();
        console.log("❌ Error deleting discount:", text.substring(0, 200));
        throw new Error(`Failed to delete discount: HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error deleting discount:", error);
      setErrorMessage(`Failed to delete discount: ${error.message}`);
    }

    setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 3000);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setTypeFilter("All");
    setDateFilter({
      startDate: "",
      endDate: "",
      showDateFilter: false,
    });
    setCurrentPage(1);
  };

  // Load discounts on component mount
  useEffect(() => {
    fetchDiscounts();
  }, [statusFilter, typeFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, dateFilter]);

  const {
    data: paginatedDiscounts,
    total: totalDiscounts,
    totalPages,
  } = getPaginatedDiscounts();

  return (
    <div className="flex min-h-screen">
      <div className="w-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4 transition-all duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Home size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">72. All Discounts</h1>
              <p className="text-purple-100 text-sm">
                Manage and monitor all product discounts
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchDiscounts}
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

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="flex flex-1 max-w-md items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search discounts, products, types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Search
                  className="absolute right-3 top-1/2 -mt-2 text-gray-400"
                  size={16}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
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

              {/* Type Filter */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {typeOptions.map((type) => (
                    <option key={type} value={type}>
                      Type:{" "}
                      {type === "All"
                        ? "All"
                        : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-2 top-1/2 -mt-2 text-gray-400"
                  size={16}
                />
              </div>

              {/* Date Range Toggle */}
              <button
                onClick={() =>
                  setDateFilter((prev) => ({
                    ...prev,
                    showDateFilter: !prev.showDateFilter,
                  }))
                }
                className="flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Calendar size={16} className="mr-2" />
                <span>Date Range</span>
                <ChevronDown
                  className={`ml-2 transition-transform ${
                    dateFilter.showDateFilter ? "rotate-180" : ""
                  }`}
                  size={16}
                />
              </button>

              {/* Reset Filters */}
              <button
                onClick={resetFilters}
                className="flex items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Filter size={16} className="mr-2" />
                Reset
              </button>
            </div>
          </div>

          {/* Date Range Filters */}
          {dateFilter.showDateFilter && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) =>
                      setDateFilter((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) =>
                      setDateFilter((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Discounts",
              value: totalDiscounts,
              color: "purple",
            },
            {
              label: "Active",
              value: getFilteredDiscounts().filter(
                (d) => getDiscountStatus(d) === "Active"
              ).length,
              color: "green",
            },
            {
              label: "Expired",
              value: getFilteredDiscounts().filter(
                (d) => getDiscountStatus(d) === "Expired"
              ).length,
              color: "red",
            },
            {
              label: "Scheduled",
              value: getFilteredDiscounts().filter(
                (d) => getDiscountStatus(d) === "Scheduled"
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
              <span>Loading discounts...</span>
            </div>
          ) : paginatedDiscounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <AlertCircle size={48} className="mb-4 text-gray-400" />
              <p className="text-lg">No discounts found</p>
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
                      "Discount ID",
                      "Product",
                      "Type",
                      "Target Audience",
                      "Original Price",
                      "New Price",
                      "Discount",
                      "Status",
                      "Start Date",
                      "End Date",
                      "Actions",
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
                  {paginatedDiscounts.map((discount, idx) => {
                    const status = getDiscountStatus(discount);
                    const discountDetails = discount.discountDetails || {};

                    return (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {discount.discountConfig?.discountId ||
                            `DISC-${discount.productId}`}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {discount.productName}
                            </div>
                            <div className="text-sm text-gray-500">
                              #{discount.productId}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                          {discount.discountConfig?.discountType || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                          {discount.discountConfig?.forWho || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatPrice(discount.discountConfig?.originalPrice)}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">
                          {formatPrice(discount.discountConfig?.newPrice)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-red-600">
                            -{discountDetails.discountPercentage || 0}%
                          </div>
                          <div className="text-xs text-gray-500">
                            Save ${discountDetails.discountAmount || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatDate(discount.discountConfig?.startDate)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatDate(discount.discountConfig?.endDate)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  discount._id,
                                  status === "Disabled" ? "Enabled" : "Disabled"
                                )
                              }
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title={
                                status === "Disabled" ? "Enable" : "Disable"
                              }
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteDiscount(
                                  discount._id,
                                  discount.productName
                                )
                              }
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
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
              {Math.min(currentPage * itemsPerPage, totalDiscounts)} of{" "}
              {totalDiscounts} discounts
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
                        ? "bg-purple-600 text-white border-purple-600"
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
