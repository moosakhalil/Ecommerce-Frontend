import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  Building,
  Truck,
  User,
  Phone,
  FileText,
  Navigation,
  CheckCircle,
  Clock,
  Eye,
  X,
  AlertTriangle,
  MapPin,
  Calendar,
  Home,
  Zap,
  TrendingUp,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

const DispatchOfficer2Dashboard = ({ selectedRole, setSelectedRole }) => {
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [vehicleStatus, setVehicleStatus] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    verifying: 0,
    readyForDispatch: 0,
    totalVehicles: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState("");
  const [verifyingItems, setVerifyingItems] = useState(new Set());
  const [modalLoadingNotes, setModalLoadingNotes] = useState("");

  const roleButtons = [
    { name: "Order Overview", icon: Package },
    { name: "Packing Staff", icon: Package },
    { name: "Delivery Storage Officer", icon: Building },
    { name: "Dispatch Officer 1", icon: User },
    { name: "Dispatch Officer 2", icon: User, active: true },
    { name: "Driver", icon: Truck },
    { name: "Driver on Delivery", icon: Navigation },
  ];

  const secondRowRoles = [
    { name: "Complaint Manager on Delivery", icon: Phone },
    { name: "Complaint Manager After Delivery", icon: FileText },
  ];

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 25000); // Refresh every 25 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      await Promise.all([
        fetchVerificationQueue(),
        fetchVehicleStatus(),
        fetchStats(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVerificationQueue = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dispatch2/queue`);
      const data = await response.json();
      setVerificationQueue(data);
    } catch (error) {
      console.error("Error fetching verification queue:", error);
    }
  };

  const fetchVehicleStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dispatch2/vehicles`);
      const data = await response.json();
      setVehicleStatus(data);
    } catch (error) {
      console.error("Error fetching vehicle status:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dispatch2/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dispatch2/order/${orderId}`
      );
      const data = await response.json();
      setSelectedOrder(data);
      setShowOrderModal(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  // ✅ IMPROVED: Verification with proper handling
  const handleItemVerification = async (
    orderId,
    itemIndex,
    verified,
    notes = ""
  ) => {
    const itemKey = `${orderId}-${itemIndex}`;
    setVerifyingItems((prev) => new Set(prev).add(itemKey));

    try {
      console.log(`🔍 Verifying item ${itemIndex} for order ${orderId}:`, {
        verified: Boolean(verified),
        notes,
      });

      const response = await fetch(
        `${API_BASE_URL}/api/dispatch2/verify-item/${orderId}/${itemIndex}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeId: "DO2_001",
            employeeName: "Dispatch Officer 2",
            verified: Boolean(verified),
            notes: notes,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Verification successful:", result);

        // Update selected order
        if (selectedOrder && selectedOrder.orderId === orderId) {
          const updatedOrder = { ...selectedOrder };
          updatedOrder.items[itemIndex].loadingVerified = Boolean(verified);
          updatedOrder.items[itemIndex].loadingNotes = notes;
          updatedOrder.items[itemIndex].loadingVerifiedAt = new Date();

          // Recalculate progress
          const verifiedCount = updatedOrder.items.filter(
            (item) => item.loadingVerified === true
          ).length;
          const totalItems = updatedOrder.items.length;

          updatedOrder.loadingDetails = {
            ...updatedOrder.loadingDetails,
            totalItemsLoaded: verifiedCount,
            totalItemsRequested: totalItems,
            loadingProgress: Math.round((verifiedCount / totalItems) * 100),
          };

          setSelectedOrder(updatedOrder);
        }

        // Refresh queue
        await fetchVerificationQueue();
      } else {
        const error = await response.json();
        console.error("❌ Verification failed:", error);
        alert(`Verification failed: ${error.error}`);
      }
    } catch (error) {
      console.error("Error verifying item:", error);
      alert("Failed to verify item");
    } finally {
      setVerifyingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemKey);
        return next;
      });
    }
  };

  // ✅ IMPROVED: Complete loading with debug check
  const handleCompleteOrderLoading = async (orderId) => {
    try {
      // Check status first
      const debugResponse = await fetch(
        `${API_BASE_URL}/api/dispatch2/debug/${orderId}`
      );
      const debugData = await debugResponse.json();

      console.log("🔍 Debug data before completion:", debugData);

      if (!debugData.allItemsVerifiedStrict) {
        const unverifiedItems = debugData.itemsStatus
          .filter((item) => !item.isStrictlyTrue)
          .map((item) => item.productName)
          .join(", ");

        alert(
          `❌ Cannot complete loading\n\n✅ Verified: ${debugData.verifiedItemsStrict}/${debugData.totalItems}\n❌ Unverified: ${unverifiedItems}`
        );
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/dispatch2/complete-loading/${orderId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            loadingNotes: loadingNotes,
            employeeId: "DO2_001",
            employeeName: "Dispatch Officer 2",
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Loading completed:", result);
        alert(`✅ ${result.message}`);
        setShowOrderModal(false);
        setSelectedOrder(null);
        setLoadingNotes("");
        fetchAllData();
      } else {
        const error = await response.json();
        console.error("Error:", error);
        alert(
          `❌ Error: ${error.error}\n${
            error.details ? error.details.unverifiedItems?.join(", ") : ""
          }`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to complete loading");
    }
  };

  const handleCompleteVehicleLoading = async (vehicleId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dispatch2/complete-vehicle-loading/${vehicleId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeId: "DO2_001",
            employeeName: "Dispatch Officer 2",
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.message}`);
        fetchAllData();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to complete vehicle loading");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-red-100 text-red-800";
      case "verifying":
        return "bg-yellow-100 text-yellow-800";
      case "verified":
        return "bg-blue-100 text-blue-800";
      case "confirmed for dispatch":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getVehicleStatusColor = (status) => {
    switch (status) {
      case "loading":
        return "bg-yellow-100 text-yellow-800";
      case "ready for dispatch":
        return "bg-blue-100 text-blue-800";
      case "all orders loaded":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // ✅ REFINED: Order Verification Modal
  const OrderVerificationModal = ({ order, onClose }) => {
    if (!order) return null;

    // Strict verification check
    const verifiedItems =
      order.items?.filter((item) => item.loadingVerified === true) || [];
    const totalItems = order.items?.length || 0;
    const allItemsVerified =
      verifiedItems.length === totalItems && totalItems > 0;
    const verificationProgress =
      totalItems > 0
        ? Math.round((verifiedItems.length / totalItems) * 100)
        : 0;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Sticky Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Verify & Load Order
                </h2>
                <p className="text-gray-600 mt-1">{order.orderId}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Progress Bar */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-blue-900">
                  Loading Progress
                </h3>
                <div className="text-3xl font-bold text-blue-600">
                  {verificationProgress}%
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${verificationProgress}%` }}
                ></div>
              </div>
              <p className="text-blue-800 mt-3 font-medium">
                {verifiedItems.length} of {totalItems} items verified
              </p>
            </div>

            {/* Order & Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-gray-600" />
                  Order Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Customer</p>
                    <p className="font-semibold text-gray-900">
                      {order.customerName}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <p className="text-gray-900">{order.customerPhone}</p>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <p className="text-gray-900">
                      {new Date(order.deliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Time Slot</p>
                    <p className="font-semibold text-gray-900">
                      {order.timeSlot || "Flexible"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-900">
                  <Truck className="h-5 w-5 mr-2" />
                  Vehicle Assignment
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-blue-700">Vehicle</p>
                    <p className="font-semibold text-blue-900">
                      {order.assignmentDetails?.assignedVehicle?.displayName ||
                        "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-700">Type</p>
                    <p className="font-semibold capitalize text-blue-900">
                      {order.assignmentDetails?.assignedVehicle?.category ||
                        "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-700">Driver</p>
                    <p className="font-semibold text-blue-900">
                      {order.assignmentDetails?.assignedDriver?.employeeName ||
                        "Not assigned"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold mb-3 flex items-center text-yellow-900">
                <MapPin className="h-5 w-5 mr-2" />
                Delivery Address
              </h3>
              <div className="space-y-2">
                <p className="font-bold text-yellow-900 text-lg">
                  {order.deliveryAddress?.area || "Area not specified"}
                </p>
                <p className="text-yellow-800">
                  {order.deliveryAddress?.fullAddress || "Address not found"}
                </p>
              </div>
            </div>

            {/* Items Verification Table */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Items to Verify & Load
              </h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full bg-white">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Item Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Notes
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items?.map((item, index) => {
                      const isVerified = item.loadingVerified === true;
                      const isVerifying = verifyingItems.has(
                        `${order.orderId}-${index}`
                      );

                      return (
                        <tr
                          key={index}
                          className={`transition-colors ${
                            isVerified ? "bg-green-50" : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="px-4 py-3">
                            {isVerified ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <Clock className="h-5 w-5 text-gray-400" />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">
                              {item.productName}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {item.quantity}x
                          </td>
                          <td className="px-4 py-3">
                            {item.loadingNotes && (
                              <p className="text-xs text-gray-600 italic">
                                "{item.loadingNotes}"
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isVerified ? (
                              <div className="flex items-center justify-center space-x-2">
                                <span className="px-2 py-1 text-xs font-medium bg-green-200 text-green-800 rounded-full">
                                  ✓ Loaded
                                </span>
                                <button
                                  onClick={() =>
                                    handleItemVerification(
                                      order.orderId,
                                      index,
                                      false
                                    )
                                  }
                                  disabled={isVerifying}
                                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                                >
                                  Unload
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  handleItemVerification(
                                    order.orderId,
                                    index,
                                    true
                                  )
                                }
                                disabled={isVerifying}
                                className="px-4 py-2 text-xs font-bold bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition"
                              >
                                {isVerifying ? "Verifying..." : "✓ Verify"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Complete Loading Section */}
            {allItemsVerified && (
              <div className="bg-green-50 border-2 border-green-300 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span className="text-lg font-bold text-green-800">
                    All {totalItems} items verified! Ready to complete.
                  </span>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loading Notes (Optional)
                  </label>
                  <textarea
                    value={modalLoadingNotes}
                    onChange={(e) => setModalLoadingNotes(e.target.value)}
                    placeholder="Add any special loading instructions or observations..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    rows="3"
                  />
                </div>

                <button
                  onClick={() => handleCompleteOrderLoading(order.orderId)}
                  className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Complete Loading - Ready for Driver Pickup
                </button>
              </div>
            )}

            {/* Close Button */}
            {!allItemsVerified && (
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Verification Queue
          </h2>
          <p className="text-gray-600">
            Fetching orders ready for verification and loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Dashboard Content */}
        <div>
          {/* Title Section */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Dispatch Officer 2 Dashboard
              </h2>
              <p className="text-gray-600">
                Verify items and load orders onto vehicles
              </p>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-red-900 font-medium">
                  {stats.pending} pending
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-900 font-medium">
                  {stats.verifying} verifying
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-900 font-medium">
                  {stats.readyForDispatch} ready
                </span>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-sm text-blue-800">
                Verify all items are correct and loaded into assigned vehicles
                before marking ready for driver.
              </span>
            </div>
          </div>

          {/* Orders for Verification */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-gray-600" />
              Orders for Verification & Loading ({verificationQueue.length})
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              {verificationQueue.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Orders to Load
                  </h3>
                  <p className="text-gray-600">
                    All orders are either completed or not yet assigned.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Vehicle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Time Slot
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {verificationQueue.map((order, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">
                              {order.orderId}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {order.customerName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.customerPhone}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-start space-x-1">
                              <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <div className="text-sm">
                                <p className="font-semibold text-gray-900">
                                  {order.deliveryAddress?.area ||
                                    "Area not specified"}
                                </p>
                                <p className="text-xs text-gray-600 truncate max-w-xs">
                                  {order.deliveryAddress?.fullAddress ||
                                    "Address not found"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-1">
                              <Truck className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-900">
                                {order.assignmentDetails?.assignedVehicle
                                  ?.displayName || "Not assigned"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900">
                              {order.timeSlot}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${order.verificationProgress}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold text-gray-700 w-8">
                                {order.verificationProgress}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {order.verifiedItems}/{order.totalItems} items
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(
                                order.loadingStatus
                              )}`}
                            >
                              {order.loadingStatus.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {order.loadingStatus ===
                            "confirmed for dispatch" ? (
                              <div className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-200 text-green-800 text-xs font-bold rounded-lg">
                                <CheckCircle className="h-4 w-4" />
                                <span>Confirmed</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => fetchOrderDetails(order.orderId)}
                                className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition"
                              >
                                <Eye className="h-4 w-4" />
                                <span>Verify Items</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Status */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Truck className="h-5 w-5 mr-2 text-gray-600" />
              Vehicle Loading Status ({vehicleStatus.length})
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              {vehicleStatus.length === 0 ? (
                <div className="p-12 text-center">
                  <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Active Vehicles
                  </h3>
                  <p className="text-gray-600">
                    No vehicles are currently assigned for loading.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Vehicle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Load Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Assigned Orders
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {vehicleStatus.map((vehicle, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Truck className="h-5 w-5 text-gray-600" />
                              <span className="font-bold text-gray-900">
                                {vehicle.displayName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded capitalize">
                              {vehicle.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex-1">
                                <div className="w-32 bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="bg-gray-900 h-2.5 rounded-full transition-all"
                                    style={{
                                      width: `${vehicle.loadProgress}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <span className="text-sm font-bold text-gray-700 w-12">
                                {vehicle.loadProgress}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {vehicle.loadedItems}/{vehicle.totalItems} items
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {vehicle.assignedOrders.map((order, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center space-x-2"
                                >
                                  {order.isFullyLoaded && (
                                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                  )}
                                  <span className="text-sm text-gray-900">
                                    {order.orderId}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${getVehicleStatusColor(
                                vehicle.status
                              )}`}
                            >
                              {vehicle.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {vehicle.status === "ready for dispatch" && (
                              <button
                                onClick={() =>
                                  handleCompleteVehicleLoading(
                                    vehicle.vehicleId
                                  )
                                }
                                className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition mx-auto"
                              >
                                <TrendingUp className="h-4 w-4" />
                                <span>Confirm All Loaded</span>
                              </button>
                            )}
                            {vehicle.status === "all orders loaded" && (
                              <div className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-200 text-green-800 text-xs font-bold rounded-lg">
                                <CheckCircle className="h-4 w-4" />
                                <span>Ready for Driver</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {showOrderModal && (
          <OrderVerificationModal
            order={selectedOrder}
            onClose={() => {
              setShowOrderModal(false);
              setSelectedOrder(null);
              setLoadingNotes("");
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DispatchOfficer2Dashboard;
