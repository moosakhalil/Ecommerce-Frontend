import React, { useState, useEffect, useRef, useCallback } from "react";
import ModeToggle from "../Shared/ModeToggle";
import {
  Target,
  Truck,
  Eye,
  Package,
  Users,
  Building,
  User,
  Phone,
  FileText,
  Navigation,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  Weight,
  Box,
  Zap,
  X,
  Check,
  Send,
  Star,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { API_BASE_URL } from "../../utils/config";

const DispatchOfficer1Dashboard = ({ selectedRole, setSelectedRole }) => {
  const [assignmentQueue, setAssignmentQueue] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [dispatchOfficers, setDispatchOfficers] = useState([]);
  const [stats, setStats] = useState({ pending: 0, assigned: 0, urgent: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [vehicleSuggestion, setVehicleSuggestion] = useState(null);
  const [officerLoading, setOfficerLoading] = useState(false);
  const [showModeToggle, setShowModeToggle] = useState(false);
  const pollIntervalRef = useRef(null);

  const roleButtons = [
    { name: "Order Overview", icon: Package },
    { name: "Packing Staff", icon: Package },
    { name: "Delivery Storage Officer", icon: Building },
    { name: "Dispatch Officer 1", icon: User, active: true },
    { name: "Dispatch Officer 2", icon: User },
    { name: "Driver", icon: Truck },
    { name: "Driver on Delivery", icon: Navigation },
  ];

  const secondRowRoles = [
    { name: "Complaint Manager on Delivery", icon: Phone },
    { name: "Complaint Manager After Delivery", icon: FileText },
  ];

  // Initialize data fetch
  useEffect(() => {
    fetchAllData();

    // Poll every 20 seconds for updates
    pollIntervalRef.current = setInterval(() => {
      if (!showOrderModal) {
        fetchAllData();
      }
    }, 20000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [showOrderModal]);

  const fetchAllData = useCallback(async () => {
    try {
      await Promise.all([
        fetchAssignmentQueue(),
        fetchVehicles(),
        fetchStats(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAssignmentQueue = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dispatch1/queue`);
      const data = await response.json();
      setAssignmentQueue(data);
    } catch (error) {
      console.error("Error fetching assignment queue:", error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dispatch1/vehicles`);
      const data = await response.json();
      setAvailableVehicles(data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  // ✅ NEW: Real-time dispatch officers fetch - show ALL employees
  const fetchDispatchOfficers = useCallback(async () => {
    setOfficerLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dispatch1/dispatch-officers`,
      );
      const data = await response.json();
      console.log("Officers response:", data);

      // Use 'all' to show all employees, not just 'available'
      const allOfficers = data.all || data.available || [];
      setDispatchOfficers(allOfficers);

      console.log("Dispatch officers loaded:", allOfficers.length);
    } catch (error) {
      console.error("Error fetching dispatch officers:", error);
    } finally {
      setOfficerLoading(false);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dispatch1/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dispatch1/order/${orderId}`,
      );
      const data = await response.json();
      setSelectedOrder(data);

      // Fetch vehicle suggestion
      const suggestionResponse = await fetch(
        `${API_BASE_URL}/api/dispatch1/suggest-vehicle/${orderId}`,
      );
      const suggestionData = await suggestionResponse.json();
      setVehicleSuggestion(suggestionData);

      // Fetch dispatch officers when opening modal
      await fetchDispatchOfficers();

      setShowOrderModal(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const handleOrderSelection = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  const handleBulkAssignment = async () => {
    if (selectedOrders.length === 0 || !selectedVehicle || !selectedDriver) {
      alert("Please select orders, vehicle, and driver for assignment");
      return;
    }

    try {
      const driverDetails = dispatchOfficers.find(
        (d) => d.employeeId === selectedDriver,
      );

      const assignments = selectedOrders.map((orderId) => ({
        orderId,
        vehicleId: selectedVehicle,
        driverDetails,
        notes: assignmentNotes,
      }));

      const response = await fetch(
        `${API_BASE_URL}/api/dispatch1/bulk-assign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assignments,
            employeeId: "DO1_001",
            employeeName: "Dispatch Officer 1",
          }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.message}`);

        setSelectedOrders([]);
        setSelectedVehicle("");
        setSelectedDriver("");
        setAssignmentNotes("");

        fetchAllData();
      } else {
        const error = await response.json();
        alert(`❌ Assignment failed: ${error.error}`);
      }
    } catch (error) {
      console.error("Error in bulk assignment:", error);
      alert("Failed to assign orders");
    }
  };

  const handleSingleAssignment = async (orderId) => {
    if (!selectedVehicle || !selectedDriver) {
      alert("Please select vehicle and driver for assignment");
      return;
    }

    try {
      const driverDetails = dispatchOfficers.find(
        (d) => d.employeeId === selectedDriver,
      );

      const response = await fetch(
        `${API_BASE_URL}/api/dispatch1/assign/${orderId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vehicleId: selectedVehicle,
            driverDetails,
            assignmentNotes,
            employeeId: "DO1_001",
            employeeName: "Dispatch Officer 1",
          }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.message}`);
        fetchAllData();
        setShowOrderModal(false);
      } else {
        const error = await response.json();
        alert(`❌ Assignment failed: ${error.error}`);
      }
    } catch (error) {
      console.error("Error assigning order:", error);
      alert("Failed to assign order");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-amber-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const formatVehicleCapacity = (specs) => {
    return `${specs.maxPackages}pkg | ${specs.maxWeight}kg | ${specs.maxVolume}m³`;
  };

  // ✅ REFINED: Officer selection dropdown with real-time info
  const OfficerSelector = () => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Dispatch Officer 2
        {officerLoading && (
          <RefreshCw className="inline h-3 w-3 ml-2 animate-spin" />
        )}
      </label>
      <select
        value={selectedDriver}
        onChange={(e) => setSelectedDriver(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={officerLoading}
      >
        <option value="">
          {officerLoading
            ? "Loading officers..."
            : "Choose a dispatch officer..."}
        </option>
        {dispatchOfficers.map((officer) => (
          <option key={officer.employeeId} value={officer.employeeId}>
            {officer.employeeName} ({officer.currentAssignments}/
            {officer.maxAssignments}) ⭐ {officer.rating}/5
          </option>
        ))}
      </select>

      {/* ✅ Display selected officer details */}
      {selectedDriver && (
        <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
          {(() => {
            const officer = dispatchOfficers.find(
              (d) => d.employeeId === selectedDriver,
            );
            return officer ? (
              <div className="text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {officer.employeeName}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-semibold">
                      {officer.rating}/5
                    </span>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-3 w-3 mr-1" />
                  {officer.phone}
                </div>
                <div className="flex items-center text-gray-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {officer.completedOrders} orders completed
                </div>
                <div className="flex items-center">
                  <div className="text-xs">
                    Assignments:{" "}
                    <span className="font-semibold">
                      {officer.currentAssignments}/{officer.maxAssignments}
                    </span>
                  </div>
                  <div className="ml-2 w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        officer.currentAssignments / officer.maxAssignments >
                        0.8
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${
                          (officer.currentAssignments /
                            officer.maxAssignments) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Order Assignment - {order.orderId}
                </h2>
                <p className="text-gray-600 mt-1">{order.customerName}</p>
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
            {/* Order & Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-gray-600" />
                  Order Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Customer:</span>{" "}
                    {order.customerName}
                  </p>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    {order.customerPhone}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    {new Date(order.deliveryDate).toLocaleDateString()}
                  </div>
                  <p>
                    <span className="font-medium">Time Slot:</span>{" "}
                    {order.timeSlot || "Flexible"}
                  </p>
                  <p className="pt-2 border-t">
                    <span className="font-medium text-lg">
                      AED {order.totalAmount?.toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-3 text-blue-900 flex items-center">
                  <Box className="h-5 w-5 mr-2" />
                  Requirements
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Packages:</span>
                    <span className="font-semibold bg-white px-2 py-1 rounded">
                      {order.requirements?.packages || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Weight:</span>
                    <span className="font-semibold bg-white px-2 py-1 rounded">
                      {order.requirements?.weight || 0} kg
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Volume:</span>
                    <span className="font-semibold bg-white px-2 py-1 rounded">
                      {order.requirements?.volume || 0} m³
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-red-500" />
                Delivery Address
              </h3>
              <div>
                <p className="font-semibold">{order.deliveryAddress?.area}</p>
                <p className="text-gray-600">
                  {order.deliveryAddress?.fullAddress}
                </p>
              </div>
            </div>

            {/* Vehicle Suggestion */}
            {vehicleSuggestion && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-green-800 flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Suggested Vehicle
                </h3>
                {vehicleSuggestion.suggestedVehicle ? (
                  <div className="bg-white p-3 rounded border border-green-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">
                          {vehicleSuggestion.suggestedVehicle.displayName}
                        </h4>
                        <p className="text-sm text-gray-600 capitalize">
                          {vehicleSuggestion.suggestedVehicle.category}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-700 text-right">
                        {formatVehicleCapacity(
                          vehicleSuggestion.suggestedVehicle.specifications,
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-orange-600">
                    No suitable vehicle found for current requirements
                  </p>
                )}
              </div>
            )}

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Box className="h-5 w-5 mr-2 text-gray-600" />
                Order Items
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                        Item
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                        Qty
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                        Weight
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {order.items?.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">
                          {item.productName}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {item.weight || "N/A"}
                        </td>
                        <td className="px-4 py-2">
                          <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            ✓ Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Assignment Form */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Assignment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Vehicle
                  </label>
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a vehicle...</option>
                    {availableVehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.displayName} -{" "}
                        {formatVehicleCapacity(vehicle.specifications)}
                      </option>
                    ))}
                  </select>
                </div>

                <OfficerSelector />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Notes
                </label>
                <textarea
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  placeholder="Enter any special instructions or notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSingleAssignment(order.orderId)}
                  disabled={!selectedVehicle || !selectedDriver}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Assign Order
                </button>
              </div>
            </div>
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
            Loading Assignment Queue
          </h2>
          <p className="text-gray-600">
            Fetching orders ready for vehicle assignment...
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                <strong>205.</strong> Dispatch Officer 1 Dashboard
              </h2>
              <p className="text-gray-600">
                Assign vehicles and dispatch officers to verified orders
              </p>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-blue-900 font-medium">
                  {stats.pending} pending
                </span>
              </div>
              {stats.urgent > 0 && (
                <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-red-900 font-medium">
                    {stats.urgent} urgent
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Target className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-sm text-blue-900">
                Assign vehicles and dispatch officers to orders that have
                completed storage verification.
              </span>
            </div>
          </div>

          {/* Bulk Assignment Controls */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Send className="h-5 w-5 mr-2 text-blue-600" />
              Bulk Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select type...</option>
                  <option value="Scooter 1">🛵 Scooter 1</option>
                  <option value="Truck">🚛 Truck</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dispatch Officer 2
                </label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select officer...</option>
                  {dispatchOfficers.length > 0 ? (
                    dispatchOfficers.map((officer) => (
                      <option
                        key={officer.employeeId}
                        value={officer.employeeId}
                      >
                        {officer.employeeName} ({officer.currentAssignments}/
                        {officer.maxAssignments}) ⭐ {officer.rating}/5
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading employees...</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <input
                  type="text"
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  placeholder="Assignment notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col justify-end">
                <button
                  onClick={handleBulkAssignment}
                  disabled={
                    selectedOrders.length === 0 ||
                    !selectedVehicle ||
                    !selectedDriver
                  }
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium flex items-center justify-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Assign {selectedOrders.length}
                </button>
              </div>
            </div>
          </div>

          {/* Assignment Queue */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                Ready for Assignment ({assignmentQueue.length} orders)
              </h3>
            </div>

            {assignmentQueue.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Orders Ready
                </h3>
                <p className="text-gray-600">
                  All orders are either in progress or already assigned.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOrders(
                                  assignmentQueue.map((o) => o.orderId),
                                );
                              } else {
                                setSelectedOrders([]);
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Requirements
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Delivery
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {assignmentQueue.map((order, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(order.orderId)}
                              onChange={() =>
                                handleOrderSelection(order.orderId)
                              }
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">
                              {order.orderId}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {order.customerName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.customerPhone}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs space-y-1">
                              <div>📦 {order.requirements?.packages} pkg</div>
                              <div>⚖️ {order.requirements?.weight} kg</div>
                              <div>📐 {order.requirements?.volume} m³</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {new Date(
                                order.deliveryDate,
                              ).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.timeSlot || "Flexible"}
                            </div>
                            {order.isUrgent && (
                              <div className="text-xs text-red-600 font-semibold mt-1">
                                ⏰ {order.hoursUntilDelivery}h left
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                                order.priority,
                              )}`}
                            >
                              {order.priority.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-green-600">
                              AED {order.totalAmount?.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => fetchOrderDetails(order.orderId)}
                              className="inline-flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition font-medium"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              setVehicleSuggestion(null);
              setSelectedVehicle("");
              setSelectedDriver("");
              setAssignmentNotes("");
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DispatchOfficer1Dashboard;
