import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../Sidebar/sidebar";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const EmployeeRoles = () => {
  const [roles, setRoles] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // All sidebar components exactly as shown in sidebar
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
      ],
    },
    {
      section: "VEHICLE MANAGEMENT",
      items: [
        { id: 11, name: "Add a new vehicle" },
        { id: 12, name: "View vehicles" },
      ],
    },
    {
      section: "VENDOR MANAGEMENT",
      items: [
        { id: 15, name: "Vendor Dashboard" },
        { id: 16, name: "Vendor outsource Dashboard" },
      ],
    },
    {
      section: "STOCK",
      items: [
        { id: 28, name: "Product list everyone ( View can only check )" },
        { id: 33, name: "Inventory check ( just controlling staff to double check and corret )" },
        { id: 35, name: "Out of Stock...order stock" },
        { id: 36, name: "Sales data for products" },
        { id: 37, name: "Lost Stock Management" },
      ],
    },
    {
      section: "STOCK 2",
      items: [
        { id: 61, name: "Create a new product (articial emp)" },
        { id: 54, name: "Fill inventory (articial emp)" },
        { id: 55, name: "Inventory control (articial emp)" },
        { id: 56, name: "Categories" },
      ],
    },
    {
      section: "DISCOUNT",
      items: [
        { id: 71, name: "Create discount (articial emp)" },
        { id: 72, name: "All Discount list, everyone )" },
        { id: 73, name: "Discounted product inventory" },
        { id: 74, name: "Discount policies action (articial emp)" },
      ],
    },
    {
      section: "SUPLIER EMP, CUSTOMER",
      items: [
        { id: 81, name: "Suppliers (articial emp)" },
        { id: 82, name: "employees (articial emp)" },
        { id: 83, name: "Customers ( articial emp )" },
      ],
    },
    {
      section: "HISTORY",
      items: [
        { id: 90, name: "History orders supplier (Admin office)" },
      ],
    },
    {
      section: "FINANCE",
      items: [
        { id: 101, name: "Finances (articial emp)" },
        { id: 105, name: "ANALYTICS" },
      ],
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
      ],
    },
    {
      section: "REFERRAL",
      items: [
        { id: 150, name: "Referrals video verification" },
        { id: 151, name: "Referrals data" },
        { id: 155, name: "Referrals foreman income" },
        { id: 159, name: "Referral demo video" },
        { id: 160, name: "Introduction videos Management" },
      ],
    },
    {
      section: "FOREMAN",
      items: [
        { id: 160, name: "from human earning structure" },
      ],
    },
    {
      section: "SETTINGS",
      items: [
        { id: "calendar", name: "Calendar" },
        { id: "vehicle-types", name: "Vehicle Types" },
      ],
    },
    {
      section: "SUPPORT",
      items: [
        { id: "support", name: "Support" },
      ],
    },
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/employee-roles`);
      setRoles(response.data.roles || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = () => {
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions([]);
    setShowAddModal(true);
  };

  const handleEditRole = (role) => {
    setCurrentRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || "");
    setSelectedPermissions(role.permissions || []);
    setShowEditModal(true);
  };

  const handlePermissionToggle = (componentId) => {
    setSelectedPermissions((prev) =>
      prev.includes(componentId)
        ? prev.filter((id) => id !== componentId)
        : [...prev, componentId]
    );
  };

  const handleSaveRole = async () => {
    try {
      if (!roleName.trim()) {
        setError("Role name is required");
        return;
      }

      setLoading(true);
      const roleData = {
        name: roleName,
        description: roleDescription,
        permissions: selectedPermissions,
      };

      if (currentRole) {
        // Update existing role
        await axios.put(
          `${API_BASE_URL}/api/employee-roles/${currentRole._id}`,
          roleData
        );
        setSuccess("Role updated successfully");
      } else {
        // Create new role
        await axios.post(`${API_BASE_URL}/api/employee-roles`, roleData);
        setSuccess("Role created successfully");
      }

      setShowAddModal(false);
      setShowEditModal(false);
      fetchRoles();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error saving role:", err);
      setError(err.response?.data?.message || "Failed to save role");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm("Are you sure you want to delete this role?")) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/api/employee-roles/${roleId}`);
      setSuccess("Role deleted successfully");
      fetchRoles();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error deleting role:", err);
      setError("Failed to delete role");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto ml-96">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Employee Roles</h1>
            <button
              onClick={handleAddRole}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Add New Role
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {/* Roles List */}
          {loading && roles.length === 0 ? (
            <div className="text-center py-8">Loading roles...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => {
                // Get permission names from IDs
                const permissionNames = allComponents
                  .flatMap((section) => section.items)
                  .filter((item) => role.permissions?.includes(item.id))
                  .map((item) => item.name);

                return (
                  <div
                    key={role._id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {role.name}
                        </h3>
                        {role.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {role.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Permissions ({role.permissions?.length || 0} pages):
                      </p>
                      {permissionNames.length > 0 ? (
                        <ul className="text-xs text-gray-600 space-y-1 max-h-40 overflow-y-auto">
                          {permissionNames.map((name, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{name}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-500 italic">
                          No permissions assigned
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditRole(role)}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role._id)}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {roles.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              No roles created yet. Click "Add New Role" to get started.
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {currentRole ? "Edit Role" : "Create New Role"}
              </h2>

              {/* Role Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Warehouse Manager, Sales Executive"
                />
              </div>

              {/* Role Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Brief description of this role's responsibilities"
                />
              </div>

              {/* Permissions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  Page Access Permissions
                </h3>
                <div className="space-y-4">
                  {allComponents.map((section, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-600 mb-3">
                        {section.section}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {section.items.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermissions.includes(item.id)}
                              onChange={() => handlePermissionToggle(item.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm">
                              {item.id}. {item.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setCurrentRole(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRole}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : currentRole ? "Update Role" : "Create Role"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeRoles;
