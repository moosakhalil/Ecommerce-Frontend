import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Edit,
  Search,
  ChevronDown,
  MoreHorizontal,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  Package,
  DollarSign,
  MessageSquare,
  Send,
  User,
  Lock,
  Unlock,
  ChevronRight,
} from "lucide-react";

const CustomerDetail = () => {
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("All");
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [orderSearch, setOrderSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phoneNumber: "",
    email: "",
  });

  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch customer details
  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/customers/${id}`
      );
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Customer not found");
        }
        throw new Error("Failed to fetch customer details");
      }

      const data = await response.json();
      setCustomer(data);
      setEditForm({
        name: data.name || "",
        phoneNumber: data.phoneNumber?.[0] || "",
        email: data.email || "",
      });
    } catch (err) {
      setError(err.message);
      console.error("Error fetching customer:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer orders
  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({
        page: ordersPage.toString(),
        limit: "10",
      });

      if (selectedTab !== "All") {
        params.append("status", selectedTab);
      }

      const response = await fetch(
        `http://localhost:5000/api/customers/${id}/orders?${params}`
      );
      if (!response.ok) throw new Error("Failed to fetch orders");

      const data = await response.json();
      setOrders(data.orders || []);
      setOrdersTotal(data.total || 0);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  // Fetch chat history
  const fetchChatHistory = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/customers/${id}/chat`
      );
      if (!response.ok) throw new Error("Failed to fetch chat history");

      const data = await response.json();
      setChatHistory(data.chatHistory || []);
    } catch (err) {
      console.error("Error fetching chat history:", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCustomer();
      fetchChatHistory();
    }
  }, [id]);

  useEffect(() => {
    if (customer) {
      fetchOrders();
    }
  }, [customer, selectedTab, ordersPage]);

  // Handle customer update
  const handleUpdateCustomer = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/customers/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        }
      );

      if (!response.ok) throw new Error("Failed to update customer");

      await fetchCustomer(); // Refresh data
      setEditMode(false);
      alert("Customer updated successfully");
    } catch (err) {
      alert("Error updating customer: " + err.message);
    }
  };

  // Handle block/unblock customer
  const handleToggleBlock = async () => {
    const isBlocked = customer.conversationState === "blocked";
    const action = isBlocked ? "unblock" : "block";

    if (!window.confirm(`Are you sure you want to ${action} this customer?`))
      return;

    try {
      const url = isBlocked
        ? `http://localhost:5000/api/customers/${id}/unblock`
        : `http://localhost:5000/api/customers/${id}`;
      const method = isBlocked ? "PUT" : "DELETE";

      const response = await fetch(url, { method });
      if (!response.ok) throw new Error(`Failed to ${action} customer`);

      await fetchCustomer(); // Refresh data
      alert(`Customer ${action}ed successfully`);
    } catch (err) {
      alert(`Error ${action}ing customer: ` + err.message);
    }
  };

  // Add note
  const handleAddNote = async () => {
    if (!notes.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/customers/${id}/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            note: notes,
            employeeName: "Admin", // You can replace this with actual logged-in user
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add note");

      setNotes("");
      await fetchChatHistory(); // Refresh chat
    } catch (err) {
      alert("Error adding note: " + err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const getOrderStatusColor = (status) => {
    const statusColors = {
      "cart-not-paid": "bg-gray-200 text-gray-800",
      "order-made-not-paid": "bg-yellow-200 text-yellow-800",
      "order-confirmed": "bg-green-200 text-green-800",
      "picking-order": "bg-blue-200 text-blue-800",
      "allocated-driver": "bg-indigo-200 text-indigo-800",
      "on-way": "bg-purple-200 text-purple-800",
      "order-complete": "bg-green-100 text-green-800",
      "order-refunded": "bg-red-200 text-red-800",
      "complain-order": "bg-orange-200 text-orange-800",
    };
    return statusColors[status] || "bg-gray-200 text-gray-800";
  };

  const orderStatuses = [
    "All",
    "cart-not-paid",
    "order-confirmed",
    "picking-order",
    "allocated-driver",
    "on-way",
    "order-complete",
    "order-refunded",
  ];

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin h-8 w-8 text-purple-600" />
          <span className="ml-2 text-lg">Loading customer details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <h3 className="font-medium">Error Loading Customer</h3>
            <p>{error}</p>
            <button
              onClick={() => navigate("/customers")}
              className="mt-2 text-sm underline"
            >
              Back to Customers
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="w-full p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Customer not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const isBlocked = customer.conversationState === "blocked";

  return (
    <div className="w-full p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/customers")}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold">Customer Detail</h1>
            {isBlocked && (
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                Blocked
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchCustomer}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  4
                </div>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-600"></div>
            <button
              onClick={() => navigate(`/customers/${id}/chat`)}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              View Chat
            </button>
          </div>
        </div>

        {/* Info Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Info */}
          <div className="lg:col-span-2 bg-gray-50 p-6 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">
                PERSONAL INFORMATION
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200"
                  title="Edit customer"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={handleToggleBlock}
                  className={`p-2 rounded-lg ${
                    isBlocked
                      ? "text-green-500 hover:text-green-600 hover:bg-green-50"
                      : "text-red-500 hover:text-red-600 hover:bg-red-50"
                  }`}
                  title={isBlocked ? "Unblock customer" : "Block customer"}
                >
                  {isBlocked ? <Unlock size={16} /> : <Lock size={16} />}
                </button>
              </div>
            </div>

            {editMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={editForm.phoneNumber}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          phoneNumber: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateCustomer}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold">
                    {customer.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-xl font-semibold">
                      {customer.name || "Unknown"}
                    </p>
                    <p className="text-gray-500">
                      {customer.email || "No email provided"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className="text-gray-400" />
                    <div>
                      <span className="font-medium">WhatsApp Number</span>
                      <br />
                      {customer.phoneNumber?.[0] || "Not provided"}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-gray-400" />
                    <div>
                      <span className="font-medium">Member Since</span>
                      <br />
                      {formatDate(customer.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail size={16} className="text-gray-400" />
                    <div>
                      <span className="font-medium">Email</span>
                      <br />
                      {customer.email || "Not provided"}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare size={16} className="text-gray-400" />
                    <div>
                      <span className="font-medium">Last Interaction</span>
                      <br />
                      {formatDateTime(customer.lastInteraction)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Statistics */}
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">STATISTICS</span>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Total Spent</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">2023:</span>
                    <span className="font-semibold ml-1">
                      {formatCurrency(customer.statistics?.spending?.year2023)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">2024:</span>
                    <span className="font-semibold ml-1">
                      {formatCurrency(customer.statistics?.spending?.year2024)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Lifetime:</span>
                    <span className="font-semibold ml-1">
                      {formatCurrency(customer.statistics?.spending?.lifetime)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 text-center border-t pt-4">
                <div>
                  <p className="text-xl font-bold text-gray-800">
                    {customer.statistics?.totalOrders || 0}
                  </p>
                  <p className="text-sm text-gray-600">Total Orders</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-green-600">
                    {customer.statistics?.completedOrders || 0}
                  </p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-red-600">
                    {customer.statistics?.cancelledOrders || 0}
                  </p>
                  <p className="text-sm text-gray-600">Cancelled</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="lg:col-span-3 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-gray-600 font-medium mb-4">
              Most Ordered Products
            </h2>
            {customer.topProducts && customer.topProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {customer.topProducts.map((product, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 bg-white rounded border"
                  >
                    <span className="text-gray-700">
                      {idx + 1}. {product.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      ×{product.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No order history available.</p>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Order History</h2>

          {/* Tabs */}
          <div className="flex space-x-4 border-b border-gray-200 pb-2 mb-4 overflow-x-auto">
            {orderStatuses.map((status) => (
              <button
                key={status}
                className={`pb-2 px-2 whitespace-nowrap ${
                  selectedTab === status
                    ? "border-b-2 border-orange-500 text-orange-500 font-medium"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => {
                  setSelectedTab(status);
                  setOrdersPage(1);
                }}
              >
                {status === "All" ? "All" : status.replace(/-/g, " ")}
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by order id"
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
            <button className="text-gray-600 hover:text-gray-800 flex items-center">
              Filter by date range <ChevronDown size={16} className="ml-1" />
            </button>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 text-sm border-b border-gray-200">
                  <th className="py-3 pr-4">ORDER ID</th>
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-4">ITEMS</th>
                  <th className="py-3 px-4">TOTAL</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 pl-4">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .filter(
                    (order) =>
                      !orderSearch ||
                      order.orderId
                        .toLowerCase()
                        .includes(orderSearch.toLowerCase())
                  )
                  .map((order, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 pr-4">
                        <span
                          className="font-medium text-blue-600 cursor-pointer hover:underline"
                          onClick={() => navigate(`/orders/${order.orderId}`)}
                        >
                          {order.orderId}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {order.items?.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="text-gray-600">
                              {item.productName} × {item.quantity}
                            </div>
                          ))}
                          {order.items?.length > 2 && (
                            <div className="text-gray-500 text-xs">
                              +{order.items.length - 2} more items
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status?.replace(/-/g, " ") || "Unknown"}
                        </span>
                      </td>
                      <td className="py-3 pl-4">
                        <button
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => navigate(`/orders/${order.orderId}`)}
                          title="View order details"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {orders.length === 0 && (
              <div className="text-center py-8">
                <Package size={48} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">
                  No orders found for this customer.
                </p>
              </div>
            )}
          </div>

          {/* Orders Pagination */}
          {ordersTotal > 10 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {Math.min(10, ordersTotal)} of {ordersTotal} orders
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setOrdersPage((prev) => Math.max(1, prev - 1))}
                  disabled={ordersPage === 1}
                  className="p-2 border border-gray-200 rounded disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 py-1 text-sm">Page {ordersPage}</span>
                <button
                  onClick={() => setOrdersPage((prev) => prev + 1)}
                  disabled={orders.length < 10}
                  className="p-2 border border-gray-200 rounded disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chat/Notes Panel */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-medium">
              CONVERSATION HISTORY & NOTES
            </span>
            <MessageSquare size={20} className="text-gray-400" />
          </div>

          <div className="h-60 p-4 bg-white border border-gray-200 rounded-lg overflow-auto space-y-3 mb-4">
            {chatHistory.length > 0 ? (
              chatHistory.map((chat, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    chat.sender === "customer" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                      chat.sender === "customer"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    <p className="text-sm">{chat.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        chat.sender === "customer"
                          ? "text-gray-500"
                          : "text-blue-100"
                      }`}
                    >
                      {formatDateTime(chat.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
                <p>No conversation history available.</p>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <textarea
              rows={2}
              placeholder="Add a note about this customer..."
              className="flex-1 border border-gray-200 rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddNote();
                }
              }}
            />
            <button
              onClick={handleAddNote}
              disabled={!notes.trim()}
              className="bg-orange-500 px-6 py-2 rounded-r-lg text-white hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Customer Addresses */}
        {customer.addresses && customer.addresses.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-gray-600 font-medium mb-4">Saved Addresses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.addresses.map((address, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">
                      {address.nickname || `Address ${idx + 1}`}
                    </h3>
                    {address.isDefault && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {address.fullAddress}
                  </p>
                  {address.area && (
                    <p className="text-gray-500 text-xs">
                      Area: {address.area}
                    </p>
                  )}
                  {address.googleMapLink && (
                    <a
                      href={address.googleMapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 text-xs underline"
                    >
                      View on Google Maps
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Bank Accounts */}
        {customer.bankAccounts && customer.bankAccounts.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-gray-600 font-medium mb-4">Bank Accounts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.bankAccounts.map((account, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border">
                  <h3 className="font-medium text-gray-800 mb-2">
                    {account.bankName || "Bank Account"}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Account Holder: {account.accountHolderName || "N/A"}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Account Number:{" "}
                    {account.accountNumber
                      ? `****${account.accountNumber.slice(-4)}`
                      : "N/A"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referral Information */}
        {(customer.referredBy || customer.referralRewards?.length > 0) && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-gray-600 font-medium mb-4">
              Referral Information
            </h2>

            {customer.referredBy && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Referred By</h3>
                <p className="text-blue-700 text-sm">
                  {customer.referredBy.name} ({customer.referredBy.phoneNumber})
                </p>
                <p className="text-blue-600 text-xs">
                  Date: {formatDate(customer.referredBy.dateReferred)}
                </p>
              </div>
            )}

            {customer.referralCode && (
              <div className="mb-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">
                  Referral Code
                </h3>
                <p className="text-green-700 font-mono text-lg">
                  {customer.referralCode}
                </p>
              </div>
            )}

            {customer.referralRewards &&
              customer.referralRewards.length > 0 && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-medium text-yellow-800 mb-2">
                    Referral Rewards
                  </h3>
                  <div className="space-y-2">
                    {customer.referralRewards.map((reward, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-yellow-700">
                          {formatCurrency(reward.amount)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            reward.used
                              ? "bg-gray-100 text-gray-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {reward.used ? "Used" : "Available"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;
