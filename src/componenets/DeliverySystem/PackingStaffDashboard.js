import React, { useState, useEffect, useRef } from "react";
import ModeToggle from "../Shared/ModeToggle";
import {
  Clock,
  CheckCircle,
  Play,
  X,
  AlertTriangle,
  Package,
  Users,
} from "lucide-react";
import { API_BASE_URL } from "../../utils/config";

const PackingStaffDashboard = () => {
  const [packingQueue, setPackingQueue] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, packing: 0, completed: 0 });
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [showModeToggle, setShowModeToggle] = useState(false);

  const [complaintData, setComplaintData] = useState({
    itemIndex: null,
    complaintType: "",
    complaintDetails: "",
  });
  const [packingNotes, setPackingNotes] = useState("");

  // ✅ FIX: Proper debouncing refs
  const lastPackingQueueRef = useRef("");
  const lastStatsRef = useRef("");
  const lastOrderDetailsRef = useRef("");
  const fetchIntervalRef = useRef(null);

  useEffect(() => {
    fetchEmployees();
    fetchPackingQueue();
    fetchStats();

    // ✅ FIX: Single interval with proper cleanup
    fetchIntervalRef.current = setInterval(() => {
      fetchPackingQueue();
      fetchStats();
      if (selectedOrder) {
        fetchOrderDetails(selectedOrder);
      }
    }, 10000);

    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
    };
  }, []);

  // ✅ SEPARATE EFFECT: Update order details when selected order changes
  useEffect(() => {
    if (selectedOrder) {
      fetchOrderDetails(selectedOrder);
    }
  }, [selectedOrder]);

  const fetchEmployees = async () => {
    try {
      setEmployeeLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/packing/staff`);
      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    } finally {
      setEmployeeLoading(false);
    }
  };

  // ✅ FIX: Proper debouncing with string comparison
  const fetchPackingQueue = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/packing/queue`);
      const data = await response.json();

      const newStr = JSON.stringify(data);
      if (newStr !== lastPackingQueueRef.current) {
        setPackingQueue(data || []);
        lastPackingQueueRef.current = newStr;
      }
    } catch (error) {
      console.error("Error fetching packing queue:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/packing/stats`);
      const data = await response.json();

      const newStr = JSON.stringify(data);
      if (newStr !== lastStatsRef.current) {
        setStats(data);
        lastStatsRef.current = newStr;
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // ✅ FIX: Proper debouncing for order details
  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/packing/order/${orderId}`,
      );
      const data = await response.json();

      const newStr = JSON.stringify(data);
      if (newStr !== lastOrderDetailsRef.current) {
        setOrderDetails(data);
        lastOrderDetailsRef.current = newStr;
      }
      setSelectedOrder(orderId);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const startPacking = async (orderId) => {
    if (!selectedEmployee) {
      alert("Please select an employee first");
      setShowEmployeeModal(true);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/packing/start/${orderId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeId: selectedEmployee.employeeId,
            employeeName: selectedEmployee.name,
          }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        alert(
          `Packing started for order ${orderId} by ${selectedEmployee.name}`,
        );
        fetchPackingQueue();
        fetchOrderDetails(orderId);
        fetchStats();
        setShowEmployeeModal(false);
      } else {
        const error = await response.json();
        alert(`Failed to start packing: ${error.error}`);
      }
    } catch (error) {
      console.error("Error starting packing:", error);
      alert("Failed to start packing");
    }
  };

  const markItemPacked = async (itemIndex) => {
    if (!selectedEmployee) {
      alert("Please select an employee");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/packing/item/${selectedOrder}/${itemIndex}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeId: selectedEmployee.employeeId,
            employeeName: selectedEmployee.name,
          }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        alert(
          `Item packed! Progress: ${result.packedItems}/${result.totalItems} items`,
        );
        fetchOrderDetails(selectedOrder);
        fetchPackingQueue();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Failed to mark item as packed: ${error.error}`);
      }
    } catch (error) {
      console.error("Error marking item as packed:", error);
      alert("Failed to mark item as packed");
    }
  };

  const addComplaint = async () => {
    if (!selectedEmployee) {
      alert("Please select an employee");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/packing/complaint/${selectedOrder}/${complaintData.itemIndex}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            complaintType: complaintData.complaintType,
            complaintDetails: complaintData.complaintDetails,
            employeeId: selectedEmployee.employeeId,
            employeeName: selectedEmployee.name,
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
        alert(`Complaint added successfully: ${result.complaintId}`);
        fetchOrderDetails(selectedOrder);
        fetchPackingQueue();
      } else {
        const error = await response.json();
        alert(`Failed to add complaint: ${error.error}`);
      }
    } catch (error) {
      console.error("Error adding complaint:", error);
      alert("Failed to add complaint");
    }
  };

  const completePacking = async () => {
    if (!selectedEmployee) {
      alert("Please select an employee");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/packing/complete/${selectedOrder}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packingNotes: packingNotes,
            employeeId: selectedEmployee.employeeId,
            employeeName: selectedEmployee.name,
          }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        alert(
          `Order ${selectedOrder} packing completed! Status: ${result.newStatus}`,
        );
        setSelectedOrder(null);
        setOrderDetails(null);
        setPackingNotes("");
        fetchPackingQueue();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Failed to complete packing: ${error.error}`);
      }
    } catch (error) {
      console.error("Error completing packing:", error);
      alert("Failed to complete packing");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "picking-order":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "allocated-driver":
        return "bg-green-100 text-green-800 border border-green-200";
      case "order-confirmed":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getItemStatusColor = (packingStatus) => {
    switch (packingStatus) {
      case "packed":
        return "bg-green-100 text-green-800 border border-green-200";
      case "unavailable":
        return "bg-red-100 text-red-800 border border-red-200";
      case "packing":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-orange-100 text-orange-800 border border-orange-200";
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const ComplaintModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Item Complaint</h3>
          <button onClick={() => setShowComplaintModal(false)}>
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
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select complaint type</option>
              <option value="not_available">Item not available</option>
              <option value="damaged">Item damaged</option>
              <option value="expired">Item expired</option>
              <option value="insufficient_stock">Insufficient stock</option>
              <option value="quality_issue">Quality issue</option>
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
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="3"
              placeholder="Enter complaint details..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowComplaintModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={addComplaint}
              disabled={
                !complaintData.complaintType || !complaintData.complaintDetails
              }
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Add Complaint
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const EmployeeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select Packing Staff</h3>
          <button onClick={() => setShowEmployeeModal(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {employeeLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading staff...</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {employees.length === 0 ? (
              <p className="text-gray-600">No packing staff available</p>
            ) : (
              employees.map((emp) => (
                <button
                  key={emp.employeeId}
                  onClick={() => {
                    setSelectedEmployee(emp);
                    if (selectedOrder) {
                      startPacking(selectedOrder);
                    }
                  }}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                    selectedEmployee?.employeeId === emp.employeeId
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-gray-900">{emp.name}</div>
                  <div className="text-sm text-gray-600">{emp.email}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {emp.phone && emp.phone[0]} • Assigned:{" "}
                    {emp.currentAssignments || 0}/{emp.maxAssignments || 5}
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        <div className="mt-4 flex space-x-3">
          <button
            onClick={() => setShowEmployeeModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            <strong>203.</strong> 🎯 Packing Dashboard
          </h2>
          <p className="text-gray-600">Manage order packing and preparation</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            {stats.pending} pending orders
          </div>
          {selectedEmployee && (
            <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <Users className="h-3 w-3 mr-1" />
              {selectedEmployee.name}
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
      </div>

      {!selectedEmployee && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-800 font-medium">
                Select Packing Staff
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                Please select a staff member to start packing orders
              </p>
              <button
                onClick={() => setShowEmployeeModal(true)}
                className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                Select Staff
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-sm text-blue-800">
            Orders should be packed 2-3 hours before scheduled delivery time.
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Packing Queue</h3>
          {selectedEmployee && (
            <button
              onClick={() => setShowEmployeeModal(true)}
              className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
            >
              Change Staff
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading packing queue...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-4 px-6 py-3 bg-gray-50 text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
              <div>Order</div>
              <div>Customer</div>
              <div>Priority</div>
              <div>Pack By</div>
              <div>Delivery</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            <div className="divide-y divide-gray-200">
              {packingQueue.map((order, index) => (
                <div
                  key={index}
                  className="grid grid-cols-7 gap-4 px-6 py-4 hover:bg-gray-50 items-center"
                >
                  <div>
                    <div className="font-bold text-gray-900">
                      {order.orderId}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {order.customerName}
                    </div>
                    <div className="text-xs text-gray-600">
                      {order.customerPhone}
                    </div>
                  </div>
                  <div>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-bold rounded border ${getPriorityColor(
                        order.priority,
                      )}`}
                    >
                      {order.priority.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-900">
                      {formatTime(order.packByTime)}
                    </div>
                    {order.isOverdue && (
                      <div className="text-xs text-red-600 font-bold">
                        ⚠️ Overdue
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-gray-900">
                      {new Date(order.deliveryDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      {order.timeSlot}
                    </div>
                  </div>
                  <div>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-bold rounded border ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status === "order-confirmed"
                        ? "PENDING"
                        : order.status === "picking-order"
                          ? "PACKING"
                          : "PACKED"}
                    </span>
                    {order.packedItemsCount > 0 && (
                      <div className="text-xs text-gray-600 mt-1">
                        {order.packedItemsCount}/{order.itemsCount}
                      </div>
                    )}
                  </div>
                  <div>
                    {order.status === "order-confirmed" ? (
                      <button
                        onClick={() => {
                          setSelectedOrder(order.orderId);
                          if (!selectedEmployee) {
                            setShowEmployeeModal(true);
                          } else {
                            startPacking(order.orderId);
                          }
                        }}
                        className="flex items-center px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700 font-medium"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </button>
                    ) : order.status === "picking-order" ? (
                      <button
                        onClick={() => fetchOrderDetails(order.orderId)}
                        className="flex items-center px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                      >
                        <Package className="h-3 w-3 mr-1" />
                        Continue
                      </button>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 text-xs bg-green-600 text-white rounded font-medium">
                        <CheckCircle className="h-3 w-3 mr-1" />✓ Packed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedOrder && orderDetails && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                📦 Packing - {selectedOrder}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {orderDetails.customerName} • {orderDetails.customerPhone}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>

          <div className="p-6">
            {/* Order Details Section */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3">📋 Order Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Delivery Address:</span>
                  <p className="font-medium text-gray-900">
                    {orderDetails.deliveryAddress?.fullAddress || "N/A"}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Area: {orderDetails.deliveryAddress?.area || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Delivery Date & Time:</span>
                  <p className="font-medium text-gray-900">
                    {new Date(orderDetails.deliveryDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Slot: {orderDetails.timeSlot || "N/A"}
                  </p>
                </div>
                {orderDetails.specialInstructions && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Special Instructions:</span>
                    <p className="font-medium text-orange-700 bg-orange-50 p-2 rounded mt-1">
                      {orderDetails.specialInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <h4 className="font-bold text-gray-900 mb-4">📦 Items to Pack:</h4>

            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-50">
                    <th className="text-left py-3 px-4 font-bold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">
                      Item
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">
                      Qty
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">
                      Weight
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">
                      Action
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">
                      Complaint
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orderDetails.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={item.packingStatus === "packed"}
                          readOnly
                          className="h-4 w-4 text-gray-600"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {item.productName}
                        </div>
                        {item.itemComplaints &&
                          item.itemComplaints.length > 0 && (
                            <div className="flex items-center text-xs text-red-600 mt-1 font-bold">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {item.itemComplaints.length} complaint(s)
                            </div>
                          )}
                        {item.packingStatus && (
                          <span
                            className={`inline-block px-2 py-1 text-xs font-bold rounded border mt-1 ${getItemStatusColor(
                              item.packingStatus,
                            )}`}
                          >
                            {item.packingStatus.toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {item.weight || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        {item.packingStatus === "packed" ? (
                          <span className="inline-flex items-center px-3 py-1 text-xs bg-green-100 text-green-800 font-bold rounded-full border border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Packed
                          </span>
                        ) : item.packingStatus === "unavailable" ? (
                          <span className="inline-flex items-center px-3 py-1 text-xs bg-red-100 text-red-800 font-bold rounded-full border border-red-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Unavailable
                          </span>
                        ) : (
                          <button
                            onClick={() => markItemPacked(index)}
                            className="flex items-center px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700 font-bold"
                          >
                            Mark Packed
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
                          className="flex items-center px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 font-bold"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Packing Progress */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between text-sm text-gray-700 mb-2">
                <span className="font-bold">Packing Progress</span>
                <span className="font-bold">
                  {
                    orderDetails.items.filter(
                      (item) => item.packingStatus === "packed",
                    ).length
                  }{" "}
                  / {orderDetails.items.length} items
                </span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      (orderDetails.items.filter(
                        (item) => item.packingStatus === "packed",
                      ).length /
                        orderDetails.items.length) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <div className="mt-3 text-xs text-gray-600 flex justify-between">
                <span>
                  Complaints:{" "}
                  <span className="font-bold">
                    {orderDetails.items.reduce(
                      (count, item) =>
                        count +
                        (item.itemComplaints ? item.itemComplaints.length : 0),
                      0,
                    )}
                  </span>
                </span>
                <span>
                  Unavailable:{" "}
                  <span className="font-bold">
                    {
                      orderDetails.items.filter(
                        (item) => item.packingStatus === "unavailable",
                      ).length
                    }
                  </span>
                </span>
              </div>
            </div>

            {/* Packing Notes */}
            <div className="mb-6">
              <label className="block font-bold text-gray-900 mb-2">
                📝 Packing Notes:
              </label>
              <textarea
                value={packingNotes}
                onChange={(e) => setPackingNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Add any special notes about packing (fragile items, special handling, etc.)"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between gap-3">
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setOrderDetails(null);
                  setPackingNotes("");
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Close
              </button>

              <button
                onClick={completePacking}
                disabled={
                  !orderDetails.items.every(
                    (item) =>
                      item.packingStatus === "packed" ||
                      item.packingStatus === "unavailable",
                  )
                }
                className="flex items-center px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Packing
              </button>
            </div>
          </div>
        </div>
      )}

      {showComplaintModal && <ComplaintModal />}
      {showEmployeeModal && <EmployeeModal />}

      {showModeToggle && (
        <ModeToggle
          componentName="Packing Staff Dashboard"
          onClose={() => setShowModeToggle(false)}
        />
      )}

      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => setShowModeToggle(true)}
          style={{
            background:
              "linear-gradient(to right, rgb(147, 51, 234), rgb(79, 70, 229))",
            color: "white",
            padding: "10px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "500",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <span>🚀</span>
          <span>Advanced</span>
        </button>
        <button
          onClick={() => setShowModeToggle(true)}
          style={{
            background:
              "linear-gradient(to right, rgb(59, 130, 246), rgb(6, 182, 212))",
            color: "white",
            padding: "10px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "500",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <span>🤖</span>
          <span>AI</span>
        </button>
      </div>
    </div>
  );
};

export default PackingStaffDashboard;
