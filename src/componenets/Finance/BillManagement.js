import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/sidebar";
import ModeToggle from "../Shared/ModeToggle";
import { API_BASE_URL } from "../../utils/config";
import { Eye, Printer, X } from "lucide-react";

const BillManagement = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null); // For Modal
  const [showModeToggle, setShowModeToggle] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bills`);
      const data = await response.json();

      if (data.success) {
        setBills(data.data);
      } else {
        setError(data.message || "Failed to fetch bills");
      }
    } catch (err) {
      console.error("Error fetching bills:", err);
      setError("Network error or server unreachable");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Modern Invoice Modal Layout
  const BillModal = ({ bill, onClose }) => {
    if (!bill) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Invoice Details
              </h2>
              <p className="text-sm text-gray-500">#{bill.orderId}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Print Invoice"
              >
                <Printer size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Modal Content - Invoice Design */}
          <div className="p-8 flex-1">
            {/* Invoice Header */}
            <div className="flex justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  INVOICE
                </h1>
                <div className="text-sm text-gray-600">
                  <p className="font-semibold">Billed To:</p>
                  <p className="text-lg text-gray-800">{bill.customerName}</p>
                  {/* Add address if available in items/bill */}
                </div>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  <span className="text-gray-600 block text-xs uppercase tracking-wide">
                    Invoice Number
                  </span>
                  <span className="font-bold text-gray-800">
                    {bill.orderId}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="text-gray-600 block text-xs uppercase tracking-wide">
                    Date
                  </span>
                  <span className="font-bold text-gray-800">
                    {formatDate(bill.date)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block text-xs uppercase tracking-wide">
                    Status
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold inline-block mt-1 ${
                      bill.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : bill.status.includes("paid") ||
                            bill.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {bill.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 text-sm font-bold text-gray-600 uppercase">
                    Description
                  </th>
                  <th className="text-center py-3 text-sm font-bold text-gray-600 uppercase">
                    Qty
                  </th>
                  <th className="text-right py-3 text-sm font-bold text-gray-600 uppercase">
                    Price
                  </th>
                  <th className="text-right py-3 text-sm font-bold text-gray-600 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-4 text-gray-800">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-gray-500">{item.productId}</p>
                    </td>
                    <td className="py-4 text-center text-gray-800">
                      {item.quantity}
                    </td>
                    <td className="py-4 text-right text-gray-800">
                      {item.price ? formatCurrency(item.price) : "-"}
                    </td>
                    <td className="py-4 text-right text-gray-800 font-medium">
                      {item.price
                        ? formatCurrency(item.price * item.quantity)
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(bill.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Tax / VAT</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(0)}
                  </span>
                </div>
                <div className="flex justify-between py-4 border-t-2 border-gray-800 mt-2">
                  <span className="text-xl font-bold text-gray-800">Total</span>
                  <span className="text-xl font-bold text-indigo-600">
                    {formatCurrency(bill.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Receipt Image Section */}
            {bill.receiptImage ? (
              <div className="mt-8 pt-8 border-t border-gray-200 break-inside-avoid">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Payment Receipt / Proof
                </h3>
                <div className="border rounded-lg p-2 bg-gray-50 inline-block">
                  {/* Handle Base64 or URL */}
                  <img
                    src={(() => {
                      const img = bill.receiptImage;
                      // Get the raw data string (legacy 'data' field, 'base64Data', or direct string)
                      const rawData =
                        img?.base64Data ||
                        img?.data ||
                        (typeof img === "string" ? img : "");

                      if (!rawData || typeof rawData !== "string") return "";

                      // If it's already a URL or Data URI, return it
                      if (
                        rawData.startsWith("http") ||
                        rawData.startsWith("data:")
                      )
                        return rawData;

                      // Otherwise, reconstruct Data URI: default to jpeg since user data starts with /9j/
                      const contentType = img?.contentType || "image/jpeg";
                      return `data:${contentType};base64,${rawData}`;
                    })()}
                    alt="Receipt"
                    className="max-h-96 object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23f3f4f6%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20dy%3D%22.3em%22%20text-anchor%3D%22middle%22%3EImage%20Load%20Failed%3C%2Ftext%3E%3C%2Fsvg%3E";
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-gray-500 italic text-sm">
                  No payment receipt image available for this record.
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-6 bg-gray-50 border-t flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      {/* Correct Layout Wrapper for Sidebar Compatibility */}
      <div className="flex-1 flex flex-col overflow-hidden w-full transition-all duration-300 lg:ml-80">
        {/* Note: If sidebar is fixed, we might need lg:ml-80, but based on recent fix, standard flex structure usually works. 
            I will use the SalesData fix structure: flex-1 flex flex-col overflow-hidden */}

        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  <strong>251.</strong> Bill Management & History
                </h1>
                <p className="text-gray-600">
                  View and manage all customer invoices and receipts
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowModeToggle(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-1.5"
                >
                  <span>🚀</span>
                  <span>Advanced</span>
                </button>
                <button
                  onClick={() => setShowModeToggle(true)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-1.5"
                >
                  <span>🤖</span>
                  <span>AI</span>
                </button>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                <span className="text-sm text-gray-500">Total Bills: </span>
                <span className="font-bold text-indigo-600">
                  {bills.length}
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bill No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bills.length > 0 ? (
                        bills.map((bill) => (
                          <tr
                            key={bill.orderId}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                              {bill.orderId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(bill.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {bill.customerName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  bill.status === "paid" ||
                                  bill.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : bill.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {bill.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                              {formatCurrency(bill.totalAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                              <button
                                onClick={() => setSelectedBill(bill)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors border border-indigo-200"
                              >
                                <Eye size={16} />
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-10 text-center text-gray-500"
                          >
                            No bills found in the system.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {selectedBill && (
        <BillModal bill={selectedBill} onClose={() => setSelectedBill(null)} />
      )}

      {showModeToggle && (
        <ModeToggle
          componentName="Bill Management"
          onClose={() => setShowModeToggle(false)}
        />
      )}
    </div>
  );
};

export default BillManagement;
