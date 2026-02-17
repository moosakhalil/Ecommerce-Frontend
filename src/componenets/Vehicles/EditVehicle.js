import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  Truck,
  Package,
  Upload,
  AlertCircle,
  Check,
  ArrowLeft,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";
import ModeToggle from "../Shared/ModeToggle";
import { API_BASE_URL } from "../../utils/config";

const EditVehicle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    vehicleType: "truck",
    truckTypeName: "",
    scooterTypeName: "",
    weightMaxKg: "",
    maxPackageLength: "",
    loadLimitPercent: 80,
    numberPlate: "",
    status: "active",

    // Truck fields
    heightCm: "",
    widthCm: "",
    lengthCm: "",

    // Scooter fields
    maxPackages: "",
    packageLimitPercent: 80,

    // Optional fields
    fuelType: "Diesel",
    transmission: "Manual",
    yearModel: "",
    engineSizeCc: "",
    odometerKm: "",
    serviceDueDate: "",
    insuranceExpiryDate: "",
    chassisNumber: "",
  });

  const [images, setImages] = useState({
    stnkPhoto: null,
    bpkbPhoto: null,
    stnkIconPhoto: null,
    codecPhoto: null,
  });

  const [existingImages, setExistingImages] = useState({
    stnkPhoto: "",
    bpkbPhoto: "",
    stnkIconPhoto: "",
    codecPhoto: "",
  });

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/vehicles/${id}`);
      if (response.data.success) {
        const vehicle = response.data.data;
        setFormData({
          name: vehicle.name || "",
          vehicleType: vehicle.vehicleType || "truck",
          truckTypeName: vehicle.truckTypeName || "",
          scooterTypeName: vehicle.scooterTypeName || "",
          weightMaxKg: vehicle.weightMaxKg || "",
          maxPackageLength: vehicle.maxPackageLength || "",
          loadLimitPercent: vehicle.loadLimitPercent || 80,
          numberPlate: vehicle.numberPlate || "",
          status: vehicle.status || "active",
          heightCm: vehicle.dimensions?.heightCm || "",
          widthCm: vehicle.dimensions?.widthCm || "",
          lengthCm: vehicle.dimensions?.lengthCm || "",
          maxPackages: vehicle.maxPackages || "",
          packageLimitPercent: vehicle.packageLimitPercent || 80,
          fuelType: vehicle.fuelType || "Diesel",
          transmission: vehicle.transmission || "Manual",
          yearModel: vehicle.yearModel || "",
          engineSizeCc: vehicle.engineSizeCc || "",
          odometerKm: vehicle.odometerKm || "",
          serviceDueDate: vehicle.serviceDueDate
            ? vehicle.serviceDueDate.split("T")[0]
            : "",
          insuranceExpiryDate: vehicle.insuranceExpiryDate
            ? vehicle.insuranceExpiryDate.split("T")[0]
            : "",
          chassisNumber: vehicle.chassisNumber || "",
        });
        setExistingImages(vehicle.images || {});
      }
    } catch (err) {
      setError("Failed to fetch vehicle details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e, imageType) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setImages((prev) => ({
        ...prev,
        [imageType]: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const submitData = new FormData();

      // Add text fields
      submitData.append("name", formData.name);
      submitData.append("vehicleType", formData.vehicleType);
      submitData.append("weightMaxKg", formData.weightMaxKg);
      submitData.append("maxPackageLength", formData.maxPackageLength);
      submitData.append("loadLimitPercent", formData.loadLimitPercent);
      submitData.append("numberPlate", formData.numberPlate);
      submitData.append("status", formData.status);

      // Add dimensions for truck
      if (formData.vehicleType === "truck") {
        if (formData.heightCm)
          submitData.append("dimensions[heightCm]", formData.heightCm);
        if (formData.widthCm)
          submitData.append("dimensions[widthCm]", formData.widthCm);
        if (formData.lengthCm)
          submitData.append("dimensions[lengthCm]", formData.lengthCm);
      }

      // Add scooter fields
      if (formData.vehicleType === "scooter") {
        if (formData.packageLimitPercent)
          submitData.append(
            "packageLimitPercent",
            formData.packageLimitPercent,
          );
        if (formData.maxPackages)
          submitData.append("maxPackages", formData.maxPackages);
      }

      // Add optional fields
      if (formData.fuelType) submitData.append("fuelType", formData.fuelType);
      if (formData.transmission)
        submitData.append("transmission", formData.transmission);
      if (formData.yearModel)
        submitData.append("yearModel", formData.yearModel);
      if (formData.engineSizeCc)
        submitData.append("engineSizeCc", formData.engineSizeCc);
      if (formData.odometerKm)
        submitData.append("odometerKm", formData.odometerKm);
      if (formData.serviceDueDate)
        submitData.append("serviceDueDate", formData.serviceDueDate);
      if (formData.insuranceExpiryDate)
        submitData.append("insuranceExpiryDate", formData.insuranceExpiryDate);
      if (formData.chassisNumber)
        submitData.append("chassisNumber", formData.chassisNumber);

      // Add images only if new ones are selected
      Object.keys(images).forEach((key) => {
        if (images[key]) {
          submitData.append(key, images[key]);
        }
      });

      const response = await axios.put(
        `${API_BASE_URL}/api/vehicles/${id}`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        setSuccess("Vehicle updated successfully!");
        setTimeout(() => {
          navigate("/admin/vehicles");
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update vehicle");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/admin/vehicles")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">
                  Edit Vehicle
                </h1>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                <Check size={20} />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vehicle Type Display (Read-only) */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type (Cannot be changed)
                  </label>
                  <div className="flex items-center gap-2">
                    {formData.vehicleType === "truck" ? (
                      <>
                        <Truck size={24} className="text-blue-600" />
                        <span className="font-medium text-lg capitalize">
                          {formData.vehicleType}
                        </span>
                      </>
                    ) : (
                      <>
                        <Package size={24} className="text-green-600" />
                        <span className="font-medium text-lg capitalize">
                          {formData.vehicleType}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {formData.vehicleType === "truck" && formData.truckTypeName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Type Name (Cannot be changed)
                    </label>
                    <input
                      type="text"
                      value={formData.truckTypeName}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                )}
                {formData.vehicleType === "scooter" &&
                  formData.scooterTypeName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Type Name (Cannot be changed)
                      </label>
                      <input
                        type="text"
                        value={formData.scooterTypeName}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  )}
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Truck #1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number Plate (Cannot be changed)
                  </label>
                  <input
                    type="text"
                    name="numberPlate"
                    value={formData.numberPlate}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    placeholder="e.g., AB 1234 CD"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight Max (kg) (Cannot be changed)
                  </label>
                  <input
                    type="number"
                    name="weightMaxKg"
                    value={formData.weightMaxKg}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    placeholder="e.g., 1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Package Length (cm) (Cannot be changed)
                  </label>
                  <input
                    type="number"
                    name="maxPackageLength"
                    value={formData.maxPackageLength}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    placeholder="e.g., 150"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Conditional Fields - Truck */}
              {formData.vehicleType === "truck" && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Truck Dimensions (Cannot be changed)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        name="heightCm"
                        value={formData.heightCm}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                        placeholder="e.g., 200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Width (cm)
                      </label>
                      <input
                        type="number"
                        name="widthCm"
                        value={formData.widthCm}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                        placeholder="e.g., 180"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Length (cm)
                      </label>
                      <input
                        type="number"
                        name="lengthCm"
                        value={formData.lengthCm}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                        placeholder="e.g., 400"
                      />
                    </div>
                  </div>

                  {/* Total Dimensions Display */}
                  {formData.heightCm &&
                    formData.widthCm &&
                    formData.lengthCm && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Total Volume:
                            </span>
                            <span className="text-lg font-bold text-blue-600">
                              {(
                                formData.heightCm *
                                formData.widthCm *
                                formData.lengthCm
                              ).toLocaleString()}{" "}
                              cm³
                            </span>
                          </div>
                          <div className="flex items-center justify-end mt-2">
                            <span
                              style={{
                                fontSize: "48px",
                                fontWeight: "bold",
                                color: "#1d4ed8",
                                lineHeight: "1",
                              }}
                            >
                              (
                              {(
                                (formData.heightCm *
                                  formData.widthCm *
                                  formData.lengthCm) /
                                1000000
                              ).toFixed(2)}{" "}
                              m³)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Conditional Fields - Scooter */}
              {formData.vehicleType === "scooter" && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Scooter Specifications (Cannot be changed)
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Number of Packages
                      </label>
                      <input
                        type="number"
                        name="maxPackages"
                        value={formData.maxPackages}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                        placeholder="e.g., 5"
                      />
                    </div>
                  </div>

                  {/* Package Limit */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Package Limit Percentage: {formData.packageLimitPercent}%
                    </label>
                    <input
                      type="range"
                      name="packageLimitPercent"
                      min="0"
                      max="100"
                      value={formData.packageLimitPercent}
                      onChange={handleChange}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Recommended: 80% for safety
                    </p>

                    {/* Recommended Max Packages Display */}
                    {formData.maxPackages && formData.packageLimitPercent && (
                      <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Recommended Max Packages:
                          </span>
                          <span className="text-lg font-bold text-purple-600">
                            {Math.round(
                              (formData.maxPackages *
                                formData.packageLimitPercent) /
                                100,
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Based on {formData.packageLimitPercent}% of{" "}
                          {formData.maxPackages} maximum packages
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Load Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Load Limit Percentage: {formData.loadLimitPercent}%
                </label>
                <input
                  type="range"
                  name="loadLimitPercent"
                  min="0"
                  max="100"
                  value={formData.loadLimitPercent}
                  onChange={handleChange}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Recommended: 80% for safety
                </p>

                {/* Recommended Weight Max Display */}
                {formData.weightMaxKg && formData.loadLimitPercent && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Recommended Weight Max:
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {Math.round(
                          (formData.weightMaxKg * formData.loadLimitPercent) /
                            100,
                        )}{" "}
                        kg
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on {formData.loadLimitPercent}% of{" "}
                      {formData.weightMaxKg} kg maximum capacity
                    </p>
                  </div>
                )}
              </div>

              {/* Vehicle Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Vehicle Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuel Type (Cannot be changed)
                    </label>
                    <input
                      type="text"
                      name="fuelType"
                      value={formData.fuelType}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transmission (Cannot be changed)
                    </label>
                    <input
                      type="text"
                      name="transmission"
                      value={formData.transmission}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year Model (Cannot be changed)
                    </label>
                    <input
                      type="number"
                      name="yearModel"
                      value={formData.yearModel}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      placeholder="e.g., 2023"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Engine Size (cc) (Cannot be changed)
                    </label>
                    <input
                      type="number"
                      name="engineSizeCc"
                      value={formData.engineSizeCc}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      placeholder="e.g., 2500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Odometer (km)
                    </label>
                    <input
                      type="number"
                      name="odometerKm"
                      value={formData.odometerKm}
                      onChange={handleChange}
                      autoComplete="off"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="120000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Due Date
                    </label>
                    <input
                      type="date"
                      name="serviceDueDate"
                      value={formData.serviceDueDate}
                      onChange={handleChange}
                      autoComplete="off"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Insurance Expiry Date
                    </label>
                    <input
                      type="date"
                      name="insuranceExpiryDate"
                      value={formData.insuranceExpiryDate}
                      onChange={handleChange}
                      autoComplete="off"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chassis Number (Cannot be changed)
                    </label>
                    <input
                      type="text"
                      name="chassisNumber"
                      value={formData.chassisNumber}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      placeholder="e.g., XXXXXXXXXXXXXXXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Document Upload */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Vehicle Documents (Upload new to replace)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(images).map((imageType) => (
                    <div
                      key={imageType}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                        {imageType.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      {existingImages[imageType] && !images[imageType] && (
                        <div className="mb-2 text-sm text-green-600">
                          ✓ Current image uploaded
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, imageType)}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {images[imageType] && (
                        <p className="text-sm text-green-600 mt-2">
                          New image selected
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate("/admin/vehicles")}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? "Updating..." : "Update Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditVehicle;
