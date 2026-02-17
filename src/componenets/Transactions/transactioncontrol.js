// src/components/views/TransactionControlView.jsx - FIXED VERSION
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/sidebar";
import ModeToggle from "../Shared/ModeToggle";
import {
  Home,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Phone,
  User,
  CreditCard,
  Building,
} from "lucide-react";
import { API_BASE_URL } from "../../utils/config";

export default function TransactionControlView() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ✅ FIX #1: ONLY show "pay-not-confirmed" orders by default
  const [selectedTypes, setSelectedTypes] = useState({
    "order-made-not-paid": false, // ✅ CHANGED: Disabled by default
    "pay-not-confirmed": true, // ✅ CHANGED: Enabled by default (ONLY this)
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModeToggle, setShowModeToggle] = useState(false);

  const getActiveTypes = () =>
    Object.entries(selectedTypes)
      .filter(([, on]) => on)
      .map(([t]) => t)
      .join(",");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      // Build query params - CORRECTED: Use currentOrderStatus for filtering
      const params = new URLSearchParams({
        currentOrderStatus: getActiveTypes(), // This filters by customer.currentOrderStatus
        search: searchQuery,
        page: String(page),
        limit: String(itemsPerPage),
      });

      console.log("=== TRANSACTION CONTROL FRONTEND DEBUG ===");
      console.log("Fetching orders with params:", params.toString());
      console.log(
        "Active types for currentOrderStatus filter:",
        getActiveTypes(),
      );

      try {
        const listRes = await fetch(`${API_BASE_URL}/api/orders?${params}`);

        console.log("Response status:", listRes.status);

        if (!listRes.ok) {
          throw new Error(`HTTP error! status: ${listRes.status}`);
        }

        const responseData = await listRes.json();
        const { orders: listOrders = [], total: listTotal = 0 } = responseData;

        console.log("=== TRANSACTION CONTROL RECEIVED DATA ===");
        console.log("Total orders:", listTotal);
        console.log("Orders array length:", listOrders.length);

        if (listOrders.length > 0) {
          console.log("Sample order structure:", listOrders[0]);
          console.log("Sample order fields:");
          console.log("- Customer:", listOrders[0].customer);
          console.log("- Phone:", listOrders[0].phoneNumber);
          console.log("- Status:", listOrders[0].status);
          console.log(
            "- CurrentOrderStatus:",
            listOrders[0].currentOrderStatus,
          );
          console.log("- Account Holder:", listOrders[0].accountHolderName);
          console.log("- Bank:", listOrders[0].paidBankName);
          console.log(
            "- Receipt Image:",
            listOrders[0].receiptImage ? "Present" : "Not present",
          );
        }

        // ⭐ SORT: Show all orders, with latest orders first (grouped by customer)
        const sortedOrders = [...listOrders].sort((a, b) => {
          const dateA = new Date(a.orderDate || a.created || 0);
          const dateB = new Date(b.orderDate || b.created || 0);
          return dateB - dateA; // Latest first
        });

        console.log("=== ALL ORDERS SORTED BY DATE (LATEST FIRST) ===");
        console.log("Total orders:", sortedOrders.length);

        // Orders should already have all required data from the fixed router
        setOrders(sortedOrders);
        setTotal(sortedOrders.length);
      } catch (error) {
        console.error("=== TRANSACTION CONTROL FETCH ERROR ===", error);
        setError(`Failed to fetch orders: ${error.message}`);
        setOrders([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [selectedTypes, searchQuery, page]);

  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="flex">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen((o) => !o)}
      />

      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "ml-80" : ""
        } flex-1 bg-gray-50 p-6`}
      >
        {/* Header */}
        <div className="mb-4 relative">
          <h1 className="text-2xl font-semibold flex items-center">
            <Home className="mr-2" size={24} /> <strong>2.</strong> Transaction
            Control
          </h1>
          <p className="text-gray-600 ml-9 mt-1">
            Filter and verify "Made order/not paid" & "Pay not confirmed" orders
          </p>

          {/* Advanced & AI Mode Buttons */}
          <div className="absolute top-0 right-0 flex gap-3">
            <button
              onClick={() => setShowModeToggle(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold text-sm"
            >
              <span className="text-lg">🚀</span>
              <span>Advanced</span>
            </button>
            <button
              onClick={() => setShowModeToggle(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold text-sm"
            >
              <span className="text-lg">🤖</span>
              <span>AI</span>
            </button>
          </div>
        </div>

        {/* Mode Toggle Modal */}
        {showModeToggle && (
          <ModeToggle
            componentName="Transaction Control - Payment Verification"
            onClose={() => setShowModeToggle(false)}
          />
        )}

        {/* Search */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by order ID"
              className="pl-10 pr-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="mb-4 flex space-x-3">
          <span className="text-sm font-medium">Filter by status:</span>
          {[
            ["order-made-not-paid", "Made order/not paid"],
            ["pay-not-confirmed", "Pay not confirmed"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() =>
                setSelectedTypes((prev) => ({ ...prev, [key]: !prev[key] }))
              }
              className={`px-4 py-1 text-sm rounded-full flex items-center transition-colors ${
                selectedTypes[key]
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {label}
              {selectedTypes[key] ? (
                <Check className="ml-2" size={14} />
              ) : (
                <X className="ml-2" size={14} />
              )}
            </button>
          ))}
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
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Orders Table */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500 text-sm">
                  <th className="py-3 px-4 font-medium">ORDER ID</th>
                  <th className="py-3 px-4 font-medium">CREATED</th>
                  <th className="py-3 px-4 font-medium">CUSTOMER</th>
                  <th className="py-3 px-4 font-medium">PHONE</th>
                  <th className="py-3 px-4 font-medium">ACCOUNT HOLDER</th>
                  <th className="py-3 px-4 font-medium">BANK</th>
                  <th className="py-3 px-4 font-medium">TOTAL</th>
                  <th className="py-3 px-4 font-medium">STATUS</th>
                  <th className="py-3 px-4 font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <CreditCard className="h-12 w-12 text-gray-300 mb-2" />
                        <p>No orders found for the selected criteria.</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try adjusting your filters or search terms.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <React.Fragment key={o.orderId}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-medium text-blue-600">
                          {o.orderId}
                        </td>
                        <td className="py-4 px-4 text-gray-600 text-sm">
                          {new Date(o.orderDate || o.created).toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <User className="mr-2 text-gray-400" size={16} />
                            <span className="font-medium text-gray-900">
                              {o.customer || o.customerName || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <Phone className="mr-2 text-gray-400" size={16} />
                            <span className="text-gray-700">
                              {o.phoneNumber || o.customerPhone || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <User className="mr-2 text-gray-400" size={14} />
                            <span className="text-sm text-gray-700">
                              {o.accountHolderName || "Not provided"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <Building
                              className="mr-2 text-gray-400"
                              size={14}
                            />
                            <span className="text-sm text-gray-700">
                              {o.paidBankName || "Not provided"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-medium text-green-600">
                          ${o.totalAmount}
                        </td>
                        <td className="py-4 px-4">
                          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm inline-flex items-center">
                            {o.status === "order-made-not-paid"
                              ? "Made order/not paid"
                              : o.status === "pay-not-confirmed"
                                ? "Pay not confirmed"
                                : o.status}
                            <ChevronDown className="ml-1" size={16} />
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {o.status === "pay-not-confirmed" && (
                              <button
                                onClick={() =>
                                  navigate(`/verification/${o.orderId}`)
                                }
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                Verify Payment
                              </button>
                            )}
                            <button
                              className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                              onClick={() =>
                                setExpandedOrder(
                                  expandedOrder === o.orderId
                                    ? null
                                    : o.orderId,
                                )
                              }
                            >
                              <ChevronRight
                                size={20}
                                className={`transform transition-transform ${
                                  expandedOrder === o.orderId ? "rotate-90" : ""
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedOrder === o.orderId && (
                        <tr className="bg-gray-50">
                          <td colSpan="9" className="px-4 py-4">
                            <div className="space-y-4">
                              {/* Order Details Header */}
                              <div className="border-b pb-3">
                                <h4 className="font-medium text-gray-900 mb-3">
                                  Order Details - {o.orderId}
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500 block">
                                      Customer:
                                    </span>
                                    <span className="font-medium">
                                      {o.customer || o.customerName}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block">
                                      Phone:
                                    </span>
                                    <span className="font-medium">
                                      {o.phoneNumber || o.customerPhone}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block">
                                      Payment Method:
                                    </span>
                                    <span className="font-medium">
                                      {o.paymentMethod || "N/A"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block">
                                      Transaction ID:
                                    </span>
                                    <span className="font-medium">
                                      {o.transactionId || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Payment Information */}
                              <div className="border-b pb-3">
                                <h5 className="font-medium text-gray-800 mb-2">
                                  Payment Information
                                </h5>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500 block">
                                      Account Holder:
                                    </span>
                                    <span className="font-medium">
                                      {o.accountHolderName || "Not provided"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block">
                                      Bank Name:
                                    </span>
                                    <span className="font-medium">
                                      {o.paidBankName || "Not provided"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block">
                                      Payment Status:
                                    </span>
                                    <span
                                      className={`font-medium ${
                                        o.paymentStatus === "paid"
                                          ? "text-green-600"
                                          : "text-orange-600"
                                      }`}
                                    >
                                      {o.paymentStatus || "Pending"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block">
                                      Receipt:
                                    </span>
                                    <span className="font-medium">
                                      {o.receiptImage
                                        ? "✅ Uploaded"
                                        : "❌ Not uploaded"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Order Items */}
                              <div>
                                <h5 className="font-medium text-gray-800 mb-2">
                                  Order Items
                                </h5>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm border border-gray-200 rounded">
                                    <thead className="bg-gray-100">
                                      <tr className="text-left text-gray-600">
                                        <th className="py-2 px-3">#</th>
                                        <th className="py-2 px-3">Product</th>
                                        <th className="py-2 px-3">Qty</th>
                                        <th className="py-2 px-3">
                                          Unit Price
                                        </th>
                                        <th className="py-2 px-3">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(o.items || []).map((item, i) => (
                                        <tr
                                          key={i}
                                          className="border-t border-gray-200"
                                        >
                                          <td className="py-2 px-3">{i + 1}</td>
                                          <td className="py-2 px-3 font-medium">
                                            {item.productName}
                                          </td>
                                          <td className="py-2 px-3">
                                            {item.quantity}
                                          </td>
                                          <td className="py-2 px-3">
                                            ${item.price}
                                          </td>
                                          <td className="py-2 px-3 font-medium">
                                            ${item.totalPrice}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                      <tr className="font-medium">
                                        <td
                                          colSpan="4"
                                          className="py-2 px-3 text-right"
                                        >
                                          Total Amount:
                                        </td>
                                        <td className="py-2 px-3 text-green-600">
                                          ${o.totalAmount}
                                        </td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              </div>

                              {/* Delivery Information */}
                              {o.deliveryAddress && (
                                <div>
                                  <h5 className="font-medium text-gray-800 mb-2">
                                    Delivery Information
                                  </h5>
                                  <div className="text-sm text-gray-600">
                                    <p>
                                      <span className="font-medium">
                                        Address:{" "}
                                      </span>
                                      {typeof o.deliveryAddress === "object"
                                        ? `${
                                            o.deliveryAddress.fullAddress || ""
                                          } ${
                                            o.deliveryAddress.area || ""
                                          }`.trim()
                                        : o.deliveryAddress}
                                    </p>
                                    {o.deliveryCharge > 0 && (
                                      <p className="mt-1">
                                        <span className="font-medium">
                                          Delivery Charge:{" "}
                                        </span>
                                        ${o.deliveryCharge}
                                      </p>
                                    )}
                                  </div>
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
          <div className="flex justify-between items-center bg-white px-4 py-3 border-t border-gray-200 mt-4 rounded-b-lg">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * itemsPerPage + 1}–
              {Math.min(page * itemsPerPage, total)} of {total} orders
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm px-3 py-1 bg-gray-100 rounded">
                Page {page} of {totalPages || 1}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
