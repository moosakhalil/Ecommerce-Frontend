// src/components/views/BankAccountView.jsx - FIXED VERSION
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../Sidebar/sidebar";
import { FiMoreVertical } from "react-icons/fi";
import { FaRegFileImage } from "react-icons/fa";

export default function BankAccountView() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // admin-editable
  const [textBox, setTextBox] = useState("");
  const [allocatedToOrder, setAllocatedToOrder] = useState(orderId);
  const [allocatedEmpName, setAllocatedEmpName] = useState("");
  const [allocatedStatus, setAllocatedStatus] = useState("allocated");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/orders/${orderId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        // Debug log to verify all fields
        console.log("=== BANK ACCOUNT VIEW - ORDER DATA ===");
        console.log("Order ID:", data.orderId);
        console.log("Account Holder:", data.accountHolderName);
        console.log("Bank Name:", data.paidBankName);
        console.log("Transaction ID:", data.transactionId);
        console.log("Receipt Image Present:", !!data.receiptImage);
        console.log("Payment Status:", data.paymentStatus);

        setOrder(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleSave = () => {
    alert("The receipt is marked as correct");
    navigate(`/verification/${orderId}`);
  };

  const getImageSource = () => {
    if (!order || !order.receiptImage) {
      console.log("No receipt image found in order data");
      return null;
    }

    const receipt = order.receiptImage;
    console.log("Receipt data type:", typeof receipt);

    if (typeof receipt === "string") {
      console.log("Receipt is string URL");
      return receipt;
    }

    if (receipt.data) {
      if (typeof receipt.data === "string") {
        if (receipt.data.startsWith("data:")) {
          console.log("Receipt is data URL");
          return receipt.data;
        }
        const contentType = receipt.contentType || "image/jpeg";
        const base64Data = `data:${contentType};base64,${receipt.data}`;
        console.log("Receipt converted to base64");
        return base64Data;
      }

      if (Array.isArray(receipt.data)) {
        try {
          const contentType = receipt.contentType || "image/jpeg";
          const base64String = btoa(
            receipt.data.map((byte) => String.fromCharCode(byte)).join("")
          );
          const base64Data = `data:${contentType};base64,${base64String}`;
          console.log("Receipt converted from byte array");
          return base64Data;
        } catch (err) {
          console.error("Error converting image data:", err);
          return null;
        }
      }
    }

    console.error("Unsupported receiptImage format:", receipt);
    return null;
  };

  // Helper function to safely get field value or show placeholder
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
            <strong>Error:</strong> {error}
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

  const receivedAt = new Date(order.orderDate).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const receivedDate = new Date(order.orderDate).toLocaleDateString();

  const imageSource = getImageSource();

  // Extract payment fields with proper fallbacks
  const accountHolder = getFieldValue(order.accountHolderName);
  const bankName = getFieldValue(order.paidBankName);
  const transactionId = getFieldValue(order.transactionId);

  return (
    <div className="flex">
      <Sidebar isOpen={true} toggleSidebar={() => {}} />
      <div className="ml-80 flex-1 bg-gray-50 p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm text-blue-600 hover:underline"
        >
          ← Back to Verification
        </button>

        <h1 className="text-2xl font-bold mb-6">
          Bank Account - {order.orderId}
        </h1>

        {/* ─── TABLE ──────────────────────────────────────────── */}
        <div className="overflow-x-auto border rounded-lg mb-8 bg-white">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                {[
                  "time",
                  "date",
                  "name",
                  "text box",
                  "amount",
                  "allocated to order id",
                  "allocated emp name",
                  "allocated",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="py-3 px-4 text-left text-sm font-medium text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-100">
                <td className="py-3 px-4 text-sm">{receivedAt}</td>
                <td className="py-3 px-4 text-sm">{receivedDate}</td>
                <td className="py-3 px-4 text-sm">
                  {getFieldValue(order.customer || order.customerName)}
                </td>
                <td className="py-3 px-4 text-sm">
                  <input
                    type="text"
                    value={textBox}
                    onChange={(e) => setTextBox(e.target.value)}
                    placeholder="notes…"
                    className="w-full border rounded p-1 text-sm"
                  />
                </td>
                <td className="py-3 px-4 text-sm font-medium">
                  Rs. {order.totalAmount?.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-sm">
                  <input
                    type="text"
                    value={allocatedToOrder}
                    onChange={(e) => setAllocatedToOrder(e.target.value)}
                    className="w-full border rounded p-1 text-sm"
                  />
                </td>
                <td className="py-3 px-4 text-sm">
                  <input
                    type="text"
                    value={allocatedEmpName}
                    onChange={(e) => setAllocatedEmpName(e.target.value)}
                    placeholder="emp name"
                    className="w-full border rounded p-1 text-sm"
                  />
                </td>
                <td className="py-3 px-4 text-sm">
                  <select
                    value={allocatedStatus}
                    onChange={(e) => setAllocatedStatus(e.target.value)}
                    className="border rounded p-1 text-sm"
                  >
                    <option value="allocated">allocated</option>
                    <option value="not allocated">not allocated</option>
                    <option value="issue">issue</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-right">
                  <FiMoreVertical size={20} className="text-gray-400" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ─── INFO + RECEIPT ───────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* MORE INFO */}
          <div className="flex-1 bg-white rounded-md p-6 space-y-4">
            <h2 className="text-xl font-semibold">
              Complete Payment Information
            </h2>
            <div className="space-y-2 text-gray-700 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Time Received:</span>{" "}
                  {receivedAt}
                </div>
                <div>
                  <span className="font-medium">Date:</span> {receivedDate}
                </div>
                <div>
                  <span className="font-medium">Bank:</span> {bankName}
                </div>
                <div>
                  <span className="font-medium">Account Holder:</span>{" "}
                  {accountHolder}
                </div>
                <div>
                  <span className="font-medium">Transaction ID:</span>{" "}
                  {transactionId}
                </div>
                <div>
                  <span className="font-medium">Payment Method:</span>{" "}
                  {getFieldValue(order.paymentMethod, "Bank Transfer")}
                </div>
                <div>
                  <span className="font-medium">Amount:</span> Rs.{" "}
                  {order.totalAmount?.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Payment Status:</span>{" "}
                  <span
                    className={
                      order.paymentStatus === "paid"
                        ? "text-green-600 font-semibold"
                        : "text-orange-600 font-semibold"
                    }
                  >
                    {getFieldValue(order.paymentStatus, "Pending")}
                  </span>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="pt-4 border-t mt-4">
                <h3 className="font-semibold mb-2">Delivery Details</h3>
                <div className="space-y-1">
                  {order.deliveryOption && (
                    <div>
                      <span className="font-medium">Delivery Option:</span>{" "}
                      {order.deliveryOption}
                    </div>
                  )}
                  {order.deliveryType && (
                    <div>
                      <span className="font-medium">Delivery Type:</span>{" "}
                      {order.deliveryType}
                    </div>
                  )}
                  {order.deliverySpeed && (
                    <div>
                      <span className="font-medium">Delivery Speed:</span>{" "}
                      {order.deliverySpeed}
                    </div>
                  )}
                  {order.deliveryTimeFrame && (
                    <div>
                      <span className="font-medium">Time Frame:</span>{" "}
                      {order.deliveryTimeFrame}
                    </div>
                  )}
                  {order.timeSlot && (
                    <div>
                      <span className="font-medium">Time Slot:</span>{" "}
                      {order.timeSlot}
                    </div>
                  )}
                  {order.deliveryCharge && order.deliveryCharge > 0 && (
                    <div>
                      <span className="font-medium">Delivery Charge:</span> Rs.
                      {order.deliveryCharge?.toLocaleString()}
                    </div>
                  )}
                  {order.deliveryAddress && (
                    <div>
                      <span className="font-medium">Address:</span>
                      <div className="ml-4 mt-1">
                        {order.deliveryAddress.nickname && (
                          <div>
                            • Nickname: {order.deliveryAddress.nickname}
                          </div>
                        )}
                        {order.deliveryAddress.fullAddress && (
                          <div>• {order.deliveryAddress.fullAddress}</div>
                        )}
                        {order.deliveryAddress.area && (
                          <div>• Area: {order.deliveryAddress.area}</div>
                        )}
                        {order.deliveryAddress.googleMapLink && (
                          <div>
                            • Map:{" "}
                            <a
                              href={order.deliveryAddress.googleMapLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {order.deliveryAddress.googleMapLink}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div className="pt-4 border-t mt-4">
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="space-y-1">
                  <div>
                    <span className="font-medium">Name:</span>{" "}
                    {getFieldValue(order.customer || order.customerName)}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>{" "}
                    {getFieldValue(order.phoneNumber || order.customerPhone)}
                  </div>
                  <div>
                    <span className="font-medium">Customer ID:</span>{" "}
                    {getFieldValue(order.customerId)}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t mt-4">
                <span className="font-medium">Admin Notes:</span>
                <div className="mt-1">{textBox || "—"}</div>
              </div>
            </div>
            <button
              onClick={handleSave}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded w-full"
            >
              Correct Receipt - Mark as Verified
            </button>
          </div>

          {/* RECEIPT PHOTO */}
          <div className="w-full md:w-96 bg-white rounded-md p-6 flex flex-col">
            <h2 className="mb-4 font-semibold text-lg">Receipt Photo</h2>
            <div className="w-full h-96 bg-gray-100 flex items-center justify-center mb-4 rounded-lg overflow-hidden">
              {imageSource ? (
                <img
                  src={imageSource}
                  alt="receipt"
                  className="object-contain h-full w-full"
                  onError={(e) => {
                    console.error("Image failed to load");
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <FaRegFileImage size={48} />
                  <p className="mt-2 text-sm">No receipt image uploaded</p>
                </div>
              )}
            </div>
            <div className="text-gray-700 text-sm space-y-2 mb-4 bg-gray-50 p-4 rounded">
              <div>
                <span className="font-medium">Bank:</span> {bankName}
              </div>
              <div>
                <span className="font-medium">Account Holder:</span>{" "}
                {accountHolder}
              </div>
              <div>
                <span className="font-medium">Amount:</span> Rs.
                {order.totalAmount?.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Transaction ID:</span>{" "}
                {transactionId}
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded"
            >
              Back to Verification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
