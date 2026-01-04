import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/sidebar";
import {
  BarChart3,
  Search,
  X,
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
} from "lucide-react";
import { API_BASE_URL } from "../../utils/config";

const ProductSalesInfo = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Search for products
  const searchProducts = async (query) => {
    if (!query.trim()) {
      setProducts([]);
      setShowResults(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const filtered = data.data.filter(
            (product) =>
              product.productName?.toLowerCase().includes(query.toLowerCase()) ||
              product.productId?.toLowerCase().includes(query.toLowerCase())
          );
          setProducts(filtered);
          setShowResults(true);
        }
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setError("Failed to search products");
    }
  };

  // Fetch sales data for selected product
  const fetchSalesData = async (productId) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/customers/product-sales/${productId}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSalesData(data.data);
          setShowModal(true);
        } else {
          setError(data.message || "Failed to fetch sales data");
        }
      } else {
        setError("Failed to fetch sales data");
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  // Handle product selection
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSearchTerm(product.productName);
    setShowResults(false);
    fetchSalesData(product.productId);
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  // Calculate total quantity sold
  const getTotalQuantitySold = () => {
    return salesData.reduce((total, sale) => total + (sale.quantity || 0), 0);
  };

  // Calculate total revenue
  const getTotalRevenue = () => {
    return salesData.reduce(
      (total, sale) => total + (sale.price || 0) * (sale.quantity || 0),
      0
    );
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm && !selectedProduct) {
        searchProducts(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedProduct]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 text-white p-6 rounded-xl shadow-lg mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <BarChart3 size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">256. Product Sales Info</h1>
                <p className="text-purple-100 text-sm">
                  View detailed sales history for each product
                </p>
              </div>
            </div>
          </div>

          {/* Product Search */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Select Product
            </h2>

            <div className="relative">
              <input
                type="text"
                placeholder="Search by product name or ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (selectedProduct) {
                    setSelectedProduct(null);
                    setSalesData([]);
                  }
                }}
                className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Search
                className="absolute right-3 top-1/2 -mt-2 text-gray-400"
                size={20}
              />

              {/* Search Results Dropdown */}
              {showResults && products.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-xl max-h-60 overflow-y-auto">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handleProductSelect(product)}
                      className="p-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-800">
                            {product.productName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {product.productId}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-purple-600">
                            ${product.NormalPrice || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            Stock: {product.Stock || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Product Display */}
            {selectedProduct && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-purple-800">
                      {selectedProduct.productName}
                    </h3>
                    <p className="text-sm text-purple-600">
                      Product ID: {selectedProduct.productId}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-800">
                      ${selectedProduct.NormalPrice || 0}
                    </div>
                    <div className="text-sm text-purple-600">Net Total Final Payment</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading sales data...</p>
            </div>
          )}
        </div>
      </div>

      {/* Sales Data Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  Sales History: {selectedProduct.productName}
                </h2>
                <p className="text-purple-100 text-sm">
                  Product ID: {selectedProduct.productId}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 border-b">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <Package className="text-purple-600" size={24} />
                  <div>
                    <div className="text-2xl font-bold text-gray-800">
                      {getTotalQuantitySold()}
                    </div>
                    <div className="text-sm text-gray-600">Total Units Sold</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <DollarSign className="text-green-600" size={24} />
                  <div>
                    <div className="text-2xl font-bold text-gray-800">
                      ${getTotalRevenue().toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-blue-600" size={24} />
                  <div>
                    <div className="text-2xl font-bold text-gray-800">
                      {salesData.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Orders</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Data Table */}
            <div className="overflow-y-auto max-h-[calc(90vh-300px)] p-6">
              {salesData.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg">No sales data found for this product</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Quantity Sold
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Net Total Final Payment
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Original Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Discount Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salesData.map((sale, index) => {
                      const { date, time } = formatDateTime(sale.orderDate);
                      return (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-gray-400" />
                              {date}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <Clock size={16} className="text-gray-400" />
                              {time}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                            {sale.orderId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                            {sale.quantity} units
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            ${(sale.normalPrice || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            ${(sale.originalPrice || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {sale.discountPrice ? (
                              <span className="text-green-600 font-semibold">
                                ${sale.discountPrice.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                            ${((sale.price || 0) * (sale.quantity || 0)).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSalesInfo;
