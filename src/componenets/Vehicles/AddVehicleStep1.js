import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Truck, Package, ArrowRight, ArrowLeft, Check, HelpCircle, X } from 'lucide-react';
import Sidebar from '../Sidebar/sidebar';
import { API_BASE_URL } from '../../utils/config';

const AddVehicleStep1 = () => {
  const navigate = useNavigate();
  const [vehicleType, setVehicleType] = useState('truck');
  const [error, setError] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  const [formData, setFormData] = useState({
    // Truck fields
    truckTypeName: '',
    weightMaxKg: '',
    heightCm: '',
    widthCm: '',
    lengthCm: '',
    maxPackageLength: '',
    
    // Scooter fields
    scooterTypeName: '',
    maxPackages: '',
  });

  // Fetch templates on component mount
  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/vehicle-templates`);
        if (response.data.success && response.data.data.length > 0) {
          setSavedVehicles(response.data.data);
          setShowTable(true);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [savedVehicles, setSavedVehicles] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleSave = async () => {
    setError('');
    
    // Validation for truck
    if (vehicleType === 'truck') {
      if (!formData.truckTypeName || !formData.weightMaxKg || !formData.heightCm || !formData.widthCm || !formData.lengthCm || !formData.maxPackageLength) {
        setError('Please fill in all required fields');
        return;
      }
    }
    
    // Validation for scooter
    if (vehicleType === 'scooter') {
      if (!formData.scooterTypeName || !formData.weightMaxKg || !formData.maxPackages) {
        setError('Please fill in all required fields');
        return;
      }
    }

    setSaving(true);

    try {
      const templateData = {
        vehicleType,
        weightMaxKg: Number(formData.weightMaxKg),
      };

      if (vehicleType === 'truck') {
        templateData.truckTypeName = formData.truckTypeName;
        templateData.maxPackageLength = Number(formData.maxPackageLength);
        templateData.dimensions = {
          heightCm: Number(formData.heightCm),
          widthCm: Number(formData.widthCm),
          lengthCm: Number(formData.lengthCm),
        };
      } else {
        templateData.scooterTypeName = formData.scooterTypeName;
        templateData.maxPackages = Number(formData.maxPackages);
        templateData.maxPackageLength = 100; // Default for scooter
      }

      console.log('Sending template data:', templateData);

      const response = await axios.post(`${API_BASE_URL}/api/vehicle-templates`, templateData);

      if (response.data.success) {
        const newTemplate = response.data.data;
        setSavedVehicles(prev => [...prev, newTemplate]);
        setShowTable(true);
        
        // Reset form
        setFormData({
          truckTypeName: '',
          weightMaxKg: '',
          heightCm: '',
          widthCm: '',
          lengthCm: '',
          maxPackageLength: '',
          scooterTypeName: '',
          maxPackages: '',
        });
      }
    } catch (err) {
      console.error('Error saving template:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessage = 'Failed to save template';
      
      if (err.response?.data?.errors) {
        // Validation errors
        errorMessage = err.response.data.errors.map(e => `${e.field}: ${e.message}`).join(', ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

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
                onClick={() => navigate('/admin/vehicles')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Add New Vehicle - Step 1</h1>
                <p className="text-sm text-gray-500">Basic specifications</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Page Information"
              >
                <HelpCircle size={24} />
              </button>
              <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                <span>1</span>
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-500 rounded-full">
                <span>2</span>
              </div>
            </div>
          </div>
        </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-6">
            {/* Vehicle Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setVehicleType('truck')}
                  className={`flex-1 flex items-center justify-center gap-2 p-6 border-2 rounded-lg transition-colors ${
                    vehicleType === 'truck'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Truck size={32} />
                  <span className="text-lg font-medium">Truck</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleType('scooter')}
                  className={`flex-1 flex items-center justify-center gap-2 p-6 border-2 rounded-lg transition-colors ${
                    vehicleType === 'scooter'
                      ? 'border-green-600 bg-green-50 text-green-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Package size={32} />
                  <span className="text-lg font-medium">Scooter</span>
                </button>
              </div>
            </div>

            {/* Truck Fields */}
            {vehicleType === 'truck' && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Truck Specifications</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Type Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="truckTypeName"
                        value={formData.truckTypeName}
                        onChange={handleChange}
                        autoComplete="off"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        placeholder="e.g., Heavy Duty Truck"
                      />
                      <p className="text-xs text-gray-500 mt-1">⚠️ Temporary name. You'll add the actual number plate in the next step.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight Max (kg) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="weightMaxKg"
                        value={formData.weightMaxKg}
                        onChange={handleChange}
                        autoComplete="off"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        placeholder="e.g., 5000"
                      />
                    </div>

                    <div>
                      <h4 className="text-md font-semibold mb-3 text-gray-700">Dimensions</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Height (cm) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="heightCm"
                            value={formData.heightCm}
                            onChange={handleChange}
                            autoComplete="off"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                            placeholder="600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Width (cm) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="widthCm"
                            value={formData.widthCm}
                            onChange={handleChange}
                            autoComplete="off"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                            placeholder="220"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Length (cm) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="lengthCm"
                            value={formData.lengthCm}
                            onChange={handleChange}
                            autoComplete="off"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                            placeholder="600"
                          />
                        </div>
                      </div>
                      
                      {/* Total Dimensions Display */}
                      {formData.heightCm && formData.widthCm && formData.lengthCm && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Total Volume:</span>
                            <span className="text-lg font-bold text-blue-600">
                              {(formData.heightCm * formData.widthCm * formData.lengthCm).toLocaleString()} cm³
                            </span>
                          </div>
                          <div className="flex justify-end text-gray-500">
                            ({((formData.heightCm * formData.widthCm * formData.lengthCm) / 1000000).toFixed(2)} m³)
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Package Length (cm) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="maxPackageLength"
                        value={formData.maxPackageLength}
                        onChange={handleChange}
                        autoComplete="off"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        placeholder="e.g., 150"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Scooter Fields */}
            {vehicleType === 'scooter' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Scooter Specifications</h3>
                <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Type Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="scooterTypeName"
                        value={formData.scooterTypeName}
                        onChange={handleChange}
                        autoComplete="off"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        placeholder="e.g., Delivery Scooter"
                      />
                      <p className="text-xs text-gray-500 mt-1">⚠️ Temporary name. You'll add the actual number plate in the next step.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight Max (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="weightMaxKg"
                      value={formData.weightMaxKg}
                      onChange={handleChange}
                      autoComplete="off"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="e.g., 80"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Number of Packages <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="maxPackages"
                      value={formData.maxPackages}
                      onChange={handleChange}
                      autoComplete="off"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>
              </div>
            )}
            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/admin/vehicles')}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-lg font-medium disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>

          {/* Saved Vehicles Table */}
          {showTable && savedVehicles.length > 0 && (
            <div className="mt-8 border-t pt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Saved Vehicles</h2>
                <button
                  onClick={() => navigate('/admin/vehicles/select')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <ArrowRight size={20} />
                  Continue to Add Details
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vehicle Type Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Weight Max</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Specifications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedVehicles.map((vehicle, index) => (
                      <tr key={vehicle._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            {vehicle.vehicleType === 'truck' ? (
                              <Truck size={20} className="text-blue-600" />
                            ) : (
                              <Package size={20} className="text-green-600" />
                            )}
                            <span className="font-medium capitalize">{vehicle.vehicleType}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {vehicle.truckTypeName || vehicle.scooterTypeName}
                        </td>
                        <td className="px-4 py-3 text-sm">{vehicle.weightMaxKg} kg</td>
                        <td className="px-4 py-3 text-sm">
                          {vehicle.vehicleType === 'truck' && vehicle.dimensions ? (
                            <span>{vehicle.dimensions.heightCm}×{vehicle.dimensions.widthCm}×{vehicle.dimensions.lengthCm} cm</span>
                          ) : (
                            <span>Max {vehicle.maxPackages} packages</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <HelpCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Add Vehicle Guide
                  </h3>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h4 className="font-semibold text-blue-900 mb-2">Step 1: Basic Specifications</h4>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    This page allows you to register a new vehicle into the system. You will need to provide vehicle details like plate number, model, type, and capacity. This is the first step of the registration process.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AddVehicleStep1;
    