// ReferralData.js
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  TrendingUp,
  Award,
  Eye,
  Search,
  UserCheck,
  UserPlus,
  ShoppingCart,
  Activity,
  Filter,
  UserX,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";

const CUSTOMER_TYPES = [
  {
    key: "referred_potential",
    label: "Referred Potential Customers (No Orders - Replied with hi atleast)",
    icon: UserPlus,
    color: "bg-orange-500",
  },
  {
    key: "referred_existing",
    label: "Referred New Existing Customers (With Orders)",
    icon: ShoppingCart,
    color: "bg-orange-500",
  },
  {
    key: "all_potential",
    label:
      "Potential Customers (No Orders - Replied with hi atleast ... Referred and nonreferred)",
    icon: Users,
    color: "bg-orange-500",
  },
  {
    key: "all_existing",
    label: "New Existing Customers (With Orders Referred and nonreferred)",
    icon: UserCheck,
    color: "bg-orange-500",
  },
];

const REFERRAL_TABS = [
  {
    key: "top_referring",
    label: "Top Referring People (Sales Person)",
    icon: Award,
  },
  {
    key: "top_referred",
    label: "Top Referred People (Market To)",
    icon: Users,
  },
];

const TIME_PERIODS = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "last3months", label: "Last 3 Months" },
  { key: "all", label: "All Time" },
];

const FILTER_OPTIONS = [
  { key: "all", label: "All Customers" },
  { key: "referred_only", label: "Referred Only" },
  { key: "non_referred_only", label: "Non-Referred Only" },
];

