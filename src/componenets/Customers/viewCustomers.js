import React, { useState, useEffect } from "react";
import {
  Search,
  Edit,
  Lock,
  Trash,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/sidebar";

const CustomerPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState({ startDate: "", endDate: "" });
  const navigate = useNavigate();

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);
      if (dateFilter.startDate)
        params.append("startDate", dateFilter.startDate);
      if (dateFilter.endDate) params.append("endDate", dateFilter.endDate);

      const response = await fetch(
        `http://localhost:5000/api/customers?${params}`
      );
      if (!response.ok) throw new Error("Failed to fetch customers");

      const data = await response.json();
      setCustomers(data.customers || []);
      setTotalPages(data.totalPages || 0);
      setTotalCustomers(data.total || 0);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, pageSize, statusFilter]);

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (currentPage === 1) {
        fetchCustomers();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Handle date filter
  useEffect(() => {
    if (dateFilter.startDate || dateFilter.endDate) {
      setCurrentPage(1);
      fetchCustomers();
    }
  }, [dateFilter]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleBlockCustomer = async (customerId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to block this customer?"))
      return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/customers/${customerId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to block customer");

      fetchCustomers(); // Refresh the list
    } catch (err) {
      alert("Error blocking customer: " + err.message);
    }
  };

  const handleUnblockCustomer = async (customerId, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(
        `http://localhost:5000/api/customers/${customerId}/unblock`,
        {
          method: "PUT",
        }
      );
      if (!response.ok) throw new Error("Failed to unblock customer");

      fetchCustomers(); // Refresh the list
    } catch (err) {
      alert("Error unblocking customer: " + err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      "cart-not-paid": "bg-gray-100 text-gray-800",
      "order-confirmed": "bg-blue-100 text-blue-800",
      "order-complete": "bg-green-100 text-green-800",
      "order-refunded": "bg-red-100 text-red-800",
      blocked: "bg-red-100 text-red-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const isCustomerBlocked = (customer) => {
    return customer.conversationState === "blocked";
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div
          className={`transition-all duration-300 ${
            isSidebarOpen ? "lg:ml-80" : ""
          } w-full p-6`}
        >
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="animate-spin h-8 w-8 text-purple-600" />
            <span className="ml-2 text-lg">Loading customers...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-80" : ""
        } w-full p-6`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
              <p className="text-gray-600 mt-1">
                Total: {totalCustomers} customers
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchCustomers}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                <RefreshCw
                  className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                />
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    4
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-600 cursor-pointer"></div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={handleSearch}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </div>
            </div>

            {/* Status Filter */}
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="cart-not-paid">Cart Not Paid</option>
              <option value="order-confirmed">Order Confirmed</option>
              <option value="order-complete">Order Complete</option>
              <option value="order-refunded">Refunded</option>
              <option value="blocked">Blocked</option>
            </select>

            {/* Date Range Filter */}
            <div className="flex gap-2">
              <input
                type="date"
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={dateFilter.startDate}
                onChange={(e) =>
                  setDateFilter((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
              <input
                type="date"
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={dateFilter.endDate}
                onChange={(e) =>
                  setDateFilter((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              Error: {error}
            </div>
          )}

          {/* Customers Table */}
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500 text-sm">
                  <th className="py-4 pl-6 font-medium">CUSTOMER</th>
                  <th className="py-4 px-4 font-medium">PHONE NUMBER</th>
                  <th className="py-4 px-4 font-medium">ORDERS</th>
                  <th className="py-4 px-4 font-medium">TOTAL SPENT</th>
                  <th className="py-4 px-4 font-medium">STATUS</th>
                  <th className="py-4 px-4 font-medium">LAST INTERACTION</th>
                  <th className="py-4 pr-6 font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/customers/${customer._id}`)}
                  >
                    <td className="py-4 pl-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 mr-3 flex items-center justify-center text-white font-semibold">
                          {customer.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {customer.name || "Unknown"}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {customer.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {customer.phoneNumber || "N/A"}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-800">
                        {customer.totalOrders || 0}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-800">
                        {formatCurrency(customer.totalSpent)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          customer.currentOrderStatus
                        )}`}
                      >
                        {customer.currentOrderStatus?.replace(/-/g, " ") ||
                          "New"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-sm">
                      {formatDate(customer.lastInteraction)}
                    </td>
                    <td className="py-4 pr-6">
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/customers/${customer._id}/edit`);
                          }}
                          title="Edit customer"
                        >
                          <Edit size={16} />
                        </button>

                        {isCustomerBlocked(customer) ? (
                          <button
                            className="p-2 text-green-500 hover:text-green-600 rounded-lg hover:bg-green-50"
                            onClick={(e) =>
                              handleUnblockCustomer(customer._id, e)
                            }
                            title="Unblock customer"
                          >
                            <Lock size={16} />
                          </button>
                        ) : (
                          <button
                            className="p-2 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50"
                            onClick={(e) =>
                              handleBlockCustomer(customer._id, e)
                            }
                            title="Block customer"
                          >
                            <Lock size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {customers.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">No customers found.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing
                <select
                  className="mx-2 py-1 px-2 border border-gray-200 rounded focus:outline-none"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                of {totalCustomers} customers
              </div>
              <div className="flex items-center space-x-1">
                <button
                  className="p-2 border border-gray-200 rounded-l-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>

                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = Math.max(
                    1,
                    Math.min(currentPage - 2 + i, totalPages - 4 + i)
                  );
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      className={`px-3 py-2 border-t border-b border-r border-gray-200 ${
                        pageNum === currentPage
                          ? "bg-orange-500 text-white"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  className="p-2 border-t border-b border-r border-gray-200 rounded-r-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerPage;
