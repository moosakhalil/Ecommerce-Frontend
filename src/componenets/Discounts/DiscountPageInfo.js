import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../Sidebar/sidebar";
import { API_BASE_URL } from "../../utils/config";
import {
  Tag,
  BarChart3,
  Users,
  Package,
  TrendingUp,
  Filter,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  Percent,
  DollarSign,
  UserCheck,
  ShoppingCart,
} from "lucide-react";

const API_URL = API_BASE_URL;

const DiscountPageInfo = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("windows"); // 'windows' or 'analytics'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Discount Windows data
  const [categoriesInfo, setCategoriesInfo] = useState([]);
  const [batchDiscounts, setBatchDiscounts] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Analytics data
  const [analytics, setAnalytics] = useState(null);
  
  // Eligible customers data
  const [eligibleCustomers, setEligibleCustomers] = useState({});
  const [customerCounts, setCustomerCounts] = useState({});

  // Category display mapping
  const categoryDisplayNames = {
    foremen: { name: "Foremen", icon: "👷", color: "bg-blue-500" },
    foremen_commission: { name: "Foremen+", icon: "👷‍♂️", color: "bg-blue-600" },
    referral_3_days: { name: "You Referred 3", icon: "🔗", color: "bg-green-500" },
    new_customer_referred: { name: "New Customer Ref", icon: "🆕", color: "bg-yellow-500" },
    new_customer: { name: "Hey New Customer", icon: "👋", color: "bg-orange-500" },
    shopping_30m: { name: "VIP 30M", icon: "💎", color: "bg-purple-500" },
    shopping_100m_60d: { name: "Valued Customer", icon: "🏆", color: "bg-pink-500" },
    everyone: { name: "Discount", icon: "🏷️", color: "bg-gray-500" },
  };

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch categories info
      const categoriesRes = await axios.get(`${API_URL}/api/batch-discounts/categories/info`);
      if (categoriesRes.data.success) {
        setCategoriesInfo(categoriesRes.data.data);
      }

      // Fetch all batch discounts
      const batchesRes = await axios.get(`${API_URL}/api/batch-discounts`);
      if (batchesRes.data.success) {
        setBatchDiscounts(batchesRes.data.data);
      }

      // Fetch analytics
      const analyticsRes = await axios.get(`${API_URL}/api/batch-discounts/analytics/summary`);
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }
      
      // Fetch eligible customers per category
      const customersRes = await axios.get(`${API_URL}/api/batch-discounts/categories/eligible-customers`);
      if (customersRes.data.success) {
        setEligibleCustomers(customersRes.data.data);
        setCustomerCounts(customersRes.data.counts);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load discount data");
    } finally {
      setLoading(false);
    }
  };

  // Filter batches by category
  const getBatchesByCategory = (category) => {
    return batchDiscounts.filter((b) => b.discountCategory === category);
  };

  // Discount Windows Tab
  const renderDiscountWindows = () => (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search discount categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={fetchData}
          className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Category Cards */}
      <div className="grid gap-4">
        {categoriesInfo
          .filter((cat) =>
            categoryDisplayNames[cat.category]?.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
          .map((cat) => {
            const display = categoryDisplayNames[cat.category];
            const batches = getBatchesByCategory(cat.category);
            const isExpanded = expandedCategory === cat.category;
            const eligibleCount = customerCounts[cat.category] || 0;
            const categoryCustomers = eligibleCustomers[cat.category] || [];

            return (
              <div
                key={cat.category}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Category Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    setExpandedCategory(isExpanded ? null : cat.category)
                  }
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 ${display?.color} rounded-lg flex items-center justify-center text-2xl`}
                    >
                      {display?.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {display?.name || cat.category}
                      </h3>
                      <p className="text-sm text-gray-500">{cat.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {cat.activeBatches}
                      </p>
                      <p className="text-xs text-gray-500">Active Batches</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {cat.totalProducts}
                      </p>
                      <p className="text-xs text-gray-500">Products</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {eligibleCount}
                      </p>
                      <p className="text-xs text-gray-500">Eligible Customers</p>
                    </div>
                    <div className="text-center px-3 py-1 bg-gray-100 rounded-full">
                      <p className="text-xs text-gray-600">{cat.availability}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Criteria:
                      </h4>
                      <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
                        {cat.criteria}
                      </p>
                    </div>

                    {batches.length > 0 ? (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Active Batches:
                        </h4>
                        <div className="grid gap-3">
                          {batches.map((batch) => (
                            <div
                              key={batch._id}
                              className="bg-white p-4 rounded-lg border shadow-sm"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <span className="font-mono text-sm font-medium text-orange-600">
                                    {batch.batchNumber}
                                  </span>
                                  <span className="ml-3 text-sm text-gray-500">
                                    {batch.products?.length || 0} products
                                  </span>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <span className="text-green-600 font-medium">
                                    {batch.discountPercentage}% off
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    Rp {batch.discountPrice?.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              {/* Product List from Database */}
                              {batch.products && batch.products.length > 0 && (
                                <div className="mt-3 border-t pt-3">
                                  <h5 className="text-xs font-medium text-gray-500 uppercase mb-2">Products in this batch:</h5>
                                  <div className="grid gap-2 max-h-48 overflow-y-auto">
                                    {batch.products.map((product, idx) => (
                                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                                        <div className="flex items-center space-x-3">
                                          <span className="text-xs font-mono text-gray-400">
                                            {product.productCode || product.productId?.productId || 'N/A'}
                                          </span>
                                          <span className="font-medium text-gray-700">
                                            {product.productName || product.productId?.productName || 'Unknown Product'}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                          {product.productId?.NormalPrice && (
                                            <span className="text-xs text-gray-400 line-through">
                                              Rp {product.productId.NormalPrice.toLocaleString()}
                                            </span>
                                          )}
                                          {product.productId?.Stock !== undefined && (
                                            <span className={`text-xs px-2 py-0.5 rounded ${product.productId.Stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                              Stock: {product.productId.Stock}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No active batches in this category
                      </p>
                    )}

                    {/* Eligible Customers Section */}
                    <div className="mt-4 border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-blue-500" />
                        Eligible Customers ({eligibleCount})
                      </h4>
                      {categoryCustomers.length > 0 ? (
                        <div className="bg-white rounded-lg border max-h-48 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Phone</th>
                                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Name</th>
                                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Business</th>
                                <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Total Spent</th>
                                <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Orders</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {categoryCustomers.map((customer, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 font-mono text-xs text-gray-600">{customer.phoneNumber}</td>
                                  <td className="px-3 py-2 text-gray-700">{customer.customerName}</td>
                                  <td className="px-3 py-2 text-gray-500">{customer.businessName || '-'}</td>
                                  <td className="px-3 py-2 text-right text-green-600">
                                    Rp {(customer.totalSpent || 0).toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-right text-blue-600">{customer.ordersCount || 0}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic bg-white p-3 rounded border">
                          No eligible customers in this category yet
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );

  // Analytics Tab
  const renderAnalytics = () => {
    if (!analytics) {
      return (
        <div className="text-center py-10 text-gray-500">
          No analytics data available
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Eligible</p>
                <p className="text-3xl font-bold text-purple-600">
                  {analytics.summary?.totalEligible || 0}
                </p>
              </div>
              <Users className="w-10 h-10 text-purple-200" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Used</p>
                <p className="text-3xl font-bold text-green-600">
                  {analytics.summary?.totalUsed || 0}
                </p>
              </div>
              <ShoppingCart className="w-10 h-10 text-green-200" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Saved</p>
                <p className="text-3xl font-bold text-blue-600">
                  Rp {(analytics.summary?.totalSaved || 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-blue-200" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Categories</p>
                <p className="text-3xl font-bold text-orange-600">8</p>
              </div>
              <Tag className="w-10 h-10 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Category Breakdown
          </h3>
          <div className="space-y-4">
            {analytics.analytics?.map((cat) => {
              const display = categoryDisplayNames[cat.category];
              return (
                <div key={cat.category} className="flex items-center">
                  <div
                    className={`w-8 h-8 ${display?.color} rounded-lg flex items-center justify-center text-lg mr-3`}
                  >
                    {display?.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {cat.displayName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {cat.eligible} eligible · {cat.used} used ({cat.usagePercentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${display?.color} rounded-full h-2`}
                        style={{ width: `${Math.min(cat.usagePercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Eligibility Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <UserCheck className="w-5 h-5 mr-2" />
            Eligibility Overview
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(analytics.eligibilityCounts || {}).map(([cat, count]) => {
              const display = categoryDisplayNames[cat];
              return (
                <div
                  key={cat}
                  className="bg-gray-50 p-4 rounded-lg text-center"
                >
                  <div
                    className={`w-10 h-10 ${display?.color} rounded-lg flex items-center justify-center text-lg mx-auto mb-2`}
                  >
                    {display?.icon}
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{count}</p>
                  <p className="text-xs text-gray-500">{display?.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-80" : "ml-0"
        } overflow-auto`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Tag className="w-7 h-7 mr-3 text-purple-600" />
              Discount Page Info
            </h1>
            <p className="text-gray-500 mt-1">
              Manage discount categories and view analytics
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("windows")}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "windows"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Discount Windows
              </div>
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "analytics"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics / Info
              </div>
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : activeTab === "windows" ? (
            renderDiscountWindows()
          ) : (
            renderAnalytics()
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscountPageInfo;
