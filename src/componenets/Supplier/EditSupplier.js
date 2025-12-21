import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "../Sidebar/sidebar";
import EditSupplierModal from "./EditSupplierModal";
import { API_BASE_URL } from "../../utils/config";

// Success Modal Component - Defined outside the main component
const SuccessModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg
              className="h-10 w-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
            Success!
          </h3>
          <p className="text-sm text-gray-500 mb-4">{message}</p>
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-500 text-base font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

const SuppliersList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    message: "",
  });

  // CSV Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const csvFileInputRef = useRef(null);

  // Handle CSV upload
  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['.xlsx', '.xls', '.csv'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validTypes.includes(fileExt)) {
      toast.error('Please select an Excel or CSV file (.xlsx, .xls, .csv)');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setUploadResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/suppliers/upload-excel`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        toast.success(`Successfully imported ${response.data.summary.created} suppliers!`);
        setUploadResult(response.data);
        fetchSuppliers();
      } else {
        toast.error(response.data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      if (csvFileInputRef.current) csvFileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    window.open(`${API_BASE_URL}/api/suppliers/download-template`, '_blank');
  };

  // Fetch suppliers on component mount
  useEffect(() => {
    fetchSuppliers();
  }, [currentPage, itemsPerPage]);

  // Close success modal
  const closeSuccessModal = () => {
    setSuccessModal({ isOpen: false, message: "" });
  };

  // Auto-close success modal after delay
  useEffect(() => {
    let timer;
    if (successModal.isOpen) {
      timer = setTimeout(() => {
        closeSuccessModal();
      }, 3000); // 3 seconds
    }
    return () => clearTimeout(timer);
  }, [successModal.isOpen]);

  // Fetch suppliers from API
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/suppliers`);
      const data = await response.json();

      if (response.ok) {
        setSuppliers(data.data || []);
        setTotalSuppliers(data.count || 0);
      } else {
        toast.error(data.message || "Failed to fetch suppliers");
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to fetch suppliers");
    } finally {
      setLoading(false);
    }
  };

  // Delete supplier
  const handleDeleteSupplier = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE_URL}/api/suppliers/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // Show success message
          setSuccessModal({
            isOpen: true,
            message: "Supplier deleted successfully!",
          });

          // Also show toast
          toast.success("Supplier deleted successfully");

          // Update the local state to remove the deleted supplier
          setSuppliers(suppliers.filter((supplier) => supplier._id !== id));

          // If this was the last item on the page and not the first page,
          // go to previous page
          if (paginatedSuppliers.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          } else {
            // Otherwise just refresh the suppliers list
            fetchSuppliers();
          }
        } else {
          // Try to parse error response
          try {
            const errorData = await response.json();
            toast.error(errorData.message || "Failed to delete supplier");
          } catch (e) {
            // If response isn't valid JSON
            toast.error("Failed to delete supplier: Server error");
          }
        }
      } catch (error) {
        console.error("Error deleting supplier:", error);
        toast.error(`Failed to delete supplier: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Edit supplier
  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setIsEditModalOpen(true);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter suppliers by search term
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      (supplier.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (supplier.email?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (supplier.phone || "").includes(searchTerm)
  );

  // Pagination
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Close edit modal and refresh suppliers
  const handleCloseEditModal = (shouldRefresh = false) => {
    setIsEditModalOpen(false);
    setEditingSupplier(null);
    if (shouldRefresh) {
      fetchSuppliers();
    }
  };

  // Generate an avatar based on supplier name
  const getInitialsAvatar = (name) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={closeSuccessModal}
        message={successModal.message}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-80" : "ml-0"
        }`}
      >
        <div className="p-8">
          <h1 className="text-3xl font-semibold mb-6">Suppliers</h1>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between">
            <div className="relative w-64">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            
            {/* CSV Upload Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => csvFileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>{uploading ? 'Uploading...' : 'Upload CSV'}</span>
              </button>
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Template</span>
              </button>
              <input
                type="file"
                ref={csvFileInputRef}
                onChange={handleCsvUpload}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />
            </div>
          </div>

          {/* Upload Result Display */}
          {uploadResult && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-green-800">Upload Complete</h3>
                  <p className="text-sm text-green-700">
                    Created: {uploadResult.summary.created} | Skipped: {uploadResult.summary.skipped} | Total: {uploadResult.summary.total}
                  </p>
                  {uploadResult.note && (
                    <p className="text-xs text-orange-600 mt-1">{uploadResult.note}</p>
                  )}
                  {uploadResult.summary.errors?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-red-600 font-medium">Errors:</p>
                      <ul className="text-xs text-red-500 max-h-20 overflow-y-auto">
                        {uploadResult.summary.errors.slice(0, 5).map((err, idx) => (
                          <li key={idx}>Row {err.row}: {err.message}</li>
                        ))}
                        {uploadResult.summary.errors.length > 5 && (
                          <li>...and {uploadResult.summary.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setUploadResult(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Suppliers Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    NAME
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    PHONE NUMBER
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ADDED ON
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    STATUS
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : paginatedSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">
                      No suppliers found
                    </td>
                  </tr>
                ) : (
                  paginatedSuppliers.map((supplier) => (
                    <tr key={supplier._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {supplier.profilePicture ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={`${API_BASE_URL}${supplier.profilePicture}`}
                                alt={supplier.name || "Profile"}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.parentNode.innerHTML = `
                                    <div class="h-10 w-10 rounded-full bg-cyan-200 flex items-center justify-center text-cyan-600 font-medium">
                                      ${getInitialsAvatar(supplier.name || "U")}
                                    </div>
                                  `;
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-cyan-200 flex items-center justify-center text-cyan-600 font-medium">
                                {getInitialsAvatar(supplier.name || "U")}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {supplier.name || "Unnamed"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {supplier.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {supplier.phone || "No phone"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(supplier.addedOn || supplier.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            supplier.status === "blocked"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {supplier.status === "blocked" ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditSupplier(supplier)}
                            className="text-gray-600 hover:text-indigo-500"
                            title="Edit Supplier"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteSupplier(supplier._id)}
                            className="text-gray-600 hover:text-red-500"
                            title="Delete Supplier"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {filteredSuppliers.length > 0
                        ? Math.min(startIndex + 1, filteredSuppliers.length)
                        : 0}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        startIndex + itemsPerPage,
                        filteredSuppliers.length
                      )}
                    </span>{" "}
                    of <span className="font-medium">{totalSuppliers}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="mr-3 text-sm text-gray-700">Showing</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="mr-6 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="mr-3 text-sm text-gray-700">
                      of {totalSuppliers}
                    </span>
                  </div>
                </div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                      currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {/* Page numbers */}
                  {totalPages > 0 &&
                    [...Array(Math.min(totalPages, 5))].map((_, index) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = index + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = index + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + index;
                      } else {
                        pageNumber = currentPage - 2 + index;
                      }
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNumber
                              ? "z-10 bg-orange-500 border-orange-500 text-white"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                      currentPage === totalPages || totalPages === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Supplier Modal */}
      {isEditModalOpen && editingSupplier && (
        <EditSupplierModal
          supplier={editingSupplier}
          onClose={handleCloseEditModal}
          apiBaseUrl={API_BASE_URL}
        />
      )}
    </div>
  );
};

export default SuppliersList;
