import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/sidebar";
import {
  ChevronDown,
  Clock,
  AlertCircle,
  MoreVertical,
  ArrowLeft,
  Package,
  CheckCircle,
  Truck,
  Bike,
  User,
  MapPin,
  DollarSign,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/config";

export default function ScooterDelivery() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const [activeTimeSlotOrder, setActiveTimeSlotOrder] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [orders, setOrders] = useState([]);
  const [allocatedOrders, setAllocatedOrders] = useState({
    "6am-9am": [],
    "9:30am-1pm": [],
    "11:30am-2pm": [],
  });
  const [drivers, setDrivers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [loading, setLoading] = useState(false);
  const [allocationMessage, setAllocationMessage] = useState("");

  // Time slot options mapping
  const timeSlotOptions = {
    "7:00 to 9:00 AM": "6am-9am",
    "9:30 to 11:00 AM": "9:30am-1pm",
    "11:30 to 2:00 PM": "11:30am-2pm",
  };

  // Fetch orders, drivers, and areas from the backend
  useEffect(() => {
    fetchOrders();
    fetchDrivers();
    fetchAreas();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API_BASE_URL}/api/orders`,
        {
          params: {
            status: "order-confirmed",
            deliveryType: "scooter", // Filter for scooter delivery orders
            limit: 100,
          },
        }
      );

      // Separate orders: those without timeSlot go to main list, those with timeSlot go to allocated sections
      const mainOrders = [];
      const allocated = {
        "6am-9am": [],
        "9:30am-1pm": [],
        "11:30am-2pm": [],
      };

      data.orders.forEach((order) => {
        if (order.timeSlot) {
          const slotKey = timeSlotOptions[order.timeSlot];
          if (slotKey && allocated[slotKey]) {
            allocated[slotKey].push(order);
          }
        } else {
          mainOrders.push(order);
        }
      });

      setOrders(mainOrders);
      setAllocatedOrders(allocated);
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
          params: { category: "Driver" },
        }
      );
      console.log("Driver API Response:", data);
      const driverList = data.employees || [];
      console.log("Driver List:", driverList);
      setDrivers(driverList);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setDrivers([]);
    }
  };

  const fetchAreas = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/areas`);
      console.log("Areas API Response:", data);
      const activeAreas = data.filter(area => area.isActive !== false);
      setAreas(activeAreas);
      if (activeAreas.length > 0) {
        setSelectedArea(activeAreas[0].displayName);
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
      setAreas([]);
    }
  };

  const handleViewOrderDetails = (orderId) => {
    navigate(`/order-details/${orderId}`);
  };

  const handleScooterDelivery = () => {
    navigate("/scooter-delivery");
  };

  const handleManagePickup = () => {
    navigate("/pickup-orders");
  };

  const handleManagedelivery = () => {
    navigate("/delivery-orders");
  };

  const handleToggleTimeSlotSelection = (orderId) => {
    if (activeTimeSlotOrder === orderId) {
      setActiveTimeSlotOrder(null);
      setSelectedTimeSlot("");
    } else {
      setActiveTimeSlotOrder(orderId);
      setSelectedTimeSlot("");
    }
  };

  const handleSelectTimeSlot = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleDoneTimeSlot = async () => {
    if (
      !selectedTimeSlot ||
      !selectedDriver
    ) {
      alert(
        "Please select all required fields (time slot and driver)"
      );
      return;
    }

    try {
      setLoading(true);

      // Allocate the order with time slot and driver
      await axios.put(
        `${API_BASE_URL}/api/orders/${activeTimeSlotOrder}/allocate`,
        {
          timeSlot: selectedTimeSlot,
          driver: selectedDriver,
        }
      );

      const orderToMove = orders.find(
        (order) => order.orderId === activeTimeSlotOrder
      );
      if (orderToMove) {
        const slotKey = timeSlotOptions[selectedTimeSlot];
        setAllocatedOrders((prev) => ({
          ...prev,
          [slotKey]: [
            ...prev[slotKey],
            {
              ...orderToMove,
              timeSlot: selectedTimeSlot,
              driver: selectedDriver,
            },
          ],
        }));
        setOrders((prev) =>
          prev.filter((order) => order.orderId !== activeTimeSlotOrder)
        );
      }

      setActiveTimeSlotOrder(null);
      setSelectedTimeSlot("");
    } catch (error) {
      console.error("Error allocating order:", error);
      alert("Error allocating order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleItemCheckboxChange = async (orderId, itemIndex, checked) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/orders/${orderId}/item-status`,
        {
          itemIndex: itemIndex,
          onTruck: checked,
        }
      );

      // Update local state
      setAllocatedOrders((prev) => {
        const newState = { ...prev };
        Object.keys(newState).forEach((slot) => {
          newState[slot] = newState[slot].map((order) => {
            if (order.orderId === orderId) {
              const updatedOrder = { ...order };
              updatedOrder.items[itemIndex].onTruck = checked;

              // Check if all items are now on scooter
              const allOnScooter = updatedOrder.items.every(
                (item) => item.onTruck
              );
              if (allOnScooter) {
                updatedOrder.truckOnDeliver = true;
                updatedOrder.status = "allocated-driver";
              }

              return updatedOrder;
            }
            return order;
          });
        });
        return newState;
      });

      // If all items are on scooter, show message and remove the order
      if (response.data.allItemsOnTruck) {
        setAllocationMessage("Order has been allocated to the driver");

        setTimeout(() => {
          setAllocationMessage("");
          setAllocatedOrders((prev) => {
            const newState = { ...prev };
            Object.keys(newState).forEach((slot) => {
              newState[slot] = newState[slot].filter(
                (order) => order.orderId !== orderId
              );
            });
            return newState;
          });
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating item status:", error);
    }
  };

  const getDriverName = (driverId) => {
    const driver = drivers.find((d) => d.id === driverId || d._id === driverId);
    return driver ? driver.name : driverId;
  };

  // Modal overlay for time slot selection
  const TimeSlotModal = () => {
    if (!activeTimeSlotOrder) return null;

    const order = orders.find((o) => o.orderId === activeTimeSlotOrder) || {};

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96 max-w-full shadow-xl">
          <div className="mb-4 font-medium text-red-600 bg-red-50 p-3 rounded-lg">
            Requested time of delivery: morning 6-9 am
          </div>
          <div className="mb-4 font-medium text-gray-800">
            Which time slots do you want to allocate this order?
          </div>
          <div className="space-y-3">
            <label className="flex items-center border border-gray-300 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="timeSlot"
                className="h-4 w-4 text-orange-500"
                onChange={() => handleSelectTimeSlot("7:00 to 9:00 AM")}
                checked={selectedTimeSlot === "7:00 to 9:00 AM"}
              />
              <span className="ml-3 text-gray-700">
                7:00 to 9:00 AM in the morning
              </span>
            </label>
            <label className="flex items-center border border-gray-300 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="timeSlot"
                className="h-4 w-4 text-blue-500"
                onChange={() => handleSelectTimeSlot("9:30 to 11:00 AM")}
                checked={selectedTimeSlot === "9:30 to 11:00 AM"}
              />
              <span className="ml-3 text-gray-700">
                9:30 to 11:00 AM in the morning
              </span>
            </label>
            <label className="flex items-center border border-gray-300 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="timeSlot"
                className="h-4 w-4 text-green-500"
                onChange={() => handleSelectTimeSlot("11:30 to 2:00 PM")}
                checked={selectedTimeSlot === "11:30 to 2:00 PM"}
              />
              <span className="ml-3 text-gray-700">
                11:30 to 2:00 PM (Later)
              </span>
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg transition-colors"
              onClick={() => {
                setActiveTimeSlotOrder(null);
                setSelectedTimeSlot("");
              }}
            >
              Cancel
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg disabled:bg-gray-300 transition-colors"
              onClick={handleDoneTimeSlot}
              disabled={!selectedTimeSlot || loading}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Success Message */}
      {allocationMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {allocationMessage}
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
            <Bike className="w-8 h-8" />
            <div className="text-xl font-semibold">
              4C. Scooter Delivery Management
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-xl mb-6 shadow-lg">
            <div className="flex justify-center gap-4">
              <button
                className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors font-medium"
                onClick={handleManagedelivery}
              >
                <Truck className="w-5 h-5" />
                4A Manage Delivery Orders
              </button>
              <button
                className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors font-medium"
                onClick={handleManagePickup}
              >
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg flex items-start gap-3">
              <Clock className="w-5 h-5 text-orange-500 mt-0.5" />
              <p className="text-orange-800">
                Pick a driver from dropdown, then select date and then pick the
                order from same area.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-red-800">
                Maximum allocation of orders per time slot is 10.
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-6 flex items-center gap-4">
              <Bike className="w-12 h-12 text-green-600" />
              Scooter Delivery Orders
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Pick an area {areas.length > 0 && `(${areas.length} available)`}
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
              >
                <option value="">
                  {areas.length === 0 ? "No areas available" : "Select Area"}
                </option>
                {areas.map((area) => (
                  <option
                    key={area._id}
                    value={area.displayName}
                  >
                    {area.state} - {area.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Pick driver {drivers.length > 0 && `(${drivers.length} available)`}
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
              >
                <option value="">
                  {drivers.length === 0 ? "No drivers available" : "Select Driver"}
                </option>
                {drivers.map((driver) => (
                  <option
                    key={driver.id || driver._id}
                    value={driver.id || driver._id}
                  >
                    {driver.name || driver.employeeName || `Driver ${driver._id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time slot sections */}
          {["6am-9am", "9:30am-1pm", "11:30am-2pm"].map((timeSlot) => (
            <div key={timeSlot} className="mb-8">
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 rounded-t-lg border-b-2 border-green-500">
                <h3 className="font-semibold text-lg text-gray-800">
                  {timeSlot}
                </h3>
                <p className="text-sm text-gray-600">
                  orders after allocation appears here
                </p>
              </div>

              {allocatedOrders[timeSlot].length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-b-lg p-8">
                  <p className="text-gray-500 text-center italic">
                    No orders allocated to this time slot
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-b-lg">
                  {allocatedOrders[timeSlot].map((order) => (
                    <div
                      key={order.orderId}
                      className="border-b last:border-b-0 p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="font-semibold text-lg text-gray-800">
                            Order {order.orderId}
                          </span>
                          <p className="text-sm text-green-600 font-medium">
                            Fully allocated
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Customer: {order.customer}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                          <input
                            type="checkbox"
                            checked={order.truckOnDeliver || false}
                            readOnly
                            className="rounded"
                          />
                          <span className="text-sm font-medium text-green-700">
                            scooter on deliver
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {order.items &&
                          order.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border"
                            >
                              <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-green-500" />
                                <div>
                                  <span className="font-medium text-gray-800">
                                    {item.productName}
                                  </span>
                                  <span className="text-sm text-gray-500 ml-2">
                                    Qty: {item.quantity}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={item.onTruck || false}
                                  onChange={(e) =>
                                    handleItemCheckboxChange(
                                      order.orderId,
                                      index,
                                      e.target.checked
                                    )
                                  }
                                  className="rounded w-4 h-4"
                                />
                                <span className="text-sm font-medium text-green-700">
                                  products on scooter
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>

                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                          Driver: {getDriverName(order.driver)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Orders table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Showing all scooter orders of {selectedArea.toLowerCase()}
              </h2>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">
                  Loading orders...
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center">
                <Bike className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No unallocated scooter orders available right now.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Delivery Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                        Transaction ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                        <User className="w-4 h-4 inline mr-1" />
                        Customer Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Delivery Address
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                        <Package className="w-4 h-4 inline mr-1" />
                        Items in Order
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                        Allocation Status
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
                        className={`hover:bg-green-50 transition-colors ${
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
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <User className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {order.customer}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {order.deliveryAddress?.fullAddress ||
                              order.deliveryLocation ||
                              "N/A"}
                          </div>
                          {order.deliveryAddress?.area && (
                            <div className="text-xs text-gray-500">
                              {order.deliveryAddress.area}
                            </div>
                          )}
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
                              handleViewOrderDetails(order.orderId)
                            }
                            className="block text-indigo-600 hover:text-indigo-900 hover:underline transition-colors"
                          >
                            View order details
                          </button>
                          <button
                            onClick={() =>
                              handleToggleTimeSlotSelection(order.orderId)
                            }
                            className="block text-green-600 hover:text-green-900 hover:underline transition-colors font-semibold"
                          >
                            Allocate order
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

      {/* Time slot selection modal */}
      <TimeSlotModal />
    </div>
  );
}
