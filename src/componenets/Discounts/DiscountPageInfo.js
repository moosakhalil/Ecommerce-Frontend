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
  HelpCircle,
  X,
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

  // Info modal state
  const [infoModalCategory, setInfoModalCategory] = useState(null);

  // Category display mapping with detailed eligibility info
  const categoryDisplayNames = {
    foremen: { 
      name: "Foremen", 
      icon: "👷", 
      color: "bg-blue-500",
      eligibility: {
        title: "Foremen Discount",
        whoGetsIt: "All customers registered as Foremen in the system",
        howToQualify: [
          "Customer must be approved as a Foreman by admin",
          "Foreman status must be active (not pending or rejected)"
        ],
        duration: "24/7 - Always available as long as Foreman status is active",
        notes: "Foremen are typically construction workers or contractors who buy in bulk"
      }
    },
    foremen_commission: { 
      name: "Foremen+", 
      icon: "👷‍♂️", 
      color: "bg-blue-600",
      eligibility: {
        title: "Foremen+ (Commission) Discount",
        whoGetsIt: "Foremen who have earned commission eligibility",
        howToQualify: [
          "Must be an approved Foreman first",
          "Must have commission rights enabled in their account",
          "Commission rights are granted based on referral performance"
        ],
        duration: "24/7 - Always available as long as commission rights are active",
        notes: "This is a premium tier above regular Foremen with additional discounts"
      }
    },
    referral_3_days: { 
      name: "You Referred 3", 
      icon: "🔗", 
      color: "bg-green-500",
      eligibility: {
        title: "Referral Reward Discount",
        whoGetsIt: "Customers who have successfully referred 3 or more new customers",
        howToQualify: [
          "Refer at least 3 new customers who make purchases",
          "Referrals must be valid (not RU/RU or IN/IN phone numbers)",
          "Each referral must be a unique new customer"
        ],
        duration: "3 days base + 1 extra day per additional referral beyond 3",
        calculation: "Example: 3 referrals = 3 days, 5 referrals = 5 days, 10 referrals = 10 days",
        notes: "Timer starts when the 3rd referral makes their first purchase"
      }
    },
    new_customer_referred: { 
      name: "New Customer Ref", 
      icon: "🆕", 
      color: "bg-yellow-500",
      eligibility: {
        title: "Referred New Customer Discount",
        whoGetsIt: "New customers who signed up via a referral link/code",
        howToQualify: [
          "Must be a new customer (first time account)",
          "Must have been referred by an existing customer",
          "Must make a minimum first purchase of Rp 100,000"
        ],
        duration: "3 days from first qualifying purchase",
        notes: "This discount incentivizes new referred customers to shop quickly"
      }
    },
    new_customer: { 
      name: "Hey New Customer", 
      icon: "👋", 
      color: "bg-orange-500",
      eligibility: {
        title: "New Customer Welcome Discount",
        whoGetsIt: "All new customers, regardless of how they found us",
        howToQualify: [
          "Must be a new customer (account created recently)",
          "No referral required",
          "Available to anyone who creates an account"
        ],
        duration: "10 days from account creation",
        notes: "Welcome discount to encourage first-time buyers to make a purchase"
      }
    },
    shopping_30m: { 
      name: "VIP 30M", 
      icon: "💎", 
      color: "bg-purple-500",
      eligibility: {
        title: "VIP Single Purchase Discount",
        whoGetsIt: "Customers who made a single purchase of Rp 30,000,000 or more",
        howToQualify: [
          "Make a single order totaling at least Rp 30,000,000",
          "Must be in one transaction (not cumulative)"
        ],
        duration: "10 days from the qualifying purchase, or until next 30M+ purchase (whichever is later)",
        notes: "High-value buyers get VIP treatment with exclusive discounts"
      }
    },
    shopping_100m_60d: { 
      name: "Valued Customer", 
      icon: "🏆", 
      color: "bg-pink-500",
      eligibility: {
        title: "Valued Customer Loyalty Discount",
        whoGetsIt: "Customers who spent Rp 100,000,000+ in the last 60 days",
        howToQualify: [
          "Cumulative spending of at least Rp 100,000,000",
          "Spending must be within the last 60 days",
          "Multiple orders count toward the total"
        ],
        duration: "10 days from reaching the threshold, or until next 100M threshold",
        notes: "Rewards our most loyal and frequent shoppers"
      }
    },
    everyone: { 
      name: "Discount", 
      icon: "🏷️", 
      color: "bg-gray-500",
      eligibility: {
        title: "General Discount",
        whoGetsIt: "All customers - no restrictions",
        howToQualify: [
          "No special requirements",
          "Available to everyone with an account",
          "No minimum purchase needed"
        ],
        duration: "24/7 - Always available to all customers",
        notes: "General promotions and sales available to the entire customer base"
      }
    },
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
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {display?.name || cat.category}
                        </h3>
                        {/* Question mark info icon */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInfoModalCategory(cat.category);
                          }}
                          className="p-1 rounded-full hover:bg-purple-100 transition-colors group"
                          title="Click for eligibility details"
                        >
                          <HelpCircle className="w-5 h-5 text-purple-500 group-hover:text-purple-700" />
                        </button>
                      </div>
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

      {/* Eligibility Info Modal */}
      {infoModalCategory && categoryDisplayNames[infoModalCategory]?.eligibility && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setInfoModalCategory(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`${categoryDisplayNames[infoModalCategory]?.color} p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">{categoryDisplayNames[infoModalCategory]?.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold">
                      {categoryDisplayNames[infoModalCategory]?.eligibility.title}
                    </h2>
                    <p className="text-sm opacity-90">Eligibility Information</p>
                  </div>
                </div>
                <button
                  onClick={() => setInfoModalCategory(null)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Who Gets It */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  👤 Who Gets This Discount?
                </h3>
                <p className="text-gray-800 font-medium">
                  {categoryDisplayNames[infoModalCategory]?.eligibility.whoGetsIt}
                </p>
              </div>

              {/* How to Qualify */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  ✅ How to Qualify
                </h3>
                <ul className="space-y-2">
                  {categoryDisplayNames[infoModalCategory]?.eligibility.howToQualify.map((item, idx) => (
                    <li key={idx} className="flex items-start text-gray-700">
                      <span className="text-green-500 mr-2 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Duration */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wide mb-2">
                  ⏱️ Duration / Availability
                </h3>
                <p className="text-purple-800 font-medium">
                  {categoryDisplayNames[infoModalCategory]?.eligibility.duration}
                </p>
                {categoryDisplayNames[infoModalCategory]?.eligibility.calculation && (
                  <p className="text-sm text-purple-600 mt-2 italic">
                    {categoryDisplayNames[infoModalCategory]?.eligibility.calculation}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  📝 Additional Notes
                </h3>
                <p className="text-gray-600 text-sm">
                  {categoryDisplayNames[infoModalCategory]?.eligibility.notes}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setInfoModalCategory(null)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountPageInfo;
