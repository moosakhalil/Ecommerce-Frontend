import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Truck, Package, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Sidebar from '../Sidebar/sidebar';

const SelectVehicle = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  useEffect(() => {
    fetchIncompleteVehicles();
  }, []);

  const fetchIncompleteVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/vehicles?status=incomplete');
      if (response.data.success) {
        setVehicles(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch vehicles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVehicle = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
  };

  const handleContinue = () => {
    if (!selectedVehicleId) {
      setError('Please select a vehicle to continue');
      return;
    }
    navigate(`/admin/vehicles/add/details/${selectedVehicleId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/vehicles/add')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Select Vehicle</h1>
                <p className="text-sm text-gray-500">Choose a vehicle to add details</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {vehicles.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No vehicles to configure</h3>
              <p className="text-gray-500 mb-6">Please add vehicle specifications first</p>
              <button
                onClick={() => navigate('/admin/vehicles/add')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Vehicle Specifications
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Select</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vehicle Type Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Weight Max</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Specifications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle, index) => (
                      <tr
                        key={vehicle._id}
                        onClick={() => handleSelectVehicle(vehicle._id)}
                        className={`cursor-pointer transition-colors ${
                          selectedVehicleId === vehicle._id
                            ? 'bg-blue-50 border-l-4 border-blue-600'
                            : index % 2 === 0
                            ? 'bg-gray-50 hover:bg-gray-100'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="radio"
                            name="selectedVehicle"
                            checked={selectedVehicleId === vehicle._id}
                            onChange={() => handleSelectVehicle(vehicle._id)}
                            className="w-5 h-5 text-blue-600 cursor-pointer"
                          />
                        </td>
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
                            <div>
                              <div>{vehicle.dimensions.heightCm}×{vehicle.dimensions.widthCm}×{vehicle.dimensions.lengthCm} cm</div>
                              <div className="text-xs text-blue-600">
                                Vol: {(vehicle.dimensions.heightCm * vehicle.dimensions.widthCm * vehicle.dimensions.lengthCm).toLocaleString()} cm³
                              </div>
                            </div>
                          ) : (
                            <span>Max {vehicle.maxPackages} packages</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={() => navigate('/admin/vehicles/add')}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-lg font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!selectedVehicleId}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Continue to Add Details
                  <ArrowRight size={20} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default SelectVehicle;
