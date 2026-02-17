import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/sidebar";
import ModeToggle from "../Shared/ModeToggle";
import { API_BASE_URL } from "../../utils/config";

const SalesData = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModeToggle, setShowModeToggle] = useState(false);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales-data`);
      const data = await response.json();

      if (data.success) {
        setSalesData(data.data);
      } else {
        setError(data.message || "Failed to fetch sales data");
      }
    } catch (err) {
      console.error("Error fetching sales data:", err);
      setError("Network error or server unreachable");
    } finally {
      setLoading(false);
    }
  };

  // Format date: dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // dd/mm/yyyy format
  };

  // Format time: HH:mm:ss
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Format currency: Rp
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden w-full transition-all duration-300 lg:ml-80">
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                <strong>255.</strong> Sales Data
              </h1>
              <p className="text-gray-600">Detailed record of Sold Products</p>
              <div className="flex items-center space-x-2 mt-2">
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
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bill Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product Name
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          # Sold
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Our Price
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Net Total Final Payment
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Original Price
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Discount Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salesData.length > 0 ? (
                        salesData.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(item.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatTime(item.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                              {item.billNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span
                                className="truncate block max-w-xs"
                                title={item.productName}
                              >
                                {item.productName}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                              {item.quantitySold}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                              {formatCurrency(item.ourPrice)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                              {formatCurrency(item.normalPrice)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                              {formatCurrency(item.ourOriginalPrice)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                              {item.discountPrice > 0
                                ? formatCurrency(item.discountPrice)
                                : "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="9"
                            className="px-6 py-10 text-center text-gray-500"
                          >
                            No sales data available found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <span className="text-sm text-gray-600">
                    Total Records: {salesData.length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModeToggle && (
        <ModeToggle
          componentName="Sales Data"
          onClose={() => setShowModeToggle(false)}
        />
      )}
    </div>
  );
};

export default SalesData;
