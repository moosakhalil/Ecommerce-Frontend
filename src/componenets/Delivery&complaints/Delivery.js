import React, { useState, useRef, useEffect } from "react";
import {
  Check,
  Home,
  ChevronDown,
  MoreVertical,
  Package,
  Truck,
  Box,
  MapPin,
  User,
  Users,
  Clock,
  X,
  Bell,
  ShoppingBag,
  AlertTriangle,
  Bike,
  CheckCircle,
  LogOut,
  ArrowLeft,
  Menu,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Settings,
  TrendingUp,
  Zap,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/config";

const DeliveryComponent = () => {
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filters
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedDeliveryType, setSelectedDeliveryType] = useState("");
  const [selectedDriver1, setSelectedDriver1] = useState("");
  const [selectedDriver2, setSelectedDriver2] = useState("");

  // Complaint form state
  const [issueTypes, setIssueTypes] = useState([]);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [solutions, setSolutions] = useState([]);
  const [solutionDetails, setSolutionDetails] = useState("");
  const [customerRequests, setCustomerRequests] = useState([]);
  const [customerRequestDetails, setCustomerRequestDetails] = useState("");

  const modalRef = useRef(null);

  // Fetch allocated orders and drivers
  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, [selectedArea, selectedDeliveryType, selectedDriver1, selectedDriver2]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        status: "allocated-driver",
        limit: 100,
      };

      if (selectedArea) params.area = selectedArea;
      if (selectedDeliveryType) params.deliveryType = selectedDeliveryType;
      if (selectedDriver1) params.driver1 = selectedDriver1;
      if (selectedDriver2) params.driver2 = selectedDriver2;

      const { data } = await axios.get(
        `${API_BASE_URL}/api/orders`,
        {
          params,
        }
      );

      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/employees`,
        {
          params: { employeeCategory: "Driver" },
        }
      );
      setDrivers(data.data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setDrivers([]);
    }
  };

  const getDriverName = (driverId) => {
    const driver = drivers.find((d) => d.id === driverId || d._id === driverId);
    return driver ? driver.name : driverId;
  };

  // Close modal when clicking outside
  useEffect(() => {
    if (showComplaintForm) {
      const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
          setShowComplaintForm(false);
          resetComplaintForm();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showComplaintForm]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && showComplaintForm) {
        setShowComplaintForm(false);
        resetComplaintForm();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showComplaintForm]);

  const resetComplaintForm = () => {
    setIssueTypes([]);
    setAdditionalDetails("");
    setSolutions([]);
    setSolutionDetails("");
    setCustomerRequests([]);
    setCustomerRequestDetails("");
    setSelectedOrderId(null);
    setSelectedOrder(null);
  };

  const handleComplaint = (order) => {
    setSelectedOrderId(order.orderId);
    setSelectedOrder(order);
    setShowComplaintForm(true);
  };

  const handleIssueTypeChange = (type) => {
    setIssueTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSolutionChange = (solution) => {
    setSolutions((prev) =>
      prev.includes(solution)
        ? prev.filter((s) => s !== solution)
        : [...prev, solution]
    );
  };

  const handleCustomerRequestChange = (request) => {
    setCustomerRequests((prev) =>
      prev.includes(request)
        ? prev.filter((r) => r !== request)
        : [...prev, request]
    );
  };

  const handleSubmitComplaint = async () => {
    if (issueTypes.length === 0) {
      setError("Please select at least one issue type");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      setSubmitLoading(true);

      const complaintData = {
        issueTypes,
        additionalDetails,
        solutions,
        solutionDetails,
        customerRequests,
        customerRequestDetails,
        driverId: selectedOrder?.driver1 || "",
        driverName: getDriverName(selectedOrder?.driver1) || "",
      };

      await axios.post(
        `${API_BASE_URL}/api/orders/${selectedOrderId}/complaint`,
        complaintData
      );

      setSuccessMessage("Complaint submitted successfully");
      setShowComplaintForm(false);
      resetComplaintForm();
      fetchOrders();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setError("Error submitting complaint. Please try again.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleViewAllComplaints = () => {
    window.location.href = "/complaints";
  };

  const getDeliveryTypeIcon = (type) => {
    switch (type) {
      case "truck":
        return <Truck className="w-5 h-5" />;
      case "scooter":
        return <Bike className="w-5 h-5" />;
      case "self_pickup":
        return <Package className="w-5 h-5" />;
      default:
        return <Truck className="w-5 h-5" />;
    }
  };

  const getDeliveryTypeLabel = (type) => {
    switch (type) {
      case "truck":
        return "Truck Delivery";
      case "scooter":
        return "Scooter Delivery";
      case "self_pickup":
        return "Self Pickup";
      default:
        return type;
    }
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(
    (order) =>
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDriverName(order.driver1)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getDriverName(order.driver2)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Truck size={24} />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Delivery Management
                </span>
                <div className="text-xs text-gray-500 font-medium">
                  Order Allocation System
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-2"
              >
                <Home size={16} />
                Dashboard
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("refreshToken");
                  localStorage.removeItem("user");
                  window.location.href = "/";
                }}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b shadow-sm">
          <div className="px-4 py-2 space-y-1">
            <button
              onClick={() => {
                window.location.href = "/dashboard";
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-2"
            >
              <Home size={16} />
              Dashboard
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20"></div>
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <div className="flex items-center gap-6 mb-4">
                    <button
                      onClick={() => (window.location.href = "/dashboard")}
                      className="flex items-center gap-3 text-white/80 hover:text-white transition-colors bg-white/10 rounded-xl px-6 py-3 backdrop-blur-sm border border-white/20 hover:bg-white/20"
                    >
                      <ArrowLeft size={20} />
                      <span className="font-semibold">Back to Dashboard</span>
                    </button>
                  </div>
                  <h1 className="text-4xl font-bold mb-2">
                    Delivery Management
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Order Allocation System
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                      <Zap className="text-yellow-400" size={16} />
                      <span className="text-sm font-medium">
                        Active Delivery Tracking
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                      <TrendingUp className="text-blue-400" size={16} />
                      <span className="text-sm font-medium">
                        {filteredOrders.length} Allocated Orders
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <button className="relative p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                    <Bell className="text-white" size={20} />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  </button>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {localStorage.getItem("user")
                      ? JSON.parse(localStorage.getItem("user"))
                          .username?.charAt(0)
                          ?.toUpperCase()
                      : "U"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl flex items-center">
              <CheckCircle className="mr-3 flex-shrink-0" size={20} />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl flex items-center">
              <AlertCircle className="mr-3 flex-shrink-0" size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-1 max-w-md items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search by order ID, customer, or driver..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                  />
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                <Truck size={18} />
                <span className="font-semibold">
                  Showing {filteredOrders.length} of {orders.length} orders
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              {/* Pick an area */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    Pick an area
                  </span>
                </label>
                <div className="relative">
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                  >
                    <option value="">All Areas</option>
                    <option value="North Bali">North Bali</option>
                    <option value="South Bali">South Bali</option>
                    <option value="East Bali">East Bali</option>
                    <option value="West Bali">West Bali</option>
                    <option value="Central Bali">Central Bali</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 pointer-events-none text-gray-500" />
                </div>
              </div>

              {/* Delivery Type */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    Delivery Type
                  </span>
                </label>
                <div className="relative">
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={selectedDeliveryType}
                    onChange={(e) => setSelectedDeliveryType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="truck">Truck Delivery</option>
                    <option value="scooter">Scooter Delivery</option>
                    <option value="self_pickup">Self Pickup</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 pointer-events-none text-gray-500" />
                </div>
              </div>

              {/* Pick driver 1 */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    Driver 1
                  </span>
                </label>
                <div className="relative">
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={selectedDriver1}
                    onChange={(e) => setSelectedDriver1(e.target.value)}
                  >
                    <option value="">All Drivers</option>
                    {drivers.map((driver) => (
                      <option
                        key={driver.id || driver._id}
                        value={driver.id || driver._id}
                      >
                        {driver.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 pointer-events-none text-gray-500" />
                </div>
              </div>

              {/* Pick driver 2 */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Driver 2
                  </span>
                </label>
                <div className="relative">
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={selectedDriver2}
                    onChange={(e) => setSelectedDriver2(e.target.value)}
                  >
                    <option value="">All Drivers</option>
                    {drivers.map((driver) => (
                      <option
                        key={driver.id || driver._id}
                        value={driver.id || driver._id}
                      >
                        {driver.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 pointer-events-none text-gray-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Order Count and Info */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
            <div className="flex items-center gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span className="font-medium">Total Orders:</span>
                <span className="font-semibold text-indigo-600">
                  {filteredOrders.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span className="font-medium">Status:</span>
                <span className="text-green-600 font-semibold">
                  Allocated for Delivery
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading allocated orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No allocated orders found
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Try adjusting your filters or check back later
                </p>
              </div>
            ) : (
              filteredOrders.map((order, index) => (
                <div
                  key={order.orderId}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                >
                  <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium text-gray-800">
                          Order {index + 1} of {order.orderId}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          Fully allocated
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {getDeliveryTypeIcon(order.deliveryType)}
                        <span>{getDeliveryTypeLabel(order.deliveryType)}</span>
                      </div>
                    </div>
                    <button
                      className="px-4 py-2 bg-white border border-red-300 rounded-xl shadow-sm hover:bg-red-50 flex items-center justify-center gap-2 text-red-600 text-sm font-medium transition-colors"
                      onClick={() => handleComplaint(order)}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Report Issue
                    </button>
                  </div>

                  {/* Order Details */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">
                          Customer:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {order.customer}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Amount:
                        </span>
                        <span className="ml-2 text-green-600 font-semibold">
                          ${order.totalAmount}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Time Slot:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {order.timeSlot || "Not specified"}
                        </span>
                      </div>
                    </div>
                    {order.deliveryAddress && (
                      <div className="mt-4 text-sm">
                        <span className="font-medium text-gray-700">
                          Address:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {order.deliveryAddress.fullAddress}
                        </span>
                      </div>
                    )}
                    <div className="mt-4 text-sm">
                      <span className="font-medium text-gray-700">
                        Drivers:
                      </span>
                      <span className="ml-2 text-gray-900">
                        {getDriverName(order.driver1)},{" "}
                        {getDriverName(order.driver2)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.items &&
                    order.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="p-4 border-b border-gray-100 flex justify-between items-center"
                      >
                        <div className="flex items-center">
                          <div className="mr-4 bg-gray-100 p-3 rounded-xl">
                            <Package className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">
                              {item.productName}
                            </div>
                            <div className="text-xs text-gray-500">
                              Qty: {item.quantity}{" "}
                              {item.weight && `(${item.weight})`}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          ${item.totalPrice}
                        </div>
                      </div>
                    ))}
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center mt-6">
            <button
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 border border-indigo-700 rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-2 text-white font-medium transition-colors"
              onClick={handleViewAllComplaints}
            >
              <AlertCircle className="w-5 h-5" />
              View All Complaints
            </button>
          </div>
        </div>
      </main>

      {/* Complaint Form Modal */}
      {showComplaintForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-auto">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="bg-indigo-900 text-white p-6 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-bold">
                Report Issue for Order #{selectedOrderId}
              </h2>
              <button
                onClick={() => {
                  setShowComplaintForm(false);
                  resetComplaintForm();
                }}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-4">
                  Select issue type:
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "broken", label: "Broken" },
                    {
                      value: "not_what_ordered",
                      label: "Not what was ordered",
                    },
                    { value: "missing_amount", label: "Missing amount" },
                    { value: "other", label: "Other" },
                  ].map((issue) => (
                    <label
                      key={issue.value}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="mr-2 form-checkbox text-indigo-600"
                        checked={issueTypes.includes(issue.value)}
                        onChange={() => handleIssueTypeChange(issue.value)}
                      />
                      <span>{issue.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Additional details
                </label>
                <textarea
                  className="w-full h-32 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe the issue in detail..."
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                ></textarea>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Solution:</h3>
                <div className="space-y-3">
                  {[
                    {
                      value: "customer_keeps_product",
                      label: "Customer keeps product",
                    },
                    {
                      value: "customer_returns_with_truck",
                      label: "Customer returns with truck",
                    },
                  ].map((solution) => (
                    <label
                      key={solution.value}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="mr-2 form-checkbox text-indigo-600"
                        checked={solutions.includes(solution.value)}
                        onChange={() => handleSolutionChange(solution.value)}
                      />
                      <span>{solution.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Solution details
                </label>
                <textarea
                  className="w-full h-32 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Provide details about the solution..."
                  value={solutionDetails}
                  onChange={(e) => setSolutionDetails(e.target.value)}
                ></textarea>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">
                  Solution customer asks for:
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      value: "customer_asks_cancellation",
                      label: "Customer asks for cancellation",
                    },
                    {
                      value: "customer_asks_replacement",
                      label: "Customer asks for replacement",
                    },
                  ].map((request) => (
                    <label
                      key={request.value}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="mr-2 form-checkbox text-indigo-600"
                        checked={customerRequests.includes(request.value)}
                        onChange={() =>
                          handleCustomerRequestChange(request.value)
                        }
                      />
                      <span>{request.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Customer request details
                </label>
                <textarea
                  className="w-full h-32 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Provide details about what the customer is requesting..."
                  value={customerRequestDetails}
                  onChange={(e) => setCustomerRequestDetails(e.target.value)}
                ></textarea>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                  onClick={() => {
                    setShowComplaintForm(false);
                    resetComplaintForm();
                  }}
                  disabled={submitLoading}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-indigo-600 border border-indigo-700 rounded-lg hover:bg-indigo-700 text-white font-medium transition-colors disabled:bg-indigo-400"
                  onClick={handleSubmitComplaint}
                  disabled={submitLoading}
                >
                  {submitLoading ? "Submitting..." : "Submit Complaint"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryComponent;
