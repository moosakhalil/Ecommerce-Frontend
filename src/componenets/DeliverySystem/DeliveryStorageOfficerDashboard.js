import React, { useState, useEffect, useRef, useCallback } from "react";
import ModeToggle from "../Shared/ModeToggle";
import {
  Clock,
  CheckCircle2,
  CheckCircle,
  Eye,
  Package,
  Building,
  Truck,
  User,
  Phone,
  FileText,
  Navigation,
  X,
  AlertTriangle,
} from "lucide-react";
import { API_BASE_URL } from "../../utils/config";

// Separate Modal Component - prevents unnecessary re-renders
const VerificationModalComponent = ({
  selectedOrder,
  orderDetails,
  storageNotes,
  setStorageNotes,
  storageLocation,
  setStorageLocation,
  onClose,
  onCompleteVerification,
  onVerifyItem,
  onAddComplaint,
  setComplaintData,
  setShowComplaintModal,
}) => {
  if (!orderDetails || !selectedOrder) return null;

  const allItemsVerified = orderDetails.items.every(
    (item) =>
      item.storageVerified === true ||
      (item.storageComplaints && item.storageComplaints.length > 0),
  );

  // ✅ Check if order is already completed (read-only mode)
  const isCompleted = orderDetails.storageDetails?.verificationCompletedAt;
  const isReadOnly = isCompleted;

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
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
              <h2 className="text-xl font-semibold text-gray-900">
                Order Verification - {selectedOrder}
              </h2>
              {isCompleted && (
                <div className="mt-2 inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completed & Handed Over
                </div>
              )}
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Packing Staff:</span>{" "}
                  {orderDetails.packingDetails?.packingStaff?.staffName ||
                    "N/A"}
                </p>
                <p>
                  <span className="font-medium">Packed At:</span>{" "}
                  {formatDateTime(orderDetails.packingDetails?.packedAt)}
                </p>
                {isCompleted && (
                  <>
                    <p>
                      <span className="font-medium">Verified By:</span>{" "}
                      {orderDetails.storageDetails?.verificationStaff
                        ?.staffName || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Completed At:</span>{" "}
                      {formatDateTime(
                        orderDetails.storageDetails?.verificationCompletedAt,
                      )}
                    </p>
                  </>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Items Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {isReadOnly ? "Verified Items:" : "Items to Check:"}
            </h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 w-12">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Item
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 w-24">
                      Qty
                    </th>
                    {!isReadOnly && (
                      <>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 w-40">
                          Action
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 w-32">
                          Report
                        </th>
                      </>
                    )}
                    {isReadOnly && (
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 w-40">
                        Verification Status
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orderDetails.items.map((item, index) => (
                    <tr key={`item-${index}`} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {item.storageVerified ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : item.storageComplaints &&
                          item.storageComplaints.length > 0 ? (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        ) : (
                          <div className="h-5 w-5 border-2 border-gray-300 rounded"></div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.productName}
                        </div>
                        {item.storageComplaints &&
                          item.storageComplaints.length > 0 && (
                            <div className="flex items-center text-xs text-red-600 mt-1">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {
                                item.storageComplaints[
                                  item.storageComplaints.length - 1
                                ].complaintDetails
                              }
                            </div>
                          )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {item.quantity} {item.weight || ""}
                      </td>
                      {!isReadOnly && (
                        <>
                          <td className="py-3 px-4">
                            {item.storageVerified ? (
                              <span className="inline-flex items-center px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </span>
                            ) : item.storageComplaints &&
                              item.storageComplaints.length > 0 ? (
                              <span className="inline-flex items-center px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Has Issue
                              </span>
                            ) : (
                              <button
                                onClick={() => onVerifyItem(index)}
                                className="px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                              >
                                Verify Now
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                setComplaintData({
                                  itemIndex: index,
                                  complaintType: "",
                                  complaintDetails: "",
                                });
                                setShowComplaintModal(true);
                              }}
                              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                              <AlertTriangle className="h-3 w-3 inline mr-1" />
                              Report
                            </button>
                          </td>
                        </>
                      )}
                      {isReadOnly && (
                        <td className="py-3 px-4">
                          {item.storageVerified ? (
                            <div className="text-xs text-gray-600">
                              <p className="font-medium text-green-700">
                                Verified
                              </p>
                              <p>By: {item.verifiedBy?.staffName || "N/A"}</p>
                              <p>{formatDateTime(item.verifiedAt)}</p>
                            </div>
                          ) : item.storageComplaints &&
                            item.storageComplaints.length > 0 ? (
                            <div className="text-xs text-gray-600">
                              <p className="font-medium text-red-700">
                                Complaint Reported
                              </p>
                              <p>
                                By:{" "}
                                {item.storageComplaints[0].reportedBy
                                  ?.staffName || "N/A"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">
                              Not Verified
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Storage Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Storage Notes
            </label>
            <textarea
              value={
                isReadOnly
                  ? orderDetails.storageDetails?.storageNotes || "No notes"
                  : storageNotes
              }
              onChange={(e) => !isReadOnly && setStorageNotes(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              rows="3"
              placeholder={
                isReadOnly
                  ? ""
                  : "Add any notes about item conditions, storage requirements, etc."
              }
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
          </div>

          {/* Storage Location */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Storage Location
            </label>
            <input
              type="text"
              value={
                isReadOnly
                  ? orderDetails.storageDetails?.storageLocation ||
                    "Not specified"
                  : storageLocation
              }
              onChange={(e) =>
                !isReadOnly && setStorageLocation(e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              placeholder={
                isReadOnly ? "" : "e.g., Shelf A-12, Cold Storage Room 2, etc."
              }
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span className="font-medium">Verification Progress</span>
              <span>
                {
                  orderDetails.items.filter((item) => item.storageVerified)
                    .length
                }{" "}
                / {orderDetails.items.length} items
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isCompleted ? "bg-green-600" : "bg-blue-600"
                }`}
                style={{
                  width: `${
                    (orderDetails.items.filter((item) => item.storageVerified)
                      .length /
                      orderDetails.items.length) *
                    100
                  }%`,
                }}
              ></div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Complaints:{" "}
              {orderDetails.items.reduce(
                (count, item) =>
                  count +
                  (item.storageComplaints ? item.storageComplaints.length : 0),
                0,
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>

            {!isReadOnly && allItemsVerified && (
              <button
                onClick={onCompleteVerification}
                className="flex items-center px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete & Hand Over
              </button>
            )}

            {isReadOnly && (
              <div className="flex items-center text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                <CheckCircle className="h-4 w-4 mr-2" />
                Order Already Handed Over to Dispatch
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Complaint Modal Component
const ComplaintModalComponent = ({
  complaintData,
  setComplaintData,
  onAddComplaint,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Storage Complaint</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Complaint Type
            </label>
            <select
              value={complaintData.complaintType}
              onChange={(e) =>
                setComplaintData({
                  ...complaintData,
                  complaintType: e.target.value,
                })
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
            >
              <option value="">Select complaint type</option>
              <option value="damaged">Item damaged</option>
              <option value="missing">Item missing</option>
              <option value="wrong_item">Wrong item</option>
              <option value="quantity_mismatch">Quantity mismatch</option>
              <option value="packaging_issue">Packaging issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Details
            </label>
            <textarea
              value={complaintData.complaintDetails}
              onChange={(e) =>
                setComplaintData({
                  ...complaintData,
                  complaintDetails: e.target.value,
                })
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
              rows="3"
              placeholder="Enter complaint details..."
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onAddComplaint}
              disabled={
                !complaintData.complaintType || !complaintData.complaintDetails
              }
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Complaint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeliveryStorageOfficerDashboard = ({ selectedRole, setSelectedRole }) => {
  const [storageQueue, setStorageQueue] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    verifying: 0,
    completed: 0,
  });
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintData, setComplaintData] = useState({
    itemIndex: null,
    complaintType: "",
    complaintDetails: "",
  });
  const [storageNotes, setStorageNotes] = useState("");
  const [storageLocation, setStorageLocation] = useState("");
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
  ];

  const secondRowRoles = [
    { name: "Complaint Manager on Delivery", icon: Phone },
    { name: "Complaint Manager After Delivery", icon: FileText },
  ];

  // Initialize polling
  useEffect(() => {
    fetchStorageQueue();
    fetchStats();

    pollIntervalRef.current = setInterval(() => {
      if (!showVerificationModal) {
        fetchStorageQueue();
        fetchStats();
      }
    }, 30000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [showVerificationModal]);

  // Fetch order details when modal opens
  useEffect(() => {
    if (selectedOrder && showVerificationModal) {
      fetchOrderDetails(selectedOrder);
    }
  }, [selectedOrder, showVerificationModal]);

  const fetchStorageQueue = useCallback(async () => {
    try {
      // Fetch ALL orders regardless of status (like Order Overview)
      const response = await fetch(`${API_BASE_URL}/api/storage/queue`);
      const data = await response.json();

      const newHash = JSON.stringify(data);
      if (lastFetchRef.current.queue !== newHash) {
        setStorageQueue(data);
        lastFetchRef.current.queue = newHash;
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching storage queue:", error);
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/storage/stats`);
      const data = await response.json();

      const newHash = JSON.stringify(data);
      if (lastFetchRef.current.stats !== newHash) {
        setStats(data);
        lastFetchRef.current.stats = newHash;
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  const fetchOrderDetails = useCallback(async (orderId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/storage/order/${orderId}`,
      );
      const data = await response.json();

      const newHash = JSON.stringify(data);
      if (lastFetchRef.current.details !== newHash) {
        setOrderDetails(data);
        lastFetchRef.current.details = newHash;
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  }, []);

  const startVerification = useCallback(
    async (orderId, orderStatus) => {
      try {
        // ✅ For already verified/handed over orders, just view details
        if (
          orderStatus === "handed_to_dispatch" ||
          orderStatus === "verified"
        ) {
          setSelectedOrder(orderId);
          setShowVerificationModal(true);
          await fetchOrderDetails(orderId);
          return;
        }

        // ✅ For pending/verifying orders, start/continue verification
        const response = await fetch(
          `${API_BASE_URL}/api/storage/start/${orderId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              employeeId: "STORAGE_001",
              employeeName: "Storage Officer",
            }),
          },
        );

        if (response.ok) {
          setSelectedOrder(orderId);
          setShowVerificationModal(true);
          setStorageNotes("");
          setStorageLocation("");
          await fetchOrderDetails(orderId);
        } else {
          const error = await response.json();
          alert(`Failed to start verification: ${error.error}`);
        }
      } catch (error) {
        console.error("Error starting verification:", error);
        alert("Failed to start verification");
      }
    },
    [fetchOrderDetails],
  );

  const verifyItem = useCallback(
    async (itemIndex) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/storage/item/${selectedOrder}/${itemIndex}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              employeeId: "STORAGE_001",
              employeeName: "Storage Officer",
              verified: true,
              condition: "good",
            }),
          },
        );

        if (response.ok) {
          const result = await response.json();
          alert(
            `Item verified! Progress: ${result.verifiedItems}/${result.totalItems} items`,
          );
          lastFetchRef.current.details = null;
          await fetchOrderDetails(selectedOrder);
        } else {
          const error = await response.json();
          alert(`Failed to verify item: ${error.error}`);
        }
      } catch (error) {
        console.error("Error verifying item:", error);
        alert("Failed to verify item");
      }
    },
    [selectedOrder, fetchOrderDetails],
  );

  const addComplaint = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/storage/complaint/${selectedOrder}/${complaintData.itemIndex}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            complaintType: complaintData.complaintType,
            complaintDetails: complaintData.complaintDetails,
            employeeId: "STORAGE_001",
            employeeName: "Storage Officer",
          }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        setShowComplaintModal(false);
        setComplaintData({
          itemIndex: null,
          complaintType: "",
          complaintDetails: "",
        });
        alert(`Storage complaint added: ${result.complaintId}`);
        lastFetchRef.current.details = null;
        await fetchOrderDetails(selectedOrder);
      } else {
        const error = await response.json();
        alert(`Failed to add complaint: ${error.error}`);
      }
    } catch (error) {
      console.error("Error adding complaint:", error);
      alert("Failed to add complaint");
    }
  }, [selectedOrder, complaintData, fetchOrderDetails]);

  const completeVerification = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/storage/complete/${selectedOrder}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storageNotes,
            storageLocation,
            employeeId: "STORAGE_001",
            employeeName: "Storage Officer",
          }),
        },
      );

      if (response.ok) {
        alert("All items verified and handed over to Dispatch Officer 1");
        setSelectedOrder(null);
        setOrderDetails(null);
        setShowVerificationModal(false);
        setStorageNotes("");
        setStorageLocation("");
        lastFetchRef.current = {};
        await fetchStorageQueue();
        await fetchStats();
      } else {
        const error = await response.json();
        alert(`Failed to complete verification: ${error.error}`);
      }
    } catch (error) {
      console.error("Error completing verification:", error);
      alert("Failed to complete verification");
    }
  }, [
    selectedOrder,
    storageNotes,
    storageLocation,
    fetchStorageQueue,
    fetchStats,
  ]);

  const getOrderStatusColor = (orderStatus) => {
    switch (orderStatus) {
      case "picking-order":
        return "bg-yellow-100 text-yellow-800";
      case "allocated-driver":
        return "bg-blue-100 text-blue-800";
      case "assigned-dispatch-officer-2":
        return "bg-purple-100 text-purple-800";
      case "ready-to-pickup":
        return "bg-indigo-100 text-indigo-800";
      case "order-not-pickedup":
        return "bg-orange-100 text-orange-800";
      case "order-picked-up":
        return "bg-cyan-100 text-cyan-800";
      case "on-way":
        return "bg-blue-100 text-blue-800";
      case "driver-confirmed":
        return "bg-teal-100 text-teal-800";
      case "order-processed":
        return "bg-green-100 text-green-800";
      case "order-complete":
        return "bg-emerald-100 text-emerald-800";
      case "refund":
        return "bg-red-100 text-red-800";
      case "complain-order":
        return "bg-red-100 text-red-800";
      case "issue-driver":
        return "bg-orange-100 text-orange-800";
      case "parcel-returned":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-gray-800 text-white";
      case "low":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-300 text-gray-700";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
      case "handed_to_dispatch":
        return "bg-green-100 text-green-800";
      case "verifying":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "handed_to_dispatch":
        return "Handed Over";
      case "verified":
        return "Verified";
      case "verifying":
        return "Verifying";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  const formatTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const canStartVerification = (order) => {
    return order.status === "pending" || order.status === "verifying";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                <strong>204.</strong> Delivery Storage Officer Dashboard
              </h2>
              <p className="text-gray-600">
                Verify packed orders and prepare for dispatch - All orders
                tracked
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                {stats.pending} pending orders
              </div>
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Updates</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">
                All orders remain visible for complete tracking. Verify items
                match the packing list and check for damages before dispatch.
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Storage Operations - Complete History
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading storage queue...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-8 gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <div>Order</div>
                  <div>Priority</div>
                  <div>Packed By</div>
                  <div>Received At</div>
                  <div>Delivery Time</div>
                  <div>Order Status</div>
                  <div>Storage Status</div>
                  <div>Actions</div>
                </div>

                <div className="divide-y divide-gray-200">
                  {storageQueue.length > 0 ? (
                    storageQueue.map((order, index) => (
                      <div
                        key={`order-${index}`}
                        className={`grid grid-cols-8 gap-4 px-6 py-4 hover:bg-gray-50 ${
                          order.status === "handed_to_dispatch"
                            ? "bg-green-50"
                            : ""
                        }`}
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {order.orderId}
                          </div>
                          <div className="text-sm text-gray-600">
                            {order.customerName}
                          </div>
                        </div>
                        <div>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded ${getPriorityColor(
                              order.priority,
                            )}`}
                          >
                            {order.priority}
                          </span>
                        </div>
                        <div className="text-sm text-gray-900">
                          {order.packedBy}
                        </div>
                        <div className="text-sm text-gray-900">
                          {formatTime(order.packedAt)}
                        </div>
                        <div className="text-sm text-gray-900">
                          {new Date(order.deliveryDate).toLocaleString()}
                        </div>
                        <div>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded ${getOrderStatusColor(
                              order.orderStatus,
                            )}`}
                          >
                            {order.orderStatus}
                          </span>
                        </div>
                        <div>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                              order.status,
                            )}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                          {order.verifiedItems > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {order.verifiedItems}/{order.totalItems} items
                            </div>
                          )}
                        </div>
                        <div>
                          {order.status === "handed_to_dispatch" ? (
                            <button
                              onClick={() =>
                                startVerification(order.orderId, order.status)
                              }
                              className="flex items-center px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </button>
                          ) : order.status === "verified" ? (
                            <button
                              onClick={() =>
                                startVerification(order.orderId, order.status)
                              }
                              className="flex items-center px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </button>
                          ) : canStartVerification(order) ? (
                            <button
                              onClick={() =>
                                startVerification(order.orderId, order.status)
                              }
                              className="flex items-center px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              {order.status === "verifying"
                                ? "Continue"
                                : "Start"}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-500">-</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No orders to display
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {showVerificationModal && (
          <VerificationModalComponent
            selectedOrder={selectedOrder}
            orderDetails={orderDetails}
            storageNotes={storageNotes}
            setStorageNotes={setStorageNotes}
            storageLocation={storageLocation}
            setStorageLocation={setStorageLocation}
            onClose={() => {
              setShowVerificationModal(false);
              setSelectedOrder(null);
              setOrderDetails(null);
              setStorageNotes("");
              setStorageLocation("");
            }}
            onCompleteVerification={completeVerification}
            onVerifyItem={verifyItem}
            onAddComplaint={addComplaint}
            setComplaintData={setComplaintData}
            setShowComplaintModal={setShowComplaintModal}
          />
        )}

        {showComplaintModal && (
          <ComplaintModalComponent
            complaintData={complaintData}
            setComplaintData={setComplaintData}
            onAddComplaint={addComplaint}
            onClose={() => {
              setShowComplaintModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DeliveryStorageOfficerDashboard;
