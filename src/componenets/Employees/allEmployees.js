import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, ChevronDown, Bell } from "lucide-react";
import Sidebar from "../Sidebar/sidebar";

const AllEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeType, setEmployeeType] = useState("All employees");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Available role options for filtering
  const roleOptions = [
    "All employees",
    "Add products",
    "Product List",
    "Finance",
    "Orders",
    "Customer Service",
    "truck driver",
  ];

  // Fetch employees data from the API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/employees"
        );
        setEmployees(response.data.data);
        setTotalItems(response.data.count);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setError("Failed to fetch employees. Please try again.");
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Filter employees based on search term and selected employee type
  const filteredEmployees = employees.filter((employee) => {
    // Search filter
    const matchesSearch =
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());

    // Role filter
    let matchesRole = true;
    if (employeeType !== "All employees") {
      // Convert employeeType to match the format stored in the database
      const roleToMatch = employeeType.toLowerCase().replace(/\s+/g, "-");

      matchesRole = employee.roles?.some(
        (role) =>
          role === roleToMatch ||
          role === employeeType.toLowerCase() ||
          (employeeType === "Add products" && role === "add-products") ||
          (employeeType === "truck driver" && role === "truck-driver")
      );
    }

    return matchesSearch && matchesRole;
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  // Handle page changes
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Format date to be displayed in a readable format
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleString("default", {
      month: "long",
    })}, ${date.getFullYear()}`;
  };

  // Map role IDs to display names
  const getRoleDisplayName = (roleId) => {
    const roleMap = {
      "add-products": "Add product",
      "product-list": "Product List",
      finance: "Finance",
      orders: "Orders",
      "customer-service": "Customer Service",
      "truck-driver": "truck driver",
    };

    return roleMap[roleId] || roleId;
  };

  // Get badge color based on role
  const getRoleBadgeColor = (role) => {
    const colorMap = {
      "add-products": "bg-blue-600 text-white",
      "product-list": "bg-pink-500 text-white",
      finance: "bg-green-600 text-white",
      orders: "bg-indigo-500 text-white",
      "customer-service": "bg-purple-500 text-white",
      "truck-driver": "bg-amber-500 text-white",
      categories: "bg-pink-500 text-white",
    };

    return colorMap[role] || "bg-gray-500 text-white";
  };

  // Handle search input change with immediate filtering
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle employee type filter change
  const handleEmployeeTypeChange = (e) => {
    setEmployeeType(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main content area with proper margin */}
      <div
        className={`flex-1 transition-all duration-300 overflow-auto ${
          isSidebarOpen ? "lg:ml-80" : "ml-0"
        }`}
      >
        {/* Main content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold  text-purple-800">
                All employees
              </h1>
              <div className="flex items-center gap-4"></div>
            </div>

            {/* Search and filter */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                </div>
                <div className="md:w-64">
                  <label className="block text-sm text-gray-500 mb-1">
                    sort by employee type
                  </label>
                  <div className="relative">
                    <select
                      className="appearance-none w-full pl-4 pr-10 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={employeeType}
                      onChange={handleEmployeeTypeChange}
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 text-gray-400 h-5 w-5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Employees Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-3 pl-2 pr-4">ID</th>
                      <th className="pb-3 px-4">NAME</th>
                      <th className="pb-3 px-4">Date Added</th>
                      <th className="pb-3 px-4"> Employee Category</th>{" "}
                      {/* New Column */}
                      <th className="pb-3 px-4">Permissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="py-4 text-center">
                          Loading employees...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-4 text-center text-red-500"
                        >
                          {error}
                        </td>
                      </tr>
                    ) : currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-4 text-center">
                          No employees found
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((employee, index) => (
                        <tr
                          key={employee._id || index}
                          className="border-b hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="py-4 pl-2 pr-4 text-gray-800">
                            #{employee.employeeId?.split("-")[1] || "5089"}
                          </td>
                          <td className="py-4 px-4 text-gray-800">
                            {employee.name || "Joseph Wheeler"}
                          </td>
                          <td className="py-4 px-4 text-gray-800">
                            {formatDate(employee.updatedAt) || "6 April, 2023"}
                          </td>
                          <td className="py-4 px-4 text-gray-800">
                            {employee.employeeCategory || "Not specified"}{" "}
                            {/* Display Employee Category */}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-2">
                              {employee.roles && employee.roles.length > 0 ? (
                                employee.roles.map((role, index) => (
                                  <span
                                    key={index}
                                    className={`px-2 py-1 rounded text-xs ${getRoleBadgeColor(
                                      role
                                    )}`}
                                  >
                                    {getRoleDisplayName(role)}
                                  </span>
                                ))
                              ) : (
                                // Default roles for demonstration if no roles are defined
                                <>
                                  <span className="px-2 py-1 rounded text-xs bg-blue-600 text-white">
                                    Add product
                                  </span>
                                  <span className="px-2 py-1 rounded text-xs bg-pink-500 text-white">
                                    Categories
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col md:flex-row justify-between items-center mt-4">
                <div className="flex items-center mb-4 md:mb-0">
                  <span className="text-sm text-gray-500 mr-2">Showing</span>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                  <span className="text-sm text-gray-500 ml-2">
                    of {filteredEmployees.length}
                  </span>
                </div>

                <div className="flex">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  >
                    &lt;
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }).map(
                    (_, i) => {
                      // Calculate page numbers to show
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`px-3 py-1 mx-1 rounded ${
                            currentPage === pageNum
                              ? "bg-amber-500 text-white"
                              : "border text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AllEmployees;
