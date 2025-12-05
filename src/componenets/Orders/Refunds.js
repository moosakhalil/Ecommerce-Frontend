// src/components/RefundComplain.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, MoreVertical } from "lucide-react";
import Sidebar from "../Sidebar/sidebar";
import axios from "axios";

const RefundComplain = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [refunds, setRefunds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        // Dedicated refunds endpoint returns orders with status "refund"
        const res = await axios.get(
          "http://localhost:5000/api/refunds"
        );
        // API returns { refunds: [...] }
        const refundOrders = res.data.refunds || [];
        const cleaned = refundOrders.map((o) => ({
          orderId: o.orderId,
          customer: o.customer || "N/A",
          phoneNumber: o.phoneNumber ? o.phoneNumber.replace(/\D/g, "") : "N/A",
          totalAmount: o.totalAmount || 0,
        }));
        setRefunds(cleaned);
      } catch (error) {
        console.error("Error fetching refunds:", error);
      }
    };
    fetchRefunds();
  }, []);

  const totalRequests = refunds.length; // count of refund requests
  const totalAmount = `$${refunds.reduce(
    (sum, r) => sum + (r.totalAmount || 0),
    0
  )}`; // sum of refund amounts((sum, r) => sum + (r.totalAmount || 0), 0)}`;

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-80" : ""
        } w-full bg-gray-50`}
      >
        <header className="bg-purple-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Home className="w-5 h-5" />
            <h1 className="text-xl font-semibold">7. Refund Complain</h1>
          </div>
        </header>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm font-medium">Total refund request</div>
              <div className="mt-2 text-xl font-semibold">{totalRequests}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm font-medium">Total amount refunded</div>
              <div className="mt-2 text-xl font-semibold">{totalAmount}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow" />
          </div>

          <h2 className="text-lg font-semibold mb-2">All Refunds</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-amber-50">
                <tr>
                  <th className="p-3 text-left text-sm font-medium text-gray-900">
                    order id
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-gray-900">
                    Customer
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-gray-900">
                    Customer contact
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-gray-900">
                    Amount refunded
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((r, i) => (
                  <tr key={i} className="border-t border-gray-200">
                    <td className="p-3 text-sm text-gray-700">{r.orderId}</td>
                    <td className="p-3 text-sm text-gray-700">{r.customer}</td>
                    <td className="p-3 text-sm text-gray-700">
                      {r.phoneNumber}
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      ${r.totalAmount}
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      <div className="relative inline-block">
                        <MoreVertical
                          className="w-5 h-5 cursor-pointer"
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === r.orderId ? null : r.orderId
                            )
                          }
                        />
                        {openMenuId === r.orderId && (
                          <button
                            onClick={() =>
                              navigate(`/order-details/${r.orderId}`)
                            }
                            className="absolute top-6 left-0 bg-white border rounded shadow px-3 py-1 text-sm"
                          >
                            View details
                          </button>
                        )}
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

export default RefundComplain;
