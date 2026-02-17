import React, { useState, useEffect, useRef, useCallback } from "react";
import ModeToggle from "../Shared/ModeToggle";
import {
  Clock,
  CheckCircle,
  Package,
  Building,
  Truck,
  User,
  Phone,
  FileText,
  Navigation,
  X,
  Eye,
  MapPin,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Download,
  MessageCircle,
  Mail,
  ExternalLink,
  Award,
  TrendingUp,
} from "lucide-react";
import { API_BASE_URL } from "../../utils/config";

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 sticky top-0 bg-white border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Order #{order.orderId}
                </h2>
              </div>
              <p className="text-sm text-green-600 font-medium mt-1">
                ✓ Successfully Delivered
              </p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer & Delivery Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-4 text-blue-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <p className="text-gray-900 font-semibold">
                    {order.customerName || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <p className="text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-blue-600" />
                    {order.customerPhone || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-blue-600" />
                    {order.customerEmail || "Not provided"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Address:</span>
                  <p className="text-gray-900 mt-1">
                    {order.fullAddress || "Address not provided"}
                  </p>
                  {order.area && (
                    <p className="text-xs text-gray-600 mt-1">
                      Area: {order.area}
                    </p>
                  )}
                  {order.googleMapLink && (
                    <a
                      href={order.googleMapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-xs hover:underline flex items-center mt-2"
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      View on Google Maps
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-green-50 p-5 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold mb-4 text-green-900 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Delivery Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">
                    Order Amount:
                  </span>
                  <p className="text-green-700 font-bold text-lg">
                    AED {order.totalAmount?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Delivered On:
                  </span>
                  <p className="text-gray-900 font-semibold">
                    {formatDateTime(order.deliveredAt)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Driver:</span>
                  <p className="text-gray-900">
                    {order.driverName || "Not recorded"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Payment Method:
                  </span>
                  <p className="text-gray-900">
                    {order.paymentMethod || "Not specified"}
                  </p>
                </div>
                {order.deliveryNotes && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Delivery Notes:
                    </span>
                    <p className="text-gray-900 mt-1">{order.deliveryNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              Order Items ({order.itemsCount || 0})
            </h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Item
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Quantity
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Weight
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          {item.productName || "Unknown Product"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {item.quantity || 0}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {item.weight || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-right text-green-700">
                          AED {item.totalPrice?.toFixed(2) || "0.00"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-3 px-4 text-center text-gray-500"
                      >
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">
                Delivery Timeline
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="space-y-3">
                  {order.timeline.map((event, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {event.status}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDateTime(event.timestamp)}
                        </p>
                        {event.notes && (
                          <p className="text-xs text-gray-500 mt-1">
                            {event.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <div className="flex space-x-3">
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Customer
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeliveredOrdersDashboard = ({ selectedRole, setSelectedRole }) => {
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [stats, setStats] = useState({
    totalDelivered: 0,
    todayDelivered: 0,
    totalRevenue: 0,
    averageDeliveryTime: "0 min",
  });
  const [showModeToggle, setShowModeToggle] = useState(false);

  const pollIntervalRef = useRef(null);
  const lastFetchRef = useRef({});

  const roleButtons = [
    { name: "Order Overview", icon: Package },
    { name: "Packing Staff", icon: Package },
    { name: "Delivery Storage Officer", icon: Building },
    { name: "Dispatch Officer 1", icon: User },
    { name: "Dispatch Officer 2", icon: User },
    { name: "Driver", icon: Truck },
    { name: "Driver on Delivery", icon: Navigation },
    { name: "Delivered Orders", icon: CheckCircle },
  ];

  const secondRowRoles = [
    { name: "Complaint Manager on Delivery", icon: Phone },
    { name: "Complaint Manager After Delivery", icon: FileText },
  ];

  useEffect(() => {
    fetchDeliveredOrders();
    fetchStats();

    pollIntervalRef.current = setInterval(() => {
      fetchDeliveredOrders();
      fetchStats();
    }, 30000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [dateFilter]);

  const fetchDeliveredOrders = useCallback(async () => {
    try {
      // ✅ Fetch only DELIVERED/COMPLETED orders
      const deliveredStatuses = ["order-complete", "order-processed"];

      const params = new URLSearchParams();
      params.append("statuses", deliveredStatuses.join(","));
      if (dateFilter !== "all") params.append("dateFilter", dateFilter);

      const response = await fetch(
        `${API_BASE_URL}/api/delivery/delivered-orders?${params}`,
      );
      const data = await response.json();

      const newHash = JSON.stringify(data);
      if (lastFetchRef.current.orders !== newHash) {
        setDeliveredOrders(Array.isArray(data) ? data : []);
        lastFetchRef.current.orders = newHash;
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching delivered orders:", error);
      setDeliveredOrders([]);
      setLoading(false);
    }
  }, [dateFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/delivery/delivered-stats`,
      );
      const data = await response.json();

      const newHash = JSON.stringify(data);
      if (lastFetchRef.current.stats !== newHash) {
        setStats({
          totalDelivered: data.totalDelivered || 0,
          todayDelivered: data.todayDelivered || 0,
          totalRevenue: data.totalRevenue || 0,
          averageDeliveryTime: data.averageDeliveryTime || "0 min",
        });
        lastFetchRef.current.stats = newHash;
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

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

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "order-complete":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "order-processed":
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "order-complete":
        return "Complete";
      case "order-processed":
        return "Processed";
      default:
        return status;
    }
  };

  const filteredOrders = deliveredOrders.filter((order) => {
    const matchesSearch =
      !searchQuery ||
      order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone?.includes(searchQuery) ||
      order.area?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <strong>210.</strong> Delivered Orders Dashboard
              </h2>
              <p className="text-gray-600">
                View all successfully delivered orders (order-complete &
                order-processed)
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total Delivered
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.totalDelivered}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Today's Deliveries
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.todayDelivered}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    AED {stats.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Avg Delivery Time
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.averageDeliveryTime}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer, phone, or area..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <button className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Delivered Orders ({filteredOrders.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">
                  Loading delivered orders...
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-9 gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <div>Order ID</div>
                  <div>Customer</div>
                  <div>Area</div>
                  <div>Amount</div>
                  <div>Status</div>
                  <div>Delivered On</div>
                  <div>Time</div>
                  <div>Driver</div>
                  <div>Actions</div>
                </div>

                <div className="divide-y divide-gray-200">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order, index) => (
                      <div
                        key={`order-${index}`}
                        className="grid grid-cols-9 gap-4 px-6 py-4 hover:bg-gray-50"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {order.orderId}
                          </div>
                          <div className="text-xs text-green-600 flex items-center mt-1">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Delivered
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customerName || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.customerPhone || "N/A"}
                          </div>
                        </div>
                        <div className="text-sm text-gray-900">
                          {order.area || "N/A"}
                        </div>
                        <div className="text-sm font-semibold text-green-600">
                          AED {order.totalAmount?.toFixed(2) || "0.00"}
                        </div>
                        <div>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                              order.status,
                            )}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-900">
                          {formatDate(order.deliveredAt)}
                        </div>
                        <div className="text-sm text-gray-900">
                          {formatTime(order.deliveredAt)}
                        </div>
                        <div className="text-sm text-gray-900">
                          {order.driverName || "N/A"}
                        </div>
                        <div>
                          <button
                            onClick={() => fetchOrderDetails(order.orderId)}
                            className="flex items-center px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No delivered orders found
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

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

export default DeliveredOrdersDashboard;
