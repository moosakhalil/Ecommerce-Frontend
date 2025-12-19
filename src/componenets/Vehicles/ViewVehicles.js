import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Truck, Package, Edit, Trash2, Search, Filter, Plus, Eye, AlertCircle } from 'lucide-react';
import Sidebar from '../Sidebar/sidebar';
import { API_BASE_URL } from '../../utils/config';

const ViewVehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vehicles, searchTerm, filterType, filterStatus]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/vehicles`);
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

  const applyFilters = () => {
    let filtered = vehicles;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.numberPlate.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.vehicleType === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === filterStatus);
    }

    setFilteredVehicles(filtered);
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/vehicles/${vehicleToDelete._id}`);
      if (response.data.success) {
        fetchVehicles();
        setShowDeleteModal(false);
        setVehicleToDelete(null);
      }
    } catch (err) {
      setError('Failed to delete vehicle');
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getVehicleIcon = (type) => {
    return type === 'truck' ? <Truck className="text-blue-600" size={24} /> : <Package className="text-green-600" size={24} />;
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
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 ml-80 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Vehicle Management</h1>
            <button
              onClick={() => navigate('/admin/vehicles/add')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add New Vehicle
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or number plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Types</option>
                <option value="truck">Truck</option>
                <option value="scooter">Scooter</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredVehicles.length} of {vehicles.length} vehicles
          </div>
        </div>

        {/* Vehicles Grid */}
        {filteredVehicles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Truck className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No vehicles found</h3>
            <p className="text-gray-500 mb-6">Add your first vehicle to get started</p>
            <button
              onClick={() => navigate('/admin/vehicles/add')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Vehicle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Vehicle Type Name */}
                  {(vehicle.truckTypeName || vehicle.scooterTypeName) && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-500 mb-1">Vehicle Type Name</p>
                      <p className="font-semibold text-lg text-blue-600">{vehicle.truckTypeName || vehicle.scooterTypeName}</p>
                    </div>
                  )}
                  
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getVehicleIcon(vehicle.vehicleType)}
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">{vehicle.name}</h3>
                        <p className="text-sm text-gray-500">{vehicle.numberPlate}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{vehicle.vehicleType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Weight Max:</span>
                      <span className="font-medium">{vehicle.weightMaxKg} kg</span>
                    </div>
                    {vehicle.weightMaxKg && vehicle.loadLimitPercent && (
                      <div className="flex justify-between text-sm bg-green-50 -mx-4 px-4 py-1">
                        <span className="text-gray-600 font-medium">Recommended Weight:</span>
                        <span className="font-bold text-green-600">{Math.round((vehicle.weightMaxKg * vehicle.loadLimitPercent) / 100)} kg</span>
                      </div>
                    )}
                    {vehicle.maxPackageLength && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Max Pkg Length:</span>
                        <span className="font-medium">{vehicle.maxPackageLength} cm</span>
                      </div>
                    )}
                    {vehicle.vehicleType === 'truck' && vehicle.dimensions && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Dimensions:</span>
                          <span className="font-medium">
                            {vehicle.dimensions.heightCm}×{vehicle.dimensions.widthCm}×{vehicle.dimensions.lengthCm} cm
                          </span>
                        </div>
                        {vehicle.totalDimensionsCubicCm && (
                          <div className="flex flex-col text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Volume:</span>
                              <span className="font-medium text-blue-600">
                                {vehicle.totalDimensionsCubicCm.toLocaleString()} cm³
                              </span>
                            </div>
                            <div className="flex justify-end text-base font-bold text-blue-700 mt-1">
                              ({(vehicle.totalDimensionsCubicCm / 1000000).toFixed(2)} m³)
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {vehicle.vehicleType === 'scooter' && vehicle.maxPackages && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Max Packages:</span>
                          <span className="font-medium">{vehicle.maxPackages}</span>
                        </div>
                        <div className="flex justify-between text-sm bg-purple-50 -mx-4 px-4 py-1">
                          <span className="text-gray-600 font-medium">Recommended Max Packages:</span>
                          <span className="font-bold text-purple-600">
                            {Math.round((vehicle.maxPackages * (vehicle.packageLimitPercent || 80)) / 100)}
                          </span>
                        </div>
                      </>
                    )}
                    {vehicle.fuelType && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fuel:</span>
                        <span className="font-medium">{vehicle.fuelType}</span>
                      </div>
                    )}
                    {vehicle.yearModel && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Year:</span>
                        <span className="font-medium">{vehicle.yearModel}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => navigate(`/admin/vehicles/view/${vehicle._id}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye size={16} />
                      <span className="text-sm font-medium">View</span>
                    </button>
                    <button
                      onClick={() => navigate(`/admin/vehicles/edit/${vehicle._id}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Edit size={16} />
                      <span className="text-sm font-medium">Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setVehicleToDelete(vehicle);
                        setShowDeleteModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} />
                      <span className="text-sm font-medium">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{vehicleToDelete?.name}</span>?
              This action will mark the vehicle as inactive.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setVehicleToDelete(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    
  );
};

export default ViewVehicles;
