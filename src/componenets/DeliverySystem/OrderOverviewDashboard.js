import React, { useState, useEffect, useRef } from "react";
import ModeToggle from "../Shared/ModeToggle";
import {
  Clock,
  CheckCircle,
  Archive,
  Target,
  Navigation,
  Search,
  Calendar,
  MapPin,
  AlertTriangle,
  Package,
  Users,
  Building,
  Truck,
  User,
  Phone,
  FileText,
  X,
  Eye,
  MessageCircle,
  ExternalLink,
  Mail,
  CreditCard,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";
import { API_BASE_URL } from "../../utils/config";

const OrderOverviewDashboard = ({ selectedRole, setSelectedRole }) => {
  const [orders, setOrders] = useState([]);
  const [workflowStatus, setWorkflowStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showModeToggle, setShowModeToggle] = useState(false);

  const lastFetchTime = useRef(0);
  const fetchIntervalRef = useRef(null);
  const lastOrdersRef = useRef("");
  const lastStatusRef = useRef("");

  const enrichOrderWithCustomerData = (order) => {
    return {
      ...order,

      // ✅ Location/Area display - from cart.deliveryAddress.area
      location: order.area || order.location || "Unknown Area",
      area: order.area || order.location || "Unknown Area",

      // ✅ Full address for modal - extracted from multiple sources
      fullAddress: order.fullAddress || order.address || "Address not provided",

      // ✅ Address nickname if available
      addressNickname: order.addressNickname || "",

      // ✅ Google Maps link - from contextData.locationDetails
      googleMapLink: order.googleMapLink || order.mapLink || "",
      mapLink: order.googleMapLink || order.mapLink || "",
    };
  };

  useEffect(() => {
    // Fetch data immediately on mount
    fetchOrders();
    fetchWorkflowStatus();

    // Set up polling every 30 seconds (increased from 10s for better performance)
    fetchIntervalRef.current = setInterval(() => {
      fetchOrders();
      fetchWorkflowStatus();
    }, 30000);

    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "All Status") params.append("status", statusFilter);
      if (priorityFilter !== "All Priorities")
        params.append("priority", priorityFilter);

      // ✅ FETCH ONLY CONFIRMED ORDERS from delivery API
      const response = await fetch(
        `${API_BASE_URL}/api/delivery/orders/overview?${params}`,
      );
      const data = await response.json();

      // FIX: Ensure data is always an array
      const ordersArray = Array.isArray(data) ? data : [];

      // ✅ Simple enrichment
      const enrichedOrders = ordersArray.map((order) =>
        enrichOrderWithCustomerData(order),
      );

      const newOrdersStr = JSON.stringify(enrichedOrders);
      if (newOrdersStr !== lastOrdersRef.current) {
        setOrders(enrichedOrders);
        lastOrdersRef.current = newOrdersStr;
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setLoading(false);
    }
  };

  const fetchWorkflowStatus = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/delivery/workflow-status`,
      );
      const data = await response.json();

      const statusArray = [
        { label: "Pending", count: data.pending || 0, icon: Clock },
        { label: "Packed", count: data.packed || 0, icon: CheckCircle },
        { label: "Storage", count: data.storage || 0, icon: Archive },
        { label: "Assigned", count: data.assigned || 0, icon: Target },
        { label: "Loaded", count: data.loaded || 0, icon: CheckCircle },
        { label: "In Transit", count: data.inTransit || 0, icon: Navigation },
        { label: "Delivered", count: data.delivered || 0, icon: CheckCircle },
      ];

      const newStatusStr = JSON.stringify(statusArray);
      if (newStatusStr !== lastStatusRef.current) {
        setWorkflowStatus(statusArray);
        lastStatusRef.current = newStatusStr;
      }
    } catch (error) {
      console.error("Error fetching workflow status:", error);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/delivery/orders/${orderId}/details`,
      );
      const data = await response.json();
      setSelectedOrder(data);
      setShowOrderModal(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const sendWhatsAppMessage = async (
    orderId,
    messageType = "general_inquiry",
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/delivery/orders/${orderId}/whatsapp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messageType: messageType,
          }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        window.open(result.whatsappUrl, "_blank");
        alert(`WhatsApp message prepared for ${result.customerPhone}`);
      } else {
        const error = await response.json();
        alert(`Failed to prepare WhatsApp message: ${error.error}`);
      }
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      alert("Failed to prepare WhatsApp message");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border border-red-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "In Transit":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Loaded":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Assigned":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "Packing":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Pending":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "Delivered":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "Storage":
        return "bg-indigo-100 text-indigo-800 border border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const filteredOrders = Array.isArray(orders)
    ? orders.filter((order) => {
        const matchesSearch =
          !searchQuery ||
          order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.phone?.includes(searchQuery) ||
          order.location?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "All Status" || order.status === statusFilter;

        const matchesPriority =
          priorityFilter === "All Priorities" ||
          order.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      })
    : [];

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Order #{order.orderId}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Information */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200">
                <h3 className="text-lg font-bold mb-4 text-blue-900 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Customer Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold text-gray-700">Name:</span>{" "}
                    <span className="text-gray-900">
                      {order.customer?.name || "N/A"}
                    </span>
                  </p>
                  <p className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-semibold text-gray-700">
                      Phone:
                    </span>{" "}
                    <span className="text-gray-900 ml-2">
                      {order.customer?.phone || "N/A"}
                    </span>
                  </p>
                  <p className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-semibold text-gray-700">
                      Email:
                    </span>{" "}
                    <span className="text-gray-900 ml-2">
                      {order.customer?.email || "Not provided"}
                    </span>
                  </p>
                  <p className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                    <div>
                      <span className="font-semibold text-gray-700">
                        Address:
                      </span>

                      {/* ✅ FULL ADDRESS - from multiple sources */}
                      <p className="text-gray-900 font-medium">
                        {order.customer?.address?.fullAddress ||
                          order.fullAddress ||
                          "Address not provided"}
                      </p>

                      {/* ✅ AREA - from cart.deliveryAddress.area */}
                      <p className="text-xs text-gray-600 mt-2">
                        <span className="font-semibold">Area:</span>{" "}
                        <span className="text-gray-700">
                          {order.customer?.address?.area ||
                            order.area ||
                            "Area not specified"}
                        </span>
                      </p>

                      {/* ✅ ADDRESS NICKNAME - if available */}
                      {(order.customer?.address?.nickname ||
                        order.addressNickname) && (
                        <p className="text-xs text-gray-600 mt-1">
                          <span className="font-semibold">Nickname:</span>{" "}
                          <span className="text-gray-700">
                            {order.customer?.address?.nickname ||
                              order.addressNickname}
                          </span>
                        </p>
                      )}

                      {(order.customer?.address?.googleMapLink ||
                        order.googleMapLink) && (
                        <a
                          href={
                            order.customer?.address?.googleMapLink ||
                            order.googleMapLink
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-xs hover:underline flex items-center mt-2 font-medium"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          View on Google Maps
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                    </div>
                  </p>
                </div>
              </div>

              {/* Order Information */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border border-green-200">
                <h3 className="text-lg font-bold mb-4 text-green-900 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold text-gray-700">
                      Order Value:
                    </span>
                    <span className="text-green-700 font-bold ml-2">
                      AED {order.totalAmount?.toFixed(2) || "0.00"}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Items:</span>
                    <span className="ml-2">{order.itemsCount || 0}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Status:</span>
                    <span
                      className={`ml-2 px-3 py-1 text-xs font-bold rounded-full inline-block ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">
                      Delivery Date:
                    </span>
                    <span className="ml-2">
                      {order.deliveryDateRaw
                        ? new Date(order.deliveryDateRaw).toLocaleDateString()
                        : "Not scheduled"}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">
                      Time Slot:
                    </span>
                    <span className="ml-2">{order.timeSlot || "N/A"}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Driver:</span>
                    <span className="ml-2">
                      {order.driver1 || order.driver2 || "Not assigned"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3 text-gray-900">
                Order Items ({order.itemsCount || 0})
              </h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full bg-white">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Item
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Weight
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.itemsArray && order.itemsArray.length > 0 ? (
                      order.itemsArray.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {item.productName || "Unknown Product"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {item.quantity || 0}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {item.weight || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-right text-green-700">
                            AED {item.totalPrice?.toFixed(2) || "0.00"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-4 py-3 text-center text-gray-500"
                        >
                          No items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <h3 className="text-sm font-bold mb-2 flex items-center text-orange-900">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                  Special Instructions
                </h3>
                <p className="text-orange-800 text-sm">
                  {order.specialInstructions}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3 border-t pt-4">
              <button
                onClick={() =>
                  sendWhatsAppMessage(order.orderId, "status_update")
                }
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp Customer
              </button>
              <button
                onClick={() =>
                  sendWhatsAppMessage(order.orderId, "delivery_notification")
                }
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Phone className="h-4 w-4 mr-2" />
                Delivery Update
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-gray-600">
            Complete workflow from order confirmation to delivery
          </p>
        </div>

        {/* Live Workflow Status */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              📊 Live Workflow Status
            </h2>
            <div className="flex items-center space-x-2 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Updates every 10s</span>
            </div>
          </div>
          <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200 p-2">
            <div className="grid grid-cols-7 gap-3 min-w-max">
              {workflowStatus.map((status, index) => {
                const IconComponent = status.icon;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center p-4 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all min-w-[140px]"
                  >
                    <div className="p-3 rounded-full bg-blue-100 mb-2">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-sm font-semibold text-gray-700 text-center">
                      {status.label}
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mt-1">
                      {status.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            🔍 Search & Filter
          </h2>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by order ID, customer, phone, or area..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white font-medium"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Pending</option>
              <option>Packing</option>
              <option>Assigned</option>
              <option>In Transit</option>
              <option>Delivered</option>
              <option>Storage</option>
            </select>
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white font-medium"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option>All Priorities</option>
              <option>HIGH</option>
              <option>MEDIUM</option>
              <option>LOW</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                📋 Orders Overview
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Total: {filteredOrders.length} orders
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-full border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Live Feed Active</span>
            </div>
          </div>

          {loading && orders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 px-6">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className="text-sm font-bold text-gray-900 block">
                            {order.id}
                          </span>
                          <span className="text-xs text-gray-500">
                            {order.items}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <span className="text-sm font-semibold text-gray-900 block">
                            {order.customer || "Unknown"}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {order.phone || "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                          <div className="w-full">
                            {/* AREA */}
                            <span className="text-sm font-semibold text-gray-900 block">
                              {order.area || order.location || "Unknown Area"}
                            </span>

                            {/* ADDRESS NICKNAME */}
                            {order.addressNickname && (
                              <span className="text-xs text-gray-500 block mt-0.5">
                                ({order.addressNickname})
                              </span>
                            )}

                            {/* GOOGLE MAP LINK */}
                            {order.googleMapLink && (
                              <a
                                href={order.googleMapLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center mt-1 font-medium"
                              >
                                <MapPin className="h-3 w-3 mr-1" />
                                View Map
                                <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-green-600">
                          {order.amount || "N/A"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(
                              order.status,
                            )}`}
                          >
                            {order.status}
                          </span>
                          {order.hasComplaints && (
                            <div className="text-xs text-red-600 mt-2 flex items-center font-medium">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Complaints
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${getPriorityColor(
                            order.priority,
                          )}`}
                        >
                          {order.priority}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          {[
                            { key: "pending", label: "P" },
                            { key: "packed", label: "K" },
                            { key: "storage", label: "S" },
                            { key: "assigned", label: "A" },
                            { key: "loaded", label: "L" },
                            { key: "inTransit", label: "T" },
                            { key: "delivered", label: "D" },
                          ].map((step) => (
                            <div
                              key={step.key}
                              className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full transition-all ${
                                order.progress?.[step.key]
                                  ? "bg-green-500 text-white shadow-md"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                              title={step.key}
                            >
                              {order.progress?.[step.key] ? "✓" : step.label}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => fetchOrderDetails(order.id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => sendWhatsAppMessage(order.id)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                            title="WhatsApp Customer"
                          >
                            <MessageCircle className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showOrderModal && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => {
              setShowOrderModal(false);
              setSelectedOrder(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default OrderOverviewDashboard;
