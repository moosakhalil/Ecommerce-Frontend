import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../Sidebar/sidebar";
import {
  Home,
  ArrowLeft,
  MessageCircle,
  User,
  Edit,
  Package,
  AlertCircle,
  Circle,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Phone,
  Mail,
  Save,
  X,
  Eye,
  Download,
  Loader2,
} from "lucide-react";

export default function OrderDetails() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingNote, setEditingNote] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [statusHistory, setStatusHistory] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const navigate = useNavigate();
  const { orderId } = useParams();

  // Status color mapping
  const getStatusColor = (status) => {
    const statusColors = {
      "cart-not-paid": "bg-gray-100 text-gray-600",
      "order-made-not-paid": "bg-yellow-100 text-yellow-600",
      "pay-not-confirmed": "bg-orange-100 text-orange-600",
      "order-confirmed": "bg-blue-100 text-blue-600",
      "order not picked": "bg-red-100 text-red-600",
      "issue-customer": "bg-red-100 text-red-600",
      "customer-confirmed": "bg-green-100 text-green-600",
      "order-refunded": "bg-purple-100 text-purple-600",
      "picking-order": "bg-blue-100 text-blue-600",
      "allocated-driver": "bg-indigo-100 text-indigo-600",
      "ready to pickup": "bg-teal-100 text-teal-600",
      "order-not-pickedup": "bg-red-100 text-red-600",
      "order-pickuped-up": "bg-green-100 text-green-600",
      "on-way": "bg-blue-100 text-blue-600",
      "driver-confirmed": "bg-green-100 text-green-600",
      "order-processed": "bg-green-100 text-green-600",
      refund: "bg-purple-100 text-purple-600",
      "complain-order": "bg-red-100 text-red-600",
      "issue-driver": "bg-red-100 text-red-600",
      "parcel-returned": "bg-orange-100 text-orange-600",
      "order-complete": "bg-green-100 text-green-600",
    };
    return statusColors[status] || "bg-gray-100 text-gray-600";
  };

  // Fetch order details
  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/orders/${orderId}`
      );
      setOrderData(response.data);

      // Generate status history based on order status
      generateStatusHistory(response.data);
    } catch (err) {
      setError("Failed to fetch order details");
      console.error("Error fetching order:", err);
    } finally {
      setLoading(false);
    }
  };

  // Generate status history timeline
  const generateStatusHistory = (order) => {
    const history = [
      {
        status: "order-confirmed",
        label: `Order confirmed via ${
          order.paymentMethod || "payment"
        } ${new Date(order.orderDate).toLocaleDateString()}`,
        date: order.orderDate,
        completed: true,
      },
    ];

    // Add other statuses based on current status
    const statusProgression = [
      "order-confirmed",
      "picking-order",
      "allocated-driver",
      "ready to pickup",
      "order-pickuped-up",
      "on-way",
      "driver-confirmed",
      "order-complete",
    ];

    const currentIndex = statusProgression.indexOf(order.status);

    statusProgression.forEach((status, index) => {
      if (index > 0) {
        // Skip order-confirmed as it's already added
        history.push({
          status: status,
          label: getStatusLabel(status),
          date: index <= currentIndex ? new Date() : null,
          completed: index <= currentIndex,
        });
      }
    });

    setStatusHistory(history.reverse()); // Reverse for newest first
  };

  const getStatusLabel = (status) => {
    const labels = {
      "order-confirmed": "Order confirmed",
      "picking-order": "Order being picked",
      "allocated-driver": "Driver allocated",
      "ready to pickup": "Ready for pickup",
      "order-pickuped-up": "Picked up by driver",
      "on-way": "On the way",
      "driver-confirmed": "Driver confirmed delivery",
      "order-complete": "Order completed",
    };
    return labels[status] || status.replace(/-/g, " ");
  };

  // Update order status
  const updateOrderStatus = async (newStatus, reason = "") => {
    try {
      setUpdatingStatus(true);
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          status: newStatus,
          reason: reason,
        }
      );

      // Refresh order data
      fetchOrderDetails();
      alert("Order status updated successfully!");
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Add note (would need additional API endpoint)
  const addNote = async () => {
    if (!newNote.trim()) return;

    try {
      // This would need to be implemented in the backend
      // await axios.post(`/api/orders/${orderId}/notes`, { note: newNote });
      console.log("Adding note:", newNote);
      setNewNote("");
      setEditingNote(false);
      // Refresh order data
      fetchOrderDetails();
    } catch (err) {
      console.error("Error adding note:", err);
    }
  };

  // View receipt image
  const viewReceiptImage = () => {
    if (orderData.receiptImage?.data) {
      const imageUrl = `data:${orderData.receiptImage.contentType};base64,${orderData.receiptImage.data}`;
      window.open(imageUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f0ff]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f0ff]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-gray-600 mb-4">{error || "Order not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-80" : ""
        } w-full bg-[#f3f0ff]`}
      >
        {/* Header */}
        <header className="bg-gray-800 text-white p-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Home className="w-5 h-5" />
          <h1 className="text-lg font-medium">Order Details</h1>
        </header>

        <main className="p-6 space-y-8">
          {/* Order Summary */}
          <section className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold">Order #{orderData.orderId}</h2>
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                  orderData.status
                )}`}
              >
                {orderData.status.replace(/-/g, " ").toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Placed on {new Date(orderData.orderDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>{orderData.items?.length || 0} items</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>Amount ${orderData.totalAmount || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>{orderData.deliveryType || "Standard"} Delivery</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                onClick={() => navigate("/driver-chat")}
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                View driver chat
              </button>
              <button
                className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
                onClick={() => navigate("/customer-chat")}
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                View customer chat
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => navigate("/delivery-orders")}
              >
                <Package className="w-4 h-4 inline mr-2" />
                Manage All-orders
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => navigate("/non-delivered-orders")}
              >
                <AlertCircle className="w-4 h-4 inline mr-2" />
                View non-delivered orders
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => navigate("/view-refunds")}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                View Refunds
              </button>
            </div>
          </section>

          {/* Items and Customer Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items Card */}
            <div className="col-span-2 bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Items
              </h3>
              <div className="space-y-4">
                {orderData.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-gray-500">
                          Qty: {item.quantity}{" "}
                          {item.weight && `• Weight: ${item.weight}`}
                        </div>
                        {item.onTruck !== undefined && (
                          <div className="text-xs mt-1">
                            <span
                              className={`px-2 py-1 rounded ${
                                item.onTruck
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {item.onTruck ? "On Truck" : "Pending Truck"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="font-semibold">
                      ${item.totalPrice || item.price}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span>Sub total</span>
                  <span>
                    $
                    {(
                      orderData.totalAmount - (orderData.deliveryCharge || 0)
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery fees</span>
                  <span>${orderData.deliveryCharge || 0}</span>
                </div>
                {orderData.ecoDeliveryDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Eco Delivery Discount</span>
                    <span>-${orderData.ecoDeliveryDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>${orderData.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Customer Information Card */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <User className="w-12 h-12 text-gray-400 bg-gray-100 rounded-full p-3" />
                  <div>
                    <div className="font-medium">
                      {orderData.customer || "Unknown Customer"}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {orderData.phoneNumber || "No phone"}
                    </div>
                    {orderData.email && (
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {orderData.email}
                      </div>
                    )}
                  </div>
                </div>

                {orderData.deliveryAddress && (
                  <div className="mt-4">
                    <div className="font-semibold mb-2 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Delivery Address
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {orderData.deliveryAddress.nickname && (
                        <div className="font-medium">
                          {orderData.deliveryAddress.nickname}
                        </div>
                      )}
                      <div>{orderData.deliveryAddress.fullAddress}</div>
                      {orderData.deliveryAddress.area && (
                        <div>Area: {orderData.deliveryAddress.area}</div>
                      )}
                      {orderData.deliveryAddress.googleMapLink && (
                        <a
                          href={orderData.deliveryAddress.googleMapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-xs"
                        >
                          View on Map
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {(orderData.receiptImage ||
            orderData.accountHolderName ||
            orderData.paidBankName) && (
            <section className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {orderData.accountHolderName && (
                    <div className="mb-2">
                      <span className="font-medium">Account Holder: </span>
                      {orderData.accountHolderName}
                    </div>
                  )}
                  {orderData.paidBankName && (
                    <div className="mb-2">
                      <span className="font-medium">Bank: </span>
                      {orderData.paidBankName}
                    </div>
                  )}
                  {orderData.transactionId && (
                    <div className="mb-2">
                      <span className="font-medium">Transaction ID: </span>
                      {orderData.transactionId}
                    </div>
                  )}
                </div>
                {orderData.receiptImage?.data && (
                  <div>
                    <div className="font-medium mb-2">Payment Receipt:</div>
                    <button
                      onClick={viewReceiptImage}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Receipt
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Delivery Information */}
          {(orderData.driver1 || orderData.driver2 || orderData.timeSlot) && (
            <section className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Delivery Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {orderData.timeSlot && (
                  <div>
                    <span className="font-medium">Time Slot: </span>
                    {orderData.timeSlot}
                  </div>
                )}
                {orderData.driver1 && (
                  <div>
                    <span className="font-medium">Driver 1: </span>
                    {orderData.driver1}
                  </div>
                )}
                {orderData.driver2 && (
                  <div>
                    <span className="font-medium">Driver 2: </span>
                    {orderData.driver2}
                  </div>
                )}
                {orderData.pickupType && (
                  <div>
                    <span className="font-medium">Pickup Type: </span>
                    {orderData.pickupType}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Status Update Section */}
          <section className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Update Order Status
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "order-confirmed",
                "picking-order",
                "allocated-driver",
                "ready to pickup",
                "order-pickuped-up",
                "on-way",
                "driver-confirmed",
                "order-complete",
                "order-refunded",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => updateOrderStatus(status)}
                  disabled={updatingStatus || orderData.status === status}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    orderData.status === status
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {updatingStatus ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    status.replace(/-/g, " ").toUpperCase()
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Order Status Timeline */}
          <section className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="font-semibold text-xl mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Order Timeline
            </h3>
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-blue-200"></div>

              {statusHistory.map((event, idx) => (
                <div key={idx} className="mb-8 relative">
                  <div className="flex items-center mb-2">
                    <div
                      className={`absolute -left-4 w-3 h-3 rounded-full ${
                        event.completed ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></div>
                    <div className="ml-4 font-medium flex items-center gap-2">
                      {event.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                      {event.label}
                      {event.date && (
                        <span className="text-sm text-gray-500">
                          {new Date(event.date).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {orderData.adminReason &&
                    event.status === orderData.status && (
                      <div className="bg-blue-50 p-3 rounded-md ml-8 text-sm">
                        <strong>Admin Note:</strong> {orderData.adminReason}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </section>

          {/* Complaints Section */}
          {orderData.complaints && orderData.complaints.length > 0 && (
            <section className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Complaints
              </h3>
              <div className="space-y-4">
                {orderData.complaints.map((complaint, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-red-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">
                        Complaint #{complaint.complaintId}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          complaint.status === "open"
                            ? "bg-red-100 text-red-700"
                            : complaint.status === "resolved"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {complaint.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Issues:</strong> {complaint.issueTypes.join(", ")}
                    </div>
                    {complaint.additionalDetails && (
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Details:</strong> {complaint.additionalDetails}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Reported by:{" "}
                      {complaint.reportedBy?.driverName || "Unknown"} on{" "}
                      {new Date(complaint.reportedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
