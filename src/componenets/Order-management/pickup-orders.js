import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/sidebar";
import {
  ChevronDown,
  AlertCircle,
  MoreVertical,
  Package,
  Phone,
  Check,
  CheckCircle,
  Truck,
  Bike,
  User,
  MapPin,
  DollarSign,
  Clock,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/config";

export default function OrderManagementPickup() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [allocatedOrders, setAllocatedOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [readyMessage, setReadyMessage] = useState("");
  // at the top of your component, alongside other useState:
  const [pickedUpOrders, setPickedUpOrders] = useState([]);
  const [currentTab, setCurrentTab] = useState("order-ready");

  // Update your PICKUP_STATUS array to use the actual database status values:
  const PICKUP_STATUS = [
    { key: "ready to pickup", label: "Ready to Pickup", color: "green" },
    { key: "order-not-pickedup", label: "Not Picked Up", color: "red" },
    { key: "order-pickuped-up", label: "Picked Up", color: "blue" },
  ];

  // Fetching pickup orders and drivers
  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Include all relevant statuses
      const statuses = [
        "order-confirmed",
        "ready to pickup",
        "order-not-pickedup",
        "order-pickuped-up",
      ].join(",");

      // 1. Get the raw orders from all relevant statuses
      const { data } = await axios.get(
        `${API_BASE_URL}/api/orders`,
        {
          params: {
            status: statuses,
            deliveryType: "self_pickup",
            limit: 100,
          },
        }
      );

      // 2. Enrich each order with a cleaned phone number & proper customer name
      const ordersWithPhones = await Promise.all(
        data.orders.map(async (order) => {
          let phoneNumber = "N/A";
          let name = order.customer || "N/A";

          try {
            const res = await axios.get(
              `${API_BASE_URL}/api/orders/${order.orderId}/phone`
            );
            phoneNumber = res.data.phoneNumber;
            name = res.data.name;
          } catch (err) {
            console.error(`Failed to fetch phone for ${order.orderId}`, err);
          }

          return {
            ...order,
            phoneNumber,
            customer: name,
            pickupStatus: order.status, // Use the actual status as pickupStatus
          };
        })
      );

      // 3. Split orders based on their ACTUAL STATUS, not allocation flags
      const mainOrders = []; // Only order-confirmed (pending allocation)
      const allocated = []; // All pickup-related statuses
      const pickedUp = []; // Only picked up orders

      ordersWithPhones.forEach((order) => {
        if (order.status === "order-confirmed") {
          // Only unallocated orders go to main allocation table
          mainOrders.push(order);
        } else if (order.status === "order-pickuped-up") {
          // Picked up orders go to separate array
          pickedUp.push(order);
        } else if (
          ["ready to pickup", "order-not-pickedup"].includes(order.status)
        ) {
          // All other pickup statuses go to allocated section
          allocated.push(order);
        }
      });

      // 4. Update state
      setOrders(mainOrders); // Only order-confirmed orders
      setAllocatedOrders(
        allocated.sort((a, b) => new Date(a.created) - new Date(b.created))
      );
      setPickedUpOrders(
        pickedUp.sort((a, b) => new Date(a.created) - new Date(b.created))
      );
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchDrivers = async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/employees`,
        {
          params: { employeeCategory: "Driver" },
        }
      );
      setDrivers(data.data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setDrivers([]);
    }
  };

  const handleAllocate = async (orderId) => {
    try {
      setLoading(true);

      // Mark order as allocated for pickup
      await axios.put(
        `${API_BASE_URL}/api/orders/${orderId}/status`,
        {
          status: "order-confirmed",
          pickupAllocated: true,
          allocatedAt: new Date().toISOString(),
        }
      );

      // Move order from main list to allocated section
      const orderToMove = orders.find((order) => order.orderId === orderId);
      if (orderToMove) {
        setAllocatedOrders((prev) =>
          [
            ...prev,
            {
              ...orderToMove,
              pickupAllocated: true,
              allocatedAt: new Date().toISOString(),
              pickupStatus: null, // ← NEW: start with no status
            },
          ].sort(
            (a, b) =>
              new Date(a.allocatedAt || a.created) -
              new Date(b.allocatedAt || b.created)
          )
        );
        setOrders((prev) => prev.filter((order) => order.orderId !== orderId));
      }
    } catch (error) {
      console.error("Error allocating order:", error);
      alert("Error allocating order. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // Update your handlePickupStatus function:
  const handlePickupStatus = async (orderId, statusKey) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/orders/${orderId}/pickup-status`,
        { pickupStatus: statusKey } // This will now send the actual database status value
      );

      // find the order in allocatedOrders
      const order = allocatedOrders.find((o) => o.orderId === orderId);
      if (!order) return;

      // if "Picked Up", remove from allocated and add to pickedUpOrders
      if (statusKey === "order-pickuped-up") {
        setAllocatedOrders((prev) => prev.filter((o) => o.orderId !== orderId));
        setPickedUpOrders((prev) => [
          { ...order, pickupStatus: statusKey },
          ...prev,
        ]);
      } else {
        // otherwise just update its pickupStatus
        setAllocatedOrders((prev) =>
          prev.map((o) =>
            o.orderId === orderId ? { ...o, pickupStatus: statusKey } : o
          )
        );
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update pickup status");
    }
  };
  const handleReadyForPickup = async (orderId) => {
    try {
      // 1) tell the backend it's ready
      await axios.put(
        `${API_BASE_URL}/api/orders/${orderId}/status`,
        {
          status: "ready to pickup",
        }
      );

      // 2) show a toast / banner
      setReadyMessage("Order ready to be picked up");

      // ← no more "remove from allocatedOrders" here!
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error updating order status. Please try again.");
    }
  };

  const handleCallCustomer = (phoneNumber) => {
    if (phoneNumber) {
      // This will attempt to open the phone dialer with the customer's number
      window.open(`tel:${phoneNumber}`, "_self");
    } else {
      alert("Customer phone number not available");
    }
  };

  const handleManageDelivery = () => {
    navigate("/delivery-orders");
  };

  const handleScooterDelivery = () => {
    navigate("/scooter-delivery");
  };

  const handleManagePickup = () => {
    navigate("/pickup-orders");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Success Message */}
      {readyMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {readyMessage}
        </div>
      )}

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-80" : ""
        } w-full bg-gray-50 p-4`}
      >
        <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8" />
            <div className="text-xl font-semibold">
              4B. Pickup Orders Management
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-xl mb-6 shadow-lg">
            <div className="flex justify-center gap-4">
              <button
                className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors font-medium"
                onClick={handleManageDelivery}
              >
                <Truck className="w-5 h-5" />
                4A Manage Delivery Orders
              </button>
              <button
                className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors font-medium"
                onClick={handleManagePickup}
              >
                <Package className="w-5 h-5" />
                4B Manage Pickup Orders
              </button>
              <button
                className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors font-medium"
                onClick={handleScooterDelivery}
              >
                <Bike className="w-5 h-5" />
                4C Scooter Delivery
              </button>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
            <p className="text-orange-800">
              Allocate pickup orders and mark them as ready when prepared for
              customer collection.
            </p>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-6 flex items-center gap-4">
              <Package className="w-12 h-12 text-purple-600" />
              Pickup Orders
            </h1>
          </div>

          {/* Allocated Orders Section */}
          {allocatedOrders.length > 0 && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 rounded-t-lg border-b-2 border-purple-500">
                <h3 className="font-semibold text-lg text-gray-800">
                  Allocated Pickup Orders
                </h3>
                <p className="text-sm text-gray-600">
                  Orders allocated for pickup - mark as ready when prepared
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-b-lg">
                {allocatedOrders.map((order) => (
                  <div
                    key={order.orderId}
                    className="border-b last:border-b-0 p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-lg text-gray-800">
                            Order {order.orderId}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Allocated for Pickup
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{order.customer}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-medium text-green-600">
                              ${order.totalAmount}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(order.created).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <h4 className="font-medium text-gray-700 mb-2">
                            Items:
                          </h4>
                          <div className="space-y-1">
                            {order.items &&
                              order.items.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded"
                                >
                                  <Package className="w-4 h-4 text-purple-500" />
                                  <span className="font-medium">
                                    {item.productName}
                                  </span>
                                  <span className="text-gray-500">
                                    Qty: {item.quantity}
                                  </span>
                                  {item.weight && (
                                    <span className="text-gray-500">
                                      ({item.weight})
                                    </span>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => handleCallCustomer(order.phoneNumber)}
                          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          Call Customer
                        </button>
                        <div className="flex flex-col gap-2">
                          {PICKUP_STATUS.map(({ key, label, color }) => (
                            <button
                              key={key}
                              onClick={() =>
                                handlePickupStatus(order.orderId, key)
                              }
                              className={`
        flex items-center gap-2
        bg-${color}-500 hover:bg-${color}-600 text-white
        px-4 py-2 rounded-lg transition-colors
      `}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Pickup Status Tabs ─────────────────────────────────── */}
          <div className="max-w-7xl mx-auto py-8">
            {/* Tabs */}
            <div className="flex justify-center space-x-8 border-b pb-2">
              {PICKUP_STATUS.map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setCurrentTab(key)}
                  className={`
          px-4 py-2 font-medium transition
          ${
            currentTab === key
              ? `border-b-2 border-${color}-500 text-${color}-600`
              : `text-gray-600 hover:text-${color}-600`
          }
        `}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="mt-6 space-y-6">
              {(currentTab === "order-pickuped-up"
                ? pickedUpOrders.filter((o) => o.pickupStatus === currentTab)
                : allocatedOrders.filter((o) => o.pickupStatus === currentTab)
              ).map((order) => {
                const {
                  key: _,
                  label,
                  color,
                } = PICKUP_STATUS.find((s) => s.key === order.pickupStatus);
                return (
                  <div
                    key={order.orderId}
                    className="p-6 bg-white rounded-lg shadow-md flex flex-col gap-4"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Order {order.orderId}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Date: {new Date(order.created).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Customer: {order.customer}
                        </p>
                        <p className="text-sm text-gray-600">
                          Amount:{" "}
                          <span className="font-medium text-green-600">
                            ${order.totalAmount}
                          </span>
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full bg-${color}-100 text-${color}-800`}
                      >
                        {label}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item, i) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-100 px-2 py-1 rounded"
                        >
                          {item.productName} x{item.quantity}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Call button */}
                    <button
                      onClick={() => handleCallCustomer(order.phoneNumber)}
                      className="self-start inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-600 font-medium px-4 py-2 rounded-lg transition"
                    >
                      <Phone className="w-5 h-5" />
                      Call Customer
                    </button>
                  </div>
                );
              })}

              {/* Empty state */}
              {(currentTab === "order-pickuped-up"
                ? pickedUpOrders
                : allocatedOrders
              ).filter((o) => o.pickupStatus === currentTab).length === 0 && (
                <p className="text-center text-gray-500">No orders here.</p>
              )}
            </div>
          </div>

          {/* Main Orders Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Package className="w-5 h-5" />
                All Pickup Orders - Ready for Allocation
              </h2>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">
                  Loading orders...
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No pickup orders available for allocation right now.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Order Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                        <User className="w-4 h-4 inline mr-1" />
                        Customer Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone Number
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                        <Package className="w-4 h-4 inline mr-1" />
                        Items
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order, index) => (
                      <tr
                        key={order.orderId}
                        className={`hover:bg-purple-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(order.created).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.created).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {order.orderId}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                              <User className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {order.customer}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900 font-mono">
                              {order.phoneNumber || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-semibold text-green-600">
                            ${order.totalAmount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 max-w-xs">
                            {order.items &&
                              order.items.slice(0, 2).map((item, index) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium text-gray-800">
                                    {item.productName}
                                  </span>
                                  <span className="text-gray-500 ml-2">
                                    ({item.quantity} {item.weight})
                                  </span>
                                </div>
                              ))}
                            {order.items && order.items.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{order.items.length - 2} more items
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending Allocation
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-1">
                          <button
                            onClick={() =>
                              handleCallCustomer(order.phoneNumber)
                            }
                            className="block text-blue-600 hover:text-blue-900 hover:underline transition-colors"
                          >
                            <Phone className="w-4 h-4 inline mr-1" />
                            Call Customer
                          </button>
                          <button
                            onClick={() => handleAllocate(order.orderId)}
                            className="block text-purple-600 hover:text-purple-900 hover:underline transition-colors font-semibold"
                            disabled={loading}
                          >
                            Allocate Order
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
