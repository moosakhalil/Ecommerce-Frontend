import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  Filter,
  Search,
  Download,
  RefreshCw,
  MoreVertical,
  Calendar,
  User,
  MapPin,
  Phone,
  DollarSign,
  Plus,
  Users,
  ShoppingCart,
  MapPinIcon,
  Trash2,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

const AllOrdersComponent = () => {
  // State Management
  const [activeTab, setActiveTab] = useState("All Orders");
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    delivered: 0,
    cancelled: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "All Statuses",
    material: "All Materials",
    paymentMethod: "All Methods",
    sortBy: "orderDate",
    order: "desc",
    search: "",
    dateFrom: "",
    dateTo: "",
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Fetch functions
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (
          value &&
          value !== "All Statuses" &&
          value !== "All Materials" &&
          value !== "All Methods"
        ) {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/api/vendors/orders/all?${queryParams}`
      );
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setPagination(data.pagination || {});
      } else {
        console.error("Failed to fetch orders");
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchOrderStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendors/orders/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {});
      } else {
        console.error("Failed to fetch order stats");
      }
    } catch (error) {
      console.error("Error fetching order stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
  }, [fetchOrders, fetchOrderStats]);

  // Navigation handlers
  const navigateToVendorManagement = () => {
    window.location.href = "/vendor-dashboard";
  };

  const navigateToAddVendor = () => {
    window.location.href = "/add-vendor";
  };

  const navigateToAssignAreas = () => {
    window.location.href = "/assign-vendor-areas";
  };

  // Order operations
  const updateOrderStatus = async (orderId, newStatus, notes = "") => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/vendors/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            notes,
            updatedBy: "admin",
          }),
        }
      );

      if (response.ok) {
        alert(`Order status updated to ${newStatus}!`);
        fetchOrders();
        fetchOrderStats();
      } else {
        const error = await response.json();
        alert(`Failed to update order status: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/vendors/orders/${orderId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Order deleted successfully!");
        fetchOrders();
        fetchOrderStats();
      } else {
        const error = await response.json();
        alert(`Failed to delete order: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order. Please try again.");
    }
  };

  const exportOrders = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (
          value &&
          value !== "All Statuses" &&
          value !== "All Materials" &&
          value !== "All Methods"
        ) {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/api/vendors/orders/export?${queryParams}`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "orders.csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        alert("Orders exported successfully!");
      } else {
        alert("Failed to export orders");
      }
    } catch (error) {
      console.error("Error exporting orders:", error);
      alert("Failed to export orders. Please try again.");
    }
  };

  // Utility functions
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "confirmed":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "in_progress":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "ready":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "returned":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "order-complete":
        return "bg-green-100 text-green-800 border-green-200";
      case "order-confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "allocated-driver":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "cart-not-paid":
        return "bg-red-100 text-red-800 border-red-200";
      case "customer-confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "picking-order":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "on-way":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // Status update options
  const statusOptions = [
    { value: "pending", label: "Pending", color: "yellow" },
    { value: "assigned", label: "Assigned", color: "blue" },
    { value: "confirmed", label: "Confirmed", color: "indigo" },
    { value: "in_progress", label: "In Progress", color: "purple" },
    { value: "ready", label: "Ready", color: "cyan" },
    { value: "delivered", label: "Delivered", color: "green" },
    { value: "cancelled", label: "Cancelled", color: "red" },
    { value: "returned", label: "Returned", color: "gray" },
    { value: "order-complete", label: "Order Complete", color: "green" },
    { value: "order-confirmed", label: "Order Confirmed", color: "blue" },
    { value: "allocated-driver", label: "Allocated Driver", color: "purple" },
    { value: "cart-not-paid", label: "Cart Not Paid", color: "red" },
    {
      value: "customer-confirmed",
      label: "Customer Confirmed",
      color: "green",
    },
    { value: "picking-order", label: "Picking Order", color: "yellow" },
    { value: "on-way", label: "On Way", color: "blue" },
  ];

  const renderOrderCard = (order) => (
    <div
      key={order.orderId}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {order.orderId}
          </h3>
          <div className="flex items-center mt-1">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                order.status
              )}`}
            >
              {order.status}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              {formatDate(order.orderDate)}
            </span>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => {
              const dropdown = document.getElementById(
                `order-dropdown-${order.orderId}`
              );
              dropdown.classList.toggle("hidden");
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          <div
            id={`order-dropdown-${order.orderId}`}
            className="hidden absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
          >
            {statusOptions.map((statusOption) => (
              <button
                key={statusOption.value}
                onClick={() => {
                  updateOrderStatus(order.orderId, statusOption.value);
                  document
                    .getElementById(`order-dropdown-${order.orderId}`)
                    .classList.add("hidden");
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Mark as {statusOption.label}
              </button>
            ))}
            <hr className="my-1" />
            <button
              onClick={() => {
                deleteOrder(order.orderId);
                document
                  .getElementById(`order-dropdown-${order.orderId}`)
                  .classList.add("hidden");
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Order
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Items & Quantity</h4>
          <div className="space-y-1">
            {order.items && order.items.length > 0 ? (
              order.items.slice(0, 3).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center text-sm text-gray-600"
                >
                  <Package className="h-4 w-4 mr-2" />
                  {item.productName} - Qty: {item.quantity}
                </div>
              ))
            ) : (
              <div className="flex items-center text-sm text-gray-600">
                <Package className="h-4 w-4 mr-2" />
                No items specified
              </div>
            )}
            {order.items && order.items.length > 3 && (
              <div className="text-xs text-gray-500">
                +{order.items.length - 3} more items
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Customer</h4>
          <div className="space-y-1">
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-2" />
              {order.customerName || "N/A"}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              {order.customerPhone || "N/A"}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Delivery</h4>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {order.deliveryArea || "Not specified"}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Payment</h4>
          <div className="space-y-1">
            <div className="text-sm text-gray-600">
              Method: {order.paymentMethod || "N/A"}
            </div>
            {order.totalAmount && (
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-1" />
                {formatCurrency(order.totalAmount)}
              </div>
            )}
          </div>
        </div>
      </div>

      {order.assignedVendor && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Assigned Vendor</h4>
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2" />
            {order.assignedVendor.name}
            {order.assignedVendor.phone && (
              <span className="ml-2">({order.assignedVendor.phone})</span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                All Orders Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track all customer orders
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportOrders}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => {
                  fetchOrders();
                  fetchOrderStats();
                }}
                className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mb-6">
          <div className="flex space-x-1">
            <button
              className="px-4 py-2 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              onClick={navigateToVendorManagement}
            >
              <Users className="h-4 w-4 mr-2 inline" />
              Vendor Management
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              onClick={navigateToAddVendor}
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              Add New Vendor
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === "All Orders"
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <ShoppingCart className="h-4 w-4 mr-2 inline" />
              All Orders
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              onClick={navigateToAssignAreas}
            >
              <MapPinIcon className="h-4 w-4 mr-2 inline" />
              Assign Areas to Vendors
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.active}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.delivered}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.cancelled}
                </p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-900">
                Filters & Search
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All Statuses">All Statuses</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <select
                value={filters.paymentMethod}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    paymentMethod: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All Methods">All Methods</option>
                <option value="COD">Cash on Delivery</option>
                <option value="Card">Card Payment</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Wallet">Digital Wallet</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="From Date"
              />
            </div>

            {/* Date To */}
            <div>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="To Date"
              />
            </div>

            {/* Sort By */}
            <div>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="orderDate">Date Created</option>
                <option value="totalAmount">Order Amount</option>
                <option value="customerName">Customer Name</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          {/* Sort Order */}
          <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <select
                value={filters.order}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, order: e.target.value }))
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600">
                {filters.search ||
                filters.status !== "All Statuses" ||
                filters.paymentMethod !== "All Methods"
                  ? "No orders match your current filters"
                  : "No orders have been placed yet"}
              </p>
              {(filters.search ||
                filters.status !== "All Statuses" ||
                filters.paymentMethod !== "All Methods") && (
                <button
                  onClick={() =>
                    setFilters({
                      status: "All Statuses",
                      material: "All Materials",
                      paymentMethod: "All Methods",
                      sortBy: "orderDate",
                      order: "desc",
                      search: "",
                      dateFrom: "",
                      dateTo: "",
                      page: 1,
                      limit: 20,
                    })
                  }
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {orders.map(renderOrderCard)}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg mt-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>
                      Showing page {pagination.currentPage} of{" "}
                      {pagination.totalPages} ({pagination.totalOrders} total
                      orders)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                      }
                      disabled={!pagination.hasPrev}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded">
                      {pagination.currentPage}
                    </span>
                    <button
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                      }
                      disabled={!pagination.hasNext}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllOrdersComponent;
