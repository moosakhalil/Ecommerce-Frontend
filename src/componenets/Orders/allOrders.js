// src/components/AllOrders.js
import React, { useState, useEffect } from "react";
import { Home, Filter } from "lucide-react";
import axios from "axios";

import Sidebar from "../Sidebar/sidebar";
import { API_BASE_URL } from "../../utils/config";

// Extended statuses including new ones from schema
const OrderStatusFilters = [
  { id: "cart-not-paid", label: "In cart (not paid)", color: "#ffd166" },
  { id: "order-made-not-paid", label: "Order made (unpaid)", color: "#ffb347" },
  { id: "pay-not-confirmed", label: "Paid (unconfirmed)", color: "#ffc38b" },
  { id: "order-confirmed", label: "Order confirmed", color: "#a9b6fb" },
  { id: "picking-order", label: "Picking from inventory", color: "#b0f2c2" },
  { id: "allocated-driver", label: "Allocated to driver", color: "#90cdf4" },
  { id: "on-way", label: "On the way", color: "#73b5e8" },
  { id: "driver-confirmed", label: "Driver confirmed", color: "#f4a593" },
  { id: "issue-driver", label: "Issue (driver)", color: "#ffa07a" },
  { id: "issue-customer", label: "Issue (customer)", color: "#ffb3a7" },
  { id: "complain-order", label: "Customer complaint", color: "#ff6b6b" },
  { id: "parcel-returned", label: "Parcel returned", color: "#ffb6ad" },
  { id: "customer-confirmed", label: "Customer confirmed", color: "#c084fc" },
  { id: "order-refunded", label: "Order refunded", color: "#e5e5e5" },
  { id: "refund", label: "Refund", color: "#d3d3d3" },
  { id: "order-complete", label: "Order complete", color: "#86efac" },
  { id: "order not picked", label: "Awaiting pickup", color: "#c084fc" },
  { id: "ready-to-pickup", label: "Ready to pickup", color: "#93c5fd" },
  { id: "order-not-pickedup", label: "Not picked up", color: "#fca5a5" },
  { id: "order-pickuped-up", label: "Picked up", color: "#bbf7d0" },
];

// Helper function to format date safely
const formatDate = (dateValue) => {
  if (!dateValue) return "N/A";

  try {
    const date = new Date(dateValue);
    // Check if date is valid
    if (isNaN(date.getTime())) return "N/A";

    return date.toLocaleString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return "N/A";
  }
};

