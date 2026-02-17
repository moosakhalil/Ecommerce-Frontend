// src/components/NonDeliveredOrders.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Search } from "lucide-react";
import Sidebar from "../Sidebar/sidebar";
import ModeToggle from "../Shared/ModeToggle";
import axios from "axios";
import { API_BASE_URL } from "../../utils/config";

const NonDeliveredOrders = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [showModeToggle, setShowModeToggle] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/complaints`);
        const complaintsData = res.data.complaints || [];

        const filteredOrders = complaintsData
          .filter(
            (o) =>
              o.complaint &&
              o.complaint.status &&
              o.complaint.issueTypes?.length > 0,
          )
          .map((o) => ({
            orderId: o.orderId,
            customer: o.customer,
            totalAmount: o.totalAmount,
            placedOn: new Date(o.orderDate).toLocaleDateString(),
            lastActivity: o.complaint?.reportedAt
              ? new Date(o.complaint.reportedAt).toLocaleString()
              : "N/A",
            status: o.complaint?.issueTypes[0] || "N/A",
          }));

        setOrders(filteredOrders);
      } catch (error) {
        console.error("Error fetching complaint orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleRefund = async (orderId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        status: "refund",
      });
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
      setMessage("Order has been marked as refund");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Refund error:", error);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-80" : ""
        } w-full bg-gray-50`}
      >
        {/* Top bar */}
        <header className="bg-purple-900 text-white p-4 flex justify-between items-center relative">
          <div className="flex items-center space-x-2">
            <Home className="w-5 h-5" />
            <h1 className="text-xl font-semibold">
              6. Non delivered orders or issues BEFORE DELIVERY
            </h1>
          </div>

          {/* Advanced & AI Mode Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowModeToggle(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold text-sm"
            >
              <span className="text-base">🚀</span>
              <span>Advanced</span>
            </button>
            <button
              onClick={() => setShowModeToggle(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold text-sm"
            >
              <span className="text-base">🤖</span>
              <span>AI</span>
            </button>
          </div>
        </header>

        {/* Mode Toggle Modal */}
        {showModeToggle && (
          <ModeToggle
            componentName="Non-Delivered Orders - Issue Management"
            onClose={() => setShowModeToggle(false)}
          />
        )}

        {/* Body */}
        <div className="p-4">
          {/* Message */}
          {message && (
            <div className="mb-4 text-green-600 font-medium">{message}</div>
          )}

          {/* Search */}
          <div className="relative max-w-md mb-6">
            <input
              type="text"
              placeholder="Search for order"
              className="w-full border border-gray-300 rounded-lg py-2 px-4 pr-10 focus:outline-none"
            />
            <Search className="w-5 h-5 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-amber-50">
                <tr>
                  {[
                    "Order ID",
                    "Customer",
                    "Amount",
                    "Placed on",
                    "Last activity",
                    "Status",
                    "Action",
                  ].map((col) => (
                    <th
                      key={col}
                      className="p-3 text-left text-sm font-medium text-gray-900"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr key={idx} className="border-t border-gray-200">
                    <td className="p-3 text-sm text-gray-700">
                      {order.orderId}
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      {order.customer}
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      ${order.totalAmount}
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      {order.placedOn}
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      {order.lastActivity}
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      {order.status}
                    </td>
                    <td className="p-3 text-sm text-gray-700 space-y-1">
                      <button
                        onClick={() =>
                          navigate(`/order-details/${order.orderId}`)
                        }
                        className="text-blue-500 underline"
                      >
                        View Details
                      </button>
                      <div>Contact customer</div>
                      <div
                        className="text-red-600 cursor-pointer"
                        onClick={() => handleRefund(order.orderId)}
                      >
                        Refund now / Replace
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NonDeliveredOrders;
