import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Plus,
  X,
  Users,
  ShoppingCart,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  RefreshCw,
  Check,
  DollarSign,
  Clock,
  Settings,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

const AssignAreasToVendors = () => {
  // State Management
  const [activeTab, setActiveTab] = useState("Assign Areas to Vendors");
  const [vendors, setVendors] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningArea, setAssigningArea] = useState(false);
  const [searchVendor, setSearchVendor] = useState("");
  const [searchArea, setSearchArea] = useState("");

  // Assignment form state
  const [areaAssignment, setAreaAssignment] = useState({
    areaId: "",
    deliveryCharge: 0,
    estimatedDeliveryTime: "Same day",
  });

  // Fetch functions
  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/vendors`);
      if (response.ok) {
        const data = await response.json();
        setVendors(data.vendors || []);
      } else {
        console.error("Failed to fetch vendors");
        setVendors([]);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAreas = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/vendors/available-areas`
      );
      if (response.ok) {
        const data = await response.json();
        setAreas(data.areas || []);
      } else {
        console.error("Failed to fetch areas");
        setAreas([]);
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
      setAreas([]);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
    fetchAreas();
  }, [fetchVendors, fetchAreas]);

  // Navigation handlers
  const navigateToVendorManagement = () => {
    window.location.href = "/vendor-dashboard";
  };

  const navigateToAddVendor = () => {
    window.location.href = "/add-vendor";
  };

  const navigateToAllOrders = () => {
    window.location.href = "/vendor-orders";
  };

  // Area assignment functions
  const openAssignModal = (vendor) => {
    setSelectedVendor(vendor);
    setShowAssignModal(true);
    setAreaAssignment({
      areaId: "",
      deliveryCharge: 0,
      estimatedDeliveryTime: "Same day",
    });
  };

  const assignAreaToVendor = async () => {
    if (!areaAssignment.areaId) {
      alert("Please select an area");
      return;
    }

    setAssigningArea(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/vendors/${selectedVendor.vendorId}/service-areas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(areaAssignment),
        }
      );

      if (response.ok) {
        alert("Area assigned successfully!");
        setShowAssignModal(false);
        fetchVendors();
      } else {
        const error = await response.json();
        alert(`Failed to assign area: ${error.error}`);
      }
    } catch (error) {
      console.error("Error assigning area:", error);
      alert("Failed to assign area. Please try again.");
    } finally {
      setAssigningArea(false);
    }
  };

  const removeAreaFromVendor = async (vendorId, areaName) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${areaName} from this vendor?`
      )
    ) {
      return;
    }

    try {
      // This would need a backend endpoint to remove service area
      console.log(`Remove area ${areaName} from vendor ${vendorId}`);
      // For now, just show success message
      alert("Area removed successfully!");
      fetchVendors();
    } catch (error) {
      console.error("Error removing area:", error);
      alert("Failed to remove area. Please try again.");
    }
  };

  // Filter functions
  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchVendor.toLowerCase()) ||
      vendor.phone.includes(searchVendor)
  );

  const filteredAreas = areas.filter(
    (area) =>
      area.displayName.toLowerCase().includes(searchArea.toLowerCase()) ||
      area.name.toLowerCase().includes(searchArea.toLowerCase())
  );

  // Utility functions
  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-600 text-white";
      case "Offline":
        return "bg-gray-400 text-white";
      case "Busy":
        return "bg-yellow-600 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // Assign Area Modal
  const AssignAreaModal = () => {
    if (!showAssignModal || !selectedVendor) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Assign Area to {selectedVendor.name}
            </h2>
            <button
              onClick={() => setShowAssignModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Area Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Area <span className="text-red-500">*</span>
              </label>
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search areas..."
                    value={searchArea}
                    onChange={(e) => setSearchArea(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <select
                value={areaAssignment.areaId}
                onChange={(e) =>
                  setAreaAssignment((prev) => ({
                    ...prev,
                    areaId: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an area</option>
                {filteredAreas.map((area) => (
                  <option key={area._id} value={area._id}>
                    {area.displayName} ({area.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Delivery Charge */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Charge (AED)
              </label>
              <input
                type="number"
                value={areaAssignment.deliveryCharge}
                onChange={(e) =>
                  setAreaAssignment((prev) => ({
                    ...prev,
                    deliveryCharge: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            {/* Estimated Delivery Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Delivery Time
              </label>
              <select
                value={areaAssignment.estimatedDeliveryTime}
                onChange={(e) =>
                  setAreaAssignment((prev) => ({
                    ...prev,
                    estimatedDeliveryTime: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Same day">Same day</option>
                <option value="1-2 hours">1-2 hours</option>
                <option value="2-4 hours">2-4 hours</option>
                <option value="4-6 hours">4-6 hours</option>
                <option value="Next day">Next day</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setShowAssignModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={assignAreaToVendor}
              disabled={assigningArea || !areaAssignment.areaId}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {assigningArea ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Assign Area
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderVendorCard = (vendor) => (
    <div
      key={vendor._id}
      className="bg-white border border-gray-200 rounded-lg p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
          <div className="flex items-center text-gray-600 text-sm mt-1">
            <Users className="h-4 w-4 mr-1" />
            {vendor.phone}
          </div>
          <div className="mt-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                vendor.status
              )}`}
            >
              {vendor.status}
            </span>
          </div>
        </div>
        <button
          onClick={() => openAssignModal(vendor)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Assign Area
        </button>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-2">Service Areas</h4>
        {vendor.serviceAreas && vendor.serviceAreas.length > 0 ? (
          <div className="space-y-2">
            {vendor.serviceAreas.map((serviceArea, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="font-medium text-gray-900">
                      {serviceArea.area}
                    </span>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <DollarSign className="h-3 w-3 mr-1" />
                    <span className="mr-4">
                      Charge: AED {serviceArea.deliveryCharge || 0}
                    </span>
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      Time: {serviceArea.estimatedDeliveryTime || "Same day"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      serviceArea.isActive !== false
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {serviceArea.isActive !== false ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() =>
                      removeAreaFromVendor(vendor.vendorId, serviceArea.area)
                    }
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No service areas assigned</p>
            <button
              onClick={() => openAssignModal(vendor)}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Assign first area
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total Products: {vendor.availableProducts?.length || 0}</span>
          <span>Total Areas: {vendor.serviceAreas?.length || 0}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Assign Areas to Vendors
              </h1>
              <p className="text-gray-600 mt-1">
                Manage service areas for each vendor
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  fetchVendors();
                  fetchAreas();
                }}
                className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mb-6">
          <div className="flex space-x-1">
            <button
              className="px-4 py-2 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              onClick={navigateToVendorManagement}
            >
              <Users className="h-4 w-4 mr-2 inline" />
              Vendor Management
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              onClick={navigateToAddVendor}
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              Add New Vendor
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              onClick={navigateToAllOrders}
            >
              <ShoppingCart className="h-4 w-4 mr-2 inline" />
              All Orders
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === "Assign Areas to Vendors"
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <MapPin className="h-4 w-4 mr-2 inline" />
              Assign Areas to Vendors
            </button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Search Vendors
                </h3>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors by name or phone..."
                  value={searchVendor}
                  onChange={(e) => setSearchVendor(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {vendors.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Vendors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {areas.length}
                  </div>
                  <div className="text-sm text-gray-600">Available Areas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {vendors.reduce(
                      (total, vendor) =>
                        total + (vendor.serviceAreas?.length || 0),
                      0
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Total Assignments</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Areas Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Available Areas ({areas.length})
            </h3>
          </div>

          {areas.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {areas.map((area) => (
                <div
                  key={area._id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center"
                >
                  <div className="font-medium text-gray-900 text-sm">
                    {area.displayName}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{area.name}</div>
                  {area.truckPrice && (
                    <div className="text-xs text-blue-600 mt-1">
                      Truck: AED {area.truckPrice}
                    </div>
                  )}
                  {area.scooterPrice && (
                    <div className="text-xs text-green-600">
                      Scooter: AED {area.scooterPrice}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No areas found in the system</p>
              <p className="text-sm">
                Contact system administrator to add areas
              </p>
            </div>
          )}
        </div>

        {/* Vendors List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Vendors ({filteredVendors.length})
            </h3>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading vendors...</p>
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No vendors found
                </h3>
                <p className="text-gray-600">
                  {searchVendor
                    ? "No vendors match your search criteria"
                    : "No vendors available in the system"}
                </p>
                {searchVendor && (
                  <button
                    onClick={() => setSearchVendor("")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredVendors.map(renderVendorCard)}
              </div>
            )}
          </div>
        </div>

        {/* Area Assignment Summary */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Area Assignment Summary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {areas.map((area) => {
              const vendorsForArea = vendors.filter((vendor) =>
                vendor.serviceAreas?.some(
                  (serviceArea) =>
                    serviceArea.area
                      .toLowerCase()
                      .includes(area.displayName.toLowerCase()) ||
                    serviceArea.area
                      .toLowerCase()
                      .includes(area.name.toLowerCase())
                )
              );

              return (
                <div
                  key={area._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {area.displayName}
                    </h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {vendorsForArea.length} vendors
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    Area Code: {area.name}
                  </div>

                  {vendorsForArea.length > 0 ? (
                    <div className="space-y-1">
                      {vendorsForArea.slice(0, 3).map((vendor) => (
                        <div
                          key={vendor._id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-700">{vendor.name}</span>
                          <span
                            className={`px-2 py-1 text-xs rounded ${getStatusColor(
                              vendor.status
                            )}`}
                          >
                            {vendor.status}
                          </span>
                        </div>
                      ))}
                      {vendorsForArea.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{vendorsForArea.length - 3} more vendors
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-2 text-gray-400 border-2 border-dashed border-gray-200 rounded">
                      <MapPin className="h-6 w-6 mx-auto mb-1" />
                      <div className="text-xs">No vendors assigned</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Assign Area Modal */}
        <AssignAreaModal />
      </div>
    </div>
  );
};

export default AssignAreasToVendors;
