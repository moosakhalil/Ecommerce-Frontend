import React, { useState, useEffect } from "react";
import {
  Truck,
  Bike,
  Clock,
  Plus,
  Edit,
  Trash2,
  X,
  AlertCircle,
  Save,
  Home,
  Sun,
  Moon,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";

const DeliveryManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState("vehicles");
  const [activeCategory, setActiveCategory] = useState("day");
  const [vehicles, setVehicles] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch data from API
  const fetchData = async (endpoint) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/${endpoint}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Save item to API
  const saveItem = async (endpoint, item) => {
    setLoading(true);
    try {
      const method = item._id && item._id !== "new" ? "PUT" : "POST";
      const url =
        item._id && item._id !== "new"
          ? `http://localhost:5000/api/${endpoint}/${item._id}`
          : `http://localhost:5000/api/${endpoint}`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      if (response.ok) {
        const savedItem = await response.json();

        if (endpoint === "vehicle-types") {
          if (item._id && item._id !== "new") {
            setVehicles((prev) =>
              prev.map((v) => (v._id === item._id ? savedItem : v))
            );
          } else {
            setVehicles((prev) => [...prev, savedItem]);
          }
        } else if (endpoint === "delivery-periods") {
          if (item._id && item._id !== "new") {
            setPeriods((prev) =>
              prev.map((p) => (p._id === item._id ? savedItem : p))
            );
          } else {
            setPeriods((prev) => [...prev, savedItem]);
          }
        }

        setShowModal(false);
        setEditingItem(null);
      }
    } catch (error) {
      console.error(`Error saving ${endpoint}:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Delete item from API
  const deleteItem = async (endpoint, id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/${endpoint}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        if (endpoint === "vehicle-types") {
          setVehicles((prev) => prev.filter((item) => item._id !== id));
        } else if (endpoint === "delivery-periods") {
          setPeriods((prev) => prev.filter((item) => item._id !== id));
        }
      }
    } catch (error) {
      console.error(`Error deleting ${endpoint}:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on tab change and category change
  useEffect(() => {
    if (activeTab === "vehicles") {
      fetchData("vehicle-types").then(setVehicles);
    } else if (activeTab === "periods") {
      fetchData(`delivery-periods?category=${activeCategory}`).then(setPeriods);
    }
  }, [activeTab, activeCategory]);

  // Load vehicles for periods tab
  useEffect(() => {
    fetchData("vehicle-types").then(setVehicles);
  }, []);

  // Vehicle Form Component
  const VehicleForm = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState(
      item || {
        name: "",
        displayName: "",
        category: "truck",
        specifications: { maxVolume: 0, maxWeight: 0, maxPackages: 0 },
        isActive: true,
        description: "",
      }
    );

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., scooter"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., Scooter"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="scooter">Scooter</option>
            <option value="truck">Truck</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Volume (cm³)
            </label>
            <input
              type="number"
              value={formData.specifications?.maxVolume || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  specifications: {
                    ...formData.specifications,
                    maxVolume: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.specifications?.maxWeight || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  specifications: {
                    ...formData.specifications,
                    maxWeight: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
              min="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Packages
            </label>
            <input
              type="number"
              value={formData.specifications?.maxPackages || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  specifications: {
                    ...formData.specifications,
                    maxPackages: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
              min="1"
            />
          </div>

          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            Items List to be excluded
          </button>
          <p>( not developed yet)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="3"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="rounded"
          />
          <label className="text-sm text-gray-700">Active</label>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    );
  };

  // Delivery Period Form Component
  const DeliveryPeriodForm = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState(
      item || {
        category: activeCategory,
        name: "",
        timeFrame: {
          hours: null,
          fromDays: null,
          toDays: null,
          startTime: "09:00",
          endTime: "21:00",
        },
        vehicleType: "",
        truckPricing: {
          price: 0,
          isFree: false,
        },
        scooterPricing: {
          price: 0,
          isFree: false,
        },
        invoicePercentage: 5,
        deliveryDiscount: 30,
        isActive: true,
      }
    );

    const [deliveryType, setDeliveryType] = useState(
      item?.timeFrame?.hours ? "hours" : "days"
    );

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="day">Day Delivery</option>
            <option value="night">Night Delivery</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., Emergency, Express, Normal Delivery"
          />
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">
            Delivery Time Frame
          </h4>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="hours"
                  checked={deliveryType === "hours"}
                  onChange={(e) => setDeliveryType(e.target.value)}
                  className="mr-2"
                />
                Hours-based (Emergency/Express)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="days"
                  checked={deliveryType === "days"}
                  onChange={(e) => setDeliveryType(e.target.value)}
                  className="mr-2"
                />
                Days-based (Normal)
              </label>
            </div>
          </div>

          {deliveryType === "hours" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery within Hours
              </label>
              <input
                type="number"
                value={formData.timeFrame?.hours || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timeFrame: {
                      ...formData.timeFrame,
                      hours: parseInt(e.target.value) || null,
                      fromDays: null,
                      toDays: null,
                    },
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., 1, 2, 3, 4, 24"
                min="1"
              />
              <span className="text-xs text-gray-500 mt-1 block">
                Hours for delivery (e.g., 1 for within 1 hour)
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Days Range
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={formData.timeFrame?.fromDays || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          timeFrame: {
                            ...formData.timeFrame,
                            fromDays: parseInt(e.target.value) || null,
                            hours: null,
                          },
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="From Days"
                      min="1"
                    />
                    <span className="text-xs text-gray-500 mt-1 block">
                      From (days)
                    </span>
                  </div>
                  <span className="text-gray-500 font-medium">to</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={formData.timeFrame?.toDays || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          timeFrame: {
                            ...formData.timeFrame,
                            toDays: parseInt(e.target.value) || null,
                            hours: null,
                          },
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="To Days"
                      min="1"
                    />
                    <span className="text-xs text-gray-500 mt-1 block">
                      To (days)
                    </span>
                  </div>
                  <span className="text-gray-600 font-medium">days</span>
                </div>
              </div>
            </div>
          )}

          {/* Time Period */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Time Period
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="time"
                  value={formData.timeFrame?.startTime || "09:00"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timeFrame: {
                        ...formData.timeFrame,
                        startTime: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <span className="text-xs text-gray-500 mt-1 block">
                  Start Time
                </span>
              </div>
              <span className="text-gray-500 font-medium">to</span>
              <div className="flex-1">
                <input
                  type="time"
                  value={formData.timeFrame?.endTime || "21:00"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timeFrame: {
                        ...formData.timeFrame,
                        endTime: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <span className="text-xs text-gray-500 mt-1 block">
                  End Time
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Pricing (Truck)</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.truckPricing?.isFree || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    truckPricing: {
                      ...formData.truckPricing,
                      isFree: e.target.checked,
                      price: e.target.checked
                        ? 0
                        : formData.truckPricing?.price || 0,
                    },
                  })
                }
                className="rounded"
              />
              <label className="text-sm text-gray-700">Free Delivery</label>
            </div>

            {!formData.truckPricing?.isFree && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (IDR)
                </label>
                <input
                  type="number"
                  value={formData.truckPricing?.price || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      truckPricing: {
                        ...formData.truckPricing,
                        price: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="0"
                />
              </div>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Pricing (Scooter)</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.scooterPricing?.isFree || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scooterPricing: {
                      ...formData.scooterPricing,
                      isFree: e.target.checked,
                      price: e.target.checked
                        ? 0
                        : formData.scooterPricing?.price || 0,
                    },
                  })
                }
                className="rounded"
              />
              <label className="text-sm text-gray-700">Free Delivery</label>
            </div>

            {!formData.scooterPricing?.isFree && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (IDR)
                </label>
                <input
                  type="number"
                  value={formData.scooterPricing?.price || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scooterPricing: {
                        ...formData.scooterPricing,
                        price: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="0"
                />
              </div>
            )}
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-orange-50">
          <h4 className="font-medium text-gray-900 mb-3">
            Future Features (Not Developed)
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Percentage (%)
              </label>
              <input
                type="number"
                value={formData.invoicePercentage || 5}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    invoicePercentage: parseInt(e.target.value) || 5,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
                min="0"
                max="100"
                disabled
              />
              <span className="text-xs text-orange-600">Default: 5%</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Discount (%)
              </label>
              <input
                type="number"
                value={formData.deliveryDiscount || 30}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deliveryDiscount: parseInt(e.target.value) || 30,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
                min="0"
                max="100"
                disabled
              />
              <span className="text-xs text-orange-600">Default: 30%</span>
            </div>
          </div>
          <p className="text-xs text-orange-600 mt-2">
            These features will be implemented in future updates
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="rounded"
          />
          <label className="text-sm text-gray-700">Active</label>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    );
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to format time from 24hr to 12hr format
  const formatTime = (time24) => {
    if (!time24) return "N/A";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes}${ampm}`;
  };

  // Tab Content Renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case "vehicles":
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Vehicle Types
              </h2>
              <button
                onClick={() => {
                  setEditingItem({ _id: "new" });
                  setShowModal(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle Type</span>
              </button>
            </div>

            <div className="grid gap-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {vehicle.category === "truck" ? (
                          <Truck className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Bike className="w-5 h-5 text-green-600" />
                        )}
                        <h3 className="font-medium text-gray-900">
                          {vehicle.displayName}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            vehicle.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {vehicle.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {vehicle.category}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <strong>Max Volume:</strong>{" "}
                          {vehicle.specifications?.maxVolume?.toLocaleString()}{" "}
                          cm³
                        </p>
                        <p>
                          <strong>Max Weight:</strong>{" "}
                          {vehicle.specifications?.maxWeight} kg
                        </p>
                        <p>
                          <strong>Max Packages:</strong>{" "}
                          {vehicle.specifications?.maxPackages}
                        </p>
                        {vehicle.description && (
                          <p>
                            <strong>Description:</strong> {vehicle.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(vehicle);
                          setShowModal(true);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteItem("vehicle-types", vehicle._id)}
                        className="p-2 text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {vehicles.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No vehicle types found. Add your first vehicle type to get
                  started!
                </p>
              </div>
            )}
          </div>
        );

      case "periods":
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeCategory === "day" ? "Day" : "Night"} Delivery Services
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage {activeCategory} delivery periods and pricing
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingItem({ _id: "new" });
                  setShowModal(true);
                }}
                className={`flex items-center space-x-2 px-4 py-2 text-white rounded-md transition-colors ${
                  activeCategory === "day"
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-gray-700 hover:bg-gray-800"
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>
                  Add {activeCategory === "day" ? "Day" : "Night"} Service
                </span>
              </button>
            </div>

            {/* Services Grid by Subcategories */}
            <div className="space-y-6">
              {/* Express/Fast Delivery Section */}
              <div
                className={`border rounded-lg p-4 ${
                  activeCategory === "day"
                    ? "border-red-200 bg-red-50"
                    : "border-red-300 bg-red-100"
                }`}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-red-800">
                    Express/Emergency Delivery
                  </h3>
                  <span className="text-xs text-red-600 bg-red-200 px-2 py-1 rounded">
                    Fast Services
                  </span>
                </div>

                <div className="grid gap-3">
                  {periods
                    .filter(
                      (period) =>
                        period.timeFrame?.hours &&
                        period.timeFrame.hours <= 24 &&
                        (period.name.toLowerCase().includes("emergency") ||
                          period.name.toLowerCase().includes("express") ||
                          period.name.toLowerCase().includes("fast"))
                    )
                    .map((period) => {
                      const vehicleInfo = vehicles.find(
                        (v) => v._id === period.vehicleType
                      );
                      return (
                        <div
                          key={period._id}
                          className="bg-white border border-red-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <Clock className="w-4 h-4 text-red-600" />
                                <h4 className="font-medium text-gray-900">
                                  {period.name}
                                </h4>
                                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                  {vehicleInfo?.displayName || "N/A"}
                                </span>
                                {(period.truckPricing?.isFree ||
                                  period.scooterPricing?.isFree) && (
                                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                    {period.truckPricing?.isFree &&
                                    period.scooterPricing?.isFree
                                      ? "Free"
                                      : "Partial Free"}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>
                                  <strong>Time:</strong> Within{" "}
                                  {period.timeFrame?.hours} hour
                                  {period.timeFrame?.hours > 1 ? "s" : ""}
                                </p>
                                <p>
                                  <strong>Truck Price:</strong>{" "}
                                  {period.truckPricing?.isFree
                                    ? "Free"
                                    : formatRupiah(
                                        period.truckPricing?.price || 0
                                      )}
                                </p>
                                <p>
                                  <strong>Scooter Price:</strong>{" "}
                                  {period.scooterPricing?.isFree
                                    ? "Free"
                                    : formatRupiah(
                                        period.scooterPricing?.price || 0
                                      )}
                                </p>
                                <p className="text-xs text-orange-600">
                                  Invoice: {period.invoicePercentage}% |
                                  Discount: {period.deliveryDiscount}% (Not
                                  developed)
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingItem(period);
                                  setShowModal(true);
                                }}
                                className="p-2 text-gray-600 hover:text-blue-600"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  deleteItem("delivery-periods", period._id)
                                }
                                className="p-2 text-gray-600 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Normal Delivery Section */}
              <div
                className={`border rounded-lg p-4 ${
                  activeCategory === "day"
                    ? "border-green-200 bg-green-50"
                    : "border-green-300 bg-green-100"
                }`}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-green-800">
                    Normal Delivery
                  </h3>
                  <span className="text-xs text-green-600 bg-green-200 px-2 py-1 rounded">
                    Standard Services
                  </span>
                </div>

                <div className="grid gap-3">
                  {periods
                    .filter(
                      (period) =>
                        (period.timeFrame?.fromDays &&
                          period.timeFrame?.toDays) ||
                        period.name.toLowerCase().includes("normal")
                    )
                    .map((period) => {
                      const vehicleInfo = vehicles.find(
                        (v) => v._id === period.vehicleType
                      );
                      return (
                        <div
                          key={period._id}
                          className="bg-white border border-green-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <Clock className="w-4 h-4 text-green-600" />
                                <h4 className="font-medium text-gray-900">
                                  {period.name}
                                </h4>
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                  {vehicleInfo?.displayName || "N/A"}
                                </span>
                                {(period.truckPricing?.isFree ||
                                  period.scooterPricing?.isFree) && (
                                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                    {period.truckPricing?.isFree &&
                                    period.scooterPricing?.isFree
                                      ? "Free"
                                      : "Partial Free"}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                {period.timeFrame?.hours ? (
                                  <p>
                                    <strong>Time:</strong> Within{" "}
                                    {period.timeFrame.hours} hour
                                    {period.timeFrame.hours > 1 ? "s" : ""}
                                  </p>
                                ) : (
                                  <p>
                                    <strong>Days:</strong>{" "}
                                    {period.timeFrame?.fromDays} to{" "}
                                    {period.timeFrame?.toDays} days
                                  </p>
                                )}
                                <p>
                                  <strong>Truck Price:</strong>{" "}
                                  {period.truckPricing?.isFree
                                    ? "Free"
                                    : formatRupiah(
                                        period.truckPricing?.price || 0
                                      )}
                                </p>
                                <p>
                                  <strong>Scooter Price:</strong>{" "}
                                  {period.scooterPricing?.isFree
                                    ? "Free"
                                    : formatRupiah(
                                        period.scooterPricing?.price || 0
                                      )}
                                </p>
                                <p className="text-xs text-orange-600">
                                  Invoice: {period.invoicePercentage}% |
                                  Discount: {period.deliveryDiscount}% (Not
                                  developed)
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingItem(period);
                                  setShowModal(true);
                                }}
                                className="p-2 text-gray-600 hover:text-blue-600"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  deleteItem("delivery-periods", period._id)
                                }
                                className="p-2 text-gray-600 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {periods.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No delivery services found for {activeCategory} delivery. Add
                  your first service to get started!
                </p>
              </div>
            )}
          </div>
        );

      default:
        return <div>Select a tab to manage delivery settings.</div>;
    }
  };

  const getFormComponent = () => {
    switch (activeTab) {
      case "vehicles":
        return VehicleForm;
      case "periods":
        return DeliveryPeriodForm;
      default:
        return () => <div>No form available</div>;
    }
  };

  const FormComponent = getFormComponent();

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-80" : ""
        } w-full bg-gray-50 p-4`}
      >
        <div className="bg-purple-900 text-white p-4 flex items-center">
          <Home className="mr-2" size={20} />
          <h1 className="text-xl font-semibold">Delivery Management</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Delivery Management System
            </h2>
          </div>
          <p className="mb-6 text-gray-600">
            Configure vehicle types and delivery periods for your delivery
            system.
          </p>

          <div className="mb-8 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "vehicles", label: "Vehicle Types", icon: Truck },
                { id: "periods", label: "Delivery Services", icon: Clock },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Category Header for Delivery Services */}
          {activeTab === "periods" && (
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Day Delivery Category */}
                <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Sun className="w-6 h-6 text-orange-600" />
                      <h3 className="text-lg font-semibold text-orange-800">
                        Day Delivery
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveCategory("day")}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        activeCategory === "day"
                          ? "bg-orange-600 text-white"
                          : "bg-orange-200 text-orange-700 hover:bg-orange-300"
                      }`}
                    >
                      {activeCategory === "day" ? "Selected" : "Select"}
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-orange-700">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-red-200 text-red-800 px-2 py-1 rounded text-center font-medium">
                        Express/Emergency Delivery
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-red-300 text-red-900 px-2 py-1 rounded text-center text-xs">
                        Normal Delivery
                      </div>
                    </div>
                  </div>
                </div>

                {/* Night Delivery Category */}
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Moon className="w-6 h-6 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-800">
                        Night Delivery
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveCategory("night")}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        activeCategory === "night"
                          ? "bg-gray-700 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {activeCategory === "night" ? "Selected" : "Select"}
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-red-200 text-red-800 px-2 py-1 rounded text-center font-medium">
                        Express/Emergency Delivery
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-red-300 text-red-900 px-2 py-1 rounded text-center text-xs">
                        Normal Delivery
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!loading && renderTabContent()}

          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">
                  System Rules & Guidelines
                </h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>
                    <strong>Vehicle Types:</strong> Define specifications for
                    each vehicle including max volume, weight, and package
                    limits.
                  </p>
                  <p>
                    <strong>Delivery Services:</strong> Create day/night
                    delivery services with express or normal timing options.
                  </p>
                  <p>
                    <strong>Categories:</strong> Day delivery (orange theme) and
                    Night delivery (gray theme) with subcategories for express
                    and normal services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingItem?._id === "new" ? "Add New" : "Edit"}{" "}
                  {activeTab === "vehicles"
                    ? "Vehicle Type"
                    : "Delivery Service"}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <FormComponent
                item={editingItem?._id === "new" ? null : editingItem}
                onSave={(item) =>
                  saveItem(
                    activeTab === "vehicles"
                      ? "vehicle-types"
                      : "delivery-periods",
                    item
                  )
                }
                onCancel={() => {
                  setShowModal(false);
                  setEditingItem(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryManagementDashboard;
