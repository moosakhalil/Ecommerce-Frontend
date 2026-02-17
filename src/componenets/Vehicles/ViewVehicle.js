import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Truck,
  Package,
  Calendar,
  Fuel,
  Settings,
  FileText,
  AlertCircle,
  Edit,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";
import ModeToggle from "../Shared/ModeToggle";
import { API_BASE_URL } from "../../utils/config";

const ViewVehicle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/vehicles/${id}`);
      if (response.data.success) {
        setVehicle(response.data.data);
      }
    } catch (err) {
      setError("Failed to fetch vehicle details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      inactive: "bg-red-100 text-red-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (date) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Error Loading Vehicle
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/admin/vehicles")}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Vehicles
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/admin/vehicles")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
                <div className="flex items-center gap-3">
                  {vehicle.vehicleType === "truck" ? (
                    <Truck className="text-blue-600" size={32} />
                  ) : (
                    <Package className="text-green-600" size={32} />
                  )}
                  <div>
                    {(vehicle.truckTypeName || vehicle.scooterTypeName) && (
                      <p className="text-xl text-blue-600 font-semibold mb-1">
                        {vehicle.truckTypeName || vehicle.scooterTypeName}
                      </p>
                    )}
                    <h1 className="text-2xl font-bold text-gray-800">
                      {vehicle.name}
                    </h1>
                    <p className="text-gray-600">{vehicle.numberPlate}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(vehicle.status)}`}
                >
                  {vehicle.status.toUpperCase()}
                </span>
                <button
                  onClick={() =>
                    navigate(`/admin/vehicles/edit/${vehicle._id}`)
                  }
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit size={20} />
                  Edit
                </button>
              </div>
            </div>
          </div>

          {/* Vehicle Type Display */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type
              </label>
              <div className="flex items-center gap-2">
                {vehicle.vehicleType === "truck" ? (
                  <>
                    <Truck size={24} className="text-blue-600" />
                    <span className="font-medium text-lg capitalize">
                      {vehicle.vehicleType}
                    </span>
                  </>
                ) : (
                  <>
                    <Package size={24} className="text-green-600" />
                    <span className="font-medium text-lg capitalize">
                      {vehicle.vehicleType}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText size={24} />
                Basic Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 font-medium">
                    Vehicle Type:
                  </span>
                  <span className="text-gray-900 capitalize">
                    {vehicle.vehicleType}
                  </span>
                </div>
                {vehicle.vehicleType === "truck" && vehicle.truckTypeName && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600 font-medium">
                      Vehicle Type Name:
                    </span>
                    <span className="text-gray-900">
                      {vehicle.truckTypeName}
                    </span>
                  </div>
                )}
                {vehicle.vehicleType === "scooter" &&
                  vehicle.scooterTypeName && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600 font-medium">
                        Vehicle Type Name:
                      </span>
                      <span className="text-gray-900">
                        {vehicle.scooterTypeName}
                      </span>
                    </div>
                  )}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 font-medium">
                    Number Plate:
                  </span>
                  <span className="text-gray-900 font-semibold">
                    {vehicle.numberPlate}
                  </span>
                </div>
                {vehicle.chassisNumber && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600 font-medium">
                      Chassis Number:
                    </span>
                    <span className="text-gray-900 text-sm">
                      {vehicle.chassisNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings size={24} />
                Specifications
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 font-medium">Weight Max:</span>
                  <span className="text-gray-900">
                    {vehicle.weightMaxKg} kg
                  </span>
                </div>
                {vehicle.maxPackageLength && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600 font-medium">
                      Max Package Length:
                    </span>
                    <span className="text-gray-900">
                      {vehicle.maxPackageLength} cm
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 font-medium">
                    Weight Load limit percentage (%)
                  </span>
                  <span className="text-gray-900">
                    {vehicle.loadLimitPercent}%
                  </span>
                </div>
                {vehicle.weightMaxKg && vehicle.loadLimitPercent && (
                  <div className="py-2 border-b bg-green-50">
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-semibold">
                        Recommended Weight Max:
                      </span>
                      <span className="text-green-600 font-bold">
                        {Math.round(
                          (vehicle.weightMaxKg * vehicle.loadLimitPercent) /
                            100,
                        )}{" "}
                        kg
                      </span>
                    </div>
                    <div className="flex justify-end text-xs text-gray-500 mt-1">
                      ({vehicle.loadLimitPercent}% of {vehicle.weightMaxKg} kg)
                    </div>
                  </div>
                )}
                {vehicle.vehicleType === "truck" && vehicle.dimensions && (
                  <>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600 font-medium">Height:</span>
                      <span className="text-gray-900">
                        {vehicle.dimensions.heightCm} cm
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600 font-medium">Width:</span>
                      <span className="text-gray-900">
                        {vehicle.dimensions.widthCm} cm
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600 font-medium">Length:</span>
                      <span className="text-gray-900">
                        {vehicle.dimensions.lengthCm} cm
                      </span>
                    </div>
                    {vehicle.totalDimensionsCubicCm && (
                      <div className="py-2 border-b bg-blue-50">
                        <div className="flex justify-between">
                          <span className="text-gray-700 font-semibold">
                            Total Volume:
                          </span>
                          <span className="text-blue-600 font-bold">
                            {vehicle.totalDimensionsCubicCm.toLocaleString()}{" "}
                            cm³
                          </span>
                        </div>
                        <div className="flex justify-end text-xl font-bold text-blue-700 mt-1">
                          (
                          {(vehicle.totalDimensionsCubicCm / 1000000).toFixed(
                            2,
                          )}{" "}
                          m³)
                        </div>
                      </div>
                    )}
                  </>
                )}
                {vehicle.vehicleType === "scooter" && (
                  <>
                    {vehicle.maxPackages && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600 font-medium">
                          Max Packages:
                        </span>
                        <span className="text-gray-900">
                          {vehicle.maxPackages}
                        </span>
                      </div>
                    )}
                    {vehicle.packageLimitPercent && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600 font-medium">
                          Package Limit Percentage:
                        </span>
                        <span className="text-gray-900">
                          {vehicle.packageLimitPercent}%
                        </span>
                      </div>
                    )}
                    {vehicle.maxPackages && vehicle.packageLimitPercent && (
                      <div className="py-2 border-b bg-purple-50">
                        <div className="flex justify-between">
                          <span className="text-gray-700 font-semibold">
                            Recommended Max Packages:
                          </span>
                          <span className="text-purple-600 font-bold">
                            {Math.round(
                              (vehicle.maxPackages *
                                vehicle.packageLimitPercent) /
                                100,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-end text-xs text-gray-500 mt-1">
                          ({vehicle.packageLimitPercent}% of{" "}
                          {vehicle.maxPackages} packages)
                        </div>
                      </div>
                    )}
                  </>
                )}
                {vehicle.fuelType && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600 font-medium">
                      Fuel Type:
                    </span>
                    <span className="text-gray-900">{vehicle.fuelType}</span>
                  </div>
                )}
                {vehicle.transmission && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600 font-medium">
                      Transmission:
                    </span>
                    <span className="text-gray-900">
                      {vehicle.transmission}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Fuel size={24} />
                Vehicle Details
              </h2>
              <div className="space-y-3">
                {vehicle.yearModel && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600 font-medium">
                      Year Model:
                    </span>
                    <span className="text-gray-900">{vehicle.yearModel}</span>
                  </div>
                )}
                {vehicle.engineSizeCc && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600 font-medium">
                      Engine Size:
                    </span>
                    <span className="text-gray-900">
                      {vehicle.engineSizeCc} cc
                    </span>
                  </div>
                )}
                {vehicle.odometerKm && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600 font-medium">Odometer:</span>
                    <span className="text-gray-900">
                      {vehicle.odometerKm.toLocaleString()} km
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Service & Insurance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar size={24} />
                Service & Insurance
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 font-medium">
                    Service Due:
                  </span>
                  <span
                    className={`text-gray-900 ${
                      vehicle.serviceDueDate &&
                      new Date(vehicle.serviceDueDate) < new Date()
                        ? "text-red-600 font-semibold"
                        : ""
                    }`}
                  >
                    {formatDate(vehicle.serviceDueDate)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 font-medium">
                    Insurance Expiry:
                  </span>
                  <span
                    className={`text-gray-900 ${
                      vehicle.insuranceExpiryDate &&
                      new Date(vehicle.insuranceExpiryDate) < new Date()
                        ? "text-red-600 font-semibold"
                        : ""
                    }`}
                  >
                    {formatDate(vehicle.insuranceExpiryDate)}
                  </span>
                </div>
              </div>
              {((vehicle.serviceDueDate &&
                new Date(vehicle.serviceDueDate) < new Date()) ||
                (vehicle.insuranceExpiryDate &&
                  new Date(vehicle.insuranceExpiryDate) < new Date())) && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle size={20} />
                  <span className="text-sm font-medium">
                    Action Required: Service or insurance overdue
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Document Images */}
          {vehicle.images &&
            Object.values(vehicle.images).some((img) => img) && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">
                  Vehicle Documents
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(vehicle.images).map(([key, value]) =>
                    value ? (
                      <div key={key} className="border rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700 mb-2 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <img
                          src={`${API_BASE_URL}${value}`}
                          alt={key}
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            )}

          {/* Timestamps */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <div className="flex justify-between text-sm text-gray-600">
              <div>
                <span className="font-medium">Created:</span>{" "}
                {formatDate(vehicle.createdAt)}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{" "}
                {formatDate(vehicle.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewVehicle;
