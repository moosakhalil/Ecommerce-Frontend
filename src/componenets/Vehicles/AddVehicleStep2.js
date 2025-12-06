import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Truck, Package, Upload, AlertCircle, Check, ArrowLeft, Lock } from 'lucide-react';
import Sidebar from '../Sidebar/sidebar';

const AddVehicleStep2 = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [vehicle, setVehicle] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    numberPlate: '',
    status: 'active',
    loadLimitPercent: 80,
    
    // Optional fields
    fuelType: 'Diesel',
    transmission: 'Manual',
    yearModel: '',
    engineSizeCc: '',
    odometerKm: '',
    serviceDueDate: '',
    insuranceExpiryDate: '',
    chassisNumber: '',
  });
  
  const [images, setImages] = useState({
    stnkPhoto: null,
    bpkbPhoto: null,
    stnkIconPhoto: null,
    codecPhoto: null,
  });

  const [imagePreviews, setImagePreviews] = useState({
    stnkPhoto: null,
    bpkbPhoto: null,
    stnkIconPhoto: null,
    codecPhoto: null,
  });

  useEffect(() => {
    if (!id) {
      navigate('/admin/vehicles/select');
      return;
    }
    fetchVehicle();
  }, [id, navigate]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/vehicles/${id}`);
      if (response.data.success) {
        setVehicle(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch vehicle details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setImages(prev => ({
        ...prev,
        [name]: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => ({
          ...prev,
          [name]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      
      // Update only the new data, specifications are already saved
      formDataToSend.append('name', formData.name);
      formDataToSend.append('numberPlate', formData.numberPlate);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('loadLimitPercent', formData.loadLimitPercent);
      
      // Add optional fields
      if (formData.fuelType) formDataToSend.append('fuelType', formData.fuelType);
      if (formData.transmission) formDataToSend.append('transmission', formData.transmission);
      if (formData.yearModel) formDataToSend.append('yearModel', formData.yearModel);
      if (formData.engineSizeCc) formDataToSend.append('engineSizeCc', formData.engineSizeCc);
      if (formData.odometerKm) formDataToSend.append('odometerKm', formData.odometerKm);
      if (formData.serviceDueDate) formDataToSend.append('serviceDueDate', formData.serviceDueDate);
      if (formData.insuranceExpiryDate) formDataToSend.append('insuranceExpiryDate', formData.insuranceExpiryDate);
      if (formData.chassisNumber) formDataToSend.append('chassisNumber', formData.chassisNumber);
      
      // Add images
      Object.keys(images).forEach(key => {
        if (images[key]) {
          formDataToSend.append(key, images[key]);
        }
      });

      const response = await axios.put(`http://localhost:5000/api/vehicles/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccess('Vehicle details added successfully!');
        setTimeout(() => {
          navigate('/admin/vehicles');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update vehicle');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/vehicles/select');
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

  if (!vehicle) {
    return null;
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
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Add Vehicle Details</h1>
                <p className="text-sm text-gray-500">Complete vehicle information</p>
              </div>
            </div>
          </div>

          {/* Locked Specifications Summary */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Lock size={20} className="text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-700">Vehicle Specifications (Locked)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-base">
              <div className="flex justify-between">
                <span className="text-gray-600">Vehicle Type:</span>
                <span className="font-medium capitalize">{vehicle.vehicleType}</span>
              </div>
              {vehicle.vehicleType === 'truck' && vehicle.truckTypeName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Truck Type:</span>
                  <span className="font-medium">{vehicle.truckTypeName}</span>
                </div>
              )}
              {vehicle.vehicleType === 'scooter' && vehicle.scooterTypeName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Scooter Type:</span>
                  <span className="font-medium">{vehicle.scooterTypeName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Weight Max:</span>
                <span className="font-medium">{vehicle.weightMaxKg} kg</span>
              </div>
              {vehicle.vehicleType === 'truck' && vehicle.dimensions && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dimensions:</span>
                    <span className="font-medium">
                      {vehicle.dimensions.heightCm}×{vehicle.dimensions.widthCm}×{vehicle.dimensions.lengthCm} cm
                    </span>
                  </div>
                  {vehicle.totalDimensionsCubicCm && (
                    <div className="flex flex-col">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Volume:</span>
                        <span className="font-medium text-blue-600">
                          {vehicle.totalDimensionsCubicCm.toLocaleString()} cm³
                        </span>
                      </div>
                      <div className="flex justify-end text-gray-500">
                        ({(vehicle.totalDimensionsCubicCm / 1000000).toFixed(2)} m³)
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Package Length:</span>
                    <span className="font-medium">{vehicle.maxPackageLength} cm</span>
                  </div>
                </>
              )}
              {vehicle.vehicleType === 'scooter' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Packages:</span>
                    <span className="font-medium">{vehicle.maxPackages}</span>
                  </div>
                </>
              )}
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
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Truck #1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number Plate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="numberPlate"
                    value={formData.numberPlate}
                    onChange={handleChange}
                    autoComplete="off"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., ABC1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Under Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

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
              <p className="text-sm text-gray-500 mt-1">Recommended: 80% for safety</p>
            </div>

            {/* Vehicle Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Vehicle Details (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Type
                  </label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transmission
                  </label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year Model
                  </label>
                  <input
                    type="number"
                    name="yearModel"
                    value={formData.yearModel}
                    onChange={handleChange}
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2023"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Engine size (cc)
                  </label>
                  <input
                    type="number"
                    name="engineSizeCc"
                    value={formData.engineSizeCc}
                    onChange={handleChange}
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service due date
                  </label>
                  <input
                    type="date"
                    name="serviceDueDate"
                    value={formData.serviceDueDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance expiry date
                  </label>
                  <input
                    type="date"
                    name="insuranceExpiryDate"
                    value={formData.insuranceExpiryDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chassis number
                  </label>
                  <input
                    type="text"
                    name="chassisNumber"
                    value={formData.chassisNumber}
                    onChange={handleChange}
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1234567890ABCDEGH"
                  />
                </div>
              </div>
            </div>

            {/* Upload Documents */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>
              <div className="grid grid-cols-2 gap-4">
                {['stnkPhoto', 'bpkbPhoto', 'stnkIconPhoto', 'codecPhoto'].map((imageType) => (
                  <div key={imageType}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {imageType.replace(/([A-Z])/g, ' $1').replace('Photo', ' photo').trim()}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        name={imageType}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                        id={imageType}
                      />
                      <label htmlFor={imageType} className="cursor-pointer flex flex-col items-center gap-2">
                        {imagePreviews[imageType] ? (
                          <img src={imagePreviews[imageType]} alt={`${imageType} Preview`} className="w-full h-32 object-cover rounded" />
                        ) : (
                          <Upload className="text-gray-400" />
                        )}
                        <span className="text-sm text-gray-600">
                          {images[imageType] ? images[imageType].name : `Upload ${imageType.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                        </span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving Details...' : 'Complete Vehicle Setup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AddVehicleStep2;
