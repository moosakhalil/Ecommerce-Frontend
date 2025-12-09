import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Truck, Package, Upload, AlertCircle, Check } from 'lucide-react';

const AddVehicle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    vehicleType: 'truck',
    weightMaxKg: '',
    maxPackageLength: '',
    loadLimitPercent: 80,
    numberPlate: '',
    status: 'active',
    
    // Truck fields
    heightCm: '',
    widthCm: '',
    lengthCm: '',
    
    // Scooter fields
    maxPackages: '',
    packageLimitPercent: 80,
    
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
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      
      // Add all text fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add images
      Object.keys(images).forEach(key => {
        if (images[key]) {
          formDataToSend.append(key, images[key]);
        }
      });

      const response = await axios.post('http://localhost:5000/api/vehicles', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccess('Vehicle added successfully!');
        setTimeout(() => {
          navigate('/admin/vehicles');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Vehicle</h1>
          
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
            {/* Vehicle Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, vehicleType: 'truck'})}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    formData.vehicleType === 'truck'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Truck size={32} className={formData.vehicleType === 'truck' ? 'text-blue-600' : 'text-gray-400'} />
                  <span className="font-medium">Truck</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({...formData, vehicleType: 'scooter'})}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    formData.vehicleType === 'scooter'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Package size={32} className={formData.vehicleType === 'scooter' ? 'text-blue-600' : 'text-gray-400'} />
                  <span className="font-medium">Scooter</span>
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Truck #1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number Plate *
                  </label>
                  <input
                    type="text"
                    name="numberPlate"
                    value={formData.numberPlate}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ABC1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight max (kg) *
                  </label>
                  <input
                    type="number"
                    name="weightMaxKg"
                    value={formData.weightMaxKg}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={formData.vehicleType === 'truck' ? '5000' : '80'}
                  />
                </div>

               

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Under Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Truck-specific fields */}
            {formData.vehicleType === 'truck' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Dimensions</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      H (Height) cm *
                    </label>
                    <input
                      type="number"
                      name="heightCm"
                      value={formData.heightCm}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      W (Width) cm *
                    </label>
                    <input
                      type="number"
                      name="widthCm"
                      value={formData.widthCm}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="220"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      L (Length) cm *
                    </label>
                    <input
                      type="number"
                      name="lengthCm"
                      value={formData.lengthCm}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="600"
                    />
                  </div>
                </div>
                
                {/* Total Dimensions Display */}
                {formData.heightCm && formData.widthCm && formData.lengthCm && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Total Volume:</span>
                        <span className="text-lg font-bold text-blue-600">
                          {(formData.heightCm * formData.widthCm * formData.lengthCm).toLocaleString()} cm³
                        </span>
                      </div>
                      <div className="flex items-center justify-end mt-2">
                        <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#1d4ed8', lineHeight: '1' }}>
                          ({(formData.heightCm * formData.widthCm * formData.lengthCm / 1000000).toFixed(2)} m³)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
            )}
             <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Package Length (cm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="maxPackageLength"
                    value={formData.maxPackageLength}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="150"
                  />
                </div>

            {/* Scooter-specific fields */}
            {formData.vehicleType === 'scooter' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Scooter Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max number of packages *
                    </label>
                    <input
                      type="number"
                      name="maxPackages"
                      value={formData.maxPackages}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3"
                    />
                  </div>
                </div>
                
                {/* Package Limit */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Limit % (recommended 80%) *
                  </label>
                  <input
                    type="range"
                    name="packageLimitPercent"
                    min="0"
                    max="100"
                    value={formData.packageLimitPercent}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>0%</span>
                    <span className="font-semibold text-blue-600">{formData.packageLimitPercent}%</span>
                    <span>100%</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Do not go above 80%</p>
                  
                  {/* Recommended Max Packages Display */}
                  {formData.maxPackages && formData.packageLimitPercent && (
                    <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Recommended Max Packages:</span>
                        <span className="text-lg font-bold text-purple-600">
                          {Math.round((formData.maxPackages * formData.packageLimitPercent) / 100)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Based on {formData.packageLimitPercent}% of {formData.maxPackages} maximum packages
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Load Limit */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Load Limit</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Limit % (recommended 80%) *
                </label>
                <input
                  type="range"
                  name="loadLimitPercent"
                  min="0"
                  max="100"
                  value={formData.loadLimitPercent}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>0%</span>
                  <span className="font-semibold text-blue-600">{formData.loadLimitPercent}%</span>
                  <span>100%</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Do not go above 80%</p>
                
                {/* Recommended Weight Max Display */}
                {formData.weightMaxKg && formData.loadLimitPercent && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Recommended Weight Max:</span>
                      <span className="text-lg font-bold text-green-600">
                        {Math.round((formData.weightMaxKg * formData.loadLimitPercent) / 100)} kg
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on {formData.loadLimitPercent}% of {formData.weightMaxKg} kg maximum capacity
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Vehicle Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel type *
                  </label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transmission *
                  </label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle year / model *
                  </label>
                  <input
                    type="number"
                    name="yearModel"
                    value={formData.yearModel}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2018"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Engine size (cc) *
                  </label>
                  <input
                    type="number"
                    name="engineSizeCc"
                    value={formData.engineSizeCc}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="3000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Odometer (km) *
                  </label>
                  <input
                    type="number"
                    name="odometerKm"
                    value={formData.odometerKm}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="120000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service due date *
                  </label>
                  <input
                    type="date"
                    name="serviceDueDate"
                    value={formData.serviceDueDate}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance expiry date *
                  </label>
                  <input
                    type="date"
                    name="insuranceExpiryDate"
                    value={formData.insuranceExpiryDate}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chassis number *
                  </label>
                  <input
                    type="text"
                    name="chassisNumber"
                    value={formData.chassisNumber}
                    onChange={handleChange}
                    required
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload STNK photo *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      name="stnkPhoto"
                      onChange={handleImageChange}
                      accept="image/*"
                      required
                      className="hidden"
                      id="stnkPhoto"
                    />
                    <label htmlFor="stnkPhoto" className="cursor-pointer flex flex-col items-center gap-2">
                      {imagePreviews.stnkPhoto ? (
                        <img src={imagePreviews.stnkPhoto} alt="STNK Preview" className="w-full h-32 object-cover rounded" />
                      ) : (
                        <Upload className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600">
                        {images.stnkPhoto ? images.stnkPhoto.name : 'Upload STNK photo'}
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload BPKB photo *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      name="bpkbPhoto"
                      onChange={handleImageChange}
                      accept="image/*"
                      required
                      className="hidden"
                      id="bpkbPhoto"
                    />
                    <label htmlFor="bpkbPhoto" className="cursor-pointer flex flex-col items-center gap-2">
                      {imagePreviews.bpkbPhoto ? (
                        <img src={imagePreviews.bpkbPhoto} alt="BPKB Preview" className="w-full h-32 object-cover rounded" />
                      ) : (
                        <Upload className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600">
                        {images.bpkbPhoto ? images.bpkbPhoto.name : 'Upload BPKB photo'}
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload STNK icon photo *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      name="stnkIconPhoto"
                      onChange={handleImageChange}
                      accept="image/*"
                      required
                      className="hidden"
                      id="stnkIconPhoto"
                    />
                    <label htmlFor="stnkIconPhoto" className="cursor-pointer flex flex-col items-center gap-2">
                      {imagePreviews.stnkIconPhoto ? (
                        <img src={imagePreviews.stnkIconPhoto} alt="STNK Icon Preview" className="w-full h-32 object-cover rounded" />
                      ) : (
                        <Upload className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600">
                        {images.stnkIconPhoto ? images.stnkIconPhoto.name : 'Upload STNK icon'}
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload codec photo *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      name="codecPhoto"
                      onChange={handleImageChange}
                      accept="image/*"
                      required
                      className="hidden"
                      id="codecPhoto"
                    />
                    <label htmlFor="codecPhoto" className="cursor-pointer flex flex-col items-center gap-2">
                      {imagePreviews.codecPhoto ? (
                        <img src={imagePreviews.codecPhoto} alt="Codec Preview" className="w-full h-32 object-cover rounded" />
                      ) : (
                        <Upload className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600">
                        {images.codecPhoto ? images.codecPhoto.name : 'Upload codec'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Adding Vehicle...' : 'Add Vehicle'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/vehicles')}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVehicle;