export default function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (selectedFilters.length) {
        params.set("status", selectedFilters.join(","));
      }
      if (searchQuery) {
        params.set("search", searchQuery);
      }
      params.set("page", currentPage);
      params.set("limit", itemsPerPage);

      console.log("=== FRONTEND FETCHING ORDERS ===");
      console.log(
        "URL:",
        `${API_BASE_URL}/api/orders?${params}`
      );
      console.log("Filters:", selectedFilters);
      console.log("Search:", searchQuery);
      console.log("Page:", currentPage);

      try {
        // Fetch list of orders from the orders router
        const response = await axios.get(
          `${API_BASE_URL}/api/orders?${params}`
        );

        console.log("=== API RESPONSE ===");
        console.log("Response status:", response.status);
        console.log("Response data:", response.data);

        const { orders: fetchedOrders = [], total: fetchedTotal = 0 } =
          response.data;

        console.log("=== PROCESSED DATA ===");
        console.log("Orders count:", fetchedOrders.length);
        console.log("Total:", fetchedTotal);

        if (fetchedOrders.length > 0) {
          console.log("Sample order:", fetchedOrders[0]);
        }

        // The orders should already have customer info from the enhanced router
        setOrders(fetchedOrders);
        setTotal(typeof fetchedTotal === "number" ? fetchedTotal : 0);
      } catch (e) {
        console.error("=== FETCH ERROR ===", e);
        console.error("Error response:", e.response?.data);
        console.error("Error status:", e.response?.status);

        setError(
          `Failed to fetch orders: ${e.response?.data?.message || e.message}`
        );
        setOrders([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [selectedFilters, searchQuery, currentPage]);

  const toggleFilter = (id) => {
    setSelectedFilters((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setCurrentPage(1);
  };

  const getStatusInfo = (status) => {
    return (
      OrderStatusFilters.find((f) => f.id === status) || {
        label: status,
        color: "#gray-400",
      }
    );
  };

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
        <div className="bg-purple-900 text-white p-4 flex items-center">
          <Home className="mr-2" size={20} />
          <h1 className="text-xl font-semibold">3. All Orders</h1>
        </div>

        {/* Status Filters */}
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {OrderStatusFilters.map((f) => (
            <div
              key={f.id}
              onClick={() => toggleFilter(f.id)}
              className={`cursor-pointer flex items-center px-2 py-1 rounded text-sm transition-all ${
                selectedFilters.includes(f.id)
                  ? "ring-2 ring-green-500 shadow-md"
                  : ""
              }`}
              style={{ backgroundColor: f.color }}
            >
              <input
                type="checkbox"
                checked={selectedFilters.includes(f.id)}
                readOnly
                className="mr-2"
              />
              <span className="truncate">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Search and Controls */}
        <div className="flex space-x-4 mb-4">
          <input
            type="text"
            placeholder="Search by order id"
            className="flex-1 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
          />
          <button className="flex items-center px-3 py-2 border rounded hover:bg-gray-50">
            <Filter className="mr-2" size={16} />
            <span>Select dates</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">Loading orders...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Orders Table */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Order ID",
                    "Created",
                    "Customer",
                    "Phone",
                    "Total",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <React.Fragment key={o.orderId}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {o.orderId}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(o.orderDate || o.created || o.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {o.customer || o.customerName || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {o.phoneNumber || o.customerPhone || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          ${o.totalAmount}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {/* Main Status */}
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: getStatusInfo(o.status).color,
                                color: "#000",
                              }}
                            >
                              {getStatusInfo(o.status).label}
                            </span>

                            {/* Current Order Status (if different) */}
                            {o.currentOrderStatus &&
                              o.currentOrderStatus !== o.status && (
                                <span
                                  className="px-3 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: getStatusInfo(
                                      o.currentOrderStatus
                                    ).color,
                                    color: "#000",
                                  }}
                                >
                                  {getStatusInfo(o.currentOrderStatus).label}
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              setExpandedOrderId(
                                expandedOrderId === o.orderId ? null : o.orderId
                              )
                            }
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          >
                            {expandedOrderId === o.orderId ? "▼" : "▶"}
                          </button>
                        </td>
                      </tr>
                      {expandedOrderId === o.orderId && (
                        <tr className="bg-gray-50">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="space-y-4">
                              {/* Order Details */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Customer ID:
                                  </span>
                                  <span className="ml-2">{o.customerId}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Payment Method:
                                  </span>
                                  <span className="ml-2">
                                    {o.paymentMethod || "N/A"}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Payment Status:
                                  </span>
                                  <span className="ml-2">
                                    {o.paymentStatus || "N/A"}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Delivery Charge:
                                  </span>
                                  <span className="ml-2">
                                    ${o.deliveryCharge || 0}
                                  </span>
                                </div>
                              </div>

                              {/* Items Table */}
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Order Items
                                </h4>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="py-2 text-left">#</th>
                                      <th className="py-2 text-left">
                                        Product
                                      </th>
                                      <th className="py-2 text-left">Qty</th>
                                      <th className="py-2 text-left">
                                        Unit Price
                                      </th>
                                      <th className="py-2 text-left">
                                        Line Total
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(o.items || []).map((item, i) => (
                                      <tr key={i} className="border-b">
                                        <td className="py-2">{i + 1}</td>
                                        <td className="py-2">
                                          {item.productName}
                                        </td>
                                        <td className="py-2">
                                          {item.quantity}
                                        </td>
                                        <td className="py-2">${item.price}</td>
                                        <td className="py-2">
                                          ${item.totalPrice}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Delivery Address */}
                              {o.deliveryAddress && (
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Delivery Address:
                                  </span>
                                  <span className="ml-2">
                                    {typeof o.deliveryAddress === "object"
                                      ? `${o.deliveryAddress.street || ""} ${
                                          o.deliveryAddress.area || ""
                                        } ${
                                          o.deliveryAddress.city || ""
                                        }`.trim()
                                      : o.deliveryAddress}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && total > 0 && (
          <div className="flex justify-between items-center mt-4 bg-white px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, total)} of {total} orders
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm">
                Page {currentPage} of {Math.ceil(total / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage * itemsPerPage >= total}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
