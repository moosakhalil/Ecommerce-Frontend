import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../Sidebar/sidebar";
import { Bell, ChevronDown, Search } from "lucide-react";
import { API_BASE_URL } from "../../utils/config";

const EmployeePermission = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("info"); // 'info' or 'permissions'
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");


  // All sidebar components organized by sections
  const allComponents = [
    {
      section: "OUR OPERATION",
      items: [
        { id: 1, name: "Orders to cart not ordered yet ( everyone )" },
        { id: 2, name: "Transaction control... paid / or not ( articial emp finance )" },
        { id: 3, name: "All Orders ( emp office ) ( everyone allows )" },
        { id: 4, name: "Order management delivery ( driver and emp on filing delivery )" },
        { id: 6, name: "Non-delivered orders or issues ( office...complain office )" },
        { id: 7, name: "Refund / complain ( office...complain office )" },
        { id: 8, name: "History orders same # 3" },
        { id: 9, name: "Delivery system" },
        { id: 10, name: "Videos Management" },
      ]
    },
    {
      section: "VEHICLE MANAGEMENT",
      items: [
        { id: 11, name: "Add a new vehicle" },
        { id: 12, name: "View vehicles" },
      ]
    },
    {
      section: "VENDOR MANAGEMENT",
      items: [
        { id: 15, name: "Vendor Dashboard" },
        { id: 16, name: "Vendor outsource Dashboard" },
      ]
    },
    {
      section: "STOCK",
      items: [
        { id: 28, name: "Product list everyone ( View can only check )" },
        { id: 33, name: "Inventory check ( just controlling staff to double check and corret )" },
        { id: 35, name: "Out of Stock...order stock" },
        { id: 36, name: "Sales data for products" },
        { id: 37, name: "Lost Stock Management" },
      ]
    },
    {
      section: "STOCK 2",
      items: [
        { id: 61, name: "Create a new product (articial emp)" },
        { id: 54, name: "Fill inventory (articial emp)" },
        { id: 55, name: "Inventory control (articial emp)" },
        { id: 56, name: "Categories" },
      ]
    },
    {
      section: "DISCOUNT",
      items: [
        { id: 71, name: "Create discount (articial emp)" },
        { id: 72, name: "All Discount list, everyone )" },
        { id: 73, name: "Discounted product inventory" },
        { id: 74, name: "Discount policies action (articial emp)" },
      ]
    },
    {
      section: "SUPPLIER EMP, CUSTOMER",
      items: [
        { id: 81, name: "Suppliers (articial emp)" },
        { id: 82, name: "Employees (articial emp)" },
        { id: 83, name: "Customers ( articial emp )" },
      ]
    },
    {
      section: "HISTORY",
      items: [
        { id: 90, name: "History orders supplier (Admin office)" },
      ]
    },
    {
      section: "FINANCE",
      items: [
        { id: 101, name: "Finances (articial emp)" },
        { id: 105, name: "ANALYTICS" },
      ]
    },
    {
      section: "LOWER ADMIN",
      items: [
        { id: 100, name: "Admin" },
        { id: 101, name: "Lower Admin" },
        { id: 102, name: "Truck Drivers" },
        { id: "admin-employee-add", name: "Employee - add" },
        { id: "admin-employee-edit", name: "Employee - edit" },
        { id: "admin-supplier-add", name: "Supplier - add" },
        { id: "admin-supplier-edit", name: "Supplier - edit" },
        { id: "admin-customer-edit", name: "Customer - edit" },
        { id: 106, name: "Products" },
        { id: 107, name: "Delivery Areas" },
        { id: 108, name: "Delivery Types" },
        { id: 109, name: "Employee Permission" },
        { id: 110, name: "Employee Roles" },
      ]
    },
    {
      section: "REFERRAL",
      items: [
        { id: 150, name: "Referrals video verification" },
        { id: 151, name: "Referrals data" },
        { id: 155, name: "Referrals foreman income" },
        { id: "159 A", name: "Referral demo video" },
        { id: "159 B", name: "Introduction videos Management" },
      ]
    },
    {
      section: "FOREMAN",
      items: [
        { id: 160, name: "from human earning structure" },
      ]
    },
    {
      section: "SETTINGS",
      items: [
        { id: "calendar", name: "Calendar" },
        { id: "vehicle-types", name: "Vehicle Types" },
      ]
    },
    {
      section: "SUPPORT",
      items: [
        { id: "support", name: "Support" },
      ]
    },
  ];

  // Fetch all employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/employees`);
      // API returns { success, employees, total, page, pages }
      setEmployees(response.data.employees || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: `${API_BASE_URL}/api/employees`
      });
      setEmployees([]);
      setLoading(false);
    }
  };

  // When employee is selected, load their permissions
  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    
    // Initialize permissions based on employee's current permissions
    const employeePermissions = {};
    allComponents.forEach(section => {
      section.items.forEach(component => {
        // Check if employee has access to this component
        employeePermissions[component.id] = employee.permissions?.includes(component.id) || false;
        
        // Check sub-items if they exist
        if (component.subItems) {
          component.subItems.forEach(subItem => {
            employeePermissions[subItem.id] = employee.permissions?.includes(subItem.id) || false;
          });
        }
      });
    });
    setPermissions(employeePermissions);
  };

  // Handle checkbox change
  const handlePermissionChange = (componentId) => {
    setPermissions(prev => ({
      ...prev,
      [componentId]: !prev[componentId]
    }));
  };

  // Save permissions
  const handleSavePermissions = async () => {
    if (!selectedEmployee) return;

    try {
      setSaving(true);
      
      // Get array of component IDs that are checked
      const permissionArray = Object.keys(permissions)
        .filter(key => permissions[key])
        .map(key => parseInt(key));

      // Update employee permissions
      await axios.put(
        `${API_BASE_URL}/api/employees/${selectedEmployee.employeeId}`,
        { permissions: permissionArray },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setSuccessMessage("Permissions updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Refresh employee list
      fetchEmployees();
      setSaving(false);
    } catch (error) {
      console.error("Error saving permissions:", error);
      setSaving(false);
      alert("Failed to save permissions. Please try again.");
    }
  };

  // Filter employees based on search
  const filteredEmployees = employees.filter(emp => 
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle image modal
  const openImageModal = (imageUrl) => {
    setModalImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setModalImageUrl("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={closeImageModal}
              className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={modalImageUrl}
              alt="Employee Photo"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main content area */}
      <div
        className={`flex-1 transition-all duration-300 overflow-auto ${
          isSidebarOpen ? "lg:ml-80" : "ml-0"
        }`}
      >
        {/* Header */}
        <div className="bg-white shadow-sm p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Employee Permission Management
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="h-6 w-6 cursor-pointer text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full h-4 w-4 flex items-center justify-center">
                  2
                </span>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-500 text-white flex items-center justify-center">
                <span className="font-bold">JM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="mx-6 mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> {successMessage}</span>
          </div>
        )}

        {/* Main content */}
        <div className="p-6">
          {/* Employee Selection Card */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Select Employee
              </h2>

              {/* Search */}
              <div className="relative mb-4">
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
              </div>

              {/* Employee Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {loading ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">Loading employees...</p>
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">No employees found</p>
                  </div>
                ) : (
                  filteredEmployees.map((employee) => (
                    <div
                      key={employee._id}
                      onClick={() => handleEmployeeSelect(employee)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedEmployee?._id === employee._id
                          ? "bg-blue-100 border-2 border-blue-500 shadow-md"
                          : "bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:shadow"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        {employee.profilePicture ? (
                          <img
                            src={`${API_BASE_URL}/${employee.profilePicture}`}
                            alt={employee.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl border-2 border-gray-300">
                            {employee.name?.charAt(0) || "E"}
                          </div>
                        )}
                        <div className="w-full">
                          <p className="font-semibold text-gray-800 text-sm truncate">
                            {employee.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {employee.employeeId}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Employee Details & Permissions */}
          {selectedEmployee ? (
            <div className="bg-white rounded-lg shadow">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("info")}
                    className={`px-6 py-4 font-semibold transition-colors relative ${
                      activeTab === "info"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Employee Information
                  </button>
                  <button
                    onClick={() => setActiveTab("permissions")}
                    className={`px-6 py-4 font-semibold transition-colors relative ${
                      activeTab === "permissions"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Page Access Permissions
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "info" ? (
                  /* Employee Information Tab */
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-6">
                      Employee Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Identification ID #
                        </label>
                        <p className="text-gray-800 font-medium text-lg">
                          {selectedEmployee.employeeId || "N/A"}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Full Name
                        </label>
                        <p className="text-gray-800 font-medium text-lg">
                          {selectedEmployee.name || "N/A"}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Employment Number
                        </label>
                        <p className="text-gray-800 font-medium text-lg">
                          {selectedEmployee.employeeId?.split("-")[1] || "N/A"}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Phone Number
                        </label>
                        <p className="text-gray-800 font-medium text-lg">
                          {selectedEmployee.phone || "N/A"}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Identification Photo
                        </label>
                        {selectedEmployee.profilePicture ? (
                          <button
                            onClick={() => openImageModal(`${API_BASE_URL}/${selectedEmployee.profilePicture}`)}
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Photo
                          </button>
                        ) : (
                          <p className="text-gray-500">No photo uploaded</p>
                        )}
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Contract PDF
                        </label>
                        {selectedEmployee.contractPdf ? (
                          <a
                            href={`${API_BASE_URL}/${selectedEmployee.contractPdf}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            View Contract
                          </a>
                        ) : (
                          <p className="text-gray-500">No contract uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Page Access Permissions Tab */
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-800">
                        Manage Page Access
                      </h3>
                      <button
                        onClick={handleSavePermissions}
                        disabled={saving}
                        className={`px-6 py-2 rounded text-white font-semibold shadow-md transition-all ${
                          saving
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                        }`}
                      >
                        {saving ? "Saving..." : "Save Permissions"}
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <strong>Instructions:</strong> Check the boxes below to grant this employee access to specific pages and components in the system.
                    </p>

                    {/* Component List with Checkboxes organized by sections */}
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                      {allComponents.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="space-y-2">
                          {/* Section Header */}
                          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-sm z-10">
                            {section.section}
                          </div>
                          
                          {/* Section Items */}
                          {section.items.map((component) => (
                            <div key={component.id}>
                              {/* Main Component */}
                              {component.subItems && component.subItems.length > 0 ? (
                                // Parent item without checkbox (just label)
                                <div className="flex items-center gap-3 p-3 bg-gray-100 rounded ml-2">
                                  <div className="w-5"></div> {/* Spacer for alignment */}
                                  <label className="flex-1 select-none font-semibold text-gray-800">
                                    <span className="font-bold text-gray-700 mr-2">
                                      {component.id}.
                                    </span>
                                    <span>
                                      {component.name}
                                    </span>
                                  </label>
                                </div>
                              ) : (
                                // Regular item with checkbox
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors ml-2">
                                  <input
                                    type="checkbox"
                                    id={`component-${component.id}`}
                                    checked={permissions[component.id] || false}
                                    onChange={() => handlePermissionChange(component.id)}
                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                  <label
                                    htmlFor={`component-${component.id}`}
                                    className="flex-1 cursor-pointer select-none"
                                  >
                                    <span className="font-medium text-gray-700 mr-2">
                                      {component.id}.
                                    </span>
                                    <span className="text-gray-800">
                                      {component.name}
                                    </span>
                                  </label>
                                </div>
                              )}
                              
                              {/* Sub-items if they exist */}
                              {component.subItems && component.subItems.length > 0 && (
                                <div className="ml-8 mt-1 space-y-1">
                                  {component.subItems.map((subItem) => (
                                    <div
                                      key={subItem.id}
                                      className="flex items-center gap-3 p-2 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                    >
                                      <input
                                        type="checkbox"
                                        id={`component-${subItem.id}`}
                                        checked={permissions[subItem.id] || false}
                                        onChange={() => handlePermissionChange(subItem.id)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                      />
                                      <label
                                        htmlFor={`component-${subItem.id}`}
                                        className="flex-1 cursor-pointer select-none text-sm"
                                      >
                                        <span className="font-medium text-blue-700 mr-2">
                                          {subItem.id}.
                                        </span>
                                        <span className="text-gray-700">
                                          {subItem.name}
                                        </span>
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-24 w-24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                No Employee Selected
              </h3>
              <p className="text-gray-500">
                Please select an employee from the grid above to view their information and manage permissions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePermission;
