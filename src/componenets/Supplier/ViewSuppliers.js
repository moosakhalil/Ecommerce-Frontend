import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Sidebar from "../Sidebar/sidebar";
import { API_BASE_URL } from "../../utils/config";

const SupplierViewOnly = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch suppliers on component mount
  useEffect(() => {
    fetchSuppliers();
  }, [currentPage, itemsPerPage]);

  // Fetch suppliers from API
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/suppliers`
      );
      const data = await response.json();

      if (response.ok) {
        setSuppliers(data.data);
        setTotalSuppliers(data.count);
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

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter suppliers by search term
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone.includes(searchTerm)
  );

  // Pagination
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Open modal with supplier details
  const handleViewDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSupplier(null);
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
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

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center">
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
          </div>

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
                    ACTIONS
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
                                alt={supplier.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-cyan-200 flex items-center justify-center text-cyan-600 font-medium">
                                {supplier.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {supplier.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {supplier.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {supplier.phone}
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
                        <button
                          onClick={() => handleViewDetails(supplier)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
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
                      {Math.min(startIndex + 1, filteredSuppliers.length)}
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
                  {[...Array(Math.min(totalPages, 5))].map((_, index) => {
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
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                      currentPage === totalPages
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

      {/* Supplier Details Modal */}
      {isModalOpen && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 p-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
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

            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Supplier Details
            </h2>

            {/* Profile Section */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                {selectedSupplier.profilePicture ? (
                  <img
                    src={`${API_BASE_URL}${selectedSupplier.profilePicture}`}
                    alt={selectedSupplier.name}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-cyan-200 flex items-center justify-center text-cyan-600 font-bold text-3xl">
                    {selectedSupplier.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedSupplier.name}
                  </h3>
                  <p className="text-gray-600">{selectedSupplier.email}</p>
                  <span
                    className={`mt-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedSupplier.status === "blocked"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {selectedSupplier.status === "blocked" ? "Blocked" : "Active"}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Phone Number
                </label>
                <p className="text-gray-900">{selectedSupplier.phone}</p>
              </div>
              {selectedSupplier.secondPhone && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Second Phone Number
                  </label>
                  <p className="text-gray-900">{selectedSupplier.secondPhone}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Address
                </label>
                <p className="text-gray-900">{selectedSupplier.address || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  City
                </label>
                <p className="text-gray-900">{selectedSupplier.city || "N/A"}</p>
              </div>
            </div>

            {/* Identification Documents */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                Identification Documents
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedSupplier.idCardFront && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      ID Card Front
                    </label>
                    <img
                      src={`${API_BASE_URL}${selectedSupplier.idCardFront}`}
                      alt="ID Front"
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
                {selectedSupplier.idCardBack && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      ID Card Back
                    </label>
                    <img
                      src={`${API_BASE_URL}${selectedSupplier.idCardBack}`}
                      alt="ID Back"
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
                {selectedSupplier.passportFront && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Passport Front
                    </label>
                    <img
                      src={`${API_BASE_URL}${selectedSupplier.passportFront}`}
                      alt="Passport Front"
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
                {selectedSupplier.passportBack && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Passport Back
                    </label>
                    <img
                      src={`${API_BASE_URL}${selectedSupplier.passportBack}`}
                      alt="Passport Back"
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Other Documents */}
            {selectedSupplier.otherDocs && selectedSupplier.otherDocs.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  Other Documents
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedSupplier.otherDocs.map((doc, index) => (
                    <div key={index}>
                      <label className="block text-xs text-gray-500 mb-1">
                        Document {index + 1}
                      </label>
                      {doc.endsWith('.pdf') ? (
                        <a
                          href={`${API_BASE_URL}${doc}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full h-32 flex flex-col items-center justify-center bg-gray-100 rounded border hover:bg-gray-200"
                        >
                          <svg
                            className="h-12 w-12 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-xs text-gray-600 mt-1">PDF</span>
                        </a>
                      ) : (
                        <img
                          src={`${API_BASE_URL}${doc}`}
                          alt={`Doc ${index + 1}`}
                          className="w-full h-32 object-cover rounded border"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related People */}
            {selectedSupplier.relatedPeople && selectedSupplier.relatedPeople.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  Related People to the Company
                </h4>
                <div className="space-y-4">
                  {selectedSupplier.relatedPeople.map((person, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg border"
                    >
                      <div className="md:col-span-2 space-y-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Name
                          </label>
                          <p className="text-gray-900 font-medium">{person.name}</p>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Title
                          </label>
                          <p className="text-gray-900">{person.title}</p>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Phone Number
                          </label>
                          <p className="text-gray-900">{person.phone}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Profile Picture
                        </label>
                        {person.profilePicture ? (
                          <img
                            src={`${API_BASE_URL}${person.profilePicture}`}
                            alt={person.name}
                            className="w-full h-40 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-full h-40 bg-gray-200 rounded border flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Added On
                </label>
                <p className="text-gray-900">
                  {formatDate(selectedSupplier.addedOn || selectedSupplier.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierViewOnly;
