import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/sidebar";
import { API_BASE_URL } from "../../utils/config";

const TaxBrackets = () => {
  const [taxBrackets, setTaxBrackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingBracket, setEditingBracket] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingBracket, setDeletingBracket] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    bracketCode: "",
    bracketName: "",
    taxPercentage: "",
    description: "",
    isActive: true
  });

  useEffect(() => {
    fetchTaxBrackets();
  }, []);

  // Auto-clear messages
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchTaxBrackets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/tax-brackets`);
      const data = await response.json();
      
      if (data.success) {
        setTaxBrackets(data.data);
      } else {
        setError(data.message || "Failed to fetch tax brackets");
      }
    } catch (err) {
      console.error("Error fetching tax brackets:", err);
      setError("Network error or server unreachable");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.bracketCode.trim() || !formData.bracketName.trim()) {
      setError("Bracket code and name are required");
      return;
    }

    const taxValue = parseFloat(formData.taxPercentage);
    if (isNaN(taxValue) || taxValue < 0 || taxValue > 100) {
      setError("Tax percentage must be between 0 and 100");
      return;
    }

    try {
      const url = editingBracket 
        ? `${API_BASE_URL}/api/tax-brackets/${editingBracket._id}`
        : `${API_BASE_URL}/api/tax-brackets`;
      
      const method = editingBracket ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          taxPercentage: parseFloat(formData.taxPercentage) || 0
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(data.message || `Tax bracket ${editingBracket ? 'updated' : 'created'} successfully`);
        fetchTaxBrackets();
        closeModal();
      } else {
        setError(data.message || "Failed to save tax bracket");
      }
    } catch (err) {
      console.error("Error saving tax bracket:", err);
      setError("Network error or server unreachable");
    }
  };

  const handleDelete = async () => {
    if (!deletingBracket) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/tax-brackets/${deletingBracket._id}`, {
        method: "DELETE"
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(data.message || "Tax bracket deleted successfully");
        fetchTaxBrackets();
        setShowDeleteModal(false);
        setDeletingBracket(null);
      } else {
        setError(data.message || "Failed to delete tax bracket");
      }
    } catch (err) {
      console.error("Error deleting tax bracket:", err);
      setError("Network error or server unreachable");
    }
  };

  const handleToggleStatus = async (bracket) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tax-brackets/${bracket._id}/toggle-status`, {
        method: "PATCH"
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(data.message);
        fetchTaxBrackets();
      } else {
        setError(data.message || "Failed to toggle status");
      }
    } catch (err) {
      console.error("Error toggling status:", err);
      setError("Network error or server unreachable");
    }
  };

  const openAddModal = () => {
    setEditingBracket(null);
    setFormData({
      bracketCode: "",
      bracketName: "",
      taxPercentage: "",
      description: "",
      isActive: true
    });
    setShowModal(true);
  };

  const openEditModal = (bracket) => {
    setEditingBracket(bracket);
    setFormData({
      bracketCode: bracket.bracketCode,
      bracketName: bracket.bracketName,
      taxPercentage: bracket.taxPercentage.toString(),
      description: bracket.description || "",
      isActive: bracket.isActive
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBracket(null);
    setFormData({
      bracketCode: "",
      bracketName: "",
      taxPercentage: "",
      description: "",
      isActive: true
    });
  };

  const openDeleteModal = (bracket) => {
    setDeletingBracket(bracket);
    setShowDeleteModal(true);
  };

  const filteredBrackets = taxBrackets.filter(bracket =>
    bracket.bracketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bracket.bracketName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden w-full transition-all duration-300 lg:ml-80">
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">💰 Tax Brackets</h1>
                <p className="text-gray-600">Manage tax rates for your products</p>
              </div>
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <span className="text-xl">+</span>
                Add New
              </button>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline"> {success}</span>
              </div>
            )}

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBrackets.length > 0 ? (
                        filteredBrackets.map((bracket) => (
                          <tr key={bracket._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-mono font-semibold text-indigo-600">
                                {bracket.bracketCode}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {bracket.bracketName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                                {bracket.taxPercentage}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                              {bracket.description || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                                bracket.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {bracket.isActive ? '✅ Active' : '❌ Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {bracket.isSystemDefault ? (
                                <span className="text-gray-400" title="System default cannot be modified">
                                  🔒
                                </span>
                              ) : (
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => openEditModal(bracket)}
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Edit"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleToggleStatus(bracket)}
                                    className="text-yellow-600 hover:text-yellow-800 transition-colors"
                                    title={bracket.isActive ? 'Deactivate' : 'Activate'}
                                  >
                                    {bracket.isActive ? '🔄' : '✅'}
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal(bracket)}
                                    className="text-red-600 hover:text-red-800 transition-colors"
                                    title="Delete"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                            {searchTerm ? "No tax brackets found matching your search" : "No tax brackets available. Click '+ Add New' to create one."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <span className="text-sm text-gray-600">
                    Total Records: {filteredBrackets.length}
                  </span>
                  <span className="text-sm text-gray-400 ml-4">
                    Note: "Unknown Tax Bracket" is a system default and cannot be edited/deleted.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingBracket ? 'Edit Tax Bracket' : 'Create Tax Bracket'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bracket Code*
                  </label>
                  <input
                    type="text"
                    name="bracketCode"
                    value={formData.bracketCode}
                    onChange={handleInputChange}
                    placeholder="e.g., STANDARD_TAX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bracket Name*
                  </label>
                  <input
                    type="text"
                    name="bracketName"
                    value={formData.bracketName}
                    onChange={handleInputChange}
                    placeholder="e.g., Standard Tax Rate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Percentage*
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      name="taxPercentage"
                      value={formData.taxPercentage}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only numbers and decimal point
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          handleInputChange(e);
                        }
                      }}
                      placeholder="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-8"
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Optional description for this tax bracket"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Active</label>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingBracket ? 'Save Changes' : 'Save Bracket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Tax Bracket</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "{deletingBracket?.bracketName}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingBracket(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxBrackets;
