// src/components/views/VerificationView.jsx - FIXED VERSION
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../Sidebar/sidebar";
import {
  ChevronLeft,
  User,
  ImageIcon,
  Package,
  X,
  MapPin,
  Truck,
  Clock,
} from "lucide-react";

export default function VerificationView() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [reason, setReason] = useState("");
  const [otherText, setOtherText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [updating, setUpdating] = useState(false);

  const reasons = [
    "cannot find amount against name/time",
    "empty page",
    "not clear text",
    "missing page",
    "believe fake/scam",
    "double check",
    "other",
  ];

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("=== VERIFICATION VIEW - ORDER DATA ===");
        console.log("Order ID:", data.orderId);
        console.log("Account Holder:", data.accountHolderName);
        console.log("Bank Name:", data.paidBankName);
        console.log("Transaction ID:", data.transactionId);
        console.log("Receipt Image:", !!data.receiptImage);
        console.log("Customer:", data.customer || data.customerName);
        console.log("Phone:", data.phoneNumber || data.customerPhone);

        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching order:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [orderId]);

  const handleApprove = async () => {
    if (updating) return;

    setUpdating(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "order-confirmed",
            reason: "Payment verified and approved",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const result = await response.json();
      console.log("Order approved:", result);

      alert("Order approved successfully!");
      navigate("/Transactions-control");
    } catch (err) {
      console.error("Error approving order:", err);
      alert("Failed to approve order: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (updating) return;

    if (!reason) {
      alert("Please select a reason for rejection");
      return;
    }

    const rejectionReason = reason === "other" ? otherText : reason;
    if (reason === "other" && !otherText.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "order-refunded",
            reason: rejectionReason,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const result = await response.json();
      console.log("Order rejected:", result);

      alert(`Order rejected successfully. Reason: ${rejectionReason}`);
      navigate("/Transactions-control");
    } catch (err) {
      console.error("Error rejecting order:", err);
      alert("Failed to reject order: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const toggleImageZoom = () => {
    setImageZoomed(!imageZoomed);
  };

  const getImageSource = () => {
    if (!order || !order.receiptImage) {
      console.log("No receipt image found");
      return null;
    }

    try {
      if (typeof order.receiptImage === "string") {
        return order.receiptImage;
      }

      if (order.receiptImage && typeof order.receiptImage === "object") {
        if (typeof order.receiptImage.data === "string") {
          if (order.receiptImage.data.startsWith("data:")) {
            return order.receiptImage.data;
          }

          const contentType =
            order.receiptImage.contentType ||
            order.receiptImageMetadata?.mimetype ||
            "image/jpeg";
          return `data:${contentType};base64,${order.receiptImage.data}`;
        }

        if (Array.isArray(order.receiptImage.data)) {
          const contentType =
            order.receiptImage.contentType ||
            order.receiptImageMetadata?.mimetype ||
            "image/jpeg";
          const base64String = btoa(
            order.receiptImage.data
              .map((byte) => String.fromCharCode(byte))
              .join("")
          );
          return `data:${contentType};base64,${base64String}`;
        }

        if (
          order.receiptImage.data &&
          order.receiptImage.data.startsWith("data:")
        ) {
          return order.receiptImage.data;
        }
      }

      console.warn("Unsupported receiptImage format:", order.receiptImage);
      return null;
    } catch (error) {
      console.error("Error processing receipt image:", error);
      return null;
    }
  };

  const formatCurrency = (amount) => {
    if (typeof amount === "number") {
      return `Rs. ${amount.toLocaleString()}`;
    }
    return `Rs. ${amount || "0"}`;
  };

  // Helper to safely get field value
  const getFieldValue = (value, placeholder = "Not provided") => {
    return value && String(value).trim() ? value : placeholder;
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar isOpen={true} toggleSidebar={() => {}} />
        <div className="ml-80 flex-1 bg-gray-50 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-500">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <Sidebar isOpen={true} toggleSidebar={() => {}} />
        <div className="ml-80 flex-1 bg-gray-50 p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error: </strong>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex">
        <Sidebar isOpen={true} toggleSidebar={() => {}} />
        <div className="ml-80 flex-1 bg-gray-50 p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Order not found</p>
          </div>
        </div>
      </div>
    );
  }

  const imageSource = getImageSource();

  // Extract payment fields with safe fallbacks
  const accountHolder = getFieldValue(order.accountHolderName);
  const bankName = getFieldValue(order.paidBankName);
  const transactionId = getFieldValue(order.transactionId);
  const customerName = getFieldValue(order.customer || order.customerName);
  const customerPhone = getFieldValue(
    order.phoneNumber || order.customerPhone,
    "N/A"
  );

  return (
    <div className="flex">
      <Sidebar isOpen={true} toggleSidebar={() => {}} />
      <div className="ml-80 flex-1 bg-gray-50 p-6">
        {/* Image zoom overlay */}
        {imageZoomed && imageSource && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
            onClick={toggleImageZoom}
          >
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleImageZoom();
                }}
                className="absolute top-2 right-2 bg-white rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
              <img
                src={imageSource}
                alt="Receipt (zoomed)"
                className="max-w-full max-h-screen object-contain rounded-lg"
              />
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/Transactions-control")}
          className="mb-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
        >
          <ChevronLeft className="mr-1" size={16} />
          Back to Transactions
        </button>

        <div className="bg-white rounded-md p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT SIDE - Transaction Details */}
          <div className="flex space-x-4">
            <div className="text-center min-w-[100px]">
              <User className="h-12 w-12 text-gray-500 mx-auto" />
              <p className="mt-2 text-gray-600 text-xs font-medium">
                {customerName}
              </p>
              <p className="text-gray-600 text-xs">Order: {order.orderId}</p>
              <p className="text-gray-500 text-xs">
                {order.orderDate
                  ? new Date(order.orderDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold mb-2 text-gray-700">
                Transaction Receipt
              </h2>
              <div
                className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-md mb-2 overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                onClick={imageSource ? toggleImageZoom : undefined}
              >
                {imageSource ? (
                  <img
                    src={imageSource}
                    alt="Receipt"
                    className="object-contain h-full w-full"
                    onError={(e) => {
                      console.error("Image failed to load:", e);
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `
                        <div class="flex flex-col items-center justify-center text-gray-500">
                          <svg class="h-10 w-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                          </svg>
                          <p class="text-sm">Failed to load image</p>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <ImageIcon className="h-10 w-10 mb-2" />
                    <p className="text-sm">No receipt uploaded</p>
                  </div>
                )}
              </div>
              {imageSource && (
                <p className="text-xs text-blue-500 text-center mb-3">
                  ✨ Click image to zoom
                </p>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-red-50 p-2 rounded">
                  <h3 className="text-lg font-bold">AMOUNT:</h3>
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded">
                  <p>
                    <span className="font-medium">Account Holder:</span>{" "}
                    {accountHolder}
                  </p>
                  <p>
                    <span className="font-medium">Bank:</span> {bankName}
                  </p>
                  <p>
                    <span className="font-medium">Transaction ID:</span>{" "}
                    {transactionId}
                  </p>
                  <p>
                    <span className="font-medium">Payment Method:</span>{" "}
                    {getFieldValue(order.paymentMethod, "Bank Transfer")}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>
                    <span
                      className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                        order.status === "pay-not-confirmed"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "order-confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status || "Unknown"}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/bank-view/${orderId}`)}
                className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md font-medium transition-colors"
              >
                🔍 Double Check Manually
              </button>
            </div>
          </div>

          {/* RIGHT SIDE - Approval Section */}
          <div>
            <h3 className="text-gray-700 font-semibold mb-3 text-lg">
              Final Approval Decision
            </h3>
            <div className="flex space-x-2 mb-4">
              <button
                onClick={handleApprove}
                disabled={updating}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 rounded-md font-medium transition-colors"
              >
                {updating ? "Processing..." : "✓ Approve"}
              </button>
              <button
                onClick={handleReject}
                disabled={updating}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-3 rounded-md font-medium transition-colors"
              >
                {updating ? "Processing..." : "✗ Reject"}
              </button>
            </div>
            <div className="border rounded-md p-4 bg-gray-50">
              <p className="font-medium mb-3 text-gray-700">
                If rejecting, select a reason:
              </p>
              <div className="space-y-2 mb-3 text-sm text-gray-600">
                {reasons.map((r) => (
                  <label
                    key={r}
                    className="flex items-center cursor-pointer hover:bg-white p-1 rounded"
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="mr-2"
                    />
                    <span className="capitalize">{r}</span>
                  </label>
                ))}
              </div>
              {reason === "other" && (
                <input
                  type="text"
                  placeholder="Write your reason here..."
                  className="w-full border border-gray-300 rounded-md p-2 mb-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                />
              )}
            </div>
          </div>
        </div>

        {/* COMPLETE ORDER DETAILS */}
        <div className="bg-white rounded-md p-6">
          <h3 className="text-gray-700 font-semibold mb-4 text-lg">
            Complete Order Information
          </h3>

          {/* Delivery Information Section */}
          <div className="border rounded-md p-4 mb-4 bg-blue-50">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Truck className="mr-2" size={18} />
              Delivery Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {order.deliveryOption && (
                <div>
                  <span className="font-medium text-gray-700">
                    Delivery Option:
                  </span>
                  <span className="ml-2 text-gray-600">
                    {order.deliveryOption}
                  </span>
                </div>
              )}
              {order.deliveryType && (
                <div>
                  <span className="font-medium text-gray-700">
                    Delivery Type:
                  </span>
                  <span className="ml-2 text-gray-600 capitalize">
                    {order.deliveryType}
                  </span>
                </div>
              )}
              {order.deliverySpeed && (
                <div>
                  <span className="font-medium text-gray-700">
                    Delivery Speed:
                  </span>
                  <span className="ml-2 text-gray-600 capitalize">
                    {order.deliverySpeed}
                  </span>
                </div>
              )}
              {order.deliveryTimeFrame && (
                <div>
                  <span className="font-medium text-gray-700">Time Frame:</span>
                  <span className="ml-2 text-gray-600">
                    {order.deliveryTimeFrame}
                  </span>
                </div>
              )}
              {order.timeSlot && (
                <div>
                  <span className="font-medium text-gray-700">Time Slot:</span>
                  <span className="ml-2 text-gray-600">{order.timeSlot}</span>
                </div>
              )}
              {order.deliveryCharge !== undefined &&
                order.deliveryCharge > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Delivery Charge:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {formatCurrency(order.deliveryCharge)}
                    </span>
                  </div>
                )}
              {order.deliveryLocation && (
                <div className="col-span-2">
                  <span className="font-medium text-gray-700">Location:</span>
                  <span className="ml-2 text-gray-600">
                    {order.deliveryLocation}
                  </span>
                </div>
              )}
            </div>

            {/* Delivery Address with Google Maps */}
            {order.deliveryAddress && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-start">
                  <MapPin className="mr-2 mt-1 flex-shrink-0" size={16} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-700 mb-1">
                      Delivery Address:
                    </p>
                    {order.deliveryAddress.nickname && (
                      <p className="text-sm text-gray-600">
                        📍 {order.deliveryAddress.nickname}
                      </p>
                    )}
                    {order.deliveryAddress.fullAddress && (
                      <p className="text-sm text-gray-600">
                        {order.deliveryAddress.fullAddress}
                      </p>
                    )}
                    {order.deliveryAddress.area && (
                      <p className="text-sm text-gray-600">
                        Area: {order.deliveryAddress.area}
                      </p>
                    )}
                    {order.deliveryAddress.googleMapLink && (
                      <a
                        href={order.deliveryAddress.googleMapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline mt-1"
                      >
                        🗺️ Open in Google Maps →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="border rounded-md p-4 mb-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Package className="mr-2" size={18} />
              Order Items
            </h4>
            {order.items && order.items.length > 0 ? (
              order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <Package className="w-6 h-6 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-600">
                        Qty: {item.quantity}{" "}
                        {item.weight && `• Weight: ${item.weight}`}
                      </p>
                      {item.price && (
                        <p className="text-xs text-gray-500">
                          Unit Price: {formatCurrency(item.price)}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="font-medium text-gray-800">
                    {formatCurrency(item.totalPrice)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No items found
              </div>
            )}
          </div>

          {/* Order Financial Summary */}
          <div className="border rounded-md p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-800 mb-3">
              Payment Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>
                  {formatCurrency(
                    order.items
                      ? order.items.reduce(
                          (sum, item) => sum + (item.totalPrice || 0),
                          0
                        )
                      : 0
                  )}
                </span>
              </div>

              {order.deliveryCharge && order.deliveryCharge > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee:</span>
                  <span>{formatCurrency(order.deliveryCharge)}</span>
                </div>
              )}

              {order.ecoDeliveryDiscount && order.ecoDeliveryDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Eco Delivery Discount:</span>
                  <span>-{formatCurrency(order.ecoDeliveryDiscount)}</span>
                </div>
              )}

              {order.firstOrderDiscount && order.firstOrderDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>First Order Discount:</span>
                  <span>-{formatCurrency(order.firstOrderDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-gray-800 pt-2 border-t text-base">
                <span>Total Amount:</span>
                <span className="text-red-600">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border rounded-md p-4 mt-4 bg-purple-50">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <User className="mr-2" size={18} />
              Customer Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <span className="ml-2 text-gray-600">{customerName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Phone:</span>
                <span className="ml-2 text-gray-600">{customerPhone}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Customer ID:</span>
                <span className="ml-2 text-gray-600 text-xs">
                  {getFieldValue(order.customerId)}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Order Date:</span>
                <span className="ml-2 text-gray-600">
                  {order.orderDate
                    ? new Date(order.orderDate).toLocaleString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