export default function ReferralData() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedCustomerType, setSelectedCustomerType] =
    useState("referred_potential");
  const [selectedReferralTab, setSelectedReferralTab] =
    useState("top_referring");
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [referralData, setReferralData] = useState({
    referred_potential: {
      stats: {
        today: { newAccounts: 0, successfulReferrals: 0, repliedWithHi: 0 },
        week: { newAccounts: 0, successfulReferrals: 0, repliedWithHi: 0 },
        month: { newAccounts: 0, successfulReferrals: 0, repliedWithHi: 0 },
        last3months: {
          newAccounts: 0,
          successfulReferrals: 0,
          repliedWithHi: 0,
        },
        all: { newAccounts: 0, successfulReferrals: 0, repliedWithHi: 0 },
      },
      topReferring: [],
      topReferred: [],
      customers: [],
    },
    referred_existing: {
      stats: {
        today: { newAccounts: 0, successfulReferrals: 0, repliedWithHi: 0 },
        week: { newAccounts: 0, successfulReferrals: 0, repliedWithHi: 0 },
        month: { newAccounts: 0, successfulReferrals: 0, repliedWithHi: 0 },
        last3months: {
          newAccounts: 0,
          successfulReferrals: 0,
          repliedWithHi: 0,
        },
        all: { newAccounts: 0, successfulReferrals: 0, repliedWithHi: 0 },
      },
      topReferring: [],
      topReferred: [],
      customers: [],
    },
    all_potential: {
      stats: {
        today: { newAccounts: 0, successfulReferrals: 0, repliedWithHi: 0 },
        week: { newAccounts: 0, successfulReferrals: 0, repliedWithHi: 0 },
        month: { newAccounts: 0, successfulReferrals: 0, repliedWithHi: 0 },
        last3months: {
          newAccounts: 0,
          successfulReferrals: 0,
          repliedWithHi: 0,
        },
        all: { newAccounts: 0, successfulReferrals: 0, repliedWithHi: 0 },
      },
      topReferring: [],
      topReferred: [],
      customers: [],
    },
    all_existing: {
      stats: {
        today: { newAccounts: 0, successfulReferrals: 0, repliedWithHi: 0 },
        week: { newAccounts: 0, successfulReferrals: 0, repliedWithHi: 0 },
        month: { newAccounts: 0, successfulReferrals: 0, repliedWithHi: 0 },
        last3months: {
          newAccounts: 0,
          successfulReferrals: 0,
          repliedWithHi: 0,
        },
        all: { newAccounts: 0, successfulReferrals: 0, repliedWithHi: 0 },
      },
      topReferring: [],
      topReferred: [],
      customers: [],
    },
    recentActivity: [],
  });

  useEffect(() => {
    fetchReferralData();
  }, [selectedCustomerType, selectedPeriod, selectedFilter]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/referral-data?customerType=${selectedCustomerType}&period=${selectedPeriod}&filter=${selectedFilter}`
      );
      const data = await response.json();

      if (data.success) {
        setReferralData(data.data);
      } else {
        console.error("Failed to fetch referral data:", data.message);
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentData = referralData[selectedCustomerType] || {
    stats: {
      [selectedPeriod]: {
        newAccounts: 0,
        successfulReferrals: 0,
        repliedWithHi: 0,
      },
    },
    topReferring: [],
    topReferred: [],
    customers: [],
  };

  const currentStats = currentData.stats[selectedPeriod] || {
    newAccounts: 0,
    successfulReferrals: 0,
    repliedWithHi: 0,
  };

  const currentReferralData =
    selectedReferralTab === "top_referring"
      ? currentData.topReferring
      : currentData.topReferred;

  // Filter customers based on search and filter options
  const filteredCustomers = currentData.customers.filter((customer) => {
    // Search filter
    const matchesSearch =
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.referralCode.toLowerCase().includes(search.toLowerCase()) ||
      customer.phoneNumber.includes(search);

    // Referral filter (only for "all_" types)
    if (selectedCustomerType.startsWith("all_")) {
      if (selectedFilter === "referred_only") {
        return matchesSearch && customer.isReferred;
      } else if (selectedFilter === "non_referred_only") {
        return matchesSearch && !customer.isReferred;
      }
    }

    return matchesSearch;
  });

  // Show filter options only for "all_" customer types
  const showFilterOptions = selectedCustomerType.startsWith("all_");

  // Get current customer type info
  const currentCustomerType = CUSTOMER_TYPES.find(
    (type) => type.key === selectedCustomerType
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-80" : ""
        } w-full bg-gray-50 p-6`}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            151. Referral Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Track customer referral performance by customer type and activity
            with advanced filtering
          </p>
        </div>
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Customer Categories
        </h3>
        {/* Customer Type Selector */}
        <div className="bg-gray-200 rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {CUSTOMER_TYPES.slice(0, 2).map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.key}
                  onClick={() => {
                    setSelectedCustomerType(type.key);
                    setSelectedFilter("all");
                  }}
                  className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 text-left ${
                    selectedCustomerType === type.key
                      ? `${type.color} text-white shadow-lg transform scale-105`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200  border-4 border-blue-500 p-10 hover:shadow-md "
                  }`}
                >
                  <Icon size={18} className="mr-3 flex-shrink-0" />
                  <span className="text-sm">{type.label}</span>
                </button>
              );
            })}

            {/* Add spacer on large screens */}
            <div className="hidden lg:block col-span-2 my-1" />

            {CUSTOMER_TYPES.slice(2).map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.key}
                  onClick={() => {
                    setSelectedCustomerType(type.key);
                    setSelectedFilter("all");
                  }}
                  className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 text-left ${
                    selectedCustomerType === type.key
                      ? `${type.color} text-white shadow-lg transform scale-105`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200  border-4 border-green-500 hover:shadow-md"
                  }`}
                >
                  <Icon size={18} className="mr-3 flex-shrink-0" />
                  <span className="text-sm">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Options - Only show for "all_" types */}
        {showFilterOptions && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center mb-3">
              <Filter className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-700">
                Referral Filter
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedFilter === filter.key
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter.key === "referred_only" && (
                    <UserCheck size={16} className="mr-2" />
                  )}
                  {filter.key === "non_referred_only" && (
                    <UserX size={16} className="mr-2" />
                  )}
                  {filter.key === "all" && <Users size={16} className="mr-2" />}
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time Period Selector */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Time Period
          </h3>
          <div className="flex flex-wrap gap-2">
            {TIME_PERIODS.map((period) => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === period.key
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Calendar size={16} className="mr-2" />
                {period.label}
              </button>
            ))}
          </div>
        </div>
        <div className="ml-4 mb-12 mt-12 flex flex-wrap gap-14  ">
          <p className="text-sm font-medium text-gray-600 ">Today </p>
          <p className="text-3xl font-bold text-gray-900">
            {currentStats.newAccounts}
          </p>
          <p className="text-sm font-medium text-gray-600">This week</p>
          <p className="text-3xl font-bold text-gray-900">
            {currentStats.newAccounts}
          </p>
          <p className="text-sm font-medium text-gray-600">This Month</p>
          <p className="text-3xl font-bold text-gray-900">
            {currentStats.newAccounts}
          </p>
          <p className="text-sm font-medium text-gray-600">Last 3 Months</p>
          <p className="text-3xl font-bold text-gray-900">
            {currentStats.newAccounts}
          </p>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  New Accounts
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {currentStats.newAccounts}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedCustomerType.includes("potential")
                    ? "No order history"
                    : "With order history"}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Replied with "Hi" At Least
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {currentStats.repliedWithHi}
                </p>
                <p className="text-sm text-gray-500">Engaged customers</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Successful Referrals That Already Shopped
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {currentStats.successfulReferrals}
                </p>
                <p className="text-sm text-gray-500">
                  Converted to paying customers
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Referral Tabs Section */}
          <div className="lg:col-span-2">
            {/* Referral Tab Selector */}
            <div className="bg-white rounded-lg shadow-sm mb-4">
              <div className="flex border-b">
                {REFERRAL_TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedReferralTab(tab.key)}
                      className={`flex-1 flex items-center justify-center px-4 py-3 font-medium transition-colors ${
                        selectedReferralTab === tab.key
                          ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={16} className="mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Referral Data Display */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  <p className="mt-2 text-gray-500">Loading data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentReferralData.length > 0 ? (
                    currentReferralData.slice(0, 8).map((item, index) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                              index === 0
                                ? "bg-yellow-500"
                                : index === 1
                                ? "bg-gray-400"
                                : index === 2
                                ? "bg-orange-500"
                                : "bg-blue-500"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.referralCode} • {item.phoneNumber}
                            </p>
                            {item.isReferred && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 mt-1">
                                <UserCheck size={12} className="mr-1" />
                                Referred
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {selectedReferralTab === "top_referring"
                              ? item.totalReferrals
                              : item.referredCount}
                          </p>
                          <p className="text-xs text-gray-600">
                            {selectedReferralTab === "top_referring"
                              ? "referrals made"
                              : "times referred"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No data available for the selected period</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Activity className="h-5 w-5 text-blue-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Activity
                </h2>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {referralData.recentActivity
                    .slice(0, 10)
                    .map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {activity.customerName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="ml-2">
                          {activity.type === "video" && (
                            <Eye className="h-4 w-4 text-blue-500" />
                          )}
                          {activity.type === "share" && (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                          {activity.type === "referral" && (
                            <Users className="h-4 w-4 text-purple-500" />
                          )}
                          {activity.type === "order" && (
                            <ShoppingCart className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Details Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentCustomerType?.label}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Detailed view for{" "}
                  {TIME_PERIODS.find((p) => p.key === selectedPeriod)?.label}
                  {showFilterOptions && selectedFilter !== "all" && (
                    <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                      {
                        FILTER_OPTIONS.find((f) => f.key === selectedFilter)
                          ?.label
                      }
                    </span>
                  )}
                </p>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 border rounded-lg p-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search
                  className="absolute right-3 top-1/2 -mt-2 text-gray-400"
                  size={16}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referral Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referral Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Videos Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    People Referred
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Replied with Hi
                  </th>
                  {selectedCustomerType.includes("existing") && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Spent
                      </th>
                    </>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={
                        selectedCustomerType.includes("existing") ? "10" : "8"
                      }
                      className="px-6 py-4 text-center"
                    >
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      <p className="mt-2 text-gray-500">
                        Loading customer data...
                      </p>
                    </td>
                  </tr>
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer, index) => (
                    <tr
                      key={customer._id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.phoneNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {customer.referralCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.isReferred ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            <UserCheck size={12} className="mr-1" />
                            Referred
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                            <UserX size={12} className="mr-1" />
                            Direct
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.videosUploaded || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.peopleReferred || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.repliedWithHi ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            ✓ Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                            ✗ No
                          </span>
                        )}
                      </td>
                      {selectedCustomerType.includes("existing") && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer.totalOrders || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                            ${(customer.totalSpent || 0).toFixed(2)}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.joinDate
                          ? new Date(customer.joinDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.lastActivity
                          ? new Date(customer.lastActivity).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={
                        selectedCustomerType.includes("existing") ? "10" : "8"
                      }
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No customers found for the selected criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredCustomers.length} of{" "}
                {currentData.customers.length} customers
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Type: {currentCustomerType?.label}
                </span>
                <span className="text-sm text-gray-500">
                  Period:{" "}
                  {TIME_PERIODS.find((p) => p.key === selectedPeriod)?.label}
                </span>
                {showFilterOptions && selectedFilter !== "all" && (
                  <span className="text-sm text-gray-500">
                    Filter:{" "}
                    {
                      FILTER_OPTIONS.find((f) => f.key === selectedFilter)
                        ?.label
                    }
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
