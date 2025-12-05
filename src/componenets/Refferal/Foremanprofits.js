import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Star,
  CheckCircle,
  XCircle,
  User,
  DollarSign,
  Users,
  Calendar,
  Award,
  Phone,
  MapPin,
  CreditCard,
  TrendingUp,
  UserCheck,
  Shield,
  ShieldCheck,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";

const TABS = [
  { key: "customers", label: "Regular Customers", icon: User },
  { key: "approved_foreman", label: "Approved Foreman", icon: Shield },
  {
    key: "approved_commission",
    label: "Commission Eligible",
    icon: ShieldCheck,
  },
  { key: "Everyone", label: "All Customers", icon: Users },
];

export default function EnhancedForemanReferrals() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("customers");
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [activeTab]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/foreman-customers?status=${activeTab}`
      );
      const data = await response.json();

      if (data.success) {
        setCustomers(data.customers);
      } else {
        console.error("Failed to fetch customers:", data.message);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/foreman-customers/stats/overview"
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const updateForemanStatus = async (customerId, isApproved) => {
    try {
      setUpdating(true);
      const response = await fetch(
        "http://localhost:5000/api/foreman-customers/update-foreman-status",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId,
            isApproved,
            staffId: "ADMIN001", // Replace with actual staff ID
            staffName: "Admin User",
            reason: `${isApproved ? "Approved" : "Revoked"} foreman status`,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchCustomers();
        await fetchStats();
        if (selectedCustomer && selectedCustomer._id === customerId) {
          setSelectedCustomer(null);
        }
        alert(
          `Customer successfully ${
            isApproved ? "approved" : "revoked"
          } as foreman`
        );
      } else {
        alert("Failed to update status: " + data.message);
      }
    } catch (error) {
      console.error("Error updating foreman status:", error);
      alert("Error updating foreman status");
    } finally {
      setUpdating(false);
    }
  };

  const updateCommissionEligibility = async (customerId, isEligible) => {
    try {
      setUpdating(true);
      const response = await fetch(
        "http://localhost:5000/api/foreman-customers/update-commission-eligibility",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId,
            isEligible,
            staffId: "ADMIN001", // Replace with actual staff ID
            staffName: "Admin User",
            reason: `${
              isEligible ? "Approved" : "Revoked"
            } commission eligibility`,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchCustomers();
        await fetchStats();
        alert(
          `Customer ${
            isEligible ? "approved" : "revoked"
          } for commission eligibility`
        );
      } else {
        alert("Failed to update commission eligibility: " + data.message);
      }
    } catch (error) {
      console.error("Error updating commission eligibility:", error);
      alert("Error updating commission eligibility");
    } finally {
      setUpdating(false);
    }
  };

  const payCommission = async (customerId, amount) => {
    try {
      setUpdating(true);
      const response = await fetch(
        "http://localhost:5000/api/foreman-customers/pay-commission",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId,
            amount,
            staffId: "ADMIN001", // Replace with actual staff ID
            staffName: "Admin User",
            notes: `Commission payment of $${amount}`,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchCustomers();
        await fetchStats();
        alert(`Commission of $${amount} paid successfully!`);
      } else {
        alert("Failed to pay commission: " + data.message);
      }
    } catch (error) {
      console.error("Error paying commission:", error);
      alert("Error paying commission");
    } finally {
      setUpdating(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.phoneNumber.includes(search) ||
      customer.referralCode.toLowerCase().includes(search.toLowerCase())
  );

  // Customer Detail Modal
  if (selectedCustomer) {
    return (
      <CustomerDetailView
        customer={selectedCustomer}
        onBack={() => setSelectedCustomer(null)}
        onForemanStatusUpdate={updateForemanStatus}
        onCommissionEligibilityUpdate={updateCommissionEligibility}
        onPayCommission={payCommission}
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        updating={updating}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-80" : ""
        } w-full p-6`}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enhanced Foreman Commission Management System
          </h1>
          <p className="text-gray-600">
            Manage foreman approvals, commission eligibility, and referral
            performance with full traceability
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by name, phone, or referral code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search
              className="absolute left-3 top-1/2 -mt-2 text-gray-400"
              size={20}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon size={16} className="mr-2" />
                    {tab.label}
                    <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                      {filteredCustomers.length}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Total Customers"
            value={stats.totalCustomers || 0}
            icon={User}
            color="blue"
          />
          <StatsCard
            title="Approved Foreman"
            value={stats.approvedForeman || 0}
            icon={Shield}
            color="green"
          />
          <StatsCard
            title="Commission Eligible"
            value={stats.commissionEligible || 0}
            icon={ShieldCheck}
            color="purple"
          />
          <StatsCard
            title="Available Commission"
            value={`$${(stats.availableCommission || 0).toFixed(2)}`}
            icon={DollarSign}
            color="yellow"
          />
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatsCard
            title="Total Referrals"
            value={stats.totalReferrals || 0}
            icon={Users}
            color="indigo"
          />
          <StatsCard
            title="Successful Referrals"
            value={stats.successfulReferrals || 0}
            icon={UserCheck}
            color="emerald"
          />
          <StatsCard
            title="Conversion Rate"
            value={stats.conversionRate || "0%"}
            icon={TrendingUp}
            color="rose"
          />
        </div>

        {/* Enhanced Customers Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Foreman Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Earned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Successful Referrals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-gray-500">Loading customers...</p>
                    </td>
                  </tr>
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer, index) => (
                    <EnhancedCustomerRow
                      key={customer._id}
                      customer={customer}
                      index={index}
                      onViewDetails={() => setSelectedCustomer(customer)}
                      onForemanStatusUpdate={updateForemanStatus}
                      onCommissionEligibilityUpdate={
                        updateCommissionEligibility
                      }
                      onPayCommission={payCommission}
                      activeTab={activeTab}
                      updating={updating}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No customers found for "{activeTab}" status
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Stats Card Component
function StatsCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    yellow: "bg-yellow-100 text-yellow-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    indigo: "bg-indigo-100 text-indigo-600",
    emerald: "bg-emerald-100 text-emerald-600",
    rose: "bg-rose-100 text-rose-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

// Enhanced Customer Row Component
function EnhancedCustomerRow({
  customer,
  index,
  onViewDetails,
  onForemanStatusUpdate,
  onCommissionEligibilityUpdate,
  onPayCommission,
  activeTab,
  updating,
}) {
  const handlePayCommission = () => {
    const amount = prompt("Enter commission amount to pay:");
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
      onPayCommission(customer._id, parseFloat(amount));
    }
  };

  const getForemanStatusBadge = (isApproved) => {
    return isApproved
      ? {
          bg: "bg-green-100",
          text: "text-green-800",
          label: "Foreman Approved",
        }
      : { bg: "bg-gray-100", text: "text-gray-800", label: "Regular Customer" };
  };

  const getCommissionStatusBadge = (isEligible) => {
    return isEligible
      ? {
          bg: "bg-purple-100",
          text: "text-purple-800",
          label: "Commission Eligible",
        }
      : { bg: "bg-gray-100", text: "text-gray-800", label: "Not Eligible" };
  };

  const foremanBadge = getForemanStatusBadge(customer.isForemanApproved);
  const commissionBadge = getCommissionStatusBadge(
    customer.isCommissionEligible
  );

  return (
    <tr className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-white font-semibold">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {customer.name}
            </div>
            <div className="text-sm text-gray-500">{customer.phoneNumber}</div>
            <div className="text-xs text-gray-400">{customer.referralCode}</div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${foremanBadge.bg} ${foremanBadge.text}`}
        >
          {foremanBadge.label}
        </span>
        {customer.foremanApprovalDate && (
          <div className="text-xs text-gray-500 mt-1">
            Approved:{" "}
            {new Date(customer.foremanApprovalDate).toLocaleDateString()}
          </div>
        )}
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${commissionBadge.bg} ${commissionBadge.text}`}
        >
          {commissionBadge.label}
        </span>
        {customer.commissionEligibilityDate && (
          <div className="text-xs text-gray-500 mt-1">
            Eligible:{" "}
            {new Date(customer.commissionEligibilityDate).toLocaleDateString()}
          </div>
        )}
      </td>

      <td className="px-6 py-4">
        <div className="text-sm font-medium text-red-600">
          ${(customer.availableCommission || 0).toFixed(2)}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="text-sm font-medium text-green-600">
          ${(customer.commissionEarned || 0).toFixed(2)}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          <div className="flex items-center">
            <UserCheck size={14} className="mr-1 text-green-500" />
            {customer.successfulReferrals || 0} / {customer.totalReferrals || 0}
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={onViewDetails}
            className="text-blue-600 hover:text-blue-900 font-medium text-sm"
          >
            <Eye size={16} className="inline mr-1" />
            View
          </button>

          {/* Foreman Status Actions */}
          {!customer.isForemanApproved && (
            <button
              onClick={() => onForemanStatusUpdate(customer._id, true)}
              disabled={updating}
              className="text-green-600 hover:text-green-900 font-medium text-sm disabled:opacity-50"
            >
              <Shield size={16} className="inline mr-1" />
              Approve Foreman
            </button>
          )}

          {customer.isForemanApproved && !customer.isCommissionEligible && (
            <button
              onClick={() => onCommissionEligibilityUpdate(customer._id, true)}
              disabled={updating}
              className="text-purple-600 hover:text-purple-900 font-medium text-sm disabled:opacity-50"
            >
              <ShieldCheck size={16} className="inline mr-1" />
              Enable Commission
            </button>
          )}

          {customer.isCommissionEligible &&
            customer.availableCommission > 0 && (
              <button
                onClick={handlePayCommission}
                disabled={updating}
                className="text-yellow-600 hover:text-yellow-900 font-medium text-sm disabled:opacity-50"
              >
                <DollarSign size={16} className="inline mr-1" />
                Pay Commission
              </button>
            )}

          {/* Revoke actions */}
          {customer.isForemanApproved && (
            <button
              onClick={() => onForemanStatusUpdate(customer._id, false)}
              disabled={updating}
              className="text-red-600 hover:text-red-900 font-medium text-sm disabled:opacity-50"
            >
              <XCircle size={16} className="inline mr-1" />
              Revoke
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// Enhanced Customer Detail View Component
function CustomerDetailView({
  customer,
  onBack,
  onForemanStatusUpdate,
  onCommissionEligibilityUpdate,
  onPayCommission,
  sidebarOpen,
  toggleSidebar,
  updating,
}) {
  const [referralDetails, setReferralDetails] = useState({
    successfulReferrals: [],
    allReferredNumbers: [],
    loading: true,
  });

  useEffect(() => {
    fetchReferralDetails();
  }, [customer._id]);

  const fetchReferralDetails = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/foreman-customers/${customer._id}/referral-details`
      );
      const data = await response.json();

      if (data.success) {
        setReferralDetails({
          successfulReferrals: data.successfulReferrals || [],
          allReferredNumbers: data.allReferredNumbers || [],
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching referral details:", error);
      setReferralDetails((prev) => ({ ...prev, loading: false }));
    }
  };

  const handlePayCommission = () => {
    const amount = prompt("Enter commission amount to pay:");
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
      onPayCommission(customer._id, parseFloat(amount));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-80" : ""
        } w-full p-6`}
      >
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <XCircle size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {customer.name}
            </h1>
            <p className="text-gray-600">
              Enhanced Customer Profile & Commission Details
            </p>
          </div>
        </div>

        {/* Enhanced Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Foreman Status
                </p>
                <p
                  className={`text-lg font-bold ${
                    customer.isForemanApproved
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {customer.isForemanApproved ? "Approved" : "Not Approved"}
                </p>
                {customer.foremanApprovalDate && (
                  <p className="text-xs text-gray-500">
                    Since:{" "}
                    {new Date(
                      customer.foremanApprovalDate
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Shield
                className={`h-8 w-8 ${
                  customer.isForemanApproved
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Commission Status
                </p>
                <p
                  className={`text-lg font-bold ${
                    customer.isCommissionEligible
                      ? "text-purple-600"
                      : "text-gray-600"
                  }`}
                >
                  {customer.isCommissionEligible ? "Eligible" : "Not Eligible"}
                </p>
                {customer.commissionEligibilityDate && (
                  <p className="text-xs text-gray-500">
                    Since:{" "}
                    {new Date(
                      customer.commissionEligibilityDate
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
              <ShieldCheck
                className={`h-8 w-8 ${
                  customer.isCommissionEligible
                    ? "text-purple-500"
                    : "text-gray-400"
                }`}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Available Commission
                </p>
                <p className="text-2xl font-bold text-red-600">
                  ${(customer.availableCommission || 0).toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Earned
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ${(customer.commissionEarned || 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Referral Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Referral Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Referrals:</span>
                <span className="font-medium">
                  {customer.totalReferrals || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Successful Conversions:</span>
                <span className="font-medium text-green-600">
                  {customer.successfulReferrals || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conversion Rate:</span>
                <span className="font-medium">
                  {customer.totalReferrals > 0
                    ? (
                        (customer.successfulReferrals /
                          customer.totalReferrals) *
                        100
                      ).toFixed(1) + "%"
                    : "0%"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Commission Rate:</span>
                <span className="font-medium">
                  {customer.commissionRate || 5}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone size={16} className="text-gray-400 mr-3" />
                <span className="text-gray-600">Phone:</span>
                <span className="ml-2 font-medium">{customer.phoneNumber}</span>
              </div>
              <div className="flex items-center">
                <Award size={16} className="text-gray-400 mr-3" />
                <span className="text-gray-600">Referral Code:</span>
                <span className="ml-2 font-medium text-blue-600">
                  {customer.referralCode}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar size={16} className="text-gray-400 mr-3" />
                <span className="text-gray-600">Member Since:</span>
                <span className="ml-2 font-medium">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Successful Referrals Table */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Successful Referrals
          </h3>
          {referralDetails.loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-500">Loading referral details...</p>
            </div>
          ) : referralDetails.successfulReferrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Phone
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Spent
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Orders Count
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Commission Generated
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Date Referred
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {referralDetails.successfulReferrals.map(
                    (referral, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {referral.name}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {referral.phoneNumber}
                        </td>
                        <td className="px-4 py-2 text-sm text-blue-600 font-medium">
                          ${(referral.totalAmountOrdered || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {referral.totalOrdersCount || 0}
                        </td>
                        <td className="px-4 py-2 text-sm text-green-600 font-medium">
                          ${(referral.commissionGenerated || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {referral.dateReferred
                            ? new Date(
                                referral.dateReferred
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No successful referrals found
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {!customer.isForemanApproved && (
            <button
              onClick={() => onForemanStatusUpdate(customer._id, true)}
              disabled={updating}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {updating ? "Processing..." : "Approve as Foreman"}
            </button>
          )}

          {customer.isForemanApproved && !customer.isCommissionEligible && (
            <button
              onClick={() => onCommissionEligibilityUpdate(customer._id, true)}
              disabled={updating}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {updating ? "Processing..." : "Enable Commission"}
            </button>
          )}

          {customer.isCommissionEligible &&
            (customer.availableCommission || 0) > 0 && (
              <button
                onClick={handlePayCommission}
                disabled={updating}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
              >
                {updating ? "Processing..." : "Pay Commission"}
              </button>
            )}

          {customer.isForemanApproved && (
            <button
              onClick={() => onForemanStatusUpdate(customer._id, false)}
              disabled={updating}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {updating ? "Processing..." : "Revoke Foreman Status"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
