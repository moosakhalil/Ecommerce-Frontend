import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../Sidebar/sidebar";
import { Truck, Users, Plus, X, Check } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const TruckDrivers = () => {
  const [selectedVehicleType, setSelectedVehicleType] = useState("scooter");
  const [vehicles, setVehicles] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]); // All vehicles for checking assignments
  const [drivers, setDrivers] = useState([]);
  const [driverSearch, setDriverSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState("");

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
  }, [selectedVehicleType]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/vehicles`);
      console.log('Vehicles response:', response.data);
      // Store all vehicles for driver assignment checking
      const allVehiclesData = response.data.data || response.data.vehicles || [];
      setAllVehicles(allVehiclesData);
      
      // Filter vehicles by selected type for display
      const filteredVehicles = allVehiclesData.filter(
        (vehicle) => vehicle.vehicleType === selectedVehicleType
      );
      console.log('Filtered vehicles for', selectedVehicleType, ':', filteredVehicles);
      setVehicles(filteredVehicles);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/employees`);
      // Filter employees who are drivers
      const driverEmployees = response.data.employees.filter((emp) =>
        emp.roles?.includes("driver") || emp.roles?.includes("driver-on-delivery")
      );
      setDrivers(driverEmployees);
    } catch (err) {
      console.error("Error fetching drivers:", err);
      setError("Failed to load drivers");
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedVehicle || !selectedDriver) {
      setError("Please select both a vehicle and a driver");
      return;
    }

    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/api/vehicles/${selectedVehicle._id}`, {
        ...selectedVehicle,
        assignedDriver: selectedDriver,
      });
      
      setSuccess("Driver assigned successfully!");
      setShowAssignModal(false);
      setSelectedVehicle(null);
      setSelectedDriver("");
      fetchVehicles();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error assigning driver:", err);
      setError("Failed to assign driver");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    // Handle both populated object and ID string
    const driverId = typeof vehicle.assignedDriver === 'object'
      ? vehicle.assignedDriver?._id
      : vehicle.assignedDriver;
    setSelectedDriver(driverId || "");
    setShowAssignModal(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-96 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Truck Drivers Management
            </h1>
            <p className="text-gray-600">
              Assign drivers to vehicles based on vehicle type
            </p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
              <Check className="mr-2" size={20} />
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
              <X className="mr-2" size={20} />
              {error}
            </div>
          )}

          {/* Vehicle Type Selection */}
          <div className="mb-6 bg-white p-6 rounded-lg shadow">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Vehicle Type
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedVehicleType("scooter")}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition ${
                  selectedVehicleType === "scooter"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Truck className="inline-block mr-2" size={20} />
                Scooter
              </button>
              <button
                onClick={() => setSelectedVehicleType("truck")}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition ${
                  selectedVehicleType === "truck"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Truck className="inline-block mr-2" size={20} />
                Truck
              </button>
            </div>
          </div>

          {/* Vehicles List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedVehicleType.charAt(0).toUpperCase() +
                  selectedVehicleType.slice(1)}{" "}
                Vehicles ({vehicles.filter(v => 
                  v.numberPlate?.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                  v.name?.toLowerCase().includes(vehicleSearch.toLowerCase())
                ).length})
              </h2>
            </div>

            <div className="p-6">
              {/* Search Filter */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search vehicles by number plate or name..."
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
              </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading vehicles...
              </div>
            ) : vehicles.filter(v => 
              v.numberPlate?.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
              v.name?.toLowerCase().includes(vehicleSearch.toLowerCase())
            ).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {vehicleSearch ? 'No vehicles match your search' : `No ${selectedVehicleType} vehicles found`}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Number Plate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehicle Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vehicles.filter(v => 
                      v.numberPlate?.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                      v.name?.toLowerCase().includes(vehicleSearch.toLowerCase())
                    ).map((vehicle) => {
                      // Handle both populated object and ID string
                      const assignedDriverId = typeof vehicle.assignedDriver === 'object' 
                        ? vehicle.assignedDriver?._id 
                        : vehicle.assignedDriver;
                      
                      const assignedDriverData = typeof vehicle.assignedDriver === 'object'
                        ? vehicle.assignedDriver
                        : drivers.find((d) => d._id === assignedDriverId);
                      
                      console.log(`Vehicle ${vehicle.numberPlate}:`, {
                        assignedDriver: vehicle.assignedDriver,
                        assignedDriverId,
                        assignedDriverData,
                        type: typeof vehicle.assignedDriver
                      });
                      
                      return (
                        <tr key={vehicle._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {vehicle.numberPlate}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700 capitalize">
                              {vehicle.vehicleType || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {assignedDriverId ? (
                              assignedDriverData ? (
                                <div className="text-sm">
                                  <div className="font-medium text-gray-900">
                                    {assignedDriverData.name}
                                  </div>
                                  <div className="text-gray-500">
                                    {assignedDriverData.email}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm">
                                  <div className="text-yellow-600">
                                    Driver ID: {assignedDriverId}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    (Driver not found)
                                  </div>
                                </div>
                              )
                            ) : (
                              <span className="text-sm text-gray-400 italic">
                                Not assigned
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => openAssignModal(vehicle)}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium"
                            >
                              {assignedDriverData ? "Change Driver" : "Assign Driver"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            </div>
          </div>

          {/* Drivers List */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                <Users className="inline-block mr-2" size={24} />
                Available Drivers ({drivers.filter(driver => 
                  driver.name?.toLowerCase().includes(driverSearch.toLowerCase()) ||
                  driver.email?.toLowerCase().includes(driverSearch.toLowerCase()) ||
                  driver.employeeId?.toLowerCase().includes(driverSearch.toLowerCase())
                ).length})
              </h2>
            </div>
            <div className="p-6">
              {/* Search Filter */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search drivers by name, email, or employee ID..."
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
              </div>

              {drivers.filter(driver => 
                driver.name?.toLowerCase().includes(driverSearch.toLowerCase()) ||
                driver.email?.toLowerCase().includes(driverSearch.toLowerCase()) ||
                driver.employeeId?.toLowerCase().includes(driverSearch.toLowerCase())
              ).length === 0 ? (
                <p className="text-gray-500 text-center text-base">{driverSearch ? 'No drivers match your search' : 'No drivers available'}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {drivers.filter(driver => 
                    driver.name?.toLowerCase().includes(driverSearch.toLowerCase()) ||
                    driver.email?.toLowerCase().includes(driverSearch.toLowerCase()) ||
                    driver.employeeId?.toLowerCase().includes(driverSearch.toLowerCase())
                  ).map((driver) => {
                    // Find all vehicles assigned to this driver from ALL vehicles, not just filtered ones
                    const assignedVehicles = allVehicles.filter((v) => {
                      const driverId = typeof v.assignedDriver === 'object' 
                        ? v.assignedDriver?._id 
                        : v.assignedDriver;
                      return driverId === driver._id;
                    });
                    
                    console.log(`Driver ${driver.name} assigned vehicles:`, assignedVehicles);
                    
                    return (
                      <div
                        key={driver._id}
                        className={`p-6 border rounded-lg transition ${
                          assignedVehicles.length > 0
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-bold text-2xl text-gray-900">
                          {driver.name}
                        </div>
                        <div className="text-xl text-gray-600 mt-2">{driver.email}</div>
                        <div className="text-xl text-gray-500 mt-2">
                          {driver.phone?.[0] || "No phone"}
                        </div>
                        <div className="text-base text-gray-400 mt-3">
                          ID: {driver.employeeId}
                        </div>
                        
                        {assignedVehicles.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-green-200">
                            <div className="text-base font-bold text-green-700 mb-2">
                              Assigned to:
                            </div>
                            {assignedVehicles.map((vehicle) => (
                              <div
                                key={vehicle._id}
                                className="text-base text-green-600 flex items-center gap-2 mb-1"
                              >
                                <Truck size={16} />
                                <span className="font-bold">{vehicle.numberPlate}</span>
                                <span className="text-green-500">
                                  ({vehicle.vehicleType})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Driver Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Assign Driver</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedVehicle(null);
                  setSelectedDriver("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle
              </label>
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <div className="font-medium">{selectedVehicle?.numberPlate}</div>
                <div className="text-sm text-gray-600 capitalize">
                  {selectedVehicle?.vehicleType}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Driver
              </label>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select a driver --</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name} ({driver.employeeId}) - {driver.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedVehicle(null);
                  setSelectedDriver("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDriver}
                disabled={!selectedDriver || loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruckDrivers;
